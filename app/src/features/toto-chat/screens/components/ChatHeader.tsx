import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TotoOrb } from '../../components/TotoOrb';

interface ChatHeaderProps {
  isLoading: boolean;
  streamingMessageId: string | null;
  onMenuPress: () => void;
  onNewChatPress: () => void;
  styles: typeof import('../HealthAssistantScreen.styles').styles;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isLoading,
  streamingMessageId,
  onMenuPress,
  onNewChatPress,
  styles,
}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onMenuPress} style={{ marginRight: 12 }}>
      <Ionicons name="menu" size={28} color="#fff" />
    </TouchableOpacity>
    <View style={styles.headerContent}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TotoOrb state={isLoading ? 'thinking' : streamingMessageId ? 'streaming' : 'idle'} size={32} />
        <View style={{ marginLeft: 4 }}>
          <Text style={styles.headerTitle}>Toto</Text>
          <Text style={styles.headerSubtitle}>Your AI health companion</Text>
        </View>
      </View>
    </View>
    <TouchableOpacity onPress={onNewChatPress} style={{ marginLeft: 12 }}>
      <Ionicons name="create-outline" size={26} color="#fff" />
    </TouchableOpacity>
  </View>
);

export default ChatHeader;
