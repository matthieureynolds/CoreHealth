import React from "react";
import NotificationReminderScreen from "../components/NotificationReminderScreen";

const MedicalAppointmentScreen: React.FC = () => (
  <NotificationReminderScreen
    headerTitle="Medical Appointments"
    enabledStorageKey="@notif_appt_enabled"
    alertsStorageKey="@notif_appt_alerts"
    defaultAlert="1 hour before"
    icon="calendar-outline"
    iconColor="#AF52DE"
    title="Medical Appointments"
    subtitle="Get reminded about upcoming medical appointments and health tests"
  />
);

export default MedicalAppointmentScreen;
