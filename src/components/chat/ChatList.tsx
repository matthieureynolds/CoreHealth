import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, findNodeHandle } from 'react-native';
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
}

export const ChatList: React.FC<ChatListProps> = ({ messages, onMessageLayout }) => {
  const sendAnim = useSendAnimation();
  const [flying, setFlying] = useState<null | { 
    clientId: string; 
    text: string; 
    startRect: { x: number; y: number; w: number; h: number };
    endRect: { x: number; y: number; w: number; h: number };
  }>(null);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    // Add safety checks
    if (!item || !item.id || !item.text || !item.role) {
      console.warn('Invalid message item:', item);
      return null;
    }

    return (
      <MessageRow
        key={item.id}
        message={item}
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
  onLayoutMeasured: (node: View | null) => void;
}> = ({ message, onLayoutMeasured }) => {
  const ref = useRef<View>(null);

  return (
    <View
      ref={ref}
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessage : styles.assistantMessage
      ]}
    >
      <Text style={[
        styles.messageText,
        message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {message.text}
      </Text>
      {message.status === 'sending' && (
        <View style={styles.sendingIndicator}>
          <Text style={styles.sendingText}>Sending...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderBottomLeftRadius: 4,
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
