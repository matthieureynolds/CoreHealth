import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FlightLookupData {
  carrier: string;
  number: string;
  date: string;
}

interface FlightLookupStepProps {
  flightData: FlightLookupData;
  isLoading: boolean;
  onUpdate: (updates: Partial<FlightLookupData>) => void;
  onLookup: () => void;
}

const FlightLookupStep: React.FC<FlightLookupStepProps> = ({
  flightData,
  isLoading,
  onUpdate,
  onLookup,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Flight Details</Text>
    <View style={styles.row}>
      <View style={styles.halfWidth}>
        <Text style={styles.label}>Carrier</Text>
        <TextInput
          style={styles.input}
          value={flightData.carrier}
          onChangeText={(text) => onUpdate({ carrier: text })}
          placeholder="AF"
          placeholderTextColor="#9ca3af"
          autoCapitalize="characters"
          maxLength={2}
        />
      </View>
      <View style={styles.halfWidth}>
        <Text style={styles.label}>Flight Number</Text>
        <TextInput
          style={styles.input}
          value={flightData.number}
          onChangeText={(text) => onUpdate({ number: text })}
          placeholder="128"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
        />
      </View>
    </View>
    <View style={styles.lookupButtonContainer}>
      <TouchableOpacity
        style={[styles.lookupButton, isLoading && styles.disabledButton]}
        onPress={onLookup}
        disabled={isLoading}
      >
        <Ionicons name="search" size={16} color="white" />
        <Text style={styles.lookupButtonText}>Lookup Flight</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  lookupButtonContainer: {
    marginTop: 16,
  },
  lookupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lookupButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default FlightLookupStep;
