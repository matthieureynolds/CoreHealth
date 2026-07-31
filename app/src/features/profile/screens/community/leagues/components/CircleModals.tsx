import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

interface CreateCircleModalProps {
  visible: boolean;
  value: string;
  onChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  visible,
  value,
  onChange,
  onConfirm,
  onCancel,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.modalOverlay}
    >
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Create Circle</Text>
        <Text style={styles.modalSubtitle}>Give your circle a name</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. Morning Runners"
          placeholderTextColor="#636366"
          value={value}
          onChangeText={onChange}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onConfirm}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalCancel} onPress={onCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalConfirm} onPress={onConfirm}>
            <Text style={styles.modalConfirmText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

interface JoinCircleModalProps {
  visible: boolean;
  value: string;
  onChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const JoinCircleModal: React.FC<JoinCircleModalProps> = ({
  visible,
  value,
  onChange,
  onConfirm,
  onCancel,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.modalOverlay}
    >
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Join with Code</Text>
        <Text style={styles.modalSubtitle}>
          Enter the invite code shared by a friend
        </Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. FAMILY-JOIN"
          placeholderTextColor="#636366"
          value={value}
          onChangeText={onChange}
          autoCapitalize="characters"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onConfirm}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalCancel} onPress={onCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalConfirm} onPress={onConfirm}>
            <Text style={styles.modalConfirmText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  modalSubtitle: { fontSize: 13, color: "#8E8E93", marginBottom: 18 },
  modalInput: {
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
  },
  modalCancelText: { color: "#8E8E93", fontSize: 15, fontWeight: "600" },
  modalConfirm: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#5856D6",
    alignItems: "center",
  },
  modalConfirmText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
