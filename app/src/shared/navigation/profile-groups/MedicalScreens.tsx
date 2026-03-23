import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import ConditionsScreen from '../../../features/profile/screens/profile/health-records/ConditionsScreen';
import MedicationsScreen from '../../../features/profile/screens/profile/health-records/MedicationsScreen';
import AllergiesScreen from '../../../features/profile/screens/profile/health-records/AllergiesScreen';
import FamilyHistoryScreen from '../../../features/profile/screens/profile/health-records/FamilyHistoryScreen';
import VaccinationsScreen from '../../../features/profile/screens/profile/health-records/VaccinationsScreen';
import ScreeningsScreen from '../../../features/profile/screens/profile/health-records/ScreeningsScreen';
import UploadMedicalRecordScreen from '../../../features/profile/screens/profile/record-management/UploadMedicalRecordScreen';
import ViewMedicalRecordsScreen from '../../../features/profile/screens/profile/record-management/ViewMedicalRecordsScreen';
import PastAppointmentsScreen from '../../../features/profile/screens/profile/health-records/PastAppointmentsScreen';
import GenerateHealthReportScreen from '../../../features/profile/screens/profile/record-management/GenerateHealthReportScreen';
import ShareWithDoctorScreen from '../../../features/profile/screens/profile/record-management/ShareWithDoctorScreen';
import MedicalHistoryScreen from '../../../features/profile/screens/profile/health-records/MedicalHistoryScreen';
import EmergencyContactsScreen from '../../../features/profile/screens/profile/emergency-info/EmergencyContactsScreen';
import PrimaryDoctorScreen from '../../../features/profile/screens/profile/emergency-info/PrimaryDoctorScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const MedicalScreens = (Stack: StackType) => (
  <>
    <Stack.Screen name="Conditions" component={ConditionsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Medications" component={MedicationsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Allergies" component={AllergiesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FamilyHistory" component={FamilyHistoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Vaccinations" component={VaccinationsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Screenings" component={ScreeningsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="UploadMedicalRecord" component={UploadMedicalRecordScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ViewMedicalRecords" component={ViewMedicalRecordsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PastAppointments" component={PastAppointmentsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="GenerateHealthReport" component={GenerateHealthReportScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ShareWithDoctor" component={ShareWithDoctorScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MedicalHistory" component={MedicalHistoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PrimaryDoctor" component={PrimaryDoctorScreen} options={{ headerShown: false }} />
  </>
);
