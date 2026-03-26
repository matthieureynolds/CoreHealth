import React, { RefObject } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HealthChatMessage } from '../../../../../shared/services/ai/healthAssistantService';
import { formatTimeBySetting, formatShortDateBySetting } from '../../../../../shared/utils/dateFormat';

interface Props {
  messages: HealthChatMessage[];
  isInitializing: boolean;
  isLoading: boolean;
  scrollViewRef: RefObject<ScrollView | null>;
  timeFormat: '12h' | '24h';
  dateFormat: import('../../../../../shared/utils/dateFormat').DatePattern;
}

const MessageList: React.FC<Props> = ({
  messages,
  isInitializing,
  isLoading,
  scrollViewRef,
  timeFormat,
  dateFormat,
}) => (
  <ScrollView
    ref={scrollViewRef}
    style={styles.messagesContainer}
    contentContainerStyle={styles.messagesContent}
    showsVerticalScrollIndicator={false}
  >
    {isInitializing ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3AABF0" />
        <Text style={styles.loadingText}>Preparing your personalized health assistant...</Text>
      </View>
    ) : (
      messages.map(m => {
        const isUser = m.role === 'user';
        return (
          <View key={m.id} style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
              {!isUser && (
                <View style={styles.assistantIcon}>
                  <Ionicons name="sparkles" size={16} color="#3AABF0" />
                </View>
              )}
              <View style={styles.messageContent}>
                <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
                  {m.content}
                </Text>
                {isUser && (
                  <Text style={[styles.messageTime, styles.userMessageTime]}>
                    {`${formatTimeBySetting(m.timestamp, timeFormat)} ${formatShortDateBySetting(m.timestamp, dateFormat)}`}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })
    )}

    {isLoading && (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBubble}>
          <ActivityIndicator size="small" color="#3AABF0" />
          <Text style={styles.loadingText}>Analyzing your health data...</Text>
        </View>
      </View>
    )}
  </ScrollView>
);

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F2F4F7',
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    flexDirection: 'row',
    maxWidth: '85%',
    alignItems: 'flex-start',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    backgroundColor: '#2563EB',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  assistantMessageText: {
    backgroundColor: '#fff',
    color: '#0B1220',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    overflow: 'hidden',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: '#8E8E93',
    textAlign: 'right',
    marginRight: 16,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
});

export default MessageList;
