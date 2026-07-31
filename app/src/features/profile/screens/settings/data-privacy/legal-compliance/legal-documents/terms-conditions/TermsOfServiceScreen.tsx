import React from "react";
import LegalDocTemplate from "../../LegalDocTemplate";

const TermsOfServiceScreen: React.FC = () => (
  <LegalDocTemplate
    title="Terms of Service"
    content={[
      "Last updated: December 2024",
      "",
      "1. Agreement to Terms",
      'By accessing and using TOTO ("the App"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the App.',
      "",
      "2. Medical Disclaimer",
      "TOTO is NOT a medical device and is not intended to diagnose, treat, cure, or prevent any disease. The App is designed for informational and tracking purposes only. Always consult with qualified healthcare professionals before making any medical decisions.",
      "",
      "3. User Responsibilities",
      "You agree to:\n• Provide accurate and complete health information\n• Keep your account credentials secure\n• Use the App in compliance with all applicable laws\n• Not share misleading or harmful health information\n• Not use the App for illegal or unauthorized purposes",
      "",
      "4. Health Data and Privacy",
      "Your health data is sensitive and important to us. We handle your personal health information in accordance with our Privacy Policy and applicable laws including HIPAA, GDPR, and CCPA. You retain ownership of your health data and can export or delete it at any time.",
      "",
      "5. Limitation of Liability",
      "TOTO and its developers shall not be liable for any damages arising from:\n• Use or inability to use the App\n• Medical decisions made based on App information\n• Data loss or security breaches beyond our control\n• Third-party integrations or services",
      "",
      "6. Emergency Situations",
      "TOTO is NOT designed for emergency medical situations. In case of a medical emergency, contact local emergency services (911, 112, etc.) immediately. Do not rely on the App for urgent medical needs.",
      "",
      "7. Data Accuracy",
      "While we strive to provide accurate health tracking features, you acknowledge that:\n• App measurements may have inherent limitations\n• Technology can have errors or malfunctions\n• You should verify important health data with medical professionals",
      "",
      "8. Account Termination",
      "We reserve the right to terminate or suspend your account if you violate these terms. You may also delete your account at any time through the App settings. Upon termination, your data will be handled according to our Privacy Policy.",
      "",
      "9. Third-Party Integrations",
      "TOTO may integrate with third-party health services (Apple Health, Google Fit, etc.). Your use of these services is subject to their respective terms and privacy policies. We are not responsible for third-party service policies or actions.",
      "",
      "10. Intellectual Property",
      "The App and its original content, features, and functionality are owned by TOTO and are protected by international copyright, trademark, and other intellectual property laws.",
      "",
      "11. Updates and Changes",
      "We reserve the right to modify these terms at any time. Material changes will be communicated through the App or email. Continued use after changes indicates your acceptance of the new terms.",
      "",
      "12. Governing Law",
      "These terms are governed by the laws of England and Wales. Any disputes will be resolved through binding arbitration in accordance with applicable rules.",
      "",
      "13. Contact Information",
      "For questions about these Terms of Service, please contact us at:\n\nEmail: legal@corehealth.app\nFor technical support: support@corehealth.app",
    ]}
  />
);

export default TermsOfServiceScreen;
