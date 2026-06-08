import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { HealthAssistantService, type ChatSession } from '../../../shared/services/ai/healthAssistantService';

interface SessionItemProps {
  session: ChatSession;
  onPress: (session: ChatSession) => void;
  onDeleted: (id: string) => void;
  onAshStart?: (pageY: number) => void;
}

export const SessionItem: React.FC<SessionItemProps> = ({ session, onPress, onDeleted, onAshStart }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const viewRef = useRef<View>(null);

  const handleDelete = () => {
    setIsDeleting(true);
    // Measure position on screen and notify parent to render ash at drawer root
    viewRef.current?.measureInWindow((_x, pageY, _w, h) => {
      onAshStart?.(pageY + h / 2);
    });
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(async () => {
      await HealthAssistantService.deleteChatSession(session.id);
      onDeleted(session.id);
    });
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <RectButton style={styles.deleteButton} onPress={handleDelete}>
        <Animated.View style={[styles.deleteContent, { transform: [{ scale }] }]}>
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <View
      ref={viewRef}
      style={{ position: 'relative' }}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
          <TouchableOpacity style={styles.sessionItem} onPress={() => onPress(session)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionTitle}>{session.title || 'Chat'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 8,
    height: 64,
  },
  sessionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 96,
    height: 64,
    borderRadius: 12,
    marginBottom: 8,
  },
  deleteContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
