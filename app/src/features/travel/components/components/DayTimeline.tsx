import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanDay, Action } from '../../../../shared/types';
import { ActivityBar } from './ActivityBar';
import {
  HOUR_HEIGHT,
  CHART_HEIGHT,
  BAR_WIDTH,
  BAR_SPACING,
  getBarColor,
  getBarStyle,
  getBarIcon,
  timeToMinutes,
  minutesToTop,
  minutesToHeight,
  formatHourLabel,
  formatDate,
} from './TimelineConstants';

interface DayTimelineProps {
  planDay: PlanDay;
  onBarPress: (info: { title: string; body: string }) => void;
}

interface BarData {
  action: Action;
  top: number;
  height: number;
  left: number;
  color: string;
  style: any;
  icon: ReturnType<typeof getBarIcon>;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({ planDay, onBarPress }) => {
  const actions = planDay.actions;
  const isInFlight = planDay.location.segment === 'in_flight';

  const sortedActions = [...actions].sort((a, b) => {
    const timeA = a.start_local || a.at_local || '00:00';
    const timeB = b.start_local || b.at_local || '00:00';
    return timeA.localeCompare(timeB);
  });

  const lightActions: Action[] = [];
  const caffeineActions: Action[] = [];
  const sleepActions: Action[] = [];
  const otherActions: Action[] = [];
  const flightActions: Action[] = [];

  sortedActions.forEach((action) => {
    if (action.type === 'seek_light' || action.type === 'avoid_light') lightActions.push(action);
    else if (action.type === 'caffeine_ok' || action.type === 'caffeine_cutoff') caffeineActions.push(action);
    else if (action.type === 'sleep' || action.type === 'nap') sleepActions.push(action);
    else if (action.type === 'in_flight') flightActions.push(action);
    else otherActions.push(action);
  });

  const bars: BarData[] = [];
  const baseLeft = 20;
  const caffeineLeft = baseLeft + BAR_WIDTH + BAR_SPACING;
  const sleepLeft = caffeineLeft + BAR_WIDTH + BAR_SPACING;
  const otherLeft = sleepLeft + BAR_WIDTH + BAR_SPACING;

  lightActions.forEach((action) => {
    if (action.type === 'avoid_light') {
      const minutes = timeToMinutes(action.at_local);
      if (minutes !== null) {
        bars.push({ action, top: minutesToTop(minutes) - 10, height: 20, left: baseLeft, color: '#FF9500', style: { backgroundColor: 'transparent' }, icon: getBarIcon(action.type) });
      }
    } else if (action.type === 'seek_light' && action.start_local && action.end_local) {
      const startMinutes = timeToMinutes(action.start_local);
      const endMinutes = timeToMinutes(action.end_local);
      if (startMinutes !== null && endMinutes !== null) {
        bars.push({ action, top: minutesToTop(startMinutes), height: minutesToHeight(startMinutes, endMinutes), left: baseLeft, color: getBarColor(action.type), style: getBarStyle(action.type), icon: getBarIcon(action.type) });
      }
    }
  });

  caffeineActions.forEach((action) => {
    if ((action.type === 'caffeine_ok' || action.type === 'caffeine_cutoff') && action.start_local && action.end_local) {
      const startMinutes = timeToMinutes(action.start_local);
      const endMinutes = timeToMinutes(action.end_local);
      if (startMinutes !== null && endMinutes !== null) {
        bars.push({ action, top: minutesToTop(startMinutes), height: minutesToHeight(startMinutes, endMinutes), left: caffeineLeft, color: getBarColor(action.type), style: getBarStyle(action.type), icon: getBarIcon(action.type) });
      }
    } else if (action.at_local) {
      const minutes = timeToMinutes(action.at_local);
      if (minutes !== null) {
        bars.push({ action, top: minutesToTop(minutes) - 10, height: 20, left: caffeineLeft, color: getBarColor(action.type), style: getBarStyle(action.type), icon: getBarIcon(action.type) });
      }
    }
  });

  sleepActions.forEach((action) => {
    if (action.start_local && action.end_local) {
      const startMinutes = timeToMinutes(action.start_local);
      const endMinutes = timeToMinutes(action.end_local);
      if (startMinutes !== null && endMinutes !== null) {
        bars.push({ action, top: minutesToTop(startMinutes), height: minutesToHeight(startMinutes, endMinutes), left: sleepLeft, color: getBarColor(action.type), style: getBarStyle(action.type), icon: getBarIcon(action.type) });
      } else {
        console.warn(`[DayTimeline] Invalid sleep times: start=${action.start_local}, end=${action.end_local}`);
      }
    }
  });

  otherActions.forEach((action) => {
    if (action.at_local) {
      const minutes = timeToMinutes(action.at_local);
      if (minutes !== null) {
        bars.push({ action, top: minutesToTop(minutes) - 10, height: 20, left: otherLeft, color: getBarColor(action.type), style: getBarStyle(action.type), icon: getBarIcon(action.type) });
      }
    }
  });

  flightActions.forEach((action) => {
    if (action.start_local && action.end_local) {
      const startMinutes = timeToMinutes(action.start_local);
      const endMinutes = timeToMinutes(action.end_local);
      if (startMinutes !== null && endMinutes !== null) {
        bars.push({ action, top: minutesToTop(startMinutes), height: minutesToHeight(startMinutes, endMinutes), left: otherLeft, color: getBarColor(action.type), style: getBarStyle(action.type), icon: getBarIcon(action.type) });
      }
    }
  });

  const hourLabels = Array.from({ length: 24 }, (_, i) => i);

  return (
    <View style={styles.dayTimelineContainer}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatDate(planDay.date_local)}</Text>
        <View style={styles.locationRow}>
          {isInFlight ? (
            <Ionicons name="airplane" size={14} color="#A19A93" />
          ) : (
            <Ionicons name="time-outline" size={14} color="#A19A93" />
          )}
          <Text style={styles.locationText}>
            {isInFlight ? 'In flight' : planDay.location.label}{' '}
            {planDay.location.tz ? planDay.location.tz.split('/').pop()?.replace('_', ' ') : ''}
          </Text>
        </View>
      </View>

      <View style={styles.timelineChartContainer}>
        <View style={styles.hourLabelsLeft}>
          {hourLabels.map((hour) => (
            <View key={`left-${hour}`} style={[styles.hourLabelRow, { height: HOUR_HEIGHT }]}>
              <Text style={styles.hourLabelText}>{formatHourLabel(hour)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartArea}>
          {hourLabels.map((hour) => (
            <View key={`grid-${hour}`} style={[styles.gridLine, { top: hour * HOUR_HEIGHT }]} />
          ))}
          {bars.map((bar, index) => (
            <ActivityBar key={`bar-${index}`} bar={bar} onPress={onBarPress} />
          ))}
        </View>

        <View style={styles.hourLabelsRight}>
          {hourLabels.map((hour) => (
            <View key={`right-${hour}`} style={[styles.hourLabelRow, { height: HOUR_HEIGHT }]}>
              <Text style={styles.hourLabelText}>{formatHourLabel(hour)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dayTimelineContainer: {
    backgroundColor: '#0B0B0C',
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timelineChartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  hourLabelsLeft: {
    width: 50,
    paddingRight: 8,
  },
  hourLabelsRight: {
    width: 50,
    paddingLeft: 8,
  },
  hourLabelRow: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  hourLabelText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0B0B0C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F1F20',
    marginHorizontal: 8,
    minHeight: CHART_HEIGHT,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#1F1F20',
  },
});
