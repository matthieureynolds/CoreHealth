import React from 'react';
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
import FlightLookupStep from './components/FlightLookupStep';
import ManualTripForm from './components/ManualTripForm';

interface AddTripModalProps {
  visible: boolean;
  tripModalTranslateY: Animated.Value;

  // Flight lookup state
  flightCarrier: string;
  flightNumber: string;
  detectedAirline: string | null;
  isLookingUpFlight: boolean;
  flightLookupResult: any;
  flightSegments: any[];
  flightDetailsExpanded: boolean;
  showManualEntry: boolean;

  // New trip state
  newTripDepartureLocation: string;
  newTripDestination: string;
  newTripDepartureDate: Date;
  newTripReturnDate: Date | undefined;
  showDatePicker: 'departure' | 'return' | null;
  tempDatePickerValue: Date | undefined;
  tripSuggestions: string[];
  departureSuggestions: string[];
  isGettingLocation: boolean;

  // Handlers
  onClose: () => void;
  onFlightCarrierChange: (v: string) => void;
  onFlightNumberChange: (v: string) => void;
  onFlightLookup: () => void;
  onFlightDetailsExpand: (v: boolean) => void;
  onAddAnotherFlight: () => void;
  onConfirmFlightTrip: () => void;
  onShowManualEntry: () => void;
  onAddTrip: () => void;
  onDepartureLocationChange: (v: string) => void;
  onDestinationChange: (v: string) => void;
  onSetDepartureLocation: (v: string) => void;
  onSetDestination: (v: string) => void;
  onShowDatePicker: (v: 'departure' | 'return') => void;
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
  flightLookupResult,
  flightSegments,
  flightDetailsExpanded,
  showManualEntry,
  newTripDepartureLocation,
  newTripDestination,
  newTripDepartureDate,
  newTripReturnDate,
  showDatePicker,
  tempDatePickerValue,
  tripSuggestions,
  departureSuggestions,
  isGettingLocation,
  onClose,
  onFlightCarrierChange,
  onFlightNumberChange,
  onFlightLookup,
  onFlightDetailsExpand,
  onAddAnotherFlight,
  onConfirmFlightTrip,
  onShowManualEntry,
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
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
    >
      <View style={styles.bottomSheetOverlay}>
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
            {/* Handle bar */}
            <View style={styles.bottomSheetHandleContainer}>
              <View style={styles.bottomSheetHandle} />
            </View>

            {/* Header */}
            <View style={styles.bottomSheetHeader} pointerEvents="box-none">
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); onClose(); }}
                style={styles.bottomSheetCloseButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.bottomSheetTitle}>Add New Trip</Text>
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); handleSubmitPress(); }}
                style={styles.bottomSheetCloseButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.6}
                disabled={!canSubmit}
              >
                <Ionicons
                  name={showManualEntry ? 'checkmark' : 'search'}
                  size={24}
                  color={canSubmit ? '#34C759' : '#8E8E93'}
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
                <FlightLookupStep
                  flightCarrier={flightCarrier}
                  flightNumber={flightNumber}
                  detectedAirline={detectedAirline}
                  isLookingUpFlight={isLookingUpFlight}
                  flightLookupResult={flightLookupResult}
                  flightSegments={flightSegments}
                  flightDetailsExpanded={flightDetailsExpanded}
                  onFlightCarrierChange={onFlightCarrierChange}
                  onFlightNumberChange={onFlightNumberChange}
                  onFlightDetailsExpand={onFlightDetailsExpand}
                  onAddAnotherFlight={onAddAnotherFlight}
                  onConfirmFlightTrip={onConfirmFlightTrip}
                  onShowManualEntry={onShowManualEntry}
                />
              ) : (
                <ManualTripForm
                  newTripDepartureLocation={newTripDepartureLocation}
                  newTripDestination={newTripDestination}
                  newTripDepartureDate={newTripDepartureDate}
                  newTripReturnDate={newTripReturnDate}
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
                    <TouchableOpacity onPress={onDateCancel}>
                      <Ionicons name="close" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>
                      {showDatePicker === 'departure' ? 'Departure Date' : 'Return Date'}
                    </Text>
                    <TouchableOpacity onPress={onDateConfirm}>
                      <Ionicons name="checkmark" size={22} color="#34C759" />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempDatePickerValue ?? (showDatePicker === 'departure' ? newTripDepartureDate : (newTripReturnDate || new Date()))}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    themeVariant="dark"
                    textColor="#FFFFFF"
                    onChange={onDateChange}
                    minimumDate={showDatePicker === 'return' ? newTripDepartureDate : new Date()}
                    style={styles.datePicker}
                    key={showDatePicker}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default AddTripModal;
