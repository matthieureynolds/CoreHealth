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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../context/HealthDataContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { OPENAI_API_KEY } from '../services/healthAssistantService';
import * as Speech from 'expo-speech';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const HealthAssistantScreen: React.FC = () => {
  const { profile } = useHealthData();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${user?.displayName || 'there'}! I'm your AI health assistant. I can help you understand your health data, answer questions about your biomarkers, provide health insights, and discuss your medical history. What would you like to know today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');

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
      // Simulate OpenAI API call
      const response = await simulateHealthAssistantResponse(inputText, profile);
      
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

  const simulateHealthAssistantResponse = async (query: string, userProfile: any): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerQuery = query.toLowerCase();

    // Health-specific responses based on user profile and query
    if (lowerQuery.includes('biomarker') || lowerQuery.includes('blood') || lowerQuery.includes('test')) {
      return `Based on your profile, I can help you understand biomarkers. Common important biomarkers include glucose (blood sugar), cholesterol levels (LDL, HDL), and inflammatory markers like hs-CRP. 

If you have recent lab results, I can help interpret them in context of your age (${userProfile?.age || 'not specified'}) and health goals. What specific biomarkers are you interested in learning about?`;
    }

    if (lowerQuery.includes('diet') || lowerQuery.includes('nutrition') || lowerQuery.includes('food')) {
      const dietType = userProfile?.lifestyle?.diet?.type || 'not specified';
      return `For nutrition guidance, I see your diet preference is "${dietType}". A balanced approach includes:

• Plenty of vegetables and fruits
• Lean proteins appropriate for your dietary choices
• Whole grains and healthy fats
• Adequate hydration

${dietType !== 'not specified' ? `Since you follow a ${dietType} diet, I can provide specific recommendations for that lifestyle.` : ''} What specific nutrition questions do you have?`;
    }

    if (lowerQuery.includes('exercise') || lowerQuery.includes('workout') || lowerQuery.includes('fitness')) {
      const exerciseFreq = userProfile?.lifestyle?.exercise?.frequency || 'not specified';
      return `Exercise is crucial for health! I see your current activity level is "${exerciseFreq}". 

General recommendations include:
• 150 minutes moderate aerobic activity weekly
• 2+ days of strength training
• Flexibility and balance exercises

${exerciseFreq !== 'not specified' && exerciseFreq !== 'never' ? 'Great job staying active!' : 'Consider starting with light activities like walking and gradually building up.'} 

What type of exercise are you interested in or currently doing?`;
    }

    if (lowerQuery.includes('sleep') || lowerQuery.includes('rest')) {
      return `Sleep is fundamental to health! Quality sleep supports:
      
• Immune function
• Mental health and mood
• Physical recovery
• Hormone regulation

Aim for 7-9 hours of quality sleep per night. Good sleep hygiene includes:
• Consistent sleep schedule
• Dark, quiet, cool bedroom
• Avoiding screens before bed
• Regular exercise (but not too close to bedtime)

How's your sleep quality lately? Any specific sleep issues you'd like to discuss?`;
    }

    if (lowerQuery.includes('stress') || lowerQuery.includes('anxiety') || lowerQuery.includes('mental')) {
      return `Mental health is just as important as physical health! Chronic stress can impact:

• Immune function
• Cardiovascular health
• Sleep quality
• Digestive health

Stress management techniques include:
• Mindfulness and meditation
• Regular exercise
• Adequate sleep
• Social connections
• Professional support when needed

How are you managing stress these days? I'm here to listen and provide support.`;
    }

    if (lowerQuery.includes('medication') || lowerQuery.includes('drug') || lowerQuery.includes('prescription')) {
      return `I can help you understand medications, but remember I'm not a doctor and can't provide medical advice. 

For medication questions, always consult with your healthcare provider. I can help you:
• Understand general medication information
• Track medication interactions (with your doctor's guidance)
• Discuss lifestyle factors that might affect medications
• Learn about medication safety

What specific medication questions do you have?`;
    }

    // Default response
    return `I'm here to help with your health questions! I can assist with:

• Understanding your biomarkers and lab results
• Nutrition and diet guidance
• Exercise and fitness recommendations
• Sleep and stress management
• General health education

What would you like to know more about? Feel free to ask specific questions or share your health goals.`;
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.9,
    });
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        message.role === 'user' ? styles.userMessageBubble : styles.assistantMessageBubble
      ]}>
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
  );

  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('Help me understand my biomarkers')}
        >
          <Ionicons name="analytics" size={20} color="#007AFF" />
          <Text style={styles.quickActionText}>Biomarkers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('What should I eat for better health?')}
        >
          <Ionicons name="nutrition" size={20} color="#007AFF" />
          <Text style={styles.quickActionText}>Nutrition</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('How can I improve my sleep?')}
        >
          <Ionicons name="moon" size={20} color="#007AFF" />
          <Text style={styles.quickActionText}>Sleep</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText('Exercise recommendations for my age')}
        >
          <Ionicons name="fitness" size={20} color="#007AFF" />
          <Text style={styles.quickActionText}>Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Health Assistant</Text>
          <Text style={styles.headerSubtitle}>AI-powered health guidance</Text>
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

        {/* Input Section */}
      <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleImageInput}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={20} color="#8E8E93" />
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickActionsScroll: {
    paddingRight: 16,
  },
  quickActionButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 4,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantMessageBubble: {
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2C2C2E',
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
  inputContainer: {
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 24,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#2C2C2E',
  },
});

export default HealthAssistantScreen; 