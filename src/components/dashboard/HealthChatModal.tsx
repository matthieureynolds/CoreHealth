import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthData } from '../../context/HealthDataContext';
import { HealthAssistantService, HealthChatMessage } from '../../services/healthAssistantService';

interface HealthChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const HealthChatModal: React.FC<HealthChatModalProps> = ({ visible, onClose }) => {
  const { profile, biomarkers, healthScore } = useHealthData();
  const [messages, setMessages] = useState<HealthChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && messages.length === 0) {
      initializeChat();
    }
  }, [visible]);

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      // Load existing conversation history
      const existingHistory = await HealthAssistantService.loadConversationHistory();
      
      if (existingHistory.length > 0) {
        // Resume existing conversation
        setMessages(existingHistory);
      } else {
        // Create personalized greeting
        const personalizedGreeting = await HealthAssistantService.getPersonalizedGreeting(
          profile,
          biomarkers,
          healthScore
        );
        
        const welcomeMessage: HealthChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: personalizedGreeting,
          timestamp: new Date(),
          metadata: {
            healthDataSnapshot: {
              healthScore: healthScore?.overall,
              biomarkerCount: biomarkers?.length || 0,
              lastUpdate: new Date()
            },
            topics: ['greeting', 'introduction']
          }
        };
        
        setMessages([welcomeMessage]);
        // Save the initial greeting
        await HealthAssistantService.saveConversationHistory([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Fallback to simple greeting
      const fallbackMessage: HealthChatMessage = {
        id: 'welcome-fallback',
        role: 'assistant',
        content: "Hi! I'm your AI health assistant. I can help you understand your health data and provide personalized recommendations. What would you like to know?",
        timestamp: new Date()
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
        healthDataSnapshot: {
          healthScore: healthScore?.overall,
          biomarkerCount: biomarkers?.length || 0,
          lastUpdate: new Date()
        }
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Pass health data to the enhanced service
      const response = await HealthAssistantService.chatWithAssistant(
        userMessage.content,
        [...messages, userMessage],
        { profile, biomarkers, healthScore }
      );

      const assistantMessage: HealthChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          healthDataSnapshot: {
            healthScore: healthScore?.overall,
            biomarkerCount: biomarkers?.length || 0,
            lastUpdate: new Date()
          }
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to get response from health assistant. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
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
          }
        }
      ]
    );
  };

  const renderMessage = (message: HealthChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {!isUser && (
            <View style={styles.assistantIcon}>
              <Ionicons name="medical" size={16} color="#007AFF" />
            </View>
          )}
          <View style={styles.messageContent}>
            <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
              {message.content}
            </Text>
            <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.assistantMessageTime]}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickQuestions = () => {
    // Enhanced quick questions based on user's health data
    const baseQuestions = [
      "How is my overall health?",
      "What should I focus on improving?",
      "Any concerning trends in my data?",
    ];

    const personalizedQuestions = [];
    
    // Add personalized questions based on health data
    if (healthScore?.overall && healthScore.overall < 80) {
      personalizedQuestions.push("How can I improve my health score?");
    }
    
    if (biomarkers?.length > 0) {
      personalizedQuestions.push("Explain my latest biomarker results");
    }

    const allQuestions = [...baseQuestions, ...personalizedQuestions].slice(0, 5);

    return (
      <View style={styles.quickQuestionsContainer}>
        <Text style={styles.quickQuestionsTitle}>Suggested Questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickQuestionButton}
              onPress={() => {
                setInputText(question);
              }}
            >
              <Text style={styles.quickQuestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHealthContext = () => {
    if (!healthScore && (!biomarkers || biomarkers.length === 0)) return null;

    return (
      <View style={styles.healthContextContainer}>
        <Text style={styles.healthContextTitle}>Current Health Context</Text>
        <View style={styles.healthContextRow}>
          {healthScore?.overall && (
            <View style={styles.healthContextItem}>
              <Ionicons name="fitness" size={16} color="#007AFF" />
              <Text style={styles.healthContextText}>Health Score: {healthScore.overall}</Text>
            </View>
          )}
          {biomarkers && biomarkers.length > 0 && (
            <View style={styles.healthContextItem}>
              <Ionicons name="analytics" size={16} color="#007AFF" />
              <Text style={styles.healthContextText}>{biomarkers.length} Biomarkers</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={20} color="#007AFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Health Assistant</Text>
                <Text style={styles.headerSubtitle}>AI-powered health insights</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton} onPress={clearConversation}>
                <Ionicons name="refresh" size={20} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Health Context */}
          {renderHealthContext()}

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {isInitializing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Preparing your personalized health assistant...</Text>
              </View>
            ) : (
              messages.map(renderMessage)
            )}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Analyzing your health data...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Questions */}
          {messages.length <= 2 && !isInitializing && renderQuickQuestions()}

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask about your health data..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading && !isInitializing}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading || isInitializing) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading || isInitializing}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={(!inputText.trim() || isLoading || isInitializing) ? "#8E8E93" : "#007AFF"} 
                />
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  healthContextContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  healthContextTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  healthContextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthContextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  healthContextText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  assistantMessageText: {
    backgroundColor: '#fff',
    color: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
  },
  assistantMessageTime: {
    color: '#8E8E93',
    marginLeft: 16,
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
  quickQuestionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  quickQuestionButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  quickQuestionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F2F2F7',
  },
});

export default HealthChatModal; 