import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
  Easing,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSettings } from '../../../shared/context/SettingsContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { OPENAI_API_KEY, HealthAssistantService } from '../../../shared/services/ai/healthAssistantService';
import type { ChatSession } from '../../../shared/services/ai/healthAssistantService';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { MessageComposer } from '../components/MessageComposer';
import { ChatList } from '../components/ChatList';
import { useSendAnimation } from '../../../shared/hooks/useSendAnimation';
import { TelegramMediaPicker } from '../components/TelegramMediaPicker';
import { parseAssistantCommand } from '../assistant/parser';
import { dispatch as dispatchCommand, postTimeline, togglesMark } from '../assistant/commandBus';
import type { Command } from '../assistant/commandBus';
import { DateTimeCollector, SeverityCollector, MgCollector } from '../components/InlineSlots';
import { SymptomPlan } from '../components/SymptomPlan';
import { TotoOrb } from '../components/TotoOrb';
import { TortoAvatar } from '../components/TortoAvatar';
import { AshParticles } from '../components/AshParticles';
import { SessionItem } from '../components/SessionItem';
import { supabase } from '../../../shared/config/supabase';
import type { ChatMessage } from '../types';

const HealthAssistantScreen: React.FC = () => {
  const { profile, biomarkers, healthScore, deviceData, labResults, bodySystems, travelHealth } = useHealthData();
  const { settings } = useSettings();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inputText, setInputText] = useState('');
  const sendAnim = useSendAnimation();
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollEnabledRef = useRef<boolean>(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const newChatModalTranslateY = useRef(new Animated.Value(1000)).current;
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [currentChatHasMemory, setCurrentChatHasMemory] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Ash animation when switching to a no-memory chat
  const [showMessagesAshAnimation, setShowMessagesAshAnimation] = useState(false);
  const messagesFadeAnim = useRef(new Animated.Value(1)).current;
  const messagesContainerRef = useRef<View>(null);
  const [messagesContainerLayout, setMessagesContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Audio recording
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const waveformTimer = useRef<NodeJS.Timeout | null>(null);
  const waveformAnimValues = useRef(Array.from({ length: 24 }, () => new Animated.Value(0.3))).current;
  const recordingPulseAnim = useRef(new Animated.Value(1)).current;

  const idSeqRef = useRef(0);
  const generateId = (prefix: string) => {
    idSeqRef.current += 1;
    return `${prefix}_${Date.now()}_${idSeqRef.current}`;
  };

  const scrollToBottomNow = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  };

  // Streaming state
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const lastStreamUpdateAtRef = useRef<number>(0);
  const lastAutoScrollAtRef = useRef<number>(0);
  const [pendingCommand, setPendingCommand] = useState<Command | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeSymptomPlan, setActiveSymptomPlan] = useState<any | null>(null);
  const [activeSymptomId, setActiveSymptomId] = useState<string | null>(null);
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});
  const [showPlanHistory, setShowPlanHistory] = useState(false);
  const [planHistoryLoading, setPlanHistoryLoading] = useState(false);
  const [planHistory, setPlanHistory] = useState<Array<{ id: string; created_at: string; side?: string; region?: string; severity?: number; completed?: number; total?: number }>>([]);
  const [showTimelineHistory, setShowTimelineHistory] = useState(false);
  const [timelineHistoryLoading, setTimelineHistoryLoading] = useState(false);
  const [timelineHistory, setTimelineHistory] = useState<Array<{ id: string; occurred_at: string; title: string; meta?: any }>>([]);
  const [timelineHistoryTitle, setTimelineHistoryTitle] = useState('History');

  // Image input modal
  const [showImageInputModal, setShowImageInputModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageInputText, setImageInputText] = useState('');

  // Loading dot animations
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      const startAnimation = () => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1Anim, { toValue: 1, duration: 600, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
            Animated.timing(dot2Anim, { toValue: 1, duration: 600, delay: 200, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
            Animated.timing(dot3Anim, { toValue: 1, duration: 600, delay: 400, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Anim, { toValue: 0, duration: 600, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
            Animated.timing(dot2Anim, { toValue: 0, duration: 600, delay: 200, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
            Animated.timing(dot3Anim, { toValue: 0, duration: 600, delay: 400, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
          ]),
        ]).start(() => { if (isLoading) startAnimation(); });
      };
      startAnimation();
    } else {
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }
  }, [isLoading]);

  const stripEmojis = (input: string) => {
    try {
      // eslint-disable-next-line no-control-regex
      return input.replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, '');
    } catch {
      return input;
    }
  };

  useEffect(() => {
    const initializeConversation = async () => {
      if (!isInitialized) {
        try {
          const history = await HealthAssistantService.loadConversationHistory();
          if (history.length > 0) {
            setMessages(history as ChatMessage[]);
          } else {
            const profileForAI = profile ? {
              ...profile,
              displayName: (user as any)?.displayName ?? (profile as any)?.displayName,
              preferredName: (user as any)?.preferredName ?? (profile as any)?.preferredName,
              firstName: (user as any)?.firstName ?? (profile as any)?.firstName,
              surname: (user as any)?.surname ?? (profile as any)?.surname,
            } : (user ? { displayName: (user as any)?.displayName, preferredName: (user as any)?.preferredName } as any : null);

            const greeting = await HealthAssistantService.getPersonalizedGreeting(
              profileForAI as any,
              biomarkers || [],
              healthScore
            );
            setMessages([{ id: '1', role: 'assistant', content: greeting, timestamp: new Date() }]);
          }
          try {
            const sessions = await HealthAssistantService.loadAllChatSessions();
            setChatSessions(sessions);
          } catch {}
        } catch {
          setMessages([{
            id: '1',
            role: 'assistant',
            content: stripEmojis("Hello! I'm Toto. How can I help you today? I'm an AI health assistant for educational information and support — not a substitute for professional medical advice. Always consult your doctor for diagnosis or treatment."),
            timestamp: new Date(),
          }]);
        }
        setIsInitialized(true);
      }
    };
    initializeConversation();
  }, [isInitialized, profile, biomarkers, healthScore]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', scrollToBottomNow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {});
    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [showChatHistory]);

  useEffect(() => {
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (waveformTimer.current) {
        clearInterval(waveformTimer.current);
        waveformTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(recordingPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      recordingPulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    const now = Date.now();
    if ((now - lastAutoScrollAtRef.current) > 150) {
      lastAutoScrollAtRef.current = now;
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      });
    }
  }, [messages.length]);

  useEffect(() => {
    if (showNewChatModal) {
      newChatModalTranslateY.setValue(1000);
      Animated.spring(newChatModalTranslateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      newChatModalTranslateY.setValue(0);
    }
  }, [showNewChatModal]);

  const persistSession = async (msgs: ChatMessage[]) => {
    const titleCandidate = (msgs.find(m => m.role === 'user')?.content || msgs[0]?.content || 'Chat')
      .toString()
      .slice(0, 30);
    const session: ChatSession = {
      id: currentChatId,
      title: titleCandidate.length === 30 ? `${titleCandidate}…` : titleCandidate,
      messages: msgs as any,
      timestamp: msgs[0]?.timestamp || new Date(),
      lastUpdated: new Date(),
    };
    await HealthAssistantService.saveChatSession(session);
    const sessions = await HealthAssistantService.loadAllChatSessions();
    setChatSessions(sessions);
  };

  const handleSendWithAnimation = async (text: string, _clientId: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId('u'),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = generateId('a');
    setStreamingMessageId(assistantMessageId);
    let currentContent = '';
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }]);

    const profileForAI = profile ? {
      ...profile,
      displayName: (user as any)?.displayName ?? (profile as any)?.displayName,
      preferredName: (user as any)?.preferredName ?? (profile as any)?.preferredName,
      firstName: (user as any)?.firstName ?? (profile as any)?.firstName,
      surname: (user as any)?.surname ?? (profile as any)?.surname,
      email: (user as any)?.email ?? (profile as any)?.email,
    } : (user ? { displayName: (user as any)?.displayName, preferredName: (user as any)?.preferredName, email: (user as any)?.email } as any : null);

    try {
      currentContent = await HealthAssistantService.streamChatWithAssistant(
        userMessage.content,
        [...messages, userMessage] as any,
        { profile: profileForAI as any, biomarkers, healthScore, deviceData, settings, labResults, bodySystems, travelHealth },
        (acc) => {
          const now = Date.now();
          if ((now - lastStreamUpdateAtRef.current) > 80) {
            lastStreamUpdateAtRef.current = now;
            setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: acc } : m));
            if ((now - lastAutoScrollAtRef.current) > 120) {
              lastAutoScrollAtRef.current = now;
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }
        }
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert('Error', 'Failed to get response from health assistant. Please try again.');
      setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: 'Sorry, I had trouble responding. Please check your connection and try again.' } : m));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      setMessages(prev => prev.map(msg => msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg));

      if (currentContent && currentContent.trim().length > 0) {
        const finalText = stripEmojis(currentContent);
        setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: finalText } : m));
        const cmd = parseAssistantCommand(finalText);
        if (cmd) setPendingCommand(cmd);
      }
      try {
        const latest = [...messages];
        await HealthAssistantService.saveConversationHistory(latest as any);
        await persistSession(latest);
      } catch (persistErr) {
        console.warn('Failed to persist conversation/session:', persistErr);
      }
    }
  };

  const humanizeCommand = (cmd: Command): string => {
    switch (cmd.type) {
      case 'SUPPLEMENT_VITC_RECOMMEND': return 'Recommend Vitamin C plan';
      case 'APPT_RESCHEDULE_DENTIST': return 'Reschedule dentist appointment';
      case 'SYMPTOM_LOG_LEG_PAIN': return 'Log leg pain and start plan';
      case 'ALLERGY_UPDATE_PNUT': return 'Update peanut allergy';
      case 'TRAVEL_ADD_COUNTRY_CARD': return 'Add country card';
      case 'LAB_SUBMIT_RESULTS': return 'Submit lab results';
      case 'TRIP_CHANGE_DATES': return 'Change trip dates';
    }
  };

  const openTimelineHistory = async (type: 'Supplement' | 'Appointment' | 'Lab', title: string) => {
    setTimelineHistoryTitle(title);
    setShowTimelineHistory(true);
    setTimelineHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('timeline_entries')
        .select('id, occurred_at, title, meta, type')
        .eq('type', type)
        .order('occurred_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      setTimelineHistory((data || []).map((row: any) => ({
        id: row.id as string,
        occurred_at: row.occurred_at as string,
        title: row.title as string,
        meta: row.meta as any,
      })));
    } catch {
      setTimelineHistory([]);
    } finally {
      setTimelineHistoryLoading(false);
    }
  };

  const logTimelineForCommand = async (cmd: Command, result: any) => {
    try {
      switch (cmd.type) {
        case 'SUPPLEMENT_VITC_RECOMMEND': {
          const dose = result?.recommendedDoseMg ?? cmd.payload?.dosePreferenceMg ?? 500;
          await postTimeline({ type: 'Supplement', title: `Vitamin C plan (${dose} mg)`, meta: { nutrient: 'vitamin_c', doseMg: dose, rationale: cmd.payload?.reason } });
          break;
        }
        case 'APPT_RESCHEDULE_DENTIST': {
          await postTimeline({ type: 'Appointment', title: 'Dentist rescheduled', meta: { old: result?.oldDateTime, new: result?.newDateTime, status: result?.status } });
          break;
        }
        case 'SYMPTOM_LOG_LEG_PAIN': {
          const side = cmd.payload?.side || 'unspecified';
          const region = cmd.payload?.region || 'leg';
          await postTimeline({ type: 'Symptom', title: `${side} ${region} pain logged`.replace(/^unspecified\s/i, ''), meta: { severity: cmd.payload?.severity, onset: cmd.payload?.onsetDate, planId: result?.symptomId } });
          break;
        }
        case 'ALLERGY_UPDATE_PNUT': {
          await postTimeline({ type: 'Allergy', title: `Peanut allergy ${cmd.payload?.action}`, meta: { severity: cmd.payload?.severity, epiPen: cmd.payload?.epiPenOwned, status: result?.status } });
          break;
        }
        case 'TRAVEL_ADD_COUNTRY_CARD': {
          await postTimeline({ type: 'Travel', title: `Country card added (${cmd.payload?.country})`, meta: { country: cmd.payload?.country, cardType: cmd.payload?.cardType } });
          break;
        }
        case 'LAB_SUBMIT_RESULTS': {
          await postTimeline({ type: 'Lab', title: `New blood panel submitted (${cmd.payload?.panel})`, meta: { specimenDate: cmd.payload?.specimenDate, updatedCount: result?.updatedBiomarkers?.length } });
          break;
        }
        case 'TRIP_CHANGE_DATES': {
          await postTimeline({ type: 'Travel', title: `Trip dates changed (${cmd.payload?.destination || 'Trip'})`, meta: { start: cmd.payload?.startDate, end: cmd.payload?.endDate } });
          break;
        }
      }
    } catch (e) {
      console.warn('Timeline write failed:', e);
    }
  };

  const confirmPendingCommand = async () => {
    if (!pendingCommand || isDispatching) return;
    try {
      setIsDispatching(true);
      const result = await dispatchCommand(pendingCommand);
      await logTimelineForCommand(pendingCommand, result);
      if (pendingCommand.type === 'SYMPTOM_LOG_LEG_PAIN' && (result as any)?.plan) {
        setActiveSymptomPlan((result as any).plan);
        setActiveSymptomId((result as any).symptomId || null);
        const init: Record<string, boolean> = {};
        try {
          ((result as any).plan.steps || []).forEach((s: any) => { if (s?.toggleKey) init[s.toggleKey] = false; });
        } catch {}
        setToggleState(init);
      }
      Alert.alert('Done', `${humanizeCommand(pendingCommand)} completed.`);
      setPendingCommand(null);
    } catch (e: any) {
      Alert.alert('Action failed', e?.message || 'Unable to complete the action.');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleImageSelected = (uri: string) => {
    setMessages(prev => [...prev, {
      id: generateId('u'),
      role: 'user',
      content: '[Image]',
      timestamp: new Date(),
      imageUri: uri,
    }]);
  };

  const handleDocumentSelected = (uri: string, name: string) => {
    setMessages(prev => [...prev, {
      id: generateId('u'),
      role: 'user',
      content: `[Document: ${name}]`,
      timestamp: new Date(),
      documentUri: uri,
      documentName: name,
    }]);
  };

  const handleVoiceInput = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to use voice input.');
        return;
      }

      if (isRecording) {
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);
            setIsRecording(false);
            if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
            setRecordingDuration(0);
            if (waveformTimer.current) { clearInterval(waveformTimer.current); waveformTimer.current = null; }
            waveformAnimValues.forEach((v) => {
              Animated.timing(v, { toValue: 0.3, duration: 150, useNativeDriver: true }).start();
            });

            if (uri) {
              try {
                const form = new FormData();
                // @ts-ignore React Native FormData file
                form.append('file', { uri, name: 'audio.m4a', type: 'audio/m4a' } as any);
                form.append('model', 'gpt-4o-transcribe');
                form.append('response_format', 'json');
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
                Alert.alert('Transcription failed', 'Could not transcribe audio. Please try again.');
              }
            }
          } catch (stopError) {
            console.error('Error stopping recording:', stopError);
            Alert.alert('Error', 'Failed to stop recording. Please try again.');
          }
        }
      } else {
        try {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recordingOptions: any = { ...(Audio.RecordingOptionsPresets.HIGH_QUALITY as any) };
          if (recordingOptions.ios) recordingOptions.ios.meteringEnabled = true;
          const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions as any);
          setRecording(newRecording);
          setIsRecording(true);
          setRecordingDuration(0);
          recordingTimer.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
          }, 1000);
          if (waveformTimer.current) clearInterval(waveformTimer.current);
          waveformTimer.current = setInterval(async () => {
            try {
              const status: any = await newRecording.getStatusAsync();
              const db = typeof status.metering === 'number' ? status.metering : -160;
              const norm = Math.min(1, Math.max(0, (db + 160) / 160));
              waveformAnimValues.forEach((v, i) => {
                const phase = (i % 5) / 5;
                const shaped = 0.15 + norm * (0.2 + 0.65 * Math.abs(Math.sin(Date.now() / 250 + phase)));
                Animated.timing(v, { toValue: shaped, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
              });
            } catch {}
          }, 100);
        } catch (startError) {
          console.error('Error starting recording:', startError);
          Alert.alert('Error', 'Failed to start recording. Please try again.');
          setIsRecording(false);
        }
      }
    } catch (error) {
      console.error('Error with voice input:', error);
      setIsRecording(false);
      setRecording(null);
      if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
      setRecordingDuration(0);
      Alert.alert('Error', 'Failed to handle voice input. Please try again.');
    }
  };

  const handleImageInput = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
      setImageInputText('');
      setShowImageInputModal(true);
    }
  };

  const sendImageWithText = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    setShowImageInputModal(false);
    try {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: imageInputText.trim() || '[Image]',
        timestamp: new Date(),
        imageUri: selectedImage.uri,
      }]);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions.' },
            {
              role: 'user',
              content: [
                { type: 'text', text: imageInputText.trim() || 'Please analyze this image and provide any relevant health insights or descriptions.' },
                { type: 'image_url', image_url: { url: `data:${selectedImage.mimeType || 'image/jpeg'};base64,${selectedImage.base64}` } },
              ],
            },
          ],
          max_tokens: 800,
        }),
      });
      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]'),
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image.');
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      setImageInputText('');
    }
  };

  const handleDocumentInput = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setIsLoading(true);
      try {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content: asset.name || '[Document]',
          timestamp: new Date(),
          documentName: asset.name,
          documentUri: asset.uri,
        }]);

        let aiContent = '[No analysis returned]';

        if (asset.mimeType && asset.mimeType.startsWith('image/')) {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: 'You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions.' },
                { role: 'user', content: [
                  { type: 'text', text: 'Please analyze this image and provide any relevant health insights or descriptions.' },
                  { type: 'image_url', image_url: { url: `data:${asset.mimeType || 'image/jpeg'};base64,${base64}` } },
                ]},
              ],
              max_tokens: 800,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            aiContent = stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]');
          }
        } else if (asset.mimeType === 'application/pdf') {
          try {
            const pdfText = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });
            if (pdfText.length >= 100) {
              const aiResponse = await HealthAssistantService.chatWithAssistant(
                `Please analyze this PDF document and provide health insights: ${pdfText.substring(0, 4000)}`,
                undefined,
                { profile, biomarkers, healthScore }
              );
              aiContent = stripEmojis(aiResponse);
            } else {
              aiContent = "I received your PDF but couldn't extract readable text from it — this can happen with scanned or encrypted PDFs. You could try sharing the key information as text instead, or I can help answer questions based on what you tell me about it.";
            }
          } catch {
            aiContent = "I received your PDF but had trouble reading it. You could try sharing the key information as text instead.";
          }
        }

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: stripEmojis(aiContent),
          timestamp: new Date(),
        }]);
      } catch (error) {
        console.error('Error analyzing document:', error);
        Alert.alert('Error', 'Failed to analyze document.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const dismissNewChatModal = () => {
    Animated.timing(newChatModalTranslateY, { toValue: 1000, duration: 250, useNativeDriver: true }).start(() => {
      setShowNewChatModal(false);
      newChatModalTranslateY.setValue(0);
    });
  };

  const startNewChat = async (withMemory: boolean) => {
    if (!currentChatHasMemory && messages.length > 0) {
      setShowMessagesAshAnimation(true);
      Animated.timing(messagesFadeAnim, { toValue: 0, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
      setTimeout(async () => { await proceedWithNewChat(withMemory); }, 1600);
    } else {
      await proceedWithNewChat(withMemory);
    }
  };

  const proceedWithNewChat = async (withMemory: boolean) => {
    const newChatId = `chat_${Date.now()}`;
    try {
      if (messages.length > 0 && currentChatHasMemory) {
        await persistSession(messages);
      }
    } catch (e) {
      console.warn('Failed to save current chat session:', e);
    }
    setShowMessagesAshAnimation(false);
    messagesFadeAnim.setValue(1);
    setCurrentChatId(newChatId);
    setCurrentChatHasMemory(withMemory);
    setMessages([]);
    setShowNewChatModal(false);
    if (withMemory) {
      setMessages([{ id: '1', role: 'assistant', content: "Hello! I'm your health assistant. How can I help you today?", timestamp: new Date() }]);
    }
  };

  const loadSession = async (session: ChatSession) => {
    setCurrentChatId(session.id);
    setCurrentChatHasMemory(true);
    setMessages((session.messages || []) as ChatMessage[]);
    await HealthAssistantService.saveConversationHistory(session.messages || []);
    setShowChatHistory(false);
  };

  const retryLoadHistory = async () => {
    setHistoryError(null);
    setHistoryLoading(true);
    try {
      const sessions = await HealthAssistantService.loadAllChatSessions();
      setChatSessions(sessions);
    } catch {
      setHistoryError('Failed to load previous chats.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.telegramBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowChatHistory(true)} style={{ marginRight: 12 }}>
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
        <TouchableOpacity onPress={() => setShowNewChatModal(true)} style={{ marginLeft: 12 }}>
          <Ionicons name="create-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Chat History Drawer */}
      <Modal visible={showChatHistory} animationType="slide" transparent onRequestClose={() => setShowChatHistory(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={styles.chatDrawer}>
              <View style={styles.chatDrawerHeader}>
                <Text style={styles.chatDrawerTitle}>Chat History</Text>
                <TouchableOpacity onPress={() => setShowChatHistory(false)}>
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
                    <TouchableOpacity onPress={retryLoadHistory} style={styles.retryButton}>
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
                            onPress={loadSession}
                            onDeleted={(id) => setChatSessions(prev => prev.filter(s => s.id !== id))}
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
              onPress={() => setShowChatHistory(false)}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* New Chat Bottom Sheet */}
      <Modal visible={showNewChatModal} transparent animationType="none" presentationStyle="overFullScreen" onRequestClose={dismissNewChatModal}>
        <View style={styles.newChatModalOverlay}>
          <TouchableWithoutFeedback onPress={dismissNewChatModal}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.newChatBottomSheetContainer}>
            <Animated.View style={[styles.newChatBottomSheetContent, { transform: [{ translateY: newChatModalTranslateY }] }]}>
              <View style={styles.newChatBottomSheetHandleContainer}>
                <View style={styles.newChatBottomSheetHandle} />
              </View>
              <View style={styles.newChatBottomSheetHeader} pointerEvents="box-none">
                <TouchableOpacity onPress={dismissNewChatModal} style={styles.newChatBottomSheetCloseButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.newChatBottomSheetTitle}>Start New Chat</Text>
                <View style={{ width: 32 }} />
              </View>
              <View style={styles.newChatBottomSheetBody}>
                <Text style={styles.newChatQuestion}>Would you like this chat to have memory?</Text>
                <TouchableOpacity
                  style={styles.newChatButtonWithMemory}
                  onPress={() => { dismissNewChatModal(); setTimeout(() => startNewChat(true), 260); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.newChatButtonText}>With Memory</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.newChatButtonNoMemory}
                  onPress={() => { dismissNewChatModal(); setTimeout(() => startNewChat(false), 260); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.newChatButtonText}>No Memory</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </View>
      </Modal>

      {/* Image Input Modal */}
      <Modal visible={showImageInputModal} animationType="slide" transparent onRequestClose={() => setShowImageInputModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.imageModalOverlay}>
            <View style={styles.imageModalCard}>
              <View style={styles.imageModalHeader}>
                <Text style={styles.imageModalTitle}>Add Image</Text>
                <TouchableOpacity onPress={() => setShowImageInputModal(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              {selectedImage && (
                <View style={{ marginBottom: 20 }}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} resizeMode="cover" />
                </View>
              )}
              <TextInput
                style={styles.imageInputField}
                placeholder="Add a message with your image (optional)..."
                placeholderTextColor="#8E8E93"
                value={imageInputText}
                onChangeText={setImageInputText}
                multiline
                maxLength={500}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={styles.imageModalCancelBtn} onPress={() => setShowImageInputModal(false)}>
                  <Text style={styles.imageModalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageModalSendBtn} onPress={sendImageWithText}>
                  <Text style={styles.imageModalBtnText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Inline slot collectors */}
        {pendingCommand?.type === 'APPT_RESCHEDULE_DENTIST' && (
          <DateTimeCollector label="Pick new date & time" onPicked={(iso, time) => {
            setPendingCommand({ type: 'APPT_RESCHEDULE_DENTIST', payload: { ...(pendingCommand as any).payload, newDate: iso, newTime: time } });
          }} />
        )}
        {pendingCommand?.type === 'SYMPTOM_LOG_LEG_PAIN' && (
          <SeverityCollector onPicked={(sev) => {
            setPendingCommand({ type: 'SYMPTOM_LOG_LEG_PAIN', payload: { ...(pendingCommand as any).payload, severity: sev } });
          }} />
        )}
        {pendingCommand?.type === 'SUPPLEMENT_VITC_RECOMMEND' && (
          <MgCollector onPicked={(mg) => {
            setPendingCommand({ type: 'SUPPLEMENT_VITC_RECOMMEND', payload: { ...(pendingCommand as any).payload, dosePreferenceMg: mg } });
          }} />
        )}

        {/* Messages area with ash animation */}
        <View
          ref={messagesContainerRef}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setMessagesContainerLayout({ x, y, width, height });
          }}
          style={{ flex: 1, position: 'relative' }}
        >
          <Animated.View style={{ flex: 1, opacity: messagesFadeAnim }}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => {
                if (autoScrollEnabledRef.current) scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
              onScrollBeginDrag={() => { autoScrollEnabledRef.current = false; }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ChatList
                messages={messages
                  .filter(msg => msg && msg.id && msg.content && msg.role)
                  .map(msg => ({
                    id: msg.id,
                    clientId: msg.id,
                    text: msg.content,
                    role: msg.role,
                    status: (msg as any).status || 'sent',
                    timestamp: msg.timestamp,
                  }))}
                onMessageLayout={(clientId, rect) => { sendAnim.setEndRect(clientId, rect); }}
                streamingId={streamingMessageId || undefined}
              />
            </ScrollView>
          </Animated.View>
          {showMessagesAshAnimation && (
            <View style={[styles.ashOverlay, { position: 'absolute', top: 0, left: 0, width: messagesContainerLayout.width || '100%', height: messagesContainerLayout.height || '100%' }]}>
              <AshParticles visible={showMessagesAshAnimation} onComplete={() => {}} />
            </View>
          )}
        </View>

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.assistantAvatar}>
              <TortoAvatar state="thinking" size={28} />
            </View>
            <View style={styles.loadingContent}>
              <View style={styles.loadingDots}>
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot1Anim }] }]} />
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot2Anim }] }]} />
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot3Anim }] }]} />
              </View>
            </View>
          </View>
        )}

        {/* Action confirmation banner */}
        {pendingCommand && (
          <View style={styles.confirmBar}>
            <Text style={styles.confirmText}>{humanizeCommand(pendingCommand)}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnPrimary]} onPress={confirmPendingCommand} disabled={isDispatching}>
                <Text style={styles.confirmBtnText}>{isDispatching ? 'Working…' : 'Confirm & Log'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnSecondary]} onPress={() => setPendingCommand(null)} disabled={isDispatching}>
                <Text style={styles.confirmBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick history links */}
        {pendingCommand?.type === 'SUPPLEMENT_VITC_RECOMMEND' && (
          <View style={styles.historyLinkRow}>
            <TouchableOpacity onPress={() => openTimelineHistory('Supplement', 'Supplement History')}>
              <Text style={styles.historyLinkText}>View supplement history</Text>
            </TouchableOpacity>
          </View>
        )}
        {pendingCommand?.type === 'APPT_RESCHEDULE_DENTIST' && (
          <View style={styles.historyLinkRow}>
            <TouchableOpacity onPress={() => openTimelineHistory('Appointment', 'Appointment History')}>
              <Text style={styles.historyLinkText}>View appointment history</Text>
            </TouchableOpacity>
          </View>
        )}
        {pendingCommand?.type === 'LAB_SUBMIT_RESULTS' && (
          <View style={styles.historyLinkRow}>
            <TouchableOpacity onPress={() => openTimelineHistory('Lab', 'Lab History')}>
              <Text style={styles.historyLinkText}>View lab history</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Symptom Plan */}
        {activeSymptomPlan && (
          <View style={styles.planContainer}>
            <View style={styles.planHeader}>
              <Text style={styles.planHeaderText}>Leg pain recovery plan</Text>
              <Text style={styles.planCompletion}>
                {Object.values(toggleState).filter(Boolean).length}/{(activeSymptomPlan.steps || []).length}
              </Text>
            </View>
            <SymptomPlan
              plan={activeSymptomPlan}
              onToggle={async (toggleKey, completed) => {
                setToggleState(prev => ({ ...prev, [toggleKey]: completed }));
                try {
                  await togglesMark({ toggleKey, completed, symptomId: activeSymptomId || undefined });
                } catch {
                  setToggleState(prev => ({ ...prev, [toggleKey]: !completed }));
                }
              }}
            />
            <View style={{ paddingHorizontal: 16, marginTop: 8, alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={async () => {
                setShowPlanHistory(true);
                setPlanHistoryLoading(true);
                try {
                  const { data: events, error: e1 } = await supabase
                    .from('symptom_events')
                    .select('id, created_at, side, region, severity')
                    .eq('kind', 'leg_pain')
                    .order('created_at', { ascending: false })
                    .limit(10);
                  if (e1) throw e1;
                  const ids = (events || []).map((ev: any) => ev.id);
                  let togglesMap: Record<string, { total: number; completed: number }> = {};
                  if (ids.length > 0) {
                    const { data: toggles, error: e2 } = await supabase
                      .from('symptom_toggles')
                      .select('symptom_id, toggle_key, completed')
                      .in('symptom_id', ids);
                    if (e2) throw e2;
                    (toggles || []).forEach((t: any) => {
                      const key = t.symptom_id as string;
                      if (!togglesMap[key]) togglesMap[key] = { total: 0, completed: 0 };
                      togglesMap[key].total += 1;
                      if (t.completed) togglesMap[key].completed += 1;
                    });
                  }
                  setPlanHistory((events || []).map((ev: any) => ({
                    id: ev.id as string,
                    created_at: ev.created_at as string,
                    side: ev.side as string | undefined,
                    region: ev.region as string | undefined,
                    severity: ev.severity as number | undefined,
                    completed: togglesMap[ev.id]?.completed || 0,
                    total: togglesMap[ev.id]?.total || 0,
                  })));
                } catch {
                  setPlanHistory([]);
                } finally {
                  setPlanHistoryLoading(false);
                }
              }}>
                <Text style={{ color: '#93C5FD', fontWeight: '700', fontSize: 12 }}>View history</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <MessageComposer
          onSend={handleSendWithAnimation}
          disabled={isLoading}
          onAttachPress={() => setShowMediaPicker(true)}
          onMicPress={handleVoiceInput}
          hasChatted={messages.some(m => m.role === 'user')}
        />
      </KeyboardAvoidingView>

      {/* Plan History Modal */}
      <Modal visible={showPlanHistory} animationType="slide" transparent onRequestClose={() => setShowPlanHistory(false)}>
        <View style={styles.historyOverlay}>
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Leg Pain History</Text>
              <TouchableOpacity onPress={() => setShowPlanHistory(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              {planHistoryLoading ? (
                <View style={styles.centeredFill}>
                  <ActivityIndicator size="small" color="#93C5FD" />
                  <Text style={styles.mutedText}>Loading…</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
                  {planHistory.length === 0 ? (
                    <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 16 }]}>No history yet.</Text>
                  ) : planHistory.map(item => (
                    <View key={item.id} style={styles.historyRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyRowTitle}>{item.region || 'leg'} • {item.side || 'unspecified'}</Text>
                        <Text style={styles.historyRowMeta}>Severity {item.severity ?? '-'} • {new Date(item.created_at).toLocaleString()}</Text>
                      </View>
                      <Text style={styles.historyProgress}>{item.completed}/{item.total}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Timeline History Modal */}
      <Modal visible={showTimelineHistory} animationType="slide" transparent onRequestClose={() => setShowTimelineHistory(false)}>
        <View style={styles.historyOverlay}>
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>{timelineHistoryTitle}</Text>
              <TouchableOpacity onPress={() => setShowTimelineHistory(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              {timelineHistoryLoading ? (
                <View style={styles.centeredFill}>
                  <ActivityIndicator size="small" color="#93C5FD" />
                  <Text style={styles.mutedText}>Loading…</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
                  {timelineHistory.length === 0 ? (
                    <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 16 }]}>No history yet.</Text>
                  ) : timelineHistory.map(item => (
                    <View key={item.id} style={styles.historyRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyRowTitle}>{item.title}</Text>
                        <Text style={styles.historyRowMeta}>{new Date(item.occurred_at).toLocaleString()}</Text>
                      </View>
                      {item.meta?.doseMg ? (
                        <Text style={styles.historyProgress}>{item.meta.doseMg} mg</Text>
                      ) : item.meta?.updatedCount ? (
                        <Text style={styles.historyProgress}>{item.meta.updatedCount} upd.</Text>
                      ) : item.meta?.new ? (
                        <Text style={styles.historyProgress}>→ {String(item.meta.new).slice(11, 16)}</Text>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <TelegramMediaPicker
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onImageSelected={handleImageSelected}
        onDocumentSelected={handleDocumentSelected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  telegramBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(11, 11, 15, 0.95)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 8,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContent: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#007AFF30',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  loadingContent: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 3,
  },
  confirmBar: {
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    flex: 1,
  },
  confirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  confirmBtnPrimary: {
    backgroundColor: '#10B981',
  },
  confirmBtnSecondary: {
    backgroundColor: '#334155',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  historyLinkRow: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  historyLinkText: {
    color: '#93C5FD',
    fontWeight: '700',
    fontSize: 12,
  },
  planContainer: {
    marginTop: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  planHeaderText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '700',
  },
  planCompletion: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  ashOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 1000,
  },
  historyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  historyCard: {
    width: '100%',
    maxWidth: 420,
    height: '70%',
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 4,
  },
  historyTitle: {
    color: '#E5E7EB',
    fontWeight: '800',
    fontSize: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  historyRowTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
    marginBottom: 2,
  },
  historyRowMeta: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  historyProgress: {
    color: '#93C5FD',
    fontWeight: '800',
  },
  chatDrawer: {
    width: '75%',
    height: '100%',
    backgroundColor: '#181A20',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chatDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chatDrawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  centeredFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedText: {
    color: '#8E8E93',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  newChatModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  newChatBottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  newChatBottomSheetContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  newChatBottomSheetHandleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatBottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  newChatBottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  newChatBottomSheetCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatBottomSheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  newChatBottomSheetBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newChatQuestion: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  newChatButtonWithMemory: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButtonNoMemory: {
    backgroundColor: '#232A34',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCard: {
    backgroundColor: '#181A20',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageInputField: {
    backgroundColor: '#232A34',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imageModalCancelBtn: {
    flex: 1,
    backgroundColor: '#232A34',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  imageModalSendBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
  },
  imageModalBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default HealthAssistantScreen;
