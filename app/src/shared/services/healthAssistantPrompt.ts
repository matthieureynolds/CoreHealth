import type { UserProfile, Biomarker, HealthScore, DeviceData, LabResult, BodySystem, TravelHealth } from '../types';
import type { UserSettings } from '../types/settings';
import type { UserHealthContext } from './healthAssistantService';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appConfig = require('../../../app.json');

interface HealthData {
  profile: UserProfile | null;
  biomarkers: Biomarker[];
  healthScore: HealthScore | null;
  deviceData?: DeviceData[];
  settings?: UserSettings | null;
  labResults?: LabResult[];
  bodySystems?: BodySystem[];
  travelHealth?: TravelHealth | null;
}

export function formatMemoryContextForPrompt(userContext: UserHealthContext | null): string {
  if (!userContext) return '';

  let ctx = '';
  if (userContext.conversationSummary) {
    ctx += `\nConversation Summary:\n${userContext.conversationSummary}\n`;
  }
  if (userContext.keyTopics && userContext.keyTopics.length > 0) {
    ctx += `\nKey Topics Discussed: ${userContext.keyTopics.join(', ')}\n`;
  }
  if (Object.keys(userContext.healthGoals).length > 0) {
    ctx += '\nHealth Goals:\n';
    Object.values(userContext.healthGoals).forEach(goal => {
      ctx += `• ${goal.goal}\n`;
    });
  }
  return ctx;
}

export function formatHealthDataForPrompt(healthData?: HealthData): string {
  if (!healthData) return 'No current health data available.';

  let out = '';

  // Demographics
  if (healthData.profile) {
    const p: any = healthData.profile as any;
    const displayName = p.preferredName || p.displayName || [p.firstName, p.surname].filter(Boolean).join(' ');
    if (displayName) out += `Name: ${displayName}\n`;
    if (p.email) out += `Email: ${p.email}\n`;
    if (healthData.profile.age) out += `Age: ${healthData.profile.age}\n`;
    if (healthData.profile.gender) out += `Gender: ${healthData.profile.gender}\n`;
    if (healthData.profile.height && healthData.profile.weight) {
      const bmi = (healthData.profile.weight / Math.pow(healthData.profile.height / 100, 2)).toFixed(1);
      out += `Height: ${healthData.profile.height} cm\nWeight: ${healthData.profile.weight} kg\nBMI: ${bmi}\n`;
    }
    if (p.bloodType) out += `Blood Type: ${p.bloodType}\n`;

    try {
      const allergies = p.allergies || [];
      if (Array.isArray(allergies) && allergies.length > 0) {
        const list = allergies.map((a: any) => a?.name || a?.allergen || '').filter(Boolean).slice(0, 10).join(', ');
        if (list) out += `Allergies: ${list}\n`;
      }
    } catch {}

    try {
      const medications = p.medications || [];
      if (Array.isArray(medications) && medications.length > 0) {
        const list = medications.map((m: any) => m?.name ? `${m.name}${m?.dose ? ` ${m.dose}` : ''}` : '').filter(Boolean).slice(0, 10).join(', ');
        if (list) out += `Medications: ${list}\n`;
      }
    } catch {}

    try {
      const history = p.medicalHistory || [];
      if (Array.isArray(history) && history.length > 0) {
        const list = history.map((h: any) => h?.name || h?.condition || '').filter(Boolean).slice(0, 10).join(', ');
        if (list) out += `Medical History: ${list}\n`;
      }
    } catch {}

    try {
      const fam = p.familyHistory || [];
      if (Array.isArray(fam) && fam.length > 0) {
        const list = fam.map((f: any) => {
          const rel = f?.relation || f?.relative || f?.relationship || '';
          const cond = f?.name || f?.condition || f?.diagnosis || '';
          return [rel, cond].filter(Boolean).join(' - ');
        }).filter(Boolean).slice(0, 10).join('; ');
        if (list) out += `Family History: ${list}\n`;
      }
    } catch {}
  }

  if (healthData.healthScore?.overall) {
    out += `Health Score: ${healthData.healthScore.overall}/100\n`;
  }

  // Connected Devices
  try {
    const events = Array.isArray(healthData.deviceData) ? healthData.deviceData : [];
    const types = Array.from(new Set(events.map((d: any) => d?.deviceType))).filter(Boolean);
    if (types.length > 0) out += `Connected Devices: ${types.join(', ')}\n`;
    const times = events.map((d: any) => (d?.timestamp ? new Date(d.timestamp).getTime() : NaN)).filter(Number.isFinite);
    if (times.length > 0) out += `Last Device Sync: ${new Date(Math.max(...times)).toISOString()}\n`;
  } catch {}

  // Settings
  try {
    const s = healthData.settings as any;
    if (s) {
      const general = s.general || {};
      const notifications = s.notifications || {};
      const privacy = s.privacy || {};
      const dataSync = s.dataSync || {};
      const accessibility = s.accessibility || {};
      const biomarkers = s.biomarkers || {};
      const app = s.app || {};

      const generalParts: string[] = [];
      if (general.units) generalParts.push(`Units: ${general.units}`);
      if (general.timeFormat) generalParts.push(`Time: ${general.timeFormat}`);
      if (general.dateFormat) generalParts.push(`Date: ${general.dateFormat}`);
      if (general.language) generalParts.push(`Language: ${general.language}`);
      if (general.theme) generalParts.push(`Theme: ${general.theme}`);
      if (generalParts.length) out += `Display & Format: ${generalParts.join(', ')}\n`;

      const accParts: string[] = [];
      if (accessibility.fontSize) accParts.push(`Font: ${accessibility.fontSize}`);
      if (accessibility.highContrast !== undefined) accParts.push(`HighContrast: ${accessibility.highContrast ? 'on' : 'off'}`);
      if (accessibility.reducedMotion !== undefined) accParts.push(`ReducedMotion: ${accessibility.reducedMotion ? 'on' : 'off'}`);
      if (accessibility.hapticFeedback !== undefined) accParts.push(`Haptics: ${accessibility.hapticFeedback ? 'on' : 'off'}`);
      if (accParts.length) out += `Accessibility: ${accParts.join(', ')}\n`;

      const privParts: string[] = [];
      if (privacy.biometricAuth !== undefined) privParts.push(`Biometric: ${privacy.biometricAuth ? 'on' : 'off'}`);
      if (privacy.twoFactorAuth !== undefined) privParts.push(`2FA: ${privacy.twoFactorAuth ? 'on' : 'off'}`);
      if (privacy.sessionTimeout) privParts.push(`Timeout: ${privacy.sessionTimeout}`);
      if (privacy.locationServices !== undefined) privParts.push(`Location: ${privacy.locationServices ? 'on' : 'off'}`);
      if (privacy.dataSharing) {
        const ds = privacy.dataSharing;
        privParts.push(`Sharing: analytics=${ds.analytics ? 'on' : 'off'}, anonymized=${ds.anonymizedData ? 'on' : 'off'}, thirdParty=${ds.thirdPartyApps ? 'on' : 'off'}`);
      }
      if (privParts.length) out += `Privacy & Security: ${privParts.join(', ')}\n`;

      const syncParts: string[] = [];
      if (dataSync.autoSync !== undefined) syncParts.push(`AutoSync: ${dataSync.autoSync ? 'on' : 'off'}`);
      if (dataSync.backgroundSync !== undefined) syncParts.push(`Background: ${dataSync.backgroundSync ? 'on' : 'off'}`);
      if (dataSync.syncFrequency) syncParts.push(`Frequency: ${dataSync.syncFrequency}`);
      if (dataSync.wifiOnly !== undefined) syncParts.push(`WiFiOnly: ${dataSync.wifiOnly ? 'on' : 'off'}`);
      if (dataSync.dataRetention) syncParts.push(`Retention: ${dataSync.dataRetention}`);
      if (dataSync.backupEnabled !== undefined) syncParts.push(`Backup: ${dataSync.backupEnabled ? 'on' : 'off'}`);
      if (dataSync.backupFrequency) syncParts.push(`BackupEvery: ${dataSync.backupFrequency}`);
      if (syncParts.length) out += `Data & Sync: ${syncParts.join(', ')}\n`;

      const notifParts: string[] = [];
      if (notifications.enabled !== undefined) notifParts.push(`Enabled: ${notifications.enabled ? 'on' : 'off'}`);
      ['healthSummaries', 'biomarkerAlerts', 'vaccinationReminders', 'travelWarnings', 'syncIssues', 'emergencyAlerts', 'appUpdates'].forEach(k => {
        if (notifications[k] !== undefined) notifParts.push(`${k}:${notifications[k] ? 'on' : 'off'}`);
      });
      if (notifications.quietHours?.enabled) {
        notifParts.push(`QuietHours: ${notifications.quietHours.startTime}-${notifications.quietHours.endTime}`);
      }
      if (notifParts.length) out += `Notifications: ${notifParts.join(', ')}\n`;

      if (biomarkers.displaySettings) {
        const ds = biomarkers.displaySettings as any;
        const bds: string[] = [];
        if (ds.showTrends !== undefined) bds.push(`Trends:${ds.showTrends ? 'on' : 'off'}`);
        if (ds.showPercentiles !== undefined) bds.push(`Percentiles:${ds.showPercentiles ? 'on' : 'off'}`);
        if (ds.groupByCategory !== undefined) bds.push(`GroupBy:${ds.groupByCategory ? 'category' : 'none'}`);
        if (ds.sortBy) bds.push(`Sort:${ds.sortBy}`);
        if (bds.length) out += `Biomarker Display: ${bds.join(', ')}\n`;
      }

      const version = (appConfig?.expo?.version) || app?.lastVersion || 'unknown';
      out += `App Info: Version ${version}\n`;
      out += `Support & Help: support@corehealth.com, feedback@corehealth.com, FAQ available in Support & Help.\n`;
      out += `Legal & Compliance: Terms of Service, Privacy Policy, Consent Forms, HIPAA, Data Processing Agreement, Data Retention Policy.\n`;
    }
  } catch {}

  // Body Systems
  try {
    const systems = healthData.bodySystems || [];
    if (systems.length) {
      const rows = systems.slice(0, 8).map((bs: any) => `${bs.name || bs.id}: ${typeof bs.riskScore === 'number' ? bs.riskScore : '-'}`).join('; ');
      if (rows) out += `Body Systems Risk: ${rows}\n`;
    }
  } catch {}

  // Travel Health
  try {
    const th: any = healthData.travelHealth;
    if (th) {
      const parts: string[] = [];
      if (th.overallRiskLevel) parts.push(`Overall:${th.overallRiskLevel}`);
      if (th.airQuality?.value !== undefined) parts.push(`AQI:${th.airQuality.value}`);
      if (th.pollenLevels?.value !== undefined) parts.push(`Pollen:${th.pollenLevels.value}`);
      if (th.uvIndex?.value !== undefined) parts.push(`UV:${th.uvIndex.value}`);
      if (parts.length) out += `Travel Health: ${parts.join(', ')}\n`;
    }
  } catch {}

  // Recent Lab Results
  try {
    const labs = Array.isArray(healthData.labResults) ? healthData.labResults : [];
    if (labs.length) {
      out += `\nRecent Lab Results:\n`;
      labs.slice(-5).forEach((lr: any) => {
        const name = lr.testName || lr.name || 'Lab';
        const value = lr.value !== undefined ? lr.value : '';
        const unit = lr.unit || '';
        const date = lr.date || lr.recorded_at || lr.created_at || '';
        const status = lr.status || '';
        out += `• ${name}: ${value} ${unit} ${status ? `(${status})` : ''} ${date ? `on ${date}` : ''}\n`;
      });
    }
  } catch {}

  // Biomarkers
  if (healthData.biomarkers?.length) {
    out += `\nRecent Biomarkers:\n`;
    healthData.biomarkers.slice(0, 5).forEach(b => {
      const status = assessBiomarkerStatus(b);
      out += `• ${b.name}: ${b.value} ${b.unit} (${status})\n`;
    });
  }

  return out;
}

function assessBiomarkerStatus(biomarker: Biomarker): string {
  const name = biomarker.name.toLowerCase();
  const value = biomarker.value;

  const ranges: Record<string, { optimal: [number, number]; normal: [number, number] }> = {
    glucose: { optimal: [70, 85], normal: [70, 99] },
    'total cholesterol': { optimal: [150, 200], normal: [150, 240] },
    'hdl cholesterol': { optimal: [60, 100], normal: [40, 100] },
    'ldl cholesterol': { optimal: [50, 100], normal: [50, 130] },
    triglycerides: { optimal: [50, 100], normal: [50, 150] },
    creatinine: { optimal: [0.6, 1.0], normal: [0.6, 1.2] },
    alt: { optimal: [10, 30], normal: [7, 56] },
    ast: { optimal: [10, 30], normal: [10, 40] },
  };

  for (const [key, range] of Object.entries(ranges)) {
    if (name.includes(key)) {
      if (value >= range.optimal[0] && value <= range.optimal[1]) return 'Optimal';
      if (value >= range.normal[0] && value <= range.normal[1]) return 'Normal';
      return value < range.normal[0] ? 'Low' : 'High';
    }
  }
  return 'Within range';
}

export function buildSystemPrompt(
  userContext: UserHealthContext | null,
  healthData: any,
  intent?: string
): string {
  const healthContext = formatHealthDataForPrompt(healthData);
  const memoryContext = formatMemoryContextForPrompt(userContext);
  const isDirect = intent === 'direct_question' || intent === 'medication_info';

  return `You are Toto, a professional doctor with a kind, empathetic tone. Provide evidence-based, clinically accurate guidance.

Safety and scope:
- This chat is educational support only and not a substitute for medical care.
- Do not provide a diagnosis or prescriptions. Offer a differential-style discussion (what could be going on), key red flags, and next steps. Encourage clinician follow-up for anything concerning.

Use of profile data:
- You may use the user's CoreHealth data below (Name, Demographics, BMI, Allergies, Medications, Medical & Family History, Devices, Settings, Body Systems, Travel Health, Biomarkers, Lab Results) to personalize responses.
- When referencing personal details, preface with "Based on your CoreHealth profile". If information is missing, say you don't have it and ask focused clarifying questions.

Formatting rules:
- Respect the user's display preferences when showing times and dates.
- Times: use ${healthData?.settings?.general?.timeFormat === '12h' ? '12-hour with am/pm' : '24-hour'} format unless the user explicitly asks otherwise.
- Dates: use ${healthData?.settings?.general?.dateFormat || 'DD/MM/YYYY'}.

Clinical reasoning:
- When asked "what might I have", provide 2–4 plausible possibilities with brief reasoning grounded in the user's data, plus red flags and when to seek care. Keep concise and organized.

User's Health Information:
${healthContext}

${memoryContext}

Guidelines:
- Always answer the user's current question directly in the first paragraph. Stay on-topic.
- Use clear, plain language; be precise and factual; avoid unnecessary general advice.
- If medical judgment is implied, include a brief safety note and suggest consulting a clinician for personal care.
- Prefer concise structure: short paragraphs or 3–5 bullets when appropriate.
- Only personalize using the user's health data if it is clearly relevant to the specific question.

${isDirect ? `
Direct Question Mode:
- If the user asks for a definition or mechanism (e.g., "what is creatine"), provide: definition, mechanism of action, common uses/benefits, typical dosing ranges for adults where applicable, key side effects and contraindications, and important interactions. Keep it 4–8 sentences or 3–5 bullets.
- Do NOT add generic lifestyle or nutrition tips unless explicitly requested.
` : `
Contextual Coaching Mode:
- Provide practical, actionable guidance tailored to the user's goals when they ask for advice.
`}

Command Emission (when a concrete action is appropriate):
- When the user requests an actionable task that maps to a known command, include a single JSON object in a fenced code block labeled json (use triple backticks) at the end of your reply with shape {"type":"<COMMAND>", "payload":{...}}.
- Supported commands: SUPPLEMENT_VITC_RECOMMEND, APPT_RESCHEDULE_DENTIST, SYMPTOM_LOG_LEG_PAIN, ALLERGY_UPDATE_PNUT, TRAVEL_ADD_COUNTRY_CARD, LAB_SUBMIT_RESULTS, TRIP_CHANGE_DATES.
- Keep natural language response first; place the JSON block last on a new line.`;
}
