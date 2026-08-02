/**
 * Pure rules for creating and editing a trip.
 *
 * Kept free of react-native imports so the node test suite can load it —
 * useTripHandlers pulls in Alert and Animated, which is why these two lived
 * there untested despite being the only real decision logic in the flow.
 */

/** Default circadian plan applied to a manually-entered trip. */
export const buildJetLagPlanner = (returnDate?: Date) => ({
  departureTime: "09:00",
  arrivalTime: "15:00",
  outboundPlan: {
    direction: "outbound" as const,
    timezoneAdjustment: "+9",
    circadianPlan: [
      {
        day: -3,
        action: "Start adjusting sleep schedule",
        time: "Go to bed 1.5 hours earlier each day",
      },
      {
        day: -2,
        action: "Continue adjustment",
        time: "Go to bed 3 hours earlier",
      },
      {
        day: -1,
        action: "Final adjustment",
        time: "Go to bed 4.5 hours earlier",
      },
      { day: 0, action: "Travel day", time: "Stay awake until local bedtime" },
      {
        day: 1,
        action: "First day at destination",
        time: "Follow local schedule",
      },
      { day: 2, action: "Continue adjustment", time: "Gradual adaptation" },
      { day: 3, action: "Normal schedule", time: "Regular sleep time" },
    ],
  },
  returnPlan: returnDate
    ? {
        direction: "return" as const,
        timezoneAdjustment: "-9",
        circadianPlan: [
          {
            day: -3,
            action: "Start adjusting sleep schedule",
            time: "Go to bed 1.5 hours later each day",
          },
          {
            day: -2,
            action: "Continue adjustment",
            time: "Go to bed 3 hours later",
          },
          {
            day: -1,
            action: "Final adjustment",
            time: "Go to bed 4.5 hours later",
          },
          {
            day: 0,
            action: "Return travel day",
            time: "Stay awake until local bedtime",
          },
          {
            day: 1,
            action: "First day back home",
            time: "Follow local schedule",
          },
          { day: 2, action: "Continue adjustment", time: "Gradual adaptation" },
          { day: 3, action: "Normal schedule", time: "Regular sleep time" },
        ],
      }
    : undefined,
});

/**
 * Shared trip-form validation for both the add and edit flows.
 * Returns a user-facing error message, or null when the trip is valid.
 */
export function validateTrip(opts: {
  departureLocation: string;
  destination: string;
  departureDate?: Date;
  returnDate?: Date;
}): string | null {
  if (!opts.departureLocation.trim())
    return "Please enter a departure location";
  if (!opts.destination.trim()) return "Please enter a destination";
  if (!opts.departureDate) return "Please select a departure date";
  if (opts.returnDate && opts.returnDate < opts.departureDate) {
    return "Return date must be after departure date";
  }
  return null;
}
