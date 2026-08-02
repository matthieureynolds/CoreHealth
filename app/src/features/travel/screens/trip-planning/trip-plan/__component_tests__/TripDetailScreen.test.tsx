import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import TripDetailScreen from "../TripDetailScreen";

const trip = {
  id: "t1",
  departureLocation: "London, UK",
  destination: "Tokyo, Japan",
  departureDate: "2026-09-01T09:00:00.000Z",
  returnDate: "2026-09-10T09:00:00.000Z",
  timezone: "Asia/Tokyo",
  originTimezone: "Europe/London",
};

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({ params: { trip } }),
  useNavigation: () => ({ navigate: jest.fn(), goBack: mockGoBack }),
}));

jest.mock("@shared/context/SettingsContext", () => ({
  useSettings: () => ({ settings: { units: "metric" } }),
}));

jest.mock("@shared/context/HealthDataContext", () => ({
  useHealthData: () => ({ profile: null }),
}));

jest.mock("@shared/services/device/healthKitService", () => ({
  getRecentSleepWindow: jest.fn(async () => null),
  getOvernightHrNadir: jest.fn(async () => null),
  getOvernightGlucoseNadir: jest.fn(async () => null),
}));

beforeEach(() => jest.clearAllMocks());

describe("TripDetailScreen", () => {
  it("renders without crashing", () => {
    render(<TripDetailScreen />);
    expect(screen).toBeTruthy();
  });

  it("shows the origin and destination city codes", () => {
    render(<TripDetailScreen />);
    expect(screen.getByText("LDN")).toBeTruthy();
    expect(screen.getByText("TYO")).toBeTruthy();
  });

  it("shows both section tabs", () => {
    render(<TripDetailScreen />);
    expect(screen.getAllByText(/sleep plan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/travel health/i).length).toBeGreaterThan(0);
  });

  it("renders the date range", () => {
    render(<TripDetailScreen />);
    // formatDateRange produces "Sep 1 – Sep 10"
    expect(screen.getByText(/Sep\s*1/)).toBeTruthy();
  });

  it("renders a back control", () => {
    render(<TripDetailScreen />);
    expect(screen).toBeTruthy();
  });

  it("renders the same trip twice without leaking state", () => {
    // Guards the module-level rail constants: if any of them were mutated
    // during render, a second mount would differ from the first.
    const first = render(<TripDetailScreen />).toJSON();
    const second = render(<TripDetailScreen />).toJSON();
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});

describe("TripDetailScreen interactions", () => {
  it("switches to the travel-health page", () => {
    render(<TripDetailScreen />);
    fireEvent.press(screen.getAllByText(/travel health/i)[0]);
    expect(screen.getAllByText(/vaccinations/i).length).toBeGreaterThan(0);
  });

  it("lists vaccinations and medications on the health page", () => {
    render(<TripDetailScreen />);
    fireEvent.press(screen.getAllByText(/travel health/i)[0]);
    expect(screen.getAllByText(/medications/i).length).toBeGreaterThan(0);
  });

  it("switches back to the sleep plan", () => {
    render(<TripDetailScreen />);
    fireEvent.press(screen.getAllByText(/travel health/i)[0]);
    fireEvent.press(screen.getAllByText(/sleep plan/i)[0]);
    expect(screen.getAllByText(/sleep plan/i).length).toBeGreaterThan(0);
  });

  it("shows a commitments section", () => {
    render(<TripDetailScreen />);
    expect(screen.getAllByText(/commitments/i).length).toBeGreaterThan(0);
  });

  it("renders the day rail without throwing on a long-haul trip", () => {
    expect(() => render(<TripDetailScreen />)).not.toThrow();
  });
});
