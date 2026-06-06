import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIRLINE_CODES } from '../travelMetricHelpers';
import { searchAllLocations, getPopularCities, CitySearchResult } from '../../../../../shared/services/travel/citySearchService';
import { Trip } from './useTravelHandlers';

export const popularCities = getPopularCities();

export function useTravelState() {
  const pagerRef = useRef<any>(null);
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsTranslateY = useRef(new Animated.Value(0)).current;
  const rowAnimsRef = useRef<Record<string, { opacity: Animated.Value; translate: Animated.Value }>>({});

  const getRowAnim = (key: string) => {
    if (!rowAnimsRef.current[key]) {
      rowAnimsRef.current[key] = {
        opacity: new Animated.Value(0),
        translate: new Animated.Value(12),
      };
    }
    return rowAnimsRef.current[key];
  };

  // Search state
  const [searchLocation, setSearchLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'trips'>('health');
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [inputText, setInputText] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [citySearchResults, setCitySearchResults] = useState<CitySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [apiErrors, setApiErrors] = useState<{
    airQuality?: string; pollen?: string; weather?: string; healthcare?: string; general?: string;
  }>({});

  // Trip state — persisted to AsyncStorage
  const [trips, setTrips] = useState<Trip[]>([]);
  const tripsInitialized = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem('planned_trips').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTrips(parsed.map((t: any) => ({ ...t, departureDate: new Date(t.departureDate), returnDate: t.returnDate ? new Date(t.returnDate) : undefined })));
        } catch {}
      }
      tripsInitialized.current = true;
    }).catch(() => { tripsInitialized.current = true; });
  }, []);

  useEffect(() => {
    if (!tripsInitialized.current) return;
    AsyncStorage.setItem('planned_trips', JSON.stringify(trips)).catch(() => {});
  }, [trips]);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [flightCarrier, setFlightCarrier] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [detectedAirline, setDetectedAirline] = useState<string | null>(null);
  const [isLookingUpFlight, setIsLookingUpFlight] = useState(false);
  const [flightNotFound, setFlightNotFound] = useState(false);
  const [flightLookupResult, setFlightLookupResult] = useState<Record<string, unknown> | null>(null);
  const [flightSegments, setFlightSegments] = useState<any[]>([]);
  const [flightDetailsExpanded, setFlightDetailsExpanded] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const tripModalTranslateY = useRef(new Animated.Value(1000)).current;

  const [newTripDepartureLocation, setNewTripDepartureLocation] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripDepartureDate, setNewTripDepartureDate] = useState<Date | undefined>(undefined);
  const [newTripReturnDate, setNewTripReturnDate] = useState<Date | undefined>(undefined);
  const [newTripDepartureTime, setNewTripDepartureTime] = useState<Date | undefined>(undefined);
  const [newTripReturnTime, setNewTripReturnTime] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<'departure' | 'return' | 'departureTime' | 'returnTime' | null>(null);
  const [tempDatePickerValue, setTempDatePickerValue] = useState<Date | undefined>(undefined);
  const pendingDateRef = useRef<Date | undefined>(undefined);
  const datePickerInitializedRef = useRef(false);
  const [tripSuggestions, setTripSuggestions] = useState<string[]>([]);
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>([]);

  const [showDirectionsModal, setShowDirectionsModal] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [metricModalVisible, setMetricModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any | null>(null);

  // Edit trip state
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [editTripDestination, setEditTripDestination] = useState('');
  const [editTripDepartureDate, setEditTripDepartureDate] = useState(new Date());
  const [editTripReturnDate, setEditTripReturnDate] = useState<Date | undefined>(undefined);
  const [editTripNotes, setEditTripNotes] = useState('');
  const [tempEditDatePickerValue, setTempEditDatePickerValue] = useState<Date | undefined>(undefined);
  const editDatePickerInitializedRef = useRef(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState<'departure' | 'return' | null>(null);
  const [editTripSuggestions, setEditTripSuggestions] = useState<string[]>([]);
  const [editTripDepartureLocation, setEditTripDepartureLocation] = useState('');
  const [editTripDepartureSuggestions, setEditTripDepartureSuggestions] = useState<string[]>([]);

  // Detect airline from carrier code
  useEffect(() => {
    const code = flightCarrier.toUpperCase().trim();
    setDetectedAirline(AIRLINE_CODES[code] ?? null);
  }, [flightCarrier]);

  // Date/time picker init (add trip)
  useEffect(() => {
    if (showDatePicker) {
      if (!datePickerInitializedRef.current) {
        let d: Date;
        if (showDatePicker === 'departure') {
          d = newTripDepartureDate ? new Date(newTripDepartureDate) : new Date();
        } else if (showDatePicker === 'return') {
          d = new Date(newTripReturnDate || new Date());
        } else if (showDatePicker === 'departureTime') {
          d = newTripDepartureTime ? new Date(newTripDepartureTime) : new Date();
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
        if (showEditDatePicker === 'departure') setTempEditDatePickerValue(new Date(editTripDepartureDate));
        else setTempEditDatePickerValue(new Date(editTripReturnDate || new Date()));
        editDatePickerInitializedRef.current = true;
      }
    } else {
      setTempEditDatePickerValue(undefined);
      editDatePickerInitializedRef.current = false;
    }
  }, [showEditDatePicker]);

  // Search cities
  useEffect(() => {
    const searchCitiesAsync = async () => {
      if (searchLocation.trim() && searchLocation.length >= 2) {
        setIsSearchingCities(true);
        try {
          const results = await searchAllLocations(searchLocation, 15);
          setCitySearchResults(results);
          const filtered = popularCities.filter(city => city.toLowerCase().includes(searchLocation.toLowerCase()));
          setFilteredCities(filtered);
        } catch {
          const filtered = popularCities.filter(city => city.toLowerCase().includes(searchLocation.toLowerCase()));
          setFilteredCities(filtered);
        } finally {
          setIsSearchingCities(false);
        }
      } else {
        setCitySearchResults([]);
        setFilteredCities([]);
      }
    };
    const timeoutId = setTimeout(searchCitiesAsync, 300);
    return () => clearTimeout(timeoutId);
  }, [searchLocation]);

  // Search trip destination suggestions
  useEffect(() => {
    if (newTripDestination.trim() && newTripDestination.length >= 2) {
      // Show local matches immediately while API loads
      const localMatches = popularCities.filter(city => city.toLowerCase().includes(newTripDestination.toLowerCase()));
      if (localMatches.length > 0) setTripSuggestions(localMatches);
      const id = setTimeout(async () => {
        try {
          const results = await searchAllLocations(newTripDestination, 12);
          if (results.length > 0) {
            setTripSuggestions(results.map(city => `${city.name}, ${city.country}`));
          }
        } catch {
          setTripSuggestions(localMatches);
        }
      }, 300);
      return () => clearTimeout(id);
    } else { setTripSuggestions([]); }
  }, [newTripDestination]);

  // Search departure location suggestions
  useEffect(() => {
    if (newTripDepartureLocation.trim() && newTripDepartureLocation.length >= 2) {
      // Show local matches immediately while API loads
      const localMatches = popularCities.filter(city => city.toLowerCase().includes(newTripDepartureLocation.toLowerCase()));
      if (localMatches.length > 0) setDepartureSuggestions(localMatches);
      const id = setTimeout(async () => {
        try {
          const results = await searchAllLocations(newTripDepartureLocation, 12);
          if (results.length > 0) {
            setDepartureSuggestions(results.map(city => `${city.name}, ${city.country}`));
          }
        } catch {
          setDepartureSuggestions(localMatches);
        }
      }, 300);
      return () => clearTimeout(id);
    } else { setDepartureSuggestions([]); }
  }, [newTripDepartureLocation]);

  // Search edit trip destination suggestions
  useEffect(() => {
    if (editTripDestination.trim() && editTripDestination.length >= 2) {
      const localMatches = popularCities.filter(city => city.toLowerCase().includes(editTripDestination.toLowerCase()));
      if (localMatches.length > 0) setEditTripSuggestions(localMatches);
      const id = setTimeout(async () => {
        try {
          const results = await searchAllLocations(editTripDestination, 12);
          if (results.length > 0) {
            setEditTripSuggestions(results.map(city => `${city.name}, ${city.country}`));
          }
        } catch {
          setEditTripSuggestions(localMatches);
        }
      }, 300);
      return () => clearTimeout(id);
    } else { setEditTripSuggestions([]); }
  }, [editTripDestination]);

  // Search edit trip departure location suggestions
  useEffect(() => {
    if (editTripDepartureLocation.trim() && editTripDepartureLocation.length >= 2) {
      const localMatches = popularCities.filter(city => city.toLowerCase().includes(editTripDepartureLocation.toLowerCase()));
      if (localMatches.length > 0) setEditTripDepartureSuggestions(localMatches);
      const id = setTimeout(async () => {
        try {
          const results = await searchAllLocations(editTripDepartureLocation, 12);
          if (results.length > 0) {
            setEditTripDepartureSuggestions(results.map(city => `${city.name}, ${city.country}`));
          }
        } catch {
          setEditTripDepartureSuggestions(localMatches);
        }
      }, 300);
      return () => clearTimeout(id);
    } else { setEditTripDepartureSuggestions([]); }
  }, [editTripDepartureLocation]);

  return {
    pagerRef,
    resultsOpacity,
    resultsTranslateY,
    getRowAnim,
    tripModalTranslateY,
    // Search state
    searchLocation, setSearchLocation,
    isRefreshing, setIsRefreshing,
    selectedLocation, setSelectedLocation,
    isGettingLocation, setIsGettingLocation,
    activeTab, setActiveTab,
    showInlineSuggestions, setShowInlineSuggestions,
    inputText, setInputText,
    filteredCities, setFilteredCities,
    citySearchResults, setCitySearchResults,
    isLoading, setIsLoading,
    isSearchingCities,
    apiErrors, setApiErrors,
    // Trip state
    trips, setTrips,
    showAddTripModal, setShowAddTripModal,
    flightCarrier, setFlightCarrier,
    flightNumber, setFlightNumber,
    detectedAirline, setDetectedAirline,
    isLookingUpFlight, setIsLookingUpFlight,
    flightNotFound, setFlightNotFound,
    flightLookupResult, setFlightLookupResult,
    flightSegments, setFlightSegments,
    flightDetailsExpanded, setFlightDetailsExpanded,
    showManualEntry, setShowManualEntry,
    newTripDepartureLocation, setNewTripDepartureLocation,
    newTripDestination, setNewTripDestination,
    newTripDepartureDate, setNewTripDepartureDate,
    newTripReturnDate, setNewTripReturnDate,
    newTripDepartureTime, setNewTripDepartureTime,
    newTripReturnTime, setNewTripReturnTime,
    showDatePicker, setShowDatePicker,
    tempDatePickerValue, setTempDatePickerValue, pendingDateRef,
    tripSuggestions, setTripSuggestions,
    departureSuggestions, setDepartureSuggestions,
    // Modal state
    showDirectionsModal, setShowDirectionsModal,
    showEmergencyModal, setShowEmergencyModal,
    metricModalVisible, setMetricModalVisible,
    selectedMetric,
    // Edit trip state
    editingTrip, setEditingTrip,
    showEditTripModal, setShowEditTripModal,
    editTripDestination, setEditTripDestination,
    editTripDepartureDate, setEditTripDepartureDate,
    editTripReturnDate, setEditTripReturnDate,
    editTripNotes, setEditTripNotes,
    tempEditDatePickerValue, setTempEditDatePickerValue,
    showEditDatePicker, setShowEditDatePicker,
    editTripSuggestions, setEditTripSuggestions,
    editTripDepartureLocation, setEditTripDepartureLocation,
    editTripDepartureSuggestions, setEditTripDepartureSuggestions,
  };
}
