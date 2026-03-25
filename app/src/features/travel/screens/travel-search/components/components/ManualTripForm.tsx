import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../TravelScreen.styles';

interface ManualTripFormProps {
  newTripDepartureLocation: string;
  newTripDestination: string;
  newTripDepartureDate: Date;
  newTripReturnDate: Date | undefined;
  tripSuggestions: string[];
  departureSuggestions: string[];
  isGettingLocation: boolean;
  onDepartureLocationChange: (v: string) => void;
  onDestinationChange: (v: string) => void;
  onSetDepartureLocation: (v: string) => void;
  onSetDestination: (v: string) => void;
  onShowDatePicker: (v: 'departure' | 'return') => void;
  onGetCurrentLocation: () => Promise<void>;
}

const ManualTripForm: React.FC<ManualTripFormProps> = ({
  newTripDepartureLocation,
  newTripDestination,
  newTripDepartureDate,
  newTripReturnDate,
  tripSuggestions,
  departureSuggestions,
  isGettingLocation,
  onDepartureLocationChange,
  onDestinationChange,
  onSetDepartureLocation,
  onSetDestination,
  onShowDatePicker,
  onGetCurrentLocation,
}) => (
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
          {newTripDepartureLocation.trim() === '' && (
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
              <Text style={styles.suggestionText}>
                {isGettingLocation ? 'Getting location…' : 'Use current location'}
              </Text>
              {isGettingLocation && (
                <ActivityIndicator size="small" color="#8E8E93" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          )}
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
);

export default ManualTripForm;
