import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type DateMode = 'year' | 'yearMonth' | 'full';

interface DateModeSelectorProps {
  mode: DateMode;
  setMode: (m: DateMode) => void;
}

const DateModeSelector: React.FC<DateModeSelectorProps> = ({ mode, setMode }) => (
  <View style={styles.dateModeRow}>
    {(['year', 'yearMonth', 'full'] as DateMode[]).map((m) => (
      <TouchableOpacity
        key={m}
        style={[styles.dateModeChip, mode === m && styles.dateModeChipActive]}
        onPress={() => setMode(m)}
      >
        <Text style={[styles.dateModeText, mode === m && styles.dateModeTextActive]}>
          {m === 'year' ? 'Year' : m === 'yearMonth' ? 'Year-Month' : 'Full'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  dateModeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  dateModeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    marginBottom: 6,
  },
  dateModeChipActive: {
    backgroundColor: '#3AABF0',
    borderColor: '#3AABF0',
  },
  dateModeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  dateModeTextActive: {
    color: '#FFFFFF',
  },
});

export default DateModeSelector;
