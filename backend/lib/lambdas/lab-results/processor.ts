import { SQSEvent } from 'aws-lambda';
import {
  TextractClient,
  AnalyzeDocumentCommand,
  FeatureType,
} from '@aws-sdk/client-textract';
import {
  ComprehendMedicalClient,
  DetectEntitiesV2Command,
} from '@aws-sdk/client-comprehendmedical';
import { getDb } from '../_shared/db';

const textract = new TextractClient({});
const comprehendMedical = new ComprehendMedicalClient({});

export const handler = async (event: SQSEvent): Promise<void> => {
  const db = await getDb();

  for (const record of event.Records) {
    let labResultId: string, s3Key: string;
    try {
      ({ labResultId, s3Key } = JSON.parse(record.body));
    } catch {
      console.error('Failed to parse SQS message body — messageId:', record.messageId);
      continue;
    }

    try {
      // Re-derive userId from the DB — never trust userId from an untrusted message payload
      const ownerRow = await db.query(
        `UPDATE lab_results SET processing_status = 'processing' WHERE id = $1 RETURNING user_id`,
        [labResultId],
      );
      const userId: string | undefined = ownerRow.rows[0]?.user_id;
      if (!userId) {
        console.error(`lab_result ${labResultId} not found — skipping`);
        continue;
      }

      // Step 1: Textract — extract all text from the PDF/image
      const textractResult = await textract.send(
        new AnalyzeDocumentCommand({
          Document: {
            S3Object: {
              Bucket: process.env.DOCUMENTS_BUCKET!,
              Name: s3Key,
            },
          },
          FeatureTypes: [FeatureType.TABLES, FeatureType.FORMS],
        }),
      );

      // Collect all text blocks
      const rawText = textractResult.Blocks
        ?.filter(b => b.BlockType === 'LINE' && b.Text)
        .map(b => b.Text!)
        .join('\n') ?? '';

      if (!rawText) {
        await db.query(
          `UPDATE lab_results SET processing_status = 'failed', error_message = 'No text extracted'
           WHERE id = $1`,
          [labResultId],
        );
        continue;
      }

      // Step 2: Comprehend Medical — extract biomarker entities
      // Comprehend Medical has a 20,000 char limit per request
      const textChunks = chunkText(rawText, 20000);
      const allEntities: any[] = [];

      for (const chunk of textChunks) {
        const medResult = await comprehendMedical.send(
          new DetectEntitiesV2Command({ Text: chunk }),
        );
        allEntities.push(...(medResult.Entities ?? []));
      }

      // Step 3: Extract test name + value pairs from entities
      const biomarkers = extractBiomarkers(allEntities);

      // Step 4: Persist extracted biomarkers
      for (const bm of biomarkers) {
        await db.query(
          `INSERT INTO biomarkers
             (user_id, name, value, unit, category, trend, risk_level, recorded_at, lab_result_id)
           VALUES ($1, $2, $3, $4, $5, 'stable', 'unknown', NOW(), $6)
           ON CONFLICT (user_id, name, recorded_at) DO NOTHING`,
          [userId, bm.name, bm.value, bm.unit, bm.category, labResultId],
        );
      }

      await db.query(
        `UPDATE lab_results
         SET processing_status = 'complete',
             biomarker_count = $2,
             raw_text = $3
         WHERE id = $1`,
        [labResultId, biomarkers.length, rawText.slice(0, 50_000)],
      );
    } catch (error: any) {
      await db.query(
        `UPDATE lab_results SET processing_status = 'failed', error_message = $2 WHERE id = $1`,
        [labResultId, error.message ?? 'Unknown error'],
      );
    }
  }
};

function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

function extractBiomarkers(entities: any[]): Array<{
  name: string;
  value: number;
  unit: string;
  category: string;
}> {
  const biomarkers: any[] = [];

  const testNameEntities = entities.filter(
    e => e.Category === 'TEST_TREATMENT_PROCEDURE' && e.Type === 'TEST_NAME',
  );
  const testValueEntities = entities.filter(
    e => e.Category === 'TEST_TREATMENT_PROCEDURE' && e.Type === 'TEST_VALUE',
  );

  for (const testName of testNameEntities) {
    // Find the closest value entity by character offset
    const nearbyValue = testValueEntities
      .filter(v => Math.abs(v.BeginOffset - testName.EndOffset) < 200)
      .sort((a, b) => a.BeginOffset - b.BeginOffset)[0];

    if (!nearbyValue) continue;

    const rawValue = nearbyValue.Text?.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(rawValue ?? '');
    if (isNaN(numericValue)) continue;

    // Extract unit from attributes if present
    const unitAttr = nearbyValue.Attributes?.find((a: any) => a.Type === 'TEST_UNIT');
    const unit = unitAttr?.Text ?? '';

    biomarkers.push({
      name: testName.Text ?? 'Unknown',
      value: numericValue,
      unit,
      category: inferCategory(testName.Text ?? ''),
    });
  }

  return biomarkers;
}

function inferCategory(testName: string): string {
  const name = testName.toLowerCase();
  if (/cholesterol|triglyceride|ldl|hdl|crp|homocysteine/.test(name)) return 'cardiovascular';
  if (/glucose|hba1c|insulin|thyroid|tsh|t3|t4/.test(name)) return 'metabolic';
  if (/testosterone|estrogen|cortisol|dhea|progesterone|lh|fsh/.test(name)) return 'hormonal';
  if (/crp|esr|ferritin|interleukin/.test(name)) return 'inflammatory';
  if (/vitamin|iron|b12|folate|zinc|magnesium|calcium/.test(name)) return 'nutritional';
  return 'other';
}
