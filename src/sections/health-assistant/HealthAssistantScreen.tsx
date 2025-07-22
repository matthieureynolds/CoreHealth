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
} from 'react-native';
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

  // Voice input handler (using expo-speech-to-text or placeholder)
  const handleVoiceInput = async () => {
    // Placeholder: In production, use a speech-to-text package or API
    Alert.alert('Voice Input', 'Voice input is not yet implemented.');
    // Example: setInputText(transcribedText);
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

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.9,
    });
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
              <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Health Assistant</Text>
          <Text style={styles.headerSubtitle}>Your AI health companion</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={24} color="#007AFF" />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Modern Input Section */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleImageInput}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDocumentInput}
              activeOpacity={0.7}
            >
              <Ionicons name="attach" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything about your health..."
                placeholderTextColor="#8E8E93"
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#FFFFFF" : "#8E8E93"} 
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
    paddingTop: 20,
    paddingBottom: 16,
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
    marginLeft: 40,
  },
  assistantMessageBubble: {
    backgroundColor: '#181A20',
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
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
    color: '#8E8E93',
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
});

export default HealthAssistantScreen; 