import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput, ActivityIndicator, Platform, Keyboard, Linking, Animated, RefreshControl, Easing, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TravelStackParamList, SerializedTrip } from '../../../shared/types';
import Svg, { Rect, Polygon, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PagerView from 'react-native-pager-view';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { useSettings } from '../../../shared/context/SettingsContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { FlightLookupService } from '../../../shared/services/enhancedJetLagService';
import { searchCities, searchAllLocations, getPopularCities, CitySearchResult } from '../../../shared/services/citySearchService';
import { useReduceMotion } from '../../../shared/lib/reduceMotion';

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
  resultsOpacity.stopAnimation && (resultsOpacity as any).stopAnimation?.();
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
        resultsOpacity.stopAnimation && (resultsOpacity as any).stopAnimation?.();
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

  // Airline code to name mapping
  const airlineCodes: Record<string, string> = {
    'QR': 'Qatar Airways',
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'BA': 'British Airways',
    'AF': 'Air France',
    'LH': 'Lufthansa',
    'EK': 'Emirates',
    'SQ': 'Singapore Airlines',
    'CX': 'Cathay Pacific',
    'JL': 'Japan Airlines',
    'NH': 'All Nippon Airways',
    'QF': 'Qantas',
    'VS': 'Virgin Atlantic',
    'KL': 'KLM',
    'IB': 'Iberia',
    'LX': 'Swiss International Air Lines',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'TK': 'Turkish Airlines',
    'EY': 'Etihad Airways',
    'NZ': 'Air New Zealand',
    'AC': 'Air Canada',
    'WS': 'WestJet',
    'AS': 'Alaska Airlines',
    'B6': 'JetBlue Airways',
    'WN': 'Southwest Airlines',
    'F9': 'Frontier Airlines',
    'NK': 'Spirit Airlines',
  };

  // Mock flight data for testing
  const getMockFlightDetails = (carrier: string, number: string) => {
    const mockFlights: Record<string, any> = {
      'QR012': {
        carrier: 'QR',
        number: '012',
        origin_iata: 'LHR',
        dest_iata: 'DOH',
        origin_city: 'London',
        dest_city: 'Doha',
        dep_local: '2026-01-01T18:55:00',
        arr_local: '2026-01-02T04:35:00',
        origin_tz: 'Europe/London',
        dest_tz: 'Asia/Qatar',
      },
      'QR123': {
        carrier: 'QR',
        number: '123',
        origin_iata: 'JFK',
        dest_iata: 'DOH',
        origin_city: 'New York',
        dest_city: 'Doha',
        dep_local: '2026-01-01T22:30:00',
        arr_local: '2026-01-02T18:15:00',
        origin_tz: 'America/New_York',
        dest_tz: 'Asia/Qatar',
      },
      'AA128': {
        carrier: 'AA',
        number: '128',
        origin_iata: 'JFK',
        dest_iata: 'LAX',
        origin_city: 'New York',
        dest_city: 'Los Angeles',
        dep_local: '2026-01-01T08:00:00',
        arr_local: '2026-01-01T11:30:00',
        origin_tz: 'America/New_York',
        dest_tz: 'America/Los_Angeles',
      },
    };
    
    const key = `${carrier.toUpperCase()}${number}`;
    return mockFlights[key] || null;
  };

  // Detect airline when carrier code changes
  useEffect(() => {
    const code = flightCarrier.toUpperCase().trim();
    if (code && airlineCodes[code]) {
      setDetectedAirline(airlineCodes[code]);
    } else {
      setDetectedAirline(null);
    }
  }, [flightCarrier]);

  // Show flight details when flight number is entered
  useEffect(() => {
    if (flightCarrier.trim() && flightNumber.trim()) {
      const details = getMockFlightDetails(flightCarrier, flightNumber);
      if (details) {
        setFlightLookupResult(details);
      } else {
        setFlightLookupResult(null);
      }
    } else {
      setFlightLookupResult(null);
    }
  }, [flightCarrier, flightNumber]);
  const [newTripDepartureLocation, setNewTripDepartureLocation] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripDepartureDate, setNewTripDepartureDate] = useState(new Date());
  const [newTripReturnDate, setNewTripReturnDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<'departure' | 'return' | null>(null);
  const [tempDatePickerValue, setTempDatePickerValue] = useState<Date | undefined>(undefined);
  const datePickerInitializedRef = useRef(false);
  const [isAddingTrip, setIsAddingTrip] = useState(false);

  // Debug: Track showDatePicker changes
  useEffect(() => {
    console.log('showDatePicker state changed:', showDatePicker);
  }, [showDatePicker]);

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
  const [showEditDatePicker, setShowEditDatePicker] = useState<'departure' | 'return' | null>(null);
  const [tempEditDatePickerValue, setTempEditDatePickerValue] = useState<Date | undefined>(undefined);
  const editDatePickerInitializedRef = useRef(false);
  const [editTripSuggestions, setEditTripSuggestions] = useState<string[]>([]);
  const [editTripDepartureLocation, setEditTripDepartureLocation] = useState('');
  const [editTripDepartureSuggestions, setEditTripDepartureSuggestions] = useState<string[]>([]);

  const { travelHealth, updateLocation, getCurrentLocation, updateTravelHealthData } = useHealthData();

  // Mock health metrics data
  const mockHealthMetrics: HealthMetric[] = [
    {
      name: 'Air Quality',
      value: 'Good',
      status: 'good',
      description: 'AQI: 45 - Healthy for most people',
      icon: 'cloud'
    },
    {
      name: 'Water Safety',
      value: 'Safe',
      status: 'good',
      description: 'Tap water is safe to drink',
      icon: 'water'
    },
    {
      name: 'UV Index',
      value: 'Moderate',
      status: 'moderate',
      description: 'UV Index: 6 - Use sunscreen',
      icon: 'sunny'
    },
    {
      name: 'Food Safety',
      value: 'Good',
      status: 'good',
      description: 'Low risk of foodborne illness',
      icon: 'restaurant'
    },
    {
      name: 'Pollen Level',
      value: 'Low',
      status: 'good',
      description: 'Pollen count: 2.3 - Minimal allergy risk',
      icon: 'leaf'
    },
    {
      name: 'Altitude',
      value: 'Low',
      status: 'good',
      description: 'Sea level - No altitude sickness risk',
      icon: 'mountain-outline'
    },
    {
      name: 'Disease Outbreaks',
      value: 'None',
      status: 'good',
      description: 'No current disease outbreaks reported',
      icon: 'medical'
    }
  ];

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
        console.log('🔍 Searching for trip destination:', newTripDestination);
        try {
          const results = await searchAllLocations(newTripDestination, 12);
          console.log('🔍 Search results:', results);
          const cityNames = results.map(city => `${city.name}, ${city.country}`);
          console.log('🔍 City names:', cityNames);
          setTripSuggestions(cityNames);
        } catch (error) {
          console.error('Error searching trip destinations:', error);
          // Fallback to popular cities filter
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(newTripDestination.toLowerCase())
      );
      console.log('🔍 Fallback suggestions:', filtered);
      setTripSuggestions(filtered);
      }
      } else {
      console.log('🔍 Clearing trip suggestions - query too short');
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // For demo purposes, we'll use mock data
      const mockHealthData = {
        name: city,
        location: city,
        country: getCountryFromCity(city),
        coordinates: { latitude: 0, longitude: 0 },
        timezone: 'UTC',
        elevation: 0,
        airQuality: { value: 'Good', status: 'good', description: 'AQI: 45 - Healthy for most people' },
        waterSafety: { value: 'Safe', status: 'good', description: 'Tap water is safe to drink' },
        uvIndex: { value: 'Moderate', status: 'moderate', description: 'UV Index: 6 - Use sunscreen' },
        foodSafety: { value: 'Good', status: 'good', description: 'Low risk of foodborne illness' },
        pollenLevel: { value: 'Low', status: 'good', description: 'Pollen count: 2.3 - Minimal allergy risk' },
        altitudeRisk: { value: 'Low', status: 'good', description: 'Sea level - No altitude sickness risk' },
        diseaseOutbreaks: { value: 'None', status: 'good', description: 'No current disease outbreaks reported' }
      };
      
      // Update context immediately so UI can render
      await updateTravelHealthData(mockHealthData);
      setSelectedLocation(city);
      // ensure normal cards are visible
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#32D74B';
      case 'moderate': return '#FF9F0A';
      case 'poor': return '#FF6B35';
      case 'hazardous': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  // Status-based icon colors that match the health status
  const getMetricFixedIconColor = (metricId: string, status?: string): string => {
    // Use status-based colors if status is provided
    if (status) {
      return getStatusColor(status);
    }
    
    // Fallback to fixed colors for backward compatibility
    switch (metricId) {
      case 'air_quality':
        return '#A1A1A6'; // Grey
      case 'uv_index':
        return '#FFC44D'; // Yellow-Orange
      case 'food_safety':
        return '#FFB26B'; // Orange
      case 'pollen':
        return '#FFE066'; // Yellow
      case 'altitude':
        return '#66D0FF'; // Light Blue
      case 'outbreaks':
        return '#FF6B6B'; // Red
      case 'water_safety':
        return '#4DD0E1'; // Aqua
      default:
        return '#8E8E93';
    }
  };

  // Score/dynamic colors following official risk gradients per metric
  const getScoreColor = (metricId: string, status: string, score?: number): string => {
    const st = (status || '').toLowerCase();
    switch (metricId) {
      case 'air_quality':
        if (st === 'good' || (typeof score === 'number' && score <= 50)) return '#30D158';
        if (st === 'moderate' || (typeof score === 'number' && score <= 100)) return '#FF9F0A';
        if ((typeof score === 'number' && score <= 150)) return '#FF6B35';
        if (st === 'poor' || st === 'unhealthy' || (typeof score === 'number' && score <= 200)) return '#FF3B30';
        return '#AF52DE';
      case 'uv_index':
        if (st === 'good' || (typeof score === 'number' && score <= 30)) return '#30D158';
        if (st === 'moderate' || (typeof score === 'number' && score <= 60)) return '#FF9F0A';
        if (st === 'poor' || (typeof score === 'number' && score <= 80)) return '#FF3B30';
        return '#AF52DE';
      case 'food_safety':
        if (st === 'good' || (typeof score === 'number' && score >= 70)) return '#32D74B';
        if (st === 'moderate' || (typeof score === 'number' && score >= 40)) return '#FF9F0A';
        return '#FF3B30';
      case 'pollen':
        if (st === 'good') return '#FFD60A';
        if (st === 'moderate') return '#FF9F0A';
        return '#FF3B30';
      case 'altitude':
        if (st === 'good') return '#A7DBFF';
        if (st === 'moderate') return '#409CFF';
        return '#0047AB';
      case 'outbreaks':
        if (st === 'good') return '#FF9AA2';
        if (st === 'moderate') return '#FF6B6B';
        if (st === 'poor') return '#FF3B30';
        return '#8B0000';
      case 'water_safety':
        if (st === 'good' || (typeof score === 'number' && score >= 80)) return '#32D74B';
        if (st === 'moderate' || (typeof score === 'number' && score >= 60)) return '#FF9F0A';
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return 'checkmark-circle';
      case 'moderate': return 'warning';
      case 'poor': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Match dashboard-like scores for display on the right side of cards
  const getMetricScore = (metricName: string): number => {
    switch (metricName) {
      case 'Air Quality': return 72;
      case 'Water Safety': return 95;
      case 'UV Index': return 60;
      case 'Food Safety': return 85;
      case 'Pollen Level': return 40;
      case 'Altitude': return 90;
      case 'Disease Outbreaks': return 100;
      default: return 80;
    }
  };

  // Dashboard-like modal helpers
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'Good';
      case 'moderate': return 'Moderate';
      case 'poor': return 'Poor';
      case 'hazardous': return 'Hazardous';
      default: return 'Unknown';
    }
  };

  // Detailed explanations to match dashboard
  const getAirQualityExplanation = (status: string) => {
    switch (status) {
      case 'good': return 'Air quality is good with low levels of pollutants. Safe for most people, including sensitive groups.';
      case 'moderate': return 'Air quality is moderate with some pollutants present. Sensitive individuals may experience minor irritation.';
      case 'poor': return 'Air quality is poor with elevated pollutant levels. Sensitive groups should limit outdoor activities.';
      case 'hazardous': return 'Air quality is hazardous with very high pollutant levels. Everyone should avoid outdoor activities.';
      default: return 'Air quality status is being monitored.';
    }
  };
  const getAirQualityHealthImpacts = (status: string) => {
    switch (status) {
      case 'good': return ['Minimal health impacts', 'Safe for most activities'];
      case 'moderate': return ['Possible irritation for sensitive individuals', 'Consider reducing outdoor exercise', 'Monitor for respiratory symptoms'];
      case 'poor': return ['Increased risk of respiratory irritation', 'Avoid outdoor exercise', 'Sensitive groups should stay indoors'];
      case 'hazardous': return ['Serious health risks for everyone', 'Avoid all outdoor activities', 'Use air purifiers indoors'];
      default: return ['Monitor for any respiratory symptoms'];
    }
  };
  const getAirQualityRecommendations = (status: string) => {
    switch (status) {
      case 'good': return ['Outdoor activities are generally safe', 'Monitor sensitive individuals'];
      case 'moderate': return ['Limit outdoor exercise', 'Close windows during peak hours', 'Use air purifiers', 'Wear masks if sensitive'];
      case 'poor': return ['Avoid outdoor activities', 'Keep windows closed', 'Use air purifiers', 'Wear N95 masks if going outside'];
      case 'hazardous': return ['Stay indoors with windows closed', 'Use high-efficiency air purifiers', 'Wear N95 masks if necessary'];
      default: return ['Monitor air quality updates', 'Take appropriate precautions'];
    }
  };

  const getPollenExplanation = (status: string) => {
    switch (status) {
      case 'good': return 'Pollen levels are low. Most people with mild allergies should be comfortable.';
      case 'moderate': return 'Pollen levels are moderate. People with allergies may experience symptoms.';
      case 'poor': return 'Pollen levels are high. Significant risk of allergic reactions for sensitive individuals.';
      default: return 'Pollen levels are being monitored.';
    }
  };
  const getPollenHealthImpacts = (status: string) => {
    switch (status) {
      case 'good': return ['Minimal allergy symptoms', 'Most people comfortable outdoors'];
      case 'moderate': return ['Allergy symptoms likely for sensitive individuals', 'Sneezing, runny nose, itchy eyes possible'];
      case 'poor': return ['Significant allergy symptoms expected', 'Avoid outdoor activities if possible'];
      default: return ['Monitor for allergy symptoms'];
    }
  };
  const getPollenRecommendations = (status: string) => {
    switch (status) {
      case 'good': return ['Outdoor activities generally safe', 'Take allergy medications if needed'];
      case 'moderate': return ['Take allergy medications before going out', 'Avoid early morning outdoor activities', 'Wear sunglasses and hat'];
      case 'poor': return ['Take allergy medications', 'Limit outdoor activities', 'Keep windows closed', 'Use air purifiers with HEPA filters'];
      default: return ['Monitor pollen forecasts', 'Take appropriate allergy precautions'];
    }
  };

  const getWaterQualityExplanation = (status: string) => {
    switch (status) {
      case 'good': return 'Water is safe to drink with minimal contaminants well below harmful levels. Meets health standards and is suitable for all daily uses including drinking and cooking.';
      case 'moderate': return 'Water is generally safe to drink but may have taste, odor, or minor quality issues. Consider filtration for better taste.';
      case 'poor': return 'Water has elevated contaminant levels that may pose health risks. Not recommended for drinking without treatment.';
      default: return 'Water quality is being monitored for safety.';
    }
  };
  const getWaterQualityHealthImpacts = (status: string) => {
    switch (status) {
      case 'good': return ['Minimal health risks', 'Safe for daily consumption'];
      case 'moderate': return ['Possible gastrointestinal issues', 'May affect taste and odor'];
      case 'poor': return ['Increased risk of gastrointestinal illness', 'Avoid drinking untreated water'];
      default: return ['Monitor for any digestive symptoms'];
    }
  };
  const getWaterQualityRecommendations = (status: string) => {
    switch (status) {
      case 'good': return ['Tap water is safe to drink', 'Good for daily use'];
      case 'moderate': return ['Use water filters for drinking', 'Boil water for cooking'];
      case 'poor': return ['Use high-quality water filters', 'Drink bottled or filtered water'];
      default: return ['Check local water quality reports', 'Use appropriate water treatment methods'];
    }
  };

  // UV Index details
  const getUVExplanation = (status: string) => {
    switch (status) {
      case 'good': return 'UV levels are low. Minimal protection needed.';
      case 'moderate': return 'UV levels are moderate. Protection is recommended during midday.';
      case 'poor': return 'UV levels are high. Extra protection is required, especially midday.';
      case 'hazardous': return 'UV levels are very high to extreme. Avoid direct sun and use maximum protection.';
      default: return 'UV levels are being monitored.';
    }
  };
  const getUVHealthImpacts = (status: string) => {
    switch (status) {
      case 'good': return ['Very low risk of skin damage'];
      case 'moderate': return ['Risk of sunburn for unprotected skin', 'Eye strain possible'];
      case 'poor': return ['Increased sunburn risk within 30–60 minutes', 'Potential eye damage without protection'];
      case 'hazardous': return ['Sunburn in minutes', 'High risk of skin and eye damage'];
      default: return [];
    }
  };
  const getUVRecommendations = (status: string) => {
    switch (status) {
      case 'good': return ['Sunscreen optional', 'Sunglasses for comfort'];
      case 'moderate': return ['Use SPF 30+ sunscreen', 'Wear sunglasses and a hat', 'Seek shade near midday'];
      case 'poor': return ['Use SPF 50+ sunscreen', 'Wear protective clothing and hat', 'Limit time in direct sun'];
      case 'hazardous': return ['Avoid direct sun 10am–4pm', 'SPF 50+, sunglasses (UV400)', 'Seek shade and cover up'];
      default: return ['Use appropriate sun protection'];
    }
  };

  // Food safety details
  const getFoodSafetyExplanation = (status: string) => {
    switch (status) {
      case 'good': return 'Food safety standards are generally good. Low risk of foodborne illness.';
      case 'moderate': return 'Food safety varies. Be selective with vendors and preparation.';
      case 'poor': return 'Higher risk of foodborne illness. Choose reputable venues and cooked food.';
      default: return 'Food safety conditions are being monitored.';
    }
  };
  const getFoodSafetyHealthImpacts = (status: string) => {
    switch (status) {
      case 'moderate': return ['Traveler’s diarrhea risk present', 'Mild GI upset possible'];
      case 'poor': return ['Higher risk of GI illness', 'Dehydration and electrolyte imbalance possible'];
      default: return [];
    }
  };
  const getFoodSafetyRecommendations = (status: string) => {
    switch (status) {
      case 'good': return ['Normal precautions', 'Wash hands before eating'];
      case 'moderate': return ['Eat freshly cooked food', 'Avoid raw/undercooked meats', 'Use bottled water for brushing teeth'];
      case 'poor': return ['Avoid street food/raw salads', 'Drink sealed bottled water', 'Carry oral rehydration salts'];
      default: return ['Follow safe food and water practices'];
    }
  };

  // Altitude details
  const getAltitudeExplanation = (status: string) => {
    switch (status) {
      case 'good': return 'Altitude is low; minimal physiological impact.';
      case 'moderate': return 'Moderate altitude may affect sleep and exercise tolerance.';
      case 'poor': return 'High altitude increases risk of acute mountain sickness without acclimatization.';
      default: return 'Altitude impact is being assessed.';
    }
  };
  const getAltitudeHealthImpacts = (status: string) => {
    switch (status) {
      case 'moderate': return ['Mild headache or fatigue', 'Reduced exercise tolerance'];
      case 'poor': return ['Headache, nausea, insomnia', 'Risk of AMS at >2500m (8200ft)'];
      default: return [];
    }
  };
  const getAltitudeRecommendations = (status: string) => {
    switch (status) {
      case 'good': return ['Stay hydrated', 'Normal activity acceptable'];
      case 'moderate': return ['Ascend gradually', 'Hydrate and avoid alcohol on arrival'];
      case 'poor': return ['Acclimatize 1–2 days', 'Avoid rapid ascent', 'Consider acetazolamide if advised'];
      default: return ['Follow acclimatization guidance'];
    }
  };

  // Disease outbreaks details
  const getOutbreaksExplanation = (status: string) => {
    switch (status) {
      case 'good': return 'No significant outbreaks reported.';
      case 'moderate': return 'Localized outbreaks present. Follow public health guidance.';
      case 'poor': return 'Widespread outbreaks. Heightened precautions recommended.';
      default: return 'Outbreak status is being monitored.';
    }
  };
  const getOutbreaksHealthImpacts = (status: string) => {
    switch (status) {
      case 'moderate': return ['Elevated infection risk in specific areas'];
      case 'poor': return ['High infection risk', 'Potential healthcare strain'];
      default: return [];
    }
  };
  const getOutbreaksRecommendations = (status: string) => {
    switch (status) {
      case 'good': return ['Keep routine vaccinations up to date'];
      case 'moderate': return ['Practice hand hygiene', 'Avoid crowded indoor spaces', 'Use masks where advised'];
      case 'poor': return ['Consider postponing non-essential travel', 'Strict hygiene and masking', 'Follow local advisories'];
      default: return ['Follow health authority guidance'];
    }
  };
  const getMetricDetails = (metricId: string, status: string) => {
    // Map travel IDs to dashboard IDs
    const mappedId = metricId === 'water_safety' ? 'water_quality' : metricId;
    const details: any = {
      'air_quality': {
        description: 'Air Quality Index (AQI) measures the concentration of pollutants in the air, including particulate matter, ozone, nitrogen dioxide, and sulfur dioxide.',
        normalRange: '0-50 (Good) • 51-100 (Moderate) • 101-150 (Unhealthy for Sensitive) • 151-200 (Unhealthy) • 201+ (Hazardous)',
        optimalRange: '0-25 (Excellent) - Perfect for outdoor activities',
        whatItMeans: getAirQualityExplanation(status),
        healthImpacts: getAirQualityHealthImpacts(status),
        recommendations: getAirQualityRecommendations(status),
        riskFactors: ['Outdoor exercise during high pollution', 'Living near busy roads or industrial areas', 'Pre-existing respiratory conditions', 'Age (children and elderly more vulnerable)', 'Smoking or secondhand smoke exposure']
      },
      'pollen': {
        description: 'Pollen count measures the concentration of pollen grains in the air. Different types of pollen (tree, grass, weed) can trigger allergic reactions.',
        normalRange: '0-9 (Low) • 10-49 (Moderate) • 50-149 (High) • 150+ (Very High)',
        optimalRange: '0-4 (Very Low) - Minimal allergy risk',
        whatItMeans: getPollenExplanation(status),
        healthImpacts: getPollenHealthImpacts(status),
        recommendations: getPollenRecommendations(status),
        riskFactors: ['Seasonal allergies (hay fever)', 'Asthma or respiratory conditions', 'Outdoor activities during peak pollen times', 'Living in areas with high vegetation', 'Family history of allergies']
      },
      'water_quality': {
        description: 'Water quality measures the safety and cleanliness of local water sources, including chemical contaminants, bacteria, and mineral content.',
        whatItMeans: getWaterQualityExplanation(status),
        healthImpacts: getWaterQualityHealthImpacts(status),
        recommendations: getWaterQualityRecommendations(status),
        riskFactors: ['Drinking untreated water', 'Traveling to areas with poor sanitation', 'Compromised immune system', 'Pregnancy or young children', 'Local water treatment issues']
      }
    };
    // Additional, richer details for other metrics
    details['uv_index'] = {
      description: 'UV Index reflects the strength of sunburn-producing ultraviolet radiation.',
      normalRange: '0-2 (Low) • 3-5 (Moderate) • 6-7 (High) • 8-10 (Very High) • 11+ (Extreme)',
      optimalRange: '0-2 (Low) - Minimal protection needed',
      whatItMeans: getUVExplanation(status),
      healthImpacts: getUVHealthImpacts(status),
      recommendations: getUVRecommendations(status),
      riskFactors: ['Fair skin or photosensitive conditions', 'Midday outdoor exposure', 'High altitude or equatorial regions', 'Reflective surfaces (snow/water)']
    };
    details['food_safety'] = {
      description: 'Food safety risk reflects local hygiene, preparation practices, and contamination risk.',
      normalRange: '70-100 (Good) • 40-69 (Moderate) • 0-39 (Poor)',
      optimalRange: '≥80 (Good) - Low risk with basic precautions',
      whatItMeans: getFoodSafetyExplanation(status),
      healthImpacts: getFoodSafetyHealthImpacts(status),
      recommendations: getFoodSafetyRecommendations(status),
      riskFactors: ['Raw/undercooked foods', 'Unboiled/untreated water', 'Poor hand hygiene', 'Cross-contamination in street markets']
    };
    details['altitude'] = {
      description: 'Altitude can reduce oxygen availability and affect sleep and exercise tolerance.',
      normalRange: '<1500m (Low) • 1500–2500m (Moderate) • 2500–3500m (High) • 3500–5500m (Very High) • >5500m (Extreme)',
      optimalRange: '<1500m - Minimal physiological impact',
      whatItMeans: getAltitudeExplanation(status),
      healthImpacts: getAltitudeHealthImpacts(status),
      recommendations: getAltitudeRecommendations(status),
      riskFactors: ['Rapid ascent', 'History of altitude illness', 'Strenuous exertion on arrival', 'Dehydration']
    };
    details['outbreaks'] = {
      description: 'Summarizes notable infectious disease activity reported locally.',
      normalRange: '0-19 (None) • 20-39 (Low) • 40-59 (Moderate) • 60-79 (High) • 80-100 (Severe)',
      optimalRange: '0-19 (None) - Routine precautions only',
      whatItMeans: getOutbreaksExplanation(status),
      healthImpacts: getOutbreaksHealthImpacts(status),
      recommendations: getOutbreaksRecommendations(status),
      riskFactors: ['Crowded indoor settings', 'Limited healthcare capacity', 'Low vaccination coverage', 'Travel during peak transmission seasons']
    };
    return details[mappedId] || {
      description: 'This metric provides important travel health context.',
      whatItMeans: 'Monitor this metric for potential health impacts.',
      healthImpacts: [],
      recommendations: ['Stay informed about local conditions', 'Take appropriate precautions'],
      riskFactors: []
    };
  };

  const renderRangeIndicatorDetailed = (metricId: string, status: string, score?: number) => {
    const mappedId = metricId === 'water_safety' ? 'water_quality' : metricId;
    const ranges: any = {
      'air_quality': {
        segments: [
          { label: 'Good', color: '#30D158', range: '0-50' },
          { label: 'Moderate', color: '#FF9F0A', range: '51-100', isBold: true },
          { label: 'Unhealthy for Sensitive', color: '#FF6B35', range: '101-150' },
          { label: 'Unhealthy', color: '#FF3B30', range: '151-200' },
          { label: 'Hazardous', color: '#8B0000', range: '201+' }
        ],
        currentValue: 75,
        currentLabel: 'Moderate',
        scaleMax: 300
      },
      'pollen': {
        segments: [
          { label: 'Very Low', color: '#30D158', range: '0-4' },
          { label: 'Low', color: '#32D74B', range: '5-9' },
          { label: 'Moderate', color: '#FF9F0A', range: '10-49' },
          { label: 'High', color: '#FF6B35', range: '50-149' },
          { label: 'Very High', color: '#FF3B30', range: '150+' }
        ],
        currentValue: 25,
        currentLabel: 'Moderate',
        scaleMax: 200
      },
      'water_quality': {
        segments: [
          { label: 'Poor', color: '#FF3B30', range: '0-44' },
          { label: 'Marginal', color: '#FF6B35', range: '45-64' },
          { label: 'Good', color: '#FF9F0A', range: '65-79', isBold: true },
          { label: 'Very Good', color: '#32D74B', range: '80-94' },
          { label: 'Excellent', color: '#30D158', range: '95-100' }
        ],
        currentValue: 87,
        currentLabel: 'Very Good',
        scaleMax: 100
      },
      'default': {
        segments: [
          { label: 'Poor', color: '#FF3B30', range: '0-39' },
          { label: 'Moderate', color: '#FF9F0A', range: '40-69', isBold: true },
          { label: 'Good', color: '#32D74B', range: '70-100' }
        ],
        currentValue: typeof score === 'number' ? score : 50,
        currentLabel: getStatusLabel(status),
        scaleMax: 100
      }
    };
    const rangeData = ranges[mappedId] || ranges.default;
    const barWidth = 300;
    const barHeight = 20;
    const gap = 2;
    const totalGaps = (rangeData.segments.length - 1) * gap;
    const availableWidth = barWidth - totalGaps;
    const segmentWidth = availableWidth / rangeData.segments.length;

    let pointerPosition: number;
    pointerPosition = Math.min((rangeData.currentValue / rangeData.scaleMax) * barWidth, barWidth - 10);

    return (
      <View style={styles.rangeIndicatorContainerDetailed}>
        <Svg width={barWidth} height={45}>
          {rangeData.segments.map((segment: any, index: number) => {
            const x = index * (segmentWidth + gap);
            return (
              <Rect
                key={index}
                x={x}
                y={2}
                width={segmentWidth}
                height={barHeight}
                fill={segment.color}
                rx={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
                ry={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
              />
            );
          })}
          <Polygon
            points={`${Math.min(Math.max(pointerPosition, 10), barWidth - 10)},0 ${Math.min(Math.max(pointerPosition - 6, 4), barWidth - 16)},15 ${Math.min(Math.max(pointerPosition + 6, 16), barWidth - 4)},15`}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          {rangeData.segments.map((segment: any, index: number) => {
            const x = index * (segmentWidth + gap);
            const centerX = x + (segmentWidth / 2);
            return (
              <G key={index}>
                <SvgText x={centerX} y={32} fontSize="10" fill="#FFFFFF" fontWeight={segment.isBold ? 'bold' : '600'} textAnchor="middle">{segment.label}</SvgText>
                <SvgText x={centerX} y={42} fontSize="10" fill="#8E8E93" textAnchor="middle">{segment.range}</SvgText>
              </G>
            );
          })}
        </Svg>
        <View style={styles.currentScoreContainerDetailed}>
          <Text style={styles.currentScoreTextDetailed}>Your score is in the {rangeData.currentLabel} range ({rangeData.currentValue}).</Text>
        </View>
      </View>
    );
  };

  const renderRangeIndicator = (metricId: string) => {
    const barWidth = 300;
    const barHeight = 20;
    const config: any = {
      air_quality: {
        segments: [
          { label: 'Good', color: '#30D158' },
          { label: 'Moderate', color: '#FF9F0A' },
          { label: 'Unhealthy', color: '#FF3B30' },
        ],
      },
      uv_index: {
        segments: [
          { label: 'Low', color: '#30D158' },
          { label: 'Moderate', color: '#FF9F0A' },
          { label: 'High', color: '#FF3B30' },
        ],
      },
      default: {
        segments: [
          { label: 'Good', color: '#30D158' },
          { label: 'Moderate', color: '#FF9F0A' },
          { label: 'Poor', color: '#FF3B30' },
        ],
      },
    };
    const cfg = (config as any)[metricId] || config.default;
    const gap = 2;
    const totalGaps = (cfg.segments.length - 1) * gap;
    const availableWidth = barWidth - totalGaps;
    const segWidth = availableWidth / cfg.segments.length;
    return (
      <View style={styles.hmRangeContainer}>
        <Svg width={barWidth} height={30}>
          {cfg.segments.map((seg: any, idx: number) => (
            <Rect key={idx} x={idx * (segWidth + gap)} y={2} width={segWidth} height={barHeight} fill={seg.color} rx={idx === 0 ? 8 : idx === cfg.segments.length - 1 ? 8 : 0} ry={idx === 0 ? 8 : idx === cfg.segments.length - 1 ? 8 : 0} />
          ))}
        </Svg>
      </View>
    );
  };

  const getCountryFromCity = (city: string): string => {
    // Simple mapping for demo purposes
    const cityCountryMap: { [key: string]: string } = {
      'Tokyo': 'Japan',
      'Paris': 'France',
      'New York': 'USA',
      'London': 'UK',
      'Sydney': 'Australia',
      'Bangkok': 'Thailand',
      'Singapore': 'Singapore',
      'Dubai': 'UAE',
      'Hong Kong': 'Hong Kong',
      'Barcelona': 'Spain',
      'Rome': 'Italy',
      'Amsterdam': 'Netherlands',
      'Vienna': 'Austria',
      'Prague': 'Czech Republic',
      'Budapest': 'Hungary',
      'Copenhagen': 'Denmark',
      'Stockholm': 'Sweden',
      'Oslo': 'Norway',
      'Helsinki': 'Finland',
      'Reykjavik': 'Iceland',
      'Current Location': 'Your Location'
    };
    
    // Try to find exact match first
    if (cityCountryMap[city]) {
      return cityCountryMap[city];
    }
    
    // Try to find partial match
    const partialMatch = Object.keys(cityCountryMap).find(key => 
      city.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(city.toLowerCase())
    );
    
    return partialMatch ? cityCountryMap[partialMatch] : 'Unknown';
  };
  const getCountryFlag = (country: string): string => {
    const countryFlags: { [key: string]: string } = {
      'Japan': '🇯🇵',
      'France': '🇫🇷',
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'Australia': '🇦🇺',
      'Thailand': '🇹🇭',
      'Singapore': '🇸🇬',
      'UAE': '🇦🇪',
      'Hong Kong': '🇭🇰',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Austria': '🇦🇹',
      'Czech Republic': '🇨🇿',
      'Hungary': '🇭🇺',
      'Denmark': '🇩🇰',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Finland': '🇫🇮',
      'Iceland': '🇮🇸',
      'Your Location': '📍',
      'Unknown': '🌍'
    };
    
    return countryFlags[country] || '🌍';
  };

  // Medications section data
  const generalMeds: Array<{ name: string; note: string }> = [
    { name: 'Antihistamines', note: 'Recommended for allergies' },
    { name: 'Antacids', note: 'Recommended for heartburn' },
    { name: 'First Aid', note: 'Recommended for minor cuts' },
    { name: 'ORS', note: 'Recommended for food poisoning' },
  ];

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
                  
                  {/* Air Quality - same screen as home page */}
                  <Animated.View style={{ opacity: getRowAnim('aq').opacity, transform: [{ translateY: getRowAnim('aq').translate }] }}>
                  <TouchableOpacity style={styles.metricRowCard} onPress={() => navigation.navigate('EnvironmentalMetric', { metricId: 'air_quality', label: 'Air Quality', value: 'Moderate', status: 'moderate', score: getMetricScore('Air Quality'), icon: 'cloud-outline' })}>
                     <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor('air_quality', 'moderate')}20` }]}> 
                       <Ionicons name="cloud-outline" size={20} color={getMetricFixedIconColor('air_quality', 'moderate')} />
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Air Quality</Text>
                      <Text style={[styles.metricValueText, { color: getStatusColor('moderate') }]}>Moderate</Text>
                    </View>
                    <View style={styles.metricRightCol}>
                       <Text style={[styles.metricScoreText, { color: getScoreColor('air_quality', 'moderate', getMetricScore('Air Quality')) }]}>{getMetricScore('Air Quality')}</Text>
                      <Text style={styles.metricScoreLabelText}>Score</Text>
                    </View>
                  </TouchableOpacity>
                  </Animated.View>
                  
                  {/* Water Safety - same screen as home page */}
                  <Animated.View style={{ opacity: getRowAnim('water').opacity, transform: [{ translateY: getRowAnim('water').translate }] }}>
                  <TouchableOpacity style={styles.metricRowCard} onPress={() => navigation.navigate('EnvironmentalMetric', { metricId: 'water_quality', label: 'Water Safety', value: 'Safe', status: 'good', score: getMetricScore('Water Safety'), icon: 'water-outline' })}>
                     <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor('water_safety', 'good')}20` }]}> 
                      <Ionicons name="water-outline" size={20} color={getMetricFixedIconColor('water_safety', 'good')} />
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Water Safety</Text>
                      <Text style={[styles.metricValueText, { color: getStatusColor('good') }]}>Safe</Text>
                    </View>
                    <View style={styles.metricRightCol}>
                       <Text style={[styles.metricScoreText, { color: getScoreColor('water_safety', 'good', getMetricScore('Water Safety')) }]}>{getMetricScore('Water Safety')}</Text>
                      <Text style={styles.metricScoreLabelText}>Score</Text>
                    </View>
                  </TouchableOpacity>
                  </Animated.View>
                  
                  {/* UV Index - same format as Air Quality */}
                  <Animated.View style={{ opacity: getRowAnim('uv').opacity, transform: [{ translateY: getRowAnim('uv').translate }] }}>
                  <TouchableOpacity style={styles.metricRowCard} onPress={() => navigation.navigate('EnvironmentalMetric', { metricId: 'uv_index', label: 'UV Index', value: 'Moderate', status: 'moderate', score: getMetricScore('UV Index'), icon: 'sunny' })}>
                     <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor('uv_index', 'moderate')}20` }]}> 
                      <Ionicons name="sunny" size={20} color={getMetricFixedIconColor('uv_index', 'moderate')} />
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>UV Index</Text>
                      <Text style={[styles.metricValueText, { color: getStatusColor('moderate') }]}>Moderate</Text>
                    </View>
                    <View style={styles.metricRightCol}>
                       <Text style={[styles.metricScoreText, { color: getScoreColor('uv_index', 'moderate', getMetricScore('UV Index')) }]}>{getMetricScore('UV Index')}</Text>
                      <Text style={styles.metricScoreLabelText}>Score</Text>
                    </View>
                  </TouchableOpacity>
                  </Animated.View>
                  
                  {/* Food Safety - same format as Air Quality */}
                  <Animated.View style={{ opacity: getRowAnim('food').opacity, transform: [{ translateY: getRowAnim('food').translate }] }}>
                  <TouchableOpacity style={styles.metricRowCard} onPress={() => navigation.navigate('EnvironmentalMetric', { metricId: 'food_safety', label: 'Food Safety', value: 'Good', status: 'good', score: getMetricScore('Food Safety'), icon: 'restaurant' })}>
                     <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor('food_safety', 'good')}20` }]}> 
                      <Ionicons name="restaurant" size={20} color={getMetricFixedIconColor('food_safety', 'good')} />
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Food Safety</Text>
                      <Text style={[styles.metricValueText, { color: getStatusColor('good') }]}>Good</Text>
                    </View>
                    <View style={styles.metricRightCol}>
                       <Text style={[styles.metricScoreText, { color: getScoreColor('food_safety', 'good', getMetricScore('Food Safety')) }]}>{getMetricScore('Food Safety')}</Text>
                      <Text style={styles.metricScoreLabelText}>Score</Text>
                    </View>
                  </TouchableOpacity>
                  </Animated.View>
                  
                  {/* Pollen Level - same screen as home page */}
                  <Animated.View style={{ opacity: getRowAnim('pollen').opacity, transform: [{ translateY: getRowAnim('pollen').translate }] }}>
                  <TouchableOpacity style={styles.metricRowCard} onPress={() => navigation.navigate('EnvironmentalMetric', { metricId: 'pollen', label: 'Pollen', value: 'High', status: 'moderate', score: getMetricScore('Pollen Level'), icon: 'flower-outline' })}>
                     <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor('pollen', 'moderate')}20` }]}> 
                       <Ionicons name="flower-outline" size={20} color={getMetricFixedIconColor('pollen', 'moderate')} />
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Pollen</Text>
                      <Text style={[styles.metricValueText, { color: getStatusColor('moderate') }]}>High</Text>
                    </View>
                    <View style={styles.metricRightCol}>
                       <Text style={[styles.metricScoreText, { color: getScoreColor('pollen', 'moderate', getMetricScore('Pollen Level')) }]}>{getMetricScore('Pollen Level')}</Text>
                      <Text style={styles.metricScoreLabelText}>Score</Text>
                    </View>
                  </TouchableOpacity>
                  </Animated.View>
                  
                  {/* Altitude - same format as Air Quality */}
                  <Animated.View style={{ opacity: getRowAnim('altitude').opacity, transform: [{ translateY: getRowAnim('altitude').translate }] }}>
                  <TouchableOpacity style={styles.metricRowCard} onPress={() => navigation.navigate('EnvironmentalMetric', { metricId: 'altitude', label: 'Altitude', value: 'Low', status: 'good', score: getMetricScore('Altitude'), icon: 'trending-up' })}>
                     <View style={[styles.metricIconCircle, { backgroundColor: `${getStatusColor('good')}20` }]}> 
                      <Ionicons name="mountain-outline" size={20} color={getStatusColor('good')} />
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Altitude</Text>
                      <Text style={[styles.metricValueText, { color: getStatusColor('good') }]}>Low</Text>
                    </View>
                    <View style={styles.metricRightCol}>
                       <Text style={[styles.metricScoreText, { color: getScoreColor('altitude', 'good', getMetricScore('Altitude')) }]}>{getMetricScore('Altitude')}</Text>
                      <Text style={styles.metricScoreLabelText}>Score</Text>
                    </View>
                  </TouchableOpacity>
                  </Animated.View>
                  
                  {/* Disease Outbreaks - same format as Air Quality */}
                  <Animated.View style={{ opacity: getRowAnim('outbreaks').opacity, transform: [{ translateY: getRowAnim('outbreaks').translate }] }}>
                  <TouchableOpacity style={styles.metricRowCard} onPress={() => navigation.navigate('EnvironmentalMetric', { metricId: 'outbreaks', label: 'Disease Outbreaks', value: 'None', status: 'good', score: getMetricScore('Disease Outbreaks'), icon: 'bug-outline' })}>
                     <View style={[styles.metricIconCircle, { backgroundColor: `${getStatusColor('good')}20` }]}> 
                      <Ionicons name="bug-outline" size={20} color={getStatusColor('good')} />
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricName}>Disease Outbreaks</Text>
                      <Text style={[styles.metricValueText, { color: getStatusColor('good') }]}>None</Text>
                    </View>
                    <View style={styles.metricRightCol}>
                       <Text style={[styles.metricScoreText, { color: getScoreColor('outbreaks', 'good', getMetricScore('Disease Outbreaks')) }]}>{getMetricScore('Disease Outbreaks')}</Text>
                      <Text style={styles.metricScoreLabelText}>Score</Text>
                    </View>
                  </TouchableOpacity>
                  </Animated.View>
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
                    {generalMeds.map((m, idx) => (
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
                          source={require('../../../../assets/airplane.png')}
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
                  console.log('Calling emergency number: 112');
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
                  {console.log('🔍 Rendering suggestions:', tripSuggestions)}
                  {tripSuggestions.slice(0, 5).map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        console.log('🔍 Selected suggestion:', city);
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
              console.log('Departure date button pressed');
              setShowDatePicker('departure');
              console.log('Set showDatePicker to departure, current value:', showDatePicker);
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
              console.log('Return date button pressed');
              setShowDatePicker('return');
              console.log('Set showDatePicker to return, current value:', showDatePicker);
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
                <Ionicons name={selectedMetric.id === 'pollen' ? 'flower-outline' : selectedMetric.id === 'uv_index' ? 'sunny' : selectedMetric.id === 'air_quality' ? 'cloud-outline' : selectedMetric.id === 'water_safety' ? 'water-outline' : selectedMetric.id === 'outbreaks' ? 'bug-outline' : selectedMetric.id === 'altitude' ? 'mountain-outline' : 'information-circle'} size={32} color={getStatusColor(selectedMetric.status)} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Increased for iPhone 16 Dynamic Island
    paddingBottom: 2,
    backgroundColor: '#000000',
  },
  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    lineHeight: 20,
    flexWrap: 'wrap',
  },

  tabContainer: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  tabScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderRadius: 8,
    flex: 1,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  contentTrips: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  // Detailed modal styles to match dashboard
  modalContainerDetailed: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    maxWidth: 420,
    flex: 1,
  },
  modalHeaderDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalIconCircleDetailed: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitleDetailed: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalStatusDetailed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalSectionDetailed: {
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sectionTitleDetailed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionContentDetailed: {
    fontSize: 15,
    color: '#EBEBF5',
    lineHeight: 22,
  },
  rangeIndicatorContainerDetailed: {
    alignItems: 'center',
    marginTop: 16,
  },
  currentScoreContainerDetailed: {
    marginTop: 16,
    alignItems: 'center',
  },
  currentScoreTextDetailed: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  impactItemDetailed: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  impactTextDetailed: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  recommendationItemDetailed: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationTextDetailed: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  riskItemDetailed: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskTextDetailed: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  locationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  metricsContainer: {
    marginTop: 20,
  },
  metricCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
    width: '48%', // Two columns
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  tripsContainer: {
    marginTop: 16,
  },
  tripRowWrapper: {
    marginBottom: 12,
  },
  tripRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tripRowTextWrap: {
    flex: 1,
  },
  tripRowTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tripRowSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  tripRowChevron: {
    marginLeft: 8,
  },
  tripRowChevronDown: {
    transform: [{ rotate: '90deg' }],
  },
  tripDetailBlock: {
    marginTop: 12,
    paddingLeft: 0,
  },
  tripAddonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 0,
  },
  tripAddonToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tripAddonsContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 0,
  },
  tripTabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  tripTab: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 13,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tripTabActive: {
    color: '#FFFFFF',
    backgroundColor: '#007AFF20',
  },
  tripChecklistBox: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0,
  },
  tripChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  tripChecklistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripChecklistText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
    marginBottom: 20,
  },
  tripCardLarge: {
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    borderWidth: 0,
    marginBottom: 24,
    padding: 4,
  },
  tripDestinationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  addTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  addTripButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  addTripButtonTop: {
    marginTop: 0,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxHeight: '80%',
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  modalScrollContent: {
    width: '100%',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  textInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 8,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#3A3A3C',
    maxHeight: 220,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1001,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  suggestionItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  suggestionsContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 220,
    overflow: 'hidden',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 8,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 8,
  },
  suggestionSubtext: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    textAlign: 'left',
    flex: 1,
  },
  airlineHeader: {
    marginTop: 16,
    marginBottom: 16,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  combinedFlightInput: {
    width: '100%',
  },
  combinedFlightTextInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  flightDetailsCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderBottomWidth: 0,
  },
  flightSegmentCard: {
    marginTop: 12,
    marginBottom: 0,
  },
  flightNumberText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    marginBottom: 12,
  },
  flightDetailsTable: {
    gap: 10,
  },
  flightDetailsRowsWrapper: {
    position: 'relative',
  },
  flightDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
  },
  flightDetailsCellCity: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flightDetailsCellDate: {
    width: 44,
    paddingLeft: 0,
    marginLeft: -18,
    justifyContent: 'flex-start',
  },
  flightDetailsCellTime: {
    width: 56,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: -6,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  flightDetailsCellArrow: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flightDetailsChevronWrap: {
    position: 'absolute',
    right: -6,
    top: '50%',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -12 }],
  },
  flightDetailsGridScroll: {
    flexGrow: 1,
    paddingRight: 8,
  },
  flightDetailsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    minWidth: '100%',
  },
  flightDetailsColumnCity: {
    width: 220,
    gap: 10,
    justifyContent: 'center',
  },
  flightDetailsColumnDate: {
    width: 44,
    paddingLeft: 12,
    gap: 10,
    justifyContent: 'center',
  },
  flightDetailsColumnTime: {
    width: 52,
    paddingLeft: 12,
    alignItems: 'flex-end',
    gap: 10,
    justifyContent: 'center',
  },
  flightDetailsColumn: {
    flex: 1,
    gap: 12,
  },
  flightArrowColumn: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  flightRouteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
  },
  flightCityText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
    flex: 1,
    minWidth: 0,
  },
  flightCity: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
    flex: 1,
    minWidth: 0,
    flexShrink: 0,
  },
  flightDate: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
    height: 24,
    lineHeight: 24,
    textAlign: 'left',
  },
  flightTime: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    height: 24,
    lineHeight: 24,
    textAlign: 'right',
  },
  flightActionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  addAnotherFlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
    backgroundColor: 'transparent',
    gap: 8,
  },
  addAnotherFlightText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
  continueButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  flightInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flightCarrierInput: {
    flex: 0.4,
  },
  flightNumberInput: {
    flex: 0.6,
  },
  flightInputHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    marginLeft: 4,
  },
  manualEntryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  manualEntryButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'none',
  },
  dateButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    borderWidth: 0,
    borderColor: '#3A3A3C',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalButtonsSingleCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  primaryCenteredButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  locationSearchContainer: {
    marginBottom: 20,
  },
  locationSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  locationSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  locationSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  searchModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  tapDismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  searchModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'stretch',
    height: 420,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    borderWidth: 0,
    borderColor: '#3A3A3C',
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 10,
  },
  locationInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInfoContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  overallRisk: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  healthcareSection: {
    marginBottom: 20,
  },
  facilityCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  facilityInfo: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  facilityDetails: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 16,
  },
  vaccinationSection: {
    marginBottom: 20,
  },
  vaccinationCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  vaccinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccinationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  vaccineList: {
    marginLeft: 16,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaccineText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  chipActive: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF40',
  },
  chipText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0A84FF',
  },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  vaccineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '50%',
  },
  vaccineRight: {
    width: '50%',
    alignItems: 'flex-start',
  },
  vaccineName: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  vaccineBadge: {
    color: '#8E8E93',
    fontSize: 12,
    marginLeft: 0,
  },
  rowActionBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  tripProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  travelHealthHeader: {
    marginBottom: 16,
  },
  travelHealthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  countryName: {
    fontSize: 18,
    color: '#8E8E93',
  },
  summaryCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricValueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricDescriptionText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  metricSeparator: {
    height: 1,
    backgroundColor: '#3A3A3C',
    opacity: 0.3,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  hospitalsSection: {
    marginBottom: 20,
  },
  sectionGroupCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
  },
  hospitalCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  hospitalDistance: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
  hospitalInfo: {
    fontSize: 14,
    color: '#8E8E93',
  },
  medicationSection: {
    marginBottom: 20,
  },
  medicationsSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  medCol: {
    width: '48%',
  },
  medColTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  medicationCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  medPackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    minWidth: 240,
  },
  medPackLeft: {
    gap: 2,
  },
  medPackTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  medPackSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },
  medPackRight: {},
  medPackBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medPackBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  medGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  medTile: {
    width: '48%',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0,
    borderColor: '#3A3A3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medTileText: {
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  medTileTag: {
    color: '#8E8E93',
    fontSize: 12,
    marginLeft: 8,
  },
  medActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  medActionBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medActionText: {
    color: '#fff',
    fontWeight: '600',
  },
  medicationList: {
    marginLeft: 16,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emergencySection: {
    marginBottom: 20,
  },
  emergencyCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  emergencyList: {
    marginLeft: 16,
  },
  emergencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emergencyNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addTripSection: {
    marginBottom: 20,
  },
  tripCardContent: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tripCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tripCardCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  tripFlagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripFlag: {
    fontSize: 20,
  },
  tripCardAccent: {
    width: 4,
    height: '100%',
    backgroundColor: '#FF9500',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  tripInfo: {
  flex: 1,
},
  tripName: {
    fontSize: 18,
  fontWeight: 'bold',
  color: '#FFFFFF',
    marginBottom: 2,
  },
  tripDatesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
  dateText: {
  fontSize: 14,
  color: '#8E8E93',
    marginLeft: 8,
},
  countdownContainer: {
  backgroundColor: '#007AFF',
  borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
},
  countdownText: {
    fontSize: 12,
  color: '#FFFFFF',
  fontWeight: '600',
  },
  jetLagPreview: {
  backgroundColor: '#2C2C2E',
  borderRadius: 8,
  padding: 12,
    marginBottom: 12,
},
jetLagHeader: {
  flexDirection: 'row',
  alignItems: 'center',
    marginBottom: 4,
},
jetLagTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginLeft: 8,
},
  jetLagInfo: {
    fontSize: 12,
  color: '#8E8E93',
    marginLeft: 24,
},
  tapToView: {
  flexDirection: 'row',
  alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  tapToViewText: {
  fontSize: 14,
    color: '#007AFF',
    marginRight: 8,
  },
  tripDetailsModal: {
  backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  borderWidth: 1,
    borderColor: '#3A3A3C',
},
  tripDetailsHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},
  tripDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  color: '#FFFFFF',
},
  checklistSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  checklistSection: {
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  checklistCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckbox: {
    backgroundColor: '#007AFF',
  },
  checklistText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  completedText: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    elevation: 10000,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  datePickerModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    zIndex: 10001,
    elevation: 10001,
  },
  datePickerHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
    width: '100%',
    marginBottom: 16,
},
  datePickerCancelText: {
  fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  color: '#FFFFFF',
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  datePicker: {
    width: '100%',
  backgroundColor: '#2C2C2E',
    borderRadius: 12,
  borderWidth: 1,
  borderColor: '#3A3A3C',
    color: '#FFFFFF',
},
  useCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  useCurrentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  useCurrentLocationTextDisabled: {
    color: '#8E8E93',
  },
  emptyStateContainer: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  directionsModal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  modalContentDirections: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    width: '85%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  modalContainerDirections: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    width: '85%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  modalHeaderDirections: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalIconCircleDirections: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#30D15820',
    marginRight: 12,
  },
  modalTitleDirections: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  hmRangeContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  directionsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  alwaysUseCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  alwaysUseText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  emergencyModal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  emergencyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emergencyModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 12,
  },
  emergencyCallButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emergencyCallButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emergencyCancelButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emergencyCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resultTitleRow: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tripDestinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  tripDestinationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tripDestinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    marginRight: 12,
    marginTop: 4,
  },
  tripDestinationRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  tripDirectionText: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 8,
  },
  tripMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  tripMetric: {
    alignItems: 'center',
    flex: 1,
  },
  tripMetricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
  },
  tripMetricValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  sleepScheduleSection: {
    marginBottom: 20,
  },
  sleepScheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sleepScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sleepScheduleDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sleepScheduleAdjustment: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  sleepScheduleMore: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  sleepSchedulePreview: {
    marginTop: 12,
  },
  sleepScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepScheduleDay: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sleepScheduleTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  tripActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  tripActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  tripStatusText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'center',
  },
  viewMoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  tripChecklist: {
    marginTop: 16,
    padding: 16,
  },
  checklistItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 4,
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  checklistItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  checklistItemCompleted: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  checklistItemStatus: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  jetLagTips: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#3A3A3C',
  },
  jetLagTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  jetLagTipsText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  journeyTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  journeyTab: {
    flex: 1,
    padding: 8,
    borderWidth: 0,
    borderColor: '#3A3A3C',
    borderRadius: 4,
  },
  journeyTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  journeyTabTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  journeyTabContent: {
    alignItems: 'center',
  },
  journeyDate: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  journeyAdjustment: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  metricRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  metricScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricScoreLabelText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  // Bottom Sheet Styles
  bottomSheetContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    pointerEvents: 'box-none',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    minHeight: '70%',
    maxHeight: '100%',
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSheetHandleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  bottomSheetCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  bottomSheetBody: {
    flex: 1,
  },
  bottomSheetBodyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  
});

export default TravelScreen;

