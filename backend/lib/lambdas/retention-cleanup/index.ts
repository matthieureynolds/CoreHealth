/**
 * GDPR Article 5(1)(e) — Storage Limitation
 *
 * Scheduled nightly at 04:00 UTC via EventBridge.
 * Deletes rows that exceed their defined retention window.
 *
 * Retention schedule:
 *   chat_messages   — 1 year  (AI conversation context, not a medical record)
 *   device_data     — 2 years (raw wearable metrics)
 *   symptoms        — 5 years (health logs)
 *   health_alerts   — 1 year
 *   trips           — 2 years
 *
 * NOT auto-deleted (user controls via account deletion):
 *   biomarkers, lab_results, medications, conditions, vaccinations, allergies
 *   — these are permanent health records proportionate to the app's purpose.
 */

import { getDb } from '../_shared/db';

interface CleanupResult {
  table: string;
  deleted: number;
}

export const handler = async (): Promise<{ statusCode: number; body: string }> => {
  const db = await getDb();

  const tasks: Array<{ table: string; column: string; days: number }> = [
    { table: 'chat_messages',  column: 'created_at', days: 365  },
    { table: 'device_data',    column: 'created_at', days: 730  },
    { table: 'symptoms',       column: 'created_at', days: 1825 },
    { table: 'health_alerts',  column: 'created_at', days: 365  },
    { table: 'trips',          column: 'created_at', days: 730  },
  ];

  const results: CleanupResult[] = [];

  for (const { table, column, days } of tasks) {
    try {
      const result = await db.query(
        `DELETE FROM ${table} WHERE ${column} < NOW() - INTERVAL '${days} days'`,
      );
      results.push({ table, deleted: result.rowCount ?? 0 });
      console.log(`retention-cleanup: deleted ${result.rowCount ?? 0} rows from ${table} (>${days}d)`);
    } catch (e: any) {
      // Non-fatal: log and continue — one table failure should not block others
      console.error(`retention-cleanup: error on ${table}:`, e?.message);
      results.push({ table, deleted: -1 });
    }
  }

  const summary = results.map(r => `${r.table}=${r.deleted}`).join(', ');
  console.log('retention-cleanup complete:', summary);

  return { statusCode: 200, body: summary };
};
