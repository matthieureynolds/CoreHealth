import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import locationService from "../locationService";

jest.mock("expo-location", () => ({
  PermissionStatus: { GRANTED: "granted", DENIED: "denied" },
  Accuracy: { Balanced: 3, High: 4 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));

const mocked = Location as jest.Mocked<typeof Location>;

const position = {
  coords: { latitude: 51.5, longitude: -0.12, accuracy: 5 },
  timestamp: 1_700_000_000_000,
};

beforeEach(async () => {
  jest.clearAllMocks();
  mocked.getForegroundPermissionsAsync.mockResolvedValue({
    status: "granted",
  } as never);
  mocked.requestForegroundPermissionsAsync.mockResolvedValue({
    status: "granted",
  } as never);
  mocked.getCurrentPositionAsync.mockResolvedValue(position as never);
  await locationService.requestPermission();
});

describe("permissions", () => {
  it("reports the current status", async () => {
    await expect(locationService.checkPermissionStatus()).resolves.toBe(
      "granted",
    );
  });

  it("returns DENIED rather than throwing when the check fails", async () => {
    mocked.getForegroundPermissionsAsync.mockRejectedValueOnce(
      new Error("no module"),
    );
    await expect(locationService.checkPermissionStatus()).resolves.toBe(
      "denied",
    );
  });

  it("persists the granted flag", async () => {
    await locationService.requestPermission();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("locationAccess", "true");
  });

  it("persists the denied flag and reports disabled", async () => {
    mocked.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    } as never);
    await locationService.requestPermission();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "locationAccess",
      "false",
    );
    expect(locationService.isLocationEnabled()).toBe(false);
  });

  it("returns DENIED when the request itself throws", async () => {
    mocked.requestForegroundPermissionsAsync.mockRejectedValueOnce(
      new Error("boom"),
    );
    await expect(locationService.requestPermission()).resolves.toBe("denied");
  });

  it("exposes the last known permission status", () => {
    expect(locationService.getPermissionStatus()).toBe("granted");
  });
});

describe("current location", () => {
  it("maps a position into the app's shape", async () => {
    const loc = await locationService.getCurrentLocation();
    expect(loc).toEqual({
      latitude: 51.5,
      longitude: -0.12,
      accuracy: 5,
      timestamp: position.timestamp,
    });
  });

  it("returns null rather than throwing when the fix fails", async () => {
    mocked.getCurrentPositionAsync.mockRejectedValueOnce(new Error("no gps"));
    await expect(locationService.getCurrentLocation()).resolves.toBeNull();
  });

  it("caches the last known location", async () => {
    await locationService.getCurrentLocation();
    expect(locationService.getLastKnownLocation()?.latitude).toBe(51.5);
  });

  it("throws when location access is not enabled", async () => {
    mocked.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    } as never);
    await locationService.requestPermission();
    await expect(locationService.getCurrentLocation()).rejects.toThrow(
      /not enabled/i,
    );
  });

  it("handles a null accuracy from the platform", async () => {
    mocked.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 1, longitude: 2, accuracy: null },
      timestamp: 1,
    } as never);
    const loc = await locationService.getCurrentLocation();
    expect(loc?.accuracy).toBeUndefined();
  });
});

describe("watching", () => {
  it("starts a subscription", async () => {
    mocked.watchPositionAsync.mockResolvedValue({ remove: jest.fn() } as never);
    await expect(locationService.startLocationUpdates()).resolves.toBe(true);
  });

  it("does not start a second subscription", async () => {
    const remove = jest.fn();
    mocked.watchPositionAsync.mockResolvedValue({ remove } as never);
    await locationService.startLocationUpdates();
    mocked.watchPositionAsync.mockClear();
    await expect(locationService.startLocationUpdates()).resolves.toBe(true);
    expect(mocked.watchPositionAsync).not.toHaveBeenCalled();
    locationService.stopLocationUpdates();
  });

  it("returns false when the platform refuses to watch", async () => {
    locationService.stopLocationUpdates();
    mocked.watchPositionAsync.mockRejectedValueOnce(new Error("nope"));
    await expect(locationService.startLocationUpdates()).resolves.toBe(false);
  });

  it("removes the subscription on stop", async () => {
    const remove = jest.fn();
    mocked.watchPositionAsync.mockResolvedValue({ remove } as never);
    await locationService.startLocationUpdates();
    locationService.stopLocationUpdates();
    expect(remove).toHaveBeenCalled();
  });

  it("is safe to stop when nothing is running", () => {
    expect(() => locationService.stopLocationUpdates()).not.toThrow();
  });
});

describe("geometry", () => {
  it("measures distance in metres", () => {
    expect(locationService.calculateDistance(51.5, -0.12, 51.5, -0.12)).toBe(0);
    expect(
      locationService.calculateDistance(51.5074, -0.1278, 48.8566, 2.3522) /
        1000,
    ).toBeCloseTo(343.6, 0);
  });

  it("answers whether a point is inside a radius", () => {
    expect(locationService.isWithinRadius(0, 0, 0, 0, 10)).toBe(true);
    expect(locationService.isWithinRadius(0, 0, 1, 1, 10)).toBe(false);
  });
});

describe("nearby places", () => {
  it("returns reverse-geocoded results", async () => {
    mocked.reverseGeocodeAsync.mockResolvedValueOnce([
      { city: "London" },
    ] as never);
    await expect(locationService.getNearbyPlaces(51.5, -0.12)).resolves.toEqual(
      [{ city: "London" }],
    );
  });

  it("returns an empty list rather than throwing", async () => {
    mocked.reverseGeocodeAsync.mockRejectedValueOnce(new Error("offline"));
    await expect(locationService.getNearbyPlaces(51.5, -0.12)).resolves.toEqual(
      [],
    );
  });
});

describe("enable / disable", () => {
  it("enable resolves true when permission is granted", async () => {
    await expect(locationService.enableLocation()).resolves.toBe(true);
  });

  it("disable clears the flag and stops updates", async () => {
    await locationService.disableLocation();
    expect(locationService.isLocationEnabled()).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "locationAccess",
      "false",
    );
  });
});

describe("lifecycle and settings", () => {
  it("initialize checks permission and loads saved settings", async () => {
    await locationService.initialize();
    expect(mocked.getForegroundPermissionsAsync).toHaveBeenCalled();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("locationAccess");
  });

  it("initialize survives a permission-check failure", async () => {
    mocked.getForegroundPermissionsAsync.mockRejectedValueOnce(
      new Error("no module"),
    );
    await expect(locationService.initialize()).resolves.toBeUndefined();
  });

  it("restores the enabled flag from storage when permission is granted", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("true");
    await locationService.initialize();
    expect(locationService.isLocationEnabled()).toBe(true);
  });

  it("stays disabled when storage says so", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("false");
    await locationService.initialize();
    expect(locationService.isLocationEnabled()).toBe(false);
  });

  it("survives a settings read failure", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error("disk"),
    );
    await expect(locationService.initialize()).resolves.toBeUndefined();
  });

  it("reports whether device location services are on", async () => {
    mocked.hasServicesEnabledAsync.mockResolvedValueOnce(true as never);
    await expect(locationService.isLocationServicesEnabled()).resolves.toBe(
      true,
    );
  });

  it("reports false when the services check throws", async () => {
    mocked.hasServicesEnabledAsync.mockRejectedValueOnce(new Error("nope"));
    await expect(locationService.isLocationServicesEnabled()).resolves.toBe(
      false,
    );
  });

  it("is a singleton", () => {
    // getInstance must not hand out a second copy holding its own permission
    // state, or one caller could believe location is enabled while another
    // does not.
    const A = Object.getPrototypeOf(locationService).constructor;
    expect(A.getInstance()).toBe(A.getInstance());
  });

  it("throws when watching without permission", async () => {
    mocked.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    } as never);
    await locationService.requestPermission();
    await expect(locationService.startLocationUpdates()).rejects.toThrow(
      /not enabled/i,
    );
  });

  it("throws when listing nearby places without permission", async () => {
    mocked.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    } as never);
    await locationService.requestPermission();
    await expect(locationService.getNearbyPlaces(0, 0)).rejects.toThrow(
      /not enabled/i,
    );
  });

  it("enable returns false when permission is refused", async () => {
    mocked.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    } as never);
    await expect(locationService.enableLocation()).resolves.toBe(false);
  });

  it("enable returns false when the request throws", async () => {
    mocked.requestForegroundPermissionsAsync.mockRejectedValueOnce(
      new Error("boom"),
    );
    await expect(locationService.enableLocation()).resolves.toBe(false);
  });

  it("stores each position update while watching", async () => {
    let emit: ((p: unknown) => void) | undefined;
    mocked.watchPositionAsync.mockImplementationOnce((async (
      _o: unknown,
      cb: (p: unknown) => void,
    ) => {
      emit = cb;
      return { remove: jest.fn() };
    }) as never);
    await locationService.startLocationUpdates();
    emit?.({
      coords: { latitude: 9, longitude: 9, accuracy: 1 },
      timestamp: 42,
    });
    expect(locationService.getLastKnownLocation()?.latitude).toBe(9);
    locationService.stopLocationUpdates();
  });
});
