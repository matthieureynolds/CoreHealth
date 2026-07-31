import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";

interface FormData {
  title: string;
  date: string;
  provider: string;
}

interface RecordDetailsFormProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

const RecordDetailsForm: React.FC<RecordDetailsFormProps> = ({
  formData,
  onChange,
}) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>Document Details</Text>

    <TextInput
      style={styles.input}
      placeholder="Document title"
      placeholderTextColor="#8E8E93"
      value={formData.title}
      onChangeText={(text) => onChange({ title: text })}
    />

    <TextInput
      style={styles.input}
      placeholder="Date (YYYY-MM-DD)"
      placeholderTextColor="#8E8E93"
      value={formData.date}
      onChangeText={(text) => onChange({ date: text })}
    />

    <TextInput
      style={styles.input}
      placeholder="Healthcare provider"
      placeholderTextColor="#8E8E93"
      value={formData.provider}
      onChangeText={(text) => onChange({ provider: text })}
    />
  </View>
);

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1C1C1E",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
});

export default RecordDetailsForm;
