import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useSettings } from '../../../../shared/context/SettingsContext';
import { useAuth } from '../../../../shared/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthData } from '../../../../shared/context/HealthDataContext';
import {
  HealthAssistantService,
  HealthChatMessage,
  OPENAI_API_KEY,
} from '../../../../shared/services/ai/healthAssistantService';
import ChatHeader from './components/ChatHeader';
import HealthContextBar from './components/HealthContextBar';
import MessageList from './components/MessageList';
import QuickQuestions from './components/QuickQuestions';
import ChatInput from './components/ChatInput';

interface HealthChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const HealthChatModal: React.FC<HealthChatModalProps> = ({ visible, onClose }) => {
  const { profile, biomarkers, healthScore, deviceData, labResults, bodySystems, travelHealth } = useHealthData();
  const { settings } = useSettings();
  const { user } = useAuth();

  const [messages, setMessages] = useState<HealthChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && messages.length === 0) {
      initializeChat();
    }
  }, [visible]);

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const buildProfileForAI = () =>
    profile
      ? {
          ...profile,
          displayName: (profile as any)?.displayName || (user as any)?.displayName,
          preferredName: (profile as any)?.preferredName || (user as any)?.preferredName,
          firstName: (profile as any)?.firstName || (user as any)?.firstName,
          surname: (profile as any)?.surname || (user as any)?.surname,
          email: (profile as any)?.email || (user as any)?.email,
        }
      : user
      ? ({ displayName: (user as any)?.displayName, preferredName: (user as any)?.preferredName, email: (user as any)?.email } as any)
      : null;

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      const existingHistory = await HealthAssistantService.loadConversationHistory();
      if (existingHistory.length > 0) {
        setMessages(existingHistory);
      } else {
        const personalizedGreeting = await HealthAssistantService.getPersonalizedGreeting(
          buildProfileForAI() as any,
          biomarkers,
          healthScore
        );
        const welcomeMessage: HealthChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: personalizedGreeting,
          timestamp: new Date(),
          metadata: {
            healthDataSnapshot: { healthScore: healthScore?.overall, biomarkerCount: biomarkers?.length || 0, lastUpdate: new Date() },
            topics: ['greeting', 'introduction'],
          },
        };
        setMessages([welcomeMessage]);
        await HealthAssistantService.saveConversationHistory([welcomeMessage]);
      }
    } catch {
      const fallbackMessage: HealthChatMessage = {
        id: 'welcome-fallback',
        role: 'assistant',
        content:
          "Hello! I'm Toto. How can I help you today? I'm an AI health assistant for educational information and support — not a substitute for professional medical advice. Always consult your doctor for diagnosis or treatment.",
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsInitializing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: HealthChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      metadata: {
        healthDataSnapshot: { healthScore: healthScore?.overall, biomarkerCount: biomarkers?.length || 0, lastUpdate: new Date() },
      },
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await HealthAssistantService.chatWithAssistant(
        userMessage.content,
        [...messages, userMessage],
        { profile: buildProfileForAI() as any, biomarkers, healthScore, deviceData, settings, labResults, bodySystems, travelHealth }
      );

      setIsStreaming(true);
      const assistantId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);
      const words = responseText.split(' ');
      let current = '';
      for (let i = 0; i < words.length; i++) {
        current += (i ? ' ' : '') + words[i];
        setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: current } : m)));
        await new Promise(res => setTimeout(res, 25 + Math.random() * 60));
      }
    } catch {
      Alert.alert('Connection Error', 'Failed to get response from health assistant. Please check your internet connection and try again.');
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7 });
      if (!res.canceled && res.assets?.length) {
        setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: '[Image attached]', timestamp: new Date() }]);
      }
    } catch (e) {
      console.error('Image pick error:', e);
    } finally {
      setShowAttach(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) {
        const asset = res.assets[0];
        setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: asset.name || '[Document attached]', timestamp: new Date() }]);
      }
    } catch (e) {
      console.error('Document pick error:', e);
    } finally {
      setShowAttach(false);
    }
  };

  const handleVoice = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to use voice input.');
        return;
      }
      if (isRecording) {
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          recordingRef.current = null;
          setIsRecording(false);
          if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
          setRecordingDuration(0);
          if (uri) {
            const form = new FormData();
            form.append('file', { uri, name: 'audio.m4a', type: 'audio/m4a' } as unknown as Blob);
            form.append('model', 'gpt-4o-transcribe');
            form.append('response_format', 'json');
            try {
              const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
                body: form as any,
              });
              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              setInputText((data.text ?? '').trim());
            } catch (txErr) {
              console.error('Transcription error:', txErr);
              Alert.alert('Transcription failed', 'Could not transcribe audio.');
            }
          }
        }
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        recordingRef.current = recording;
        setIsRecording(true);
        setRecordingDuration(0);
        recordingTimer.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
      }
    } catch (e) {
      console.error('Voice error:', e);
      setIsRecording(false);
      recordingRef.current = null;
      if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
      setRecordingDuration(0);
    }
  };

  const clearConversation = async () => {
    Alert.alert(
      'Clear Conversation',
      'This will clear all conversation history and start fresh. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await HealthAssistantService.clearConversationMemory();
            setMessages([]);
            initializeChat();
          },
        },
      ]
    );
  };

  const timeFormat = settings?.general?.timeFormat === '12h' ? '12h' : '24h';
  const dateFormat = settings?.general?.dateFormat || 'DD/MM/YYYY';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ChatHeader onClear={clearConversation} onClose={onClose} />

          <HealthContextBar
            healthScore={healthScore}
            biomarkerCount={biomarkers?.length}
          />

          <MessageList
            messages={messages}
            isInitializing={isInitializing}
            isLoading={isLoading}
            scrollViewRef={scrollViewRef}
            timeFormat={timeFormat}
            dateFormat={dateFormat}
          />

          {messages.length <= 2 && !isInitializing && (
            <QuickQuestions
              healthScore={healthScore}
              biomarkerCount={biomarkers?.length}
              onSelect={setInputText}
            />
          )}

          <ChatInput
            inputText={inputText}
            onChangeText={setInputText}
            isLoading={isLoading}
            isInitializing={isInitializing}
            isStreaming={isStreaming}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            showAttach={showAttach}
            onToggleAttach={() => setShowAttach(v => !v)}
            onSend={sendMessage}
            onVoice={handleVoice}
            onPickImage={handlePickImage}
            onPickDocument={handlePickDocument}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default HealthChatModal;
