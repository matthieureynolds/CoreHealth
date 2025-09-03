import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JetLagPlanningEvent } from '../../types';

interface JetLagPlanningCardProps {
  event: JetLagPlanningEvent;
  onPress?: () => void;
}

const JetLagPlanningCard: React.FC<JetLagPlanningCardProps> = ({ 
  event, 
  onPress 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getDaysUntilDeparture = () => {
    const now = new Date();
    const departure = new Date(event.departureDate);
    const diffTime = departure.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = () => {
    const daysUntil = getDaysUntilDeparture();
    if (daysUntil <= 0) return '#FF3B30'; // Red for active/completed
    if (daysUntil <= 7) return '#FF9500'; // Orange for urgent
    return '#30D158'; // Green for upcoming
  };

  const getStatusText = () => {
    const daysUntil = getDaysUntilDeparture();
    if (daysUntil <= 0) return 'Active';
    if (daysUntil <= 7) return 'Work';
    return 'Upcoming';
  };

  const getDirectionIcon = () => {
    return event.timeZoneDifference > 0 ? 'arrow-forward' : 'arrow-back';
  };

  const getDirectionText = () => {
    return event.timeZoneDifference > 0 ? 'Eastward' : 'Westward';
  };

  const statusColor = getStatusColor();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: statusColor + '40' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <View>
            <Text style={styles.destination}>{event.destination}</Text>
            <Text style={styles.status}>{getStatusText()}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name={getDirectionIcon()} size={20} color={statusColor} />
          <Text style={[styles.directionText, { color: statusColor }]}>
            {getDirectionText()}
          </Text>
        </View>
      </View>

      {/* Time difference and preparation info */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoLabel}>Time Difference</Text>
          <Text style={styles.infoValue}>
            {Math.abs(event.timeZoneDifference)}h
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoLabel}>Departure</Text>
          <Text style={styles.infoValue}>
            {formatDate(event.departureDate)}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="bed-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoLabel}>Days to Adjust</Text>
          <Text style={styles.infoValue}>
            {event.daysToAdjust}
          </Text>
        </View>
      </View>

      {/* Preparation schedule preview */}
      <View style={styles.schedulePreview}>
        <Text style={styles.scheduleTitle}>Sleep Adjustment Schedule</Text>
        {event.sleepAdjustment.dailySchedule.map((day, idx) => {
          // Calculate the date for this day
          const prepStart = new Date(event.preparationStartDate);
          const thisDate = new Date(prepStart.getTime() + idx * 24 * 60 * 60 * 1000);
          const dayLabel = thisDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
          if (idx < 2) {
            return (
              <View key={idx} style={styles.scheduleRow}>
                <Text style={styles.scheduleDay}>{dayLabel}: {day.bedtime} - {day.wakeTime}</Text>
                <Text style={styles.scheduleAdjustment}>
                  {day.adjustment > 0 ? '+' : ''}{day.adjustment}h
                </Text>
              </View>
            );
          }
          return null;
        })}
        {event.sleepAdjustment.dailySchedule.length > 2 && (
          <Text style={styles.scheduleMore}>
            +{event.sleepAdjustment.dailySchedule.length - 2} more days...
          </Text>
        )}
      </View>

      {/* Preparation start date */}
      <View style={styles.preparationInfo}>
        <Ionicons name="alert-circle-outline" size={16} color="#FF9500" />
        <Text style={styles.preparationText}>
          Start adjusting sleep schedule from {formatDate(event.preparationStartDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    justifyContent: 'space-between',
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
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleDay: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  scheduleAdjustment: {
    fontSize: 13,
    color: '#30D158',
    fontWeight: '600',
  },
  scheduleMore: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 4,
  },
  preparationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF950020',
    borderRadius: 8,
    padding: 8,
  },
  preparationText: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 6,
    flex: 1,
  },
});

export default JetLagPlanningCard; 