import { useState, useEffect } from "react";
import { AIRLINE_CODES } from "../travelMetricHelpers";
import type { FlightOption } from "@shared/types";
import { searchMockFlights } from "@shared/services/travel/mockFlights";

/**
 * The flight-lookup half of the add-trip modal: carrier/number entry, the
 * live suggestion list, and the segments collected so far.
 *
 * Its two effects are derivations — airline name from carrier code, and
 * suggestions from what has been typed — which is why they belong next to the
 * state they derive from rather than in a hook that also owns city search and
 * date pickers.
 */
export function useFlightEntry() {
  const [flightCarrier, setFlightCarrier] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [detectedAirline, setDetectedAirline] = useState<string | null>(null);
  const [isLookingUpFlight, setIsLookingUpFlight] = useState(false);
  const [flightNotFound, setFlightNotFound] = useState(false);
  const [flightLookupResult, setFlightLookupResult] =
    useState<FlightOption | null>(null);
  const [flightSuggestions, setFlightSuggestions] = useState<FlightOption[]>(
    [],
  );
  const [flightSegments, setFlightSegments] = useState<FlightOption[]>([]);
  const [flightDetailsExpanded, setFlightDetailsExpanded] = useState(false);

  // Detect airline from carrier code
  useEffect(() => {
    const code = flightCarrier.toUpperCase().trim();
    setDetectedAirline(AIRLINE_CODES[code] ?? null);
  }, [flightCarrier]);

  // Live flight suggestions as the user types (Timeshifter-style).
  // Hidden once a flight is selected/looked up so the result card takes over.
  useEffect(() => {
    if (flightLookupResult) {
      setFlightSuggestions([]);
      return;
    }
    if (flightCarrier.trim() && flightNumber.trim()) {
      setFlightSuggestions(searchMockFlights(flightCarrier, flightNumber));
    } else {
      setFlightSuggestions([]);
    }
  }, [flightCarrier, flightNumber, flightLookupResult]);

  return {
    flightCarrier,
    setFlightCarrier,
    flightNumber,
    setFlightNumber,
    detectedAirline,
    setDetectedAirline,
    isLookingUpFlight,
    setIsLookingUpFlight,
    flightNotFound,
    setFlightNotFound,
    flightLookupResult,
    setFlightLookupResult,
    flightSuggestions,
    setFlightSuggestions,
    flightSegments,
    setFlightSegments,
    flightDetailsExpanded,
    setFlightDetailsExpanded,
  };
}
