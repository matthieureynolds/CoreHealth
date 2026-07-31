import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

interface EditRecordModalProps {
  visible: boolean;
  editName: string;
  editNotes: string;
  editTags: string;
  onChangeName: (text: string) => void;
  onChangeNotes: (text: string) => void;
  onChangeTags: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
  visible,
  editName,
  editNotes,
  editTags,
  onChangeName,
  onChangeNotes,
  onChangeTags,
  onCancel,
  onSave,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onCancel}
  >
    <View style={styles.modalContainer}>
      <View style={styles.editModalHeader}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.editModalTitle}>Edit Record</Text>
        <TouchableOpacity onPress={onSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name: *</Text>
          <TextInput
            style={styles.textInput}
            value={editName}
            onChangeText={onChangeName}
            placeholder="Record name"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Notes: (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={editNotes}
            onChangeText={onChangeNotes}
            placeholder="Add any notes"
            placeholderTextColor="#666"
            multiline
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tags (comma-separated):</Text>
          <TextInput
            style={styles.textInput}
            value={editTags}
            onChangeText={onChangeTags}
            placeholder="e.g., cardiology, urgent"
            placeholderTextColor="#666"
          />
        </View>
      </ScrollView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  editModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  cancelButton: {
    fontSize: 16,
    color: "#3AABF0",
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  saveButton: {
    fontSize: 16,
    color: "#3AABF0",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#181818",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
});

export default EditRecordModal;
