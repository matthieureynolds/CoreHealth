import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface DateTimeCollectorProps {
  label: string;
  onPicked: (isoDate: string, time24?: string) => void;
}

export const DateTimeCollector: React.FC<DateTimeCollectorProps> = ({ label, onPicked }) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'date'|'time'>('date');
  const [pickedDate, setPickedDate] = useState<Date | null>(null);

  const open = () => { setMode('date'); setVisible(true); };
  const close = () => setVisible(false);

  const onConfirm = (date: Date) => {
    if (mode === 'date') {
      setPickedDate(date);
      setMode('time');
    } else {
      const d = pickedDate || new Date();
      const final = new Date(d);
      final.setHours(date.getHours(), date.getMinutes(), 0, 0);
      const iso = final.toISOString().slice(0, 10);
      const time24 = `${String(final.getHours()).padStart(2,'0')}:${String(final.getMinutes()).padStart(2,'0')}`;
      onPicked(iso, time24);
      setMode('date');
      setPickedDate(null);
      setVisible(false);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.btn} onPress={open}>
        <Text style={styles.btnText}>Pick</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={visible}
        mode={mode}
        onConfirm={onConfirm}
        onCancel={() => { setMode('date'); setVisible(false); }}
      />
    </View>
  );
};

interface SeverityCollectorProps {
  label?: string;
  onPicked: (severity: number) => void;
}

export const SeverityCollector: React.FC<SeverityCollectorProps> = ({ label = 'Severity (0–10)', onPicked }) => {
  const [value, setValue] = useState(5);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pillGroup}>
        <TouchableOpacity style={styles.pill} onPress={() => { const v = Math.max(0, value - 1); setValue(v); onPicked(v); }}>
          <Text style={styles.pillText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity style={styles.pill} onPress={() => { const v = Math.min(10, value + 1); setValue(v); onPicked(v); }}>
          <Text style={styles.pillText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface MgCollectorProps {
  label?: string;
  step?: number;
  onPicked: (mg: number) => void;
}

export const MgCollector: React.FC<MgCollectorProps> = ({ label = 'Dose (mg)', step = 100, onPicked }) => {
  const [mg, setMg] = useState(500);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pillGroup}>
        <TouchableOpacity style={styles.pill} onPress={() => { const v = Math.max(0, mg - step); setMg(v); onPicked(v); }}>
          <Text style={styles.pillText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.value}>{mg} mg</Text>
        <TouchableOpacity style={styles.pill} onPress={() => { const v = mg + step; setMg(v); onPicked(v); }}>
          <Text style={styles.pillText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#3AABF0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  value: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 14,
    minWidth: 60,
    textAlign: 'center',
  },
});


