import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type IOSDatePickerProps = {
  visible: boolean;
  title?: string;
  value?: Date | null;
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

const IOSDatePicker: React.FC<IOSDatePickerProps> = ({
  visible,
  title = 'Select Date',
  value,
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
}) => {
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  useEffect(() => {
    if (value) setTempDate(value);
  }, [value, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.headerButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={() => onConfirm(tempDate)}>
              <Text style={styles.headerButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerArea}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              onChange={(event: DateTimePickerEvent, selected?: Date) => {
                if (selected) setTempDate(selected);
              }}
              themeVariant={Platform.OS === 'ios' ? 'dark' : undefined as any}
              style={{ alignSelf: 'center' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  headerButton: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerArea: {
    paddingVertical: 8,
    backgroundColor: '#111',
  },
});

export default IOSDatePicker;

