import type { Trip } from "./screens/travel-search/hooks/trip";

// Mock trips for testing the travel UI with realistic, real-world flights.
// Seeded into AsyncStorage on first load when no trips exist (see useTravelState).
// Dates are relative to "now" so the trips always sit in the near future.
const daysFromNow = (days: number, hours = 9, minutes = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const defaultChecklist = () => ({
  vaccines: [
    { name: "COVID-19", completed: true },
    { name: "Hepatitis A", completed: false },
    { name: "Typhoid", completed: false },
  ],
  medicines: [
    { name: "Pain relievers", completed: false },
    { name: "Anti-diarrheal", completed: false },
    { name: "Motion sickness", completed: false },
  ],
});

export const MOCK_TRIPS: Trip[] = [
  // ── Paris → Tokyo (direct) — Air France AF274, CDG → Haneda ──
  {
    id: "mock-paris-tokyo",
    departureLocation: "Paris, France",
    destination: "Tokyo, Japan",
    departureDate: daysFromNow(25, 13, 40),
    returnDate: daysFromNow(38, 11, 30),
    timezone: "Asia/Tokyo",
    notes: "Air France AF274 · Paris CDG → Tokyo Haneda (HND), direct",
    checklist: defaultChecklist(),
    jetLagPlanner: {
      departureTime: "13:40",
      arrivalTime: "09:15",
      outboundPlan: {
        direction: "outbound",
        timezoneAdjustment: "+7",
        circadianPlan: [
          {
            day: -3,
            action: "Start shifting earlier",
            time: "Go to bed 1 hour earlier",
          },
          {
            day: -2,
            action: "Continue adjustment",
            time: "Go to bed 2 hours earlier",
          },
          {
            day: -1,
            action: "Final adjustment",
            time: "Go to bed 3 hours earlier",
          },
          {
            day: 0,
            action: "Travel day",
            time: "Sleep on the second half of the flight",
          },
          {
            day: 1,
            action: "First day in Tokyo",
            time: "Get morning sunlight, follow local meals",
          },
          {
            day: 2,
            action: "Continue adaptation",
            time: "Avoid naps after 15:00",
          },
          { day: 3, action: "Adjusted", time: "Normal local schedule" },
        ],
      },
      returnPlan: {
        direction: "return",
        timezoneAdjustment: "-7",
        circadianPlan: [
          {
            day: -3,
            action: "Start shifting later",
            time: "Go to bed 1 hour later",
          },
          {
            day: -2,
            action: "Continue adjustment",
            time: "Go to bed 2 hours later",
          },
          {
            day: -1,
            action: "Final adjustment",
            time: "Go to bed 3 hours later",
          },
          {
            day: 0,
            action: "Return travel day",
            time: "Stay awake until Paris bedtime",
          },
          {
            day: 1,
            action: "First day back",
            time: "Morning sunlight in Paris",
          },
          { day: 2, action: "Continue adaptation", time: "Gradual adjustment" },
          { day: 3, action: "Adjusted", time: "Normal schedule" },
        ],
      },
    },
  },

  // ── London → Hong Kong (connecting via Helsinki) — Finnair AY1332 + AY101 ──
  {
    id: "mock-london-hongkong",
    departureLocation: "London, UK",
    destination: "Hong Kong",
    departureDate: daysFromNow(52, 7, 55),
    returnDate: daysFromNow(66, 12, 5),
    timezone: "Asia/Hong_Kong",
    isSequential: true,
    notes:
      "Connecting via Helsinki · Finnair AY1332 London Heathrow → Helsinki (HEL), then AY101 Helsinki → Hong Kong (HKG)",
    checklist: defaultChecklist(),
    jetLagPlanner: {
      departureTime: "07:55",
      arrivalTime: "08:30",
      outboundPlan: {
        direction: "outbound",
        timezoneAdjustment: "+7",
        circadianPlan: [
          {
            day: -3,
            action: "Start shifting earlier",
            time: "Go to bed 1 hour earlier",
          },
          {
            day: -2,
            action: "Continue adjustment",
            time: "Go to bed 2 hours earlier",
          },
          {
            day: -1,
            action: "Final adjustment",
            time: "Go to bed 3 hours earlier",
          },
          {
            day: 0,
            action: "Travel day",
            time: "Layover in Helsinki — stay active, light meal",
          },
          {
            day: 1,
            action: "First day in Hong Kong",
            time: "Morning sunlight, follow local meals",
          },
          {
            day: 2,
            action: "Continue adaptation",
            time: "Avoid naps after 15:00",
          },
          { day: 3, action: "Adjusted", time: "Normal local schedule" },
        ],
      },
      returnPlan: {
        direction: "return",
        timezoneAdjustment: "-7",
        circadianPlan: [
          {
            day: -3,
            action: "Start shifting later",
            time: "Go to bed 1 hour later",
          },
          {
            day: -2,
            action: "Continue adjustment",
            time: "Go to bed 2 hours later",
          },
          {
            day: -1,
            action: "Final adjustment",
            time: "Go to bed 3 hours later",
          },
          {
            day: 0,
            action: "Return travel day",
            time: "Stay awake until London bedtime",
          },
          {
            day: 1,
            action: "First day back",
            time: "Morning sunlight in London",
          },
          { day: 2, action: "Continue adaptation", time: "Gradual adjustment" },
          { day: 3, action: "Adjusted", time: "Normal schedule" },
        ],
      },
    },
  },
];
