import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface IOSDatePickerProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title?: string;
  maximumDate?: Date;
}

const IOSDatePicker: React.FC<IOSDatePickerProps> = ({
  visible,
  value,
  onConfirm,
  onCancel,
  title = 'Select Date',
  maximumDate
}) => {
  const [tempDate, setTempDate] = useState(value);

  useEffect(() => {
    if (visible) {
      setTempDate(value);
    }
  }, [visible, value]);

  if (!visible) {
    return null;
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={() => onConfirm(tempDate)} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner"
          onChange={(_, date) => {
            if (date) {
              setTempDate(date);
            }
          }}
          maximumDate={maximumDate}
          style={styles.datePicker}
        />
      </View>
    );
  }

  // Fallback for Android
  return (
    <DateTimePicker
      value={tempDate}
      mode="date"
      onChange={(_, date) => {
        if (date) {
          setTempDate(date);
          onConfirm(date);
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for home indicator
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  datePicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'transparent',
  },
});

export default IOSDatePicker;

