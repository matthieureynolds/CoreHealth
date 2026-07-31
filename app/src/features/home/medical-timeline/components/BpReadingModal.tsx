import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

interface BpReadingModalProps {
  visible: boolean;
  value: string;
  onChange: (text: string) => void;
  onSkip: () => void;
  onSave: () => void;
}

const BpReadingModal: React.FC<BpReadingModalProps> = ({
  visible,
  value,
  onChange,
  onSkip,
  onSave,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.bpCard}>
        <Text style={styles.bpTitle}>Blood pressure?</Text>
        <Text style={styles.bpSubtitle}>Add your reading or skip</Text>
        <TextInput
          style={styles.bpInput}
          value={value}
          onChangeText={onChange}
          placeholder="e.g. 120/80"
          placeholderTextColor="#8E8E93"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
        <View style={styles.bpButtons}>
          <TouchableOpacity style={styles.bpSkip} onPress={onSkip}>
            <Text style={styles.bpSkipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bpSave} onPress={onSave}>
            <Text style={styles.bpSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bpCard: {
    alignSelf: "center",
    width: "90%",
    maxWidth: 340,
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  bpTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  bpSubtitle: { color: "#8E8E93", fontSize: 14, marginBottom: 16 },
  bpInput: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3A3A3C",
    marginBottom: 20,
  },
  bpButtons: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  bpSkip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#3A3A3C",
  },
  bpSkipText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  bpSave: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#3AABF0",
  },
  bpSaveText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
});

export default BpReadingModal;
