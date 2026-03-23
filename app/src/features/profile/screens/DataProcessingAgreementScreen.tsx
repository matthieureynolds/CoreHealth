import React from 'react';
import LegalDocTemplate from './LegalDocTemplate';

const DataProcessingAgreementScreen: React.FC = () => (
  <LegalDocTemplate
    title="Data Processing Agreement"
    content={[
      'Parties. This DPA forms part of the Terms between you (Controller) and CoreHealth (Processor) when we process personal data on your behalf.',
      'Subject Matter. Processing personal and health data to provide app functionality, synchronization, analytics, and support.',
      'Duration. For the term of your use of the Service and as otherwise required by law.',
      'Nature & Purpose. Storage, retrieval, analysis, and transmission of health and account data to deliver features you request.',
      'Types of Data & Data Subjects. Account data (email, name), health metrics you choose to sync; data subjects are users and individuals whose data users upload.',
      'Processor Obligations. Process data only on documented instructions; maintain confidentiality; implement appropriate technical and organizational measures; assist with data subject requests and security incidents; delete/return data upon termination.',
      'Sub‑processors. We may engage vetted sub‑processors under written contracts that ensure equivalent data protection obligations. A current list is available upon request.',
      'International Transfers. Covered by appropriate safeguards (e.g., SCCs) when applicable.',
      'Audit & Reports. We will provide information necessary to demonstrate compliance and allow audits by you or an appointed auditor, subject to reasonable notice and confidentiality.',
      'Breach Notification. We notify you without undue delay after becoming aware of a personal data breach and provide information as it becomes available to help you meet your legal obligations.',
      'Data Subject Requests. We will promptly assist in responding to requests to exercise rights (access, rectification, deletion, restriction, portability, objection).',
      'Return/Deletion Upon Termination. At your choice, we will return or delete personal data after the end of the provision of services, unless retention is required by law.',
    ]}
  />
);

export default DataProcessingAgreementScreen;
