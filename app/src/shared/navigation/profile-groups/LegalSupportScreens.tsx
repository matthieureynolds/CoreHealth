import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import HelpSupportScreen from '../../../features/profile/screens/settings/support-help/support/HelpSupportScreen';
import SupportHelpScreen from '../../../features/profile/screens/settings/support-help/support/SupportHelpScreen';
import FAQScreen from '../../../features/profile/screens/settings/support-help/support/FAQScreen';
import AppInfoScreen from '../../../features/profile/screens/settings/support-help/app-info/app-information/AppInfoScreen';
import AboutScreen from '../../../features/profile/screens/settings/support-help/app-info/about/AboutScreen';
import LegalComplianceScreen from '../../../features/profile/screens/settings/data-privacy/legal-compliance/LegalComplianceScreen';
import TermsOfServiceScreen from '../../../features/profile/screens/settings/data-privacy/legal-compliance/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../../../features/profile/screens/settings/data-privacy/legal-compliance/PrivacyPolicyScreen';
import ConsentFormsScreen from '../../../features/profile/screens/settings/data-privacy/legal-compliance/ConsentFormsScreen';
import ComplianceNoticesScreen from '../../../features/profile/screens/settings/data-privacy/legal-compliance/ComplianceNoticesScreen';
import DataProcessingAgreementScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/DataProcessingAgreementScreen';
import DataRetentionPolicyScreen from '../../../features/profile/screens/settings/data-privacy/privacy-security/DataRetentionPolicyScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const LegalSupportScreens = (Stack: StackType) => (
  <>
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
    <Stack.Screen name="SupportHelp" component={SupportHelpScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FAQ" component={FAQScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AppInfo" component={AppInfoScreen} options={{ headerShown: false }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About CoreHealth' }} />
    <Stack.Screen name="LegalCompliance" component={LegalComplianceScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ConsentForms" component={ConsentFormsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ComplianceNotices" component={ComplianceNoticesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DataProcessingAgreement" component={DataProcessingAgreementScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DataRetentionPolicy" component={DataRetentionPolicyScreen} options={{ headerShown: false }} />
  </>
);
