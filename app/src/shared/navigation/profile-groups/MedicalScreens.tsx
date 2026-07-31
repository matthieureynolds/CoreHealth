import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ProfileTabParamList } from "../../types";

import ConditionsScreen from "@features/profile/screens/profile/health-records/conditions/ConditionsScreen";
import MedicationsScreen from "@features/profile/screens/profile/health-records/medications/MedicationsScreen";
import AllergiesScreen from "@features/profile/screens/profile/health-records/allergies/AllergiesScreen";
import FamilyHistoryScreen from "@features/profile/screens/profile/health-records/family-history/FamilyHistoryScreen";
import VaccinationsScreen from "@features/profile/screens/profile/health-records/vaccinations/VaccinationsScreen";
import ScreeningsScreen from "@features/profile/screens/profile/health-records/screenings/ScreeningsScreen";
import UploadMedicalRecordScreen from "@features/profile/screens/profile/record-management/view-medical-records/UploadMedicalRecordScreen";
import ViewMedicalRecordsScreen from "@features/profile/screens/profile/record-management/view-medical-records/ViewMedicalRecordsScreen";
import PastAppointmentsScreen from "@features/profile/screens/profile/health-records/past-appointments/PastAppointmentsScreen";
import GenerateHealthReportScreen from "@features/profile/screens/profile/record-management/generate-health-report/GenerateHealthReportScreen";
import ShareWithDoctorScreen from "@features/profile/screens/profile/record-management/share-with-doctor/ShareWithDoctorScreen";
import EmergencyContactsScreen from "@features/profile/screens/profile/emergency-info/emergency-contacts/EmergencyContactsScreen";
import PrimaryDoctorScreen from "@features/profile/screens/profile/emergency-info/doctors/PrimaryDoctorScreen";

type StackType = ReturnType<typeof createStackNavigator<ProfileTabParamList>>;

export const MedicalScreens = (Stack: StackType) => (
  <>
    <Stack.Screen
      name="Conditions"
      component={ConditionsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Medications"
      component={MedicationsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Allergies"
      component={AllergiesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="FamilyHistory"
      component={FamilyHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Vaccinations"
      component={VaccinationsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Screenings"
      component={ScreeningsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UploadMedicalRecord"
      component={UploadMedicalRecordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ViewMedicalRecords"
      component={ViewMedicalRecordsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PastAppointments"
      component={PastAppointmentsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GenerateHealthReport"
      component={GenerateHealthReportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ShareWithDoctor"
      component={ShareWithDoctorScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EmergencyContacts"
      component={EmergencyContactsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PrimaryDoctor"
      component={PrimaryDoctorScreen}
      options={{ headerShown: false }}
    />
  </>
);
