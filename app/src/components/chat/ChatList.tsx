import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, findNodeHandle, UIManager, Image, Animated, Easing } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { TortoAvatar } from './TortoAvatar';
import { useSendAnimation } from '../../hooks/useSendAnimation';
import { AnimatedOutgoing } from './AnimatedOutgoing';
import { shouldReduceMotion } from '../../lib/reduceMotion';

export interface ChatMessage {
  id: string;
  clientId: string;
  text: string;
  role: 'user' | 'assistant';
  status?: 'sending' | 'sent';
  timestamp: Date;
}

interface ChatListProps {
  messages: ChatMessage[];
  onMessageLayout?: (clientId: string, rect: { x: number; y: number; w: number; h: number }) => void;
  streamingId?: string; // assistant message currently streaming
}

export const ChatList: React.FC<ChatListProps> = ({ messages, onMessageLayout, streamingId }) => {
  const sendAnim = useSendAnimation();
  const [flying, setFlying] = useState<null | { 
    clientId: string; 
    text: string; 
    startRect: { x: number; y: number; w: number; h: number };
    endRect: { x: number; y: number; w: number; h: number };
  }>(null);

  const renderMessage = useCallback((item: ChatMessage) => {
    // Add safety checks
    if (!item || !item.id || !item.text || !item.role) {
      console.warn('Invalid message item:', item);
      return null;
    }

    return (
      <MessageRow
        key={item.id}
        message={item}
        isStreaming={streamingId === item.id}
        onLayoutMeasured={(node) => {
          const handle = findNodeHandle(node);
          if (!handle) return;
          UIManager.measureInWindow(handle, (x, y, width, height) => {
            const rect = { x, y, w: width, h: height };
            sendAnim.setEndRect(item.clientId, rect);
            onMessageLayout?.(item.clientId, rect);
          });
        }}
      />
    );
  }, [sendAnim, onMessageLayout]);

  // Simplified - no animation for now

  const handleAnimationFinished = useCallback(() => {
    setFlying(null);
  }, []);

  return (
    <View style={styles.container}>
      {messages.length > 0 ? (
        messages.map(renderMessage)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Start a conversation with your Health Assistant</Text>
        </View>
      )}
    </View>
  );
};

// Format timestamp for display
const formatTimestamp = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

// Simplified message row component
const MessageRow: React.FC<{
  message: ChatMessage;
  isStreaming: boolean;
  onLayoutMeasured: (node: View | null) => void;
}> = ({ message, isStreaming, onLayoutMeasured }) => {
  const ref = useRef<View>(null);
  const fade = useRef(new Animated.Value(message.role === 'assistant' ? 0 : 1)).current;
  const slideY = useRef(new Animated.Value(message.role === 'assistant' ? 6 : 0)).current;

  // Swipe-to-reveal timestamp for user messages
  const translateX = useRef(new Animated.Value(0)).current;
  const timestampOpacity = useRef(new Animated.Value(0)).current;
  const MAX_SWIPE_DISTANCE = -58; // enough to reveal full timestamp (e.g. "12 PM") without overdoing it

  useEffect(() => {
    if (message.role !== 'assistant') return;
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 180, useNativeDriver: true })
    ]).start();
  }, []);

  useEffect(() => {
    if (message.role !== 'assistant') return;
    fade.setValue(0.88);
    slideY.setValue(4);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 140, useNativeDriver: true })
    ]).start();
  }, [message.text]);

  // Handle pan gesture for user messages
  const lastTranslationX = useRef(0);
  
  const onGestureEvent = (event: any) => {
    const translationX = event.nativeEvent.translationX;
    
    // Only allow left swipe (negative values)
    if (translationX > 0) {
      translateX.setValue(0);
      timestampOpacity.setValue(0);
      lastTranslationX.current = 0;
      return;
    }
    
    // Clamp to max distance
    const clampedX = Math.max(translationX, MAX_SWIPE_DISTANCE);
    translateX.setValue(clampedX);
    lastTranslationX.current = clampedX;
    
    // Calculate timestamp opacity based on drag progress (0 to 1)
    const progress = Math.abs(clampedX) / Math.abs(MAX_SWIPE_DISTANCE);
    timestampOpacity.setValue(progress);
  };

  const onHandlerStateChange = (event: any) => {
    const { state, translationX } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      // Gesture is active, already handled in onGestureEvent
      return;
    }
    
    if (state === State.END || state === State.CANCELLED) {
      // Spring back to original position
      translateX.setValue(lastTranslationX.current);
      timestampOpacity.setValue(Math.abs(lastTranslationX.current) / Math.abs(MAX_SWIPE_DISTANCE));
      
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
        Animated.spring(timestampOpacity, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
      ]).start();
      
      lastTranslationX.current = 0;
    }
  };

  const messageBubble = (
    <Animated.View
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessage : styles.assistantMessage,
        message.role === 'user' && {
          transform: [{ translateX }],
        },
      ]}
    >
      <Animated.Text style={[
        styles.messageText,
        message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
        message.role === 'assistant' ? { opacity: fade, transform: [{ translateY: slideY }] } : null
      ]}>
        {message.text}
      </Animated.Text>
    </Animated.View>
  );

  return (
    <View style={[
      styles.messageRow,
      message.role === 'user' ? styles.rowRight : styles.rowLeft
    ]}>
      {message.role === 'assistant' && (
        <View style={styles.avatarContainer}>
          <TortoAvatar state={isStreaming ? 'talking' : 'idle'} size={28} />
        </View>
      )}
      
      {message.role === 'user' ? (
        <View style={styles.userMessageWrapper}>
          {/* Swipeable message bubble */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            activeOffsetX={[-10, 10]} // Activate when swiping horizontally
            failOffsetY={[-5, 5]} // Fail if swiping vertically more than 5dp
          >
            <Animated.View>
              {messageBubble}
            </Animated.View>
          </PanGestureHandler>
          
          {/* Timestamp that appears on the right side as user swipes */}
          <Animated.View style={[styles.timestampContainer, { opacity: timestampOpacity }]}>
            <Text style={styles.timestampText}>
              {formatTimestamp(message.timestamp)}
            </Text>
          </Animated.View>
        </View>
      ) : (
        <View ref={ref} onLayout={() => onLayoutMeasured(ref.current)}>
          {messageBubble}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  rowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  rowRight: {
    alignSelf: 'flex-end',
  },
  userMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  timestampContainer: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    pointerEvents: 'none',
  },
  timestampText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#FFFFFF',
  },
  sendingIndicator: {
    marginTop: 4,
    opacity: 0.7,
  },
  sendingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
});
