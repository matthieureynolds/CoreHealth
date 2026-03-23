import React from 'react';
import LegalDocTemplate from './LegalDocTemplate';

const DataRetentionPolicyScreen: React.FC = () => (
  <LegalDocTemplate
    title="Data Retention Policy"
    content={[
      'Principles. We retain personal data only as long as necessary for the purposes collected, including providing the Service, complying with legal obligations, resolving disputes, and enforcing agreements.',
      'Default Periods. Account data is retained while your account is active. Health data you store is retained until you delete it or close your account. Backups are purged on rolling schedules.',
      'Deletion. You may request deletion at any time from Settings → Privacy & Security or by emailing privacy@corehealth.com. Deletion requests are honored within statutory timelines.',
      'Anonymization. We may retain anonymized or aggregated data that does not identify you, for analytics and service improvement.',
      'Categories & Durations: (a) Account & authentication data: while account is active + 12 months; (b) Uploaded medical records: until you delete them or close your account; (c) Device/app sync data (e.g., activity/biomarkers): rolling 24 months; (d) Logs & diagnostics: up to 90 days; (e) Analytics (non‑identifying/aggregated): retained for trend analysis; (f) Encrypted backups: rolling 35 days.',
      'Legal Bases & Holds. Some records may be retained longer where necessary to comply with law, accounting/tax rules, audits, insurance, or to resolve disputes and security incidents. A legal hold pauses deletion until the hold ends.',
      'Backups & Propagation. When you delete data or close your account, production copies are removed promptly and backup copies are purged on the next scheduled cycle (typically within 35 days).',
      'Verification & SLA. For deletion requests, we verify identity via your account email or additional checks. We aim to complete production deletion within 30 days of verification; backup purge follows the standard cycle.',
      'Sub‑processors. We contractually require sub‑processors to implement equivalent retention and deletion timelines and to purge backup media in line with their standard schedules.',
      'Anonymization Scope. Where appropriate, we convert certain datasets to anonymized or aggregated form and retain those for analytics and service improvement. These datasets cannot be used to identify you.',
      'Region & Residency. Where data residency applies, retention and deletion are executed in-region in accordance with local laws and the applicable data processing agreement.',
    ]}
  />
);

export default DataRetentionPolicyScreen;
