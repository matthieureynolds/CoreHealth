import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import OpenAI, { toFile } from 'openai';
import { getDb } from '../_shared/db';
import { ok, err, forbidden, parseBody } from '../_shared/response';
import { encrypt, decrypt } from '../_shared/crypto';
import { TOTO_TOOLS } from './tools';
import { executeToolCall } from './executor';
import { selectContextSections } from './context';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;

const secretsManager = new SecretsManagerClient({});
let openai: OpenAI | null = null;

async function getOpenAI(): Promise<OpenAI> {
  if (openai) return openai;
  const result = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: process.env.OPENAI_SECRET_ARN! }),
  );
  openai = new OpenAI({ apiKey: result.SecretString! });
  return openai;
}


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
  const db = await getDb();
  const method = event.httpMethod;
  const cognitoSub = event.requestContext.authorizer?.claims?.sub;
  if (!cognitoSub) return forbidden();

  const path = event.path;

  // GET /ai/imaging-results
  if (method === 'GET' && path.endsWith('/imaging-results')) {
    const result = await db.query(
      `SELECT id, modality, body_part, study_date, facility, radiologist,
              findings, impression, measurements, notes, created_at
       FROM imaging_results WHERE user_id = $1 ORDER BY study_date DESC`,
      [cognitoSub],
    );
    return ok(result.rows);
  }

  // GET /ai/history
  if (method === 'GET' && path.endsWith('/history')) {
    const result = await db.query(
      `SELECT role, content, created_at
       FROM chat_messages WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [cognitoSub],
    );
    return ok(result.rows.reverse());
  }

  // POST /ai/chat
  if (method === 'POST' && path.endsWith('/chat')) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { fileBase64, fileName } = body;
    let { message } = body;

    // If a PDF file was attached, extract its text and prepend it to the message
    let extractedPdfText: string | null = null;
    if (fileBase64 && fileName?.toLowerCase().endsWith('.pdf')) {
      // ~20MB base64 ≈ ~15MB decoded — reject before allocating the buffer
      if (fileBase64.length > 20_000_000) return err(400, 'File too large (max ~15 MB)');
      try {
        const pdfBuffer = Buffer.from(fileBase64, 'base64');
        const parsed = await pdfParse(pdfBuffer);
        extractedPdfText = parsed.text?.slice(0, 12000) ?? null;
      } catch (e) {
        console.warn('pdf-parse failed:', e);
      }
    }

    // Validate the user's typed message before injecting PDF text.
    // The length check must run on the raw user input — not the combined PDF+message
    // blob which can be up to 12 000 chars and would always fail the check.
    if (!message && !extractedPdfText) return err(400, 'message is required');
    if (message && message.length > 4000) return err(400, 'message too long (max 4000 characters)');

    // Build effective message — inject PDF text as context
    if (extractedPdfText) {
      const userNote = message?.trim() ? `\n\nUser note: ${message.trim()}` : '';
      message = `[PDF LAB REPORT ATTACHED — filename: ${fileName}]\n\n${extractedPdfText}${userNote}`;
    }

    // Rate limits — guards against runaway costs (GPT-4o is expensive)
    // Both checks use the existing chat_messages table; idx_chat_user_time makes this fast.
    const DAILY_LIMIT = 50;
    const PER_MINUTE_LIMIT = 5;
    const [dailyRow, minuteRow] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS cnt FROM chat_messages
         WHERE user_id = $1 AND role = 'user' AND created_at > NOW() - INTERVAL '1 day'`,
        [cognitoSub],
      ),
      db.query(
        `SELECT COUNT(*) AS cnt FROM chat_messages
         WHERE user_id = $1 AND role = 'user' AND created_at > NOW() - INTERVAL '1 minute'`,
        [cognitoSub],
      ),
    ]);
    if (parseInt(minuteRow.rows[0].cnt, 10) >= PER_MINUTE_LIMIT) {
      return err(429, `Too many requests — max ${PER_MINUTE_LIMIT} messages per minute.`);
    }
    if (parseInt(dailyRow.rows[0].cnt, 10) >= DAILY_LIMIT) {
      return err(429, `Daily limit of ${DAILY_LIMIT} messages reached. Try again tomorrow.`);
    }

    // Fetch everything in parallel
    const [
      userRow, biomarkerHistoryRow, recentLabsRow, allergiesRow,
      medicationsRow, conditionsRow, vaccinationsRow, appointmentsRow,
      deviceDataRow, deviceTokensRow, symptomsRow, hereditaryRow, historyResult,
      tripsRow, imagingRow,
    ] = await Promise.all([
      db.query(
        `SELECT first_name, date_of_birth, gender, height_cm, weight_kg,
                health_memory, user_settings, profile_data,
                joined_leagues, location_health
         FROM users WHERE id = $1`,
        [cognitoSub],
      ),
      // Last 5 readings per biomarker for trend intelligence
      db.query(
        `SELECT id, name, value, unit, category, risk_level, reference_min, reference_max, recorded_at
         FROM biomarkers
         WHERE user_id = $1
         ORDER BY name, recorded_at DESC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT file_name, lab_name, report_date, biomarker_count
         FROM lab_results WHERE user_id = $1 AND processing_status = 'complete'
         ORDER BY report_date DESC LIMIT 5`,
        [cognitoSub],
      ),
      db.query(
        `SELECT id, name, severity, reaction FROM allergies WHERE user_id = $1 AND status = 'active'
         ORDER BY severity DESC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT id, name, dosage, frequency FROM medications WHERE user_id = $1
         ORDER BY created_at DESC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT id, name, severity, status, diagnosed_date FROM medical_conditions WHERE user_id = $1
         ORDER BY severity DESC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT id, name, date, next_due FROM vaccinations WHERE user_id = $1 ORDER BY date DESC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT id, title, subtitle, event_date, doctor, location, notes FROM appointments
         WHERE user_id = $1 ORDER BY event_date DESC LIMIT 20`,
        [cognitoSub],
      ),
      // Latest reading per device
      db.query(
        `SELECT DISTINCT ON (device_type) device_type, device_name, metrics, timestamp
         FROM device_data WHERE user_id = $1
         ORDER BY device_type, timestamp DESC`,
        [cognitoSub],
      ),
      // Which devices are connected + last sync time
      db.query(
        `SELECT device_type, updated_at as last_synced FROM device_tokens WHERE user_id = $1`,
        [cognitoSub],
      ),
      // Recent symptoms (last 30 days, capped at 10 for token budget)
      db.query(
        `SELECT id, type, category, severity, duration, location, notes, factors, logged_at
         FROM symptoms WHERE user_id = $1 AND logged_at > NOW() - INTERVAL '30 days'
         ORDER BY logged_at DESC LIMIT 10`,
        [cognitoSub],
      ),
      // Family hereditary signals received — read encrypted payload, decrypt after
      db.query(
        `SELECT hs.condition_payload, hs.onset_age_band, hs.severity_band, u.first_name, u.surname
         FROM hereditary_signals hs
         JOIN users u ON u.id = hs.issuer_id
         WHERE hs.recipient_id = $1 AND hs.status = 'active'`,
        [cognitoSub],
      ),
      db.query(
        `SELECT role, content FROM chat_messages WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 20`,
        [cognitoSub],
      ),
      db.query(
        `SELECT id, departure_location, destination, departure_date, return_date, timezone, notes
         FROM trips WHERE user_id = $1 ORDER BY departure_date ASC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT id, modality, body_part, study_date, findings, impression, measurements
         FROM imaging_results WHERE user_id = $1 ORDER BY study_date DESC LIMIT 10`,
        [cognitoSub],
      ),
    ]);

    const user = userRow.rows[0];

    // Decrypt health_memory — stored encrypted at rest.
    // Falls back to raw value for any legacy plaintext rows (safe migration path).
    if (user?.health_memory) {
      const decrypted = await decrypt(user.health_memory);
      user.health_memory = decrypted ?? user.health_memory;
    }

    const allBiomarkerRows = biomarkerHistoryRow.rows;
    const recentLabs = recentLabsRow.rows;
    const activeAllergies = allergiesRow.rows;
    const medications = medicationsRow.rows;
    const conditions = conditionsRow.rows;
    const vaccinations = vaccinationsRow.rows;
    const appointments = appointmentsRow.rows;
    const deviceData = deviceDataRow.rows;
    const connectedDevices = deviceTokensRow.rows;
    const recentSymptoms = symptomsRow.rows;
    // Decrypt hereditary signals — condition_payload is AES-256-GCM encrypted
    const familySignals = await Promise.all(
      hereditaryRow.rows.map(async (row: any) => ({
        ...row,
        condition_code: await decrypt(row.condition_payload),
        condition_payload: undefined,
      })),
    );
    const history = historyResult.rows.reverse();
    const trips = tripsRow.rows;
    const imagingResults = imagingRow.rows;
    const pd = user?.profile_data ?? {};
    const joinedLeagues = user?.joined_leagues ?? {};
    const locationHealth = user?.location_health ?? null;

    // Group biomarker rows by name, keep last 3 readings each (token budget)
    const biomarkerMap = new Map<string, any[]>();
    for (const row of allBiomarkerRows) {
      if (!biomarkerMap.has(row.name)) biomarkerMap.set(row.name, []);
      const arr = biomarkerMap.get(row.name)!;
      if (arr.length < 3) arr.push(row);
    }

    // C2: only send context sections relevant to this query (data minimisation — GDPR Art. 5(1)(c))
    const contextSections = selectContextSections(message);
    const systemPrompt = buildSystemPrompt(
      user, pd, biomarkerMap, recentLabs, activeAllergies,
      medications, conditions, vaccinations, appointments,
      deviceData, connectedDevices, recentSymptoms, familySignals,
      trips, joinedLeagues, locationHealth, imagingResults,
      contextSections,
    );

    const client = await getOpenAI();

    // If a PDF was attached, prepend a system-level instruction to guide extraction
    const pdfInstruction = extractedPdfText
      ? `\n\nMEDICAL DOCUMENT INSTRUCTIONS: The user has uploaded a medical document (lab report, discharge summary, clinic letter, prescription, vaccination record, or similar). ` +
        `Read the entire document and automatically save EVERYTHING you find using the appropriate tools — NO confirmation needed for any of these:\n` +
        `- Biomarker / test result values → add_biomarker (one call per value)\n` +
        `- Diagnoses or conditions mentioned → create_condition\n` +
        `- Medications prescribed or listed → create_medication\n` +
        `- Vaccinations recorded → create_vaccination\n` +
        `- Allergies documented → create_allergy\n` +
        `- Appointments or follow-ups mentioned → create_appointment\n` +
        `- Imaging / radiology reports (X-ray, MRI, CT, ultrasound, ECG, DEXA, echo, etc.) → add_imaging_result (capture findings, impression, measurements, modality, body part, date)\n` +
        `Do NOT ask for confirmation before saving any of the above — medical document uploads are fully pre-approved. ` +
        `After saving everything, give a clear human summary: what was found, what was saved, which values (if any) are outside normal range, and what that means for this user specifically.`
      : '';

    const baseMessages: any[] = [
      { role: 'system', content: systemPrompt + pdfInstruction },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // PDF uploads need more tokens: many tool calls + a thorough summary
    const maxTokens = extractedPdfText ? 4000 : 1500;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: baseMessages,
      max_tokens: maxTokens,
      temperature: 0.3,
      tools: TOTO_TOOLS,
      tool_choice: 'auto',
    });

    let reply = '';
    let biomarkersAdded = 0;
    let recordsAdded = 0;

    // Agentic loop: keep executing tool calls until GPT returns plain text
    // Cap at 6 iterations to prevent runaway loops (each round = 1 tool batch)
    const loopMessages: any[] = [...baseMessages];
    let currentCompletion = completion;
    const MAX_TOOL_ROUNDS = 6;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const assistantMessage = currentCompletion.choices[0].message;

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        // No more tool calls — this is the final text reply
        reply = assistantMessage.content ?? '';
        break;
      }

      // Execute all tool calls in this round in parallel — independent writes per tool
      loopMessages.push(assistantMessage);
      const toolResults: any[] = await Promise.all(
        assistantMessage.tool_calls.map(async (call: any) => {
          const fn = call.function as { name: string; arguments: string };
          let result: string;
          let success = false;
          try {
            const args = JSON.parse(fn.arguments);
            result = await executeToolCall(fn.name, args, db, cognitoSub);
            if (fn.name === 'add_biomarker') biomarkersAdded++;
            recordsAdded++;
            success = true;
          } catch (e) {
            result = `Error executing ${fn.name}: ${e}`;
          }
          // H10: structured audit log for every AI write action (CloudWatch)
          console.log(JSON.stringify({
            event: 'AI_TOOL_CALL',
            userId: cognitoSub,
            tool: fn.name,
            success,
            requestId: event.requestContext.requestId,
            ts: new Date().toISOString(),
          }));
          return { role: 'tool', tool_call_id: call.id, content: result };
        }),
      );
      loopMessages.push(...toolResults);

      // Call GPT again with tool results — it may return more tool calls or a final reply
      currentCompletion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: loopMessages,
        max_tokens: maxTokens,
        temperature: 0.3,
        tools: TOTO_TOOLS,
        tool_choice: 'auto',
      });
    }

    // If we exhausted MAX_TOOL_ROUNDS without a text reply, take whatever content exists
    if (!reply) {
      reply = currentCompletion.choices[0]?.message?.content ?? 'Done — all records have been saved.';
    }

    // For PDF uploads, store a user-readable summary rather than the raw blob
    const persistedUserContent = extractedPdfText
      ? `[Blood test PDF uploaded: ${fileName}]${body.message?.trim() ? ` — ${body.message.trim()}` : ''}`
      : message;

    // Persist both turns — must complete before responding
    await db.query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
      [cognitoSub, persistedUserContent, reply],
    );

    // Fire-and-forget: health memory update
    updateHealthMemory(client, db, cognitoSub, user?.health_memory ?? null, persistedUserContent, reply);

    return ok({ reply, biomarkersAdded, recordsAdded });
  }

  // POST /ai/insights — server-side daily insights generation (keeps OpenAI key off client)
  if (method === 'POST' && path.endsWith('/insights')) {
    const [userRow, biomarkersRow, deviceRow, memoryRow] = await Promise.all([
      db.query(
        `SELECT first_name, date_of_birth, gender, height_cm, weight_kg, health_memory
         FROM users WHERE id = $1`,
        [cognitoSub],
      ),
      db.query(
        `SELECT DISTINCT ON (name) name, value, unit, category, risk_level, recorded_at
         FROM biomarkers WHERE user_id = $1
         ORDER BY name, recorded_at DESC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT DISTINCT ON (device_type) device_type, metrics, timestamp
         FROM device_data WHERE user_id = $1
         ORDER BY device_type, timestamp DESC`,
        [cognitoSub],
      ),
      db.query(
        `SELECT health_memory FROM users WHERE id = $1`,
        [cognitoSub],
      ),
    ]);

    const user = userRow.rows[0];
    const biomarkers = biomarkersRow.rows;
    const devices = deviceRow.rows;
    const memory: string | null = memoryRow.rows[0]?.health_memory ?? null;

    const biomarkerSummary = biomarkers.length > 0
      ? biomarkers.map((b: any) =>
          `${b.name}: ${b.value} ${b.unit} (${b.risk_level ?? 'unknown'} risk, recorded ${b.recorded_at?.toISOString?.()?.slice(0, 10) ?? 'unknown'})`
        ).join('\n')
      : 'No biomarker data available yet.';

    const deviceSummary = devices.length > 0
      ? devices.map((d: any) => {
          const m = d.metrics ?? {};
          const parts = [];
          if (m.restingHeartRate) parts.push(`RHR ${m.restingHeartRate} bpm`);
          if (m.hrv) parts.push(`HRV ${m.hrv} ms`);
          if (m.sleepHours) parts.push(`Sleep ${m.sleepHours}h`);
          if (m.vo2Max) parts.push(`VO2max ${m.vo2Max} ml/kg/min`);
          return `${d.device_type}: ${parts.join(', ') || 'metrics available'}`;
        }).join('\n')
      : 'No wearable data available.';

    const memorySummary = memory ? `\n\nPersistent health memory:\n${memory.slice(0, 1500)}` : '';

    const systemPrompt = `You are CoreHealth's AI health analyst. Generate personalised daily health insights for this user.
Return exactly 4 insights as a JSON array. Each insight must be a JSON object with these fields:
- id: string (unique, e.g. "insight-1")
- title: string (short, max 6 words)
- description: string (1-2 sentences, specific to this user's data)
- category: "recovery" | "nutrition" | "activity" | "stress" | "biomarkers"
- priority: "high" | "medium" | "low"
- actionable: boolean
- action: string | null (specific next step if actionable)

Base insights on their actual biomarker values and trends. Be specific — mention actual numbers.
If data is limited, say so honestly rather than inventing specifics.
Return only valid JSON, no markdown.`;

    const userContent = `User: ${user?.first_name ?? 'Unknown'}, Age: ${user?.date_of_birth ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / 31_557_600_000) : 'unknown'}, Gender: ${user?.gender ?? 'unknown'}

Biomarkers:
${biomarkerSummary}

Wearable data:
${deviceSummary}${memorySummary}`;

    const client = await getOpenAI();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    let insights: any[] = [];
    try {
      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      // Accept either { insights: [...] } or a top-level array
      insights = Array.isArray(parsed) ? parsed : (parsed.insights ?? []);
    } catch {
      insights = [];
    }

    return ok({ insights });
  }

  // POST /ai/transcribe
  if (method === 'POST' && path.endsWith('/transcribe')) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { audio, mimeType } = body;
    if (!audio) return err(400, 'audio (base64) is required');

    try {
      const client = await getOpenAI();
      const buffer = Buffer.from(audio, 'base64');
      console.log(`Transcribe: ${buffer.length} bytes, mime=${mimeType || 'audio/m4a'}`);
      const file = await toFile(buffer, 'audio.m4a', { type: mimeType || 'audio/m4a' });
      const result = await client.audio.transcriptions.create({ file, model: 'whisper-1' });
      return ok({ transcript: result.text });
    } catch (txErr: any) {
      console.error('Transcription failed:', txErr);
      return err(500, txErr?.message ?? 'Transcription failed');
    }
  }

  // POST /ai/analyze-image
  if (method === 'POST' && path.endsWith('/analyze-image')) {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { image, mimeType, prompt } = body;
    if (!image) return err(400, 'image (base64) is required');
    // ~13MB base64 ≈ ~10MB decoded — keeps Lambda memory safe and within OpenAI limits
    if (image.length > 13_000_000) return err(400, 'Image too large (max ~10 MB)');
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const resolvedMimeType = mimeType || 'image/jpeg';
    if (!ALLOWED_IMAGE_TYPES.includes(resolvedMimeType)) {
      return err(400, `mimeType must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    const client = await getOpenAI();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable health researcher who can analyze images and provide health insights.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Please analyze this image and provide any relevant health insights.' },
            { type: 'image_url', image_url: { url: `data:${resolvedMimeType};base64,${image}` } },
          ],
        },
      ],
      max_tokens: 800,
    });
    const analysis = completion.choices[0]?.message?.content ?? '';
    return ok({ analysis });
  }

  return err(405, 'Method not allowed');
  } catch (e: any) {
    console.error('Unhandled Lambda error:', e);
    return err(500, e?.message ?? 'Internal server error');
  }
};

/**
 * After every exchange, run a second GPT call to update the user's persistent health memory.
 * This is the Torch layer — eliminates recency bias by maintaining a running understanding
 * of who this person is, their trends, key findings, and what's been discussed.
 */
async function updateHealthMemory(
  client: OpenAI,
  db: any,
  userId: string,
  existingMemory: string | null,
  userMessage: string,
  assistantReply: string,
): Promise<void> {
  try {
    const memoryPrompt = existingMemory
      ? `You are maintaining a persistent health memory for a CoreHealth user. This memory is injected into every future conversation so the AI always knows who this person is — eliminating recency bias.

EXISTING MEMORY:
${existingMemory}

NEW CONVERSATION:
User: ${userMessage}
Assistant: ${assistantReply}

Update the memory to incorporate anything medically significant from this exchange. Preserve all existing facts unless contradicted. Add new findings, trends mentioned, recommendations made, user concerns expressed, and any follow-up outcomes. Be concise but complete. Write in third person. Maximum 600 words.`
      : `You are creating a persistent health memory for a new CoreHealth user. This memory will be injected into every future conversation.

FIRST CONVERSATION:
User: ${userMessage}
Assistant: ${assistantReply}

Extract and record any medically significant facts: health concerns raised, symptoms mentioned, lifestyle factors, goals, preferences, and anything the AI noted. Write in third person. Maximum 600 words.`;

    const memoryCompletion = await client.chat.completions.create({
      model: 'gpt-4o-mini', // cheaper for background memory update
      messages: [{ role: 'user', content: memoryPrompt }],
      max_tokens: 700,
      temperature: 0.3,
    });

    const updatedMemory = memoryCompletion.choices[0]?.message?.content ?? '';
    if (updatedMemory) {
      const encryptedMemory = await encrypt(updatedMemory);
      await db.query(
        `UPDATE users SET health_memory = $1 WHERE id = $2`,
        [encryptedMemory, userId],
      );
    }
  } catch (e) {
    // Non-critical — don't fail the chat response if memory update fails
    console.error('Health memory update failed:', e);
  }
}

// Static country health rankings (same as frontend leaderboardData.ts)
const COUNTRIES = [
  { name: 'Japan', code: 'JP', score: 84.4, rank: 1 }, { name: 'Switzerland', code: 'CH', score: 83.7, rank: 2 },
  { name: 'Singapore', code: 'SG', score: 83.5, rank: 3 }, { name: 'Spain', code: 'ES', score: 83.5, rank: 4 },
  { name: 'South Korea', code: 'KR', score: 83.2, rank: 5 }, { name: 'Italy', code: 'IT', score: 83.2, rank: 6 },
  { name: 'Sweden', code: 'SE', score: 83.0, rank: 7 }, { name: 'Norway', code: 'NO', score: 82.9, rank: 8 },
  { name: 'Australia', code: 'AU', score: 82.9, rank: 9 }, { name: 'Israel', code: 'IL', score: 82.8, rank: 10 },
  { name: 'France', code: 'FR', score: 82.6, rank: 11 }, { name: 'Iceland', code: 'IS', score: 82.6, rank: 12 },
  { name: 'Canada', code: 'CA', score: 82.0, rank: 13 }, { name: 'Netherlands', code: 'NL', score: 82.0, rank: 14 },
  { name: 'United Kingdom', code: 'GB', score: 81.2, rank: 20 }, { name: 'Germany', code: 'DE', score: 81.0, rank: 22 },
  { name: 'United States', code: 'US', score: 78.5, rank: 29 }, { name: 'China', code: 'CN', score: 77.1, rank: 36 },
];

const ALL_LEAGUES = [
  { id: 'rl1', name: 'UK · Men 20–30', members: 128, category: 'Regional' },
  { id: 'rl3', name: 'Football · Recovery Circle', members: 96, category: 'Sport' },
  { id: 'rl4', name: 'Entrepreneurs Anti‑Stress', members: 173, category: 'Lifestyle' },
  { id: 'rl5', name: 'Paris · Women 30–40', members: 88, category: 'Regional' },
  { id: 'rl6', name: 'NYC · High Performers', members: 142, category: 'Regional' },
  { id: 'rl7', name: 'Mindful Mornings', members: 121, category: 'Lifestyle' },
  { id: 'rl8', name: 'Longevity Pros', members: 110, category: 'Health' },
  { id: 'rl9', name: 'Sleep Optimizers', members: 97, category: 'Health' },
  { id: 'rl10', name: 'Mediterranean Health', members: 104, category: 'Regional' },
];

function buildSystemPrompt(
  user: any,
  pd: any,
  biomarkerMap: Map<string, any[]>,
  recentLabs: any[],
  activeAllergies: any[],
  medications: any[],
  conditions: any[],
  vaccinations: any[],
  appointments: any[],
  deviceData: any[],
  connectedDevices: any[],
  recentSymptoms: any[],
  familySignals: any[],
  trips: any[],
  joinedLeagues: Record<string, boolean>,
  locationHealth: any,
  imagingResults: any[] = [],
  sections?: Set<string>,
): string {
  const inc = (section: string) => !sections || sections.has(section);
  const age = user?.date_of_birth
    ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  // Build trend series for each biomarker
  const trendLines: string[] = [];
  const abnormalLines: string[] = [];

  for (const [name, readings] of biomarkerMap.entries()) {
    const latest = readings[0];
    if (readings.length === 1) {
      trendLines.push(`- [id:${latest.id}] ${name}: ${latest.value} ${latest.unit} [${latest.risk_level ?? 'unknown'}]`);
    } else {
      const values = readings.map((r: any) => r.value).reverse(); // oldest first
      const trend = buildTrendArrow(values);
      const refRange = latest.reference_min != null && latest.reference_max != null
        ? ` (ref: ${latest.reference_min}–${latest.reference_max})`
        : '';
      trendLines.push(`- [id:${latest.id}] ${name}: ${values.join(' → ')} ${latest.unit}${refRange} [${latest.risk_level ?? 'unknown'}] ${trend}`);
    }
    if (latest.risk_level === 'abnormal') {
      abnormalLines.push(`- ${name}: ${latest.value} ${latest.unit}`);
    }
  }

  // ── Profile data (from rich local profile, synced to backend) ──────────────
  const bloodType = pd.bloodType ? `\n- Blood type: ${pd.bloodType}` : '';

  // Health ID numbers (NHS, insurance IDs) are omitted — not needed for clinical analysis
  const healthIDs = pd.healthIDs?.length
    ? `\nHEALTH IDs:\n${pd.healthIDs.map((h: any) => `- [_id:${h._id ?? 'unknown'}] ${h.idType} (${h.country})${h.isPrimary ? ' [primary]' : ''}${h.notes ? ` — ${h.notes}` : ''}`).join('\n')}\n`
    : '';

  // H2: contact details omitted; C2: only for emergency queries
  const emergencyContactSection = inc('emergency') && pd.emergencyContacts?.length
    ? `\nEMERGENCY CONTACTS:\n${pd.emergencyContacts.map((c: any) => `- [_id:${c._id ?? 'unknown'}] ${c.name} (${c.relationship})${c.isPrimary ? ' [primary]' : ''}`).join('\n')}\n`
    : '';

  // H4: doctor phones omitted; C2: only for appointment/referral queries
  const doctorSection = (() => {
    if (!inc('doctors')) return '';
    const lines: string[] = [];
    if (pd.primaryDoctor) {
      const d = pd.primaryDoctor;
      lines.push(`- [_id:${d._id ?? 'unknown'}] Primary: Dr. ${d.name} (${d.specialty})${d.office ? ` — ${d.office}` : ''}`);
    }
    if (pd.doctors?.length) {
      pd.doctors.forEach((d: any) => lines.push(`- [_id:${d._id ?? 'unknown'}] ${d.name} (${d.specialty})${d.office ? ` — ${d.office}` : ''}`));
    }
    return lines.length ? `\nDOCTORS:\n${lines.join('\n')}\n` : '';
  })();

  const surgerySection = pd.surgeries?.length
    ? `\nSURGERIES:\n${pd.surgeries.map((s: any) => `- ${s.procedure} (${s.date})${s.hospital ? ` at ${s.hospital}` : ''}${s.complications ? ` — complications: ${s.complications}` : ''}`).join('\n')}\n`
    : '';

  const screeningSection = pd.screenings?.length
    ? `\nSCREENINGS:\n${pd.screenings.map((s: any) => `- [_id:${s._id ?? 'unknown'}] ${s.name}${s.date ? ` (${s.date})` : ''}${s.result ? `: ${s.result}` : ''}${s.nextDue ? ` — next due: ${s.nextDue}` : ''}`).join('\n')}\n`
    : '';

  const lifestyleDetail = pd.lifestyle ? (() => {
    const l = pd.lifestyle;
    const lines: string[] = [];
    if (l.smoking) lines.push(`- Smoking: ${l.smoking.status}${l.smoking.packYears ? ` (${l.smoking.packYears} pack-years)` : ''}${l.smoking.quitDate ? `, quit ${l.smoking.quitDate}` : ''}`);
    if (l.alcohol) lines.push(`- Alcohol: ${l.alcohol.frequency}${l.alcohol.unitsPerWeek ? ` (${l.alcohol.unitsPerWeek} units/week)` : ''}`);
    if (l.diet) lines.push(`- Diet: ${l.diet.type}${l.diet.restrictions?.length ? `, restrictions: ${l.diet.restrictions.join(', ')}` : ''}${l.diet.supplements?.length ? `, supplements: ${l.diet.supplements.join(', ')}` : ''}`);
    if (l.exercise) lines.push(`- Exercise: ${l.exercise.frequency}${l.exercise.type?.length ? ` (${l.exercise.type.join(', ')})` : ''}${l.exercise.intensity ? `, ${l.exercise.intensity} intensity` : ''}`);
    if (l.sleep) lines.push(`- Sleep: ${l.sleep.averageHoursPerNight ?? '?'}h/night, quality: ${l.sleep.sleepQuality ?? 'unknown'}${l.sleep.sleepDisorders?.length ? `, disorders: ${l.sleep.sleepDisorders.join(', ')}` : ''}`);
    if (l.stress) lines.push(`- Stress: ${l.stress.level}${l.stress.managementTechniques?.length ? ` (manages with: ${l.stress.managementTechniques.join(', ')})` : ''}`);
    return lines.length ? `\nDETAILED LIFESTYLE:\n${lines.join('\n')}\n` : '';
  })() : '';

  const allergySection = activeAllergies.length > 0
    ? `\nKNOWN ALLERGIES (CRITICAL — always consider before any recommendation):\n${activeAllergies.map((a: any) => `- [id:${a.id}] ${a.name} [${a.severity}]${a.reaction ? `: ${a.reaction}` : ''}`).join('\n')}\n`
    : '';

  const medicationSection = medications.length > 0
    ? `\nCURRENT MEDICATIONS:\n${medications.map((m: any) => `- [id:${m.id}] ${m.name}${m.dosage ? ` ${m.dosage}` : ''}${m.frequency ? `, ${m.frequency}` : ''}`).join('\n')}\n`
    : '';

  const conditionSection = conditions.length > 0
    ? `\nMEDICAL CONDITIONS:\n${conditions.map((c: any) => `- [id:${c.id}] ${c.name} [${c.severity ?? 'unknown severity'}, ${c.status}]${c.diagnosed_date ? ` — diagnosed ${c.diagnosed_date}` : ''}`).join('\n')}\n`
    : '';

  const deviceSection = inc('device') && deviceData.length > 0
    ? `\nWEARABLE DATA (latest readings):\n${deviceData.map((d: any) => {
        const m = d.metrics as Record<string, any>;
        const lines = Object.entries(m)
          .filter(([, v]) => v != null)
          .map(([k, v]) => `  ${k}: ${v}`);
        return `- ${d.device_name} (${d.timestamp?.toString().split('T')[0] ?? 'unknown date'}):\n${lines.join('\n')}`;
      }).join('\n')}\n`
    : '';

  const vaccinationSection = inc('vaccinations') && vaccinations.length > 0
    ? `\nVACCINATIONS:\n${vaccinations.map((v: any) => `- [id:${v.id}] ${v.name} (${v.date})${v.next_due ? ` — next due: ${v.next_due}` : ''}`).join('\n')}\n`
    : '';

  const now = new Date();
  const pastAppts = appointments.filter((a: any) => new Date(a.event_date) < now);
  const upcomingAppts = appointments.filter((a: any) => new Date(a.event_date) >= now);
  const appointmentSection = inc('appointments') && appointments.length > 0 ? `\nAPPOINTMENTS:${
    upcomingAppts.length ? `\nUpcoming:\n${upcomingAppts.map((a: any) => `- [id:${a.id}] ${a.title}${a.subtitle ? ` (${a.subtitle})` : ''} on ${a.event_date?.toString().split('T')[0]}${a.doctor ? ` with ${a.doctor}` : ''}${a.location ? ` at ${a.location}` : ''}${a.notes ? ` — ${a.notes}` : ''}`).join('\n')}` : ''}${
    pastAppts.length ? `\nPast (last 5):\n${pastAppts.slice(0, 5).map((a: any) => `- [id:${a.id}] ${a.title}${a.subtitle ? ` (${a.subtitle})` : ''} on ${a.event_date?.toString().split('T')[0]}${a.doctor ? ` with ${a.doctor}` : ''}${a.notes ? ` — ${a.notes}` : ''}`).join('\n')}` : ''}\n`
    : '';

  const familyHistorySection = inc('family') && pd.familyHistory?.length
    ? `\nFAMILY HISTORY (user-recorded):\n${pd.familyHistory.map((f: any) => `- [_id:${f._id ?? 'unknown'}] ${f.relation}: ${f.condition}${f.ageOfOnset ? ` (onset age ~${f.ageOfOnset})` : ''}${f.notes ? ` — ${f.notes}` : ''}`).join('\n')}\n`
    : '';

  const symptomSection = recentSymptoms.length > 0
    ? `\nRECENT SYMPTOMS (last 30 days):\n${recentSymptoms.map((s: any) => `- [id:${s.id}] ${s.category} (${s.type}, severity ${s.severity}/10)${s.duration ? `, duration: ${s.duration}` : ''}${s.location ? `, location: ${s.location}` : ''}${s.notes ? ` — ${s.notes}` : ''}${s.factors?.length ? ` [factors: ${s.factors.join(', ')}]` : ''} [${s.logged_at?.toString().split('T')[0]}]`).join('\n')}\n`
    : '';

  // H5: omit family member surnames — first name only
  const familySection = familySignals.length > 0
    ? `\nFAMILY HEREDITARY SIGNALS:\n${familySignals.map((f: any) => `- ${f.condition_code} from ${f.first_name} (onset: ${f.onset_age_band}${f.severity_band ? `, severity: ${f.severity_band}` : ''})`).join('\n')}\n`
    : '';

  const imagingSection = inc('imaging') && imagingResults.length > 0
    ? `\nIMAGING & SCAN RESULTS:\n${imagingResults.map((i: any) =>
        `- [id:${i.id}] ${i.modality.toUpperCase()}${i.body_part ? ` (${i.body_part})` : ''}${i.study_date ? ` — ${i.study_date.toString().split('T')[0]}` : ''}` +
        `${i.impression ? `\n  Impression: ${i.impression}` : ''}` +
        `${i.findings && !i.impression ? `\n  Findings: ${i.findings.slice(0, 200)}${i.findings.length > 200 ? '…' : ''}` : ''}` +
        (i.measurements && Object.keys(i.measurements).length ? `\n  Measurements: ${Object.entries(i.measurements).map(([k, v]) => `${k}: ${v}`).join(', ')}` : '')
      ).join('\n')}\n`
    : '';

  const allDevices = ['whoop', 'oura'];
  const deviceConnectionSection = inc('device') ? `\nCONNECTED DEVICES:\n${allDevices.map(d => {
    const token = connectedDevices.find((t: any) => t.device_type === d);
    return token
      ? `- ${d.toUpperCase()}: connected (last synced ${new Date(token.last_synced).toLocaleDateString()})`
      : `- ${d.toUpperCase()}: not connected`;
  }).join('\n')}\n` : '';

  const s = user?.user_settings;
  const settingsSection = s ? `\nUSER SETTINGS:
- Theme: ${s.general?.theme ?? 'auto'} | Units: ${s.general?.units ?? 'metric'} | Language: ${s.general?.language ?? 'English'}
- Notifications: ${s.notifications?.enabled ? 'on' : 'off'}${s.notifications?.enabled ? ` (health summaries: ${s.notifications?.healthSummaries ? 'on' : 'off'}, biomarker alerts: ${s.notifications?.biomarkerAlerts ? 'on' : 'off'}, quiet hours: ${s.notifications?.quietHours?.enabled ? `${s.notifications.quietHours.startTime}–${s.notifications.quietHours.endTime}` : 'off'})` : ''}
- Privacy: biometric auth: ${s.privacy?.biometricAuth ? 'on' : 'off'}, 2FA: ${s.privacy?.twoFactorAuth ? 'on' : 'off'}, location: ${s.privacy?.locationServices ? 'on' : 'off'}
- Lifestyle: activity level: ${s.lifestyle?.activityLevel?.replace('_', ' ') ?? 'unknown'}, sleep: ${s.lifestyle?.sleepSchedule?.bedTime ?? '?'} → ${s.lifestyle?.sleepSchedule?.wakeUpTime ?? '?'}
- Diet: ${s.lifestyle?.dietaryPreferences?.restrictions?.length ? s.lifestyle.dietaryPreferences.restrictions.join(', ') : 'no restrictions'}, goal: ${s.lifestyle?.dietaryPreferences?.mealTiming ?? 'regular'}
- Health goal: ${s.biomarkers?.healthGoalPreset ?? 'general wellness'}
\n` : '';

  const memorySection = user?.health_memory
    ? `\nPERSISTENT HEALTH MEMORY (accumulated across all sessions):\n${user.health_memory}\n`
    : '';

  // ── Planned trips ───────────────────────────────────────────────────────────
  const now2 = new Date();
  const upcomingTrips = trips.filter((t: any) => new Date(t.departure_date) >= now2);
  const pastTrips = trips.filter((t: any) => new Date(t.departure_date) < now2);
  const tripsSection = inc('trips') && trips.length > 0 ? `\nPLANNED TRAVEL:${
    upcomingTrips.length ? `\nUpcoming:\n${upcomingTrips.map((t: any) => `- [id:${t.id}] ${t.departure_location} → ${t.destination} (departs ${t.departure_date?.toString().split('T')[0]}${t.return_date ? `, returns ${t.return_date?.toString().split('T')[0]}` : ''}${t.timezone ? `, timezone: ${t.timezone}` : ''}${t.notes ? ` — ${t.notes}` : ''})`).join('\n')}` : ''}${
    pastTrips.length ? `\nPast trips:\n${pastTrips.slice(0, 3).map((t: any) => `- [id:${t.id}] ${t.departure_location} → ${t.destination} (${t.departure_date?.toString().split('T')[0]})`).join('\n')}` : ''}\n`
    : '';

  // ── Community leagues ───────────────────────────────────────────────────────
  const myLeagues = ALL_LEAGUES.filter(l => joinedLeagues[l.id]);
  const leagueSection = inc('leagues') && myLeagues.length > 0
    ? `\nCOMMUNITY LEAGUES:\n${myLeagues.map(l => `- ${l.name} (${l.category}, ${l.members} members)`).join('\n')}\n`
    : '';

  // ── Country leaderboard ─────────────────────────────────────────────────────
  const userCountryCode = pd.healthIDs?.find((h: any) => h.isPrimary)?.country
    ?? user?.user_settings?.general?.country ?? null;
  const userCountry = userCountryCode
    ? COUNTRIES.find(c => c.code === userCountryCode || c.name.toLowerCase() === userCountryCode.toLowerCase())
    : null;
  const countrySection = `\nCOUNTRY HEALTH LEADERBOARD (top 5): Japan #1 (84.4), Switzerland #2 (83.7), Singapore #3 (83.5), Spain #4 (83.5), South Korea #5 (83.2).${
    userCountry ? ` User's country: ${userCountry.name} ranked #${userCountry.rank} with score ${userCountry.score}.` : ''}\n`;

  // ── Location health biomarkers ──────────────────────────────────────────────
  const locationSection = inc('location') && locationHealth ? (() => {
    const lh = locationHealth;
    const metricStr = (m: any) => m == null ? null : (typeof m === 'object' ? `${m.value ?? m.status ?? '?'} [${m.status ?? ''}]` : String(m));
    const lines: string[] = [];
    if (lh.location) lines.push(`- Current location: ${lh.location}`);
    if (lh.airQuality) lines.push(`- Air quality: ${metricStr(lh.airQuality)}`);
    if (lh.uvIndex != null) lines.push(`- UV index: ${metricStr(lh.uvIndex)}`);
    if (lh.pollenLevels != null) lines.push(`- Pollen: ${metricStr(lh.pollenLevels)}`);
    if (lh.waterSafety != null) lines.push(`- Water safety: ${metricStr(lh.waterSafety)}`);
    if (lh.diseaseRisk != null) lines.push(`- Disease risk: ${metricStr(lh.diseaseRisk)}`);
    if (lh.overallRiskLevel) lines.push(`- Overall risk: ${lh.overallRiskLevel}`);
    return lines.length ? `\nLOCATION HEALTH BIOMARKERS:\n${lines.join('\n')}\n` : '';
  })() : '';

  // ── Health scores computed from biomarkers ──────────────────────────────────
  const healthScoreSection = (() => {
    if (biomarkerMap.size === 0) return '';
    const abnormalCount = [...biomarkerMap.values()].filter(readings => readings[0]?.risk_level === 'abnormal').length;
    const totalCount = biomarkerMap.size;
    const overallScore = totalCount > 0 ? Math.round(((totalCount - abnormalCount) / totalCount) * 100) : null;

    // Category scores
    const categories: Record<string, { total: number; normal: number }> = {};
    for (const readings of biomarkerMap.values()) {
      const cat = readings[0]?.category ?? 'other';
      if (!categories[cat]) categories[cat] = { total: 0, normal: 0 };
      categories[cat].total++;
      if (readings[0]?.risk_level === 'normal') categories[cat].normal++;
    }
    const catLines = Object.entries(categories).map(([cat, { total, normal }]) =>
      `  ${cat}: ${Math.round((normal / total) * 100)}% in range (${normal}/${total} biomarkers)`
    );

    return `\nHEALTH SCORES (derived from ${totalCount} biomarkers):
- Overall biomarker score: ${overallScore !== null ? `${overallScore}%` : 'N/A'} (${abnormalCount} abnormal values)
${catLines.join('\n')}\n`;
  })();

  return `You are Toto — CoreHealth's AI health intelligence system. You operate as a virtual panel of world-class specialists: a cardiologist, endocrinologist, haematologist, neurologist, and general physician, all reasoning together from this user's personal data.

You are not a generic health chatbot. You reason from this user's specific biomarkers, trends, and history. You are calm, precise, and clinically informed. You never diagnose but you think like a diagnostician — spotting patterns, cross-referencing signals, and flagging what warrants attention.

USER PROFILE:
- Name: ${user?.first_name ?? 'Unknown'}
- Age: ${age ?? 'Unknown'}
- Gender: ${user?.gender ?? 'Unknown'}
- Height: ${user?.height_cm ? `${user.height_cm}cm` : 'Unknown'}
- Weight: ${user?.weight_kg ? `${user.weight_kg}kg` : 'Unknown'}${bloodType}
${healthIDs}${emergencyContactSection}${doctorSection}${allergySection}${medicationSection}${conditionSection}${surgerySection}${screeningSection}${vaccinationSection}${lifestyleDetail}${familyHistorySection}${familySection}${symptomSection}${imagingSection}${appointmentSection}${tripsSection}${leagueSection}${countrySection}${locationSection}${deviceConnectionSection}${deviceSection}${healthScoreSection}${settingsSection}${memorySection}
BIOMARKER TRENDS (→ = trajectory over time, most recent last):
${trendLines.length > 0 ? trendLines.join('\n') : 'No biomarkers recorded yet'}

${abnormalLines.length > 0 ? `FLAGGED ABNORMAL VALUES:\n${abnormalLines.join('\n')}\n` : ''}RECENT LAB RESULTS: ${recentLabs.length > 0 ? recentLabs.map((l: any) => `${l.lab_name ?? l.file_name ?? 'Lab'} (${l.report_date})`).join(', ') : 'None uploaded yet'}

AGENTIC WRITE CAPABILITIES:
You can add, update, and delete health records using your tools. Rules:
1. ALWAYS confirm with the user before calling any write tool — never write without explicit approval ("yes", "confirm", "go ahead", "add it", "do it", "save it", "yep", "sure")
2. When the user mentions new health events (vaccination just received, new medication started, upcoming appointment, symptom they're feeling, planned trip, new diagnosis, new allergy), proactively offer to record it: "Want me to add that to your records?"
3. When you successfully write data, tell the user exactly what was saved in plain language (e.g. "Done — I've added your COVID-19 vaccination for today")
4. IDs are shown as [id:xxx] in each data section — use them for update/delete operations
5. Never guess or fabricate IDs — only use IDs visible in the data above
6. If the user asks you to delete or change something and you can see the record, ask them to confirm once, then act
7. Never call a write tool without explicit user confirmation in the current message or immediately preceding message

CLINICAL INSTRUCTIONS:
- Reason from this user's data and trends, not population averages
- Cross-reference biomarkers — patterns across multiple values are more meaningful than any single value
- When a medication is relevant to a symptom or biomarker, explicitly note the connection
- When trends are accelerating in a concerning direction, say so clearly and explain why it matters
- Be concise — this user is health-literate, skip basic explanations
- When something is abnormal or trending wrong, give real clinical context and a clear next action
- Never say "consult a doctor" as your only response — give genuine insight first, then recommend follow-up if warranted
- Never fabricate values or infer data not shown above
- If the user mentions symptoms, cross-reference with their biomarker data, conditions, medications, and recent logged symptoms for possible connections
- When family hereditary signals are present, factor them into risk assessment
- Know the user's doctors and emergency contacts if relevant to a question
- Upcoming appointments are known — reference them when recommending follow-up`;
}

function buildTrendArrow(values: number[]): string {
  if (values.length < 2) return '';
  const first = values[0];
  const last = values[values.length - 1];
  const pct = ((last - first) / first) * 100;
  if (pct > 10) return '(trending up)';
  if (pct < -10) return '(trending down)';
  return '(stable)';
}
