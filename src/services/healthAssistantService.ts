import { UserProfile, Biomarker, HealthScore, DailyInsight } from '../types';

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface HealthAssistantResponse {
  insights: string[];
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
  };
  nextActions: string[];
}

export interface HealthChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'recommendation' | 'alert';
}

export class HealthAssistantService {
  /**
   * Generate comprehensive health insights based on user data
   */
  static async generateHealthInsights(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null,
    recentInsights: DailyInsight[]
  ): Promise<HealthAssistantResponse> {
    try {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
        console.warn('OpenAI API key not configured, using mock insights');
        return this.getMockHealthInsights();
      }

      const healthData = this.formatHealthDataForAI({
        profile,
        biomarkers,
        healthScore,
        recentInsights
      });

      const prompt = `You are an expert health assistant. Analyze the following health data and provide personalized insights.

${healthData}

Please provide:
1. Key health insights (3-4 bullet points)
2. Specific recommendations (3-4 actionable items)
3. Risk assessment (low/medium/high with concerns)
4. Next actions (2-3 immediate steps)

Keep responses concise, supportive, and medically informed. Focus on actionable advice.

Format as JSON:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "riskAssessment": {
    "level": "low|medium|high",
    "concerns": ["concern1", ...]
  },
  "nextActions": ["action1", "action2", ...]
}`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI assistant');
      }

      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('Health assistant error:', error);
      return this.getMockHealthInsights();
    }
  }

  /**
   * Chat with health assistant
   */
  static async chatWithAssistant(
    message: string,
    conversationHistory: HealthChatMessage[],
    userHealthData?: {
      profile: UserProfile | null;
      biomarkers: Biomarker[];
      healthScore: HealthScore | null;
    }
  ): Promise<string> {
    try {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
        return "I'm sorry, but the AI assistant is not configured. Please contact support for assistance with your health questions.";
      }

      const healthContext = userHealthData 
        ? this.formatHealthDataForAI(userHealthData)
        : "No specific health data available for this user.";

      const systemPrompt = `You are CoreHealth's AI assistant, a knowledgeable health companion. You have access to the user's health data when available.

Guidelines:
- Provide helpful, accurate health information
- Never diagnose or replace professional medical advice
- Always recommend consulting healthcare providers for serious concerns
- Be supportive and encouraging
- Use the user's health data to personalize responses when available
- Keep responses concise and actionable

User's Health Context:
${healthContext}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request right now.";
    } catch (error) {
      console.error('Chat assistant error:', error);
      return "I'm experiencing technical difficulties. Please try again later or consult with a healthcare provider for urgent concerns.";
    }
  }

  /**
   * Generate personalized daily recommendations
   */
  static async generateDailyRecommendations(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null,
    currentDate: Date = new Date()
  ): Promise<DailyInsight[]> {
    try {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
        return this.getMockDailyRecommendations();
      }

      const healthData = this.formatHealthDataForAI({
        profile,
        biomarkers,
        healthScore
      });

      const prompt = `Generate 3-4 personalized daily health recommendations for today (${currentDate.toDateString()}) based on this health data:

${healthData}

Format as JSON array:
[
  {
    "title": "Recommendation Title",
    "description": "Brief description of why this matters",
    "category": "nutrition|exercise|sleep|stress|recovery|prevention",
    "priority": "high|medium|low",
    "actionable": true,
    "action": "Specific action to take"
  }
]

Focus on actionable, evidence-based recommendations that fit the user's current health status.`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI assistant');
      }

      const recommendations = JSON.parse(aiResponse);
      
      // Convert to DailyInsight format
      return recommendations.map((rec: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        priority: rec.priority,
        actionable: rec.actionable,
        action: rec.action,
      }));
    } catch (error) {
      console.error('Daily recommendations error:', error);
      return this.getMockDailyRecommendations();
    }
  }

  /**
   * Analyze biomarker trends and provide insights
   */
  static async analyzeBiomarkerTrends(
    biomarkers: Biomarker[],
    historicalData?: Biomarker[][]
  ): Promise<{
    summary: string;
    trends: Array<{
      biomarker: string;
      trend: 'improving' | 'stable' | 'concerning';
      insight: string;
    }>;
    recommendations: string[];
  }> {
    try {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
        return this.getMockBiomarkerAnalysis();
      }

      const biomarkerData = biomarkers.map(b => ({
        name: b.name,
        value: b.value,
        unit: b.unit,
        category: b.category,
        trend: b.trend,
        riskLevel: b.riskLevel
      }));

      const prompt = `Analyze these biomarker results and provide insights:

${JSON.stringify(biomarkerData, null, 2)}

Provide:
1. Overall summary (2-3 sentences)
2. Individual biomarker trend analysis
3. Actionable recommendations

Format as JSON:
{
  "summary": "Overall health summary...",
  "trends": [
    {
      "biomarker": "biomarker name",
      "trend": "improving|stable|concerning",
      "insight": "specific insight about this biomarker"
    }
  ],
  "recommendations": ["rec1", "rec2", ...]
}`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI assistant');
      }

      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('Biomarker analysis error:', error);
      return this.getMockBiomarkerAnalysis();
    }
  }

  /**
   * Format health data for AI processing
   */
  private static formatHealthDataForAI(data: {
    profile: UserProfile | null;
    biomarkers: Biomarker[];
    healthScore: HealthScore | null;
    recentInsights?: DailyInsight[];
  }): string {
    const { profile, biomarkers, healthScore, recentInsights } = data;

    let formattedData = "HEALTH DATA SUMMARY:\n\n";

    if (profile) {
      formattedData += `Profile: Age ${profile.age}, ${profile.gender}, Activity Level: ${profile.activityLevel}\n`;
      if (profile.conditions?.length) {
        formattedData += `Medical Conditions: ${profile.conditions.join(', ')}\n`;
      }
      if (profile.medications?.length) {
        formattedData += `Medications: ${profile.medications.join(', ')}\n`;
      }
      formattedData += "\n";
    }

    if (healthScore) {
      formattedData += `Health Scores:\n`;
      formattedData += `- Overall: ${healthScore.overall}/100\n`;
      formattedData += `- Sleep: ${healthScore.sleep}/100\n`;
      formattedData += `- Activity: ${healthScore.activity}/100\n`;
      formattedData += `- Stress: ${healthScore.stress}/100\n`;
      formattedData += `- Recovery: ${healthScore.recovery}/100\n`;
      formattedData += `- Nutrition: ${healthScore.nutrition}/100\n\n`;
    }

    if (biomarkers.length > 0) {
      formattedData += "Recent Biomarkers:\n";
      biomarkers.forEach(b => {
        formattedData += `- ${b.name}: ${b.value} ${b.unit} (${b.riskLevel} risk, ${b.trend})\n`;
      });
      formattedData += "\n";
    }

    if (recentInsights?.length) {
      formattedData += "Recent Insights:\n";
      recentInsights.forEach(insight => {
        formattedData += `- ${insight.title}: ${insight.description}\n`;
      });
      formattedData += "\n";
    }

    return formattedData;
  }

  /**
   * Mock health insights for development
   */
  private static getMockHealthInsights(): HealthAssistantResponse {
    return {
      insights: [
        "Your cardiovascular health shows excellent progress with improving HRV",
        "Sleep quality has been consistent at 78% - consider optimizing your bedtime routine",
        "Stress levels are manageable but could benefit from mindfulness practices",
        "Recovery metrics indicate you're adapting well to your current activity level"
      ],
      recommendations: [
        "Maintain your current exercise routine - it's working well for your heart health",
        "Try going to bed 15 minutes earlier to improve sleep score",
        "Consider 10 minutes of meditation to help with stress management",
        "Stay hydrated - aim for 8 glasses of water daily"
      ],
      riskAssessment: {
        level: 'low',
        concerns: [
          "Monitor hydration levels - they've been slightly low recently"
        ]
      },
      nextActions: [
        "Schedule your next biomarker check in 3 months",
        "Track your water intake for the next week",
        "Consider adding yoga or stretching to your routine"
      ]
    };
  }

  /**
   * Mock daily recommendations for development
   */
  private static getMockDailyRecommendations(): DailyInsight[] {
    return [
      {
        id: 'mock-1',
        title: 'Optimize Morning Hydration',
        description: 'Your body loses water overnight. Starting your day hydrated boosts energy and cognitive function.',
        category: 'nutrition',
        priority: 'medium',
        actionable: true,
        action: 'Drink 16oz of water within 30 minutes of waking up.'
      },
      {
        id: 'mock-2',
        title: 'Power Walk Opportunity',
        description: 'Weather is perfect today and your recovery metrics are strong.',
        category: 'exercise',
        priority: 'high',
        actionable: true,
        action: 'Take a 20-minute walk after lunch to boost afternoon energy.'
      },
      {
        id: 'mock-3',
        title: 'Stress Management Check',
        description: 'Your stress levels have been slightly elevated this week.',
        category: 'stress',
        priority: 'medium',
        actionable: true,
        action: 'Try 5 minutes of deep breathing before your evening meal.'
      }
    ];
  }

  /**
   * Mock biomarker analysis for development
   */
  private static getMockBiomarkerAnalysis() {
    return {
      summary: "Overall, your biomarkers show a positive health profile with several metrics in optimal ranges. Your cardiovascular markers are particularly strong.",
      trends: [
        {
          biomarker: "HDL-C",
          trend: "improving" as const,
          insight: "Your HDL cholesterol levels are excellent and trending upward, indicating good cardiovascular health."
        },
        {
          biomarker: "Resting HR",
          trend: "stable" as const,
          insight: "Your resting heart rate is in the athletic range and remains consistent, showing good cardiovascular fitness."
        },
        {
          biomarker: "hs-CRP",
          trend: "improving" as const,
          insight: "Inflammatory markers are low and improving, suggesting your lifestyle interventions are working."
        }
      ],
      recommendations: [
        "Continue your current exercise routine to maintain excellent cardiovascular health",
        "Consider adding omega-3 rich foods to further support heart health",
        "Monitor sleep quality as it impacts inflammatory markers"
      ]
    };
  }
} 