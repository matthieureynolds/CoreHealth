import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../TravelScreen.styles';

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

  const hasFlights = Boolean(flightLookupResult) || flightSegments.length > 0;

  const flightDetailsCard = flightLookupResult ? (
    <TouchableOpacity
      style={styles.flightDetailsCard}
      activeOpacity={0.7}
      onPress={() => onFlightDetailsExpand(!flightDetailsExpanded)}
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
                onPress={(e) => {
                  e.stopPropagation();
                  if (showManualEntry) {
                    if (newTripDepartureLocation.trim() && newTripDestination.trim()) {
                      onAddTrip();
                    }
                  } else {
                    onFlightLookup();
                  }
                }}
                style={styles.bottomSheetCloseButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.6}
                disabled={
                  showManualEntry
                    ? (!newTripDepartureLocation.trim() || !newTripDestination.trim())
                    : (!flightCarrier.trim() || !flightNumber.trim() || isLookingUpFlight)
                }
              >
                <Ionicons
                  name={showManualEntry ? 'checkmark' : 'search'}
                  size={24}
                  color={
                    showManualEntry
                      ? (!newTripDepartureLocation.trim() || !newTripDestination.trim()) ? '#8E8E93' : '#34C759'
                      : (!flightCarrier.trim() || !flightNumber.trim() || isLookingUpFlight) ? '#8E8E93' : '#34C759'
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
                              onChangeText={onFlightCarrierChange}
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
                              onChangeText={onFlightNumberChange}
                              placeholder="128"
                              placeholderTextColor="#8E8E93"
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      </View>
                      {flightDetailsCard}
                    </>
                  )}
                  {flightDetailsExpanded && flightDetailsCard}

                  {((flightDetailsExpanded && flightLookupResult) || (flightSegments.length > 0 && !flightLookupResult)) ? (
                    <View style={styles.flightActionsContainer}>
                      <TouchableOpacity style={styles.addAnotherFlightButton} onPress={onAddAnotherFlight}>
                        <Ionicons name="add" size={18} color="#059669" />
                        <Text style={styles.addAnotherFlightText}>Add another flight</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.continueButton} onPress={onConfirmFlightTrip}>
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
                    onPress={onShowManualEntry}
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
                      onChangeText={onDepartureLocationChange}
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
                                await onGetCurrentLocation();
                              } catch {
                                Alert.alert('Location Permission Required', 'Please enable location access in Settings.', [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Settings', onPress: () => {} },
                                ]);
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
                            onPress={() => { onSetDepartureLocation(city); Keyboard.dismiss(); }}
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
                      onChangeText={onDestinationChange}
                      placeholder="Enter destination (e.g., Tokyo, Japan)"
                      placeholderTextColor="#8E8E93"
                    />
                    {tripSuggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        {tripSuggestions.slice(0, 5).map((city, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => { onSetDestination(city); Keyboard.dismiss(); }}
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
                    onPress={() => onShowDatePicker('departure')}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.dateButtonText}>{newTripDepartureDate.toLocaleDateString()}</Text>
                    <Ionicons name="calendar" size={16} color="#8E8E93" />
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>Return Date: (Optional)</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => onShowDatePicker('return')}
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
