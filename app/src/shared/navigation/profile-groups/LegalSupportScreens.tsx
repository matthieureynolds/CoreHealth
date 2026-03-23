import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import HelpSupportScreen from '../../../features/profile/screens/settings/support-help/HelpSupportScreen';
import SupportHelpScreen from '../../../features/profile/screens/settings/support-help/SupportHelpScreen';
import FAQScreen from '../../../features/profile/screens/settings/support-help/FAQScreen';
import AppInfoScreen from '../../../features/profile/screens/settings/support-help/AppInfoScreen';
import LegalComplianceScreen from '../../../features/profile/screens/settings/support-help/LegalComplianceScreen';
import TermsOfServiceScreen from '../../../features/profile/screens/settings/support-help/legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../../../features/profile/screens/settings/support-help/legal/PrivacyPolicyScreen';
import ConsentFormsScreen from '../../../features/profile/screens/settings/support-help/legal/ConsentFormsScreen';
import ComplianceNoticesScreen from '../../../features/profile/screens/settings/support-help/legal/ComplianceNoticesScreen';
import DataProcessingAgreementScreen from '../../../features/profile/screens/settings/data-privacy/DataProcessingAgreementScreen';
import DataRetentionPolicyScreen from '../../../features/profile/screens/settings/data-privacy/DataRetentionPolicyScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const LegalSupportScreens = (Stack: StackType) => (
  <>
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
    <Stack.Screen name="SupportHelp" component={SupportHelpScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FAQ" component={FAQScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AppInfo" component={AppInfoScreen} options={{ headerShown: false }} />
    <Stack.Screen name="About" component={AppInfoScreen} options={{ title: 'About CoreHealth' }} />
    <Stack.Screen name="LegalCompliance" component={LegalComplianceScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ConsentForms" component={ConsentFormsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ComplianceNotices" component={ComplianceNoticesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DataProcessingAgreement" component={DataProcessingAgreementScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DataRetentionPolicy" component={DataRetentionPolicyScreen} options={{ headerShown: false }} />
  </>
);
