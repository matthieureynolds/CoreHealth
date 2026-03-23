import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NowCard as NowCardType } from '../../../shared/types';

interface NowCardProps {
  nowCard: NowCardType | null;
  onActionComplete: () => void;
  onSnooze: () => void;
  isLoading?: boolean;
}

export const NowCard: React.FC<NowCardProps> = ({
  nowCard,
  onActionComplete,
  onSnooze,
  isLoading = false,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Pulse animation for active actions
  useEffect(() => {
    if (nowCard?.current_action) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [nowCard?.current_action, pulseAnim]);

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'sleep':
        return 'moon-outline';
      case 'seek bright light':
        return 'sunny-outline';
      case 'avoid light':
        return 'eye-off-outline';
      case 'caffeine ok':
        return 'cafe-outline';
      case 'caffeine cutoff':
        return 'cafe-outline';
      case 'take melatonin':
        return 'medical-outline';
      case 'nap':
        return 'bed-outline';
      default:
        return 'time-outline';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'sleep':
        return '#6366f1'; // Indigo
      case 'seek bright light':
        return '#f59e0b'; // Amber
      case 'avoid light':
        return '#6b7280'; // Gray
      case 'caffeine ok':
        return '#92400e'; // Brown
      case 'caffeine cutoff':
        return '#dc2626'; // Red
      case 'take melatonin':
        return '#7c3aed'; // Purple
      case 'nap':
        return '#059669'; // Emerald
      default:
        return '#374151'; // Gray
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const min = parseInt(minutes);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
    } catch {
      return timeString;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Generating your plan...</Text>
        </View>
      </View>
    );
  }

  if (!nowCard) {
    return (
      <View style={styles.container}>
        <View style={styles.noPlanCard}>
          <Ionicons name="airplane-outline" size={32} color="#6b7280" />
          <Text style={styles.noPlanTitle}>No Active Trip</Text>
          <Text style={styles.noPlanSubtitle}>
            Create a trip plan to get personalized jet lag guidance
          </Text>
        </View>
      </View>
    );
  }

  const { current_action, next_action_preview } = nowCard;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          current_action && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="time-outline" size={20} color="#6b7280" />
            <Text style={styles.headerText}>Jet Lag Plan</Text>
          </View>
          <Text style={styles.timeText}>
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Current Action */}
        {current_action ? (
          <View style={styles.currentAction}>
            <View style={styles.actionHeader}>
              <Ionicons
                name={getActionIcon(current_action.label)}
                size={24}
                color={getActionColor(current_action.label)}
              />
              <Text style={styles.actionLabel}>{current_action.label}</Text>
            </View>

            <Text style={styles.actionExplanation}>
              {current_action.explain}
            </Text>

            <View style={styles.actionWindow}>
              <Text style={styles.windowText}>
                Until {formatTime(current_action.window.end_local)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.doneButton]}
                onPress={onActionComplete}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.snoozeButton]}
                onPress={onSnooze}
              >
                <Ionicons name="alarm-outline" size={16} color="#6b7280" />
                <Text style={styles.snoozeText}>Snooze</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noCurrentAction}>
            <Ionicons name="checkmark-circle" size={32} color="#059669" />
            <Text style={styles.noActionTitle}>All caught up!</Text>
            <Text style={styles.noActionSubtitle}>
              No actions needed right now
            </Text>
          </View>
        )}

        {/* Next Action Preview */}
        {next_action_preview && (
          <View style={styles.nextAction}>
            <Text style={styles.nextActionLabel}>Coming up:</Text>
            <Text style={styles.nextActionText}>{next_action_preview}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  noPlanCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  noPlanSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  currentAction: {
    marginBottom: 16,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  actionExplanation: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionWindow: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  windowText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  doneButton: {
    backgroundColor: '#059669',
  },
  snoozeButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  snoozeText: {
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 6,
  },
  noCurrentAction: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  noActionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  nextAction: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  nextActionLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nextActionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});
