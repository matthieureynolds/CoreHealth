import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import JetLagPlanningCard from "../jet-lag-planning/JetLagPlanningCard";
import type { JetLagPlanningEvent } from "@shared/types/jetlag";

jest.mock("@shared/context/SettingsContext", () => ({
  useSettings: () => ({ settings: { units: "metric" } }),
}));

const evt = (over: Partial<JetLagPlanningEvent> = {}): JetLagPlanningEvent =>
  ({
    id: "e1",
    destination: "Tokyo",
    destinationTimezone: "Asia/Tokyo",
    departureDate: "2026-09-01T09:00:00.000Z",
    returnDate: "2026-09-10T09:00:00.000Z",
    timeZoneDifference: 8,
    preparationStartDate: "2026-08-29T00:00:00.000Z",
    daysToAdjust: 3,
    status: "upcoming",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    sleepAdjustment: {
      dailySchedule: [
        { day: -3, bedtime: "22:30", wakeTime: "06:30" },
        { day: -2, bedtime: "21:30", wakeTime: "05:30" },
        { day: -1, bedtime: "20:30", wakeTime: "04:30" },
      ],
    },
    lightExposureSchedule: { dailySchedule: [] },
    ...over,
  }) as unknown as JetLagPlanningEvent;

describe("JetLagPlanningCard", () => {
  it("renders the destination", () => {
    render(<JetLagPlanningCard event={evt()} onPress={jest.fn()} />);
    expect(screen.getByText(/Tokyo/)).toBeTruthy();
  });

  it("shows the timezone shift", () => {
    render(<JetLagPlanningCard event={evt()} onPress={jest.fn()} />);
    expect(screen.getAllByText(/8/).length).toBeGreaterThan(0);
  });

  it("renders a westward trip", () => {
    expect(() =>
      render(
        <JetLagPlanningCard
          event={evt({ timeZoneDifference: -5 })}
          onPress={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it("renders each trip status", () => {
    for (const status of ["upcoming", "active", "completed"] as const) {
      expect(() =>
        render(
          <JetLagPlanningCard event={evt({ status })} onPress={jest.fn()} />,
        ),
      ).not.toThrow();
    }
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    render(<JetLagPlanningCard event={evt()} onPress={onPress} />);
    fireEvent.press(screen.getByText(/Tokyo/));
    expect(onPress).toHaveBeenCalled();
  });

  it("mentions when preparation should begin", () => {
    render(<JetLagPlanningCard event={evt()} onPress={jest.fn()} />);
    expect(screen.getAllByText(/adjust|prepar/i).length).toBeGreaterThan(0);
  });

  it("renders without an onPress handler", () => {
    expect(() => render(<JetLagPlanningCard event={evt()} />)).not.toThrow();
  });
});
