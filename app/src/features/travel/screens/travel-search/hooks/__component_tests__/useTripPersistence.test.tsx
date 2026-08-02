import { renderHook, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTripPersistence } from "../useTripPersistence";
import { MOCK_TRIPS } from "@features/travel/mockTrips";

type MockStore = typeof AsyncStorage & {
  __resetStore: () => void;
  __seed: (k: string, v: string) => void;
};
const store = AsyncStorage as MockStore;

const KEY = "planned_trips";

/** Serialized shape as it sits in AsyncStorage — dates are strings. */
const realTrip = (over: Record<string, unknown> = {}) => ({
  id: "real-1",
  departureLocation: "London",
  destination: "Tokyo",
  departureDate: "2026-09-01T09:00:00.000Z",
  returnDate: "2026-09-10T09:00:00.000Z",
  timezone: "Asia/Tokyo",
  ...over,
});

beforeEach(() => {
  store.__resetStore();
  jest.clearAllMocks();
});

describe("useTripPersistence", () => {
  it("seeds demo trips when storage is empty", async () => {
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toBe(MOCK_TRIPS));
  });

  it("NEVER writes the seeded demo trips back to storage", async () => {
    // The invariant that matters: mocks written on first launch become
    // indistinguishable from real trips forever.
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toBe(MOCK_TRIPS));
    await new Promise((r) => setTimeout(r, 20));
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("restores stored trips instead of seeding", async () => {
    store.__seed(KEY, JSON.stringify([realTrip()]));
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toHaveLength(1));
    expect(result.current.trips[0].destination).toBe("Tokyo");
    expect(result.current.trips).not.toBe(MOCK_TRIPS);
  });

  it("revives stored dates as real Date objects", async () => {
    store.__seed(KEY, JSON.stringify([realTrip()]));
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toHaveLength(1));
    const t = result.current.trips[0];
    expect(t.departureDate).toBeInstanceOf(Date);
    expect(Number.isNaN(t.departureDate.getTime())).toBe(false);
  });

  it("drops a trip whose departure date will not parse", async () => {
    store.__seed(
      KEY,
      JSON.stringify([
        realTrip(),
        realTrip({ id: "bad", departureDate: "??" }),
      ]),
    );
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toHaveLength(1));
    expect(result.current.trips[0].id).toBe("real-1");
  });

  it("falls back to the seed when the stored JSON is corrupt", async () => {
    store.__seed(KEY, "{not json at all");
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toBe(MOCK_TRIPS));
  });

  it("falls back to the seed when the read itself rejects", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error("disk gone"),
    );
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toBe(MOCK_TRIPS));
  });

  it("persists a user edit", async () => {
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toBe(MOCK_TRIPS));

    act(() => {
      result.current.setTrips((prev) => [...prev].slice(0, 1));
    });

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
    const [key, value] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe(KEY);
    expect(JSON.parse(value)).toHaveLength(1);
  });

  it("persists a deletion down to an empty list", async () => {
    store.__seed(KEY, JSON.stringify([realTrip()]));
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toHaveLength(1));

    act(() => result.current.setTrips(() => []));
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
    const [, value] = (AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)!;
    expect(JSON.parse(value)).toEqual([]);
  });

  it("does not write before the initial read has settled", async () => {
    renderHook(() => useTripPersistence());
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("survives a write failure without throwing", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error("quota"),
    );
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips).toBe(MOCK_TRIPS));
    act(() => result.current.setTrips(() => []));
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
  });
});
