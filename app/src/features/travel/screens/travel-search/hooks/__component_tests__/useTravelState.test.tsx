import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useTravelState, popularCities } from "../useTravelState";

jest.mock("@shared/services/travel/citySearchService", () => ({
  getPopularCities: () => ["London, UK", "Tokyo, Japan", "Paris, France"],
  searchAllLocations: jest.fn(async () => [
    {
      name: "Lagos",
      country: "Nigeria",
      coordinates: { latitude: 6.5, longitude: 3.4 },
      timezone: "Africa/Lagos",
    },
  ]),
}));

describe("useTravelState", () => {
  it("composes the sub-hooks into one surface", async () => {
    const { result } = renderHook(() => useTravelState());
    // trip persistence
    expect(result.current).toHaveProperty("trips");
    expect(result.current).toHaveProperty("setTrips");
    // flight entry, spread in
    expect(result.current).toHaveProperty("flightCarrier");
    expect(result.current).toHaveProperty("setFlightSegments");
    // its own state
    expect(result.current).toHaveProperty("searchLocation");
    expect(result.current).toHaveProperty("showEditTripModal");
  });

  it("exposes popular cities", () => {
    expect(popularCities.length).toBeGreaterThan(0);
  });

  it("starts on the health tab", () => {
    const { result } = renderHook(() => useTravelState());
    expect(result.current.activeTab).toBe("health");
  });

  it("switches tabs", () => {
    const { result } = renderHook(() => useTravelState());
    act(() => result.current.setActiveTab("trips"));
    expect(result.current.activeTab).toBe("trips");
  });

  it("returns a stable getRowAnim across renders", () => {
    const { result, rerender } = renderHook(() => useTravelState());
    const first = result.current.getRowAnim;
    rerender({});
    expect(result.current.getRowAnim).toBe(first);
  });

  it("returns the same Animated.Value for a repeated row key", () => {
    const { result } = renderHook(() => useTravelState());
    const a = result.current.getRowAnim("aq");
    const b = result.current.getRowAnim("aq");
    expect(a).toBe(b);
    expect(result.current.getRowAnim("uv")).not.toBe(a);
  });

  it("filters popular cities as the user types", async () => {
    const { result } = renderHook(() => useTravelState());
    act(() => result.current.setSearchLocation("Lon"));
    await waitFor(() =>
      expect(result.current.filteredCities.some((c) => /London/.test(c))).toBe(
        true,
      ),
    );
  });

  it("clears the filtered list for a query under two characters", async () => {
    const { result } = renderHook(() => useTravelState());
    act(() => result.current.setSearchLocation("Lon"));
    await waitFor(() =>
      expect(result.current.filteredCities.length).toBeGreaterThan(0),
    );
    act(() => result.current.setSearchLocation("L"));
    await waitFor(() => expect(result.current.filteredCities).toEqual([]));
  });

  it("debounces the remote city search", async () => {
    const {
      searchAllLocations,
    } = require("@shared/services/travel/citySearchService");
    const { result } = renderHook(() => useTravelState());
    act(() => result.current.setSearchLocation("Lag"));
    // Not called synchronously — the 300ms timer has not fired.
    expect(searchAllLocations).not.toHaveBeenCalled();
    await waitFor(() => expect(searchAllLocations).toHaveBeenCalled(), {
      timeout: 2000,
    });
  });

  it("seeds the date picker when it opens and clears it on close", async () => {
    const { result } = renderHook(() => useTravelState());
    act(() => result.current.setShowDatePicker("departure"));
    await waitFor(() =>
      expect(result.current.tempDatePickerValue).toBeInstanceOf(Date),
    );
    act(() => result.current.setShowDatePicker(null));
    await waitFor(() =>
      expect(result.current.tempDatePickerValue).toBeUndefined(),
    );
  });

  it("seeds the edit picker from the trip's existing date", async () => {
    const { result } = renderHook(() => useTravelState());
    const when = new Date("2026-12-25T00:00:00.000Z");
    act(() => result.current.setEditTripDepartureDate(when));
    act(() => result.current.setShowEditDatePicker("departure"));
    await waitFor(() =>
      expect(result.current.tempEditDatePickerValue?.toISOString()).toBe(
        when.toISOString(),
      ),
    );
  });

  it("does not reset the picker while it stays open", async () => {
    const { result } = renderHook(() => useTravelState());
    act(() => result.current.setShowDatePicker("departure"));
    await waitFor(() =>
      expect(result.current.tempDatePickerValue).toBeInstanceOf(Date),
    );
    const moved = new Date("2027-01-01T00:00:00.000Z");
    act(() => result.current.setTempDatePickerValue(moved));
    // Changing the underlying trip date must not snap the open picker back.
    act(() => result.current.setNewTripDepartureDate(new Date("2030-01-01")));
    await waitFor(() => expect(result.current.tempDatePickerValue).toBe(moved));
  });
});
