import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useFlightEntry } from "../useFlightEntry";
import { AIRLINE_CODES } from "../../travelMetricHelpers";

describe("useFlightEntry", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useFlightEntry());
    expect(result.current.flightCarrier).toBe("");
    expect(result.current.flightNumber).toBe("");
    expect(result.current.detectedAirline).toBeNull();
    expect(result.current.flightSuggestions).toEqual([]);
    expect(result.current.flightSegments).toEqual([]);
  });

  it("resolves a carrier code to an airline name", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => result.current.setFlightCarrier("BA"));
    await waitFor(() =>
      expect(result.current.detectedAirline).toBe(AIRLINE_CODES.BA),
    );
  });

  it("is case- and whitespace-insensitive on the carrier code", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => result.current.setFlightCarrier("  ba  "));
    await waitFor(() =>
      expect(result.current.detectedAirline).toBe(AIRLINE_CODES.BA),
    );
  });

  it("clears the airline for an unknown code", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => result.current.setFlightCarrier("BA"));
    await waitFor(() => expect(result.current.detectedAirline).not.toBeNull());
    act(() => result.current.setFlightCarrier("ZZ"));
    await waitFor(() => expect(result.current.detectedAirline).toBeNull());
  });

  it("offers suggestions once both carrier and number are entered", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => {
      result.current.setFlightCarrier("BA");
      result.current.setFlightNumber("1");
    });
    await waitFor(() =>
      expect(result.current.flightSuggestions.length).toBeGreaterThan(0),
    );
  });

  it("offers nothing with only a carrier", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => result.current.setFlightCarrier("BA"));
    await waitFor(() => expect(result.current.flightSuggestions).toEqual([]));
  });

  it("hides suggestions once a flight has been selected", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => {
      result.current.setFlightCarrier("BA");
      result.current.setFlightNumber("1");
    });
    await waitFor(() =>
      expect(result.current.flightSuggestions.length).toBeGreaterThan(0),
    );

    act(() =>
      result.current.setFlightLookupResult(result.current.flightSuggestions[0]),
    );
    await waitFor(() => expect(result.current.flightSuggestions).toEqual([]));
  });

  it("brings suggestions back when the selection is cleared", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => {
      result.current.setFlightCarrier("BA");
      result.current.setFlightNumber("1");
    });
    await waitFor(() =>
      expect(result.current.flightSuggestions.length).toBeGreaterThan(0),
    );
    const first = result.current.flightSuggestions[0];

    act(() => result.current.setFlightLookupResult(first));
    await waitFor(() => expect(result.current.flightSuggestions).toEqual([]));

    act(() => result.current.setFlightLookupResult(null));
    await waitFor(() =>
      expect(result.current.flightSuggestions.length).toBeGreaterThan(0),
    );
  });

  it("accumulates segments for a multi-leg trip", async () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => {
      result.current.setFlightCarrier("BA");
      result.current.setFlightNumber("1");
    });
    await waitFor(() =>
      expect(result.current.flightSuggestions.length).toBeGreaterThan(0),
    );
    const leg = result.current.flightSuggestions[0];

    act(() => result.current.setFlightSegments((prev) => [...prev, leg]));
    expect(result.current.flightSegments).toHaveLength(1);

    act(() => result.current.setFlightSegments((prev) => [...prev, leg]));
    expect(result.current.flightSegments).toHaveLength(2);
  });

  it("tracks the not-found and looking-up flags independently", () => {
    const { result } = renderHook(() => useFlightEntry());
    act(() => result.current.setIsLookingUpFlight(true));
    expect(result.current.isLookingUpFlight).toBe(true);
    expect(result.current.flightNotFound).toBe(false);

    act(() => {
      result.current.setIsLookingUpFlight(false);
      result.current.setFlightNotFound(true);
    });
    expect(result.current.isLookingUpFlight).toBe(false);
    expect(result.current.flightNotFound).toBe(true);
  });
});
