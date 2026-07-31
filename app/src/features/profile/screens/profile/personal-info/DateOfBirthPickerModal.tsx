import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateOfBirthPickerModalProps {
  visible: boolean;
  currentBirthDate?: string;
  onConfirm: (date: Date, age: number) => void;
  onClose: () => void;
}

const DateOfBirthPickerModal: React.FC<DateOfBirthPickerModalProps> = ({
  visible,
  currentBirthDate,
  onConfirm,
  onClose,
}) => {
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    if (visible)
      setTempDate(currentBirthDate ? new Date(currentBirthDate) : new Date());
  }, [visible, currentBirthDate]);

  const handleConfirm = () => {
    const today = new Date();
    let age = today.getFullYear() - tempDate.getFullYear();
    const monthDiff = today.getMonth() - tempDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < tempDate.getDate())
    )
      age--;
    if (age >= 1 && age <= 150) {
      onConfirm(tempDate, age);
    } else {
      Alert.alert("Error", "Please select a valid date of birth");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Date of Birth</Text>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.headerButton}
            >
              <Ionicons name="checkmark" size={24} color="#34C759" />
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              style={styles.picker}
              textColor="#fff"
              themeVariant="dark"
              onChange={(_, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateOfBirthPickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    minWidth: 300,
    maxWidth: 350,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerButton: { padding: 4 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  body: { alignItems: "center" },
  picker: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 12,
    padding: 10,
    width: "100%",
  },
});
