import React from 'react';
import LegalDocTemplate from './LegalDocTemplate';

const ComplianceNoticesScreen: React.FC = () => (
  <LegalDocTemplate
    title="HIPAA / GDPR Region-Based Notices"
    content={[
      'UK GDPR / EU GDPR. Data controller information, lawful bases, DPO contact (if applicable), and your rights: access, rectification, erasure, restriction, portability, and objection. For UK users, complaints may be lodged with the ICO.',
      'HIPAA (US). For HIPAA‑covered data received from providers, CoreHealth acts as a Business Associate. Notice of privacy practices is available from your provider; CoreHealth safeguards PHI per HIPAA Security Rule.',
      'CCPA/CPRA (California). Residents have rights to know, delete, correct, opt‑out of selling/sharing (we do not sell PHI), limit use of sensitive data, and non‑discrimination.',
      'PIPEDA (Canada). We process personal information in accordance with the ten fair information principles, including accountability, identifying purposes, consent, limiting use, safeguards, and openness.',
      'Australia (Privacy Act). You may request access and correction; we handle complaints per OAIC guidance.',
      'Regional Addenda. Additional notices may apply in your jurisdiction. Contact privacy@corehealth.com for the region‑specific addendum.',
    ]}
  />
);

export default ComplianceNoticesScreen;
