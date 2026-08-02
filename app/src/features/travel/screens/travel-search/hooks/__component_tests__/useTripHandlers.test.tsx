import { Alert } from "react-native";
import { Animated } from "react-native";
import { createTripHandlers } from "../useTripHandlers";
import type { Trip } from "../trip";
import type { FlightOption } from "@shared/types";

jest.mock("@shared/services/data/apiClient", () => ({
  api: { post: jest.fn(async () => ({})) },
}));

jest.mock("@shared/services/jetlag-brain/enhancedJetLagService", () => ({
  FlightLookupService: { lookupFlight: jest.fn() },
}));

const {
  FlightLookupService,
} = require("@shared/services/jetlag-brain/enhancedJetLagService");
const { api } = require("@shared/services/data/apiClient");

const flight = (over: Partial<FlightOption> = {}): FlightOption =>
  ({
    carrier: "BA",
    number: "5",
    origin_iata: "LHR",
    dest_iata: "HND",
    origin_city: "London",
    dest_city: "Tokyo",
    origin_tz: "Europe/London",
    dest_tz: "Asia/Tokyo",
    dep_local: "2026-09-01T09:00:00",
    arr_local: "2026-09-02T05:00:00",
    ...over,
  }) as FlightOption;

/** Builds the params bag with jest.fn()s, overridable per test. */
function makeParams(over: Record<string, unknown> = {}) {
  const setters = [
    "setTrips",
    "setNewTripDepartureLocation",
    "setNewTripDestination",
    "setNewTripDepartureDate",
    "setNewTripReturnDate",
    "setShowAddTripModal",
    "setTripSuggestions",
    "setDepartureSuggestions",
    "setFlightCarrier",
    "setFlightNumber",
    "setDetectedAirline",
    "setFlightSegments",
    "setFlightDetailsExpanded",
    "setFlightSuggestions",
    "setFlightLookupResult",
    "setIsLookingUpFlight",
    "setFlightNotFound",
    "setShowManualEntry",
    "setEditingTrip",
    "setEditTripDepartureLocation",
    "setEditTripDestination",
    "setEditTripDepartureDate",
    "setEditTripReturnDate",
    "setEditTripNotes",
    "setShowEditTripModal",
    "setEditTripSuggestions",
    "setEditTripDepartureSuggestions",
  ].reduce<Record<string, jest.Mock>>((acc, k) => {
    acc[k] = jest.fn();
    return acc;
  }, {});

  return {
    flightCarrier: "BA",
    flightNumber: "5",
    flightLookupResult: null,
    flightSegments: [],
    newTripDepartureDate: new Date("2026-09-01T09:00:00Z"),
    newTripReturnDate: undefined,
    newTripDepartureLocation: "London",
    newTripDestination: "Tokyo",
    editingTrip: null,
    editTripDepartureLocation: "London",
    editTripDestination: "Tokyo",
    editTripDepartureDate: new Date("2026-09-01T09:00:00Z"),
    editTripReturnDate: undefined,
    editTripNotes: "",
    tripModalTranslateY: new Animated.Value(0),
    ...setters,
    ...over,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  jest.clearAllMocks();
  alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => alertSpy.mockRestore());

describe("handleAddTrip", () => {
  it("adds a valid trip", () => {
    const p = makeParams();
    createTripHandlers(p).handleAddTrip();
    expect(p.setTrips).toHaveBeenCalled();
    const updater = p.setTrips.mock.calls[0][0];
    const next = updater([]) as Trip[];
    expect(next).toHaveLength(1);
    expect(next[0].destination).toBe("Tokyo");
  });

  it("resolves real IANA timezones from the city names", () => {
    const p = makeParams();
    createTripHandlers(p).handleAddTrip();
    const next = p.setTrips.mock.calls[0][0]([]) as Trip[];
    expect(next[0].timezone).toBe("Asia/Tokyo");
    expect(next[0].originTimezone).toBe("Europe/London");
  });

  it("falls back to UTC for an unknown destination", () => {
    const p = makeParams({ newTripDestination: "Zzzyzx" });
    createTripHandlers(p).handleAddTrip();
    const next = p.setTrips.mock.calls[0][0]([]) as Trip[];
    expect(next[0].timezone).toBe("UTC");
  });

  it("rejects a trip with no destination and does not add it", () => {
    const p = makeParams({ newTripDestination: "" });
    createTripHandlers(p).handleAddTrip();
    expect(p.setTrips).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      "Error",
      "Please enter a destination",
    );
  });

  it("rejects a return date before departure", () => {
    const p = makeParams({
      newTripReturnDate: new Date("2026-08-01T00:00:00Z"),
    });
    createTripHandlers(p).handleAddTrip();
    expect(p.setTrips).not.toHaveBeenCalled();
  });

  it("attaches a default checklist and jet-lag plan", () => {
    const p = makeParams();
    createTripHandlers(p).handleAddTrip();
    const next = p.setTrips.mock.calls[0][0]([]) as Trip[];
    expect(next[0].checklist?.vaccines.length).toBeGreaterThan(0);
    expect(next[0].jetLagPlanner?.outboundPlan).toBeDefined();
  });

  it("clears the form and closes the modal", () => {
    const p = makeParams();
    createTripHandlers(p).handleAddTrip();
    expect(p.setNewTripDestination).toHaveBeenCalledWith("");
    expect(p.setShowAddTripModal).toHaveBeenCalledWith(false);
  });

  it("syncs the new trip to the backend", async () => {
    const p = makeParams();
    createTripHandlers(p).handleAddTrip();
    await new Promise((r) => setTimeout(r, 0));
    expect(api.post).toHaveBeenCalled();
    expect(api.post.mock.calls[0][0]).toMatch(/\/users\/.+\/trips/);
  });
});

describe("handleConfirmFlightTrip", () => {
  it("does nothing with no flights", () => {
    const p = makeParams({ flightLookupResult: null, flightSegments: [] });
    createTripHandlers(p).handleConfirmFlightTrip();
    expect(p.setTrips).not.toHaveBeenCalled();
  });

  it("builds a trip from a single flight", () => {
    const p = makeParams({ flightLookupResult: flight() });
    createTripHandlers(p).handleConfirmFlightTrip();
    const next = p.setTrips.mock.calls[0][0]([]) as Trip[];
    expect(next[0].departureLocation).toBe("London");
    expect(next[0].destination).toBe("Tokyo");
    expect(next[0].timezone).toBe("Asia/Tokyo");
  });

  it("derives layovers between consecutive segments", () => {
    const leg1 = flight({
      dest_iata: "DXB",
      dest_city: "Dubai",
      dest_tz: "Asia/Dubai",
    });
    const leg2 = flight({ origin_iata: "DXB", origin_city: "Dubai" });
    const p = makeParams({ flightSegments: [leg1], flightLookupResult: leg2 });
    createTripHandlers(p).handleConfirmFlightTrip();
    const next = p.setTrips.mock.calls[0][0]([]) as Trip[];
    expect(next[0].layovers).toHaveLength(1);
    expect(next[0].layovers?.[0].city).toBe("Dubai");
  });

  it("leaves layovers undefined for a direct flight", () => {
    const p = makeParams({ flightLookupResult: flight() });
    createTripHandlers(p).handleConfirmFlightTrip();
    const next = p.setTrips.mock.calls[0][0]([]) as Trip[];
    expect(next[0].layovers).toBeUndefined();
  });

  it("falls back to the IATA code when no city name is supplied", () => {
    const p = makeParams({
      flightLookupResult: flight({
        origin_city: undefined,
        dest_city: undefined,
      }),
    });
    createTripHandlers(p).handleConfirmFlightTrip();
    const next = p.setTrips.mock.calls[0][0]([]) as Trip[];
    expect(next[0].departureLocation).toBe("LHR");
    expect(next[0].destination).toBe("HND");
  });

  it("resets both the flight entry and the trip form", () => {
    const p = makeParams({ flightLookupResult: flight() });
    createTripHandlers(p).handleConfirmFlightTrip();
    expect(p.setFlightCarrier).toHaveBeenCalledWith("");
    expect(p.setNewTripDestination).toHaveBeenCalledWith("");
  });
});

describe("handleFlightLookup", () => {
  it("requires both carrier and number", async () => {
    const p = makeParams({ flightNumber: "" });
    await createTripHandlers(p).handleFlightLookup();
    expect(FlightLookupService.lookupFlight).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });

  it("stores a found flight", async () => {
    FlightLookupService.lookupFlight.mockResolvedValueOnce(flight());
    const p = makeParams();
    await createTripHandlers(p).handleFlightLookup();
    expect(p.setFlightLookupResult).toHaveBeenCalled();
    expect(p.setFlightNotFound).toHaveBeenLastCalledWith(false);
  });

  it("flags not-found when the lookup returns nothing", async () => {
    FlightLookupService.lookupFlight.mockResolvedValueOnce(null);
    const p = makeParams();
    await createTripHandlers(p).handleFlightLookup();
    expect(p.setFlightNotFound).toHaveBeenLastCalledWith(true);
  });

  it("flags not-found when the lookup throws", async () => {
    FlightLookupService.lookupFlight.mockRejectedValueOnce(new Error("down"));
    const p = makeParams();
    await createTripHandlers(p).handleFlightLookup();
    expect(p.setFlightNotFound).toHaveBeenLastCalledWith(true);
  });

  it("always clears the loading flag", async () => {
    FlightLookupService.lookupFlight.mockRejectedValueOnce(new Error("down"));
    const p = makeParams();
    await createTripHandlers(p).handleFlightLookup();
    expect(p.setIsLookingUpFlight).toHaveBeenLastCalledWith(false);
  });
});

describe("segment editing", () => {
  it("selecting a suggestion loads it as the active flight", () => {
    const p = makeParams();
    createTripHandlers(p).handleSelectFlightSuggestion(flight());
    expect(p.setFlightCarrier).toHaveBeenCalledWith("BA");
    expect(p.setFlightSuggestions).toHaveBeenCalledWith([]);
    expect(p.setFlightDetailsExpanded).toHaveBeenCalledWith(true);
  });

  it("adding another flight commits the current one as a segment", () => {
    const p = makeParams({ flightLookupResult: flight() });
    createTripHandlers(p).handleAddAnotherFlight();
    const updater = p.setFlightSegments.mock.calls[0][0];
    expect(updater([])).toHaveLength(1);
    expect(p.setFlightLookupResult).toHaveBeenCalledWith(null);
  });

  it("adding another flight is a no-op with nothing looked up", () => {
    const p = makeParams({ flightLookupResult: null });
    createTripHandlers(p).handleAddAnotherFlight();
    expect(p.setFlightSegments).not.toHaveBeenCalled();
  });

  it("editing a segment pulls it back into the active slot", () => {
    const seg = flight({ number: "9" });
    const p = makeParams({ flightSegments: [seg] });
    createTripHandlers(p).handleEditSegment(0);
    expect(p.setFlightNumber).toHaveBeenCalledWith("9");
    expect(p.setFlightLookupResult).toHaveBeenCalledWith(seg);
  });

  it("editing an out-of-range segment is a no-op", () => {
    const p = makeParams({ flightSegments: [] });
    createTripHandlers(p).handleEditSegment(3);
    expect(p.setFlightNumber).not.toHaveBeenCalled();
  });
});

describe("edit and delete", () => {
  const existing: Trip = {
    id: "t1",
    departureLocation: "London",
    destination: "Paris",
    departureDate: new Date("2026-09-01T09:00:00Z"),
    timezone: "Europe/Paris",
  };

  it("opening the editor seeds the form from the trip", () => {
    const p = makeParams();
    createTripHandlers(p).handleModifyTripDates(existing);
    expect(p.setEditTripDestination).toHaveBeenCalledWith("Paris");
    expect(p.setShowEditTripModal).toHaveBeenCalledWith(true);
  });

  it("saving without a selected trip errors", () => {
    const p = makeParams({ editingTrip: null });
    createTripHandlers(p).handleSaveEditTrip();
    expect(alertSpy).toHaveBeenCalledWith("Error", "No trip selected");
  });

  it("saving applies the edits and re-resolves timezones", () => {
    const p = makeParams({
      editingTrip: existing,
      editTripDestination: "Tokyo",
    });
    createTripHandlers(p).handleSaveEditTrip();
    const updated = p.setTrips.mock.calls[0][0]([existing]) as Trip[];
    expect(updated[0].destination).toBe("Tokyo");
    expect(updated[0].timezone).toBe("Asia/Tokyo");
  });

  it("saving rejects an invalid edit", () => {
    const p = makeParams({ editingTrip: existing, editTripDestination: "" });
    createTripHandlers(p).handleSaveEditTrip();
    expect(p.setTrips).not.toHaveBeenCalled();
  });

  it("delete asks for confirmation before removing", () => {
    const p = makeParams();
    createTripHandlers(p).handleDeleteTrip("t1");
    expect(alertSpy).toHaveBeenCalled();
    expect(p.setTrips).not.toHaveBeenCalled();
  });

  it("confirming the delete removes only that trip", () => {
    const p = makeParams();
    createTripHandlers(p).handleDeleteTrip("t1");
    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === "Delete")?.onPress?.();
    const updater = p.setTrips.mock.calls[0][0];
    expect(updater([existing, { ...existing, id: "t2" }])).toHaveLength(1);
  });
});

describe("handleCloseAddTrip", () => {
  it("resets everything and dismisses", () => {
    const p = makeParams();
    createTripHandlers(p).handleCloseAddTrip();
    expect(p.setShowAddTripModal).toHaveBeenCalledWith(false);
    expect(p.setShowManualEntry).toHaveBeenCalledWith(false);
    expect(p.setFlightCarrier).toHaveBeenCalledWith("");
    expect(p.setNewTripDestination).toHaveBeenCalledWith("");
  });
});
