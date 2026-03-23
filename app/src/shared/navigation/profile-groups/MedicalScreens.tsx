import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

import ConditionsScreen from '../../../features/profile/screens/ConditionsScreen';
import MedicationsScreen from '../../../features/profile/screens/MedicationsScreen';
import AllergiesScreen from '../../../features/profile/screens/AllergiesScreen';
import FamilyHistoryScreen from '../../../features/profile/screens/FamilyHistoryScreen';
import VaccinationsScreen from '../../../features/profile/screens/VaccinationsScreen';
import ScreeningsScreen from '../../../features/profile/screens/ScreeningsScreen';
import UploadMedicalRecordScreen from '../../../features/profile/screens/UploadMedicalRecordScreen';
import ViewMedicalRecordsScreen from '../../../features/profile/screens/ViewMedicalRecordsScreen';
import PastAppointmentsScreen from '../../../features/profile/screens/PastAppointmentsScreen';
import GenerateHealthReportScreen from '../../../features/profile/screens/GenerateHealthReportScreen';
import ShareWithDoctorScreen from '../../../features/profile/screens/ShareWithDoctorScreen';
import MedicalHistoryScreen from '../../../features/profile/screens/MedicalHistoryScreen';
import EmergencyContactsScreen from '../../../features/profile/screens/EmergencyContactsScreen';
import PrimaryDoctorScreen from '../../../features/profile/screens/PrimaryDoctorScreen';

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const MedicalScreens: React.FC<{ Stack: StackType }> = ({ Stack }) => (
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
