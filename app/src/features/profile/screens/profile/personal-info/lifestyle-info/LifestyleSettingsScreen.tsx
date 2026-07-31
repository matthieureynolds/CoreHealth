import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileTabParamList } from "@shared/types";
import { useSettings } from "@shared/context/SettingsContext";
import { LifestyleSettings } from "@shared/types/settings";
import DateTimePicker from "@react-native-community/datetimepicker";
import IOSDatePicker from "@shared/components/ui/IOSDatePicker";

type LifestyleSettingsScreenNavigationProp = StackNavigationProp<
  ProfileTabParamList,
  "LifestyleSettings"
>;

const LifestyleSettingsScreen: React.FC = () => {
  const navigation = useNavigation<LifestyleSettingsScreenNavigationProp>();
  const { settings, updateSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  // Time picker states
  const [showWakeUpPicker, setShowWakeUpPicker] = useState(false);
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);

  // Form data
  const [formData, setFormData] = useState<LifestyleSettings>(
    settings.lifestyle,
  );

  // Convert time string to Date object
  const timeStringToDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Convert Date object to time string
  const dateToTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Handle wake up time change
  const handleWakeUpTimeChange = (event: any, selectedDate?: Date) => {
    setShowWakeUpPicker(Platform.OS === "ios");
    if (selectedDate) {
      const newTime = dateToTimeString(selectedDate);
      setFormData((prev) => ({
        ...prev,
        sleepSchedule: {
          ...prev.sleepSchedule,
          wakeUpTime: newTime,
        },
      }));
    }
  };

  // Handle bed time change
  const handleBedTimeChange = (event: any, selectedDate?: Date) => {
    setShowBedTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      const newTime = dateToTimeString(selectedDate);
      setFormData((prev) => ({
        ...prev,
        sleepSchedule: {
          ...prev.sleepSchedule,
          bedTime: newTime,
        },
      }));
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateSettings("lifestyle", formData);
      Alert.alert("Success", "Lifestyle settings updated successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update lifestyle settings. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Info - Lifestyle</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Sleep Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SLEEP SCHEDULE</Text>

          {/* Wake Up Time */}
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setShowWakeUpPicker(true)}
          >
            <Ionicons
              name="sunny-outline"
              size={22}
              color="#FF9500"
              style={styles.cardIcon}
            />
            <Text style={styles.cardLabel}>Wake Up Time</Text>
            <Text style={styles.cardValue}>
              {formatTime(formData.sleepSchedule.wakeUpTime)}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#888"
              style={styles.chevron}
            />
          </TouchableOpacity>

          {/* Bed Time */}
          <TouchableOpacity
            style={[styles.cardRow, styles.lastRow]}
            onPress={() => setShowBedTimePicker(true)}
          >
            <Ionicons
              name="moon-outline"
              size={22}
              color="#5856D6"
              style={styles.cardIcon}
            />
            <Text style={styles.cardLabel}>Bed Time</Text>
            <Text style={styles.cardValue}>
              {formatTime(formData.sleepSchedule.bedTime)}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#888"
              style={styles.chevron}
            />
          </TouchableOpacity>
        </View>

        {/* Activity Level Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ACTIVITY LEVEL</Text>
          <View style={styles.cardRow}>
            <Ionicons
              name="fitness-outline"
              size={22}
              color="#4CD964"
              style={styles.cardIcon}
            />
            <Text style={styles.cardLabel}>Current Level</Text>
            <Text style={styles.cardValue}>
              {formData.activityLevel
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
        </View>

        {/* Work Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>WORK SCHEDULE</Text>
          <View style={styles.cardRow}>
            <Ionicons
              name="briefcase-outline"
              size={22}
              color="#3AABF0"
              style={styles.cardIcon}
            />
            <Text style={styles.cardLabel}>Schedule Type</Text>
            <Text style={styles.cardValue}>
              {formData.workSchedule.type
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
          {formData.workSchedule.startTime && formData.workSchedule.endTime && (
            <View style={styles.cardRow}>
              <Ionicons
                name="time-outline"
                size={22}
                color="#8E8E93"
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Work Hours</Text>
              <Text style={styles.cardValue}>
                {formatTime(formData.workSchedule.startTime)} -{" "}
                {formatTime(formData.workSchedule.endTime)}
              </Text>
            </View>
          )}
        </View>

        {/* Dietary Preferences Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DIETARY PREFERENCES</Text>
          <View style={styles.cardRow}>
            <Ionicons
              name="nutrition-outline"
              size={22}
              color="#FF3B30"
              style={styles.cardIcon}
            />
            <Text style={styles.cardLabel}>Meal Timing</Text>
            <Text style={styles.cardValue}>
              {formData.dietaryPreferences.mealTiming
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Pickers */}
      {showWakeUpPicker && (
        <IOSDatePicker
          visible
          title="Wake Up Time"
          mode="time"
          value={timeStringToDate(formData.sleepSchedule.wakeUpTime)}
          onCancel={() => setShowWakeUpPicker(false)}
          onConfirm={(date) => {
            handleWakeUpTimeChange(null as any, date);
            setShowWakeUpPicker(false);
          }}
        />
      )}

      {showBedTimePicker && (
        <IOSDatePicker
          visible
          title="Bed Time"
          mode="time"
          value={timeStringToDate(formData.sleepSchedule.bedTime)}
          onCancel={() => setShowBedTimePicker(false)}
          onConfirm={(date) => {
            handleBedTimeChange(null as any, date);
            setShowBedTimePicker(false);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#000000",
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 18,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8E8E93",
    marginBottom: 8,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    flex: 1,
  },
  cardValue: {
    fontSize: 16,
    color: "#8E8E93",
    marginRight: 8,
  },
  chevron: {
    marginLeft: "auto",
  },
  saveButton: {
    backgroundColor: "#3AABF0",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#4A4A4A",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LifestyleSettingsScreen;
