import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanDay, Action } from '../../types';

interface PlanTimelineProps {
  planDays: PlanDay[];
  currentDay?: string; // YYYY-MM-DD format
}

const { width } = Dimensions.get('window');

export const PlanTimeline: React.FC<PlanTimelineProps> = ({
  planDays,
  currentDay,
}) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const getActionIcon = (type: Action['type']) => {
    switch (type) {
      case 'sleep':
        return 'moon-outline';
      case 'seek_light':
        return 'sunny-outline';
      case 'avoid_light':
        return 'eye-off-outline';
      case 'caffeine_ok':
        return 'cafe-outline';
      case 'caffeine_cutoff':
        return 'cafe-outline';
      case 'melatonin':
        return 'medical-outline';
      case 'nap':
        return 'bed-outline';
      default:
        return 'time-outline';
    }
  };

  const getActionColor = (type: Action['type']) => {
    switch (type) {
      case 'sleep':
        return '#6366f1';
      case 'seek_light':
        return '#f59e0b';
      case 'avoid_light':
        return '#6b7280';
      case 'caffeine_ok':
        return '#92400e';
      case 'caffeine_cutoff':
        return '#dc2626';
      case 'melatonin':
        return '#7c3aed';
      case 'nap':
        return '#059669';
      default:
        return '#374151';
    }
  };

  const getActionLabel = (action: Action) => {
    switch (action.type) {
      case 'sleep':
        return 'Sleep';
      case 'seek_light':
        return 'Seek bright light';
      case 'avoid_light':
        return 'Avoid light';
      case 'caffeine_ok':
        return 'Caffeine OK';
      case 'caffeine_cutoff':
        return 'Caffeine cutoff';
      case 'melatonin':
        return 'Take melatonin';
      case 'nap':
        return 'Nap';
      default:
        return action.type;
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const min = parseInt(minutes);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'pre':
        return 'Pre-travel';
      case 'in_flight':
        return 'In flight';
      case 'post':
        return 'Post-arrival';
      case 'layover':
        return 'Layover';
      default:
        return segment;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'pre':
        return '#f59e0b';
      case 'in_flight':
        return '#6366f1';
      case 'post':
        return '#059669';
      case 'layover':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  };

  const isCurrentDay = (date: string) => {
    return currentDay === date;
  };

  const renderAction = (action: Action, index: number) => {
    const isPointInTime = action.at_local && !action.start_local;
    const timeDisplay = isPointInTime ? action.at_local : `${action.start_local} - ${action.end_local}`;

    return (
      <View key={index} style={styles.actionItem}>
        <View style={styles.actionHeader}>
          <View style={styles.actionIconContainer}>
            <Ionicons
              name={getActionIcon(action.type)}
              size={16}
              color={getActionColor(action.type)}
            />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>{getActionLabel(action)}</Text>
            <Text style={styles.actionTime}>{formatTime(timeDisplay)}</Text>
          </View>
          {action.intensity && (
            <View style={[
              styles.intensityBadge,
              { backgroundColor: getActionColor(action.type) + '20' }
            ]}>
              <Text style={[
                styles.intensityText,
                { color: getActionColor(action.type) }
              ]}>
                {action.intensity}
              </Text>
            </View>
          )}
        </View>
        {action.rationale && (
          <Text style={styles.actionRationale}>{action.rationale}</Text>
        )}
      </View>
    );
  };

  const renderPlanDay = (planDay: PlanDay, index: number) => {
    const isExpanded = expandedDay === planDay.id;
    const isCurrent = isCurrentDay(planDay.date_local);

    return (
      <View key={planDay.id} style={styles.dayContainer}>
        {/* Day Header */}
        <TouchableOpacity
          style={[
            styles.dayHeader,
            isCurrent && styles.currentDayHeader,
          ]}
          onPress={() => setExpandedDay(isExpanded ? null : planDay.id)}
        >
          <View style={styles.dayHeaderLeft}>
            <View style={[
              styles.segmentBadge,
              { backgroundColor: getSegmentColor(planDay.location.segment) }
            ]}>
              <Text style={styles.segmentText}>
                {getSegmentLabel(planDay.location.segment)}
              </Text>
            </View>
            <View>
              <Text style={[
                styles.dayTitle,
                isCurrent && styles.currentDayTitle
              ]}>
                {formatDate(planDay.date_local)}
              </Text>
              <Text style={styles.dayLocation}>{planDay.location.label}</Text>
            </View>
          </View>
          <View style={styles.dayHeaderRight}>
            <Text style={styles.actionCount}>
              {planDay.actions.length} actions
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#6b7280"
            />
          </View>
        </TouchableOpacity>

        {/* Day Content */}
        {isExpanded && (
          <View style={styles.dayContent}>
            {/* Actions */}
            <View style={styles.actionsContainer}>
              {planDay.actions.map((action, actionIndex) =>
                renderAction(action, actionIndex)
              )}
            </View>

            {/* Notes */}
            {planDay.notes.length > 0 && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesTitle}>Notes</Text>
                {planDay.notes.map((note, noteIndex) => (
                  <Text key={noteIndex} style={styles.noteText}>
                    • {note}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.timeline}>
        {planDays.map((planDay, index) => renderPlanDay(planDay, index))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  timeline: {
    padding: 16,
  },
  dayContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  currentDayHeader: {
    backgroundColor: '#f0f9ff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  segmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  currentDayTitle: {
    color: '#059669',
  },
  dayLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCount: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  dayContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionItem: {
    marginBottom: 12,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  actionTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  intensityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  intensityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRationale: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginLeft: 44,
    lineHeight: 16,
  },
  notesContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 4,
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
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
