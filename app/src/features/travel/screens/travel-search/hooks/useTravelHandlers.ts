import { Alert, Keyboard } from 'react-native';
import { Animated } from 'react-native';
import { LocationData } from '../../../../../shared/types';
import { createTripHandlers } from './useTripHandlers';

export type { Trip } from './useTripHandlers';
export { buildJetLagPlanner } from './useTripHandlers';

// Re-export Trip for backward compatibility
import type { Trip } from './useTripHandlers';

type SetStr = (v: string) => void;
type SetBool = (v: boolean) => void;
type SetDate = (v: Date) => void;
type SetDateOpt = (v: Date | undefined) => void;
type SetAny = (v: any) => void;
type SetAnyFn = (fn: (prev: any) => any) => void;
type SetPicker = (v: 'departure' | 'return' | null) => void;

export interface TravelHandlersParams {
  travelHealth: any; inputText: string; searchLocation: string;
  selectedLocation: string; citySearchResults: any[]; popularCities: string[];
  contentMeasuredHeight: number;
  flightCarrier: string; flightNumber: string; flightLookupResult: any;
  flightSegments: any[]; showDatePicker: 'departure' | 'return' | null;
  tempDatePickerValue: Date | undefined; newTripDepartureDate: Date;
  newTripReturnDate: Date | undefined; newTripDepartureLocation: string;
  newTripDestination: string; editingTrip: Trip | null;
  editTripDepartureLocation: string; editTripDestination: string;
  editTripDepartureDate: Date; editTripReturnDate: Date | undefined;
  editTripNotes: string; showEditDatePicker: 'departure' | 'return' | null;
  tempEditDatePickerValue: Date | undefined;
  resultsOpacity: Animated.Value; resultsTranslateY: Animated.Value;
  tripModalTranslateY: Animated.Value;
  updateTravelHealthData: (locationData: LocationData) => Promise<void>;
  getCurrentLocation: () => Promise<any>;
  setSearchLocation: SetStr; setInputText: SetStr; setFilteredCities: (v: string[]) => void;
  setIsLoading: SetBool; setSelectedLocation: SetStr; setCitySearchResults: (v: any[]) => void;
  setShowInlineSuggestions: SetBool; setApiErrors: SetAnyFn; setIsRefreshing: SetBool;
  setIsGettingLocation: SetBool; setIsLookingUpFlight: SetBool; setFlightLookupResult: SetAny;
  setNewTripDepartureLocation: SetStr; setNewTripDestination: SetStr;
  setNewTripDepartureDate: SetDate; setShowManualEntry: SetBool;
  setTrips: (fn: (prev: Trip[]) => Trip[]) => void; setNewTripReturnDate: SetDateOpt;
  setShowAddTripModal: SetBool; setTripSuggestions: (v: string[]) => void;
  setDepartureSuggestions: (v: string[]) => void; setFlightCarrier: SetStr;
  setFlightNumber: SetStr; setDetectedAirline: (v: string | null) => void;
  setFlightSegments: (fn: (prev: any[]) => any[]) => void; setFlightDetailsExpanded: SetBool;
  setEditingTrip: (v: Trip | null) => void; setEditTripDepartureLocation: SetStr;
  setEditTripDestination: SetStr; setEditTripDepartureDate: SetDate;
  setEditTripReturnDate: SetDateOpt; setEditTripNotes: SetStr; setShowEditTripModal: SetBool;
  setEditTripSuggestions: (v: string[]) => void; setEditTripDepartureSuggestions: (v: string[]) => void;
  setShowDatePicker: SetPicker; setTempDatePickerValue: SetDateOpt;
  setShowEditDatePicker: SetPicker; setTempEditDatePickerValue: SetDateOpt;
  setContentMeasuredHeight: (v: number) => void;
  setShowDirectionsModal: (v: string | null) => void; setShowEmergencyModal: SetBool;
}

export function createTravelHandlers(params: TravelHandlersParams) {
  const {
    travelHealth, citySearchResults, showDatePicker, tempDatePickerValue,
    showEditDatePicker, tempEditDatePickerValue, resultsOpacity, resultsTranslateY,
    updateTravelHealthData, getCurrentLocation,
    setSearchLocation, setInputText, setFilteredCities, setIsLoading,
    setSelectedLocation, setShowInlineSuggestions, setApiErrors,
    setIsRefreshing, setIsGettingLocation, setNewTripDepartureDate,
    setNewTripReturnDate, setShowDatePicker, setTempDatePickerValue,
    setShowEditDatePicker, setTempEditDatePickerValue,
    setEditTripDepartureDate, setEditTripReturnDate, setEditTripDepartureSuggestions,
  } = params;

  const tripHandlers = createTripHandlers({
    flightCarrier: params.flightCarrier, flightNumber: params.flightNumber,
    flightLookupResult: params.flightLookupResult, flightSegments: params.flightSegments,
    newTripDepartureDate: params.newTripDepartureDate, newTripReturnDate: params.newTripReturnDate,
    newTripDepartureLocation: params.newTripDepartureLocation, newTripDestination: params.newTripDestination,
    editingTrip: params.editingTrip, editTripDepartureLocation: params.editTripDepartureLocation,
    editTripDestination: params.editTripDestination, editTripDepartureDate: params.editTripDepartureDate,
    editTripReturnDate: params.editTripReturnDate, editTripNotes: params.editTripNotes,
    tripModalTranslateY: params.tripModalTranslateY, setTrips: params.setTrips,
    setNewTripDepartureLocation: params.setNewTripDepartureLocation,
    setNewTripDestination: params.setNewTripDestination,
    setNewTripDepartureDate: params.setNewTripDepartureDate,
    setNewTripReturnDate: params.setNewTripReturnDate,
    setShowAddTripModal: params.setShowAddTripModal, setTripSuggestions: params.setTripSuggestions,
    setDepartureSuggestions: params.setDepartureSuggestions, setFlightCarrier: params.setFlightCarrier,
    setFlightNumber: params.setFlightNumber, setDetectedAirline: params.setDetectedAirline,
    setFlightSegments: params.setFlightSegments, setFlightDetailsExpanded: params.setFlightDetailsExpanded,
    setFlightLookupResult: params.setFlightLookupResult, setIsLookingUpFlight: params.setIsLookingUpFlight,
    setShowManualEntry: params.setShowManualEntry, setEditingTrip: params.setEditingTrip,
    setEditTripDepartureLocation: params.setEditTripDepartureLocation,
    setEditTripDestination: params.setEditTripDestination,
    setEditTripDepartureDate: params.setEditTripDepartureDate,
    setEditTripReturnDate: params.setEditTripReturnDate, setEditTripNotes: params.setEditTripNotes,
    setShowEditTripModal: params.setShowEditTripModal, setEditTripSuggestions: params.setEditTripSuggestions,
    setEditTripDepartureSuggestions: params.setEditTripDepartureSuggestions,
  });

  const handleRefresh = async () => {
    if (travelHealth) {
      setIsRefreshing(true);
      setApiErrors(() => ({}));
      try {
        if (travelHealth.coordinates) {
          await updateTravelHealthData({ name: travelHealth.location, country: 'Unknown', coordinates: travelHealth.coordinates, timezone: 'UTC', elevation: 0 });
        }
      } catch {
        setApiErrors(prev => ({ ...prev, general: 'Failed to refresh data. Please check your internet connection.' }));
      } finally { setIsRefreshing(false); }
    }
  };

  const handleLocationSelect = async (city: string) => {
    setSearchLocation(city); setInputText(city); setFilteredCities([]);
    setIsLoading(true); resultsOpacity.setValue(1); resultsTranslateY.setValue(0);
    try {
      const matchedCity = citySearchResults.find(r => `${r.name}, ${r.country}` === city || r.name === city);
      const locationData = matchedCity
        ? { name: matchedCity.name, country: matchedCity.country, coordinates: { latitude: 0, longitude: 0 }, timezone: 'UTC', elevation: 0 }
        : { name: city, country: 'Unknown', coordinates: { latitude: 0, longitude: 0 }, timezone: 'UTC', elevation: 0 };
      await updateTravelHealthData(locationData);
      setSelectedLocation(city);
    } catch {
      setApiErrors(prev => ({ ...prev, general: 'Failed to fetch health data. Please try again.' }));
    } finally {
      setIsLoading(false); setShowInlineSuggestions(false);
      resultsOpacity.setValue(1); resultsTranslateY.setValue(0);
    }
  };

  const handleEmergencyContactPress = () => {
    Alert.alert('Call Emergency Services?', 'Are you sure you want to call 112?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => { try { require('react-native').Linking.openURL('tel:112'); } catch { Alert.alert('Unable to call', 'This device cannot place phone calls.'); } } },
    ]);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (require('react-native').Platform.OS === 'android') {
      if (selectedDate) {
        if (showDatePicker === 'departure') setNewTripDepartureDate(selectedDate);
        else if (showDatePicker === 'return') setNewTripReturnDate(selectedDate);
      }
      setShowDatePicker(null); return;
    }
    if (selectedDate) setTempDatePickerValue(new Date(selectedDate));
  };

  const handleGetCurrentLocationForSearch = async () => {
    try {
      setIsGettingLocation(true);
      const location = await getCurrentLocation();
      if (location) {
        const cityName = 'Current Location';
        setShowInlineSuggestions(false); setSearchLocation(cityName); setFilteredCities([]);
        await handleLocationSelect(cityName); Keyboard.dismiss();
      }
    } catch {
      Alert.alert('Location Permission Required', 'Please enable location access in Settings to use this feature.', [
        { text: 'Cancel', style: 'cancel' }, { text: 'Settings', onPress: () => {} },
      ]);
    } finally { setIsGettingLocation(false); }
  };

  const handleGetCurrentLocationForTrip = async () => {
    const location = await getCurrentLocation();
    if (location) { params.setNewTripDepartureLocation('Current Location'); params.setDepartureSuggestions([]); Keyboard.dismiss(); }
  };

  const handleGetCurrentLocationForEdit = async () => {
    const location = await getCurrentLocation();
    if (location) { params.setEditTripDepartureLocation('Current Location'); setEditTripDepartureSuggestions([]); Keyboard.dismiss(); }
  };

  const handleDateConfirm = () => {
    if (tempDatePickerValue) {
      if (showDatePicker === 'departure') setNewTripDepartureDate(tempDatePickerValue);
      else if (showDatePicker === 'return') setNewTripReturnDate(tempDatePickerValue);
    }
    setTempDatePickerValue(undefined); setShowDatePicker(null);
  };

  const handleDateCancel = () => { setTempDatePickerValue(undefined); setShowDatePicker(null); };

  const handleEditDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setTempEditDatePickerValue(new Date(selectedDate));
  };

  const handleEditDateConfirm = () => {
    if (tempEditDatePickerValue) {
      if (showEditDatePicker === 'departure') setEditTripDepartureDate(tempEditDatePickerValue);
      else setEditTripReturnDate(tempEditDatePickerValue);
    }
    setTempEditDatePickerValue(undefined); setShowEditDatePicker(null);
  };

  const handleEditDateCancel = () => { setTempEditDatePickerValue(undefined); setShowEditDatePicker(null); };

  return {
    handleRefresh, handleLocationSelect, handleEmergencyContactPress,
    handleDateChange, handleGetCurrentLocationForSearch, handleGetCurrentLocationForTrip,
    handleGetCurrentLocationForEdit, handleDateConfirm, handleDateCancel,
    handleEditDateChange, handleEditDateConfirm, handleEditDateCancel,
    ...tripHandlers,
  };
}
