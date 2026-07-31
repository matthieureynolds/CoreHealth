import { useState, useEffect, useRef, useCallback } from "react";
import { Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AIRLINE_CODES } from "../travelMetricHelpers";
import { TravelApiErrors, FlightOption } from "../../../../../shared/types";
import {
  searchAllLocations,
  getPopularCities,
  CitySearchResult,
} from "../../../../../shared/services/travel/citySearchService";
import { useCitySuggestions } from "./useCitySuggestions";
import { Trip } from "./useTravelHandlers";
import { MOCK_TRIPS } from "../../../mockTrips";
import { searchMockFlights } from "../../../mockFlights";
import { logger } from "../../../../../shared/utils/logger";

export const popularCities = getPopularCities();

export function useTravelState() {
  const pagerRef = useRef<any>(null);
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsTranslateY = useRef(new Animated.Value(0)).current;
  const rowAnimsRef = useRef<
    Record<string, { opacity: Animated.Value; translate: Animated.Value }>
  >({});

  // Stable identity: it only touches a ref, and it is passed as a prop into
  // memoised children, which would re-render on every parent render otherwise.
  const getRowAnim = useCallback((key: string) => {
    if (!rowAnimsRef.current[key]) {
      rowAnimsRef.current[key] = {
        opacity: new Animated.Value(0),
        translate: new Animated.Value(12),
      };
    }
    return rowAnimsRef.current[key];
  }, []);

  // Search state
  const [searchLocation, setSearchLocation] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<"health" | "trips">("health");
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [inputText, setInputText] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [citySearchResults, setCitySearchResults] = useState<
    CitySearchResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [apiErrors, setApiErrors] = useState<TravelApiErrors>({});

  // Trip state — persisted to AsyncStorage
  const [trips, setTrips] = useState<Trip[]>([]);
  const tripsInitialized = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem("planned_trips")
      .then((stored) => {
        let loaded = false;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTrips(
                parsed.map((t: any) => ({
                  ...t,
                  departureDate: new Date(t.departureDate),
                  returnDate: t.returnDate ? new Date(t.returnDate) : undefined,
                })),
              );
              loaded = true;
            }
          } catch (err) {
            // Corrupt store: fall through to the mock seed rather than crashing,
            // but surface it in dev so it isn't mistaken for "no trips yet".
            logger.warn("planned_trips is corrupt, reseeding", err);
          }
        }
        // Seed mock trips for testing when no real trips exist yet.
        if (!loaded) setTrips(MOCK_TRIPS);
        tripsInitialized.current = true;
      })
      .catch(() => {
        setTrips(MOCK_TRIPS);
        tripsInitialized.current = true;
      });
  }, []);

  useEffect(() => {
    if (!tripsInitialized.current) return;
    // Never persist the seeded demo trips: identity-compare against MOCK_TRIPS,
    // which is the exact array we seed with. Any real user edit builds a new
    // array and so still saves. Without this the mocks were written to storage
    // on first launch and became indistinguishable from real trips forever.
    if (trips === MOCK_TRIPS) return;
    AsyncStorage.setItem("planned_trips", JSON.stringify(trips)).catch(
      (err) => {
        logger.warn("failed to persist planned_trips", err);
      },
    );
  }, [trips]);

  const [showAddTripModal, setShowAddTripModal] = useState(false);
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
  const [showManualEntry, setShowManualEntry] = useState(false);
  const tripModalTranslateY = useRef(new Animated.Value(1000)).current;

  const [newTripDepartureLocation, setNewTripDepartureLocation] = useState("");
  const [newTripDestination, setNewTripDestination] = useState("");
  const [newTripDepartureDate, setNewTripDepartureDate] = useState<
    Date | undefined
  >(undefined);
  const [newTripReturnDate, setNewTripReturnDate] = useState<Date | undefined>(
    undefined,
  );
  const [newTripDepartureTime, setNewTripDepartureTime] = useState<
    Date | undefined
  >(undefined);
  const [newTripReturnTime, setNewTripReturnTime] = useState<Date | undefined>(
    undefined,
  );
  const [showDatePicker, setShowDatePicker] = useState<
    "departure" | "return" | "departureTime" | "returnTime" | null
  >(null);
  const [tempDatePickerValue, setTempDatePickerValue] = useState<
    Date | undefined
  >(undefined);
  const pendingDateRef = useRef<Date | undefined>(undefined);
  const datePickerInitializedRef = useRef(false);
  const [tripSuggestions, setTripSuggestions] = useState<string[]>([]);
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>(
    [],
  );

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Edit trip state
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [editTripDestination, setEditTripDestination] = useState("");
  const [editTripDepartureDate, setEditTripDepartureDate] = useState(
    new Date(),
  );
  const [editTripReturnDate, setEditTripReturnDate] = useState<
    Date | undefined
  >(undefined);
  const [editTripNotes, setEditTripNotes] = useState("");
  const [tempEditDatePickerValue, setTempEditDatePickerValue] = useState<
    Date | undefined
  >(undefined);
  const editDatePickerInitializedRef = useRef(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState<
    "departure" | "return" | null
  >(null);
  const [editTripSuggestions, setEditTripSuggestions] = useState<string[]>([]);
  const [editTripDepartureLocation, setEditTripDepartureLocation] =
    useState("");
  const [editTripDepartureSuggestions, setEditTripDepartureSuggestions] =
    useState<string[]>([]);

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

  // Date/time picker init (add trip)
  useEffect(() => {
    if (showDatePicker) {
      if (!datePickerInitializedRef.current) {
        let d: Date;
        if (showDatePicker === "departure") {
          d = newTripDepartureDate
            ? new Date(newTripDepartureDate)
            : new Date();
        } else if (showDatePicker === "return") {
          d = new Date(newTripReturnDate || new Date());
        } else if (showDatePicker === "departureTime") {
          d = newTripDepartureTime
            ? new Date(newTripDepartureTime)
            : new Date();
        } else {
          d = newTripReturnTime ? new Date(newTripReturnTime) : new Date();
        }
        setTempDatePickerValue(d);
        pendingDateRef.current = d;
        datePickerInitializedRef.current = true;
      }
    } else {
      setTempDatePickerValue(undefined);
      datePickerInitializedRef.current = false;
    }
  }, [showDatePicker]);

  // Date picker init (edit trip)
  useEffect(() => {
    if (showEditDatePicker) {
      if (!editDatePickerInitializedRef.current) {
        if (showEditDatePicker === "departure")
          setTempEditDatePickerValue(new Date(editTripDepartureDate));
        else
          setTempEditDatePickerValue(
            new Date(editTripReturnDate || new Date()),
          );
        editDatePickerInitializedRef.current = true;
      }
    } else {
      setTempEditDatePickerValue(undefined);
      editDatePickerInitializedRef.current = false;
    }
  }, [showEditDatePicker]);

  // Search cities
  useEffect(() => {
    if (searchLocation.trim() && searchLocation.length >= 2) {
      // Show popular city matches immediately while API loads
      const filtered = popularCities.filter((city) =>
        city.toLowerCase().includes(searchLocation.toLowerCase()),
      );
      setFilteredCities(filtered);
    } else {
      setCitySearchResults([]);
      setFilteredCities([]);
    }

    // See useCitySuggestions: the timer can be cancelled but an already-started
    // request cannot, so results are dropped unless they belong to the latest query.
    let cancelled = false;
    const searchCitiesAsync = async () => {
      if (searchLocation.trim() && searchLocation.length >= 2) {
        setIsSearchingCities(true);
        try {
          const results = await searchAllLocations(searchLocation, 15);
          if (!cancelled) setCitySearchResults(results);
        } catch {
          // Popular cities are already shown as fallback
        } finally {
          if (!cancelled) setIsSearchingCities(false);
        }
      }
    };
    const timeoutId = setTimeout(searchCitiesAsync, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchLocation]);

  // Debounced city suggestions for the four trip/edit location fields.
  useCitySuggestions(newTripDestination, setTripSuggestions);
  useCitySuggestions(newTripDepartureLocation, setDepartureSuggestions);
  useCitySuggestions(editTripDestination, setEditTripSuggestions);
  useCitySuggestions(
    editTripDepartureLocation,
    setEditTripDepartureSuggestions,
  );

  return {
    pagerRef,
    resultsOpacity,
    resultsTranslateY,
    getRowAnim,
    tripModalTranslateY,
    // Search state
    searchLocation,
    setSearchLocation,
    isRefreshing,
    setIsRefreshing,
    selectedLocation,
    setSelectedLocation,
    isGettingLocation,
    setIsGettingLocation,
    activeTab,
    setActiveTab,
    showInlineSuggestions,
    setShowInlineSuggestions,
    inputText,
    setInputText,
    filteredCities,
    setFilteredCities,
    citySearchResults,
    setCitySearchResults,
    isLoading,
    setIsLoading,
    isSearchingCities,
    apiErrors,
    setApiErrors,
    // Trip state
    trips,
    setTrips,
    showAddTripModal,
    setShowAddTripModal,
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
    showManualEntry,
    setShowManualEntry,
    newTripDepartureLocation,
    setNewTripDepartureLocation,
    newTripDestination,
    setNewTripDestination,
    newTripDepartureDate,
    setNewTripDepartureDate,
    newTripReturnDate,
    setNewTripReturnDate,
    newTripDepartureTime,
    setNewTripDepartureTime,
    newTripReturnTime,
    setNewTripReturnTime,
    showDatePicker,
    setShowDatePicker,
    tempDatePickerValue,
    setTempDatePickerValue,
    pendingDateRef,
    tripSuggestions,
    setTripSuggestions,
    departureSuggestions,
    setDepartureSuggestions,
    // Modal state
    showEmergencyModal,
    setShowEmergencyModal,
    // Edit trip state
    editingTrip,
    setEditingTrip,
    showEditTripModal,
    setShowEditTripModal,
    editTripDestination,
    setEditTripDestination,
    editTripDepartureDate,
    setEditTripDepartureDate,
    editTripReturnDate,
    setEditTripReturnDate,
    editTripNotes,
    setEditTripNotes,
    tempEditDatePickerValue,
    setTempEditDatePickerValue,
    showEditDatePicker,
    setShowEditDatePicker,
    editTripSuggestions,
    setEditTripSuggestions,
    editTripDepartureLocation,
    setEditTripDepartureLocation,
    editTripDepartureSuggestions,
    setEditTripDepartureSuggestions,
  };
}
