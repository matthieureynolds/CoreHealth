import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, findNodeHandle, Image, Animated } from 'react-native';
import { TortoAvatar } from './TortoAvatar';
import { measureInWindow } from 'react-native-reanimated';
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
        onLayoutMeasured={async (node) => {
          const handle = findNodeHandle(node);
          if (!handle) return;
          
          try {
            const measurement = await measureInWindow(handle);
            const rect = { 
              x: measurement.x, 
              y: measurement.y, 
              w: measurement.width, 
              h: measurement.height 
            };
            
            sendAnim.setEndRect(item.clientId, rect);
            onMessageLayout?.(item.clientId, rect);
          } catch (error) {
            console.error('Error measuring message layout:', error);
          }
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

// Simplified message row component
const MessageRow: React.FC<{
  message: ChatMessage;
  isStreaming: boolean;
  onLayoutMeasured: (node: View | null) => void;
}> = ({ message, isStreaming, onLayoutMeasured }) => {
  const ref = useRef<View>(null);
  const fade = useRef(new Animated.Value(message.role === 'assistant' ? 0 : 1)).current;
  const slideY = useRef(new Animated.Value(message.role === 'assistant' ? 6 : 0)).current;

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
      <View
        ref={ref}
        style={[
          styles.messageContainer,
          message.role === 'user' ? styles.userMessage : styles.assistantMessage
        ]}
      >
        <Animated.Text style={[
          styles.messageText,
          message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
          ,
          message.role === 'assistant' ? { opacity: fade, transform: [{ translateY: slideY }] } : null
        ]}>
          {message.text}
        </Animated.Text>
      </View>
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
