import { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";

interface BedtimeReminderState {
  showModal: boolean;
  type: "bedtime" | "bedtime_soon" | null;
  bedtime: string;
}

export const useBedtimeReminder = (): BedtimeReminderState => {
  const { settings } = useSettings();
  const [reminderState, setReminderState] = useState<BedtimeReminderState>({
    showModal: false,
    type: null,
    bedtime: settings.lifestyle.sleepSchedule.bedTime,
  });

  useEffect(() => {
    const checkBedtime = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // Parse bedtime from settings
      const [bedtimeHours, bedtimeMinutes] =
        settings.lifestyle.sleepSchedule.bedTime.split(":").map(Number);
      const bedtimeInMinutes = bedtimeHours * 60 + bedtimeMinutes;

      // Calculate 30 minutes before bedtime
      const bedtimeSoonInMinutes = bedtimeInMinutes - 30;

      // Handle bedtime soon (30 minutes before)
      if (
        currentTime >= bedtimeSoonInMinutes &&
        currentTime < bedtimeInMinutes
      ) {
        setReminderState({
          showModal: true,
          type: "bedtime_soon",
          bedtime: settings.lifestyle.sleepSchedule.bedTime,
        });
        return;
      }

      // Handle past bedtime (considering day rollover)
      const isPastBedtime = currentTime >= bedtimeInMinutes || currentTime < 6; // 6 AM as cutoff

      if (isPastBedtime) {
        setReminderState({
          showModal: true,
          type: "bedtime",
          bedtime: settings.lifestyle.sleepSchedule.bedTime,
        });
        return;
      }

      // No reminder needed
      setReminderState({
        showModal: false,
        type: null,
        bedtime: settings.lifestyle.sleepSchedule.bedTime,
      });
    };

    // Check immediately
    checkBedtime();

    // Check every minute
    const interval = setInterval(checkBedtime, 60000);

    return () => clearInterval(interval);
  }, [settings.lifestyle.sleepSchedule.bedTime]);

  return reminderState;
};
