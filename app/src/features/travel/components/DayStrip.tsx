import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { PlanDay } from '../../../shared/types';

interface DayStripProps {
  planDays: PlanDay[];
  selectedDayId: string | null;
  onSelectDay: (id: string) => void;
  formatDate: (dateString: string) => string;
  getSegmentColor: (segment: string) => string;
}

const DayStrip: React.FC<DayStripProps> = ({
  planDays,
  selectedDayId,
  onSelectDay,
  formatDate,
  getSegmentColor,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.dateStrip}
    contentContainerStyle={{ paddingHorizontal: 12 }}
  >
    {planDays.map((d) => (
      <TouchableOpacity
        key={d.id}
        style={[styles.dateChip, selectedDayId === d.id && styles.dateChipSelected]}
        onPress={() => onSelectDay(d.id)}
      >
        <View style={[styles.dateDot, { backgroundColor: getSegmentColor(d.location.segment) }]} />
        <View>
          <Text style={[styles.dateChipText, selectedDayId === d.id && styles.dateChipTextSelected]}>
            {formatDate(d.date_local)}
          </Text>
          <Text style={styles.dateChipSubText}>{d.location.label}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  dateStrip: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F20',
    backgroundColor: '#000000',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginHorizontal: 4,
    backgroundColor: '#0B0B0C',
  },
  dateChipSelected: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  dateChipText: {
    color: '#E5E5E7',
    fontSize: 13,
    fontWeight: '600',
  },
  dateChipTextSelected: {
    color: '#FFFFFF',
  },
  dateChipSubText: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
});

export default DayStrip;
