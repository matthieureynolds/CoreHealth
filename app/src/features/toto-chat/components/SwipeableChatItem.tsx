import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../../shared/context/SettingsContext';
import { AshParticles } from './AshParticles';

interface SwipeableChatItemProps {
  chat: { id: string; title: string; timestamp: Date };
  onPress: () => void;
  onDelete: () => void;
}

export const SwipeableChatItem: React.FC<SwipeableChatItemProps> = ({ chat, onPress, onDelete }) => {
  const { settings } = useSettings();
  const [isDeleting, setIsDeleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [itemLayout, setItemLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleDelete = () => {
    setIsDeleting(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onDelete();
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
      onLayout={(e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        setItemLayout({ x, y, width, height });
      }}
      style={{ position: 'relative' }}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
          <TouchableOpacity style={styles.chatItem} onPress={onPress}>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatTitle}>{chat.title}</Text>
              <Text style={styles.chatTimestamp}>
                {chat.timestamp.toLocaleDateString()}{' '}
                {chat.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: settings?.general?.timeFormat === '12h',
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
      {isDeleting && (
        <View
          style={[
            styles.ashOverlay,
            { position: 'absolute', top: 0, left: 0, width: itemLayout.width || '100%', height: itemLayout.height || 64 },
          ]}
        >
          <AshParticles visible={isDeleting} onComplete={() => {}} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatItem: {
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
  chatTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  chatTimestamp: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
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
  ashOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 1000,
  },
});
