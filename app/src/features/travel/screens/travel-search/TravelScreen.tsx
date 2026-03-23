import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Platform, Keyboard, Linking, Animated, RefreshControl, Easing, Image, Modal, TouchableWithoutFeedback, StyleSheet, StatusBar } from 'react-native';
import { styles } from './TravelScreen.styles';
import {
  getStatusColor, getMetricFixedIconColor, getScoreColor, getStatusLabel,
  getMetricScore, getMetricDetails, getCountryFromCity, getCountryFlag,
  AIRLINE_CODES, GENERAL_MEDS, HEALTH_METRIC_ROWS,
} from './travelMetricHelpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TravelStackParamList, SerializedTrip } from '../../../../shared/types';
import Svg, { Rect, Polygon, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PagerView from 'react-native-pager-view';
import { useHealthData } from '../../../../shared/context/HealthDataContext';
import { useSettings } from '../../../../shared/context/SettingsContext';
import { useAuth } from '../../../../shared/context/AuthContext';
import { FlightLookupService } from '../../../../shared/services/travel/enhancedJetLagService';
import { searchCities, searchAllLocations, getPopularCities, CitySearchResult } from '../../../../shared/services/travel/citySearchService';
import { useReduceMotion } from '../../../../shared/utils/reduceMotion';

interface Trip {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  notes?: string;
  jetLagData?: any;
  isSequential?: boolean;
  previousTripImpact?: number;
  checklist?: {
    vaccines: Array<{ name: string; completed: boolean }>;
    medicines: Array<{ name: string; completed: boolean }>;
  };
  jetLagPlanner?: {
    departureTime: string;
    arrivalTime: string;
    outboundPlan: {
      direction: 'outbound';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
    returnPlan?: {
      direction: 'return';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
  };
}

interface HealthMetric {
  name: string;
  value: string;
  status: 'good' | 'moderate' | 'poor' | 'unknown';
  description: string;
  icon: string;
}

// Get popular cities from service
const popularCities = getPopularCities();

type Nav = CompositeNavigationProp<
  StackNavigationProp<TravelStackParamList, 'TravelList'>,
  StackNavigationProp<RootStackParamList>
>;

function serializeTrip(t: Trip): SerializedTrip {
  return {
    id: t.id,
    departureLocation: t.departureLocation,
    destination: t.destination,
    departureDate: t.departureDate.toISOString(),
    returnDate: t.returnDate?.toISOString(),
    timezone: t.timezone,
    notes: t.notes,
    jetLagPlanner: t.jetLagPlanner,
  };
}

const TravelScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();

  const is12h = settings?.general?.timeFormat === '12h';
  const formatTripTime = (hhmm: string): string => {
    if (is12h) {
      const [h, m] = hhmm.split(':');
      const d = new Date();
      d.setHours(parseInt(h, 10));
      d.setMinutes(parseInt(m, 10));
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return hhmm;
  };
  const [searchLocation, setSearchLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'trips'>('health');
  const pagerRef = useRef<any>(null);
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsTranslateY = useRef(new Animated.Value(0)).current;
  // Animation tuning (slower reveal)
  // ~10x slower than the current timings
  const REVEAL_DURATION = 11000;
  const REVEAL_STEP_DELAY = 5500;
  const REVEAL_STAGGER = 4500;
  const REVEAL_TRANSLATE = 12;
  // Curtain reveal switch and timing
  const USE_CURTAIN_REVEAL = true;
  const CURTAIN_DURATION_MS = 17000; // A bit quicker
  // Gradual reveal animation registry for rows/sections
  const rowAnimsRef = useRef<Record<string, { opacity: Animated.Value; translate: Animated.Value }>>({});
  const getRowAnim = (key: string) => {
    if (!rowAnimsRef.current[key]) {
      rowAnimsRef.current[key] = {
        opacity: new Animated.Value(0),
        translate: new Animated.Value(REVEAL_TRANSLATE),
      };
    }
    return rowAnimsRef.current[key];
  };
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [inputText, setInputText] = useState('');
  // Inline search (no modal)
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [citySearchResults, setCitySearchResults] = useState<CitySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [apiErrors, setApiErrors] = useState<{
    airQuality?: string;
    pollen?: string;
    weather?: string;
    healthcare?: string;
    general?: string;
  }>({});
  // Cities list used by the typewriter placeholder
  const loopCities = popularCities.slice(0, 8);

  // Independent typewriter effect for the search placeholder
  const [typedCityIndex, setTypedCityIndex] = useState(0);
  const [typedCityText, setTypedCityText] = useState('');
  const reduceMotion = useReduceMotion();
  // Curtain reveal via animated container height (works reliably in ScrollView)
  const [contentMeasuredHeight, setContentMeasuredHeight] = useState(0);
  const [curtainAnimationComplete, setCurtainAnimationComplete] = useState(false);
  const coverTranslate = useRef(new Animated.Value(0)).current;
  const curtainStartedRef = useRef(false);
  const typingTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (loopCities.length === 0) return;
    const fullText = loopCities[typedCityIndex] || 'Tokyo, Japan';
    let charIndex = 0;
    setTypedCityText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const typeNext = () => {
      charIndex += 1;
      setTypedCityText(fullText.slice(0, charIndex));
      if (charIndex < fullText.length) {
        typingTimeoutRef.current = setTimeout(typeNext, 80);
      } else {
        typingTimeoutRef.current = setTimeout(() => {
          setTypedCityIndex((prev) => (prev + 1) % loopCities.length);
        }, 1200);
      }
    };
    typingTimeoutRef.current = setTimeout(typeNext, 300);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [typedCityIndex, loopCities.length]);

  // Trigger reveal when results are shown
  useEffect(() => {
    if (!selectedLocation || isLoading) return;
    const reduce = reduceMotion;
    const keys = ['summary','aq','water','uv','food','pollen','altitude','outbreaks','hospitals','vaccinations'];
    if (reduce || USE_CURTAIN_REVEAL) {
      keys.forEach((k) => {
        const a = getRowAnim(k);
        a.opacity.setValue(1);
        a.translate.setValue(0);
      });
      // Prepare curtain overlay
      if (USE_CURTAIN_REVEAL) {
        curtainStartedRef.current = false;
        coverTranslate.setValue(0);
        setCurtainAnimationComplete(false);
        // Keep hidden until measurement starts the reveal
        resultsOpacity.setValue(0);
      }
      return;
    }
    // reset before animating (when switching destination)
    keys.forEach((k) => {
      const a = getRowAnim(k);
      a.opacity.setValue(0);
      a.translate.setValue(REVEAL_TRANSLATE);
    });
    const anims = keys.map((k, i) => {
      const a = getRowAnim(k);
      const delay = i * REVEAL_STEP_DELAY;
      return Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: REVEAL_DURATION, delay, useNativeDriver: true }),
        Animated.timing(a.translate, { toValue: 0, duration: REVEAL_DURATION, delay, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(REVEAL_STAGGER, anims).start();
  }, [selectedLocation, isLoading, reduceMotion]);

  // Start curtain animation once content height is measured
  useEffect(() => {
    if (!USE_CURTAIN_REVEAL) return;
    if (!selectedLocation || isLoading) return;
    if (reduceMotion) return;
    if (contentMeasuredHeight <= 0) return;
    if (curtainStartedRef.current) return;
    curtainStartedRef.current = true;
    coverTranslate.stopAnimation();
    coverTranslate.setValue(0);
  // Fade in content as curtain starts to avoid initial flash
  (resultsOpacity as any).stopAnimation?.();
  Animated.timing(resultsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    Animated.timing(coverTranslate, { toValue: contentMeasuredHeight, duration: CURTAIN_DURATION_MS, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setCurtainAnimationComplete(true);
      }
    });
  }, [contentMeasuredHeight, selectedLocation, isLoading, reduceMotion]);

  // Safety: if animation hasn't started shortly after measurement, start it
  useEffect(() => {
    if (!USE_CURTAIN_REVEAL) return;
    if (!selectedLocation || isLoading) return;
    if (reduceMotion) return;
    if (contentMeasuredHeight <= 0) return;
    const timer = setTimeout(() => {
      if (!curtainStartedRef.current) {
        curtainStartedRef.current = true;
        coverTranslate.stopAnimation();
        coverTranslate.setValue(0);
        (resultsOpacity as any).stopAnimation?.();
        Animated.timing(resultsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        Animated.timing(coverTranslate, { toValue: contentMeasuredHeight, duration: CURTAIN_DURATION_MS, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
          if (finished) {
            setCurtainAnimationComplete(true);
          }
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [contentMeasuredHeight, selectedLocation, isLoading, reduceMotion]);
  
  // Trip planning state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [flightCarrier, setFlightCarrier] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [detectedAirline, setDetectedAirline] = useState<string | null>(null);
  const [isLookingUpFlight, setIsLookingUpFlight] = useState(false);
  const [flightLookupResult, setFlightLookupResult] = useState<any>(null);
  const [flightSegments, setFlightSegments] = useState<any[]>([]);
  const [flightDetailsExpanded, setFlightDetailsExpanded] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const hasFlights = Boolean(flightLookupResult) || flightSegments.length > 0;

  const flightDetailsCard = flightLookupResult ? (
    <TouchableOpacity
      style={styles.flightDetailsCard}
      activeOpacity={0.7}
      onPress={() => setFlightDetailsExpanded(!flightDetailsExpanded)}
    >
      <Text style={styles.flightNumberText}>
        {flightLookupResult.carrier} {flightLookupResult.number}
      </Text>
      <View style={styles.flightDetailsTable}>
        <View style={styles.flightDetailsRowsWrapper}>
          <View style={styles.flightDetailsRow}>
            <View style={styles.flightDetailsCellCity}>
              <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
              <Text style={styles.flightCityText} numberOfLines={1}>{flightLookupResult.origin_city}</Text>
            </View>
            <View style={styles.flightDetailsCellDate}>
              <Text style={styles.flightDate}>{new Date(flightLookupResult.dep_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </View>
            <View style={styles.flightDetailsCellTime}>
              <Text style={styles.flightTime}>{new Date(flightLookupResult.dep_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
            </View>
            <View style={styles.flightDetailsCellArrow} />
          </View>
          <View style={styles.flightDetailsRow}>
            <View style={styles.flightDetailsCellCity}>
              <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
              <Text style={styles.flightCityText} numberOfLines={1}>{flightLookupResult.dest_city}</Text>
            </View>
            <View style={styles.flightDetailsCellDate}>
              <Text style={styles.flightDate}>{new Date(flightLookupResult.arr_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </View>
            <View style={styles.flightDetailsCellTime}>
              <Text style={styles.flightTime}>{new Date(flightLookupResult.arr_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
            </View>
            <View style={styles.flightDetailsCellArrow} />
          </View>
          {!flightDetailsExpanded ? (
            <View style={styles.flightDetailsChevronWrap}>
              <Ionicons name="chevron-forward" size={20} color="#059669" />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  ) : null;

  const flightSegmentCards = flightSegments.length > 0 ? (
    <View>
      {flightSegments.map((seg, idx) => (
        <View key={idx} style={[styles.flightDetailsCard, styles.flightSegmentCard]}>
          <Text style={styles.flightNumberText}>{seg.carrier} {seg.number}</Text>
          <View style={styles.flightDetailsTable}>
            <View style={styles.flightDetailsRow}>
              <View style={styles.flightDetailsCellCity}>
                <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
                <Text style={styles.flightCityText} numberOfLines={1}>{seg.origin_city}</Text>
              </View>
              <View style={styles.flightDetailsCellDate}>
                <Text style={styles.flightDate}>{new Date(seg.dep_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
              <View style={styles.flightDetailsCellTime}>
                <Text style={styles.flightTime}>{new Date(seg.dep_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
              </View>
              <View style={styles.flightDetailsCellArrow} />
            </View>
            <View style={styles.flightDetailsRow}>
              <View style={styles.flightDetailsCellCity}>
                <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
                <Text style={styles.flightCityText} numberOfLines={1}>{seg.dest_city}</Text>
              </View>
              <View style={styles.flightDetailsCellDate}>
                <Text style={styles.flightDate}>{new Date(seg.arr_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
              <View style={styles.flightDetailsCellTime}>
                <Text style={styles.flightTime}>{new Date(seg.arr_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
              </View>
              <View style={styles.flightDetailsCellArrow} />
            </View>
          </View>
        </View>
      ))}
    </View>
  ) : null;

  const flightLookupCard = flightLookupResult ? flightDetailsCard : null;

  // Detect airline when carrier code changes
  useEffect(() => {
    const code = flightCarrier.toUpperCase().trim();
    setDetectedAirline(AIRLINE_CODES[code] ?? null);
  }, [flightCarrier]);
  const [newTripDepartureLocation, setNewTripDepartureLocation] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripDepartureDate, setNewTripDepartureDate] = useState(new Date());
  const [newTripReturnDate, setNewTripReturnDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<'departure' | 'return' | null>(null);
  const [tempDatePickerValue, setTempDatePickerValue] = useState<Date | undefined>(undefined);
  const datePickerInitializedRef = useRef(false);
  const [isAddingTrip, setIsAddingTrip] = useState(false);

  // Initialize temporary date value when picker opens (only when first opening, not on every change)
  useEffect(() => {
    if (showDatePicker) {
      // Only initialize once when picker opens (prevents resetting during navigation)
      if (!datePickerInitializedRef.current) {
        if (showDatePicker === 'departure') {
          setTempDatePickerValue(new Date(newTripDepartureDate));
        } else if (showDatePicker === 'return') {
          setTempDatePickerValue(new Date(newTripReturnDate || new Date()));
        }
        datePickerInitializedRef.current = true;
      }
    } else {
      setTempDatePickerValue(undefined);
      datePickerInitializedRef.current = false;
    }
  }, [showDatePicker]);

  const [showEditDatePicker, setShowEditDatePicker] = useState<'departure' | 'return' | null>(null);

  // Initialize temporary date value for edit trip picker (only when first opening, not on every change)
  useEffect(() => {
    if (showEditDatePicker) {
      // Only initialize once when picker opens (prevents resetting during navigation)
      if (!editDatePickerInitializedRef.current) {
        if (showEditDatePicker === 'departure') {
          setTempEditDatePickerValue(new Date(editTripDepartureDate));
        } else {
          setTempEditDatePickerValue(new Date(editTripReturnDate || new Date()));
        }
        editDatePickerInitializedRef.current = true;
      }
    } else {
      setTempEditDatePickerValue(undefined);
      editDatePickerInitializedRef.current = false;
    }
  }, [showEditDatePicker]);
  const [tripSuggestions, setTripSuggestions] = useState<string[]>([]);
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>([]);
  
  // Animated value for bottom sheet slide-up
  const tripModalTranslateY = useRef(new Animated.Value(1000)).current;
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [jetLagData, setJetLagData] = useState({
    departureTime: '09:00',
    arrivalTime: '15:00',
    timeZoneDifference: 0,
  });
  const [showDirectionsModal, setShowDirectionsModal] = useState<string | null>(null);
  const [lastDirectionsChoice, setLastDirectionsChoice] = useState<'google' | 'apple' | null>(null);
  const [alwaysUseChoice, setAlwaysUseChoice] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  // Health metric modal state (match dashboard)
  const [metricModalVisible, setMetricModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any | null>(null);
  // removed temporary reveal animation

  // Edit trip state
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [editTripDestination, setEditTripDestination] = useState('');
  const [editTripDepartureDate, setEditTripDepartureDate] = useState(new Date());
  const [editTripReturnDate, setEditTripReturnDate] = useState<Date | undefined>(undefined);
  const [editTripNotes, setEditTripNotes] = useState('');
  const [tempEditDatePickerValue, setTempEditDatePickerValue] = useState<Date | undefined>(undefined);
  const editDatePickerInitializedRef = useRef(false);
  const [editTripSuggestions, setEditTripSuggestions] = useState<string[]>([]);
  const [editTripDepartureLocation, setEditTripDepartureLocation] = useState('');
  const [editTripDepartureSuggestions, setEditTripDepartureSuggestions] = useState<string[]>([]);

  const { travelHealth, updateLocation, getCurrentLocation, updateTravelHealthData } = useHealthData();


  // Update API errors when travel health data changes
  useEffect(() => {
    if (travelHealth && (travelHealth as any).apiErrors) {
      setApiErrors((travelHealth as any).apiErrors);
    } else {
      setApiErrors({});
    }
  }, [travelHealth]);

  // Search cities using API
  useEffect(() => {
    const searchCitiesAsync = async () => {
      if (searchLocation.trim() && searchLocation.length >= 2) {
        setIsSearchingCities(true);
        try {
          const results = await searchAllLocations(searchLocation, 15);
          setCitySearchResults(results);
          // Also filter popular cities for fallback
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(searchLocation.toLowerCase())
      );
      setFilteredCities(filtered);
        } catch (error) {
          console.error('Error searching locations:', error);
          // Fallback to popular cities filter
          const filtered = popularCities.filter(city =>
            city.toLowerCase().includes(searchLocation.toLowerCase())
          );
          setFilteredCities(filtered);
        } finally {
          setIsSearchingCities(false);
        }
    } else {
        setCitySearchResults([]);
      setFilteredCities([]);
    }
    };

    const timeoutId = setTimeout(searchCitiesAsync, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchLocation]);

  // Search trip destination suggestions using API
  useEffect(() => {
    const searchTripDestinationsAsync = async () => {
      if (newTripDestination.trim() && newTripDestination.length >= 2) {
        try {
          const results = await searchAllLocations(newTripDestination, 12);
          const cityNames = results.map(city => `${city.name}, ${city.country}`);
          setTripSuggestions(cityNames);
        } catch {
          const filtered = popularCities.filter(city =>
            city.toLowerCase().includes(newTripDestination.toLowerCase())
          );
          setTripSuggestions(filtered);
        }
      } else {
        setTripSuggestions([]);
      }
    };

    const timeoutId = setTimeout(searchTripDestinationsAsync, 300);
    return () => clearTimeout(timeoutId);
  }, [newTripDestination]);

  // Search departure location suggestions using API
  useEffect(() => {
    const searchDepartureLocationsAsync = async () => {
      if (newTripDepartureLocation.trim() && newTripDepartureLocation.length >= 2) {
        try {
          const results = await searchAllLocations(newTripDepartureLocation, 12);
          const cityNames = results.map(city => `${city.name}, ${city.country}`);
          setDepartureSuggestions(cityNames);
        } catch (error) {
          console.error('Error searching departure locations:', error);
          // Fallback to popular cities filter
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(newTripDepartureLocation.toLowerCase())
      );
      setDepartureSuggestions(filtered);
      }
    } else {
      setDepartureSuggestions([]);
    }
    };

    const timeoutId = setTimeout(searchDepartureLocationsAsync, 300);
    return () => clearTimeout(timeoutId);
  }, [newTripDepartureLocation]);

  // Search edit trip destination suggestions using API
  useEffect(() => {
    const searchEditTripDestinationsAsync = async () => {
      if (editTripDestination.trim() && editTripDestination.length >= 2) {
        try {
          const results = await searchAllLocations(editTripDestination, 12);
          const cityNames = results.map(city => `${city.name}, ${city.country}`);
          setEditTripSuggestions(cityNames);
        } catch (error) {
          console.error('Error searching edit trip destinations:', error);
          // Fallback to popular cities filter
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(editTripDestination.toLowerCase())
      );
      setEditTripSuggestions(filtered);
      }
    } else {
      setEditTripSuggestions([]);
    }
    };

    const timeoutId = setTimeout(searchEditTripDestinationsAsync, 300);
    return () => clearTimeout(timeoutId);
  }, [editTripDestination]);

  // Search edit trip departure location suggestions using API
  useEffect(() => {
    const searchEditDepartureLocationsAsync = async () => {
      if (editTripDepartureLocation.trim() && editTripDepartureLocation.length >= 2) {
        try {
          const results = await searchAllLocations(editTripDepartureLocation, 12);
          const cityNames = results.map(city => `${city.name}, ${city.country}`);
          setEditTripDepartureSuggestions(cityNames);
        } catch (error) {
          console.error('Error searching edit departure locations:', error);
          // Fallback to popular cities filter
          const filtered = popularCities.filter(city =>
            city.toLowerCase().includes(editTripDepartureLocation.toLowerCase())
          );
          setEditTripDepartureSuggestions(filtered);
        }
    } else {
      setEditTripDepartureSuggestions([]);
    }
    };

    const timeoutId = setTimeout(searchEditDepartureLocationsAsync, 300);
    return () => clearTimeout(timeoutId);
  }, [editTripDepartureLocation]);

  const handleRefresh = async () => {
    if (travelHealth) {
      setIsRefreshing(true);
      setApiErrors({});
      try {
        if (travelHealth.coordinates) {
          const locationData = {
            name: travelHealth.location,
            country: 'Unknown',
            coordinates: travelHealth.coordinates,
            timezone: 'UTC',
            elevation: 0,
          };
          await updateTravelHealthData(locationData);
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
        setApiErrors(prev => ({ ...prev, general: 'Failed to refresh data. Please check your internet connection.' }));
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleLocationSelect = async (city: string) => {
    setSearchLocation(city);
    setInputText(city);
    setFilteredCities([]);
    setIsLoading(true);
    // ensure results container will be visible when data is ready
    resultsOpacity.setValue(1);
    resultsTranslateY.setValue(0);
    
    try {
      const matchedCity = citySearchResults.find(
        r => `${r.name}, ${r.country}` === city || r.name === city
      );
      const locationData = matchedCity
        ? { name: matchedCity.name, country: matchedCity.country, coordinates: { latitude: 0, longitude: 0 }, timezone: 'UTC', elevation: 0 }
        : { name: city, country: getCountryFromCity(city), coordinates: { latitude: 0, longitude: 0 }, timezone: 'UTC', elevation: 0 };

      await updateTravelHealthData(locationData);
      setSelectedLocation(city);
    } catch (error) {
      console.error('Error fetching health data:', error);
      setApiErrors(prev => ({ ...prev, general: 'Failed to fetch health data. Please try again.' }));
    } finally {
      setIsLoading(false);
      // ensure suggestions are hidden and metrics visible
      setShowInlineSuggestions(false);
      resultsOpacity.setValue(1);
      resultsTranslateY.setValue(0);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      // Android: update immediately and close
      if (selectedDate) {
        if (showDatePicker === 'departure') {
          setNewTripDepartureDate(selectedDate);
        } else if (showDatePicker === 'return') {
          setNewTripReturnDate(selectedDate);
        }
      }
      setShowDatePicker(null);
      return;
    }
    
    // iOS: Only update temporary value during scrolling
    // Don't update the actual state until user confirms with Done button
    // Always create a new Date object to ensure React detects the change
    if (Platform.OS === 'ios' && selectedDate) {
      setTempDatePickerValue(new Date(selectedDate));
    }
  };

  const handleFlightLookup = async () => {
    if (!flightCarrier.trim() || !flightNumber.trim()) {
      Alert.alert('Error', 'Please enter both carrier and flight number');
      return;
    }

    try {
      setIsLookingUpFlight(true);
      const dateString = new Date().toISOString().split('T')[0]; // Use today's date as default
      const result = await FlightLookupService.lookupFlight(
        flightCarrier.toUpperCase().trim(),
        flightNumber.trim(),
        dateString
      );

      if (result) {
        // Flight found - populate form with flight data
        setFlightLookupResult(result);
        setNewTripDepartureLocation(result.origin_iata);
        setNewTripDestination(result.dest_iata);
        setNewTripDepartureDate(new Date(result.dep_local));
        // Show manual entry to confirm/edit details
        setShowManualEntry(true);
        Alert.alert('Flight Found', 'Flight details loaded. Please review and confirm.');
      } else {
        // Flight not found - show manual entry
        Alert.alert(
          'Flight Not Found',
          'We couldn\'t find that flight. Please enter the details manually.',
          [
            { text: 'OK', onPress: () => setShowManualEntry(true) }
          ]
        );
      }
    } catch (error) {
      console.error('Flight lookup error:', error);
      Alert.alert('Error', 'Failed to lookup flight. Please enter details manually.', [
        { text: 'OK', onPress: () => setShowManualEntry(true) }
      ]);
    } finally {
      setIsLookingUpFlight(false);
    }
  };

  const handleAddTrip = () => {
    if (!newTripDepartureLocation.trim()) {
      Alert.alert('Error', 'Please enter a departure location');
      return;
    }
    if (!newTripDestination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      departureLocation: newTripDepartureLocation.trim(),
      destination: newTripDestination.trim(),
      departureDate: newTripDepartureDate,
      returnDate: newTripReturnDate,
      timezone: 'UTC',
      checklist: {
        vaccines: [
          { name: 'COVID-19', completed: false },
          { name: 'Hepatitis A', completed: false },
          { name: 'Typhoid', completed: false }
        ],
        medicines: [
          { name: 'Pain relievers', completed: false },
          { name: 'Anti-diarrheal', completed: false },
          { name: 'Motion sickness', completed: false }
        ]
      },
      jetLagPlanner: {
        departureTime: '09:00',
        arrivalTime: '15:00',
        outboundPlan: {
          direction: 'outbound',
          timezoneAdjustment: '+9', // Example: Tokyo is +9 from UTC
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours earlier each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours earlier' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours earlier' },
            { day: 0, action: 'Travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day at destination', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        },
        returnPlan: newTripReturnDate ? {
          direction: 'return',
          timezoneAdjustment: '-9', // Example: Return to home timezone
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours later each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours later' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours later' },
            { day: 0, action: 'Return travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day back home', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        } : undefined
      }
    };

    setTrips(prev => [...prev, newTrip]);
    setNewTripDepartureLocation('');
    setNewTripDestination('');
    setNewTripDepartureDate(new Date());
    setNewTripReturnDate(undefined);
    setShowAddTripModal(false);
    setTripSuggestions([]);
    setDepartureSuggestions([]);
    Alert.alert('Success', 'Trip added successfully!');
  };

  const handleTripChecklistToggle = (tripId: string, type: 'vaccines' | 'medicines', index: number) => {
    setTrips(prevTrips => prevTrips.map(trip => {
      if (trip.id === tripId) {
        const updatedTrip = { ...trip };
        if (!updatedTrip.checklist) {
          updatedTrip.checklist = {
            vaccines: [],
            medicines: []
          };
        }
        
        if (type === 'vaccines') {
          if (!updatedTrip.checklist.vaccines[index]) {
            updatedTrip.checklist.vaccines[index] = { name: '', completed: false };
          }
          updatedTrip.checklist.vaccines[index].completed = !updatedTrip.checklist.vaccines[index].completed;
        } else {
          if (!updatedTrip.checklist.medicines[index]) {
            updatedTrip.checklist.medicines[index] = { name: '', completed: false };
          }
          updatedTrip.checklist.medicines[index].completed = !updatedTrip.checklist.medicines[index].completed;
        }
        
        return updatedTrip;
      }
      return trip;
    }));
  };



  const handleTripOptions = (trip: Trip) => {
    Alert.alert(
      'Trip Options',
      'What would you like to do with this trip?',
      [
        {
          text: 'Modify Dates',
          onPress: () => handleModifyTripDates(trip),
        },
        {
          text: 'Change Location',
          onPress: () => handleChangeTripLocation(trip),
        },
        {
          text: 'Delete Trip',
          onPress: () => handleDeleteTrip(trip.id),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Use native action sheet to choose maps app
  const handleOpenMaps = (destinationName: string) => {
    Alert.alert(
      'Open Maps',
      `How would you like to navigate to ${destinationName}?`,
      [
        {
          text: 'Apple Maps',
          onPress: () => {
            const destination = encodeURIComponent(destinationName);
            Linking.openURL(`http://maps.apple.com/?daddr=${destination}`);
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const destination = encodeURIComponent(destinationName);
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Open native phone sheet for emergency number (called after user confirms)
  const handleCallEmergency = () => {
    try {
      Linking.openURL('tel:112');
    } catch (e) {
      Alert.alert('Unable to call', 'This device cannot place phone calls.');
    }
  };

  // Show "Are you sure you want to call?" confirmation (iPhone-style) then call if confirmed
  const handleEmergencyContactPress = () => {
    Alert.alert(
      'Call Emergency Services?',
      'Are you sure you want to call 112?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: handleCallEmergency },
      ]
    );
  };

  const handleModifyTripDates = (trip: Trip) => {
    setEditingTrip(trip);
    setEditTripDepartureLocation(trip.departureLocation || 'Home');
    setEditTripDestination(trip.destination);
    setEditTripDepartureDate(trip.departureDate);
    setEditTripReturnDate(trip.returnDate);
    setEditTripNotes(trip.notes || '');
    setShowEditTripModal(true);
  };

  const handleChangeTripLocation = (trip: Trip) => {
    setEditingTrip(trip);
    setEditTripDepartureLocation(trip.departureLocation || 'Home');
    setEditTripDestination(trip.destination);
    setEditTripDepartureDate(trip.departureDate);
    setEditTripReturnDate(trip.returnDate);
    setEditTripNotes(trip.notes || '');
    setShowEditTripModal(true);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
            Alert.alert('Success', 'Trip deleted successfully!');
          },
        },
      ]
    );
  };

  const handleSaveEditTrip = () => {
    if (!editingTrip || !editTripDepartureLocation.trim() || !editTripDestination.trim()) {
      Alert.alert('Error', 'Please enter both departure location and destination');
      return;
    }

    const updatedTrip: Trip = {
      ...editingTrip,
      departureLocation: editTripDepartureLocation.trim(),
      destination: editTripDestination.trim(),
      departureDate: editTripDepartureDate,
      returnDate: editTripReturnDate,
      notes: editTripNotes.trim(),
      jetLagPlanner: {
        departureTime: '09:00',
        arrivalTime: '15:00',
        outboundPlan: {
          direction: 'outbound',
          timezoneAdjustment: '+9', // Example: Tokyo is +9 from UTC
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours earlier each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours earlier' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours earlier' },
            { day: 0, action: 'Travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day at destination', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        },
        returnPlan: editTripReturnDate ? {
          direction: 'return',
          timezoneAdjustment: '-9', // Example: Return to home timezone
          circadianPlan: [
            { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours later each day' },
            { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours later' },
            { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours later' },
            { day: 0, action: 'Return travel day', time: 'Stay awake until local bedtime' },
            { day: 1, action: 'First day back home', time: 'Follow local schedule' },
            { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
            { day: 3, action: 'Normal schedule', time: 'Regular sleep time' }
          ]
        } : undefined
      }
    };

    setTrips(prevTrips => prevTrips.map(trip => 
      trip.id === editingTrip.id ? updatedTrip : trip
    ));

    // Reset edit state
    setEditingTrip(null);
    setEditTripDepartureLocation('');
    setEditTripDestination('');
    setEditTripDepartureDate(new Date());
    setEditTripReturnDate(undefined);
    setEditTripNotes('');
    setShowEditTripModal(false);
    setEditTripSuggestions([]);
    setEditTripDepartureSuggestions([]);
    
    Alert.alert('Success', 'Trip updated successfully!');
  };
    
    return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Travel Health</Text>
          <Text style={styles.headerSubtitle}>Destination health insights and safety information</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabScrollContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'health' && styles.activeTab]} 
            onPress={() => {
              setActiveTab('health');
              try { pagerRef.current?.setPage?.(0); } catch {}
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'trips' && styles.activeTab]} 
            onPress={() => {
              setActiveTab('trips');
              try { pagerRef.current?.setPage?.(1); } catch {}
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'trips' && styles.activeTabText]}>
              Trip Planning
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Swipe between tabs */}
      <PagerView
        style={styles.pager}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          setActiveTab(index === 0 ? 'health' : 'trips');
        }}
      >
        {/* Page 0: Search */}
        <View key="search">
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
          <View style={styles.content}>
            {/* Location Search */}
            <>
            {true ? (
            <View style={styles.locationSearchContainer}>
              <View style={styles.locationSearchButton}>
                  <TextInput
                  style={styles.locationSearchInput}
                    value={inputText}
                  onChangeText={(text) => {
                      setInputText(text);
                      setSearchLocation(text);
                      setSelectedLocation('');
                      // The useEffect will handle the API search automatically
                      if (text.trim()) {
                        setShowInlineSuggestions(true);
                      } else {
                        setShowInlineSuggestions(false);
                      }
                    }}
                  placeholder={typedCityText ? `Search ${typedCityText}` : 'Search'}
                    placeholderTextColor="#8E8E93"
                  returnKeyType="search"
                  onFocus={() => {
                    if (!inputText.trim()) {
                      setFilteredCities(popularCities.slice(0, 8));
                      setShowInlineSuggestions(true);
                    }
                  }}
                  onEndEditing={() => {
                    const trimmed = inputText.trim();
                    if (!trimmed) return;
                    // If user hasn't explicitly selected, treat end editing as submit
                    if (trimmed && trimmed !== selectedLocation) {
                      setShowInlineSuggestions(false);
                      setCitySearchResults([]);
                      setFilteredCities([]);
                      setSelectedLocation(trimmed);
                      setSearchLocation(trimmed);
                      setInputText(trimmed);
                      handleLocationSelect(trimmed);
                    }
                  }}
                    onSubmitEditing={() => {
                      if (inputText.trim()) {
                        setShowInlineSuggestions(false);
                        setCitySearchResults([]);
                        setFilteredCities([]);
                        const submitted = inputText.trim();
                        setSelectedLocation(submitted);
                        setSearchLocation(submitted);
                        setInputText(submitted);
                        handleLocationSelect(submitted);
                        Keyboard.dismiss();
                      }
                    }}
                  />
                {searchLocation ? (
                  <TouchableOpacity onPress={() => { setInputText(''); setSearchLocation(''); setFilteredCities(popularCities.slice(0, 8)); setShowInlineSuggestions(true); }}>
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => { setFilteredCities(popularCities.slice(0, 8)); setShowInlineSuggestions(true); }}>
                    <Ionicons name="search" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>

                  {showInlineSuggestions && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {!searchLocation.trim() && (
                        <TouchableOpacity 
                            style={[styles.suggestionItem, styles.suggestionItemDivider]}
                    onPress={async () => {
                      try {
                        setIsGettingLocation(true);
                        const location = await getCurrentLocation();
                        if (location) {
                      const cityName = 'Current Location';
                                  setShowInlineSuggestions(false);
                          setSearchLocation(cityName);
                          setFilteredCities([]);
                          await handleLocationSelect(cityName);
                      Keyboard.dismiss();
                        }
                      } catch (error) {
                        Alert.alert(
                          'Location Permission Required',
                          'Please enable location access in Settings to use this feature.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                        { text: 'Settings', onPress: () => {} }
                          ]
                        );
                      } finally {
                        setIsGettingLocation(false);
                      }
                    }}
                    disabled={isGettingLocation}
                  >
                            <Ionicons name="navigate" size={16} color={isGettingLocation ? '#8E8E93' : '#007AFF'} />
                            <Text style={styles.suggestionText}>{isGettingLocation ? 'Getting location…' : 'Use current location'}</Text>
                    {isGettingLocation && (
                      <ActivityIndicator size="small" color="#8E8E93" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                        )}
                        {(citySearchResults.length > 0 || filteredCities.length > 0) && (
                          <View style={styles.suggestionsContainer}>
                            {isSearchingCities && (
                              <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#007AFF" />
                                <Text style={styles.loadingText}>Searching cities...</Text>
                              </View>
                            )}
                            
                            {/* API Search Results */}
                            {citySearchResults.length > 0 && citySearchResults.map((city, index) => (
                          <TouchableOpacity 
                                key={`api-${city.placeId}`}
                                style={[styles.suggestionItem, index < citySearchResults.length - 1 ? styles.suggestionItemDivider : null]}
                                onPress={() => {
                                  setShowInlineSuggestions(false);
                                  const cityName = `${city.name}, ${city.country}`;
                                  setSearchLocation(cityName);
                                  setInputText(cityName);
                                  setSelectedLocation(cityName);
                                  setCitySearchResults([]);
                                  setFilteredCities([]);
                                  handleLocationSelect(cityName);
                                  Keyboard.dismiss();
                                }}
                              >
                                <Ionicons name="location" size={16} color="#007AFF" />
                                <View style={styles.suggestionContent}>
                                  <Text style={styles.suggestionText}>{city.name}</Text>
                                  <Text style={styles.suggestionSubtext}>{city.country}</Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                            
                            {/* Popular Cities Fallback */}
                            {citySearchResults.length === 0 && filteredCities.length > 0 && filteredCities.map((city, index) => (
                              <TouchableOpacity 
                                key={`popular-${index}`}
                            style={[styles.suggestionItem, index < filteredCities.length - 1 ? styles.suggestionItemDivider : null]}
                            onPress={() => {
                              setShowInlineSuggestions(false);
                              setSearchLocation(city);
                              setInputText(city);
                              setSelectedLocation(city);
                              setFilteredCities([]);
                              handleLocationSelect(city);
                              Keyboard.dismiss();
                            }}
                          >
                                <Ionicons name="location" size={16} color="#8E8E93" />
                            <Text style={styles.suggestionText}>{city}</Text>
                          </TouchableOpacity>
                        ))}
                          </View>
                        )}
              </ScrollView>
                </View>
                  )}
                </View>
            ) : null}

            {/* Background tap to dismiss suggestions */}
            {showInlineSuggestions && (
              <TouchableOpacity activeOpacity={1} onPress={() => { setShowInlineSuggestions(false); Keyboard.dismiss(); }} style={styles.tapDismissOverlay} />
            )}
            </>

            {/* Loading State */}
            {selectedLocation && isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading health data...</Text>
              </View>
            )}

            {/* Health Metrics */}
            {selectedLocation && !isLoading ? (
              <View>
                <Animated.View 
                  onLayout={(e) => {
                    const h = e.nativeEvent.layout.height;
                    if (h > 0 && (contentMeasuredHeight === 0 || Math.abs(h - contentMeasuredHeight) > 4)) {
                      setContentMeasuredHeight(h);
                    }
                  }}
                  style={[styles.metricsContainer, { opacity: resultsOpacity, transform: [{ translateY: resultsTranslateY }], position: 'relative' }]}>
                {/* Result Title Row */}
                <View style={styles.resultTitleRow}>
                  <Text style={styles.resultTitle}>
                    {(() => {
                      const nameFromData = (travelHealth as any)?.name || selectedLocation;
                      const countryFromData = (travelHealth as any)?.country || getCountryFromCity(selectedLocation);
                      if (nameFromData && countryFromData) {
                        return `${nameFromData}, ${countryFromData}`;
                      }
                      const country = getCountryFromCity(selectedLocation);
                      const hasCountry = selectedLocation.toLowerCase().includes(country.toLowerCase());
                      return `${hasCountry ? selectedLocation : `${selectedLocation}, ${country}`}`;
                    })()} {getCountryFlag((travelHealth as any)?.country || getCountryFromCity(selectedLocation))}
                  </Text>
                </View>

                {/* Health Summary */}
                <Animated.View style={[styles.summaryCard, { opacity: getRowAnim('summary').opacity, transform: [{ translateY: getRowAnim('summary').translate }] }] }>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    <Text style={styles.summaryTitle}>Health Summary</Text>
                </View>
                  <Text style={styles.summaryText}>Overall health risk is low for this destination. All major health metrics are within safe ranges.</Text>
                </Animated.View>

                {/* Health Metrics in Specific Order */}
                <View style={styles.metricsSection}>
                  <View style={styles.sectionGroupCard}>
                  <Text style={styles.sectionTitle}>Health Metrics</Text>
                  
                  {HEALTH_METRIC_ROWS.map(({ animKey, metricId, label, value, status, icon, scoreLabel }) => (
                    <Animated.View key={animKey} style={{ opacity: getRowAnim(animKey).opacity, transform: [{ translateY: getRowAnim(animKey).translate }] }}>
                      <TouchableOpacity
                        style={styles.metricRowCard}
                        onPress={() => navigation.navigate('EnvironmentalMetric', { metricId, label, value, status, score: getMetricScore(scoreLabel), icon })}
                      >
                        <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor(metricId, status)}20` }]}>
                          <Ionicons name={icon as any} size={20} color={getMetricFixedIconColor(metricId, status)} />
                        </View>
                        <View style={styles.metricContent}>
                          <Text style={styles.metricName}>{label}</Text>
                          <Text style={[styles.metricValueText, { color: getStatusColor(status) }]}>{value}</Text>
                        </View>
                        <View style={styles.metricRightCol}>
                          <Text style={[styles.metricScoreText, { color: getScoreColor(metricId, status, getMetricScore(scoreLabel)) }]}>{getMetricScore(scoreLabel)}</Text>
                          <Text style={styles.metricScoreLabelText}>Score</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                  </View>
                </View>

                {/* Nearby Hospitals */}
                <Animated.View style={[styles.hospitalsSection, { opacity: getRowAnim('hospitals').opacity, transform: [{ translateY: getRowAnim('hospitals').translate }] }] }>
                  <View style={styles.sectionGroupCard}>
                  <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
                  <TouchableOpacity style={styles.hospitalCard} onPress={() => handleOpenMaps('Central Hospital')}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>Central Hospital</Text>
                      {selectedLocation === 'Current Location' ? (
                        <Text style={styles.hospitalDistance}>2.1km</Text>
                      ) : null}
              </View>
                    <Text style={styles.hospitalInfo}>24/7 Emergency Services • ICU Available</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.hospitalCard} onPress={() => handleOpenMaps('City Medical Center')}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>City Medical Center</Text>
                      {selectedLocation === 'Current Location' ? (
                        <Text style={styles.hospitalDistance}>3.8km</Text>
                      ) : null}
          </View>
                    <Text style={styles.hospitalInfo}>General Practice • Emergency Care</Text>
        </TouchableOpacity>

                  <TouchableOpacity style={styles.hospitalCard} onPress={() => handleOpenMaps('Emergency Clinic')}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>Emergency Clinic</Text>
                      {selectedLocation === 'Current Location' ? (
                        <Text style={styles.hospitalDistance}>4.2km</Text>
                      ) : null}
          </View>
                    <Text style={styles.hospitalInfo}>Urgent Care • Walk-in Available</Text>
                    </TouchableOpacity>

                    {/* Emergency Contact (inline) - confirm before calling */}
                    <TouchableOpacity 
                      style={styles.hospitalCard}
                      onPress={handleEmergencyContactPress}
                    >
                      <View style={styles.hospitalHeader}>
                        <Ionicons name="call" size={20} color="#FF3B30" />
                        <Text style={styles.hospitalTitle}>Emergency Contact</Text>
                        <Text style={styles.hospitalDistance}>112</Text>
                      </View>
                      <Text style={styles.hospitalInfo}>Tap to call emergency services</Text>
                    </TouchableOpacity>
        </View>
                </Animated.View>

                {/* Vaccinations */}
                <Animated.View style={[styles.vaccinationSection, { opacity: getRowAnim('vaccinations').opacity, transform: [{ translateY: getRowAnim('vaccinations').translate }] }] }>
                  <View style={styles.sectionGroupCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                      <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Vaccinations</Text>
        </View>
                    {/* Filter chips removed as requested */}
                    {/* Vaccine rows */}
                    <View style={styles.vaccineRow}>
                      <View style={styles.vaccineLeft}>
                        <Ionicons name="medkit" size={18} color="#FF3B30" />
                        <Text style={styles.vaccineName}>COVID-19</Text>
                      </View>
                      <View style={styles.vaccineRight}>
                        <Text style={[styles.vaccineBadge, { color: '#FF3B30' }]}>Required</Text>
                      </View>
                    </View>
                    <View style={styles.vaccineRow}>
                      <View style={styles.vaccineLeft}>
                        <Ionicons name="medkit" size={18} color="#FF9F0A" />
                        <Text style={styles.vaccineName}>Hepatitis A</Text>
                      </View>
                      <View style={styles.vaccineRight}>
                        <Text style={[styles.vaccineBadge, { color: '#FF9F0A' }]}>Recommended</Text>
                      </View>
                    </View>
                    <View style={styles.vaccineRow}>
                      <View style={styles.vaccineLeft}>
                        <Ionicons name="medkit" size={18} color="#FF9F0A" />
                        <Text style={styles.vaccineName}>Typhoid</Text>
                      </View>
                      <View style={styles.vaccineRight}>
                        <Text style={[styles.vaccineBadge, { color: '#FF9F0A' }]}>Recommended</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>

                {/* Medications */}
                <View style={styles.medicationSection}>
                  <View style={styles.sectionGroupCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="medkit" size={20} color="#0A84FF" />
                      <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Medications</Text>
      </View>

                    {/* Medications list */}
                    {GENERAL_MEDS.map((m: { name: string; purpose: string; dosage: string }, idx: number) => (
                      <View key={`gen-${m.name}-${idx}`} style={styles.vaccineRow}>
                        <View style={styles.vaccineLeft}>
                          <Text style={styles.vaccineName}>{m.name}</Text>
                        </View>
                        <View style={styles.vaccineRight}>
                          <Text style={styles.vaccineBadge}>{m.note}</Text>
                        </View>
                      </View>
                    ))}
                </View>
                </View>
                {/* Curtain overlay covering entire metrics container */}
                {USE_CURTAIN_REVEAL && contentMeasuredHeight > 0 && (
                  <>
                    <Animated.View pointerEvents="none" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: contentMeasuredHeight,
                      zIndex: 999,
                      backgroundColor: '#000000',
                      transform: [{ translateY: coverTranslate.interpolate({ inputRange: [0, contentMeasuredHeight || 1], outputRange: [0, contentMeasuredHeight || 1] }) }],
                    }} />
                    {/* Plane icon moving with curtain - hide when animation completes */}
                    {!curtainAnimationComplete && (
                      <Animated.View pointerEvents="none" style={{
                        position: 'absolute',
                        left: '50%',
                        marginLeft: -24, // Half of icon size to center it (48/2)
                        top: 0, // At curtain line
                        zIndex: 1000,
                        transform: [
                          { translateY: coverTranslate },
                          { rotate: '180deg' }, // Rotate to face down (image faces up by default)
                        ],
                      }}>
                        <Image 
                          source={require('../../../../../assets/images/travel/airplane.png')}
                          style={{ width: 48, height: 48 }}
                          resizeMode="contain"
                        />
                      </Animated.View>
                    )}
                  </>
                )}
                </Animated.View>
              </View>
            ) : !isLoading ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateTitle}>Search for a destination</Text>
                <Text style={styles.emptyStateText}>
                  Enter a city or country to get comprehensive health insights
                </Text>
              </View>
            ) : null}
          </View>
          </ScrollView>
        </View>
        {/* Page 1: Trip Planning */}
        <View key="trips">
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, styles.contentTrips]}>
            {trips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="airplane" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateTitle}>No trips planned</Text>
                <Text style={styles.emptyStateText}>
                  Add your first trip to get personalized health recommendations
                </Text>
                
                {/* Add Trip Button - positioned below description like Vaccinations page */}
                <TouchableOpacity 
                  style={styles.addTripButton}
                  onPress={() => {
                    setFlightCarrier('');
                    setFlightNumber('');
                    setDetectedAirline(null);
                    setShowManualEntry(false);
                    setFlightLookupResult(null);
                    setFlightSegments([]);
                    setShowAddTripModal(true);
                    tripModalTranslateY.setValue(1000);
                    Animated.spring(tripModalTranslateY, {
                      toValue: 0,
                      useNativeDriver: true,
                      tension: 65,
                      friction: 11,
                    }).start();
                  }}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.addTripButtonText}>Add a Trip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tripsContainer}>
                {/* Add Another Trip Button - positioned above trips */}
                <TouchableOpacity 
                  style={[styles.addTripButton, styles.addTripButtonTop]}
                  onPress={() => {
                    setFlightCarrier('');
                    setFlightNumber('');
                    setDetectedAirline(null);
                    setShowManualEntry(false);
                    setFlightLookupResult(null);
                    setFlightSegments([]);
                    setShowAddTripModal(true);
                    tripModalTranslateY.setValue(1000);
                    Animated.spring(tripModalTranslateY, {
                      toValue: 0,
                      useNativeDriver: true,
                      tension: 65,
                      friction: 11,
                    }).start();
                  }}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.addTripButtonText}>Add Another Trip</Text>
                </TouchableOpacity>
                
                {trips.map((trip) => {
                  const tripLabel = `${trip.departureLocation} → ${trip.destination}`;
                  return (
                    <TouchableOpacity
                      key={trip.id}
                      style={[styles.tripRowWrapper, styles.tripRowCompact]}
                      onPress={() => navigation.navigate('TripDetail', { trip: serializeTrip(trip) })}
                      activeOpacity={0.7}
                    >
                      <View style={styles.tripRowTextWrap}>
                        <Text style={styles.tripRowTitle}>{tripLabel}</Text>
                        <Text style={styles.tripRowSubtitle}>Tap to see planning</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.tripRowChevron} />
                    </TouchableOpacity>
                  );
                })}
                          </View>
                        )}
                      </View>
      </ScrollView>
        </View>
      </PagerView>

      {/* Directions Choice Modal - styled like dashboard */}
      {showDirectionsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDirections}>
            <View style={styles.modalHeaderDirections}>
              <View style={styles.modalIconCircleDirections}>
                <Ionicons name="navigate" size={22} color="#30D158" />
              </View>
              <Text style={styles.modalTitleDirections}>Open Maps</Text>
              <TouchableOpacity onPress={() => setShowDirectionsModal(null)} style={{ padding: 8 }}>
                <Ionicons name="close" size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              <Text style={{ color: '#EBEBF5', fontSize: 15, marginBottom: 12 }}>How would you like to navigate to {showDirectionsModal}?</Text>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                  const destination = encodeURIComponent(String(showDirectionsModal));
                  Linking.openURL(`http://maps.apple.com/?daddr=${destination}`);
                setShowDirectionsModal(null);
              }}
            >
                <Ionicons name="map" size={20} color="#0A84FF" />
                <Text style={styles.directionsButtonText}>Apple Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                  const destination = encodeURIComponent(String(showDirectionsModal));
                  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
                setShowDirectionsModal(null);
                }}
              >
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={styles.directionsButtonText}>Google Maps</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Emergency Call Confirm Modal */}
      {showEmergencyModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.emergencyModal}>
            <Text style={styles.emergencyModalTitle}>Call 112?</Text>
            <View style={styles.emergencyModalButtons}>
              <TouchableOpacity 
                style={styles.emergencyCallButton}
                onPress={() => {
                  setShowEmergencyModal(false);
                }}
              >
                <Text style={styles.emergencyCallButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.emergencyCancelButton}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={styles.emergencyCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Trip Modal - Modern Bottom Sheet Style */}
      <Modal 
        visible={showAddTripModal} 
        transparent 
        animationType="none"
        presentationStyle="overFullScreen"
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableWithoutFeedback 
            onPress={() => {
              setShowAddTripModal(false);
              setFlightCarrier('');
              setFlightNumber('');
              setShowManualEntry(false);
              setFlightLookupResult(null);
              setFlightSegments([]);
              setNewTripDepartureLocation('');
              setNewTripDestination('');
              setNewTripDepartureDate(new Date());
              setNewTripReturnDate(undefined);
              tripModalTranslateY.setValue(0);
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheetContainer}>
            <Animated.View 
              style={[
                styles.bottomSheetContent,
                {
                  transform: [{ translateY: tripModalTranslateY }],
                },
              ]}
            >
              {/* Handle bar */}
              <View style={styles.bottomSheetHandleContainer}>
                <View style={styles.bottomSheetHandle} />
              </View>
              
              {/* Header */}
              <View style={styles.bottomSheetHeader} pointerEvents="box-none">
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowAddTripModal(false);
                    setFlightCarrier('');
                    setFlightNumber('');
                    setDetectedAirline(null);
                    setShowManualEntry(false);
                    setFlightLookupResult(null);
                    setFlightSegments([]);
                    setNewTripDepartureLocation('');
                    setNewTripDestination('');
                    setNewTripDepartureDate(new Date());
                    setNewTripReturnDate(undefined);
                    tripModalTranslateY.setValue(0);
                  }}
                  style={styles.bottomSheetCloseButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.bottomSheetTitle}>Add New Trip</Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    if (showManualEntry) {
                      if (newTripDepartureLocation.trim() && newTripDestination.trim()) {
                        handleAddTrip();
                        tripModalTranslateY.setValue(0);
                      }
                    } else {
                      handleFlightLookup();
                    }
                  }}
                  style={styles.bottomSheetCloseButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  activeOpacity={0.6}
                  disabled={showManualEntry ? (!newTripDepartureLocation.trim() || !newTripDestination.trim()) : (!flightCarrier.trim() || !flightNumber.trim() || isLookingUpFlight)}
                >
                  <Ionicons 
                    name={showManualEntry ? "checkmark" : "search"} 
                    size={24} 
                    color={
                      showManualEntry 
                        ? ((!newTripDepartureLocation.trim() || !newTripDestination.trim()) ? "#8E8E93" : "#34C759")
                        : ((!flightCarrier.trim() || !flightNumber.trim() || isLookingUpFlight) ? "#8E8E93" : "#34C759")
                    } 
                  />
                </TouchableOpacity>
              </View>

              
              <ScrollView 
                style={styles.bottomSheetBody} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.bottomSheetBodyContent, { paddingBottom: 24 + insets.bottom }]}
                keyboardShouldPersistTaps="handled"
              >
            {!showManualEntry ? (
              <>
                {flightSegmentCards}
                {!flightDetailsExpanded && (
                  <>
                    {detectedAirline ? (
                      <View style={styles.airlineHeader}>
                        <Text style={styles.airlineName}>{detectedAirline}</Text>
                      </View>
                    ) : (
                      <View style={styles.airlineHeader}>
                        <Text style={styles.airlineName}>Flight Number</Text>
                      </View>
                    )}
                    <View style={styles.inputContainer}>
                      <View style={styles.flightInputRow}>
                        <View style={styles.flightCarrierInput}>
                          <TextInput
                            style={styles.textInput}
                            value={flightCarrier}
                            onChangeText={setFlightCarrier}
                            placeholder="AA"
                            placeholderTextColor="#8E8E93"
                            autoCapitalize="characters"
                            maxLength={2}
                          />
                        </View>
                        <View style={styles.flightNumberInput}>
                          <TextInput
                            style={styles.textInput}
                            value={flightNumber}
                            onChangeText={setFlightNumber}
                            placeholder="128"
                            placeholderTextColor="#8E8E93"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </View>
                    {flightLookupCard}
                  </>
                )}
                {flightDetailsExpanded && flightLookupCard}

                {((flightDetailsExpanded && flightLookupResult) || (flightSegments.length > 0 && !flightLookupResult)) ? (
                  <View style={styles.flightActionsContainer}>
                    <TouchableOpacity 
                      style={styles.addAnotherFlightButton}
                      onPress={() => {
                        if (flightLookupResult) {
                          setFlightSegments(prev => [...prev, flightLookupResult]);
                          setFlightLookupResult(null);
                          setFlightCarrier('');
                          setFlightNumber('');
                          setFlightDetailsExpanded(false);
                        }
                      }}
                    >
                      <Ionicons name="add" size={18} color="#059669" />
                      <Text style={styles.addAnotherFlightText}>Add another flight</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.continueButton}
                      onPress={() => {
                        const allFlights = flightLookupResult ? [...flightSegments, flightLookupResult] : flightSegments;
                        const first = allFlights[0];
                        const last = allFlights[allFlights.length - 1];
                        const newTrip: Trip = {
                          id: Date.now().toString(),
                          departureLocation: first.origin_city,
                          destination: last.dest_city,
                          departureDate: new Date(first.dep_local),
                          returnDate: undefined,
                          timezone: last.dest_tz,
                          checklist: {
                            vaccines: [
                              { name: 'COVID-19', completed: false },
                              { name: 'Hepatitis A', completed: false },
                              { name: 'Typhoid', completed: false }
                            ],
                            medicines: [
                              { name: 'Pain relievers', completed: false },
                              { name: 'Anti-diarrheal', completed: false },
                              { name: 'Motion sickness', completed: false }
                            ]
                          },
                          jetLagPlanner: {
                            departureTime: new Date(first.dep_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                            arrivalTime: new Date(last.arr_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                            outboundPlan: {
                              direction: 'outbound',
                              timezoneAdjustment: '+0',
                              circadianPlan: []
                            }
                          }
                        };
                        setTrips(prev => [...prev, newTrip]);
                        setShowAddTripModal(false);
                        setFlightCarrier('');
                        setFlightNumber('');
                        setDetectedAirline(null);
                        setFlightLookupResult(null);
                        setFlightSegments([]);
                        setFlightDetailsExpanded(false);
                        setNewTripDepartureLocation('');
                        setNewTripDestination('');
                        setNewTripDepartureDate(new Date());
                        setNewTripReturnDate(undefined);
                      }}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {isLookingUpFlight && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>Looking up flight...</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.manualEntryButton, { marginTop: 16 }]}
                  onPress={() => setShowManualEntry(true)}
                >
                  <Text style={styles.manualEntryButtonText}>Enter details manually instead</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
            <Text style={styles.inputLabel}>Departure Location:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={newTripDepartureLocation}
                onChangeText={setNewTripDepartureLocation}
                placeholder="Enter departure location (e.g., New York, USA)"
                placeholderTextColor="#8E8E93"
              />
              {departureSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {newTripDepartureLocation.trim() === '' ? (
                    <TouchableOpacity
                      style={[styles.suggestionItem, styles.suggestionItemDivider]}
                      onPress={async () => {
                        try {
                          setIsGettingLocation(true);
                          const location = await getCurrentLocation();
                          if (location) {
                            const cityName = 'Current Location';
                            setNewTripDepartureLocation(cityName);
                            setDepartureSuggestions([]);
                            Keyboard.dismiss();
                          }
                        } catch (error) {
                          Alert.alert('Location Permission Required', 'Please enable location access in Settings to use this feature.', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Settings', onPress: () => {} },
                          ]);
                        } finally {
                          setIsGettingLocation(false);
                        }
                      }}
                      disabled={isGettingLocation}
                    >
                      <Ionicons name="navigate" size={16} color={isGettingLocation ? '#8E8E93' : '#007AFF'} />
                      <Text style={styles.suggestionText}>{isGettingLocation ? 'Getting location…' : 'Use current location'}</Text>
                      {isGettingLocation && <ActivityIndicator size="small" color="#8E8E93" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                  ) : null}
                  {departureSuggestions.slice(0, 5).map((city, index) => (
            <TouchableOpacity 
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setNewTripDepartureLocation(city);
                        setDepartureSuggestions([]);
                        Keyboard.dismiss();
                      }}
                    >
                      <Ionicons name="location" size={16} color="#007AFF" />
                      <Text style={styles.suggestionText}>{city}</Text>
            </TouchableOpacity>
                  ))}
                </View>
              )}
          </View>

            <Text style={styles.inputLabel}>Destination:</Text>
            <View style={styles.inputContainer}>
          <TextInput
                style={styles.textInput}
            value={newTripDestination}
            onChangeText={setNewTripDestination}
                placeholder="Enter destination (e.g., Tokyo, Japan)"
                placeholderTextColor="#8E8E93"
              />
              {tripSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {tripSuggestions.slice(0, 5).map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setNewTripDestination(city);
                        setTripSuggestions([]);
                        Keyboard.dismiss();
                      }}
                    >
                      <Ionicons name="location" size={16} color="#007AFF" />
                      <Text style={styles.suggestionText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

          <Text style={styles.inputLabel}>Departure Date:</Text>
          <TouchableOpacity 
              style={styles.dateButton}
            onPress={() => {
              setShowDatePicker('departure');
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
              <Text style={styles.dateButtonText}>
              {newTripDepartureDate.toLocaleDateString()}
            </Text>
              <Ionicons name="calendar" size={16} color="#8E8E93" />
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Return Date: (Optional)</Text>
          <TouchableOpacity 
              style={styles.dateButton}
            onPress={() => {
              setShowDatePicker('return');
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
              <Text style={styles.dateButtonText}>
                {newTripReturnDate ? newTripReturnDate.toLocaleDateString() : 'Select date'}
            </Text>
              <Ionicons name="calendar" size={16} color="#8E8E93" />
          </TouchableOpacity>
              </>
            )}
              </ScrollView>
            </Animated.View>
          </View>
          
          {/* Date Picker Overlay - Inside the bottom sheet modal */}
          {showDatePicker && (
            <View style={styles.datePickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {
                setTempDatePickerValue(undefined);
                setShowDatePicker(null);
              }}>
                <View style={StyleSheet.absoluteFill} />
              </TouchableWithoutFeedback>
              <View style={styles.datePickerModalContent} pointerEvents="box-none">
                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                  <View>
                    <View style={styles.datePickerHeader}>
                      <TouchableOpacity onPress={() => {
                        setTempDatePickerValue(undefined);
                        setShowDatePicker(null);
                      }}>
                        <Ionicons name="close" size={22} color="#FF3B30" />
                      </TouchableOpacity>
                      <Text style={styles.datePickerTitle}>
                        {showDatePicker === 'departure' ? 'Departure Date' : 'Return Date'}
                      </Text>
                      <TouchableOpacity onPress={() => {
                        // Save the temporary value when Done is clicked
                        if (tempDatePickerValue) {
                          if (showDatePicker === 'departure') {
                            setNewTripDepartureDate(tempDatePickerValue);
                          } else if (showDatePicker === 'return') {
                            setNewTripReturnDate(tempDatePickerValue);
                          }
                        }
                        setTempDatePickerValue(undefined);
                        setShowDatePicker(null);
                      }}>
                        <Ionicons name="checkmark" size={22} color="#34C759" />
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDatePickerValue ?? (showDatePicker === 'departure' ? newTripDepartureDate : (newTripReturnDate || new Date()))}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      themeVariant="dark"
                      textColor="#FFFFFF"
                      onChange={handleDateChange}
                      minimumDate={showDatePicker === 'return' ? newTripDepartureDate : new Date()}
                      style={styles.datePicker}
                      key={showDatePicker} // Force re-mount when switching between departure/return
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Edit Trip Modal */}
      {showEditTripModal && editingTrip && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, { justifyContent: 'space-between' }]}>
              <TouchableOpacity onPress={() => setShowEditTripModal(false)}>
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { textAlign: 'center', flex: 1 }]}>Edit Trip</Text>
              <TouchableOpacity onPress={() => {
                if (!editingTrip) return;
                handleDeleteTrip(editingTrip.id);
                setShowEditTripModal(false);
              }}>
                <Ionicons name="trash" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Departure Location:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={editTripDepartureLocation}
                  onChangeText={setEditTripDepartureLocation}
                  placeholder="Enter departure location (e.g., New York, USA)"
                  placeholderTextColor="#8E8E93"
                />
                {(editTripDepartureLocation.trim() === '' || editTripDepartureSuggestions.length > 0) && (
                  <View style={styles.suggestionsContainer}>
                    {editTripDepartureLocation.trim() === '' && (
                      <TouchableOpacity
                        style={[styles.suggestionItem, styles.suggestionItemDivider]}
                        onPress={async () => {
                          try {
                            setIsGettingLocation(true);
                            const location = await getCurrentLocation();
                            if (location) {
                              const cityName = 'Current Location';
                              setEditTripDepartureLocation(cityName);
                              setEditTripDepartureSuggestions([]);
                              try { (TextInput as any).State?.blurTextInput?.(); } catch {}
                            }
                          } catch (error) {
                            Alert.alert('Location Permission Required', 'Please enable location access in Settings to use this feature.', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Settings', onPress: () => {} },
                            ]);
                          } finally {
                            setIsGettingLocation(false);
                          }
                        }}
                        disabled={isGettingLocation}
                      >
                        <Ionicons name="navigate" size={16} color={isGettingLocation ? '#8E8E93' : '#007AFF'} />
                        <Text style={styles.suggestionText}>{isGettingLocation ? 'Getting location…' : 'Use current location'}</Text>
                        {isGettingLocation && <ActivityIndicator size="small" color="#8E8E93" style={{ marginLeft: 8 }} />}
                      </TouchableOpacity>
                    )}
                    {editTripDepartureSuggestions.slice(0, 5).map((city, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setEditTripDepartureLocation(city);
                          setEditTripDepartureSuggestions([]);
                          try { (TextInput as any).State?.blurTextInput?.(); } catch {}
                        }}
                      >
                        <Ionicons name="location" size={16} color="#007AFF" />
                        <Text style={styles.suggestionText}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>Destination:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={editTripDestination}
                  onChangeText={setEditTripDestination}
                  placeholder="Enter destination (e.g., Tokyo, Japan)"
                  placeholderTextColor="#8E8E93"
                />
                {editTripSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {editTripSuggestions.slice(0, 5).map((city, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setEditTripDestination(city);
                          setEditTripSuggestions([]);
                          try { (TextInput as any).State?.blurTextInput?.(); } catch {}
                        }}
                      >
                        <Ionicons name="location" size={16} color="#007AFF" />
                        <Text style={styles.suggestionText}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>Departure Date:</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEditDatePicker('departure')}
              >
                <Text style={styles.dateButtonText}>
                  {editTripDepartureDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={16} color="#8E8E93" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Return Date: (Optional)</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEditDatePicker('return')}
              >
                <Text style={styles.dateButtonText}>
                  {editTripReturnDate ? editTripReturnDate.toLocaleDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar" size={16} color="#8E8E93" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={editTripNotes}
                onChangeText={setEditTripNotes}
                placeholder="Add any additional notes..."
                placeholderTextColor="#8E8E93"
                multiline
              />
            </ScrollView>

            <View style={styles.modalButtonsSingleCentered}>
              <TouchableOpacity
                style={styles.primaryCenteredButton}
                onPress={handleSaveEditTrip}
              >
                <Text style={styles.modalButtonPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Edit Date Picker */}
      {showEditDatePicker && (
        Platform.OS === 'ios' ? (
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => {
                  setTempEditDatePickerValue(undefined);
                  setShowEditDatePicker(null);
                }}>
                  <Ionicons name="close" size={22} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  {showEditDatePicker === 'departure' ? 'Departure Date' : 'Return Date'}
                </Text>
                <TouchableOpacity onPress={() => {
                  // Save the temporary value when Done is clicked
                  if (tempEditDatePickerValue) {
                    if (showEditDatePicker === 'departure') {
                      setEditTripDepartureDate(tempEditDatePickerValue);
                    } else {
                      setEditTripReturnDate(tempEditDatePickerValue);
                    }
                  }
                  setTempEditDatePickerValue(undefined);
                  setShowEditDatePicker(null);
                }}>
                  <Ionicons name="checkmark" size={22} color="#34C759" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempEditDatePickerValue ?? (showEditDatePicker === 'departure' ? editTripDepartureDate : (editTripReturnDate || new Date()))}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                themeVariant="dark"
                textColor="#FFFFFF"
                onChange={(event, selectedDate) => {
                  // iOS: Only update temporary value during scrolling
                  // Always create a new Date object to ensure React detects the change
                  if (Platform.OS === 'ios' && selectedDate) {
                    setTempEditDatePickerValue(new Date(selectedDate));
                  }
                }}
                minimumDate={showEditDatePicker === 'return' ? editTripDepartureDate : new Date()}
                style={styles.datePicker}
                key={showEditDatePicker} // Force re-mount when switching between departure/return
              />
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={showEditDatePicker === 'departure' ? editTripDepartureDate : (editTripReturnDate || new Date())}
            mode="date"
            display="default"
            themeVariant="dark"
            textColor="#FFFFFF"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                if (showEditDatePicker === 'departure') {
                  setEditTripDepartureDate(selectedDate);
                } else {
                  setEditTripReturnDate(selectedDate);
                }
              }
              setShowEditDatePicker(null);
            }}
            minimumDate={showEditDatePicker === 'return' ? editTripDepartureDate : new Date()}
          />
        )
      )}

      {/* Metric detail modal (dashboard exact content) */}
      {metricModalVisible && selectedMetric && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerDetailed}>
            <View style={styles.modalHeaderDetailed}>
              <View style={[styles.modalIconCircleDetailed, { backgroundColor: `${getStatusColor(selectedMetric.status)}20` }]}>
                <Ionicons name={selectedMetric.id === 'pollen' ? 'flower-outline' : selectedMetric.id === 'uv_index' ? 'sunny' : selectedMetric.id === 'air_quality' ? 'cloud-outline' : selectedMetric.id === 'water_safety' ? 'water-outline' : selectedMetric.id === 'outbreaks' ? 'bug-outline' : selectedMetric.id === 'altitude' ? 'trending-up-outline' : 'information-circle'} size={32} color={getStatusColor(selectedMetric.status)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitleDetailed}>{selectedMetric.label}</Text>
                <Text style={[styles.modalStatusDetailed, { color: getStatusColor(selectedMetric.status) }]}>
                  {getStatusLabel(selectedMetric.status)} • Score: {selectedMetric.score ?? getMetricScore(selectedMetric.label)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setMetricModalVisible(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={styles.modalSectionDetailed}>
                <Text style={styles.sectionTitleDetailed}>What is this?</Text>
                <Text style={styles.sectionContentDetailed}>{getMetricDetails(selectedMetric.id, selectedMetric.status).description}</Text>
              </View>

              <View style={styles.modalSectionDetailed}>
                <Text style={styles.sectionTitleDetailed}>Range Indicator</Text>
                {renderRangeIndicatorDetailed(selectedMetric.id, selectedMetric.status, selectedMetric.score)}
              </View>

              {/* Normal/Optimal ranges when available */}
              {(getMetricDetails(selectedMetric.id, selectedMetric.status).normalRange || getMetricDetails(selectedMetric.id, selectedMetric.status).optimalRange) && (
                <View style={styles.modalSectionDetailed}>
                  {getMetricDetails(selectedMetric.id, selectedMetric.status).normalRange && (
                    <Text style={styles.sectionContentDetailed}>Normal ranges: {getMetricDetails(selectedMetric.id, selectedMetric.status).normalRange}</Text>
                  )}
                  {getMetricDetails(selectedMetric.id, selectedMetric.status).optimalRange && (
                    <Text style={[styles.sectionContentDetailed, { marginTop: 6 }]}>Optimal: {getMetricDetails(selectedMetric.id, selectedMetric.status).optimalRange}</Text>
                  )}
                </View>
              )}

              <View style={styles.modalSectionDetailed}>
                <Text style={styles.sectionTitleDetailed}>What this means for you</Text>
                <Text style={styles.sectionContentDetailed}>{getMetricDetails(selectedMetric.id, selectedMetric.status).whatItMeans}</Text>
              </View>

              {getMetricDetails(selectedMetric.id, selectedMetric.status).healthImpacts.length > 0 && (
                <View style={styles.modalSectionDetailed}>
                  <Text style={styles.sectionTitleDetailed}>Potential Health Impacts</Text>
                  {getMetricDetails(selectedMetric.id, selectedMetric.status).healthImpacts.map((impact: string, idx: number) => (
                    <View key={idx} style={styles.impactItemDetailed}>
                      <Ionicons name="checkmark-circle" size={16} color={getStatusColor(selectedMetric.status)} />
                      <Text style={styles.impactTextDetailed}>{impact}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalSectionDetailed}>
                <Text style={styles.sectionTitleDetailed}>Recommendations</Text>
                {getMetricDetails(selectedMetric.id, selectedMetric.status).recommendations.map((r: string, idx: number) => (
                  <View key={idx} style={styles.recommendationItemDetailed}>
                    <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                    <Text style={styles.recommendationTextDetailed}>{r}</Text>
                  </View>
                ))}
              </View>

              {getMetricDetails(selectedMetric.id, selectedMetric.status).riskFactors.length > 0 && (
                <View style={[styles.modalSectionDetailed, { borderBottomWidth: 0 }]}> 
                  <Text style={styles.sectionTitleDetailed}>Risk Factors</Text>
                  {getMetricDetails(selectedMetric.id, selectedMetric.status).riskFactors.map((risk: string, idx: number) => (
                    <View key={idx} style={styles.riskItemDetailed}>
                      <Ionicons name="warning" size={16} color="#FF9500" />
                      <Text style={styles.riskTextDetailed}>{risk}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};


export default TravelScreen;

