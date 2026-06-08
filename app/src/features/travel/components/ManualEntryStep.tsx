import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TripFormData {
  title: string;
  origin_iata: string;
  dest_iata: string;
  dep_local: Date;
  arr_local: Date;
}

interface ManualEntryStepProps {
  formData: TripFormData;
  onUpdate: (updates: Partial<TripFormData>) => void;
  onPickDate: (which: 'dep' | 'arr') => void;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
}

const ManualEntryStep: React.FC<ManualEntryStepProps> = ({
  formData,
  onUpdate,
  onPickDate,
  formatDate,
  formatTime,
}) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trip Title (Optional)</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(text) => onUpdate({ title: text })}
        placeholder="e.g., Milan → Tokyo"
        placeholderTextColor="#9ca3af"
      />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Airports</Text>
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Origin (IATA)</Text>
          <TextInput
            style={styles.input}
            value={formData.origin_iata}
            onChangeText={(text) => onUpdate({ origin_iata: text })}
            placeholder="MXP"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            maxLength={3}
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Destination (IATA)</Text>
          <TextInput
            style={styles.input}
            value={formData.dest_iata}
            onChangeText={(text) => onUpdate({ dest_iata: text })}
            placeholder="HND"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            maxLength={3}
          />
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Schedule (Local Times)</Text>
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Departure</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => onPickDate('dep')}>
            <Text style={styles.dateButtonText}>
              {formatDate(formData.dep_local)} {formatTime(formData.dep_local)}
            </Text>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Arrival</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => onPickDate('arr')}>
            <Text style={styles.dateButtonText}>
              {formatDate(formData.arr_local)} {formatTime(formData.arr_local)}
            </Text>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </>
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
});

export default ManualEntryStep;
