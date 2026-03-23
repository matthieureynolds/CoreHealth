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
  mode?: 'date' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
  overlayOpacity?: number;
  containerColor?: string;
}

const IOSDatePicker: React.FC<IOSDatePickerProps> = ({
  visible,
  value,
  onConfirm,
  onCancel,
  title = 'Select Date',
  mode = 'date',
  minimumDate,
  maximumDate,
  overlayOpacity,
  containerColor
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
      <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity ?? 0.7})` }]}> 
        <View style={[styles.container, { backgroundColor: containerColor ?? '#1a1a1a' }]}> 
          {mode === 'date' ? (
            <View style={styles.header}>
              <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={() => onConfirm(tempDate)} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timeHeaderSpacer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          {mode === 'time' ? (
            <View style={styles.pickerRow}> 
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                themeVariant="dark"
                textColor="#FFFFFF"
                onChange={(_, date) => {
                  if (date) {
                    setTempDate(date);
                  }
                }}
                style={styles.datePicker}
              />
              <View style={styles.actionColumn}>
                <TouchableOpacity accessibilityLabel="Cancel" onPress={onCancel} style={[styles.iconButton, styles.cancelButton]}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity accessibilityLabel="Confirm" onPress={() => onConfirm(tempDate)} style={[styles.iconButton, styles.confirmButton]}>
                  <Ionicons name="checkmark" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              themeVariant="dark"
              textColor="#FFFFFF"
              onChange={(_, date) => {
                if (date) {
                  setTempDate(date);
                }
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={styles.datePicker}
            />
          )}
        </View>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '90%',
    maxWidth: 360,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  timeHeaderSpacer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    height: 220,
    backgroundColor: 'transparent',
  },
  actionColumn: {
    marginLeft: 12,
    height: 220,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
});

export default IOSDatePicker;

