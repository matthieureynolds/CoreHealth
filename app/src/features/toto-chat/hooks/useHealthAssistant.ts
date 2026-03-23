import { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { OPENAI_API_KEY, HealthAssistantService } from '../../../shared/services/ai/healthAssistantService';
import type { ChatSession } from '../../../shared/services/ai/healthAssistantService';
import { useSendAnimation } from '../../../shared/hooks/useSendAnimation';
import { parseAssistantCommand } from '../assistant/parser';
import { dispatch as dispatchCommand, postTimeline, togglesMark } from '../assistant/commandBus';
import type { Command } from '../assistant/commandBus';
import { supabase } from '../../../shared/config/supabase';
import type { ChatMessage } from '../types';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSettings } from '../../../shared/context/SettingsContext';

export function useHealthAssistant() {
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

  const [showMessagesAshAnimation, setShowMessagesAshAnimation] = useState(false);
  const messagesFadeAnim = useRef(new Animated.Value(1)).current;
  const messagesContainerRef = useRef<View>(null);
  const [messagesContainerLayout, setMessagesContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
    requestAnimationFrame(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); });
  };

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

  const [showImageInputModal, setShowImageInputModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageInputText, setImageInputText] = useState('');

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
      dot1Anim.setValue(0); dot2Anim.setValue(0); dot3Anim.setValue(0);
    }
  }, [isLoading]);

  const stripEmojis = (input: string) => {
    try { return input.replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, ''); } catch { return input; }
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
            const greeting = await HealthAssistantService.getPersonalizedGreeting(profileForAI as any, biomarkers || [], healthScore);
            setMessages([{ id: '1', role: 'assistant', content: greeting, timestamp: new Date() }]);
          }
          try { const sessions = await HealthAssistantService.loadAllChatSessions(); setChatSessions(sessions); } catch {}
        } catch {
          setMessages([{ id: '1', role: 'assistant', content: stripEmojis("Hello! I'm Toto. How can I help you today? I'm an AI health assistant for educational information and support — not a substitute for professional medical advice. Always consult your doctor for diagnosis or treatment."), timestamp: new Date() }]);
        }
        setIsInitialized(true);
      }
    };
    initializeConversation();
  }, [isInitialized, profile, biomarkers, healthScore]);

  useEffect(() => {
    const keyboardDidShowListener = require('react-native').Keyboard.addListener('keyboardDidShow', scrollToBottomNow);
    const keyboardDidHideListener = require('react-native').Keyboard.addListener('keyboardDidHide', () => {});
    return () => { keyboardDidShowListener?.remove(); keyboardDidHideListener?.remove(); };
  }, [showChatHistory]);

  useEffect(() => {
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (waveformTimer.current) { clearInterval(waveformTimer.current); waveformTimer.current = null; }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      const pulseAnimation = Animated.loop(Animated.sequence([
        Animated.timing(recordingPulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(recordingPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]));
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else { recordingPulseAnim.setValue(1); }
  }, [isRecording]);

  useEffect(() => {
    const now = Date.now();
    if ((now - lastAutoScrollAtRef.current) > 150) {
      lastAutoScrollAtRef.current = now;
      requestAnimationFrame(() => { scrollViewRef.current?.scrollToEnd({ animated: false }); });
    }
  }, [messages.length]);

  useEffect(() => {
    if (showNewChatModal) {
      newChatModalTranslateY.setValue(1000);
      Animated.spring(newChatModalTranslateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else { newChatModalTranslateY.setValue(0); }
  }, [showNewChatModal]);

  const persistSession = async (msgs: ChatMessage[]) => {
    const titleCandidate = (msgs.find(m => m.role === 'user')?.content || msgs[0]?.content || 'Chat').toString().slice(0, 30);
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
    const userMessage: ChatMessage = { id: generateId('u'), role: 'user', content: text.trim(), timestamp: new Date(), status: 'sending' };
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
      } catch (persistErr) { console.warn('Failed to persist conversation/session:', persistErr); }
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
      const { data, error } = await supabase.from('timeline_entries').select('id, occurred_at, title, meta, type').eq('type', type).order('occurred_at', { ascending: false }).limit(15);
      if (error) throw error;
      setTimelineHistory((data || []).map((row: any) => ({ id: row.id as string, occurred_at: row.occurred_at as string, title: row.title as string, meta: row.meta as any })));
    } catch { setTimelineHistory([]); } finally { setTimelineHistoryLoading(false); }
  };

  const logTimelineForCommand = async (cmd: Command, result: any) => {
    try {
      switch (cmd.type) {
        case 'SUPPLEMENT_VITC_RECOMMEND': { const dose = result?.recommendedDoseMg ?? cmd.payload?.dosePreferenceMg ?? 500; await postTimeline({ type: 'Supplement', title: `Vitamin C plan (${dose} mg)`, meta: { nutrient: 'vitamin_c', doseMg: dose, rationale: cmd.payload?.reason } }); break; }
        case 'APPT_RESCHEDULE_DENTIST': { await postTimeline({ type: 'Appointment', title: 'Dentist rescheduled', meta: { old: result?.oldDateTime, new: result?.newDateTime, status: result?.status } }); break; }
        case 'SYMPTOM_LOG_LEG_PAIN': { const side = cmd.payload?.side || 'unspecified'; const region = cmd.payload?.region || 'leg'; await postTimeline({ type: 'Symptom', title: `${side} ${region} pain logged`.replace(/^unspecified\s/i, ''), meta: { severity: cmd.payload?.severity, onset: cmd.payload?.onsetDate, planId: result?.symptomId } }); break; }
        case 'ALLERGY_UPDATE_PNUT': { await postTimeline({ type: 'Allergy', title: `Peanut allergy ${cmd.payload?.action}`, meta: { severity: cmd.payload?.severity, epiPen: cmd.payload?.epiPenOwned, status: result?.status } }); break; }
        case 'TRAVEL_ADD_COUNTRY_CARD': { await postTimeline({ type: 'Travel', title: `Country card added (${cmd.payload?.country})`, meta: { country: cmd.payload?.country, cardType: cmd.payload?.cardType } }); break; }
        case 'LAB_SUBMIT_RESULTS': { await postTimeline({ type: 'Lab', title: `New blood panel submitted (${cmd.payload?.panel})`, meta: { specimenDate: cmd.payload?.specimenDate, updatedCount: result?.updatedBiomarkers?.length } }); break; }
        case 'TRIP_CHANGE_DATES': { await postTimeline({ type: 'Travel', title: `Trip dates changed (${cmd.payload?.destination || 'Trip'})`, meta: { start: cmd.payload?.startDate, end: cmd.payload?.endDate } }); break; }
      }
    } catch (e) { console.warn('Timeline write failed:', e); }
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
        try { ((result as any).plan.steps || []).forEach((s: any) => { if (s?.toggleKey) init[s.toggleKey] = false; }); } catch {}
        setToggleState(init);
      }
      Alert.alert('Done', `${humanizeCommand(pendingCommand)} completed.`);
      setPendingCommand(null);
    } catch (e: any) {
      Alert.alert('Action failed', e?.message || 'Unable to complete the action.');
    } finally { setIsDispatching(false); }
  };

  const handleImageSelected = (uri: string) => {
    setMessages(prev => [...prev, { id: generateId('u'), role: 'user', content: '[Image]', timestamp: new Date(), imageUri: uri }]);
  };

  const handleDocumentSelected = (uri: string, name: string) => {
    setMessages(prev => [...prev, { id: generateId('u'), role: 'user', content: `[Document: ${name}]`, timestamp: new Date(), documentUri: uri, documentName: name }]);
  };

  const handleVoiceInput = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Please grant microphone permissions to use voice input.'); return; }
      if (isRecording) {
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null); setIsRecording(false);
            if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
            setRecordingDuration(0);
            if (waveformTimer.current) { clearInterval(waveformTimer.current); waveformTimer.current = null; }
            waveformAnimValues.forEach((v) => { Animated.timing(v, { toValue: 0.3, duration: 150, useNativeDriver: true }).start(); });
            if (uri) {
              try {
                const form = new FormData();
                // @ts-ignore
                form.append('file', { uri, name: 'audio.m4a', type: 'audio/m4a' } as any);
                form.append('model', 'gpt-4o-transcribe');
                form.append('response_format', 'json');
                const res = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, body: form as any });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setInputText((data.text ?? '').trim());
              } catch (txErr) { console.error('Transcription error:', txErr); Alert.alert('Transcription failed', 'Could not transcribe audio. Please try again.'); }
            }
          } catch (stopError) { console.error('Error stopping recording:', stopError); Alert.alert('Error', 'Failed to stop recording. Please try again.'); }
        }
      } else {
        try {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const recordingOptions: any = { ...(Audio.RecordingOptionsPresets.HIGH_QUALITY as any) };
          if (recordingOptions.ios) recordingOptions.ios.meteringEnabled = true;
          const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions as any);
          setRecording(newRecording); setIsRecording(true); setRecordingDuration(0);
          recordingTimer.current = setInterval(() => { setRecordingDuration(prev => prev + 1); }, 1000);
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
        } catch (startError) { console.error('Error starting recording:', startError); Alert.alert('Error', 'Failed to start recording. Please try again.'); setIsRecording(false); }
      }
    } catch (error) {
      console.error('Error with voice input:', error); setIsRecording(false); setRecording(null);
      if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
      setRecordingDuration(0); Alert.alert('Error', 'Failed to handle voice input. Please try again.');
    }
  };

  const handleImageInput = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7, base64: true });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]); setImageInputText(''); setShowImageInputModal(true);
    }
  };

  const sendImageWithText = async () => {
    if (!selectedImage) return;
    setIsLoading(true); setShowImageInputModal(false);
    try {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: imageInputText.trim() || '[Image]', timestamp: new Date(), imageUri: selectedImage.uri }]);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions.' },
            { role: 'user', content: [{ type: 'text', text: imageInputText.trim() || 'Please analyze this image and provide any relevant health insights or descriptions.' }, { type: 'image_url', image_url: { url: `data:${selectedImage.mimeType || 'image/jpeg'};base64,${selectedImage.base64}` } }] },
          ],
          max_tokens: 800,
        }),
      });
      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]'), timestamp: new Date() }]);
    } catch (error) {
      console.error('Error analyzing image:', error); Alert.alert('Error', 'Failed to analyze image.');
    } finally { setIsLoading(false); setSelectedImage(null); setImageInputText(''); }
  };

  const handleDocumentInput = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setIsLoading(true);
      try {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: asset.name || '[Document]', timestamp: new Date(), documentName: asset.name, documentUri: asset.uri }]);
        let aiContent = '[No analysis returned]';
        if (asset.mimeType && asset.mimeType.startsWith('image/')) {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
          const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` }, body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: 'You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions.' }, { role: 'user', content: [{ type: 'text', text: 'Please analyze this image and provide any relevant health insights or descriptions.' }, { type: 'image_url', image_url: { url: `data:${asset.mimeType || 'image/jpeg'};base64,${base64}` } }] }], max_tokens: 800 }) });
          if (response.ok) { const data = await response.json(); aiContent = stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]'); }
        } else if (asset.mimeType === 'application/pdf') {
          try {
            const pdfText = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });
            if (pdfText.length >= 100) { const aiResponse = await HealthAssistantService.chatWithAssistant(`Please analyze this PDF document and provide health insights: ${pdfText.substring(0, 4000)}`, undefined, { profile, biomarkers, healthScore }); aiContent = stripEmojis(aiResponse); }
            else { aiContent = "I received your PDF but couldn't extract readable text from it — this can happen with scanned or encrypted PDFs. You could try sharing the key information as text instead, or I can help answer questions based on what you tell me about it."; }
          } catch { aiContent = "I received your PDF but had trouble reading it. You could try sharing the key information as text instead."; }
        }
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: stripEmojis(aiContent), timestamp: new Date() }]);
      } catch (error) { console.error('Error analyzing document:', error); Alert.alert('Error', 'Failed to analyze document.'); }
      finally { setIsLoading(false); }
    }
  };

  const dismissNewChatModal = () => {
    Animated.timing(newChatModalTranslateY, { toValue: 1000, duration: 250, useNativeDriver: true }).start(() => {
      setShowNewChatModal(false); newChatModalTranslateY.setValue(0);
    });
  };

  const startNewChat = async (withMemory: boolean) => {
    if (!currentChatHasMemory && messages.length > 0) {
      setShowMessagesAshAnimation(true);
      Animated.timing(messagesFadeAnim, { toValue: 0, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
      setTimeout(async () => { await proceedWithNewChat(withMemory); }, 1600);
    } else { await proceedWithNewChat(withMemory); }
  };

  const proceedWithNewChat = async (withMemory: boolean) => {
    const newChatId = `chat_${Date.now()}`;
    try { if (messages.length > 0 && currentChatHasMemory) { await persistSession(messages); } } catch (e) { console.warn('Failed to save current chat session:', e); }
    setShowMessagesAshAnimation(false); messagesFadeAnim.setValue(1);
    setCurrentChatId(newChatId); setCurrentChatHasMemory(withMemory); setMessages([]); setShowNewChatModal(false);
    if (withMemory) { setMessages([{ id: '1', role: 'assistant', content: "Hello! I'm your health assistant. How can I help you today?", timestamp: new Date() }]); }
  };

  const loadSession = async (session: ChatSession) => {
    setCurrentChatId(session.id); setCurrentChatHasMemory(true);
    setMessages((session.messages || []) as ChatMessage[]);
    await HealthAssistantService.saveConversationHistory(session.messages || []);
    setShowChatHistory(false);
  };

  const retryLoadHistory = async () => {
    setHistoryError(null); setHistoryLoading(true);
    try { const sessions = await HealthAssistantService.loadAllChatSessions(); setChatSessions(sessions); }
    catch { setHistoryError('Failed to load previous chats.'); }
    finally { setHistoryLoading(false); }
  };

  const handleLoadPlanHistory = async () => {
    setShowPlanHistory(true); setPlanHistoryLoading(true);
    try {
      const { data: events, error: e1 } = await supabase.from('symptom_events').select('id, created_at, side, region, severity').eq('kind', 'leg_pain').order('created_at', { ascending: false }).limit(10);
      if (e1) throw e1;
      const ids = (events || []).map((ev: any) => ev.id);
      let togglesMap: Record<string, { total: number; completed: number }> = {};
      if (ids.length > 0) {
        const { data: toggles, error: e2 } = await supabase.from('symptom_toggles').select('symptom_id, toggle_key, completed').in('symptom_id', ids);
        if (e2) throw e2;
        (toggles || []).forEach((t: any) => {
          const key = t.symptom_id as string;
          if (!togglesMap[key]) togglesMap[key] = { total: 0, completed: 0 };
          togglesMap[key].total += 1;
          if (t.completed) togglesMap[key].completed += 1;
        });
      }
      setPlanHistory((events || []).map((ev: any) => ({ id: ev.id as string, created_at: ev.created_at as string, side: ev.side as string | undefined, region: ev.region as string | undefined, severity: ev.severity as number | undefined, completed: togglesMap[ev.id]?.completed || 0, total: togglesMap[ev.id]?.total || 0 })));
    } catch { setPlanHistory([]); } finally { setPlanHistoryLoading(false); }
  };

  return {
    // Context data
    profile,
    biomarkers,
    healthScore,
    deviceData,
    labResults,
    bodySystems,
    travelHealth,
    settings,
    user,
    // State
    messages,
    isInitialized,
    inputText,
    setInputText,
    sendAnim,
    showMediaPicker,
    setShowMediaPicker,
    isLoading,
    scrollViewRef,
    autoScrollEnabledRef,
    isRecording,
    showChatHistory,
    setShowChatHistory,
    showNewChatModal,
    setShowNewChatModal,
    newChatModalTranslateY,
    chatSessions,
    setChatSessions,
    currentChatId,
    currentChatHasMemory,
    historyLoading,
    historyError,
    showMessagesAshAnimation,
    messagesFadeAnim,
    messagesContainerRef,
    messagesContainerLayout,
    setMessagesContainerLayout,
    recordingDuration,
    waveformAnimValues,
    recordingPulseAnim,
    streamingMessageId,
    pendingCommand,
    setPendingCommand,
    isDispatching,
    activeSymptomPlan,
    activeSymptomId,
    toggleState,
    setToggleState,
    showPlanHistory,
    setShowPlanHistory,
    planHistoryLoading,
    planHistory,
    showTimelineHistory,
    setShowTimelineHistory,
    timelineHistoryLoading,
    timelineHistory,
    timelineHistoryTitle,
    showImageInputModal,
    setShowImageInputModal,
    selectedImage,
    imageInputText,
    setImageInputText,
    dot1Anim,
    dot2Anim,
    dot3Anim,
    // Handlers
    handleSendWithAnimation,
    humanizeCommand,
    openTimelineHistory,
    confirmPendingCommand,
    handleImageSelected,
    handleDocumentSelected,
    handleVoiceInput,
    handleImageInput,
    sendImageWithText,
    handleDocumentInput,
    dismissNewChatModal,
    startNewChat,
    loadSession,
    retryLoadHistory,
    handleLoadPlanHistory,
    scrollToBottomNow,
  };
}
