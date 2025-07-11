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

Would you like personalized exercise suggestions based on your health profile?`;
    }

    if (lowerQuery.includes('sleep') || lowerQuery.includes('rest')) {
      const sleepHours = userProfile?.lifestyle?.sleep?.averageHoursPerNight;
      const sleepQuality = userProfile?.lifestyle?.sleep?.sleepQuality;
      
      return `Sleep is fundamental to health! ${sleepHours ? `You currently get about ${sleepHours} hours per night` : 'Sleep tracking would be helpful'}${sleepQuality ? ` with ${sleepQuality} quality` : ''}.

Optimal sleep includes:
• 7-9 hours nightly for most adults
• Consistent sleep schedule
• Good sleep hygiene practices

${sleepHours && sleepHours < 7 ? 'Consider prioritizing more sleep - it affects everything from immune function to mental clarity.' : sleepHours && sleepHours >= 7 ? 'Your sleep duration looks good!' : ''}

What sleep challenges are you experiencing?`;
    }

    if (lowerQuery.includes('stress') || lowerQuery.includes('anxiety') || lowerQuery.includes('mental')) {
      const stressLevel = userProfile?.lifestyle?.stress?.level || 'not specified';
      return `Mental health is just as important as physical health. ${stressLevel !== 'not specified' ? `I see your stress level is "${stressLevel}".` : ''}

Stress management strategies include:
• Regular exercise and movement
• Mindfulness and meditation
• Adequate sleep and nutrition
• Social connections and support
• Professional help when needed

${stressLevel === 'high' || stressLevel === 'severe' ? 'High stress levels can impact physical health. Consider speaking with a healthcare provider about stress management strategies.' : ''}

What aspects of stress management interest you most?`;
    }

    if (lowerQuery.includes('medication') || lowerQuery.includes('allergy') || lowerQuery.includes('medical history')) {
      const allergies = userProfile?.allergies?.length || 0;
      const conditions = userProfile?.medicalHistory?.length || 0;
      
      return `I can help you understand your medical information. ${allergies > 0 ? `You have ${allergies} recorded allergies` : 'No allergies recorded'}${conditions > 0 ? ` and ${conditions} medical conditions` : ''} in your profile.

Important reminders:
• Always inform healthcare providers about allergies
• Keep medication lists updated
• Understand drug interactions
• Follow prescribed dosages and timing

For specific medical advice, always consult your healthcare provider. What questions do you have about managing your medical information?`;
    }

    if (lowerQuery.includes('weight') || lowerQuery.includes('bmi') || lowerQuery.includes('height')) {
      const height = userProfile?.height;
      const weight = userProfile?.weight;
      let bmi = '';
      
      if (height && weight) {
        const bmiValue = weight / ((height / 100) ** 2);
        bmi = `Your current BMI is ${bmiValue.toFixed(1)}. `;
      }

      return `${bmi}Body composition involves more than just weight - muscle mass, bone density, and overall health matter too.

Healthy approaches include:
• Balanced nutrition
• Regular physical activity
• Adequate hydration
• Consistent sleep patterns
• Stress management

${height && weight ? 'Your recorded measurements help track trends over time.' : 'Consider tracking measurements to monitor progress.'} 

What are your health and wellness goals?`;
    }

    // Default health assistant response
    return `I'm here to help with your health questions! I can assist with:

🔬 **Biomarker Analysis** - Understanding lab results and health metrics
🥗 **Nutrition Guidance** - Diet recommendations and meal planning  
🏃 **Exercise Planning** - Workout suggestions based on your fitness level
😴 **Sleep Optimization** - Improving sleep quality and habits
🧘 **Stress Management** - Techniques for mental wellbeing
💊 **Medical History** - Managing medications, allergies, and conditions
📊 **Health Tracking** - Interpreting trends and patterns

Feel free to ask specific questions about any health topic, and I'll provide personalized insights based on your profile data. What would you like to explore first?`;
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      rate: 1.0,
      pitch: 1.0,
    });
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <View style={[
      styles.messageBubble,
      message.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[
          styles.messageText,
          message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
        ]}>
          {message.content}
        </Text>
        {message.role === 'assistant' && (
          <TouchableOpacity onPress={() => speak(message.content)} style={styles.speakerButton}>
            <Ionicons name="volume-high-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[
        styles.messageTime,
        message.role === 'user' ? styles.userMessageTime : styles.assistantMessageTime
      ]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.quickActionsTitle}>Quick Questions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("What do my recent biomarkers mean?")}
        >
          <Ionicons name="analytics-outline" size={16} color="#007AFF" />
          <Text style={styles.quickActionText}>Biomarkers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("Give me nutrition advice based on my profile")}
        >
          <Ionicons name="nutrition-outline" size={16} color="#007AFF" />
          <Text style={styles.quickActionText}>Nutrition</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("What exercise routine do you recommend for me?")}
        >
          <Ionicons name="fitness-outline" size={16} color="#007AFF" />
          <Text style={styles.quickActionText}>Exercise</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setInputText("How can I improve my sleep quality?")}
        >
          <Ionicons name="moon-outline" size={16} color="#007AFF" />
          <Text style={styles.quickActionText}>Sleep</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.assistantInfo}>
            <View style={styles.assistantAvatar}>
              <Ionicons name="medical" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.assistantName}>Health Assistant</Text>
              <Text style={styles.assistantStatus}>AI-Powered • Always Available</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <View style={styles.loadingMessage}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Assistant is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      {messages.length <= 1 && <QuickActions />}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          {/* Image input button */}
          <TouchableOpacity style={styles.iconButton} onPress={handleImageInput}>
            <Ionicons name="image-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          {/* Voice input button */}
          <TouchableOpacity style={styles.iconButton} onPress={handleVoiceInput}>
            <Ionicons name="mic-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your health..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          This AI assistant provides general health information only. Always consult healthcare professionals for medical advice.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assistantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assistantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assistantName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  assistantStatus: {
    fontSize: 13,
    color: '#30D158',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 8,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  assistantMessageTime: {
    color: '#8E8E93',
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  quickActionText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  disclaimer: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 14,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default HealthAssistantScreen; 