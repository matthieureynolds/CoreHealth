import { useState } from "react";
import { useCitySuggestions } from "./useCitySuggestions";

/** Fields of the add-trip form, with debounced city suggestions for both location inputs. */
export function useAddTripForm() {
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
  const [tripSuggestions, setTripSuggestions] = useState<string[]>([]);
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>(
    [],
  );

  useCitySuggestions(newTripDestination, setTripSuggestions);
  useCitySuggestions(newTripDepartureLocation, setDepartureSuggestions);

  return {
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
    tripSuggestions,
    setTripSuggestions,
    departureSuggestions,
    setDepartureSuggestions,
  };
}
