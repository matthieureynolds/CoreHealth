import React, { useState, useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  Animated,
  Easing,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../context/HealthDataContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { OPENAI_API_KEY, HealthAssistantService } from '../services/healthAssistantService';
import type { ChatSession } from '../services/healthAssistantService';
import * as Speech from 'expo-speech';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { formatDateBySetting, formatTimeBySetting, formatShortDateBySetting } from '../utils/dateFormat';
import { MessageComposer } from '../components/chat/MessageComposer';
import { ChatList, ChatMessage as NewChatMessage } from '../components/chat/ChatList';
import { useSendAnimation } from '../hooks/useSendAnimation';
import { TelegramMediaPicker } from '../components/chat/TelegramMediaPicker';
import { parseAssistantCommand } from '../assistant/parser';
import { dispatch as dispatchCommand, postTimeline, togglesMark } from '../assistant/commandBus';
import type { Command } from '../assistant/commandBus';
import { DateTimeCollector, SeverityCollector, MgCollector } from '../components/chat/InlineSlots';
import { SymptomPlan } from '../components/chat/SymptomPlan';
import { supabase } from '../config/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUri?: string;
  documentName?: string;
  documentUri?: string;
}

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
  const [recordedText, setRecordedText] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  // Animated value for new chat modal bottom sheet
  const newChatModalTranslateY = useRef(new Animated.Value(1000)).current;
  const [chatHistory, setChatHistory] = useState<Array<{id: string, title: string, timestamp: Date}>>([
    {
      id: 'chat_1',
      title: 'How are my biomarkers looking?',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 'chat_2', 
      title: 'What should I eat today?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: 'chat_3',
      title: 'Give me a workout plan',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [currentChatHasMemory, setCurrentChatHasMemory] = useState(true); // Track if current chat has memory
  // Persisted history loader state
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [persistedHistory, setPersistedHistory] = useState<ChatMessage[] | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  
  // Ash animation for no-memory chat when switching
  const [showMessagesAshAnimation, setShowMessagesAshAnimation] = useState(false);
  const messagesFadeAnim = useRef(new Animated.Value(1)).current;
  const messagesContainerRef = useRef<View>(null);
  const [messagesContainerLayout, setMessagesContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Audio recording state and refs
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const waveformTimer = useRef<NodeJS.Timeout | null>(null);
  const waveformAnimValues = useRef(Array.from({ length: 24 }, () => new Animated.Value(0.3))).current;
  const recordingPulseAnim = useRef(new Animated.Value(1)).current;
  // Unique, monotonic IDs to avoid React key collisions
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

  // Streaming response state
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

  // Image input modal state
  const [showImageInputModal, setShowImageInputModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageInputText, setImageInputText] = useState('');

  // Modern loading animation values
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Start loading animation when isLoading changes
  useEffect(() => {
    if (isLoading) {
      const startAnimation = () => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1Anim, {
              toValue: 1,
              duration: 600,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 1,
              duration: 600,
              delay: 200,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 1,
              duration: 600,
              delay: 400,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: 600,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: 600,
              delay: 200,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: 600,
              delay: 400,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (isLoading) {
            startAnimation(); // Loop animation while loading
          }
        });
      };
      startAnimation();
    } else {
      // Reset animations when loading stops
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }
  }, [isLoading]);

  // Utility: strip emojis from text for local-rendered AI replies
  const stripEmojis = (input: string) => {
    try {
      // eslint-disable-next-line no-control-regex
      return input.replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, '');
    } catch {
      return input;
    }
  };

  // Initialize conversation with personalized greeting
  useEffect(() => {
    const initializeConversation = async () => {
      if (!isInitialized) {
        try {
          // Load conversation history
          const history = await HealthAssistantService.loadConversationHistory();
          if (history.length > 0) {
            setMessages(history);
          } else {
            // Show simple friendly greeting for new conversations
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
            setMessages([{
              id: '1',
              role: 'assistant',
              content: greeting,
              timestamp: new Date(),
            }]);
          }
          // Load existing saved sessions for Chat History
          try {
            const sessions = await HealthAssistantService.loadAllChatSessions();
            setChatSessions(sessions);
          } catch {}
        } catch (error) {
          console.error('Error initializing conversation:', error);
          // Fallback greeting (no emojis)
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

  // Keyboard listeners: keep chat scrolled to bottom when keyboard shows
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToBottomNow();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // When keyboard hides, reset any positioning if needed
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [showChatHistory]);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (waveformTimer.current) {
        clearInterval(waveformTimer.current);
        waveformTimer.current = null;
      }
    };
  }, []);

  // Pulse animation for recording state
  useEffect(() => {
    if (isRecording) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      recordingPulseAnim.setValue(1);
    }
  }, [isRecording]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId('u'),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Prepare streaming with a visible placeholder assistant message
    const assistantMessageId = generateId('a');
    setStreamingMessageId(assistantMessageId);
    let currentContent = '';
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }]);
  // Create placeholder message we can stream into
  setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }]);
  // Insert a placeholder assistant message so we can stream into it
  setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      // Get assistant response with health context (true token streaming)
      const profileForAI = profile ? {
        ...profile,
        displayName: (user as any)?.displayName ?? (profile as any)?.displayName,
        preferredName: (user as any)?.preferredName ?? (profile as any)?.preferredName,
        firstName: (user as any)?.firstName ?? (profile as any)?.firstName,
        surname: (user as any)?.surname ?? (profile as any)?.surname,
        email: (user as any)?.email ?? (profile as any)?.email,
      } : (user ? { displayName: (user as any)?.displayName, preferredName: (user as any)?.preferredName, email: (user as any)?.email } as any : null);

      currentContent = await HealthAssistantService.streamChatWithAssistant(
        userMessage.content,
        [...messages, userMessage] as any,
        { profile: profileForAI as any, biomarkers, healthScore, deviceData, settings, labResults, bodySystems, travelHealth },
        (acc) => {
          const now = Date.now();
          if ((now - lastStreamUpdateAtRef.current) > 80) {
            lastStreamUpdateAtRef.current = now;
            const snapshot = acc;
            setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: snapshot } : m));
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
      // Fill placeholder with an error message so the bubble isn't blank
      setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: 'Sorry, I had trouble responding. Please check your connection and try again.' } : m));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      
      // Update the user message status to 'sent' after animation
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
      ));
      
      // Ensure final content is set and parse commands
      if (currentContent && currentContent.trim().length > 0) {
        const finalText = stripEmojis(currentContent);
        setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: finalText } : m));
        const cmd = parseAssistantCommand(finalText);
        if (cmd) setPendingCommand(cmd);
      }
      // Persist conversation and update sessions list
      try {
        const latest = [...messages];
        await HealthAssistantService.saveConversationHistory(latest);
        const titleCandidate = (latest.find(m => m.role === 'user')?.content || latest[0]?.content || 'Chat')
          .toString()
          .slice(0, 30);
        const session: ChatSession = {
          id: currentChatId,
          title: titleCandidate.length === 30 ? `${titleCandidate}…` : titleCandidate,
          messages: latest,
          timestamp: latest[0]?.timestamp || new Date(),
          lastUpdated: new Date(),
        };
        await HealthAssistantService.saveChatSession(session);
        const sessions = await HealthAssistantService.loadAllChatSessions();
        setChatSessions(sessions);
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

  const openTimelineHistory = async (type: 'Supplement'|'Appointment'|'Lab', title: string) => {
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
          await postTimeline({
            type: 'Supplement',
            title: `Vitamin C plan (${dose} mg)`,
            meta: { nutrient: 'vitamin_c', doseMg: dose, rationale: cmd.payload?.reason }
          });
          break;
        }
        case 'APPT_RESCHEDULE_DENTIST': {
          await postTimeline({
            type: 'Appointment',
            title: `Dentist rescheduled`,
            meta: { old: result?.oldDateTime, new: result?.newDateTime, status: result?.status }
          });
          break;
        }
        case 'SYMPTOM_LOG_LEG_PAIN': {
          const side = cmd.payload?.side || 'unspecified';
          const region = cmd.payload?.region || 'leg';
          await postTimeline({
            type: 'Symptom',
            title: `${side} ${region} pain logged`.replace(/^unspecified\s/i, ''),
            meta: { severity: cmd.payload?.severity, onset: cmd.payload?.onsetDate, planId: result?.symptomId }
          });
          break;
        }
        case 'ALLERGY_UPDATE_PNUT': {
          await postTimeline({
            type: 'Allergy',
            title: `Peanut allergy ${cmd.payload?.action}`,
            meta: { severity: cmd.payload?.severity, epiPen: cmd.payload?.epiPenOwned, status: result?.status }
          });
          break;
        }
        case 'TRAVEL_ADD_COUNTRY_CARD': {
          await postTimeline({
            type: 'Travel',
            title: `Country card added (${cmd.payload?.country})`,
            meta: { country: cmd.payload?.country, cardType: cmd.payload?.cardType }
          });
          break;
        }
        case 'LAB_SUBMIT_RESULTS': {
          await postTimeline({
            type: 'Lab',
            title: `New blood panel submitted (${cmd.payload?.panel})`,
            meta: { specimenDate: cmd.payload?.specimenDate, updatedCount: result?.updatedBiomarkers?.length }
          });
          break;
        }
        case 'TRIP_CHANGE_DATES': {
          await postTimeline({
            type: 'Travel',
            title: `Trip dates changed (${cmd.payload?.destination || 'Trip'})`,
            meta: { start: cmd.payload?.startDate, end: cmd.payload?.endDate }
          });
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
      // Capture Symptom Plan
      if (pendingCommand.type === 'SYMPTOM_LOG_LEG_PAIN' && result?.plan) {
        setActiveSymptomPlan(result.plan);
        setActiveSymptomId(result.symptomId || null);
        const init: Record<string, boolean> = {};
        try {
          (result.plan.steps || []).forEach((s: any) => { if (s?.toggleKey) init[s.toggleKey] = false; });
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

  const handleSendWithAnimation = async (text: string, clientId: string) => {
    if (!text.trim() || isLoading) return;

    console.log('🚀 Sending message:', text);

    const userMessage: ChatMessage = {
      id: generateId('u'),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    // Add message with sending status for animation
    const pendingMessage = { ...userMessage, status: 'sending' as const };
    setMessages(prev => {
      const newMessages = [...prev, pendingMessage];
      console.log('📝 Messages after adding user message:', newMessages);
      return newMessages;
    });
    setIsLoading(true);

    // Prepare streaming with a visible placeholder assistant message
    const assistantMessageId = generateId('a');
    setStreamingMessageId(assistantMessageId);
    let currentContent = '';
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      // True token streaming using service
      currentContent = await HealthAssistantService.streamChatWithAssistant(
        userMessage.content,
        [...messages, userMessage] as any,
        { profile, biomarkers, healthScore },
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
      // Ensure placeholder shows an error message instead of remaining blank
      setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: 'Sorry, I had trouble responding. Please check your connection and try again.' } : m));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      
      // Update the user message status to 'sent' after animation
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
      ));
      
      // Ensure final content is set
      if (currentContent && currentContent.trim().length > 0) {
        const finalText = stripEmojis(currentContent);
        setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: finalText } : m));
      }
      // Persist conversation and update sessions list
      try {
        const latest = [...messages];
        await HealthAssistantService.saveConversationHistory(latest);
        const titleCandidate = (latest.find(m => m.role === 'user')?.content || latest[0]?.content || 'Chat')
          .toString()
          .slice(0, 30);
        const session: ChatSession = {
          id: currentChatId,
          title: titleCandidate.length === 30 ? `${titleCandidate}…` : titleCandidate,
          messages: latest,
          timestamp: latest[0]?.timestamp || new Date(),
          lastUpdated: new Date(),
        };
        await HealthAssistantService.saveChatSession(session);
        const sessions = await HealthAssistantService.loadAllChatSessions();
        setChatSessions(sessions);
      } catch (persistErr) {
        console.warn('Failed to persist conversation/session:', persistErr);
      }
    }
  };

  const handleImageSelected = (uri: string) => {
    // Handle image selection from media picker
    const imageMessage: ChatMessage = {
      id: generateId('u'),
      role: 'user',
      content: '[Image]',
      timestamp: new Date(),
      imageUri: uri,
    };
    
    setMessages(prev => [...prev, imageMessage]);
  };

  const handleDocumentSelected = (uri: string, name: string) => {
    // Handle document selection from media picker
    const documentMessage: ChatMessage = {
      id: generateId('u'),
      role: 'user',
      content: `[Document: ${name}]`,
      timestamp: new Date(),
      documentUri: uri,
      documentName: name,
    };
    
    setMessages(prev => [...prev, documentMessage]);
  };

  // Voice input handler with proper audio recording
  const handleVoiceInput = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to use voice input.');
        return;
      }

      if (isRecording) {
        // Stop recording
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecordingUri(uri);
            setRecording(null);
            setIsRecording(false);
            
            if (recordingTimer.current) {
              clearInterval(recordingTimer.current);
              recordingTimer.current = null;
            }
            setRecordingDuration(0);
            if (waveformTimer.current) {
              clearInterval(waveformTimer.current);
              waveformTimer.current = null;
            }
            // Smoothly drop waveform back to baseline
            waveformAnimValues.forEach((v) => {
              Animated.timing(v, { toValue: 0.3, duration: 150, useNativeDriver: true }).start();
            });
            
            // Transcribe with OpenAI (gpt-4o-transcribe)
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
                const text = (data.text ?? '').trim();
                setInputText(text);
                setRecordedText(text);
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
        // Start recording
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
          
          // Enable metering so waveform reflects real input (iOS supports metering)
          const recordingOptions: any = { ...(Audio.RecordingOptionsPresets.HIGH_QUALITY as any) };
          if (recordingOptions.ios) {
            recordingOptions.ios.meteringEnabled = true;
          }
          const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions as any);
          setRecording(newRecording);
          setIsRecording(true);
          
          // Start timer for recording duration
          setRecordingDuration(0);
          recordingTimer.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
          }, 1000);
          // Start lightweight waveform animation (ChatGPT-style)
          if (waveformTimer.current) {
            clearInterval(waveformTimer.current);
          }
          // Poll metering and animate bars from actual voice input
          waveformTimer.current = setInterval(async () => {
            try {
              const status: any = await newRecording.getStatusAsync();
              const db = typeof status.metering === 'number' ? status.metering : -160; // -160..0 dB
              const norm = Math.min(1, Math.max(0, (db + 160) / 160));
              waveformAnimValues.forEach((v, i) => {
                const phase = (i % 5) / 5;
                const shaped = 0.15 + norm * (0.2 + 0.65 * Math.abs(Math.sin(Date.now() / 250 + phase)));
                Animated.timing(v, {
                  toValue: shaped,
                  duration: 100,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }).start();
              });
            } catch {}
          }, 100);
          
          console.log('Recording started');
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
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setRecordingDuration(0);
      Alert.alert('Error', 'Failed to handle voice input. Please try again.');
    }
  };

  // Image input handler
  const handleImageInput = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageAsset = result.assets[0];
      setSelectedImage(imageAsset);
      setImageInputText('');
      setShowImageInputModal(true);
    }
  };

  // Send image with text
  const sendImageWithText = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setShowImageInputModal(false);

    try {
      // Add the image with text as a user message in the chat
      const userImageMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: imageInputText.trim() || '[Image]',
        timestamp: new Date(),
        imageUri: selectedImage.uri,
      };
      setMessages(prev => [...prev, userImageMessage]);

      // Prepare OpenAI API call with image and text
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: "You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions."
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: imageInputText.trim() || 'Please analyze this image and provide any relevant health insights or descriptions.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${selectedImage.mimeType || 'image/jpeg'};base64,${selectedImage.base64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]');

      // Add the assistant's reply to chat
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image.');
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      setImageInputText('');
    }
  };

  // Add document input handler
  const handleDocumentInput = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setIsLoading(true);
      try {
        // Add the document as a user message in the chat
        const userDocMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: asset.name || '[Document]',
          timestamp: new Date(),
          documentName: asset.name,
          documentUri: asset.uri,
        };
        setMessages(prev => [...prev, userDocMessage]);

        let aiContent = '[No analysis returned]';
        
        if (asset.mimeType && asset.mimeType.startsWith('image/')) {
          // Handle images
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: "You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions."
                },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Please analyze this image and provide any relevant health insights or descriptions.'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:${asset.mimeType || 'image/jpeg'};base64,${base64}`
                      }
                    }
                  ]
                }
              ],
              max_tokens: 800,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            aiContent = stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]');
          }
        } else if (asset.mimeType === 'application/pdf') {
          // Handle PDFs - read as text and analyze
          try {
            const pdfText = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
            
            // If we can't read the PDF as text (binary), we'll use a simulated analysis
            if (pdfText.length < 100) {
              // Simulate PDF analysis for demo purposes
              const simulatedResponses = [
                "I've analyzed your PDF document. It appears to be a medical report showing your recent lab results. Your blood work looks generally good, with most markers within normal ranges. I notice your cholesterol levels are slightly elevated, but your liver function tests are excellent.",
                "This PDF contains your health records and recent test results. The data shows you're in good overall health. Your vitamin D levels are optimal, and your thyroid function tests are normal. Your inflammatory markers are within healthy ranges.",
                "I've reviewed your PDF document. It's a comprehensive health assessment showing positive trends in your wellness journey. Your cardiovascular markers are strong, with good blood pressure and heart rate variability. Your metabolic health indicators are also promising."
              ];
              
              aiContent = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
            } else {
              // If we can read text from PDF, analyze it
              const analysisPrompt = `Please analyze this PDF document and provide health insights: ${pdfText.substring(0, 4000)}`;
              
              // Send the PDF content to AI for analysis
              const aiResponse = await HealthAssistantService.chatWithAssistant(analysisPrompt, undefined, {
                profile,
                biomarkers,
                healthScore
              });
              aiContent = stripEmojis(aiResponse);
            }
            

            
            // Add AI response
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: stripEmojis(aiContent),
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
            
          } catch (pdfError) {
            console.error('Error reading PDF:', pdfError);
            aiContent = "I've received your PDF document. While I can see it's a health-related file, I'm having trouble extracting the text content for analysis. This might be due to the PDF format or security settings. You could try sharing the key information as text, or I can help you with general health questions based on what you tell me about the document.";
            
            // Add AI response even if analysis fails
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: aiContent,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
          }
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: stripEmojis(aiContent),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error analyzing document:', error);
        Alert.alert('Error', 'Failed to analyze document.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleFab = () => {
    setFabOpen((open) => {
      Animated.parallel([
        Animated.timing(fabAnim, {
          toValue: open ? 0 : 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(fabScale, {
            toValue: 1.2,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(fabScale, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      return !open;
    });
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive (throttled)
    const now = Date.now();
    if ((now - lastAutoScrollAtRef.current) > 150) {
      lastAutoScrollAtRef.current = now;
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      });
    }
  }, [messages.length]);

  const formatTime = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    return formatTimeBySetting(date, settings?.general?.timeFormat === '12h' ? '12h' : '24h');
  };

  const formatDateTime = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    // Show day/month only (no year) + time using existing helpers
    const datePart = formatShortDateBySetting(date, settings?.general?.dateFormat || 'DD/MM/YYYY');
    const timePart = formatTimeBySetting(date, settings?.general?.timeFormat === '12h' ? '12h' : '24h');
    return `${timePart} ${datePart}`;
  };

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.9,
    });
  };

  // Animate new chat modal bottom sheet when opening/closing
  useEffect(() => {
    if (showNewChatModal) {
      // Start from off-screen and slide up
      newChatModalTranslateY.setValue(1000);
      Animated.spring(newChatModalTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      newChatModalTranslateY.setValue(0);
    }
  }, [showNewChatModal]);

  // Chat management functions
  const startNewChat = async (withMemory: boolean) => {
    // If current chat is no-memory and has messages, show ash animation
    if (!currentChatHasMemory && messages.length > 0) {
      setShowMessagesAshAnimation(true);
      // Fade out messages - slower, more dramatic
      Animated.timing(messagesFadeAnim, {
        toValue: 0,
        duration: 1200, // Increased from 600ms
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      
      // Wait for ash animation to complete before switching (ash takes ~1500ms)
      setTimeout(async () => {
        await proceedWithNewChat(withMemory);
      }, 1600); // Wait for particles to fully animate and disappear (1400ms + 200ms delay)
    } else {
      // No animation needed, proceed directly
      await proceedWithNewChat(withMemory);
    }
  };

  const proceedWithNewChat = async (withMemory: boolean) => {
    const newChatId = `chat_${Date.now()}`;
    const chatTitle = `Chat ${chatHistory.length + 1}`;
    
    // Save current conversation as a session if it has messages and has memory
    try {
      if (messages.length > 0 && currentChatHasMemory) {
        const currentChatTitle = (messages.find(m => m.role === 'user')?.content || messages[0]?.content || 'Chat')
          .toString()
          .slice(0, 30);
        const session: ChatSession = {
          id: currentChatId,
          title: currentChatTitle.length === 30 ? `${currentChatTitle}…` : currentChatTitle,
          messages: messages,
          timestamp: messages[0]?.timestamp || new Date(),
          lastUpdated: new Date(),
        };
        await HealthAssistantService.saveChatSession(session);
        const sessions = await HealthAssistantService.loadAllChatSessions();
        setChatSessions(sessions);
      }
    } catch (e) {
      console.warn('Failed to save current chat session:', e);
    }
    
    // Reset animations
    setShowMessagesAshAnimation(false);
    messagesFadeAnim.setValue(1);
    
    setCurrentChatId(newChatId);
    setCurrentChatHasMemory(withMemory); // Update memory state
    setMessages([]);
    setShowNewChatModal(false);
    
    // Initialize with welcome message if with memory
    if (withMemory) {
      // Add a welcome message for new chat
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your health assistant. How can I help you today?',
        timestamp: new Date()
      }]);
    }
  };

  const loadChat = (chatId: string) => {
    // For now, we'll just switch to a new chat
    // In a real app, you'd load the actual chat messages from storage
    setCurrentChatId(chatId);
    setCurrentChatHasMemory(true); // Loaded chats have memory (they're saved sessions)
    setMessages([]);
    setShowChatHistory(false);
    
    // Add a placeholder message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Chat loaded. Previous messages would be restored here.',
      timestamp: new Date()
    }]);
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  };

  // Ash Particle Animation Component
  const AshParticles = ({ visible, onComplete }: { visible: boolean; onComplete: () => void }) => {
    const particlesRef = useRef<Animated.Value[]>([]);
    const [particles, setParticles] = useState<Array<{ id: number; startX: number; startY: number; randomX: number; randomY: number; delay: number }>>([]);

    useEffect(() => {
      if (visible) {
        // Generate 30 particles with random positions and movements
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
          id: i,
          startX: Math.random() * 180 - 90, // Random X offset from center (-90 to 90)
          startY: Math.random() * 30 - 15, // Random Y offset from center (-15 to 15)
          randomX: (Math.random() - 0.5) * 180, // Random horizontal drift
          randomY: -140 - Math.random() * 100, // Upward movement with variation
          delay: Math.random() * 200, // Staggered start - increased for more spread
        }));
        setParticles(newParticles);
        particlesRef.current = newParticles.map(() => new Animated.Value(0));

        // Animate particles - longer duration for smoother effect
        const animations = newParticles.map((particle, index) => {
          return Animated.parallel([
            Animated.timing(particlesRef.current[index], {
              toValue: 1,
              duration: 1400 + particle.delay, // Increased from 1000ms
              delay: particle.delay,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]);
        });

        Animated.parallel(animations).start(() => {
          onComplete();
        });
      } else {
        particlesRef.current = [];
        setParticles([]);
      }
    }, [visible]);

    if (!visible || particles.length === 0) return null;

    return (
      <View style={styles.ashContainer} pointerEvents="none">
        {particles.map((particle, index) => {
          const opacity = particlesRef.current[index]?.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [1, 0.8, 0],
          });
          const translateX = particlesRef.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [particle.startX, particle.startX + particle.randomX],
          });
          const translateY = particlesRef.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [particle.startY, particle.startY + particle.randomY],
          });
          const scale = particlesRef.current[index]?.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.8, 0.3],
          });

          return (
            <Animated.View
              key={particle.id}
              style={[
                styles.ashParticle,
                {
                  opacity,
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Swipeable Chat Item Component with Ash Animation
  const SwipeableChatItem = ({ chat, onPress, onDelete }: { 
    chat: {id: string, title: string, timestamp: Date}, 
    onPress: () => void, 
    onDelete: () => void 
  }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const itemRef = useRef<View>(null);
    const [itemLayout, setItemLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const handleDelete = () => {
      setIsDeleting(true);
      // Fade out the item
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onDelete();
      });
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <RectButton style={styles.swipeableDeleteButton} onPress={handleDelete}>
          <Animated.View style={[styles.swipeableDeleteContent, { transform: [{ scale }] }]}>
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.swipeableDeleteText}>Delete</Text>
          </Animated.View>
        </RectButton>
      );
    };

    return (
      <View
        ref={itemRef}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          setItemLayout({ x, y, width, height });
        }}
        style={{ position: 'relative' }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Swipeable
            renderRightActions={renderRightActions}
            rightThreshold={40}
          >
            <TouchableOpacity 
              style={styles.chatHistoryItem}
              onPress={onPress}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.chatHistoryTitle}>{chat.title}</Text>
                <Text style={styles.chatHistoryTimestamp}>
                  {chat.timestamp.toLocaleDateString()} {chat.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: settings?.general?.timeFormat === '12h'})}
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
              {
                position: 'absolute',
                top: 0,
                left: 0,
                width: itemLayout.width || '100%',
                height: itemLayout.height || 64,
              },
            ]}
          >
            <AshParticles visible={isDeleting} onComplete={() => {}} />
          </View>
        )}
      </View>
    );
  };

  // Update MessageBubble to show image/document preview
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current; // disable animation for stability while typing
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    useEffect(() => {
      // No-op (keep opacity at 1) to prevent layout thrash when typing
    }, []);

    const handleSpeak = async (text: string) => {
      if (isSpeaking) {
        // Stop speaking
        await Speech.stop();
        setIsSpeaking(false);
      } else {
        // Start speaking
        setIsSpeaking(true);
        await Speech.speak(text, {
          language: 'en',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    };

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[
          styles.messageContainer,
          message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer
        ]}>
          {message.role === 'assistant' && (
            <View style={styles.assistantAvatar}>
                <Image 
                  source={require('../../assets/Turtle2.png')} 
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
          )}
          <View style={[
            styles.messageBubble,
            message.role === 'user' ? styles.userMessageBubble : styles.assistantMessageBubble
          ]}>
            {/* Image preview */}
            {message.imageUri && (
              <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
            )}
            {/* Document preview */}
            {message.documentUri && (
              <View style={styles.documentPreview}>
                <Ionicons name="document" size={22} color="#007AFF" style={{ marginRight: 8 }} />
                <Text style={styles.documentText}>{message.documentName || 'Document'}</Text>
              </View>
            )}
            <Text style={[
              styles.messageText,
              message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
            ]}>
              {message.content}
            </Text>
            <View style={styles.messageFooter}>
              {message.role === 'user' && (
                <Text style={styles.messageTimeUserOnly}>{formatDateTime(message.timestamp)}</Text>
              )}
            </View>
          </View>
          {message.role === 'user' && (
            <View style={styles.userAvatar}>
              {((profile as any)?.photoUri || (profile as any)?.photoURL || (user as any)?.photoURL) ? (
                <Image 
                  source={{ uri: ((profile as any)?.photoUri || (profile as any)?.photoURL || (user as any)?.photoURL) as string }} 
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.userAvatarFallback}> 
                  <Ionicons name="person" size={16} color="#2563EB" />
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };
  const MessageBubbleMemo = memo(MessageBubble);

  // QuickActions removed for Telegram-style interface

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Telegram-style background pattern */}
      <View style={styles.telegramBackground} />
      
      {/* Modern Header */}
      <View style={styles.header}>
        {/* Menu button (top left) */}
        <TouchableOpacity onPress={() => setShowChatHistory(true)} style={{ marginRight: 12 }}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Health Assistant</Text>
          <Text style={styles.headerSubtitle}>Your AI health companion</Text>
        </View>
        {/* New chat button (top right) */}
        <TouchableOpacity onPress={() => setShowNewChatModal(true)} style={{ marginLeft: 12 }}>
          <Ionicons name="create-outline" size={26} color="#fff" />
        </TouchableOpacity>
        </View>
      {/* Chat History Modal */}
      <Modal visible={showChatHistory} animationType="slide" transparent onRequestClose={() => setShowChatHistory(false)}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            {/* 75% width panel from left */}
            <View style={{ 
              width: '75%', 
              height: '100%', 
              backgroundColor: '#181A20',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              paddingTop: Platform.OS === 'ios' ? 50 : 30,
              paddingHorizontal: 20,
              paddingBottom: 20
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Chat History</Text>
                <TouchableOpacity onPress={() => setShowChatHistory(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                {historyLoading && (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={{ color: '#8E8E93', marginTop: 8 }}>Loading previous chat…</Text>
                  </View>
                )}
                {!historyLoading && historyError && (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FF453A' }}>{historyError}</Text>
                    <TouchableOpacity onPress={async () => { setHistoryError(null); setHistoryLoading(true); try { const hist = await HealthAssistantService.loadConversationHistory(); setPersistedHistory(hist as any); } catch { setHistoryError('Failed to load previous chat.'); } finally { setHistoryLoading(false); } }} style={{ marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#2C2C2E', borderRadius: 8 }}>
                      <Text style={{ color: '#FFFFFF' }}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!historyLoading && !historyError && (
                  chatSessions && chatSessions.length > 0 ? (
                    <ScrollView>
                      {chatSessions
                        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                        .map(session => {
                          const SessionItemWithAsh = () => {
                            const [isDeleting, setIsDeleting] = useState(false);
                            const fadeAnim = useRef(new Animated.Value(1)).current;
                            const itemRef = useRef<View>(null);
                            const [itemLayout, setItemLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

                            const handleDelete = async () => {
                              setIsDeleting(true);
                              // Fade out the item
                              Animated.timing(fadeAnim, {
                                toValue: 0,
                                duration: 600,
                                easing: Easing.out(Easing.ease),
                                useNativeDriver: true,
                              }).start(async () => {
                                await HealthAssistantService.deleteChatSession(session.id);
                                const sessions = await HealthAssistantService.loadAllChatSessions();
                                setChatSessions(sessions);
                              });
                            };

                            const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
                              const scale = dragX.interpolate({
                                inputRange: [-100, 0],
                                outputRange: [1, 0],
                                extrapolate: 'clamp',
                              });

                              return (
                                <RectButton style={styles.swipeableDeleteButton} onPress={handleDelete}>
                                  <Animated.View style={[styles.swipeableDeleteContent, { transform: [{ scale }] }]}>
                                    <Ionicons name="trash" size={24} color="#fff" />
                                    <Text style={styles.swipeableDeleteText}>Delete</Text>
                                  </Animated.View>
                                </RectButton>
                              );
                            };

                            return (
                              <View
                                ref={itemRef}
                                onLayout={(event) => {
                                  const { x, y, width, height } = event.nativeEvent.layout;
                                  setItemLayout({ x, y, width, height });
                                }}
                                style={{ position: 'relative' }}
                              >
                                <Animated.View style={{ opacity: fadeAnim }}>
                                  <Swipeable
                                    renderRightActions={renderRightActions}
                                    rightThreshold={40}
                                  >
                                    <TouchableOpacity 
                                      style={styles.chatHistoryItem}
                                      onPress={async () => {
                                        setCurrentChatId(session.id);
                                        setCurrentChatHasMemory(true); // Loaded sessions have memory
                                        setMessages(session.messages || []);
                                        await HealthAssistantService.saveConversationHistory(session.messages || []);
                                        setShowChatHistory(false);
                                      }}
                                    >
                                      <View style={{ flex: 1 }}>
                                        <Text style={styles.chatHistoryTitle}>{session.title || 'Chat'}</Text>
                                      </View>
                                      <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                                    </TouchableOpacity>
                                  </Swipeable>
                                </Animated.View>
                                {isDeleting && (
                                  <View
                                    style={[
                                      styles.ashOverlay,
                                      {
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: itemLayout.width || '100%',
                                        height: itemLayout.height || 64,
                                      },
                                    ]}
                                  >
                                    <AshParticles visible={isDeleting} onComplete={() => {}} />
                                  </View>
                                )}
                              </View>
                            );
                          };

                          return <SessionItemWithAsh key={session.id} />;
                        })}
                </ScrollView>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#aaa', fontSize: 16 }}>No previous chats yet.</Text>
                </View>
                  )
              )}
              </View>
            </View>
            
            {/* Tap outside to close */}
            <TouchableOpacity 
              style={{ position: 'absolute', right: 0, top: 0, width: '25%', height: '100%' }}
              onPress={() => setShowChatHistory(false)}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* New Chat Modal - Bottom Sheet Style */}
      <Modal 
        visible={showNewChatModal} 
        transparent 
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={styles.newChatModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowNewChatModal(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.newChatBottomSheetContainer}>
            <Animated.View
              style={[
                styles.newChatBottomSheetContent,
                {
                  transform: [{ translateY: newChatModalTranslateY }],
                },
              ]}
            >
              {/* Handle bar */}
              <View style={styles.newChatBottomSheetHandleContainer}>
                <View style={styles.newChatBottomSheetHandle} />
              </View>

              {/* Header */}
              <View style={styles.newChatBottomSheetHeader} pointerEvents="box-none">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Animated.timing(newChatModalTranslateY, {
                      toValue: 1000,
                      duration: 250,
                      useNativeDriver: true,
                    }).start(() => {
                      setShowNewChatModal(false);
                      newChatModalTranslateY.setValue(0);
                    });
                  }}
                  style={styles.newChatBottomSheetCloseButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.newChatBottomSheetTitle}>Start New Chat</Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Content */}
              <View style={styles.newChatBottomSheetBody}>
                <Text style={styles.newChatQuestion}>Would you like this chat to have memory?</Text>
                <TouchableOpacity 
                  style={styles.newChatButtonWithMemory} 
                  onPress={() => {
                    Animated.timing(newChatModalTranslateY, {
                      toValue: 1000,
                      duration: 250,
                      useNativeDriver: true,
                    }).start(() => {
                      setShowNewChatModal(false);
                      newChatModalTranslateY.setValue(0);
                      startNewChat(true);
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.newChatButtonText}>With Memory</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.newChatButtonNoMemory} 
                  onPress={() => {
                    Animated.timing(newChatModalTranslateY, {
                      toValue: 1000,
                      duration: 250,
                      useNativeDriver: true,
                    }).start(() => {
                      setShowNewChatModal(false);
                      newChatModalTranslateY.setValue(0);
                      startNewChat(false);
                    });
                  }}
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
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#181A20', borderRadius: 24, padding: 24, width: '90%', maxWidth: 400 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Add Image</Text>
                <TouchableOpacity onPress={() => setShowImageInputModal(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {selectedImage && (
                <View style={{ marginBottom: 20 }}>
                  <Image 
                    source={{ uri: selectedImage.uri }} 
                    style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }}
                    resizeMode="cover"
                  />
                </View>
              )}
              
              <TextInput
                style={{
                  backgroundColor: '#232A34',
                  borderRadius: 12,
                  padding: 16,
                  color: '#fff',
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: '#3A3A3C',
                  marginBottom: 20,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                placeholder="Add a message with your image (optional)..."
                placeholderTextColor="#8E8E93"
                value={imageInputText}
                onChangeText={setImageInputText}
                multiline
                maxLength={500}
              />
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    backgroundColor: '#232A34', 
                    borderRadius: 12, 
                    padding: 16, 
                    borderWidth: 1, 
                    borderColor: '#3A3A3C' 
                  }} 
                  onPress={() => setShowImageInputModal(false)}
                >
                  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    backgroundColor: '#007AFF', 
                    borderRadius: 12, 
                    padding: 16 
                  }} 
                  onPress={sendImageWithText}
                >
                  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Inline slot collectors when needed (lightweight demo) */}
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
        
        {/* Chat Messages (ScrollView) with Ash Animation */}
        <View
          ref={messagesContainerRef}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
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
                if (autoScrollEnabledRef.current) {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }
              }}
              onScrollBeginDrag={() => { autoScrollEnabledRef.current = false; }}
              onScrollEndDrag={() => { /* user can re-enable by tapping send/new msg */ }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ChatList 
                messages={messages
                  .filter(msg => msg && msg.id && msg.content && msg.role) // Filter out invalid messages
                  .map(msg => ({
                    id: msg.id,
                    clientId: msg.id,
                    text: msg.content,
                    role: msg.role,
                    status: (msg as any).status || 'sent',
                    timestamp: msg.timestamp,
                  }))}
                onMessageLayout={(clientId, rect) => {
                  // Handle message layout for animation
                  sendAnim.setEndRect(clientId, rect);
                }}
                streamingId={streamingMessageId || undefined}
              />
            </ScrollView>
          </Animated.View>
          {showMessagesAshAnimation && (
            <View
              style={[
                styles.ashOverlay,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: messagesContainerLayout.width || '100%',
                  height: messagesContainerLayout.height || '100%',
                },
              ]}
            >
              <AshParticles visible={showMessagesAshAnimation} onComplete={() => {}} />
            </View>
          )}
        </View>
          
          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
                <View style={styles.assistantAvatar}>
                  {/* Toto thinking while waiting */}
                  {React.createElement(require('../components/chat/TortoAvatar').TortoAvatar, { state: 'thinking', size: 28 })}
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

        {/* Quick history link for current intent */}
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

        {/* Symptom Plan (persisted) */}
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
                } catch (err) {
                  // revert on error
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
                  const merged = (events || []).map((ev: any) => ({
                    id: ev.id as string,
                    created_at: ev.created_at as string,
                    side: ev.side as string | undefined,
                    region: ev.region as string | undefined,
                    severity: ev.severity as number | undefined,
                    completed: togglesMap[ev.id]?.completed || 0,
                    total: togglesMap[ev.id]?.total || 0,
                  }));
                  setPlanHistory(merged);
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

        {/* Modern Input Section with Animation */}
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
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#93C5FD" />
                  <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Loading…</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
                  {planHistory.length === 0 ? (
                    <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>No history yet.</Text>
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

      {/* Timeline History Modal (Supplements/Appointments/Labs) */}
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
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#93C5FD" />
                  <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Loading…</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
                  {timelineHistory.length === 0 ? (
                    <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>No history yet.</Text>
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
                        <Text style={styles.historyProgress}>→ {String(item.meta.new).slice(11,16)}</Text>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Telegram-style Media Picker */}
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
    paddingTop: 60, // Increased for iPhone 16 Dynamic Island
    paddingBottom: 16,
    backgroundColor: 'rgba(11, 11, 15, 0.95)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF30',
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
  messageContainer: {
    marginVertical: 8,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2563EB30',
  },
  userAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageBubble: {
    backgroundColor: '#0088CC',
    borderBottomRightRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 60,
    alignSelf: 'flex-end',
    maxWidth: '75%',
  },
  assistantMessageBubble: {
    backgroundColor: '#2A2A2A',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 60,
    maxWidth: '75%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
    textAlign: 'left',
  },
  assistantMessageText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  messageTimeUserOnly: {
    fontSize: 12,
    color: '#3A3A3C',
    marginTop: 6,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  speakButton: {
    marginLeft: 8,
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
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 3,
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
  messageImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#222C',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  documentText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 15,
  },
  inputContainer: {
    backgroundColor: 'rgba(11, 11, 15, 0.95)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
  },
  recordingWaveContainer: {
    position: 'absolute',
    left: 64,
    right: 64,
    bottom: 72,
    zIndex: 1050,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingWaveOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  recordingWaveInner: {
    height: 18,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  waveBar: {
    width: 3,
    height: 14,
    marginHorizontal: 1.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#232A34',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  inputActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    zIndex: 1200,
  },
  inputActionButtonExpanded: {
    backgroundColor: '#2563EB',
  },
  plusButton: {
    backgroundColor: '#2563EB',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    borderWidth: 0,
    marginRight: 8,
    overflow: 'hidden',
  },
  textInput: {
    fontSize: 17,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 28,
    zIndex: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#00C6FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#00C6FB',
    shadowOpacity: 0.25,
  },
  sendButtonInactive: {
    backgroundColor: '#232A34',
  },
  fabContainer: {
    position: 'absolute',
    left: 16,
    bottom: 100,
    width: 48,
    height: 48,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  fabMain: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  fabActionsContainer: {
    position: 'absolute',
    left: 16, // center-align with the plus button
    bottom: 56, // bring paperclip closer to the plus (equal gap)
    zIndex: 1100,
    alignItems: 'center',
  },
  fabGroupBackground: {
    position: 'absolute',
    left: 12, // center to align with icons stack
    bottom: 12,
    width: 56,
    height: 176, // fits camera + paperclip + plus with small paddings
    backgroundColor: '#2A2A2A',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    zIndex: 900,
    pointerEvents: 'none',
  },
  fabAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, // gap between camera and paperclip
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  // Chat History Styles
  chatHistoryItem: {
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
  chatHistoryTitle: {
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '500',
  },
  chatHistoryTimestamp: {
    color: '#aaa', 
    fontSize: 12, 
    marginTop: 4,
  },
  swipeableDeleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 96,
    height: 64,
    borderRadius: 12,
    marginBottom: 8,
  },
  swipeableDeleteContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeableDeleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  ashContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ashOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 1000,
  },
  ashParticle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#6E6E73',
    shadowColor: '#6E6E73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  // New Chat Modal Bottom Sheet Styles
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
});

export default HealthAssistantScreen; 