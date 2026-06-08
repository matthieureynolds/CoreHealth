import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NowCardActionItem {
  label: string;
  explain: string;
  window: { end_local: string };
}

interface NowCardActionProps {
  current_action: NowCardActionItem;
  next_action_preview?: string;
  onActionComplete: () => void;
  onSnooze: () => void;
}

const getActionIcon = (actionType: string): any => {
  switch (actionType.toLowerCase()) {
    case 'sleep': return 'moon-outline';
    case 'seek bright light': return 'sunny-outline';
    case 'avoid light': return 'eye-off-outline';
    case 'caffeine ok': return 'cafe-outline';
    case 'caffeine cutoff': return 'cafe-outline';
    case 'take melatonin': return 'medical-outline';
    case 'nap': return 'bed-outline';
    default: return 'time-outline';
  }
};

const getActionColor = (actionType: string): string => {
  switch (actionType.toLowerCase()) {
    case 'sleep': return '#6366f1';
    case 'seek bright light': return '#f59e0b';
    case 'avoid light': return '#6b7280';
    case 'caffeine ok': return '#92400e';
    case 'caffeine cutoff': return '#dc2626';
    case 'take melatonin': return '#7c3aed';
    case 'nap': return '#059669';
    default: return '#374151';
  }
};

const formatTime = (timeString: string): string => {
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

export const NowCardAction: React.FC<NowCardActionProps> = ({
  current_action,
  next_action_preview,
  onActionComplete,
  onSnooze,
}) => (
  <>
    <View style={styles.currentAction}>
      <View style={styles.actionHeader}>
        <Ionicons
          name={getActionIcon(current_action.label)}
          size={24}
          color={getActionColor(current_action.label)}
        />
        <Text style={styles.actionLabel}>{current_action.label}</Text>
      </View>
      <Text style={styles.actionExplanation}>{current_action.explain}</Text>
      <View style={styles.actionWindow}>
        <Text style={styles.windowText}>
          Until {formatTime(current_action.window.end_local)}
        </Text>
      </View>
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

    {next_action_preview && (
      <View style={styles.nextAction}>
        <Text style={styles.nextActionLabel}>Coming up:</Text>
        <Text style={styles.nextActionText}>{next_action_preview}</Text>
      </View>
    )}
  </>
);

const styles = StyleSheet.create({
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
