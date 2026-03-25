import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface VaccineNameFieldProps {
  vaccineName: string;
  setVaccineName: (v: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  commonVaccines: string[];
}

const VaccineNameField: React.FC<VaccineNameFieldProps> = ({
  vaccineName,
  setVaccineName,
  showSuggestions,
  setShowSuggestions,
  commonVaccines,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Vaccine Name *:</Text>
    <TextInput
      style={styles.textInput}
      value={vaccineName}
      onChangeText={(text) => {
        setVaccineName(text);
        setShowSuggestions(text.length > 0);
      }}
      placeholder="e.g., COVID-19, Influenza"
      placeholderTextColor="#666"
    />
    {showSuggestions && vaccineName.length > 0 && (
      <View style={styles.suggestionsContainer}>
        {commonVaccines
          .filter((v) => v.toLowerCase().includes(vaccineName.toLowerCase()))
          .slice(0, 5)
          .map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                setVaccineName(suggestion);
                setShowSuggestions(false);
              }}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    backgroundColor: '#181818',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default VaccineNameField;
