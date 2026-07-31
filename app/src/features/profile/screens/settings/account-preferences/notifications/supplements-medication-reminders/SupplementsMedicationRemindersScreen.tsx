import React from "react";
import NotificationReminderScreen from "../components/NotificationReminderScreen";

const SupplementsMedicationRemindersScreen: React.FC = () => (
  <NotificationReminderScreen
    headerTitle="Medication Reminders"
    enabledStorageKey="@notif_med_enabled"
    alertsStorageKey="@notif_med_alerts"
    defaultAlert="30 minutes before"
    icon="medical-outline"
    iconColor="#FF9500"
    title="Supplement & Medication Reminders"
    subtitle="Get notified when it's time to take your supplements or medications"
  />
);

export default SupplementsMedicationRemindersScreen;
