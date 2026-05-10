import { Alert } from 'react-native';
import { Animated } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { api } from '../../../../../shared/services/data/apiClient';
import { FlightLookupService } from '../../../../../shared/services/travel/enhancedJetLagService';

function syncTripToBackend(trip: Trip) {
  fetchAuthSession().then(session => {
    const userId = session.tokens?.idToken?.payload?.sub as string | undefined;
    if (!userId) return;
    api.post(`/users/${userId}/trips`, {
      departureLocation: trip.departureLocation,
      destination: trip.destination,
      departureDate: trip.departureDate instanceof Date ? trip.departureDate.toISOString() : trip.departureDate,
      returnDate: trip.returnDate ? (trip.returnDate instanceof Date ? trip.returnDate.toISOString() : trip.returnDate) : undefined,
      timezone: trip.timezone,
      notes: trip.notes,
      tripData: trip.jetLagPlanner ? { jetLagPlanner: trip.jetLagPlanner, checklist: trip.checklist } : undefined,
    }).catch(() => {});
  }).catch(() => {});
}

export interface Trip {
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

export const buildJetLagPlanner = (returnDate?: Date) => ({
  departureTime: '09:00',
  arrivalTime: '15:00',
  outboundPlan: {
    direction: 'outbound' as const,
    timezoneAdjustment: '+9',
    circadianPlan: [
      { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours earlier each day' },
      { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours earlier' },
      { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours earlier' },
      { day: 0, action: 'Travel day', time: 'Stay awake until local bedtime' },
      { day: 1, action: 'First day at destination', time: 'Follow local schedule' },
      { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
      { day: 3, action: 'Normal schedule', time: 'Regular sleep time' },
    ],
  },
  returnPlan: returnDate ? {
    direction: 'return' as const,
    timezoneAdjustment: '-9',
    circadianPlan: [
      { day: -3, action: 'Start adjusting sleep schedule', time: 'Go to bed 1.5 hours later each day' },
      { day: -2, action: 'Continue adjustment', time: 'Go to bed 3 hours later' },
      { day: -1, action: 'Final adjustment', time: 'Go to bed 4.5 hours later' },
      { day: 0, action: 'Return travel day', time: 'Stay awake until local bedtime' },
      { day: 1, action: 'First day back home', time: 'Follow local schedule' },
      { day: 2, action: 'Continue adjustment', time: 'Gradual adaptation' },
      { day: 3, action: 'Normal schedule', time: 'Regular sleep time' },
    ],
  } : undefined,
});

export interface TripHandlersParams {
  flightCarrier: string; flightNumber: string; flightLookupResult: any;
  flightSegments: any[]; newTripDepartureDate: Date; newTripReturnDate: Date | undefined;
  newTripDepartureLocation: string; newTripDestination: string;
  editingTrip: Trip | null; editTripDepartureLocation: string;
  editTripDestination: string; editTripDepartureDate: Date;
  editTripReturnDate: Date | undefined; editTripNotes: string;
  tripModalTranslateY: Animated.Value;
  setTrips: (fn: (prev: Trip[]) => Trip[]) => void;
  setNewTripDepartureLocation: (v: string) => void; setNewTripDestination: (v: string) => void;
  setNewTripDepartureDate: (v: Date) => void; setNewTripReturnDate: (v: Date | undefined) => void;
  setShowAddTripModal: (v: boolean) => void; setTripSuggestions: (v: string[]) => void;
  setDepartureSuggestions: (v: string[]) => void; setFlightCarrier: (v: string) => void;
  setFlightNumber: (v: string) => void; setDetectedAirline: (v: string | null) => void;
  setFlightSegments: (fn: (prev: any[]) => any[]) => void; setFlightDetailsExpanded: (v: boolean) => void;
  setFlightLookupResult: (v: any) => void; setIsLookingUpFlight: (v: boolean) => void;
  setShowManualEntry: (v: boolean) => void; setEditingTrip: (v: Trip | null) => void;
  setEditTripDepartureLocation: (v: string) => void; setEditTripDestination: (v: string) => void;
  setEditTripDepartureDate: (v: Date) => void; setEditTripReturnDate: (v: Date | undefined) => void;
  setEditTripNotes: (v: string) => void; setShowEditTripModal: (v: boolean) => void;
  setEditTripSuggestions: (v: string[]) => void; setEditTripDepartureSuggestions: (v: string[]) => void;
}

export function createTripHandlers(params: TripHandlersParams) {
  const {
    flightCarrier, flightNumber, flightLookupResult, flightSegments,
    newTripDepartureDate, newTripReturnDate, newTripDepartureLocation, newTripDestination,
    editingTrip, editTripDepartureLocation, editTripDestination, editTripDepartureDate,
    editTripReturnDate, editTripNotes, tripModalTranslateY,
    setTrips, setNewTripDepartureLocation, setNewTripDestination,
    setNewTripDepartureDate, setNewTripReturnDate, setShowAddTripModal,
    setTripSuggestions, setDepartureSuggestions, setFlightCarrier, setFlightNumber,
    setDetectedAirline, setFlightSegments, setFlightDetailsExpanded, setFlightLookupResult,
    setIsLookingUpFlight, setShowManualEntry, setEditingTrip, setEditTripDepartureLocation,
    setEditTripDestination, setEditTripDepartureDate, setEditTripReturnDate, setEditTripNotes,
    setShowEditTripModal, setEditTripSuggestions, setEditTripDepartureSuggestions,
  } = params;

  const defaultChecklist = () => ({
    vaccines: [{ name: 'COVID-19', completed: false }, { name: 'Hepatitis A', completed: false }, { name: 'Typhoid', completed: false }],
    medicines: [{ name: 'Pain relievers', completed: false }, { name: 'Anti-diarrheal', completed: false }, { name: 'Motion sickness', completed: false }],
  });

  const handleFlightLookup = async () => {
    if (!flightCarrier.trim() || !flightNumber.trim()) {
      Alert.alert('Error', 'Please enter both carrier and flight number'); return;
    }
    try {
      setIsLookingUpFlight(true);
      const result = await FlightLookupService.lookupFlight(
        flightCarrier.toUpperCase().trim(), flightNumber.trim(), new Date().toISOString().split('T')[0],
      );
      if (result) {
        setFlightLookupResult(result); setNewTripDepartureLocation(result.origin_iata);
        setNewTripDestination(result.dest_iata); setNewTripDepartureDate(new Date(result.dep_local));
        setShowManualEntry(true);
        Alert.alert('Flight Found', 'Flight details loaded. Please review and confirm.');
      } else {
        Alert.alert('Flight Not Found', "We couldn't find that flight. Please enter the details manually.", [{ text: 'OK', onPress: () => setShowManualEntry(true) }]);
      }
    } catch {
      Alert.alert('Error', 'Failed to lookup flight. Please enter details manually.', [{ text: 'OK', onPress: () => setShowManualEntry(true) }]);
    } finally { setIsLookingUpFlight(false); }
  };

  const handleAddTrip = () => {
    if (!newTripDepartureLocation.trim()) { Alert.alert('Error', 'Please enter a departure location'); return; }
    if (!newTripDestination.trim()) { Alert.alert('Error', 'Please enter a destination'); return; }
    const newTrip: Trip = {
      id: Date.now().toString(), departureLocation: newTripDepartureLocation.trim(),
      destination: newTripDestination.trim(), departureDate: newTripDepartureDate,
      returnDate: newTripReturnDate, timezone: 'UTC', checklist: defaultChecklist(),
      jetLagPlanner: buildJetLagPlanner(newTripReturnDate),
    };
    setTrips(prev => [...prev, newTrip]);
    syncTripToBackend(newTrip);
    setNewTripDepartureLocation(''); setNewTripDestination('');
    setNewTripDepartureDate(new Date()); setNewTripReturnDate(undefined);
    setShowAddTripModal(false); setTripSuggestions([]); setDepartureSuggestions([]);
    Alert.alert('Success', 'Trip added successfully!');
  };

  const handleConfirmFlightTrip = () => {
    const allFlights = flightLookupResult ? [...flightSegments, flightLookupResult] : flightSegments;
    const first = allFlights[0]; const last = allFlights[allFlights.length - 1];
    const newTrip: Trip = {
      id: Date.now().toString(), departureLocation: first.origin_city,
      destination: last.dest_city, departureDate: new Date(first.dep_local),
      returnDate: undefined, timezone: last.dest_tz, checklist: defaultChecklist(),
      jetLagPlanner: {
        departureTime: new Date(first.dep_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        arrivalTime: new Date(last.arr_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        outboundPlan: { direction: 'outbound', timezoneAdjustment: '+0', circadianPlan: [] },
      },
    };
    setTrips(prev => [...prev, newTrip]);
    syncTripToBackend(newTrip);
    setShowAddTripModal(false); setFlightCarrier(''); setFlightNumber(''); setDetectedAirline(null);
    setFlightLookupResult(null); setFlightSegments(() => []); setFlightDetailsExpanded(false);
    setNewTripDepartureLocation(''); setNewTripDestination('');
    setNewTripDepartureDate(new Date()); setNewTripReturnDate(undefined);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setTrips(prev => prev.filter(t => t.id !== tripId)); Alert.alert('Success', 'Trip deleted successfully!'); } },
    ]);
  };

  const handleModifyTripDates = (trip: Trip) => {
    setEditingTrip(trip); setEditTripDepartureLocation(trip.departureLocation || 'Home');
    setEditTripDestination(trip.destination); setEditTripDepartureDate(trip.departureDate);
    setEditTripReturnDate(trip.returnDate); setEditTripNotes(trip.notes || '');
    setShowEditTripModal(true);
  };

  const handleSaveEditTrip = () => {
    if (!editingTrip || !editTripDepartureLocation.trim() || !editTripDestination.trim()) {
      Alert.alert('Error', 'Please enter both departure location and destination'); return;
    }
    const updatedTrip: Trip = {
      ...editingTrip, departureLocation: editTripDepartureLocation.trim(),
      destination: editTripDestination.trim(), departureDate: editTripDepartureDate,
      returnDate: editTripReturnDate, notes: editTripNotes.trim(),
      jetLagPlanner: buildJetLagPlanner(editTripReturnDate),
    };
    setTrips(prev => prev.map(t => (t.id === editingTrip.id ? updatedTrip : t)));
    setEditingTrip(null); setEditTripDepartureLocation(''); setEditTripDestination('');
    setEditTripDepartureDate(new Date()); setEditTripReturnDate(undefined);
    setEditTripNotes(''); setShowEditTripModal(false);
    setEditTripSuggestions([]); setEditTripDepartureSuggestions([]);
    Alert.alert('Success', 'Trip updated successfully!');
  };

  const handleCloseAddTrip = () => {
    setShowAddTripModal(false); setFlightCarrier(''); setFlightNumber(''); setShowManualEntry(false);
    setFlightLookupResult(null); setFlightSegments(() => []);
    setNewTripDepartureLocation(''); setNewTripDestination('');
    setNewTripDepartureDate(new Date()); setNewTripReturnDate(undefined);
    tripModalTranslateY.setValue(0);
  };

  return {
    handleFlightLookup, handleAddTrip, handleConfirmFlightTrip,
    handleDeleteTrip, handleModifyTripDates, handleSaveEditTrip, handleCloseAddTrip,
  };
}
