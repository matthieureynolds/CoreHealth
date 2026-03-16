import React from 'react';
import LegalDocTemplate from './LegalDocTemplate';

const TermsScreen: React.FC = () => (
  <LegalDocTemplate
    title="Terms & Conditions"
    content={[
      'Effective date: 1 Jan 2025',
      'Welcome to CoreHealth. These Terms & Conditions ("Terms") govern your access to and use of the CoreHealth mobile application and related services (collectively, the "Service"). By using the Service you agree to be bound by these Terms.',
      'Controller/Provider. For users in the United Kingdom, the Service is provided by CoreHealth, London, United Kingdom (contact: legal@corehealth.com).',
      'Eligibility & Account. You must be at least 16 years old (or the age of digital consent in your country) to use the Service. You are responsible for keeping your login credentials secure and for all activity under your account.',
      'Medical Disclaimer. CoreHealth does not provide medical advice. Content and insights are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.',
      'User Data & Privacy. We process your personal data in accordance with our Privacy Policy. By using the Service you consent to such processing. You can control sharing and data export in Settings.',
      'Device & App Integrations. When you connect third‑party devices or services (e.g., Apple Health, Google Fit, Oura), you authorize us to receive and process data from those services in order to provide features. We are not responsible for the availability or accuracy of third‑party services.',
      'Acceptable Use. You agree not to misuse the Service, including: reverse engineering; interfering with security features; uploading malware; or using the Service in violation of applicable laws or to infringe others’ rights.',
      'Subscriptions & Payments. If paid features are offered, billing terms will be presented at purchase. Fees are non‑refundable except where required by law or expressly stated otherwise.',
      'Intellectual Property. The Service, including software, designs, and content, is owned by or licensed to CoreHealth. We grant you a limited, non‑transferable, revocable license to use the app for personal, non‑commercial purposes.',
      'User Content. You retain ownership of content you submit and grant CoreHealth a limited license to process it solely to provide the Service. You represent you have the rights to submit the content.',
      'Travel Mode & Local Guidance. Health and safety guidance (including environmental risk scores and vaccination information) is provided for convenience only and may not be current or complete. Always verify official requirements with local authorities.',
      'Service Changes. We may modify or discontinue features at any time. We will provide notice of material changes where feasible.',
      'Termination. We may suspend or terminate access for violations of these Terms or to protect users. You may stop using the Service at any time. Upon termination, certain provisions survive (including IP, disclaimers, limitations, and dispute terms).',
      'Disclaimers. The Service is provided “AS IS” without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy, or non‑infringement. Data, scores, and insights may contain errors or be incomplete.',
      'Limitation of Liability. To the maximum extent permitted by law, CoreHealth will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, goodwill, or other intangible losses. Our aggregate liability shall not exceed the amount you paid (if any) in the 12 months preceding the claim.',
      'Indemnification. You agree to defend, indemnify, and hold harmless CoreHealth from claims arising out of your misuse of the Service or violation of these Terms.',
      'Governing Law & Venue (UK). For users located in the United Kingdom, these Terms and any non‑contractual obligations are governed by the laws of England and Wales. You and CoreHealth agree to the exclusive jurisdiction of the courts of England and Wales, without affecting any non‑waivable consumer rights to bring claims in your local courts.',
      'Dispute Resolution. Where permitted by law, disputes may be resolved through binding arbitration on an individual basis. Nothing in these Terms limits statutory rights under UK consumer law.',
      'Changes to Terms. We may update these Terms from time to time. Material changes will be notified in‑app or by email. Continued use after the effective date constitutes acceptance.',
      'Contact. For questions about these Terms, contact: legal@corehealth.com',
    ]}
  />
);

export default TermsScreen;
