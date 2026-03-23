import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../../../shared/context/SettingsContext';
import { formatShortDateBySetting } from '../../../../shared/utils/dateFormat';
import { JetLagPlanningEvent } from '../../../../shared/types';

interface JetLagPlanningCardProps {
  event: JetLagPlanningEvent;
  onPress?: () => void; // Optional: whole-card press
  onEditTrip?: () => void; // Open edit when tapping departure
}

const JetLagPlanningCard: React.FC<JetLagPlanningCardProps> = ({ 
  event, 
  onPress,
  onEditTrip,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings } = useSettings();

  const formatDisplayTime = (hhmm: string): string => {
    // hhmm like '21:30'
    try {
      const [h, m] = hhmm.split(':');
      const d = new Date();
      d.setHours(parseInt(h, 10));
      d.setMinutes(parseInt(m, 10));
      return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: settings?.general?.timeFormat === '12h'
      });
    } catch {
      return hhmm;
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatShortDateBySetting(date, settings?.general?.dateFormat || 'DD/MM/YYYY');
  };

  const getStatusTextFor = (evt: JetLagPlanningEvent) => {
    const id = String(evt?.id || '').toLowerCase();
    if (id.endsWith('-return')) return 'Inbound';
    if (id.endsWith('-outbound')) return 'Outbound';
    return 'Outbound';
  };

  const getDirectionIconFor = (evt: JetLagPlanningEvent) => {
    return evt.timeZoneDifference > 0 ? 'arrow-forward' : 'arrow-back';
  };

  const getDirectionTextFor = (evt: JetLagPlanningEvent) => {
    return evt.timeZoneDifference > 0 ? 'Eastward' : 'Westward';
  };

  const statusColor = '#FF9500';

  const renderContent = (evt: JetLagPlanningEvent, onEdit?: () => void) => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <View>
            <Text style={styles.destination}>{evt.destination}</Text>
            <Text style={styles.status}>{getStatusTextFor(evt)}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name={getDirectionIconFor(evt)} size={20} color={statusColor} />
          <Text style={[styles.directionText, { color: statusColor }]}>
            {getDirectionTextFor(evt)}
          </Text>
        </View>
      </View>

      {/* Time difference and preparation info */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoLabel}>Time Difference</Text>
          <Text style={styles.infoValue}>{evt.timeZoneDifference > 0 ? '+' : ''}{evt.timeZoneDifference}h</Text>
        </View>
        <TouchableOpacity style={styles.infoItem} onPress={onEdit} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoLabel}>Departure</Text>
          <Text style={styles.infoValue}>{formatDate(evt.departureDate)}</Text>
        </TouchableOpacity>
        <View style={styles.infoItem}>
          <Ionicons name="bed-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoLabel}>Days to Adjust</Text>
          <Text style={styles.infoValue}>{evt.daysToAdjust}</Text>
        </View>
      </View>

      {/* Preparation schedule preview */}
      <View style={styles.schedulePreview}>
        <Text style={styles.scheduleTitle}>Sleep Adjustment Schedule</Text>
        {evt.sleepAdjustment.dailySchedule.map((day, idx) => {
          const prepStart = new Date(evt.preparationStartDate);
          const thisDate = new Date(prepStart.getTime() + idx * 24 * 60 * 60 * 1000);
          const weekdayNames = ['SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT'];
          const dayLabel = weekdayNames[thisDate.getDay()];
          if (idx < 2 || isExpanded) {
            return (
              <View key={idx} style={styles.scheduleRow}>
                <Text style={styles.scheduleDay}>{dayLabel}:</Text>
                <Text style={styles.scheduleTimeOverlay}>
                  {formatDisplayTime(day.bedtime)} - {formatDisplayTime(day.wakeTime)}
                </Text>
                <Text style={styles.scheduleAdjustment}>
                  {day.adjustment > 0 ? '+' : ''}{day.adjustment}h
                </Text>
              </View>
            );
          }
          return null;
        })}
        {evt.sleepAdjustment.dailySchedule.length > 2 && !isExpanded && (
          <TouchableOpacity style={styles.scheduleMoreContainer} onPress={() => setIsExpanded(true)}>
            <Text style={styles.scheduleMore}>+{evt.sleepAdjustment.dailySchedule.length - 2} more days</Text>
          </TouchableOpacity>
        )}
        {isExpanded && (
          <TouchableOpacity style={styles.scheduleMoreContainer} onPress={() => setIsExpanded(false)}>
            <Text style={styles.scheduleMore}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Preparation start date */}
      <View style={styles.preparationInfo}>
        <Ionicons name="alert-circle-outline" size={16} color={statusColor} />
        <Text style={[styles.preparationText, { color: statusColor }]}>Start adjusting sleep schedule from {formatDate(evt.preparationStartDate)}</Text>
      </View>

    </View>
  );

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {renderContent(event, onEditTrip)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  destination: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  headerRight: {
    alignItems: 'center',
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  schedulePreview: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'space-between',
    position: 'relative',
  },
  scheduleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleDay: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'left',
    marginRight: 8,
    width: 56,
  },
  scheduleTime: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  scheduleTimeOverlay: {
    fontSize: 13,
    color: '#FFFFFF',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  scheduleAdjustment: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
  },
  scheduleMoreContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  scheduleMore: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  preparationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  preparationText: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 6,
    flex: 1,
  },
});

export default JetLagPlanningCard; 