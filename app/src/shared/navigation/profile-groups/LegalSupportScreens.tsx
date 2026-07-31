import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ProfileTabParamList } from "../../types";

import HelpSupportScreen from "@features/profile/screens/settings/support-help/support/contact-support/HelpSupportScreen";
import SupportHelpScreen from "@features/profile/screens/settings/support-help/support/SupportHelpScreen";
import FAQScreen from "@features/profile/screens/settings/support-help/support/faqs/FAQScreen";
import AppInfoScreen from "@features/profile/screens/settings/support-help/app-info/app-information/AppInfoScreen";
import AboutScreen from "@features/profile/screens/settings/support-help/app-info/about/AboutScreen";

// Legal Compliance — hub
import LegalComplianceScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/LegalComplianceScreen";

// Legal Documents
import TermsOfServiceScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/legal-documents/terms-conditions/TermsOfServiceScreen";
import PrivacyPolicyScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/legal-documents/privacy-policy/PrivacyPolicyScreen";
import ConsentFormsScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/legal-documents/consent-forms/ConsentFormsScreen";
import ComplianceNoticesScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/legal-documents/hipaa-gdpr-notices/ComplianceNoticesScreen";

// Compliance & Requests
import DataProcessingAgreementScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/compliance-requests/data-processing-agreement/DataProcessingAgreementScreen";
import DataRetentionPolicyScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/compliance-requests/data-retention-policy/DataRetentionPolicyScreen";
import ContactLegalTeamScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/compliance-requests/contact-legal-team/ContactLegalTeamScreen";
import RequestDataScreen from "@features/profile/screens/settings/data-privacy/legal-compliance/compliance-requests/request-data/RequestDataScreen";

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const LegalSupportScreens = (Stack: StackType) => (
  <>
    {/* Support & Help */}
    <Stack.Screen
      name="HelpSupport"
      component={HelpSupportScreen}
      options={{ headerShown: true, title: "Help & Support" }}
    />
    <Stack.Screen
      name="SupportHelp"
      component={SupportHelpScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="FAQ"
      component={FAQScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AppInfo"
      component={AppInfoScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="About"
      component={AboutScreen}
      options={{ headerShown: true, title: "About TOTO" }}
    />

    {/* Legal Compliance — hub */}
    <Stack.Screen
      name="LegalCompliance"
      component={LegalComplianceScreen}
      options={{ headerShown: false }}
    />

    {/* Legal Documents */}
    <Stack.Screen
      name="TermsOfService"
      component={TermsOfServiceScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PrivacyPolicy"
      component={PrivacyPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ConsentForms"
      component={ConsentFormsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ComplianceNotices"
      component={ComplianceNoticesScreen}
      options={{ headerShown: false }}
    />

    {/* Compliance & Requests */}
    <Stack.Screen
      name="DataProcessingAgreement"
      component={DataProcessingAgreementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DataRetentionPolicy"
      component={DataRetentionPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ContactLegalTeam"
      component={ContactLegalTeamScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RequestData"
      component={RequestDataScreen}
      options={{ headerShown: false }}
    />
  </>
);
