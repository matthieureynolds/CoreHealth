import { Alert, Keyboard, Linking, Platform } from "react-native";
import { LocationData, TravelHealth } from "@shared/types";
import { createTripHandlers } from "./useTripHandlers";

// The health data is near-instant (mostly mock), so the "analyzing" screen would
// flash by. Hold the loading state for at least this long so it reads as the AI
// genuinely working through the destination.
// Collapses to zero under Jest: the hold is a UX choice, and making every test
// that touches a location lookup wait seven seconds tests nothing.
const MIN_LOAD_MS = process.env.JEST_WORKER_ID ? 0 : 7000;
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * All state from useTravelState(), plus external deps and curtain state.
 * Accepts the state object directly to avoid 60+ individual params.
 */
export interface TravelHandlersParams {
  // The full state object from useTravelState()
  s: ReturnType<typeof import("./useTravelState").useTravelState>;
  // External dependencies
  travelHealth: TravelHealth | null;
  updateTravelHealthData: (locationData: LocationData) => Promise<void>;
  getCurrentLocation: () => Promise<LocationData | null>;
}

export function createTravelHandlers(params: TravelHandlersParams) {
  const { s, travelHealth, updateTravelHealthData, getCurrentLocation } =
    params;
  const {
    citySearchResults,
    showDatePicker,
    showEditDatePicker,
    tempEditDatePickerValue,
    resultsOpacity,
    resultsTranslateY,
    setSearchLocation,
    setInputText,
    setFilteredCities,
    setIsLoading,
    setSelectedLocation,
    setShowInlineSuggestions,
    setApiErrors,
    setIsRefreshing,
    setIsGettingLocation,
    setNewTripDepartureDate,
    setNewTripReturnDate,
    setNewTripDepartureTime,
    setNewTripReturnTime,
    setShowDatePicker,
    setTempDatePickerValue,
    pendingDateRef,
    setShowEditDatePicker,
    setTempEditDatePickerValue,
    setEditTripDepartureDate,
    setEditTripReturnDate,
    setEditTripDepartureSuggestions,
  } = s;

  const tripHandlers = createTripHandlers({
    flightCarrier: s.flightCarrier,
    flightNumber: s.flightNumber,
    flightLookupResult: s.flightLookupResult,
    flightSegments: s.flightSegments,
    newTripDepartureDate: s.newTripDepartureDate,
    newTripReturnDate: s.newTripReturnDate,
    newTripDepartureLocation: s.newTripDepartureLocation,
    newTripDestination: s.newTripDestination,
    editingTrip: s.editingTrip,
    editTripDepartureLocation: s.editTripDepartureLocation,
    editTripDestination: s.editTripDestination,
    editTripDepartureDate: s.editTripDepartureDate,
    editTripReturnDate: s.editTripReturnDate,
    editTripNotes: s.editTripNotes,
    tripModalTranslateY: s.tripModalTranslateY,
    setTrips: s.setTrips,
    setNewTripDepartureLocation: s.setNewTripDepartureLocation,
    setNewTripDestination: s.setNewTripDestination,
    setNewTripDepartureDate: s.setNewTripDepartureDate,
    setNewTripReturnDate: s.setNewTripReturnDate,
    setShowAddTripModal: s.setShowAddTripModal,
    setTripSuggestions: s.setTripSuggestions,
    setDepartureSuggestions: s.setDepartureSuggestions,
    setFlightCarrier: s.setFlightCarrier,
    setFlightNumber: s.setFlightNumber,
    setDetectedAirline: s.setDetectedAirline,
    setFlightSegments: s.setFlightSegments,
    setFlightDetailsExpanded: s.setFlightDetailsExpanded,
    setFlightSuggestions: s.setFlightSuggestions,
    setFlightLookupResult: s.setFlightLookupResult,
    setIsLookingUpFlight: s.setIsLookingUpFlight,
    setFlightNotFound: s.setFlightNotFound,
    setShowManualEntry: s.setShowManualEntry,
    setEditingTrip: s.setEditingTrip,
    setEditTripDepartureLocation: s.setEditTripDepartureLocation,
    setEditTripDestination: s.setEditTripDestination,
    setEditTripDepartureDate: s.setEditTripDepartureDate,
    setEditTripReturnDate: s.setEditTripReturnDate,
    setEditTripNotes: s.setEditTripNotes,
    setShowEditTripModal: s.setShowEditTripModal,
    setEditTripSuggestions: s.setEditTripSuggestions,
    setEditTripDepartureSuggestions: s.setEditTripDepartureSuggestions,
  });

  const handleRefresh = async () => {
    if (travelHealth) {
      setIsRefreshing(true);
      setApiErrors(() => ({}));
      try {
        if (travelHealth.coordinates) {
          await updateTravelHealthData({
            name: travelHealth.location,
            country: travelHealth.country || "Unknown",
            coordinates: travelHealth.coordinates,
            timezone: "UTC",
            elevation: 0,
          });
        }
      } catch {
        setApiErrors((prev) => ({
          ...prev,
          general:
            "Failed to refresh data. Please check your internet connection.",
        }));
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  /**
   * Fetch health data for a location and reveal the results panel. Shared by the
   * city-picker and the "use my current location" paths, which previously carried
   * identical copies of this load/error/reveal sequence.
   */
  const loadHealthForLocation = async (
    locationData: LocationData,
    displayName: string,
  ) => {
    setIsLoading(true);
    resultsOpacity.setValue(1);
    resultsTranslateY.setValue(0);
    try {
      await Promise.all([
        updateTravelHealthData(locationData),
        delay(MIN_LOAD_MS),
      ]);
      setSelectedLocation(displayName);
    } catch {
      setApiErrors((prev) => ({
        ...prev,
        general: "Failed to fetch health data. Please try again.",
      }));
    } finally {
      setIsLoading(false);
      setShowInlineSuggestions(false);
      resultsOpacity.setValue(1);
      resultsTranslateY.setValue(0);
    }
  };

  const handleLocationSelect = async (city: string) => {
    setSearchLocation(city);
    setInputText(city);
    setFilteredCities([]);
    const matchedCity = citySearchResults.find(
      (r) => `${r.name}, ${r.country}` === city || r.name === city,
    );
    const locationData: LocationData = matchedCity
      ? {
          name: matchedCity.name,
          country: matchedCity.country,
          coordinates: matchedCity.coordinates,
          timezone: matchedCity.timezone || "UTC",
          elevation: 0,
        }
      : {
          name: city,
          country: "Unknown",
          coordinates: { latitude: 0, longitude: 0 },
          timezone: "UTC",
          elevation: 0,
        };
    await loadHealthForLocation(locationData, city);
  };

  const handleEmergencyContactPress = () => {
    Alert.alert(
      "Call Emergency Services?",
      "Are you sure you want to call 112?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            try {
              Linking.openURL("tel:112");
            } catch {
              Alert.alert(
                "Unable to call",
                "This device cannot place phone calls.",
              );
            }
          },
        },
      ],
    );
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (selectedDate) {
        if (showDatePicker === "departure")
          setNewTripDepartureDate(selectedDate);
        else if (showDatePicker === "return")
          setNewTripReturnDate(selectedDate);
        else if (showDatePicker === "departureTime")
          setNewTripDepartureTime(selectedDate);
        else if (showDatePicker === "returnTime")
          setNewTripReturnTime(selectedDate);
      }
      setShowDatePicker(null);
      return;
    }
    // On iOS inline mode, only store in ref — no state update to avoid re-render snapping the calendar
    if (selectedDate) pendingDateRef.current = new Date(selectedDate);
  };

  const handleGetCurrentLocationForSearch = async () => {
    try {
      setIsGettingLocation(true);
      const location = await getCurrentLocation();
      if (location) {
        const cityName = location.name;
        setShowInlineSuggestions(false);
        setSearchLocation(cityName);
        setFilteredCities([]);
        setInputText(cityName);
        await loadHealthForLocation(location, cityName);
        Keyboard.dismiss();
      }
    } catch {
      Alert.alert(
        "Location Permission Required",
        "Please enable location access in Settings to use this feature.",
        [
          { text: "Cancel", style: "cancel" },
          // Was a no-op, so the button did nothing at all. Deep-link to the app's
          // own settings pane where the location permission actually lives.
          { text: "Settings", onPress: () => Linking.openSettings() },
        ],
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  /**
   * Resolve the device location into a departure field. The add-trip and
   * edit-trip forms differ only in which pair of setters they write to.
   */
  const fillDepartureFromCurrentLocation = async (
    setLocation: (v: string) => void,
    clearSuggestions: (v: string[]) => void,
  ) => {
    const location = await getCurrentLocation();
    if (!location) return;
    const name =
      location.country && location.country !== "Unknown"
        ? `${location.name}, ${location.country}`
        : location.name;
    setLocation(name);
    clearSuggestions([]);
    Keyboard.dismiss();
  };

  const handleGetCurrentLocationForTrip = () =>
    fillDepartureFromCurrentLocation(
      s.setNewTripDepartureLocation,
      s.setDepartureSuggestions,
    );

  const handleGetCurrentLocationForEdit = () =>
    fillDepartureFromCurrentLocation(
      s.setEditTripDepartureLocation,
      setEditTripDepartureSuggestions,
    );

  const handleDateConfirm = () => {
    const picked = pendingDateRef.current;
    if (picked) {
      if (showDatePicker === "departure") setNewTripDepartureDate(picked);
      else if (showDatePicker === "return") setNewTripReturnDate(picked);
      else if (showDatePicker === "departureTime")
        setNewTripDepartureTime(picked);
      else if (showDatePicker === "returnTime") setNewTripReturnTime(picked);
    }
    pendingDateRef.current = undefined;
    setTempDatePickerValue(undefined);
    setShowDatePicker(null);
  };

  const handleDateCancel = () => {
    pendingDateRef.current = undefined;
    setTempDatePickerValue(undefined);
    setShowDatePicker(null);
  };

  const handleEditDateChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) setTempEditDatePickerValue(new Date(selectedDate));
  };

  const handleEditDateConfirm = () => {
    if (tempEditDatePickerValue) {
      if (showEditDatePicker === "departure")
        setEditTripDepartureDate(tempEditDatePickerValue);
      else setEditTripReturnDate(tempEditDatePickerValue);
    }
    setTempEditDatePickerValue(undefined);
    setShowEditDatePicker(null);
  };

  const handleEditDateCancel = () => {
    setTempEditDatePickerValue(undefined);
    setShowEditDatePicker(null);
  };

  return {
    handleRefresh,
    handleLocationSelect,
    handleEmergencyContactPress,
    handleDateChange,
    handleGetCurrentLocationForSearch,
    handleGetCurrentLocationForTrip,
    handleGetCurrentLocationForEdit,
    handleDateConfirm,
    handleDateCancel,
    handleEditDateChange,
    handleEditDateConfirm,
    handleEditDateCancel,
    ...tripHandlers,
  };
}
