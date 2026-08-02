import { Alert, Linking, Keyboard } from "react-native";
import { Animated } from "react-native";
import { createTravelHandlers } from "../useTravelHandlers";

jest.mock("@shared/services/data/apiClient", () => ({
  api: { post: jest.fn(async () => ({})) },
}));
jest.mock("@shared/services/jetlag-brain/enhancedJetLagService", () => ({
  FlightLookupService: { lookupFlight: jest.fn() },
}));

/** Minimal stand-in for the useTravelState bag. */
function makeState(over: Record<string, unknown> = {}) {
  const fn = () => jest.fn();
  return {
    citySearchResults: [],
    showDatePicker: null,
    showEditDatePicker: null,
    tempEditDatePickerValue: undefined,
    resultsOpacity: new Animated.Value(0),
    resultsTranslateY: new Animated.Value(0),
    pendingDateRef: { current: undefined as Date | undefined },
    tripModalTranslateY: new Animated.Value(0),
    editingTrip: null,
    flightSegments: [],
    flightLookupResult: null,
    newTripDepartureDate: new Date("2026-09-01T09:00:00Z"),
    editTripDepartureDate: new Date("2026-09-01T09:00:00Z"),
    setSearchLocation: fn(),
    setInputText: fn(),
    setFilteredCities: fn(),
    setIsLoading: fn(),
    setSelectedLocation: fn(),
    setShowInlineSuggestions: fn(),
    setApiErrors: fn(),
    setIsRefreshing: fn(),
    setIsGettingLocation: fn(),
    setNewTripDepartureDate: fn(),
    setNewTripReturnDate: fn(),
    setNewTripDepartureTime: fn(),
    setNewTripReturnTime: fn(),
    setShowDatePicker: fn(),
    setTempDatePickerValue: fn(),
    setShowEditDatePicker: fn(),
    setTempEditDatePickerValue: fn(),
    setEditTripDepartureDate: fn(),
    setEditTripReturnDate: fn(),
    setEditTripDepartureSuggestions: fn(),
    setNewTripDepartureLocation: fn(),
    setDepartureSuggestions: fn(),
    setEditTripDepartureLocation: fn(),
    setTrips: fn(),
    setShowAddTripModal: fn(),
    setTripSuggestions: fn(),
    setFlightCarrier: fn(),
    setFlightNumber: fn(),
    setDetectedAirline: fn(),
    setFlightSegments: fn(),
    setFlightDetailsExpanded: fn(),
    setFlightSuggestions: fn(),
    setFlightLookupResult: fn(),
    setIsLookingUpFlight: fn(),
    setFlightNotFound: fn(),
    setShowManualEntry: fn(),
    setEditingTrip: fn(),
    setEditTripDestination: fn(),
    setEditTripNotes: fn(),
    setShowEditTripModal: fn(),
    setEditTripSuggestions: fn(),
    ...over,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const location = {
  name: "Lagos",
  country: "Nigeria",
  coordinates: { latitude: 6.5, longitude: 3.4 },
  timezone: "Africa/Lagos",
  elevation: 0,
};

function build(over: Record<string, unknown> = {}, deps = {}) {
  const s = makeState(over);
  const updateTravelHealthData = jest.fn(async () => {});
  const getCurrentLocation = jest.fn(async () => location);
  const h = createTravelHandlers({
    s,
    travelHealth: null,
    updateTravelHealthData,
    getCurrentLocation,
    ...deps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return { s, h, updateTravelHealthData, getCurrentLocation };
}

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});
  alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("handleRefresh", () => {
  it("is a no-op with no travel health loaded", async () => {
    const { s, h } = build();
    await h.handleRefresh();
    expect(s.setIsRefreshing).not.toHaveBeenCalled();
  });

  it("refetches using the stored coordinates", async () => {
    const s = makeState();
    const updateTravelHealthData = jest.fn(async () => {});
    const h = createTravelHandlers({
      s,
      travelHealth: {
        location: "Lagos",
        country: "Nigeria",
        coordinates: { latitude: 6.5, longitude: 3.4 },
      },
      updateTravelHealthData,
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await h.handleRefresh();
    expect(updateTravelHealthData).toHaveBeenCalled();
    expect(s.setIsRefreshing).toHaveBeenLastCalledWith(false);
  });

  it("records an error when the refetch fails", async () => {
    const s = makeState();
    const h = createTravelHandlers({
      s,
      travelHealth: {
        location: "Lagos",
        coordinates: { latitude: 1, longitude: 2 },
      },
      updateTravelHealthData: jest.fn(async () => {
        throw new Error("offline");
      }),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await h.handleRefresh();
    expect(s.setApiErrors).toHaveBeenCalled();
  });
});

describe("handleLocationSelect", () => {
  it("fetches health data for a plain city name", async () => {
    const { h, updateTravelHealthData } = build();
    await h.handleLocationSelect("Tokyo");
    expect(updateTravelHealthData).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Tokyo", country: "Unknown" }),
    );
  });

  it("uses the matched search result's real coordinates", async () => {
    const { h, updateTravelHealthData } = build({
      citySearchResults: [
        {
          name: "Tokyo",
          country: "Japan",
          coordinates: { latitude: 35.6, longitude: 139.6 },
          timezone: "Asia/Tokyo",
        },
      ],
    });
    await h.handleLocationSelect("Tokyo, Japan");
    expect(updateTravelHealthData).toHaveBeenCalledWith(
      expect.objectContaining({
        country: "Japan",
        timezone: "Asia/Tokyo",
      }),
    );
  });

  it("clears the loading flag even when the fetch fails", async () => {
    const s = makeState();
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(async () => {
        throw new Error("boom");
      }),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await h.handleLocationSelect("Tokyo");
    expect(s.setIsLoading).toHaveBeenLastCalledWith(false);
    expect(s.setApiErrors).toHaveBeenCalled();
  });
});

describe("current-location handlers", () => {
  it("fills the search field from the device location", async () => {
    const { s, h, updateTravelHealthData } = build();
    await h.handleGetCurrentLocationForSearch();
    expect(s.setInputText).toHaveBeenCalledWith("Lagos");
    expect(updateTravelHealthData).toHaveBeenCalled();
    expect(s.setIsGettingLocation).toHaveBeenLastCalledWith(false);
  });

  it("prompts for permission when the lookup throws", async () => {
    const s = makeState();
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(async () => {
        throw new Error("denied");
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await h.handleGetCurrentLocationForSearch();
    expect(alertSpy).toHaveBeenCalledWith(
      "Location Permission Required",
      expect.any(String),
      expect.any(Array),
    );
  });

  it("the Settings button deep-links to app settings", async () => {
    const openSettings = jest
      .spyOn(Linking, "openSettings")
      .mockImplementation(async () => {});
    const s = makeState();
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(async () => {
        throw new Error("denied");
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await h.handleGetCurrentLocationForSearch();
    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === "Settings")?.onPress?.();
    expect(openSettings).toHaveBeenCalled();
  });

  it("fills the add-trip departure field with 'City, Country'", async () => {
    const { s, h } = build();
    await h.handleGetCurrentLocationForTrip();
    expect(s.setNewTripDepartureLocation).toHaveBeenCalledWith(
      "Lagos, Nigeria",
    );
    expect(s.setDepartureSuggestions).toHaveBeenCalledWith([]);
  });

  it("omits an unknown country from the label", async () => {
    const s = makeState();
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(async () => ({
        ...location,
        country: "Unknown",
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await h.handleGetCurrentLocationForTrip();
    expect(s.setNewTripDepartureLocation).toHaveBeenCalledWith("Lagos");
  });

  it("fills the edit-trip departure field through the same path", async () => {
    const { s, h } = build();
    await h.handleGetCurrentLocationForEdit();
    expect(s.setEditTripDepartureLocation).toHaveBeenCalledWith(
      "Lagos, Nigeria",
    );
  });
});

describe("emergency contact", () => {
  it("confirms before dialling", () => {
    const { h } = build();
    h.handleEmergencyContactPress();
    expect(alertSpy).toHaveBeenCalledWith(
      "Call Emergency Services?",
      expect.stringContaining("112"),
      expect.any(Array),
    );
  });

  it("dials only after confirmation", () => {
    const openURL = jest
      .spyOn(Linking, "openURL")
      .mockImplementation(async () => true);
    const { h } = build();
    h.handleEmergencyContactPress();
    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    expect(openURL).not.toHaveBeenCalled();
    buttons.find((b) => b.text === "Call")?.onPress?.();
    expect(openURL).toHaveBeenCalledWith("tel:112");
  });
});

describe("date pickers", () => {
  it("confirm applies the pending departure date", () => {
    const s = makeState({
      showDatePicker: "departure",
      pendingDateRef: { current: new Date("2026-10-01T00:00:00Z") },
    });
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    h.handleDateConfirm();
    expect(s.setNewTripDepartureDate).toHaveBeenCalled();
    expect(s.setShowDatePicker).toHaveBeenCalledWith(null);
  });

  it("cancel discards the pending value", () => {
    const ref = { current: new Date() as Date | undefined };
    const s = makeState({ showDatePicker: "departure", pendingDateRef: ref });
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    h.handleDateCancel();
    expect(ref.current).toBeUndefined();
    expect(s.setNewTripDepartureDate).not.toHaveBeenCalled();
  });

  it("edit confirm applies the temp value to the departure date", () => {
    const when = new Date("2026-11-11T00:00:00Z");
    const s = makeState({
      showEditDatePicker: "departure",
      tempEditDatePickerValue: when,
    });
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    h.handleEditDateConfirm();
    expect(s.setEditTripDepartureDate).toHaveBeenCalledWith(when);
  });

  it("edit change stores the picked value", () => {
    const { s, h } = build();
    h.handleEditDateChange(null, new Date("2026-12-01T00:00:00Z"));
    expect(s.setTempEditDatePickerValue).toHaveBeenCalled();
  });

  it("edit cancel clears without applying", () => {
    const { s, h } = build();
    h.handleEditDateCancel();
    expect(s.setShowEditDatePicker).toHaveBeenCalledWith(null);
    expect(s.setEditTripDepartureDate).not.toHaveBeenCalled();
  });
});

describe("handleDateChange platform behaviour", () => {
  const { Platform } = require("react-native");
  const realOS = Platform.OS;
  const setOS = (os: string) => {
    Object.defineProperty(Platform, "OS", { value: os, configurable: true });
  };
  afterEach(() => setOS(realOS));

  it("on Android, commits immediately and closes the picker", () => {
    setOS("android");
    for (const [kind, setter] of [
      ["departure", "setNewTripDepartureDate"],
      ["return", "setNewTripReturnDate"],
      ["departureTime", "setNewTripDepartureTime"],
      ["returnTime", "setNewTripReturnTime"],
    ] as const) {
      const s = makeState({ showDatePicker: kind });
      const h = createTravelHandlers({
        s,
        travelHealth: null,
        updateTravelHealthData: jest.fn(),
        getCurrentLocation: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      h.handleDateChange(null, new Date("2026-10-05T00:00:00Z"));
      expect(s[setter]).toHaveBeenCalled();
      expect(s.setShowDatePicker).toHaveBeenCalledWith(null);
    }
  });

  it("on Android with no date, still closes the picker", () => {
    setOS("android");
    const s = makeState({ showDatePicker: "departure" });
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    h.handleDateChange(null, undefined);
    expect(s.setShowDatePicker).toHaveBeenCalledWith(null);
  });

  it("on iOS, buffers into the ref without re-rendering", () => {
    setOS("ios");
    const ref = { current: undefined as Date | undefined };
    const s = makeState({ showDatePicker: "departure", pendingDateRef: ref });
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    h.handleDateChange(null, new Date("2026-10-05T00:00:00Z"));
    // The picker must not snap back mid-scroll, so nothing is committed yet.
    expect(ref.current).toBeInstanceOf(Date);
    expect(s.setNewTripDepartureDate).not.toHaveBeenCalled();
    expect(s.setShowDatePicker).not.toHaveBeenCalled();
  });

  it("confirm applies each picker kind", () => {
    for (const [kind, setter] of [
      ["return", "setNewTripReturnDate"],
      ["departureTime", "setNewTripDepartureTime"],
      ["returnTime", "setNewTripReturnTime"],
    ] as const) {
      const s = makeState({
        showDatePicker: kind,
        pendingDateRef: { current: new Date("2026-10-05T00:00:00Z") },
      });
      const h = createTravelHandlers({
        s,
        travelHealth: null,
        updateTravelHealthData: jest.fn(),
        getCurrentLocation: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      h.handleDateConfirm();
      expect(s[setter]).toHaveBeenCalled();
    }
  });

  it("edit confirm applies to the return date when that picker is open", () => {
    const when = new Date("2026-11-20T00:00:00Z");
    const s = makeState({
      showEditDatePicker: "return",
      tempEditDatePickerValue: when,
    });
    const h = createTravelHandlers({
      s,
      travelHealth: null,
      updateTravelHealthData: jest.fn(),
      getCurrentLocation: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    h.handleEditDateConfirm();
    expect(s.setEditTripReturnDate).toHaveBeenCalledWith(when);
  });
});
