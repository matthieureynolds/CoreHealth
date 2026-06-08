import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanDay } from '../../../shared/types';
import { DayTimeline } from './DayTimeline';
import { DateStrip } from './DateStrip';
import ActionInfoModal from './ActionInfoModal';
import { formatDate } from './TimelineConstants';

interface PlanTimelineProps {
  planDays: PlanDay[];
  currentDay?: string; // YYYY-MM-DD format
  mode?: 'vertical' | 'horizontal';
}

export const PlanTimeline: React.FC<PlanTimelineProps> = ({
  planDays,
  currentDay,
  mode = 'horizontal',
}) => {
  const initialSelectedDayId =
    (currentDay && planDays.find(d => d.date_local === currentDay)?.id) ||
    planDays[0]?.id ||
    null;
  const [selectedDayId, setSelectedDayId] = useState<string | null>(initialSelectedDayId);
  const [activeInfo, setActiveInfo] = useState<{ title: string; body: string } | null>(null);

  if (planDays.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No Plan Generated</Text>
        <Text style={styles.emptySubtitle}>
          Create a trip to generate your personalized jet lag plan
        </Text>
      </View>
    );
  }

  const daysToRender =
    mode === 'horizontal' && selectedDayId
      ? planDays.filter(d => d.id === selectedDayId)
      : planDays;

  return (
    <View style={styles.container}>
      {mode === 'horizontal' && (
        <DateStrip
          planDays={planDays}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
        />
      )}

      <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        {daysToRender.map((planDay, index) => (
          <View key={planDay.id}>
            <DayTimeline planDay={planDay} onBarPress={setActiveInfo} />
            {index < daysToRender.length - 1 && (
              <View style={styles.daySeparator}>
                <Text style={styles.daySeparatorText}>
                  {formatDate(planDays[index + 1]?.date_local)}
                </Text>
                <Text style={styles.daySeparatorTime}>
                  {planDays[index + 1]?.location.label} 00:00
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <ActionInfoModal info={activeInfo} onClose={() => setActiveInfo(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  timelineScroll: {
    flex: 1,
  },
  daySeparator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1F1F20',
    backgroundColor: '#0B0B0C',
  },
  daySeparatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  daySeparatorTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
