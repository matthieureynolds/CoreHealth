import React from "react";
import NotificationToggleScreen from "../components/NotificationToggleScreen";

const WeeklyHealthSummaryScreen: React.FC = () => (
  <NotificationToggleScreen
    headerTitle="Weekly Health Summary"
    storageKey="@notif_weekly_enabled"
    icon="trending-up-outline"
    iconColor="#3AABF0"
    title="Weekly Health Summary"
    subtitle="Get a weekly summary of your health progress and insights"
    infoIcon="calendar-outline"
    infoIconColor="#3AABF0"
    infoHeader="WHEN YOU'LL RECEIVE IT"
    infoText="Sent every Monday morning with your previous week's health highlights."
  />
);

export default WeeklyHealthSummaryScreen;
