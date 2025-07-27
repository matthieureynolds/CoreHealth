import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../context/HealthDataContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { OPENAI_API_KEY, HealthAssistantService } from '../services/healthAssistantService';
import * as Speech from 'expo-speech';
import * as DocumentPicker from 'expo-document-picker';

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
  const { profile, biomarkers, healthScore } = useHealthData();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [deletePreviousChat, setDeletePreviousChat] = useState(false);
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
            // Show personalized greeting for new conversations
            const greeting = await HealthAssistantService.getPersonalizedGreeting(
              profile,
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
        } catch (error) {
          console.error('Error initializing conversation:', error);
          // Fallback greeting
          setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hi there! 👋 I'm your health assistant. I'm here to help you understand your health data and chat about anything health-related. What's on your mind today?`,
            timestamp: new Date(),
          }]);
        }
        setIsInitialized(true);
      }
    };

    initializeConversation();
  }, [isInitialized, profile, biomarkers, healthScore]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Use the improved HealthAssistantService
      const response = await HealthAssistantService.chatWithAssistant(
        inputText.trim(),
        messages,
        { profile, biomarkers, healthScore }
      );
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert('Error', 'Failed to get response from health assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input handler with speech-to-text simulation
  const handleVoiceInput = async () => {
    try {
      // Show recording indicator
      setIsRecording(true);
      
      // Simulate voice recording with a loading state
      Alert.alert(
        'Voice Input',
        'Voice recording started. Tap "Start Recording" to begin.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsRecording(false)
          },
          {
            text: 'Start Recording',
            onPress: () => {
              // Simulate recording process
              setTimeout(() => {
                // For demo purposes, set a sample transcribed text
                const sampleTranscriptions = [
                  "How can I improve my sleep quality?",
                  "What should I eat for better energy?",
                  "Can you analyze my recent lab results?",
                  "What exercises are good for heart health?",
                  "How do I manage stress better?"
                ];
                
                const randomText = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
                setInputText(randomText);
                setIsRecording(false);
                
                // Provide feedback
                Alert.alert('Voice Input', `Transcribed: "${randomText}"`);
              }, 2000); // 2 second delay to simulate processing
            }
          }
        ]
      );
    } catch (error) {
      setIsRecording(false);
      Alert.alert('Error', 'Voice input failed. Please try again.');
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
      setIsLoading(true);
      try {
        // Add the image as a user message in the chat
        const userImageMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: '[Image]',
          timestamp: new Date(),
          imageUri: imageAsset.uri,
        };
        setMessages(prev => [...prev, userImageMessage]);

        // Prepare OpenAI API call with image
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
                      url: `data:${imageAsset.mimeType || 'image/jpeg'};base64,${imageAsset.base64}`
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
        const aiContent = data.choices[0]?.message?.content || '[No analysis returned]';

        // Add the assistant's reply to chat
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        Alert.alert('Error', 'Failed to analyze image.');
      } finally {
        setIsLoading(false);
      }
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
        // For images, send to OpenAI Vision; for PDFs, send to Google OCR + GPT
        let aiContent = '[No analysis returned]';
        if (asset.mimeType && asset.mimeType.startsWith('image/')) {
          // Read as base64
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
            aiContent = data.choices[0]?.message?.content || '[No analysis returned]';
          }
        } else {
          // For PDFs, just show a placeholder (OCR pipeline can be added later)
          aiContent = 'Document received. PDF analysis is coming soon!';
        }
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
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
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.9,
    });
  };

  // Chat management functions
  const startNewChat = (withMemory: boolean) => {
    const newChatId = `chat_${Date.now()}`;
    const chatTitle = `Chat ${chatHistory.length + 1}`;
    
    if (deletePreviousChat) {
      setMessages([]);
      setChatHistory([]);
    } else {
      // Save current chat to history if it has messages
      if (messages.length > 0) {
        const currentChatTitle = messages[0]?.content.substring(0, 30) + '...' || 'Chat';
        setChatHistory(prev => [...prev, {
          id: currentChatId,
          title: currentChatTitle,
          timestamp: new Date()
        }]);
      }
    }
    
    setCurrentChatId(newChatId);
    setMessages([]);
    setShowNewChatModal(false);
    setDeletePreviousChat(false);
    
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

  // Swipeable Chat Item Component
  const SwipeableChatItem = ({ chat, onPress, onDelete }: { 
    chat: {id: string, title: string, timestamp: Date}, 
    onPress: () => void, 
    onDelete: () => void 
  }) => {
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <RectButton style={styles.swipeableDeleteButton} onPress={onDelete}>
          <Animated.View style={[styles.swipeableDeleteContent, { transform: [{ scale }] }]}>
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.swipeableDeleteText}>Delete</Text>
          </Animated.View>
        </RectButton>
      );
    };

    return (
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
              {chat.timestamp.toLocaleDateString()} {chat.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Update MessageBubble to show image/document preview
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, []);
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }}
      >
        <View style={[
          styles.messageContainer,
          message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer
        ]}>
          {message.role === 'assistant' && (
            <View style={styles.assistantAvatar}>
              <Image 
                source={require('../../assets/Turtle.png')} 
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
              <Text style={styles.messageTime}>{formatDateTime(message.timestamp)}</Text>
              {message.role === 'assistant' && (
                <TouchableOpacity onPress={() => speak(message.content)} style={styles.speakButton}>
                  <Ionicons name="volume-medium" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Start</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('How are my biomarkers looking?')}
          activeOpacity={0.7}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="analytics" size={20} color="#007AFF" />
          </View>
          <Text style={styles.quickActionText}>Biomarkers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('What should I eat today?')}
          activeOpacity={0.7}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="nutrition" size={20} color="#30D158" />
          </View>
          <Text style={styles.quickActionText}>Nutrition</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('Give me a workout plan')}
          activeOpacity={0.7}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="fitness" size={20} color="#FF9500" />
          </View>
          <Text style={styles.quickActionText}>Exercise</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('How can I improve my sleep?')}
          activeOpacity={0.7}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="moon" size={20} color="#AF52DE" />
          </View>
          <Text style={styles.quickActionText}>Sleep</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
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
            paddingTop: 60,
            paddingHorizontal: 20
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowChatHistory(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {chatHistory.length > 0 ? (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {chatHistory.map((chat) => (
                  <SwipeableChatItem
                    key={chat.id}
                    chat={chat}
                    onPress={() => loadChat(chat.id)}
                    onDelete={() => deleteChat(chat.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#aaa', fontSize: 16 }}>No previous chats yet.</Text>
              </View>
            )}
          </View>
          
          {/* Tap outside to close */}
          <TouchableOpacity 
            style={{ position: 'absolute', right: 0, top: 0, width: '25%', height: '100%' }}
            onPress={() => setShowChatHistory(false)}
          />
        </View>
      </Modal>
      {/* New Chat Modal */}
      <Modal visible={showNewChatModal} animationType="fade" transparent onRequestClose={() => setShowNewChatModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#181A20', borderRadius: 24, padding: 28, width: 320 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Start New Chat</Text>
            <Text style={{ color: '#aaa', fontSize: 16, marginBottom: 24 }}>Would you like this chat to have memory?</Text>
            <TouchableOpacity style={{ backgroundColor: '#007AFF', borderRadius: 12, padding: 14, marginBottom: 12 }} onPress={() => startNewChat(true)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>With Memory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#232A34', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#444' }} onPress={() => startNewChat(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>No Memory (Incognito)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }} onPress={() => setDeletePreviousChat(v => !v)}>
              <Ionicons name={deletePreviousChat ? 'checkbox' : 'square-outline'} size={22} color={deletePreviousChat ? '#007AFF' : '#aaa'} />
              <Text style={{ color: '#fff', fontSize: 15, marginLeft: 8 }}>Delete previous chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNewChatModal(false)} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot1Anim }] }]} />
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot2Anim }] }]} />
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot3Anim }] }]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* FAB Actions (appear above input when plus is pressed) */}
        {fabOpen && (
          <View style={styles.fabActionsContainer}>
            <TouchableOpacity style={styles.fabAction} onPress={() => { setFabOpen(false); handleImageInput(); }}>
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabAction} onPress={() => { setFabOpen(false); handleDocumentInput(); }}>
              <Ionicons name="attach" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Modern Input Section */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            {/* Plus button on the left */}
            <TouchableOpacity 
              style={styles.inputActionButton}
              onPress={toggleFab}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#8E8E93" />
            </TouchableOpacity>
            
            <View style={[
              styles.textInputContainer,
              isRecording && { borderColor: '#FF3B30', borderWidth: 2 }
            ]}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isRecording ? "Recording..." : "Ask me anything about health..."}
                placeholderTextColor={isRecording ? "#FF3B30" : "#8E8E93"}
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
                keyboardAppearance="dark"
                editable={!isRecording}
              />
            </View>
            
            {/* Microphone/Send button on the right */}
            <TouchableOpacity 
              style={[
                styles.inputActionButton,
                isRecording && { backgroundColor: '#FF3B30' }
              ]}
              onPress={inputText.trim() ? sendMessage : handleVoiceInput}
              activeOpacity={0.7}
              disabled={isRecording}
            >
              <Ionicons 
                name={inputText.trim() ? "arrow-up" : (isRecording ? "radio-button-on" : "mic")} 
                size={24} 
                color={inputText.trim() ? "#FFFFFF" : (isRecording ? "#FFFFFF" : "#8E8E93")} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32, // Match DashboardScreen
    paddingBottom: 2, // Match DashboardScreen
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  quickActionsContainer: {
    marginVertical: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActionsScroll: {
    paddingRight: 16,
  },
  quickActionButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
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
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#007AFF30',
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
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 8,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginLeft: 32, // more space from left
    alignSelf: 'flex-end',
    width: 'auto', // only as wide as text
  },
  assistantMessageBubble: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 40,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#000000',
  },
  speakButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  loadingBubble: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 3,
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
    backgroundColor: '#181A20',
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 32,
    margin: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
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
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#232A34',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginRight: 10,
  },
  textInput: {
    fontSize: 17,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 28,
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
    left: 16,
    bottom: 140,
    zIndex: 1000,
    alignItems: 'center',
  },
  fabAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#232A34',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#232A34',
    borderRadius: 12,
    marginBottom: 8,
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
    width: 80,
    height: '100%',
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
});

export default HealthAssistantScreen; 