import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../TravelScreen.styles";
import { palette } from "@shared/theme/colors";

const StableEditDatePicker = React.memo(
  ({
    initialValue,
    minimumDate,
    onDateSelected,
  }: {
    initialValue: Date;
    minimumDate: Date;
    onDateSelected: (date: Date) => void;
  }) => {
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
        mode="date"
        display="inline"
        themeVariant="dark"
        textColor={palette.textPrimary}
        onChange={handleChange}
        minimumDate={frozenMinDate}
        style={styles.datePicker}
      />
    );
  },
  () => true,
);

interface EditTripModalProps {
  visible: boolean;
  editingTripId: string | null;

  editTripDepartureLocation: string;
  editTripDestination: string;
  editTripDepartureDate: Date;
  editTripReturnDate: Date | undefined;
  editTripNotes: string;
  showEditDatePicker: "departure" | "return" | null;
  tempEditDatePickerValue: Date | undefined;
  editTripSuggestions: string[];
  editTripDepartureSuggestions: string[];
  isGettingLocation: boolean;

  onClose: () => void;
  onDelete: () => void;
  onSave: () => void;
  onDepartureLocationChange: (v: string) => void;
  onDestinationChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSetDepartureLocation: (v: string) => void;
  onSetDestination: (v: string) => void;
  onShowEditDatePicker: (v: "departure" | "return") => void;
  onEditDateChange: (event: any, date?: Date) => void;
  onEditDateConfirm: () => void;
  onEditDateCancel: () => void;
  onGetCurrentLocation: () => Promise<void>;
}

const EditTripModal: React.FC<EditTripModalProps> = ({
  visible,
  editingTripId,
  editTripDepartureLocation,
  editTripDestination,
  editTripDepartureDate,
  editTripReturnDate,
  editTripNotes,
  showEditDatePicker,
  tempEditDatePickerValue,
  editTripSuggestions,
  editTripDepartureSuggestions,
  isGettingLocation,
  onClose,
  onDelete,
  onSave,
  onDepartureLocationChange,
  onDestinationChange,
  onNotesChange,
  onSetDepartureLocation,
  onSetDestination,
  onShowEditDatePicker,
  onEditDateChange,
  onEditDateConfirm,
  onEditDateCancel,
  onGetCurrentLocation,
}) => {
  if (!visible || !editingTripId) return null;

  return (
    <>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View
            style={[styles.modalHeader, { justifyContent: "space-between" }]}
          >
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={palette.danger} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { textAlign: "center", flex: 1 }]}>
              Edit Trip
            </Text>
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash" size={22} color={palette.danger} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.inputLabel}>Departure Location:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={editTripDepartureLocation}
                onChangeText={onDepartureLocationChange}
                placeholder="Enter departure location (e.g., New York, USA)"
                placeholderTextColor={palette.textSecondary}
              />
              {(editTripDepartureLocation.trim() === "" ||
                editTripDepartureSuggestions.length > 0) && (
                <View style={styles.suggestionsContainer}>
                  {editTripDepartureLocation.trim() === "" && (
                    <TouchableOpacity
                      style={[
                        styles.suggestionItem,
                        styles.suggestionItemDivider,
                      ]}
                      onPress={async () => {
                        try {
                          await onGetCurrentLocation();
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
                          isGettingLocation
                            ? palette.textSecondary
                            : palette.link
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
                  {editTripDepartureSuggestions
                    .slice(0, 5)
                    .map((city, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          onSetDepartureLocation(city);
                          Keyboard.dismiss();
                        }}
                      >
                        <Ionicons
                          name="location"
                          size={16}
                          color={palette.link}
                        />
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
                onChangeText={onDestinationChange}
                placeholder="Enter destination (e.g., Tokyo, Japan)"
                placeholderTextColor={palette.textSecondary}
              />
              {editTripSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {editTripSuggestions.slice(0, 5).map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        onSetDestination(city);
                        Keyboard.dismiss();
                      }}
                    >
                      <Ionicons
                        name="location"
                        size={16}
                        color={palette.link}
                      />
                      <Text style={styles.suggestionText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.inputLabel}>Departure Date:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => onShowEditDatePicker("departure")}
            >
              <Text style={styles.dateButtonText}>
                {editTripDepartureDate.toLocaleDateString()}
              </Text>
              <Ionicons
                name="calendar"
                size={16}
                color={palette.textSecondary}
              />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Return Date: (Optional)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => onShowEditDatePicker("return")}
            >
              <Text style={styles.dateButtonText}>
                {editTripReturnDate
                  ? editTripReturnDate.toLocaleDateString()
                  : "Select date"}
              </Text>
              <Ionicons
                name="calendar"
                size={16}
                color={palette.textSecondary}
              />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
                { height: 80, textAlignVertical: "top" },
              ]}
              value={editTripNotes}
              onChangeText={onNotesChange}
              placeholder="Add any additional notes..."
              placeholderTextColor={palette.textSecondary}
              multiline
            />
          </ScrollView>

          <View style={styles.modalButtonsSingleCentered}>
            <TouchableOpacity
              style={styles.primaryCenteredButton}
              onPress={onSave}
            >
              <Text style={styles.modalButtonPrimaryText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Edit Date Picker */}
      {showEditDatePicker &&
        (Platform.OS === "ios" ? (
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity
                  onPress={onEditDateCancel}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={28}
                    color={palette.danger}
                  />
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  {showEditDatePicker === "departure"
                    ? "Departure Date"
                    : "Return Date"}
                </Text>
                <TouchableOpacity
                  onPress={onEditDateConfirm}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={28}
                    color={palette.success}
                  />
                </TouchableOpacity>
              </View>
              <StableEditDatePicker
                initialValue={
                  tempEditDatePickerValue ??
                  (showEditDatePicker === "departure"
                    ? editTripDepartureDate
                    : editTripReturnDate || new Date())
                }
                minimumDate={
                  showEditDatePicker === "return"
                    ? editTripDepartureDate
                    : new Date()
                }
                onDateSelected={(date) => onEditDateChange(null, date)}
                key={showEditDatePicker}
              />
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={
              showEditDatePicker === "departure"
                ? editTripDepartureDate
                : editTripReturnDate || new Date()
            }
            mode="date"
            display="default"
            themeVariant="dark"
            textColor={palette.textPrimary}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                onEditDateChange(event, selectedDate);
              }
              onEditDateCancel();
            }}
            minimumDate={
              showEditDatePicker === "return"
                ? editTripDepartureDate
                : new Date()
            }
          />
        ))}
    </>
  );
};

export default EditTripModal;
