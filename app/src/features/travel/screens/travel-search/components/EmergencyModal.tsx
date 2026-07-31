import React from "react";
import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import { styles } from "../TravelScreen.styles";

interface EmergencyModalProps {
  visible: boolean;
  onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({
  visible,
  onClose,
}) => {
  if (!visible) return null;

  const handleCall = () => {
    try {
      Linking.openURL("tel:112");
    } catch {
      Alert.alert("Unable to call", "This device cannot place phone calls.");
    }
    onClose();
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.emergencyModal}>
        <Text style={styles.emergencyModalTitle}>Call 112?</Text>
        <View style={styles.emergencyModalButtons}>
          <TouchableOpacity
            style={styles.emergencyCallButton}
            onPress={handleCall}
          >
            <Text style={styles.emergencyCallButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emergencyCancelButton}
            onPress={onClose}
          >
            <Text style={styles.emergencyCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EmergencyModal;
