import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SessionItem } from '../../components/SessionItem';
import type { ChatSession } from '../../../../shared/services/ai/healthAssistantService';

interface ChatHistoryDrawerProps {
  visible: boolean;
  chatSessions: ChatSession[];
  historyLoading: boolean;
  historyError: string | null;
  onClose: () => void;
  onLoadSession: (session: ChatSession) => void;
  onSessionDeleted: (id: string) => void;
  onRetry: () => void;
  styles: typeof import('../HealthAssistantScreen.styles').styles;
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  visible,
  chatSessions,
  historyLoading,
  historyError,
  onClose,
  onLoadSession,
  onSessionDeleted,
  onRetry,
  styles,
}) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={styles.chatDrawer}>
          <View style={styles.chatDrawerHeader}>
            <Text style={styles.chatDrawerTitle}>Chat History</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {historyLoading && (
              <View style={styles.centeredFill}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.mutedText}>Loading previous chat…</Text>
              </View>
            )}
            {!historyLoading && historyError && (
              <View style={styles.centeredFill}>
                <Text style={{ color: '#FF453A' }}>{historyError}</Text>
                <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
                  <Text style={{ color: '#FFFFFF' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {!historyLoading && !historyError && (
              chatSessions && chatSessions.length > 0 ? (
                <ScrollView>
                  {chatSessions
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .map(session => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        onPress={onLoadSession}
                        onDeleted={onSessionDeleted}
                      />
                    ))}
                </ScrollView>
              ) : (
                <View style={styles.centeredFill}>
                  <Text style={styles.mutedText}>No previous chats yet.</Text>
                </View>
              )
            )}
          </View>
        </View>
        <TouchableOpacity
          style={{ position: 'absolute', right: 0, top: 0, width: '25%', height: '100%' }}
          onPress={onClose}
        />
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

export default ChatHistoryDrawer;
