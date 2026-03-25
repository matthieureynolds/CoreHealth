import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateModeSelector, { DateMode } from './DateModeSelector';
import IOSDatePicker from '../../../../../../../../shared/components/ui/IOSDatePicker';

export const formatDateForMode = (d: Date | null, mode: DateMode): string => {
  if (!d) return 'Select date';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (mode === 'year') return `${year}`;
  if (mode === 'yearMonth') return `${year}-${month}`;
  return `${year}-${month}-${day}`;
};

interface DateFieldProps {
  label: string;
  date: Date | null;
  setDate: (d: Date | null) => void;
  showPicker: boolean;
  setShowPicker: (v: boolean) => void;
  dateMode: DateMode;
  setDateMode: (m: DateMode) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  date,
  setDate,
  showPicker,
  setShowPicker,
  dateMode,
  setDateMode,
  minimumDate,
  maximumDate,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <DateModeSelector mode={dateMode} setMode={setDateMode} />
    <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
      <Text style={[styles.dateInputText, !date && styles.placeholderText]}>
        {formatDateForMode(date, dateMode)}
      </Text>
      <Ionicons name="calendar-outline" size={20} color="#888" />
    </TouchableOpacity>
    {showPicker && (
      <IOSDatePicker
        visible={true}
        title={label.replace(' *:', '').replace(' (Optional):', '')}
        value={date ?? new Date()}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onConfirm={(d) => {
          setDate(d);
          setShowPicker(false);
        }}
        onCancel={() => setShowPicker(false)}
      />
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
  dateInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#666',
  },
});

export default DateField;
