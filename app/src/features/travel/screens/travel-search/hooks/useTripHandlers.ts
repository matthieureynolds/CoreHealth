export type { Trip } from "./trip";

import { Alert } from "react-native";
import { Animated } from "react-native";
import { fetchAuthSession } from "aws-amplify/auth";
import { api } from "@shared/services/data/apiClient";
import { FlightLookupService } from "@shared/services/jetlag-brain/enhancedJetLagService";
import { getCityTimezone } from "@shared/services/jetlag-brain/jetLagService";
import { FlightOption } from "@shared/types";
import { logger } from "@shared/utils/logger";
import type { Trip } from "./trip";
import { buildJetLagPlanner, validateTrip } from "./tripRules";

function syncTripToBackend(trip: Trip) {
  fetchAuthSession()
    .then((session) => {
      const userId = session.tokens?.idToken?.payload?.sub as
        | string
        | undefined;
      if (!userId) {
        logger.warn("[syncTrip] No user ID found in session, skipping sync");
        return;
      }
      api
        .post(`/users/${userId}/trips`, {
          departureLocation: trip.departureLocation,
          destination: trip.destination,
          departureDate:
            trip.departureDate instanceof Date
              ? trip.departureDate.toISOString()
              : trip.departureDate,
          returnDate: trip.returnDate
            ? trip.returnDate instanceof Date
              ? trip.returnDate.toISOString()
              : trip.returnDate
            : undefined,
          timezone: trip.timezone,
          notes: trip.notes,
          tripData: {
            originTimezone: trip.originTimezone,
            layovers: trip.layovers,
            jetLagPlanner: trip.jetLagPlanner,
            checklist: trip.checklist,
          },
        })
        .catch((error) => {
          logger.error("[syncTrip] Failed to sync trip to backend:", error);
        });
    })
    .catch((error) => {
      logger.error("[syncTrip] Failed to get auth session:", error);
    });
}

export interface TripHandlersParams {
  flightCarrier: string;
  flightNumber: string;
  flightLookupResult: FlightOption | null;
  flightSegments: FlightOption[];
  newTripDepartureDate: Date | undefined;
  newTripReturnDate: Date | undefined;
  newTripDepartureLocation: string;
  newTripDestination: string;
  editingTrip: Trip | null;
  editTripDepartureLocation: string;
  editTripDestination: string;
  editTripDepartureDate: Date;
  editTripReturnDate: Date | undefined;
  editTripNotes: string;
  tripModalTranslateY: Animated.Value;
  setTrips: (fn: (prev: Trip[]) => Trip[]) => void;
  setNewTripDepartureLocation: (v: string) => void;
  setNewTripDestination: (v: string) => void;
  setNewTripDepartureDate: (v: Date) => void;
  setNewTripReturnDate: (v: Date | undefined) => void;
  setShowAddTripModal: (v: boolean) => void;
  setTripSuggestions: (v: string[]) => void;
  setDepartureSuggestions: (v: string[]) => void;
  setFlightCarrier: (v: string) => void;
  setFlightNumber: (v: string) => void;
  setDetectedAirline: (v: string | null) => void;
  setFlightSegments: (fn: (prev: FlightOption[]) => FlightOption[]) => void;
  setFlightDetailsExpanded: (v: boolean) => void;
  setFlightSuggestions: (v: FlightOption[]) => void;
  setFlightLookupResult: (v: FlightOption | null) => void;
  setIsLookingUpFlight: (v: boolean) => void;
  setFlightNotFound: (v: boolean) => void;
  setShowManualEntry: (v: boolean) => void;
  setEditingTrip: (v: Trip | null) => void;
  setEditTripDepartureLocation: (v: string) => void;
  setEditTripDestination: (v: string) => void;
  setEditTripDepartureDate: (v: Date) => void;
  setEditTripReturnDate: (v: Date | undefined) => void;
  setEditTripNotes: (v: string) => void;
  setShowEditTripModal: (v: boolean) => void;
  setEditTripSuggestions: (v: string[]) => void;
  setEditTripDepartureSuggestions: (v: string[]) => void;
}

export function createTripHandlers(params: TripHandlersParams) {
  const {
    flightCarrier,
    flightNumber,
    flightLookupResult,
    flightSegments,
    newTripDepartureDate,
    newTripReturnDate,
    newTripDepartureLocation,
    newTripDestination,
    editingTrip,
    editTripDepartureLocation,
    editTripDestination,
    editTripDepartureDate,
    editTripReturnDate,
    editTripNotes,
    tripModalTranslateY,
    setTrips,
    setNewTripDepartureLocation,
    setNewTripDestination,
    setNewTripDepartureDate,
    setNewTripReturnDate,
    setShowAddTripModal,
    setTripSuggestions,
    setDepartureSuggestions,
    setFlightCarrier,
    setFlightNumber,
    setDetectedAirline,
    setFlightSegments,
    setFlightDetailsExpanded,
    setFlightLookupResult,
    setFlightSuggestions,
    setIsLookingUpFlight,
    setFlightNotFound,
    setShowManualEntry,
    setEditingTrip,
    setEditTripDepartureLocation,
    setEditTripDestination,
    setEditTripDepartureDate,
    setEditTripReturnDate,
    setEditTripNotes,
    setShowEditTripModal,
    setEditTripSuggestions,
    setEditTripDepartureSuggestions,
  } = params;

  const defaultChecklist = () => ({
    vaccines: [
      { name: "COVID-19", completed: false },
      { name: "Hepatitis A", completed: false },
      { name: "Typhoid", completed: false },
    ],
    medicines: [
      { name: "Pain relievers", completed: false },
      { name: "Anti-diarrheal", completed: false },
      { name: "Motion sickness", completed: false },
    ],
  });

  /**
   * Clear the manual trip fields. Every path that closes the add-trip modal —
   * saving manually, confirming a flight, or cancelling — ends with this same
   * teardown, so it lived in three places and drifted between them.
   */
  const resetTripForm = () => {
    setNewTripDepartureLocation("");
    setNewTripDestination("");
    setNewTripDepartureDate(new Date());
    setNewTripReturnDate(undefined);
  };

  /** Clear the flight-lookup inputs and any segments collected so far. */
  const resetFlightEntry = () => {
    setFlightCarrier("");
    setFlightNumber("");
    setDetectedAirline(null);
    setFlightLookupResult(null);
    setFlightSegments(() => []);
    setFlightDetailsExpanded(false);
  };

  const handleFlightLookup = async () => {
    if (!flightCarrier.trim() || !flightNumber.trim()) {
      Alert.alert("Error", "Please enter both carrier and flight number");
      return;
    }
    try {
      setIsLookingUpFlight(true);
      setFlightNotFound(false);
      const result = await FlightLookupService.lookupFlight(
        flightCarrier.toUpperCase().trim(),
        flightNumber.trim(),
        new Date().toISOString().split("T")[0],
      );
      if (result) {
        setFlightNotFound(false);
        setFlightLookupResult(result);
        setNewTripDepartureLocation(result.origin_iata);
        setNewTripDestination(result.dest_iata);
        setNewTripDepartureDate(new Date(result.dep_local));
        setShowManualEntry(true);
        Alert.alert(
          "Flight Found",
          "Flight details loaded. Please review and confirm.",
        );
      } else {
        setFlightNotFound(true);
      }
    } catch {
      setFlightNotFound(true);
    } finally {
      setIsLookingUpFlight(false);
    }
  };

  const handleAddTrip = () => {
    const error = validateTrip({
      departureLocation: newTripDepartureLocation,
      destination: newTripDestination,
      departureDate: newTripDepartureDate,
      returnDate: newTripReturnDate,
    });
    if (error) {
      Alert.alert("Error", error);
      return;
    }
    // validateTrip guarantees a departure date past this point.
    const departureDate = newTripDepartureDate as Date;
    // Resolve real IANA timezones from the city names so manual trips run the same
    // DST-correct engine as flight-looked-up trips (falls back to UTC if unknown).
    const destTz = getCityTimezone(newTripDestination);
    const originTz = getCityTimezone(newTripDepartureLocation);
    const newTrip: Trip = {
      id: Date.now().toString(),
      departureLocation: newTripDepartureLocation.trim(),
      destination: newTripDestination.trim(),
      departureDate,
      returnDate: newTripReturnDate,
      timezone: destTz ?? "UTC",
      originTimezone: originTz,
      checklist: defaultChecklist(),
      jetLagPlanner: buildJetLagPlanner(newTripReturnDate),
    };
    setTrips((prev) => [...prev, newTrip]);
    syncTripToBackend(newTrip);
    resetTripForm();
    setShowAddTripModal(false);
    setTripSuggestions([]);
    setDepartureSuggestions([]);
    Alert.alert("Success", "Trip added successfully!");
  };

  const handleConfirmFlightTrip = () => {
    const allFlights = flightLookupResult
      ? [...flightSegments, flightLookupResult]
      : flightSegments;
    if (allFlights.length === 0) return;
    const first = allFlights[0];
    const last = allFlights[allFlights.length - 1];
    // Layovers sit between consecutive flights (arrival of one → departure of the next).
    // Fall back to the IATA code when the live lookup didn't supply a city name.
    const layovers = allFlights.slice(0, -1).map((f, i) => ({
      city: f.dest_city ?? f.dest_iata,
      tz: f.dest_tz,
      arr_local: f.arr_local,
      dep_local: allFlights[i + 1].dep_local,
    }));
    const newTrip: Trip = {
      id: Date.now().toString(),
      departureLocation: first.origin_city ?? first.origin_iata,
      destination: last.dest_city ?? last.dest_iata,
      departureDate: new Date(first.dep_local),
      returnDate: undefined,
      timezone: last.dest_tz,
      originTimezone: first.origin_tz,
      layovers: layovers.length ? layovers : undefined,
      checklist: defaultChecklist(),
      jetLagPlanner: {
        departureTime: new Date(first.dep_local).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        arrivalTime: new Date(last.arr_local).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        outboundPlan: {
          direction: "outbound",
          timezoneAdjustment: "+0",
          circadianPlan: [],
        },
      },
    };
    setTrips((prev) => [...prev, newTrip]);
    syncTripToBackend(newTrip);
    setShowAddTripModal(false);
    resetFlightEntry();
    resetTripForm();
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTrips((prev) => prev.filter((t) => t.id !== tripId));
            Alert.alert("Success", "Trip deleted successfully!");
          },
        },
      ],
    );
  };

  const handleModifyTripDates = (trip: Trip) => {
    setEditingTrip(trip);
    setEditTripDepartureLocation(trip.departureLocation || "Home");
    setEditTripDestination(trip.destination);
    setEditTripDepartureDate(trip.departureDate);
    setEditTripReturnDate(trip.returnDate);
    setEditTripNotes(trip.notes || "");
    setShowEditTripModal(true);
  };

  const handleSaveEditTrip = () => {
    if (!editingTrip) {
      Alert.alert("Error", "No trip selected");
      return;
    }
    const error = validateTrip({
      departureLocation: editTripDepartureLocation,
      destination: editTripDestination,
      departureDate: editTripDepartureDate,
      returnDate: editTripReturnDate,
    });
    if (error) {
      Alert.alert("Error", error);
      return;
    }
    // Re-resolve timezones in case the cities changed (keep existing if still unknown).
    const editDestTz =
      getCityTimezone(editTripDestination) ?? editingTrip.timezone;
    const editOriginTz =
      getCityTimezone(editTripDepartureLocation) ?? editingTrip.originTimezone;
    const updatedTrip: Trip = {
      ...editingTrip,
      departureLocation: editTripDepartureLocation.trim(),
      destination: editTripDestination.trim(),
      departureDate: editTripDepartureDate,
      returnDate: editTripReturnDate,
      notes: editTripNotes.trim(),
      timezone: editDestTz,
      originTimezone: editOriginTz,
      jetLagPlanner: buildJetLagPlanner(editTripReturnDate),
    };
    setTrips((prev) =>
      prev.map((t) => (t.id === editingTrip.id ? updatedTrip : t)),
    );
    setEditingTrip(null);
    setEditTripDepartureLocation("");
    setEditTripDestination("");
    setEditTripDepartureDate(new Date());
    setEditTripReturnDate(undefined);
    setEditTripNotes("");
    setShowEditTripModal(false);
    setEditTripSuggestions([]);
    setEditTripDepartureSuggestions([]);
    Alert.alert("Success", "Trip updated successfully!");
  };

  // Pick a flight from the live suggestions list and load it as the active result.
  const handleSelectFlightSuggestion = (flight: FlightOption) => {
    setFlightCarrier(flight.carrier);
    setFlightNumber(flight.number);
    setFlightLookupResult(flight);
    setFlightSuggestions([]);
    setFlightNotFound(false);
    setFlightDetailsExpanded(true);
  };

  // Commit the active flight as a segment and reset the inputs for the next one.
  const handleAddAnotherFlight = () => {
    const lookup = flightLookupResult;
    if (!lookup) return;
    setFlightSegments((prev) => [...prev, lookup]);
    setFlightLookupResult(null);
    setFlightCarrier("");
    setFlightNumber("");
    setFlightDetailsExpanded(false);
  };

  // Pull an added segment back into the active editing slot so the user can
  // review / re-look-up / change it, preserving any in-progress flight.
  const handleEditSegment = (index: number) => {
    const seg = flightSegments[index];
    if (!seg) return;
    const lookup = flightLookupResult;
    setFlightSegments((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (lookup) next.push(lookup);
      return next;
    });
    setFlightCarrier(seg.carrier);
    setFlightNumber(seg.number);
    setFlightLookupResult(seg);
    setFlightSuggestions([]);
    setFlightNotFound(false);
    setFlightDetailsExpanded(true);
  };

  const handleCloseAddTrip = () => {
    setShowAddTripModal(false);
    setShowManualEntry(false);
    resetFlightEntry();
    resetTripForm();
    tripModalTranslateY.setValue(0);
  };

  return {
    handleFlightLookup,
    handleAddTrip,
    handleConfirmFlightTrip,
    handleDeleteTrip,
    handleModifyTripDates,
    handleSaveEditTrip,
    handleCloseAddTrip,
    handleSelectFlightSuggestion,
    handleAddAnotherFlight,
    handleEditSegment,
  };
}
