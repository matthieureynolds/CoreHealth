import { useState } from "react";
import { useCitySuggestions } from "./useCitySuggestions";
import type { Trip } from "./trip";

/** Fields of the edit-trip form. Mirrors useAddTripForm for the editing flow. */
export function useEditTripForm() {
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editTripDestination, setEditTripDestination] = useState("");
  const [editTripDepartureDate, setEditTripDepartureDate] = useState(
    new Date(),
  );
  const [editTripReturnDate, setEditTripReturnDate] = useState<
    Date | undefined
  >(undefined);
  const [editTripNotes, setEditTripNotes] = useState("");
  const [editTripSuggestions, setEditTripSuggestions] = useState<string[]>([]);
  const [editTripDepartureLocation, setEditTripDepartureLocation] =
    useState("");
  const [editTripDepartureSuggestions, setEditTripDepartureSuggestions] =
    useState<string[]>([]);

  useCitySuggestions(editTripDestination, setEditTripSuggestions);
  useCitySuggestions(
    editTripDepartureLocation,
    setEditTripDepartureSuggestions,
  );

  return {
    editingTrip,
    setEditingTrip,
    editTripDestination,
    setEditTripDestination,
    editTripDepartureDate,
    setEditTripDepartureDate,
    editTripReturnDate,
    setEditTripReturnDate,
    editTripNotes,
    setEditTripNotes,
    editTripSuggestions,
    setEditTripSuggestions,
    editTripDepartureLocation,
    setEditTripDepartureLocation,
    editTripDepartureSuggestions,
    setEditTripDepartureSuggestions,
  };
}
