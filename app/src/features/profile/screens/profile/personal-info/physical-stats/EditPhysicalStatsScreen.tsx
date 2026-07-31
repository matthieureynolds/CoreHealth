import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useHealthData } from "@shared/context/HealthDataContext";
import { ProfileTabParamList } from "@shared/types";

type EditPhysicalStatsScreenNavigationProp =
  StackNavigationProp<ProfileTabParamList>;

interface PhysicalStatsData {
  height: string;
  weight: string;
  bloodType: string;
}

const EditPhysicalStatsScreen: React.FC = () => {
  const navigation = useNavigation<EditPhysicalStatsScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();
  const [statsData, setStatsData] = useState<PhysicalStatsData>({
    height: "",
    weight: "",
    bloodType: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setStatsData({
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        bloodType: profile.bloodType || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const height = parseFloat(statsData.height);
    const weight = parseFloat(statsData.weight);

    if (isNaN(height) || height < 50 || height > 250) {
      Alert.alert("Error", "Please enter a valid height in cm (50-250)");
      return;
    }

    if (isNaN(weight) || weight < 20 || weight > 500) {
      Alert.alert("Error", "Please enter a valid weight in kg (20-500)");
      return;
    }

    if (!statsData.bloodType.trim()) {
      Alert.alert("Error", "Please select your blood type");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        ...profile,
        height: Math.round(height * 10) / 10, // Round to 1 decimal place
        weight: Math.round(weight * 10) / 10, // Round to 1 decimal place
        bloodType: statsData.bloodType as
          | "A+"
          | "A-"
          | "B+"
          | "B-"
          | "AB+"
          | "AB-"
          | "O+"
          | "O-"
          | "unknown",
      });

      Alert.alert("Success", "Physical stats updated successfully");
    } catch (error) {
      console.error("Error updating physical stats:", error);
      Alert.alert(
        "Error",
        "Failed to update physical stats. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const bloodTypeOptions = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
    "Unknown",
  ];
  const ITEM_HEIGHT = 52;
  const VISIBLE_ITEMS = 5;

  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [tempBloodType, setTempBloodType] = useState(bloodTypeOptions[0]);
  const pickerScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (showBloodTypePicker) {
      const idx = Math.max(0, bloodTypeOptions.indexOf(statsData.bloodType));
      setTempBloodType(bloodTypeOptions[idx]);
      setTimeout(() => {
        pickerScrollRef.current?.scrollTo({
          y: idx * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [showBloodTypePicker]);

  const handleBloodTypeSelect = (bloodType: string) => {
    setStatsData({ ...statsData, bloodType });
    setShowBloodTypePicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">
          Physical Stats
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingTop: 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm): *</Text>
          <TextInput
            style={styles.input}
            value={statsData.height}
            onChangeText={(text) =>
              setStatsData({ ...statsData, height: text })
            }
            placeholder="Enter your height (e.g., 175.5)"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.characterCount}>{statsData.height.length}/6</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg): *</Text>
          <TextInput
            style={styles.input}
            value={statsData.weight}
            onChangeText={(text) =>
              setStatsData({ ...statsData, weight: text })
            }
            placeholder="Enter your weight (e.g., 75.5)"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.characterCount}>{statsData.weight.length}/6</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Blood Type: *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowBloodTypePicker(true)}
          >
            <Text
              style={[
                styles.pickerButtonText,
                !statsData.bloodType && styles.placeholderText,
              ]}
            >
              {statsData.bloodType || "Select your blood type"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Blood Type Picker Modal */}
      <Modal
        visible={showBloodTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBloodTypePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity
                onPress={() => setShowBloodTypePicker(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Blood Type</Text>
              <TouchableOpacity
                onPress={() => handleBloodTypeSelect(tempBloodType)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="checkmark" size={24} color="#34C759" />
              </TouchableOpacity>
            </View>

            <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
              {/* Selection indicator lines */}
              <View
                style={[styles.selectionLine, { top: ITEM_HEIGHT * 2 }]}
                pointerEvents="none"
              />
              <View
                style={[styles.selectionLine, { top: ITEM_HEIGHT * 3 }]}
                pointerEvents="none"
              />

              <ScrollView
                ref={pickerScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(
                    e.nativeEvent.contentOffset.y / ITEM_HEIGHT,
                  );
                  setTempBloodType(
                    bloodTypeOptions[
                      Math.max(0, Math.min(idx, bloodTypeOptions.length - 1))
                    ],
                  );
                }}
                onScrollEndDrag={(e) => {
                  const idx = Math.round(
                    e.nativeEvent.contentOffset.y / ITEM_HEIGHT,
                  );
                  setTempBloodType(
                    bloodTypeOptions[
                      Math.max(0, Math.min(idx, bloodTypeOptions.length - 1))
                    ],
                  );
                }}
              >
                {bloodTypeOptions.map((bt) => (
                  <TouchableOpacity
                    key={bt}
                    style={styles.pickerItem}
                    onPress={() => {
                      const idx = bloodTypeOptions.indexOf(bt);
                      pickerScrollRef.current?.scrollTo({
                        y: idx * ITEM_HEIGHT,
                        animated: true,
                      });
                      setTempBloodType(bt);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        tempBloodType === bt && styles.pickerItemTextActive,
                      ]}
                    >
                      {bt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#000000",
    zIndex: 1000,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#222",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    minHeight: 56,
  },
  characterCount: {
    color: "#666",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#222",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#333",
    minHeight: 56,
  },
  pickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderText: {
    color: "#666",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  pickerContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    width: "100%",
    maxWidth: 350,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  pickerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectionLine: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "#3A3A3C",
    zIndex: 1,
  },
  pickerItem: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    color: "#555",
    fontSize: 20,
    fontWeight: "600",
  },
  pickerItemTextActive: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
});

export default EditPhysicalStatsScreen;
