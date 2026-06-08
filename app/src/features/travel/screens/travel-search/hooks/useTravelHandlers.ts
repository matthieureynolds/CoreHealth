import React from 'react';
import { Alert, Keyboard } from 'react-native';
import { Animated } from 'react-native';
import { LocationData } from '../../../../../shared/types';
import { createTripHandlers } from './useTripHandlers';

export type { Trip } from './useTripHandlers';
export { buildJetLagPlanner } from './useTripHandlers';

import type { Trip } from './useTripHandlers';

/**
 * All state from useTravelState(), plus external deps and curtain state.
 * Accepts the state object directly to avoid 60+ individual params.
 */
export interface TravelHandlersParams {
  // The full state object from useTravelState()
  s: ReturnType<typeof import('./useTravelState').useTravelState>;
  // External dependencies
  travelHealth: any;
  updateTravelHealthData: (locationData: LocationData) => Promise<void>;
  getCurrentLocation: () => Promise<any>;
  // Curtain state
  contentMeasuredHeight: number;
  setContentMeasuredHeight: (v: number) => void;
}

export function createTravelHandlers(params: TravelHandlersParams) {
  const { s, travelHealth, updateTravelHealthData, getCurrentLocation } = params;
  const {
    citySearchResults, showDatePicker, tempDatePickerValue,
    showEditDatePicker, tempEditDatePickerValue, resultsOpacity, resultsTranslateY,
    setSearchLocation, setInputText, setFilteredCities, setIsLoading,
    setSelectedLocation, setShowInlineSuggestions, setApiErrors,
    setIsRefreshing, setIsGettingLocation, setNewTripDepartureDate,
    setNewTripReturnDate, setNewTripDepartureTime, setNewTripReturnTime,
    setShowDatePicker, setTempDatePickerValue,
    pendingDateRef,
    setShowEditDatePicker, setTempEditDatePickerValue,
    setEditTripDepartureDate, setEditTripReturnDate, setEditTripDepartureSuggestions,
  } = s;

  const tripHandlers = createTripHandlers({
    flightCarrier: s.flightCarrier, flightNumber: s.flightNumber,
    flightLookupResult: s.flightLookupResult, flightSegments: s.flightSegments,
    newTripDepartureDate: s.newTripDepartureDate, newTripReturnDate: s.newTripReturnDate,
    newTripDepartureLocation: s.newTripDepartureLocation, newTripDestination: s.newTripDestination,
    editingTrip: s.editingTrip, editTripDepartureLocation: s.editTripDepartureLocation,
    editTripDestination: s.editTripDestination, editTripDepartureDate: s.editTripDepartureDate,
    editTripReturnDate: s.editTripReturnDate, editTripNotes: s.editTripNotes,
    tripModalTranslateY: s.tripModalTranslateY, setTrips: s.setTrips,
    setNewTripDepartureLocation: s.setNewTripDepartureLocation,
    setNewTripDestination: s.setNewTripDestination,
    setNewTripDepartureDate: s.setNewTripDepartureDate,
    setNewTripReturnDate: s.setNewTripReturnDate,
    setShowAddTripModal: s.setShowAddTripModal, setTripSuggestions: s.setTripSuggestions,
    setDepartureSuggestions: s.setDepartureSuggestions, setFlightCarrier: s.setFlightCarrier,
    setFlightNumber: s.setFlightNumber, setDetectedAirline: s.setDetectedAirline,
    setFlightSegments: s.setFlightSegments, setFlightDetailsExpanded: s.setFlightDetailsExpanded,
    setFlightLookupResult: s.setFlightLookupResult, setIsLookingUpFlight: s.setIsLookingUpFlight, setFlightNotFound: s.setFlightNotFound,
    setShowManualEntry: s.setShowManualEntry, setEditingTrip: s.setEditingTrip,
    setEditTripDepartureLocation: s.setEditTripDepartureLocation,
    setEditTripDestination: s.setEditTripDestination,
    setEditTripDepartureDate: s.setEditTripDepartureDate,
    setEditTripReturnDate: s.setEditTripReturnDate, setEditTripNotes: s.setEditTripNotes,
    setShowEditTripModal: s.setShowEditTripModal, setEditTripSuggestions: s.setEditTripSuggestions,
    setEditTripDepartureSuggestions: s.setEditTripDepartureSuggestions,
  });

  const handleRefresh = async () => {
    if (travelHealth) {
      setIsRefreshing(true);
      setApiErrors(() => ({}));
      try {
        if (travelHealth.coordinates) {
          await updateTravelHealthData({ name: travelHealth.location, country: travelHealth.country || 'Unknown', coordinates: travelHealth.coordinates, timezone: 'UTC', elevation: 0 });
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
        ? { name: matchedCity.name, country: matchedCity.country, coordinates: matchedCity.coordinates, timezone: matchedCity.timezone || 'UTC', elevation: 0 }
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
        else if (showDatePicker === 'departureTime') setNewTripDepartureTime(selectedDate);
        else if (showDatePicker === 'returnTime') setNewTripReturnTime(selectedDate);
      }
      setShowDatePicker(null); return;
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
        setShowInlineSuggestions(false); setSearchLocation(cityName); setFilteredCities([]);
        setInputText(cityName); setIsLoading(true);
        resultsOpacity.setValue(1); resultsTranslateY.setValue(0);
        try {
          await updateTravelHealthData(location);
          setSelectedLocation(cityName);
        } catch {
          setApiErrors(prev => ({ ...prev, general: 'Failed to fetch health data. Please try again.' }));
        } finally {
          setIsLoading(false); setShowInlineSuggestions(false);
          resultsOpacity.setValue(1); resultsTranslateY.setValue(0);
        }
        Keyboard.dismiss();
      }
    } catch {
      Alert.alert('Location Permission Required', 'Please enable location access in Settings to use this feature.', [
        { text: 'Cancel', style: 'cancel' }, { text: 'Settings', onPress: () => {} },
      ]);
    } finally { setIsGettingLocation(false); }
  };

  const handleGetCurrentLocationForTrip = async () => {
    const location = await getCurrentLocation();
    if (location) {
      const name = location.country && location.country !== 'Unknown' ? `${location.name}, ${location.country}` : location.name;
      s.setNewTripDepartureLocation(name); s.setDepartureSuggestions([]); Keyboard.dismiss();
    }
  };

  const handleGetCurrentLocationForEdit = async () => {
    const location = await getCurrentLocation();
    if (location) {
      const name = location.country && location.country !== 'Unknown' ? `${location.name}, ${location.country}` : location.name;
      s.setEditTripDepartureLocation(name); setEditTripDepartureSuggestions([]); Keyboard.dismiss();
    }
  };

  const handleDateConfirm = () => {
    const picked = pendingDateRef.current;
    if (picked) {
      if (showDatePicker === 'departure') setNewTripDepartureDate(picked);
      else if (showDatePicker === 'return') setNewTripReturnDate(picked);
      else if (showDatePicker === 'departureTime') setNewTripDepartureTime(picked);
      else if (showDatePicker === 'returnTime') setNewTripReturnTime(picked);
    }
    pendingDateRef.current = undefined;
    setTempDatePickerValue(undefined); setShowDatePicker(null);
  };

  const handleDateCancel = () => { pendingDateRef.current = undefined; setTempDatePickerValue(undefined); setShowDatePicker(null); };

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
