import React from 'react';
import LegalDocTemplate from './LegalDocTemplate';

const ConsentFormsScreen: React.FC = () => (
  <LegalDocTemplate
    title="Consent Forms"
    content={[
      'Overview. You can provide and withdraw consent for specific processing activities.',
      'Health Data Sharing. Consent to share records with a clinician or caregiver for a defined purpose and duration.',
      'Research Programs (Optional). If available, you can opt‑in to anonymized or identifiable research; each program includes a specific consent form.',
      'Third‑Party Integrations. Connecting a device/app allows data transfer per that provider’s permissions page; you can disconnect anytime in Settings.',
      'Granularity. Consents are granular (e.g., device categories, specific records, time‑boxed access). You may review current consents at any time in Settings.',
      'Parental/Guardian Consent. If required by applicable law, consent from a parent/guardian is needed for minors. We will not knowingly process children’s data without proper consent.',
      'Withdrawal. You can withdraw consent in Settings → Privacy & Security or by contacting privacy@corehealth.com. Withdrawal does not affect prior lawful processing.',
    ]}
  />
);

export default ConsentFormsScreen;
