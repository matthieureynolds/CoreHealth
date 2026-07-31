import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RELATIONSHIPS = [
  "Spouse",
  "Partner",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Doctor",
  "Neighbor",
  "Colleague",
  "Other",
];

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
}

interface Props {
  visible: boolean;
  editingContact: EmergencyContact | null;
  onClose: () => void;
  onSave: (contact: EmergencyContact) => void;
}

const EmergencyContactFormModal: React.FC<Props> = ({
  visible,
  editingContact,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visible) {
      if (editingContact) {
        setName(editingContact.name);
        setRelationship(editingContact.relationship);
        setPhone(editingContact.phone);
        setSecondaryPhone((editingContact as any).secondaryPhone || "");
        setEmail(editingContact.email || "");
        setIsPrimary(editingContact.isPrimary);
        setNotes(editingContact.notes || "");
      } else {
        setName("");
        setRelationship("");
        setPhone("");
        setSecondaryPhone("");
        setEmail("");
        setIsPrimary(false);
        setNotes("");
      }
    }
  }, [visible, editingContact]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a contact name");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }
    if (!relationship.trim()) {
      Alert.alert("Error", "Please select a relationship");
      return;
    }
    onSave({
      id: editingContact?.id ?? Date.now().toString(),
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim() || undefined,
      email: email.trim() || undefined,
      isPrimary,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.sheet}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {editingContact?.id ? "Edit Contact" : "Add Contact"}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="checkmark" size={22} color="#34C759" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.body}
          >
            {/* Name & Contact Info */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.groupInput}
                placeholder="Full Name *"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
              />
              <View style={styles.groupDivider} />
              <TextInput
                style={styles.groupInput}
                placeholder="Phone Number *"
                placeholderTextColor="#8E8E93"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <View style={styles.groupDivider} />
              <TextInput
                style={styles.groupInput}
                placeholder="Secondary Phone"
                placeholderTextColor="#555"
                value={secondaryPhone}
                onChangeText={setSecondaryPhone}
                keyboardType="phone-pad"
              />
              <View style={styles.groupDivider} />
              <TextInput
                style={styles.groupInput}
                placeholder="Email"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Relationship */}
            <Text style={styles.sectionLabel}>Relationship *</Text>
            <View style={styles.chipGrid}>
              {RELATIONSHIPS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.chip,
                    relationship === r && styles.chipSelected,
                  ]}
                  onPress={() => setRelationship(r)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      relationship === r && styles.chipTextSelected,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Primary Toggle */}
            <View style={[styles.inputGroup, { marginTop: 20 }]}>
              <TouchableOpacity
                style={styles.primaryRow}
                onPress={() => setIsPrimary(!isPrimary)}
              >
                <View style={styles.primaryLeft}>
                  <Ionicons name="star" size={18} color="#FF9500" />
                  <Text style={styles.primaryText}>Primary Contact</Text>
                </View>
                <View style={[styles.toggle, isPrimary && styles.toggleActive]}>
                  <View
                    style={[
                      styles.toggleThumb,
                      isPrimary && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.primaryHint}>
              Primary contact will be called first in emergencies
            </Text>

            {/* Notes */}
            <View style={[styles.inputGroup, { marginTop: 20 }]}>
              <TextInput
                style={[
                  styles.groupInput,
                  { height: 70, textAlignVertical: "top", paddingTop: 14 },
                ]}
                placeholder="Notes"
                placeholderTextColor="#555"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default EmergencyContactFormModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#fff" },
  body: { padding: 20, paddingBottom: 40 },
  inputGroup: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    overflow: "hidden",
  },
  groupInput: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: "#FFFFFF",
  },
  groupDivider: { height: 1, backgroundColor: "#3A3A3C", marginLeft: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  chipSelected: { backgroundColor: "#3AABF0", borderColor: "#3AABF0" },
  chipText: { fontSize: 14, color: "#fff" },
  chipTextSelected: { fontWeight: "600" },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  primaryLeft: { flexDirection: "row", alignItems: "center" },
  primaryText: { fontSize: 16, color: "#fff", marginLeft: 10 },
  primaryHint: { fontSize: 13, color: "#555", marginTop: 8, marginLeft: 4 },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3A3A3C",
    justifyContent: "center",
    padding: 2,
  },
  toggleActive: { backgroundColor: "#34C759" },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleThumbActive: { alignSelf: "flex-end" },
});
