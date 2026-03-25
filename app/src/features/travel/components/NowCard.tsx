import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NowCard as NowCardType } from '../../../shared/types';
import { NowCardLoading, NowCardEmpty, NowCardNoAction } from './components/NowCardStates';
import { NowCardAction } from './components/NowCardAction';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (nowCard?.current_action) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [nowCard?.current_action, pulseAnim]);

  if (isLoading) {
    return <View style={styles.container}><NowCardLoading /></View>;
  }

  if (!nowCard) {
    return <View style={styles.container}><NowCardEmpty /></View>;
  }

  const { current_action, next_action_preview } = nowCard;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.card, current_action && { transform: [{ scale: pulseAnim }] }]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="time-outline" size={20} color="#6b7280" />
            <Text style={styles.headerText}>Jet Lag Plan</Text>
          </View>
          <Text style={styles.timeText}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {current_action ? (
          <NowCardAction
            current_action={current_action}
            next_action_preview={next_action_preview}
            onActionComplete={onActionComplete}
            onSnooze={onSnooze}
          />
        ) : (
          <NowCardNoAction />
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
});
