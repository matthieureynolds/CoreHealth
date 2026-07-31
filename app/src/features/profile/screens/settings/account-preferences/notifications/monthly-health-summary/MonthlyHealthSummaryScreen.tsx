import React from "react";
import NotificationToggleScreen from "../components/NotificationToggleScreen";

const MonthlyHealthSummaryScreen: React.FC = () => (
  <NotificationToggleScreen
    headerTitle="Monthly Health Summary"
    storageKey="@notif_monthly_enabled"
    icon="bar-chart-outline"
    iconColor="#34C759"
    title="Monthly Health Summary"
    subtitle="Receive a monthly overview of your health trends, insights, and progress"
    infoIcon="calendar-outline"
    infoIconColor="#34C759"
    infoHeader="WHEN YOU'LL RECEIVE IT"
    infoText="Sent on the 1st of each month with your previous month's health overview."
  />
);

export default MonthlyHealthSummaryScreen;
