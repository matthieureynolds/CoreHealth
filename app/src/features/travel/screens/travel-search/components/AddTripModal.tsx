import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../TravelScreen.styles';
import FlightLookupStep from './FlightLookupStep';
import ManualTripForm from './ManualTripForm';
import { FlightOption } from '../../../../../shared/types';

/**
 * Isolates the DateTimePicker from parent re-renders.
 * The iOS inline picker is fully controlled — any re-render with a `value` prop
 * snaps the calendar back to that date's month. This wrapper never re-renders
 * after mount so the native picker keeps full control of its visual state.
 */
const StableDatePicker = React.memo(({
  initialValue,
  minimumDate,
  pickerMode = 'date',
  onDateSelected,
}: {
  initialValue: Date;
  minimumDate?: Date;
  pickerMode?: 'date' | 'time';
  onDateSelected: (date: Date) => void;
}) => {
  // Freeze initial props — never update from parent
  const frozenValue = useRef(initialValue).current;
  const frozenMinDate = useRef(minimumDate).current;
  const callbackRef = useRef(onDateSelected);
  callbackRef.current = onDateSelected;

  const handleChange = useCallback((_event: any, selectedDate?: Date) => {
    if (selectedDate) callbackRef.current(selectedDate);
  }, []);

  return (
    <DateTimePicker
      value={frozenValue}
      mode={pickerMode}
      display={Platform.OS === 'ios' ? (pickerMode === 'time' ? 'spinner' : 'inline') : 'default'}
      themeVariant="dark"
      textColor="#FFFFFF"
      onChange={handleChange}
      {...(frozenMinDate ? { minimumDate: frozenMinDate } : {})}
      style={styles.datePicker}
    />
  );
}, () => true); // Never re-render — props are captured in refs

interface AddTripModalProps {
  visible: boolean;
  tripModalTranslateY: Animated.Value;

  // Flight lookup state
  flightCarrier: string;
  flightNumber: string;
  detectedAirline: string | null;
  isLookingUpFlight: boolean;
  flightNotFound: boolean;
  flightLookupResult: FlightOption | null;
  flightSuggestions: FlightOption[];
  flightSegments: FlightOption[];
  flightDetailsExpanded: boolean;
  showManualEntry: boolean;

  // New trip state
  newTripDepartureLocation: string;
  newTripDestination: string;
  newTripDepartureDate: Date | undefined;
  newTripReturnDate: Date | undefined;
  newTripDepartureTime: Date | undefined;
  newTripReturnTime: Date | undefined;
  showDatePicker: 'departure' | 'return' | 'departureTime' | 'returnTime' | null;
  tempDatePickerValue: Date | undefined;
  tripSuggestions: string[];
  departureSuggestions: string[];
  isGettingLocation: boolean;

  // Handlers
  onClose: () => void;
  onFlightCarrierChange: (v: string) => void;
  onFlightNumberChange: (v: string) => void;
  onSelectFlightSuggestion: (flight: FlightOption) => void;
  onFlightLookup: () => void;
  onFlightDetailsExpand: (v: boolean) => void;
  onAddAnotherFlight: () => void;
  onConfirmFlightTrip: () => void;
  onShowManualEntry: () => void;
  onEditSegment?: (index: number) => void;
  onHideManualEntry: () => void;
  onAddTrip: () => void;
  onDepartureLocationChange: (v: string) => void;
  onDestinationChange: (v: string) => void;
  onSetDepartureLocation: (v: string) => void;
  onSetDestination: (v: string) => void;
  onShowDatePicker: (v: 'departure' | 'return' | 'departureTime' | 'returnTime') => void;
  onDateChange: (event: any, date?: Date) => void;
  onDateConfirm: () => void;
  onDateCancel: () => void;
  onGetCurrentLocation: () => Promise<void>;
}

const AddTripModal: React.FC<AddTripModalProps> = ({
  visible,
  tripModalTranslateY,
  flightCarrier,
  flightNumber,
  detectedAirline,
  isLookingUpFlight,
  flightNotFound,
  flightLookupResult,
  flightSuggestions,
  flightSegments,
  flightDetailsExpanded,
  showManualEntry,
  newTripDepartureLocation,
  newTripDestination,
  newTripDepartureDate,
  newTripReturnDate,
  newTripDepartureTime,
  newTripReturnTime,
  showDatePicker,
  tempDatePickerValue,
  tripSuggestions,
  departureSuggestions,
  isGettingLocation,
  onClose,
  onFlightCarrierChange,
  onFlightNumberChange,
  onSelectFlightSuggestion,
  onFlightLookup,
  onFlightDetailsExpand,
  onAddAnotherFlight,
  onConfirmFlightTrip,
  onShowManualEntry,
  onEditSegment,
  onHideManualEntry,
  onAddTrip,
  onDepartureLocationChange,
  onDestinationChange,
  onSetDepartureLocation,
  onSetDestination,
  onShowDatePicker,
  onDateChange,
  onDateConfirm,
  onDateCancel,
  onGetCurrentLocation,
}) => {
  const insets = useSafeAreaInsets();
  const canSubmit = showManualEntry
    ? newTripDepartureLocation.trim().length > 0 && newTripDestination.trim().length > 0
    : flightCarrier.trim().length > 0 && flightNumber.trim().length > 0 && !isLookingUpFlight;

  const handleSubmitPress = () => {
    if (showManualEntry) {
      if (newTripDepartureLocation.trim() && newTripDestination.trim()) {
        onAddTrip();
      }
    } else {
      onFlightLookup();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.bottomSheetOverlay, {
        opacity: tripModalTranslateY.interpolate({
          inputRange: [0, 1000],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        }),
        backgroundColor: 'rgba(0,0,0,0.7)',
      }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheetContainer}>
          <Animated.View
            style={[
              styles.bottomSheetContent,
              { transform: [{ translateY: tripModalTranslateY }] },
            ]}
          >
            {/* Header */}
            <View style={[styles.bottomSheetHeader, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); showManualEntry ? onHideManualEntry() : onClose(); }}
                style={styles.bottomSheetCloseButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name={showManualEntry ? "chevron-back" : "close"} size={showManualEntry ? 24 : 20} color={showManualEntry ? "#FFFFFF" : "#FF3B30"} />
              </TouchableOpacity>
              <Text style={styles.bottomSheetTitle}>Add New Trip</Text>
              {showManualEntry ? (
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation(); handleSubmitPress(); }}
                  style={styles.bottomSheetCloseButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  activeOpacity={0.6}
                  disabled={!canSubmit}
                >
                  <Ionicons name="checkmark" size={24} color={canSubmit ? '#34C759' : '#8E8E93'} />
                </TouchableOpacity>
              ) : (
                // Flight selection is automatic via suggestions — no manual lookup button needed.
                // Empty spacer keeps the title centered.
                <View style={styles.bottomSheetCloseButton} />
              )}
            </View>

            <ScrollView
              style={styles.bottomSheetBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.bottomSheetBodyContent, { paddingBottom: 24 + insets.bottom }]}
              keyboardShouldPersistTaps="handled"
            >
              {!showManualEntry ? (
                <FlightLookupStep
                  flightCarrier={flightCarrier}
                  flightNumber={flightNumber}
                  detectedAirline={detectedAirline}
                  isLookingUpFlight={isLookingUpFlight}
                  flightNotFound={flightNotFound}
                  flightLookupResult={flightLookupResult}
                  flightSuggestions={flightSuggestions}
                  flightSegments={flightSegments}
                  flightDetailsExpanded={flightDetailsExpanded}
                  onFlightCarrierChange={onFlightCarrierChange}
                  onFlightNumberChange={onFlightNumberChange}
                  onSelectFlightSuggestion={onSelectFlightSuggestion}
                  onFlightDetailsExpand={onFlightDetailsExpand}
                  onAddAnotherFlight={onAddAnotherFlight}
                  onConfirmFlightTrip={onConfirmFlightTrip}
                  onShowManualEntry={onShowManualEntry}
                  onEditSegment={onEditSegment}
                />
              ) : (
                <ManualTripForm
                  newTripDepartureLocation={newTripDepartureLocation}
                  newTripDestination={newTripDestination}
                  newTripDepartureDate={newTripDepartureDate}
                  newTripReturnDate={newTripReturnDate}
                  newTripDepartureTime={newTripDepartureTime}
                  newTripReturnTime={newTripReturnTime}
                  tripSuggestions={tripSuggestions}
                  departureSuggestions={departureSuggestions}
                  isGettingLocation={isGettingLocation}
                  onDepartureLocationChange={onDepartureLocationChange}
                  onDestinationChange={onDestinationChange}
                  onSetDepartureLocation={onSetDepartureLocation}
                  onSetDestination={onSetDestination}
                  onShowDatePicker={onShowDatePicker}
                  onGetCurrentLocation={onGetCurrentLocation}
                />
              )}
            </ScrollView>
          </Animated.View>
        </View>

        {/* Date Picker Overlay */}
        {showDatePicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableWithoutFeedback onPress={onDateCancel}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
            <View style={styles.datePickerModalContent} pointerEvents="box-none">
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={onDateCancel} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="close-circle" size={28} color="#FF3B30" />
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>
                      {showDatePicker === 'departure' ? 'Departure Date' : showDatePicker === 'return' ? 'Return Date' : showDatePicker === 'departureTime' ? 'Departure Time' : 'Return Time'}
                    </Text>
                    <TouchableOpacity onPress={onDateConfirm} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="checkmark-circle" size={28} color="#34C759" />
                    </TouchableOpacity>
                  </View>
                  <StableDatePicker
                    initialValue={tempDatePickerValue ?? (() => {
                      if (showDatePicker === 'departure') return newTripDepartureDate || new Date();
                      if (showDatePicker === 'return') return newTripReturnDate || new Date();
                      if (showDatePicker === 'departureTime') return newTripDepartureTime || new Date();
                      return newTripReturnTime || new Date();
                    })()}
                    minimumDate={showDatePicker === 'return' ? (newTripDepartureDate || new Date()) : showDatePicker === 'departure' ? new Date() : undefined}
                    pickerMode={showDatePicker === 'departureTime' || showDatePicker === 'returnTime' ? 'time' : 'date'}
                    onDateSelected={(date) => onDateChange(null, date)}
                    key={showDatePicker}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

export default AddTripModal;
