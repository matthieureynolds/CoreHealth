import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../TravelScreen.styles";
import { palette } from "@shared/theme/colors";

interface ManualTripFormProps {
  newTripDepartureLocation: string;
  newTripDestination: string;
  newTripDepartureDate: Date | undefined;
  newTripReturnDate: Date | undefined;
  newTripDepartureTime: Date | undefined;
  newTripReturnTime: Date | undefined;
  tripSuggestions: string[];
  departureSuggestions: string[];
  isGettingLocation: boolean;
  onDepartureLocationChange: (v: string) => void;
  onDestinationChange: (v: string) => void;
  onSetDepartureLocation: (v: string) => void;
  onSetDestination: (v: string) => void;
  onShowDatePicker: (
    v: "departure" | "return" | "departureTime" | "returnTime",
  ) => void;
  onGetCurrentLocation: () => Promise<void>;
}

const ManualTripForm: React.FC<ManualTripFormProps> = ({
  newTripDepartureLocation,
  newTripDestination,
  newTripDepartureDate,
  newTripReturnDate,
  newTripDepartureTime,
  newTripReturnTime,
  tripSuggestions,
  departureSuggestions,
  isGettingLocation,
  onDepartureLocationChange,
  onDestinationChange,
  onSetDepartureLocation,
  onSetDestination,
  onShowDatePicker,
  onGetCurrentLocation,
}) => {
  const [departureFocused, setDepartureFocused] = useState(false);
  const [destinationFocused, setDestinationFocused] = useState(false);

  const showDepartureSuggestions =
    departureFocused &&
    (departureSuggestions.length > 0 || newTripDepartureLocation.trim() === "");
  const showDestinationSuggestions =
    destinationFocused && tripSuggestions.length > 0;

  return (
    <>
      <Text style={styles.inputLabel}>Departure Location:</Text>
      <View style={[styles.inputContainer, { zIndex: 2 }]}>
        <TextInput
          style={[
            styles.textInput,
            showDepartureSuggestions && {
              marginBottom: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
          value={newTripDepartureLocation}
          onChangeText={onDepartureLocationChange}
          onFocus={() => setDepartureFocused(true)}
          onBlur={() => setTimeout(() => setDepartureFocused(false), 200)}
          placeholder="Enter departure location"
          placeholderTextColor={palette.textSecondary}
        />
        {showDepartureSuggestions && (
          <View style={styles.suggestionsContainer}>
            {newTripDepartureLocation.trim() === "" && (
              <TouchableOpacity
                style={[styles.suggestionItem, styles.suggestionItemDivider]}
                onPress={async () => {
                  try {
                    await onGetCurrentLocation();
                    setDepartureFocused(false);
                  } catch {
                    Alert.alert(
                      "Location Permission Required",
                      "Please enable location access in Settings.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Settings", onPress: () => {} },
                      ],
                    );
                  }
                }}
                disabled={isGettingLocation}
              >
                <Ionicons
                  name="navigate"
                  size={16}
                  color={
                    isGettingLocation ? palette.textSecondary : palette.link
                  }
                />
                <Text style={styles.suggestionText}>
                  {isGettingLocation
                    ? "Getting location…"
                    : "Use current location"}
                </Text>
                {isGettingLocation && (
                  <ActivityIndicator
                    size="small"
                    color={palette.textSecondary}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            )}
            {departureSuggestions.slice(0, 5).map((city, index, arr) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionItem,
                  index < arr.length - 1 && styles.suggestionItemDivider,
                ]}
                onPress={() => {
                  onSetDepartureLocation(city);
                  setDepartureFocused(false);
                  Keyboard.dismiss();
                }}
              >
                <Ionicons name="location" size={16} color={palette.link} />
                <Text style={styles.suggestionText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.inputLabel}>Destination:</Text>
      <View style={[styles.inputContainer, { zIndex: 1 }]}>
        <TextInput
          style={[
            styles.textInput,
            showDestinationSuggestions && {
              marginBottom: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
          value={newTripDestination}
          onChangeText={onDestinationChange}
          onFocus={() => setDestinationFocused(true)}
          onBlur={() => setTimeout(() => setDestinationFocused(false), 200)}
          placeholder="Enter destination"
          placeholderTextColor={palette.textSecondary}
        />
        {showDestinationSuggestions && (
          <View style={styles.suggestionsContainer}>
            {tripSuggestions.slice(0, 5).map((city, index, arr) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionItem,
                  index < arr.length - 1 && styles.suggestionItemDivider,
                ]}
                onPress={() => {
                  onSetDestination(city);
                  setDestinationFocused(false);
                  Keyboard.dismiss();
                }}
              >
                <Ionicons name="location" size={16} color={palette.link} />
                <Text style={styles.suggestionText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Departure Date:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => onShowDatePicker("departure")}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dateButtonText}>
              {newTripDepartureDate
                ? newTripDepartureDate.toLocaleDateString()
                : "Select date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={palette.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Return Date:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => onShowDatePicker("return")}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dateButtonText}>
              {newTripReturnDate
                ? newTripReturnDate.toLocaleDateString()
                : "Select date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={palette.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Departure Time:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => onShowDatePicker("departureTime")}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dateButtonText}>
              {newTripDepartureTime
                ? newTripDepartureTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select time"}
            </Text>
            <Ionicons
              name="time-outline"
              size={16}
              color={palette.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Return Time:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => onShowDatePicker("returnTime")}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dateButtonText}>
              {newTripReturnTime
                ? newTripReturnTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select time"}
            </Text>
            <Ionicons
              name="time-outline"
              size={16}
              color={palette.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ManualTripForm;
