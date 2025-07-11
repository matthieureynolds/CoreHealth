import { UserProfile, Biomarker, HealthScore, DailyInsight } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// OpenAI API Configuration
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const CONVERSATION_HISTORY_KEY = 'healthAssistant_conversationHistory';
const USER_CONTEXT_KEY = 'healthAssistant_userContext';

export interface HealthChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    healthDataSnapshot?: any;
    userIntent?: string;
    topics?: string[];
  };
}

export interface UserHealthContext {
  preferredTopics: string[];
  healthConcerns: string[];
  goalsFocus: string[];
  conversationStyle: 'detailed' | 'concise' | 'technical';
  lastDataUpdate: Date;
  biomarkerTrends: {
    [key: string]: {
      trend: 'improving' | 'stable' | 'declining';
      significance: 'normal' | 'concerning' | 'critical';
      lastValue: number;
      changePercent: number;
    };
  };
}

export interface HealthAssistantResponse {
  insights: string[];
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
    improvements: string[];
  };
  nextActions: string[];
  followUpQuestions: string[];
}

export class HealthAssistantService {
  /**
   * Load full conversation history from AsyncStorage
   */
  static async loadConversationHistory(): Promise<HealthChatMessage[]> {
    try {
      const stored = await AsyncStorage.getItem(CONVERSATION_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }
  }

  /**
   * Load user health context and preferences
   */
  static async loadUserContext(): Promise<UserHealthContext | null> {
    try {
      const stored = await AsyncStorage.getItem(USER_CONTEXT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Failed to load user context:', error);
      return null;
    }
  }

  /**
   * Save conversation history to AsyncStorage
   */
  static async saveConversationHistory(history: HealthChatMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  /**
   * Save user health context
   */
  static async saveUserContext(context: UserHealthContext): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(context));
    } catch (error) {
      console.error('Failed to save user context:', error);
    }
  }

  /**
   * Clear/reset conversation memory
   */
  static async clearConversationMemory(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CONVERSATION_HISTORY_KEY, USER_CONTEXT_KEY]);
    } catch (error) {
      console.error('Failed to clear conversation memory:', error);
    }
  }

  /**
   * Enhanced greeting with personalization
   */
  static async getPersonalizedGreeting(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null
  ): Promise<string> {
    const context = await this.loadUserContext();
    const timeOfDay = this.getTimeOfDay();
    const name = 'there'; // Profile doesn't have displayName, will get from user context later
    
    let greeting = `Good ${timeOfDay}, ${name}! 👋 I'm your AI health assistant.`;
    
    // Add personalized context based on health data
    if (healthScore?.overall) {
      if (healthScore.overall >= 80) {
        greeting += ` Your health score of ${healthScore.overall} looks excellent! `;
      } else if (healthScore.overall >= 60) {
        greeting += ` Your health score of ${healthScore.overall} shows good progress with room for optimization. `;
      } else {
        greeting += ` I see opportunities to improve your health score of ${healthScore.overall}. `;
      }
    }

    // Add trending biomarker insights
    const trendingBiomarkers = this.analyzeBiomarkerTrends(biomarkers);
    if (trendingBiomarkers.length > 0) {
      greeting += `I noticed some interesting trends in your ${trendingBiomarkers.join(' and ')} levels. `;
    }

    greeting += `\n\nI can help you understand your health data, provide evidence-based insights, and suggest personalized recommendations. What would you like to explore today? 🔬`;

    return greeting;
  }

  /**
   * Natural ChatGPT-style system prompt focused on health
   */
  private static getAdvancedSystemPrompt(
    userContext: UserHealthContext | null,
    healthData: any
  ): string {
    const healthContext = this.formatHealthDataForAI(healthData);
    
    return `You're a friendly, super knowledgeable health researcher who loves talking about health, wellness, nutrition, fitness, sleep, biomarkers, and anything health-related. You're basically like having a health-obsessed friend who's done a PhD in health sciences and keeps up with all the latest research.

Here's what you know about this person:
${healthContext}

Just chat naturally! Answer their questions, share insights, explain things in a way that makes sense, use analogies when helpful, and feel free to ask follow-up questions to understand what they're really trying to figure out.

You're NOT a doctor (never claim to be), you can't diagnose or prescribe anything, but you're amazing at explaining health concepts, interpreting data trends, and sharing evidence-based lifestyle tips. If something needs medical attention, just suggest they check with their doctor.

Be curious, engaging, and helpful. Talk like you would to a friend - no bullet points or formal structure unless they specifically ask for that. Just have a natural conversation about health stuff.

Stay focused on health topics only - if they ask about non-health things, just gently redirect back to health and wellness topics.`;
  }

  /**
   * Enhanced chat method with deep health data integration
   */
  static async chatWithAssistant(
    message: string,
    conversationHistory?: HealthChatMessage[],
    healthData?: {
      profile: UserProfile | null;
      biomarkers: Biomarker[];
      healthScore: HealthScore | null;
    }
  ): Promise<string> {
    if (!OPENAI_API_KEY) {
      return "I need an OpenAI API key to provide intelligent health insights. Please configure your API key in the settings to unlock my full capabilities.";
    }

    try {
      // Load context and history
      let history = conversationHistory || await this.loadConversationHistory();
      const userContext = await this.loadUserContext();

      // Analyze user intent and update context
      const intent = this.analyzeUserIntent(message);
      const updatedContext = await this.updateUserContext(userContext, intent, healthData);

      // Add the new user message with metadata
      const newMessage: HealthChatMessage = {
        id: `${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: {
          healthDataSnapshot: healthData ? {
            healthScore: healthData.healthScore?.overall,
            biomarkerCount: healthData.biomarkers?.length || 0,
            lastUpdate: new Date()
          } : undefined,
          userIntent: intent,
          topics: this.extractTopics(message)
        }
      };
      history.push(newMessage);

      // Prepare enhanced messages for OpenAI
      const maxMessages = 20; // Keep more context for better continuity
      const systemPrompt = this.getAdvancedSystemPrompt(updatedContext, healthData);
      
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        ...history.slice(-maxMessages).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          temperature: 0.6, // Balanced between consistency and creativity
          max_tokens: 1000, // Allow more detailed responses
          presence_penalty: 0.1, // Encourage staying on topic
          frequency_penalty: 0.1, // Reduce repetition
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

      // Add the assistant's reply to history with metadata
      const aiMessage: HealthChatMessage = {
        id: `${Date.now()}-ai`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        metadata: {
          topics: this.extractTopics(aiContent)
        }
      };
      history.push(aiMessage);

      // Save updated history and context
      await this.saveConversationHistory(history);
      await this.saveUserContext(updatedContext);

      return aiContent;
    } catch (error) {
      console.error('Health Assistant Error:', error);
      return "I'm having trouble connecting right now. Please check your internet connection and try again. In the meantime, remember that I'm here to help with health education and insights - always consult your healthcare provider for medical decisions.";
    }
  }

  /**
   * Analyze biomarker trends for insights
   */
  private static analyzeBiomarkerTrends(biomarkers: Biomarker[]): string[] {
    const trending: string[] = [];
    
    // This is a simplified version - in production you'd have historical data
    biomarkers.forEach(biomarker => {
      const name = biomarker.name.toLowerCase();
      if (name.includes('glucose') || name.includes('sugar')) {
        trending.push('glucose');
      } else if (name.includes('cholesterol')) {
        trending.push('cholesterol');
      } else if (name.includes('pressure') || name.includes('heart')) {
        trending.push('cardiovascular');
      }
    });

    return [...new Set(trending)]; // Remove duplicates
  }

  /**
   * Analyze user intent from message
   */
  private static analyzeUserIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('biomarker') || lowerMessage.includes('lab') || lowerMessage.includes('test')) {
      return 'biomarker_analysis';
    } else if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('food')) {
      return 'nutrition_guidance';
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
      return 'fitness_guidance';
    } else if (lowerMessage.includes('sleep')) {
      return 'sleep_optimization';
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('mental')) {
      return 'stress_management';
    } else if (lowerMessage.includes('supplement') || lowerMessage.includes('vitamin')) {
      return 'supplement_guidance';
    } else if (lowerMessage.includes('symptom') || lowerMessage.includes('pain')) {
      return 'symptom_discussion';
    }
    
    return 'general_health';
  }

  /**
   * Extract topics from message
   */
  private static extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    const topicKeywords = {
      'cardiovascular': ['heart', 'blood pressure', 'cholesterol', 'cardiovascular'],
      'metabolic': ['glucose', 'diabetes', 'insulin', 'metabolism'],
      'nutrition': ['diet', 'food', 'nutrition', 'eating'],
      'exercise': ['exercise', 'workout', 'fitness', 'training'],
      'sleep': ['sleep', 'rest', 'insomnia', 'circadian'],
      'stress': ['stress', 'anxiety', 'mental health', 'mood'],
      'supplements': ['supplement', 'vitamin', 'mineral', 'omega'],
      'liver': ['liver', 'alt', 'ast', 'bilirubin'],
      'kidney': ['kidney', 'creatinine', 'egfr', 'urea']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  /**
   * Update user context based on conversation
   */
  private static async updateUserContext(
    currentContext: UserHealthContext | null,
    intent: string,
    healthData?: any
  ): Promise<UserHealthContext> {
    const context: UserHealthContext = currentContext || {
      preferredTopics: [],
      healthConcerns: [],
      goalsFocus: [],
      conversationStyle: 'detailed',
      lastDataUpdate: new Date(),
      biomarkerTrends: {}
    };

    // Update preferred topics based on conversation
    if (intent && !context.preferredTopics.includes(intent)) {
      context.preferredTopics.push(intent);
      // Keep only last 10 topics
      if (context.preferredTopics.length > 10) {
        context.preferredTopics = context.preferredTopics.slice(-10);
      }
    }

    // Update biomarker trends if health data is available
    if (healthData?.biomarkers) {
      healthData.biomarkers.forEach((biomarker: Biomarker) => {
        context.biomarkerTrends[biomarker.name] = {
          trend: 'stable', // This would be calculated from historical data
          significance: this.assessBiomarkerSignificance(biomarker),
          lastValue: biomarker.value,
          changePercent: 0 // Would be calculated from previous values
        };
      });
    }

    context.lastDataUpdate = new Date();
    return context;
  }

  /**
   * Assess biomarker significance
   */
  private static assessBiomarkerSignificance(biomarker: Biomarker): 'normal' | 'concerning' | 'critical' {
    // This is simplified - in production you'd have comprehensive reference ranges
    const name = biomarker.name.toLowerCase();
    const value = biomarker.value;

    if (name.includes('glucose')) {
      if (value < 70 || value > 140) return 'concerning';
      if (value < 50 || value > 180) return 'critical';
    } else if (name.includes('cholesterol')) {
      if (value > 240) return 'concerning';
      if (value > 300) return 'critical';
    }

    return 'normal';
  }

  /**
   * Get time of day for greetings
   */
  private static getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Enhanced health data formatting for AI
   */
  private static formatHealthDataForAI(healthData?: {
    profile: UserProfile | null;
    biomarkers: Biomarker[];
    healthScore: HealthScore | null;
  }): string {
    if (!healthData) return 'No current health data available.';

    let formattedData = '=== CURRENT HEALTH PROFILE ===\n';

    // User Demographics
    if (healthData.profile) {
      formattedData += `User: ${healthData.profile.age || 'age unknown'} year old ${healthData.profile.gender || 'gender not specified'}\n`;
      if (healthData.profile.height && healthData.profile.weight) {
        const bmi = (healthData.profile.weight / Math.pow(healthData.profile.height / 100, 2)).toFixed(1);
        formattedData += `BMI: ${bmi} (Height: ${healthData.profile.height}cm, Weight: ${healthData.profile.weight}kg)\n`;
      }
    }

    // Health Score Analysis
    if (healthData.healthScore) {
      formattedData += `\n=== HEALTH SCORES ===\n`;
      formattedData += `Overall Health Score: ${healthData.healthScore.overall}/100\n`;
      if (healthData.healthScore.recovery) formattedData += `Recovery Score: ${healthData.healthScore.recovery}/100\n`;
      if (healthData.healthScore.activity) formattedData += `Activity Score: ${healthData.healthScore.activity}/100\n`;
    }

    // Biomarker Analysis
    if (healthData.biomarkers?.length) {
      formattedData += `\n=== BIOMARKERS (Recent) ===\n`;
      
      // Group biomarkers by system
      const systems = {
        'Cardiovascular': ['cholesterol', 'hdl', 'ldl', 'triglycerides', 'blood pressure', 'heart rate'],
        'Metabolic': ['glucose', 'insulin', 'hba1c', 'diabetes'],
        'Liver Function': ['alt', 'ast', 'bilirubin', 'alp'],
        'Kidney Function': ['creatinine', 'egfr', 'bun', 'urea'],
        'Inflammatory': ['crp', 'esr', 'inflammation'],
        'Other': []
      };

      Object.keys(systems).forEach(system => {
        const systemBiomarkers = healthData.biomarkers?.filter(b => 
          systems[system as keyof typeof systems].some(keyword => 
            b.name.toLowerCase().includes(keyword)
          )
        ) || [];

        if (systemBiomarkers.length > 0) {
          formattedData += `\n${system}:\n`;
          systemBiomarkers.forEach(biomarker => {
            const status = this.assessBiomarkerStatus(biomarker);
            formattedData += `  • ${biomarker.name}: ${biomarker.value} ${biomarker.unit} [${status}]\n`;
          });
        }
      });

      // Add ungrouped biomarkers
      const ungrouped = healthData.biomarkers?.filter(b => 
        !Object.values(systems).flat().some(keyword => 
          b.name.toLowerCase().includes(keyword)
        )
      ) || [];

      if (ungrouped.length > 0) {
        formattedData += `\nOther Biomarkers:\n`;
        ungrouped.forEach(biomarker => {
          const status = this.assessBiomarkerStatus(biomarker);
          formattedData += `  • ${biomarker.name}: ${biomarker.value} ${biomarker.unit} [${status}]\n`;
        });
      }
    }

    return formattedData;
  }

  /**
   * Assess biomarker status with enhanced logic
   */
  private static assessBiomarkerStatus(biomarker: Biomarker): string {
    const name = biomarker.name.toLowerCase();
    const value = biomarker.value;

    // Enhanced reference ranges (simplified for demo)
    const ranges: { [key: string]: { optimal: [number, number], normal: [number, number], unit?: string } } = {
      'glucose': { optimal: [70, 85], normal: [70, 99] },
      'total cholesterol': { optimal: [150, 200], normal: [150, 240] },
      'hdl cholesterol': { optimal: [60, 100], normal: [40, 100] },
      'ldl cholesterol': { optimal: [50, 100], normal: [50, 130] },
      'triglycerides': { optimal: [50, 100], normal: [50, 150] },
      'creatinine': { optimal: [0.6, 1.0], normal: [0.6, 1.2] },
      'alt': { optimal: [10, 30], normal: [7, 56] },
      'ast': { optimal: [10, 30], normal: [10, 40] }
    };

    for (const [biomarkerName, range] of Object.entries(ranges)) {
      if (name.includes(biomarkerName)) {
        if (value >= range.optimal[0] && value <= range.optimal[1]) {
          return 'Optimal';
        } else if (value >= range.normal[0] && value <= range.normal[1]) {
          return 'Normal';
        } else if (value < range.normal[0]) {
          return 'Low';
        } else {
          return 'High';
        }
      }
    }

    return 'Within range';
  }

  /**
   * Generate health insights from user data (simplified)
   */
  static async generateHealthInsights(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null,
    recentInsights: DailyInsight[]
  ): Promise<HealthAssistantResponse> {
    if (!OPENAI_API_KEY) {
      return this.getMockHealthInsights();
    }

    try {
      const healthData = this.formatHealthDataForAI({ profile, biomarkers, healthScore });
      
      const prompt = `Based on this health data, provide some friendly insights and recommendations:

${healthData}

Please provide:
1. A few key insights about their health
2. Some practical recommendations
3. A simple risk assessment
4. Next steps they could consider

Keep it conversational and helpful, not overly clinical.`;

      const response = await fetch(OPENAI_API_URL, {
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
              content: 'You are a friendly health assistant providing insights from health data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Parse the response into structured format
      return this.parseInsightsResponse(content);

    } catch (error) {
      console.error('Health Insights Error:', error);
      return this.getMockHealthInsights();
    }
  }

  /**
   * Generate daily recommendations (simplified)
   */
  static async generateDailyRecommendations(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null,
    currentDate: Date = new Date()
  ): Promise<DailyInsight[]> {
    if (!OPENAI_API_KEY) {
      return this.getMockDailyRecommendations();
    }

    try {
      const healthData = this.formatHealthDataForAI({ profile, biomarkers, healthScore });
      
      const prompt = `Based on this health data, suggest 3 practical daily recommendations for today:

${healthData}

Make them actionable, friendly, and relevant to their health situation. Focus on simple things they can do today.`;

      const response = await fetch(OPENAI_API_URL, {
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
              content: 'You are a friendly health assistant providing daily recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      return this.parseDailyRecommendations(content);

    } catch (error) {
      console.error('Daily Recommendations Error:', error);
      return this.getMockDailyRecommendations();
    }
  }

  /**
   * Parse AI response into structured insights
   */
  private static parseInsightsResponse(content: string): HealthAssistantResponse {
    // Simple parsing - in a real app you might want more sophisticated parsing
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      insights: lines.slice(0, 3).map(line => line.replace(/^\d+\.\s*/, '').trim()),
      recommendations: lines.slice(3, 6).map(line => line.replace(/^\d+\.\s*/, '').trim()),
      riskAssessment: {
        level: 'low' as const,
        concerns: [],
        improvements: []
      },
      nextActions: lines.slice(-2).map(line => line.replace(/^\d+\.\s*/, '').trim()),
      followUpQuestions: []
    };
  }

  /**
   * Parse AI response into daily recommendations
   */
  private static parseDailyRecommendations(content: string): DailyInsight[] {
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.slice(0, 3).map((line, index) => ({
      id: `daily-${Date.now()}-${index}`,
      type: 'recommendation' as const,
      title: `Daily Tip ${index + 1}`,
      description: line.replace(/^\d+\.\s*/, '').trim(),
      priority: 'medium' as const,
      category: 'general' as const,
      date: new Date(),
      actionable: true
    }));
  }

  /**
   * Mock data for when API is not available
   */
  private static getMockHealthInsights(): HealthAssistantResponse {
    return {
      insights: [
        "Your health metrics look pretty good overall! 👍",
        "There might be some areas we can optimize together.",
        "Small consistent changes often make the biggest difference."
      ],
      recommendations: [
        "Try to get 7-9 hours of quality sleep each night",
        "Consider adding more colorful vegetables to your meals",
        "Even a 10-minute daily walk can boost your energy"
      ],
      riskAssessment: {
        level: 'low',
        concerns: []
      },
      nextActions: [
        "Track your sleep for a week to identify patterns",
        "Schedule a check-in with your healthcare provider"
      ]
    };
  }

  private static getMockDailyRecommendations(): DailyInsight[] {
    return [
      {
        id: 'mock-1',
        title: 'Hydration Boost',
        description: 'Drinking water first thing in the morning helps kickstart your metabolism and supports overall health.',
        category: 'nutrition',
        priority: 'medium',
        actionable: true
      },
      {
        id: 'mock-2',
        title: 'Movement Break',
        description: 'Short, regular walks throughout the day can improve circulation, energy, and focus.',
        category: 'activity',
        priority: 'medium',
        actionable: true
      },
      {
        id: 'mock-3',
        title: 'Mindful Moment',
        description: 'Practicing mindfulness, even briefly, can reduce stress and improve digestion.',
        category: 'stress',
        priority: 'low',
        actionable: true
      }
    ];
  }
} 