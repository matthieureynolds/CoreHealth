import { useState } from "react";
import { TravelApiErrors } from "@shared/types";
import { useTravelAnimations } from "./useTravelAnimations";
import { useTripPersistence } from "./useTripPersistence";
import { useFlightEntry } from "./useFlightEntry";
import { useCitySearch, popularCities } from "./useCitySearch";
import { useAddTripForm } from "./useAddTripForm";
import { useEditTripForm } from "./useEditTripForm";
import { useDatePickers } from "./useDatePickers";

export { popularCities };

export function useTravelState() {
  const anim = useTravelAnimations();

  // Search state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<"health" | "trips">("health");
  const [apiErrors, setApiErrors] = useState<TravelApiErrors>({});

  const { trips, setTrips } = useTripPersistence();

  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const flight = useFlightEntry();
  const search = useCitySearch();
  const addForm = useAddTripForm();
  const editForm = useEditTripForm();
  const pickers = useDatePickers({
    newTripDepartureDate: addForm.newTripDepartureDate,
    newTripReturnDate: addForm.newTripReturnDate,
    newTripDepartureTime: addForm.newTripDepartureTime,
    newTripReturnTime: addForm.newTripReturnTime,
    editTripDepartureDate: editForm.editTripDepartureDate,
    editTripReturnDate: editForm.editTripReturnDate,
  });
  const [showManualEntry, setShowManualEntry] = useState(false);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Edit trip state
  const [showEditTripModal, setShowEditTripModal] = useState(false);

  return {
    ...anim,
    // Search state
    isRefreshing,
    setIsRefreshing,
    isGettingLocation,
    setIsGettingLocation,
    activeTab,
    setActiveTab,
    apiErrors,
    setApiErrors,
    // Trip state
    trips,
    setTrips,
    showAddTripModal,
    setShowAddTripModal,
    ...flight,
    ...search,
    ...addForm,
    ...editForm,
    ...pickers,
    showManualEntry,
    setShowManualEntry,
    // Modal state
    showEmergencyModal,
    setShowEmergencyModal,
    // Edit trip state
    showEditTripModal,
    setShowEditTripModal,
  };
}
