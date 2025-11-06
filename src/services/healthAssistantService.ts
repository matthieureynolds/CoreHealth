import { UserProfile, Biomarker, HealthScore, DailyInsight, DeviceData, LabResult, BodySystem, TravelHealth } from '../types';
import { TextDecoder } from 'text-encoding';
import type { UserSettings } from '../types/settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateBySetting, formatTimeBySetting } from '../utils/dateFormat';
import { loadUserSnapshot } from './userSnapshotService';
import { getUserChart } from './chartApi';
// Safely load app version from app.json without TS JSON module typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appConfig = require('../../app.json');

// OpenAI API Configuration
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const CONVERSATION_HISTORY_KEY = 'healthAssistant_conversationHistory';
const USER_CONTEXT_KEY = 'healthAssistant_userContext';
const CHAT_SESSIONS_KEY = 'healthAssistant_chatSessions';
const SETTINGS_SNAPSHOT_KEY = 'healthAssistant_latestSettingsSnapshot';

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

export interface ChatSession {
  id: string;
  title: string;
  messages: HealthChatMessage[];
  timestamp: Date;
  lastUpdated: Date;
}

export interface UserHealthContext {
  // Basic preferences
  preferredTopics: string[];
  healthConcerns: string[];
  goalsFocus: string[];
  conversationStyle: 'detailed' | 'concise' | 'technical';
  
  // Memory and learning
  lastDataUpdate: Date;
  conversationCount: number;
  lastConversationDate: Date;
  favoriteTopics: string[];
  avoidedTopics: string[];
  
  // Health tracking
  biomarkerTrends: {
    [key: string]: {
      trend: 'improving' | 'stable' | 'declining';
      significance: 'normal' | 'concerning' | 'critical';
      lastValue: number;
      changePercent: number;
      lastDiscussed: Date;
    };
  };
  
  // Personal insights
  personalInsights: {
    [key: string]: {
      insight: string;
      date: Date;
      confidence: number;
    };
  };
  
  // Health goals and progress
  healthGoals: {
    [key: string]: {
      goal: string;
      target: string;
      progress: number;
      startDate: Date;
      lastUpdate: Date;
    };
  };
  
  // Recommendations history
  recommendationsHistory: {
    [key: string]: {
      recommendation: string;
      date: Date;
      followed: boolean;
      outcome?: string;
    };
  };
  
  // User preferences learned over time
  learnedPreferences: {
    responseLength: 'short' | 'medium' | 'long';
    technicalLevel: 'basic' | 'intermediate' | 'advanced';
    focusAreas: string[];
    communicationStyle: 'casual' | 'professional' | 'motivational';
  };
  
  // Conversation memory
  conversationSummary?: string;
  keyTopics?: string[];
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
  private static readonly MAX_CONTEXT_MESSAGES = 20;
  private static readonly TRIM_THRESHOLD = 60;
  private static readonly TRIM_KEEP_RECENT = 24;
  // Remove emojis & pictographs from AI text
  private static stripEmojis(input: string): string {
    try {
      // Remove common emoji blocks and variation selectors without touching digits or punctuation
      // Ranges: Misc Symbols & Pictographs, Emoticons, Transport & Map, Supplemental Symbols & Pictographs, Symbols & Pictographs Extended-A, Dingbats, etc.
      // Also remove Zero Width Joiner and Variation Selector-16 used in emoji sequences
      return input
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols & Pictographs
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols & Pictographs
        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols & Pictographs Extended-A
        .replace(/[\u{2600}-\u{27BF}]/gu, '')   // Misc symbols + Dingbats subset
        .replace(/[\u200D\uFE0F]/g, '');        // ZWJ and VS16
    } catch {
      return input;
    }
  }

  // Compute user's age. Uses birthDate if present; otherwise profile.age.
  private static getUserAge(profile: UserProfile): number | null {
    try {
      const anyProfile: any = profile as any;
      const birthDateStr: string | undefined = anyProfile?.birthDate;
      if (birthDateStr) {
        const d = new Date(birthDateStr);
        if (!isNaN(d.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - d.getFullYear();
          const m = today.getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
          return age;
        }
      }
      if (typeof profile.age === 'number' && profile.age > 0) return profile.age;
      return null;
    } catch {
      return null;
    }
  }
  /**
   * Load full conversation history from AsyncStorage
   */
  static async loadConversationHistory(): Promise<HealthChatMessage[]> {
    try {
      const stored = await AsyncStorage.getItem(CONVERSATION_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp || Date.now())
        }));
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
   * Persist the latest settings so the assistant can use them immediately across screens.
   */
  static async syncSettingsSnapshot(settings: UserSettings): Promise<void> {
    try {
      const payload = { settings, syncedAt: new Date().toISOString() };
      await AsyncStorage.setItem(SETTINGS_SNAPSHOT_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to sync settings snapshot:', error);
    }
  }

  /**
   * Load the most recently synced settings snapshot.
   */
  static async loadSettingsSnapshot(): Promise<UserSettings | null> {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_SNAPSHOT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.settings || null;
    } catch (error) {
      console.error('Failed to load settings snapshot:', error);
      return null;
    }
  }

  /**
   * Clear/reset conversation memory
   */
  static async clearConversationMemory(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CONVERSATION_HISTORY_KEY, USER_CONTEXT_KEY, CHAT_SESSIONS_KEY]);
    } catch (error) {
      console.error('Failed to clear conversation memory:', error);
    }
  }

  /**
   * Enhanced memory functions
   */
  static async addPersonalInsight(key: string, insight: string, confidence: number = 0.8): Promise<void> {
    try {
      const context = await this.loadUserContext();
      if (context) {
        context.personalInsights[key] = {
          insight,
          date: new Date(),
          confidence
        };
        await this.saveUserContext(context);
      }
    } catch (error) {
      console.error('Failed to add personal insight:', error);
    }
  }

  static async addHealthGoal(key: string, goal: string, target: string): Promise<void> {
    try {
      const context = await this.loadUserContext();
      if (context) {
        context.healthGoals[key] = {
          goal,
          target,
          progress: 0,
          startDate: new Date(),
          lastUpdate: new Date()
        };
        await this.saveUserContext(context);
      }
    } catch (error) {
      console.error('Failed to add health goal:', error);
    }
  }

  static async updateHealthGoalProgress(key: string, progress: number): Promise<void> {
    try {
      const context = await this.loadUserContext();
      if (context && context.healthGoals[key]) {
        context.healthGoals[key].progress = progress;
        context.healthGoals[key].lastUpdate = new Date();
        await this.saveUserContext(context);
      }
    } catch (error) {
      console.error('Failed to update health goal progress:', error);
    }
  }

  static async addRecommendation(recommendation: string, followed: boolean = false): Promise<void> {
    try {
      const context = await this.loadUserContext();
      if (context) {
        const key = `rec_${Date.now()}`;
        context.recommendationsHistory[key] = {
          recommendation,
          date: new Date(),
          followed
        };
        await this.saveUserContext(context);
      }
    } catch (error) {
      console.error('Failed to add recommendation:', error);
    }
  }

  static async updateRecommendationOutcome(key: string, outcome: string): Promise<void> {
    try {
      const context = await this.loadUserContext();
      if (context && context.recommendationsHistory[key]) {
        context.recommendationsHistory[key].outcome = outcome;
        await this.saveUserContext(context);
      }
    } catch (error) {
      console.error('Failed to update recommendation outcome:', error);
    }
  }

  static async learnUserPreference(preference: keyof UserHealthContext['learnedPreferences'], value: string | string[]): Promise<void> {
    try {
      const context = await this.loadUserContext();
      if (context) {
        if (preference === 'focusAreas') {
          context.learnedPreferences.focusAreas = Array.isArray(value) ? value as string[] : [String(value)];
        } else if (preference === 'responseLength') {
          context.learnedPreferences.responseLength = String(value) as UserHealthContext['learnedPreferences']['responseLength'];
        } else if (preference === 'technicalLevel') {
          context.learnedPreferences.technicalLevel = String(value) as UserHealthContext['learnedPreferences']['technicalLevel'];
        } else if (preference === 'communicationStyle') {
          context.learnedPreferences.communicationStyle = String(value) as UserHealthContext['learnedPreferences']['communicationStyle'];
        }
        await this.saveUserContext(context);
      }
    } catch (error) {
      console.error('Failed to learn user preference:', error);
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
    const name = (profile as any)?.preferredName || (profile as any)?.displayName;
    const hello = name ? `Hello, ${name}!` : 'Hello!';
    const intro = `${hello} I'm Torto. How can I help you today?`;
    const disclosure = 'I provide educational information and support — not a substitute for professional medical advice. Always consult your doctor for diagnosis or treatment.';
    return this.stripEmojis(`${intro} ${disclosure}`);
  }

  /**
   * Natural ChatGPT-style system prompt focused on health
   */
  private static getAdvancedSystemPrompt(
    userContext: UserHealthContext | null,
    healthData: any,
    intent?: string
  ): string {
    const healthContext = this.formatHealthDataForAI(healthData);
    const memoryContext = this.formatMemoryContextForAI(userContext);
    const isDirect = intent === 'direct_question' || intent === 'medication_info';
    
    return `You are Torto, a professional doctor with a kind, empathetic tone. Provide evidence-based, clinically accurate guidance.

Safety and scope:
- This chat is educational support only and not a substitute for medical care.
- Do not provide a diagnosis or prescriptions. Offer a differential-style discussion (what could be going on), key red flags, and next steps. Encourage clinician follow-up for anything concerning.

Use of profile data:
- You may use the user's CoreHealth data below (Name, Demographics, BMI, Allergies, Medications, Medical & Family History, Devices, Settings, Body Systems, Travel Health, Biomarkers, Lab Results) to personalize responses.
- When referencing personal details, preface with "Based on your CoreHealth profile". If information is missing, say you don’t have it and ask focused clarifying questions.

Formatting rules:
- Respect the user's display preferences when showing times and dates.
- Times: use ${healthData?.settings?.general?.timeFormat === '12h' ? '12-hour with am/pm' : '24-hour'} format unless the user explicitly asks otherwise.
- Dates: use ${healthData?.settings?.general?.dateFormat || 'DD/MM/YYYY'}.

Clinical reasoning:
- When asked "what might I have", provide 2–4 plausible possibilities with brief reasoning grounded in the user’s data, plus red flags and when to seek care. Keep concise and organized.

User's Health Information:
${healthContext}

${memoryContext}

Guidelines:
- Always answer the user's current question directly in the first paragraph. Stay on-topic.
- Use clear, plain language; be precise and factual; avoid unnecessary general advice.
- If medical judgment is implied, include a brief safety note and suggest consulting a clinician for personal care.
- Prefer concise structure: short paragraphs or 3–5 bullets when appropriate.
- Only personalize using the user's health data if it is clearly relevant to the specific question.

${isDirect ? `
Direct Question Mode:
- If the user asks for a definition or mechanism (e.g., "what is creatine"), provide: definition, mechanism of action, common uses/benefits, typical dosing ranges for adults where applicable, key side effects and contraindications, and important interactions. Keep it 4–8 sentences or 3–5 bullets.
- Do NOT add generic lifestyle or nutrition tips unless explicitly requested.
` : `
Contextual Coaching Mode:
- Provide practical, actionable guidance tailored to the user's goals when they ask for advice.
`}

Command Emission (when a concrete action is appropriate):
- When the user requests an actionable task that maps to a known command, include a single JSON object in a fenced code block labeled json (use triple backticks) at the end of your reply with shape {"type":"<COMMAND>", "payload":{...}}.
- Supported commands: SUPPLEMENT_VITC_RECOMMEND, APPT_RESCHEDULE_DENTIST, SYMPTOM_LOG_LEG_PAIN, ALLERGY_UPDATE_PNUT, TRAVEL_ADD_COUNTRY_CARD, LAB_SUBMIT_RESULTS, TRIP_CHANGE_DATES.
- Keep natural language response first; place the JSON block last on a new line.`;
  }

  /**
   * Format memory context for AI
   */
  private static formatMemoryContextForAI(userContext: UserHealthContext | null): string {
    if (!userContext) return '';

    let memoryContext = '';
    
    if (userContext.conversationSummary) {
      memoryContext += `\nConversation Summary:\n${userContext.conversationSummary}\n`;
    }

    if (userContext.keyTopics && userContext.keyTopics.length > 0) {
      memoryContext += `\nKey Topics Discussed: ${userContext.keyTopics.join(', ')}\n`;
    }

    // Health goals
    if (Object.keys(userContext.healthGoals).length > 0) {
      memoryContext += '\nHealth Goals:\n';
      Object.entries(userContext.healthGoals).forEach(([key, goal]) => {
        memoryContext += `• ${goal.goal}\n`;
      });
    }
    
    return memoryContext;
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
      deviceData?: DeviceData[];
      settings?: UserSettings | null;
      labResults?: LabResult[];
      bodySystems?: BodySystem[];
      travelHealth?: TravelHealth | null;
    }
  ): Promise<string> {
    // Handle simple, deterministic questions without calling the model
    const lower = (message || '').trim().toLowerCase();
    if (healthData?.profile) {
      // Age: compute from birthDate if available, otherwise use stored age
      if (/\bwhat\s+is\s+my\s+age\b|\bhow\s+old\s+am\s+i\b/.test(lower)) {
        const age = this.getUserAge(healthData.profile);
        if (typeof age === 'number') {
          return `Based on your CoreHealth profile, you are ${age} years old.`;
        }
        return 'I couldn’t find your age in your CoreHealth profile.';
      }
    }

    // Offline answers for settings/devices so we don't rely on network
    try {
      const wantsPrivacy = /privacy\s*(settings)?|biometric|2fa|two\s*factor|location\s*services|data\s*sharing/.test(lower);
      const wantsSync = /last\s*(device\s*)?sync|when\s+did\s+i\s+last\s+sync/.test(lower);
      const wantsNotifications = /(notification|notifications|alert|alerts|reminder|reminders|motivat\w+|quiet\s*hours|before\s+(an?\s*)?(appointment|medication|event))/i.test(message);
      const wantsDisplay = /(units|date\s*format|time\s*format|theme|language)/.test(lower) && /what|which|show/i.test(message);
      const wantsDevices = /which\s+devices\s+are\s+connected|connected\s+devices/.test(lower);
      const wantsEmail = /what\s+email\s+is\s+my\s+account|my\s+account\s+email/.test(lower);
      const wantsTos = /(terms|t&c|tandc|t\s*&\s*c|terms\s*and\s*conditions)/i.test(message);
      const wantsPrivacyPolicy = /privacy\s*policy/i.test(message);

      if (wantsPrivacy || wantsSync || wantsNotifications || wantsDisplay || wantsDevices || wantsEmail || wantsTos || wantsPrivacyPolicy) {
        // Ensure we have settings: prefer passed-in, else snapshot
        let s: UserSettings | null | undefined = healthData?.settings || null;
        if (!s) s = await this.loadSettingsSnapshot();

        const lines: string[] = [];
        if (wantsTos || /when\s*(were|was)\s*(the\s*)?terms/i.test(lower)) {
          try {
            // Prefer explicit effective date, fallback to last updated
            let effective = await AsyncStorage.getItem('@legal_tos_effective_date');
            const lastUpdated = await AsyncStorage.getItem('@legal_tos_last_updated');
            const fallbackLastUpdated = 'December 2024';
            const tosStr = effective ? `effective ${effective}` : (lastUpdated ? `last updated ${lastUpdated}` : `last updated ${fallbackLastUpdated}`);
            lines.push(`Terms of Service — ${tosStr}`);
          } catch {}
        }

        if (wantsPrivacyPolicy || /when\s*(was|were)\s*privacy\s*policy/i.test(lower)) {
          try {
            const effective = (await AsyncStorage.getItem('@legal_privacy_effective_date')) || '1 January 2025';
            lines.push(`Privacy Policy — effective ${effective}`);
          } catch {}
        }
        if (wantsPrivacy) {
          if (s?.privacy) {
            const p = s.privacy as any;
            lines.push(
              `Privacy & Security — Biometric: ${p.biometricAuth ? 'on' : 'off'}, 2FA: ${p.twoFactorAuth ? 'on' : 'off'}, Timeout: ${p.sessionTimeout}, Location: ${p.locationServices ? 'on' : 'off'}, Sharing: analytics=${p.dataSharing?.analytics ? 'on' : 'off'}, anonymized=${p.dataSharing?.anonymizedData ? 'on' : 'off'}, third-party=${p.dataSharing?.thirdPartyApps ? 'on' : 'off'}`
            );
          } else {
            lines.push('Privacy & Security — not found in your settings yet.');
          }
        }

        if (wantsSync) {
          const deviceEvents = Array.isArray(healthData?.deviceData) ? healthData!.deviceData! : [];
          let lastSync: Date | null = null;
          try {
            const times = deviceEvents
              .map((d: any) => (d?.timestamp ? new Date(d.timestamp).getTime() : NaN))
              .filter((t: number) => Number.isFinite(t));
            if (times.length > 0) lastSync = new Date(Math.max(...times));
          } catch {}
          // Fallback to stored last sync
          if (!lastSync) {
            try {
              const iso = await AsyncStorage.getItem('@corehealth_last_sync_at');
              if (iso) lastSync = new Date(iso);
            } catch {}
          }
          if (lastSync) {
            try {
              const timeFmt = (s?.general?.timeFormat === '12h' ? '12h' : '24h') as '12h'|'24h';
              const dateFmt = (s?.general?.dateFormat || 'DD/MM/YYYY') as any;
              const d = formatDateBySetting(lastSync, dateFmt);
              const t = formatTimeBySetting(lastSync, timeFmt);
              lines.push(`Last Device Sync — ${d} ${t}`);
            } catch {
              lines.push(`Last Device Sync — ${lastSync.toISOString()}`);
            }
          } else {
            lines.push('Last Device Sync — no recent sync recorded');
          }
        }

        if (wantsNotifications) {
          if (s?.notifications) {
            const n = s.notifications as any;
            const enabledList = ['healthSummaries','biomarkerAlerts','vaccinationReminders','travelWarnings','syncIssues','emergencyAlerts','appUpdates']
              .filter(k => n[k])
              .map(k => k);
            const qh = n.quietHours?.enabled ? `${n.quietHours.startTime}-${n.quietHours.endTime}` : 'off';
            // Load per-alert offsets if present
            let medAlerts: string[] = [];
            let apptAlerts: string[] = [];
            try {
              const [med, appt] = await Promise.all([
                AsyncStorage.getItem('@notif_med_alerts'),
                AsyncStorage.getItem('@notif_appt_alerts')
              ]);
              if (med) {
                const p = JSON.parse(med);
                if (Array.isArray(p)) medAlerts = p;
              }
              if (appt) {
                const p = JSON.parse(appt);
                if (Array.isArray(p)) apptAlerts = p;
              }
            } catch {}
            const normalize = (s: string): string => {
              const m = s.match(/(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks)/i);
              if (m) {
                const n = m[1];
                const unit = m[2].toLowerCase();
                const short = unit.startsWith('min') ? 'm' : unit.startsWith('hour') ? 'h' : unit.startsWith('day') ? 'd' : 'w';
                return `${n}${short} before`;
              }
              if (/at\s*time\s*of\s*event/i.test(s)) return '0m at event';
              return s;
            };
            const medStr = medAlerts.length ? `medication alerts: ${medAlerts.map(normalize).join(', ')}` : '';
            const apptStr = apptAlerts.length ? `appointment alerts: ${apptAlerts.map(normalize).join(', ')}` : '';
            const extras = [medStr, apptStr].filter(Boolean).join('; ');
            lines.push(`Notifications — master: ${n.enabled ? 'on' : 'off'}, enabled: ${enabledList.length ? enabledList.join(', ') : 'none'}, quiet hours: ${qh}${extras ? `, ${extras}` : ''}`);
          } else {
            lines.push('Notifications — not found in your settings yet.');
          }
        }

        if (wantsDisplay) {
          if (s?.general) {
            const g = s.general as any;
            lines.push(`Display & Format — Units: ${g.units}, Date: ${g.dateFormat}, Time: ${g.timeFormat}, Language: ${g.language}, Theme: ${g.theme}`);
          } else {
            lines.push('Display & Format — not found in your settings yet.');
          }
        }

        if (wantsDevices) {
          try {
            const deviceEvents = Array.isArray(healthData?.deviceData) ? healthData!.deviceData! : [];
            let types = Array.from(new Set(deviceEvents.map((d: any) => d?.deviceType))).filter(Boolean);
            if (!types.length) {
              // Fallback to connectedDevices list
              try {
                const raw = await AsyncStorage.getItem('connectedDevices');
                if (raw) {
                  const list = JSON.parse(raw);
                  if (Array.isArray(list)) {
                    types = Array.from(new Set(list.map((d: any) => d?.name).filter(Boolean)));
                  }
                }
              } catch {}
            }
            lines.push(`Connected Devices — ${types.length ? types.join(', ') : 'none detected'}`);
          } catch {
            lines.push('Connected Devices — not available.');
          }
        }

        if (wantsEmail) {
          let email = (healthData?.profile as any)?.email;
          if (!email) {
            try {
              const mock = await AsyncStorage.getItem('mockUserData');
              if (mock) {
                const m = JSON.parse(mock);
                if (m?.email) email = m.email;
              }
            } catch {}
          }
          if (!email) {
            try {
              const prof = await AsyncStorage.getItem('profile');
              if (prof) {
                const p = JSON.parse(prof);
                if (p?.email) email = p.email;
              }
            } catch {}
          }
          lines.push(`Account Email — ${email || 'not set'}`);
        }

        if (lines.length) {
          return lines.join('\n');
        }
      }
    } catch {}
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      return "I need an OpenAI API key to provide intelligent health insights. Please add your OpenAI API key to the .env file as EXPO_PUBLIC_OPENAI_API_KEY to unlock my full capabilities.";
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
      const maxMessages = this.MAX_CONTEXT_MESSAGES; // Keep more context for better continuity
      // Ensure settings and other fields are present: prefer provided, else fall back to snapshot
      let mergedHealthData = healthData ? { ...healthData } : {} as any;
      try {
        const snap = await loadUserSnapshot();
        if (snap) {
          if (!mergedHealthData.profile && snap.profile) mergedHealthData.profile = snap.profile;
          if ((!mergedHealthData.biomarkers || mergedHealthData.biomarkers.length === 0) && snap.biomarkers) mergedHealthData.biomarkers = snap.biomarkers;
          if (!mergedHealthData.healthScore && snap.healthScore) mergedHealthData.healthScore = snap.healthScore;
          if ((!mergedHealthData.deviceData || mergedHealthData.deviceData.length === 0) && snap.deviceData) mergedHealthData.deviceData = snap.deviceData;
          if (!mergedHealthData.settings && snap.settings) mergedHealthData.settings = snap.settings;
          if (!mergedHealthData.labResults && snap.labResults) mergedHealthData.labResults = snap.labResults;
          if (!mergedHealthData.bodySystems && snap.profile?.bodySystems) mergedHealthData.bodySystems = snap.profile.bodySystems;
          // Keep travelHealth as-is (not in snapshot yet)
        } else if (!mergedHealthData.settings) {
          const s = await this.loadSettingsSnapshot();
          if (s) mergedHealthData.settings = s;
        }
      } catch {}

      // Optionally try mock API chart to enrich context if server running
      try {
        const uid = ((healthData?.profile as any)?.userId || (healthData?.profile as any)?.user_id || 'demo');
        const chart = await getUserChart(String(uid));
        if (chart) {
          if (!mergedHealthData.profile && chart.profile) mergedHealthData.profile = chart.profile;
          if ((!mergedHealthData.biomarkers || mergedHealthData.biomarkers.length === 0) && chart.biomarkers) mergedHealthData.biomarkers = chart.biomarkers;
          if (!mergedHealthData.healthScore && chart.healthScore) mergedHealthData.healthScore = chart.healthScore;
          if ((!mergedHealthData.deviceData || mergedHealthData.deviceData.length === 0) && chart.deviceData) mergedHealthData.deviceData = chart.deviceData;
          if (!mergedHealthData.settings && chart.settings) mergedHealthData.settings = chart.settings;
          if (!mergedHealthData.labResults && chart.labResults) mergedHealthData.labResults = chart.labResults;
        }
      } catch {}

      const systemPrompt = this.getAdvancedSystemPrompt(updatedContext, mergedHealthData, intent);
      
      const isDirect = intent === 'direct_question' || intent === 'medication_info';
      const historyForModel = isDirect ? history.slice(-2) : history.slice(-maxMessages);

      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        ...historyForModel.map(msg => ({
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
          temperature: isDirect ? 0.25 : 0.7,
          max_tokens: 800, // Reasonable response length
          presence_penalty: 0.0, // Don't force topic changes
          frequency_penalty: 0.0, // Allow natural repetition if needed
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiRaw = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
      const aiContent = this.stripEmojis(aiRaw);

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
      // Trim and summarize if needed before saving
      const { history: trimmedHistory, context: finalContext } = await this.trimHistoryWithSummary(history, updatedContext);
      await this.saveConversationHistory(trimmedHistory);
      await this.saveUserContext(finalContext);

      return aiContent;
    } catch (error) {
      console.error('Health Assistant Error:', error);
      return "I'm having trouble connecting right now. Please check your internet connection and try again. In the meantime, remember that I'm here to help with health education and insights - always consult your healthcare provider for medical decisions.";
    }
  }

  /**
   * Stream chat tokens from OpenAI and emit incremental content.
   * Falls back to non-streaming if the environment doesn't support ReadableStream.
   */
  static async streamChatWithAssistant(
    message: string,
    conversationHistory?: HealthChatMessage[],
    healthData?: {
      profile: UserProfile | null;
      biomarkers: Biomarker[];
      healthScore: HealthScore | null;
      deviceData?: DeviceData[];
      settings?: any;
      labResults?: LabResult[];
      bodySystems?: BodySystem[];
      travelHealth?: TravelHealth | null;
    },
    onDelta?: (accumulatedText: string) => void
  ): Promise<string> {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      const msg = "I need an OpenAI API key to provide intelligent health insights. Please add your OpenAI API key to the .env file as EXPO_PUBLIC_OPENAI_API_KEY to unlock my full capabilities.";
      onDelta?.(msg);
      return msg;
    }

    try {
      // Load context and history similar to chatWithAssistant
      let history = conversationHistory || await this.loadConversationHistory();
      const userContext = await this.loadUserContext();
      const intent = this.analyzeUserIntent(message);
      const updatedContext = await this.updateUserContext(userContext, intent, healthData);

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

      // Merge health data snapshot as in chatWithAssistant
      let mergedHealthData = healthData ? { ...healthData } : {} as any;
      try {
        const snap = await loadUserSnapshot();
        if (snap) {
          if (!mergedHealthData.profile && snap.profile) mergedHealthData.profile = snap.profile;
          if ((!mergedHealthData.biomarkers || mergedHealthData.biomarkers.length === 0) && snap.biomarkers) mergedHealthData.biomarkers = snap.biomarkers;
          if (!mergedHealthData.healthScore && snap.healthScore) mergedHealthData.healthScore = snap.healthScore;
          if ((!mergedHealthData.deviceData || mergedHealthData.deviceData.length === 0) && snap.deviceData) mergedHealthData.deviceData = snap.deviceData;
          if (!mergedHealthData.settings && snap.settings) mergedHealthData.settings = snap.settings;
          if (!mergedHealthData.labResults && snap.labResults) mergedHealthData.labResults = snap.labResults;
          if (!mergedHealthData.bodySystems && snap.profile?.bodySystems) mergedHealthData.bodySystems = snap.profile.bodySystems;
        } else if (!mergedHealthData.settings) {
          const s = await this.loadSettingsSnapshot();
          if (s) mergedHealthData.settings = s;
        }
      } catch {}

      const systemPrompt = this.getAdvancedSystemPrompt(updatedContext, mergedHealthData, intent);
      const isDirect = intent === 'direct_question' || intent === 'medication_info';
      const historyForModel = isDirect ? history.slice(-2) : history.slice(-this.MAX_CONTEXT_MESSAGES);

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...historyForModel.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
      ];

      const payload = {
          model: 'gpt-4o',
          messages,
          temperature: isDirect ? 0.25 : 0.7,
          max_tokens: 800,
          stream: true,
      };
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const reader = (response as any).body?.getReader?.();
      // Fallback to non-streaming if reader is unavailable
      if (!reader) {
        // Re-issue the request without streaming so we can JSON-parse the result
        const nonStreamPayload = { ...payload, stream: false } as any;
        const nonStreamRes = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify(nonStreamPayload),
        });
        if (!nonStreamRes.ok) {
          throw new Error(`OpenAI API error: ${nonStreamRes.status}`);
        }
        const data = await nonStreamRes.json();
        const aiRaw = data.choices?.[0]?.message?.content || '';
        const finalText = this.stripEmojis(aiRaw || "I'm sorry, I couldn't generate a response.");
        onDelta?.(finalText);
        // Persist as in non-streaming path
        const aiMessage: HealthChatMessage = { id: `${Date.now()}-ai`, role: 'assistant', content: finalText, timestamp: new Date(), metadata: { topics: this.extractTopics(finalText) } };
        history.push(aiMessage);
        const { history: trimmedHistory, context: finalContext } = await this.trimHistoryWithSummary(history, updatedContext);
        await this.saveConversationHistory(trimmedHistory);
        await this.saveUserContext(finalContext);
        return finalText;
      }

      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.replace(/^data:\s*/i, '');
          if (payload === '[DONE]') { done = true; break; }
          try {
            const obj = JSON.parse(payload);
            const delta = obj?.choices?.[0]?.delta?.content || '';
            if (delta) {
              accumulated += delta;
              onDelta?.(this.stripEmojis(accumulated));
            }
          } catch {}
        }
      }

      const finalText = this.stripEmojis(accumulated || "I'm sorry, I couldn't generate a response.");
      // Persist conversation and memory
      const aiMessage: HealthChatMessage = { id: `${Date.now()}-ai`, role: 'assistant', content: finalText, timestamp: new Date(), metadata: { topics: this.extractTopics(finalText) } };
      history.push(aiMessage);
      const { history: trimmedHistory, context: finalContext } = await this.trimHistoryWithSummary(history, updatedContext);
      await this.saveConversationHistory(trimmedHistory);
      await this.saveUserContext(finalContext);
      return finalText;
    } catch (error) {
      console.error('Health Assistant Streaming Error:', error);
      const fallback = "I'm having trouble connecting right now. Please try again in a moment.";
      onDelta?.(fallback);
      return fallback;
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
    const trimmed = lowerMessage.trim();

    // Direct definition / factual question
    if (/^(what is|what's|whats|define|explain|how does|how do)\b/.test(trimmed) || trimmed.includes('definition')) {
      return 'direct_question';
    }

    // Medication/supplement specifics: dosage, safety, interactions
    if (/(dose|dosage|how much|mg|milligram|microgram|mcg|side effect|adverse|contraindicat|interaction|interact|safety)/.test(lowerMessage)) {
      return 'medication_info';
    }
    
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
    const now = new Date();
    
    const context: UserHealthContext = currentContext || {
      preferredTopics: [],
      healthConcerns: [],
      goalsFocus: [],
      conversationStyle: 'detailed',
      lastDataUpdate: now,
      conversationCount: 0,
      lastConversationDate: now,
      favoriteTopics: [],
      avoidedTopics: [],
      biomarkerTrends: {},
      personalInsights: {},
      healthGoals: {},
      recommendationsHistory: {},
      learnedPreferences: {
        responseLength: 'medium',
        technicalLevel: 'intermediate',
        focusAreas: [],
        communicationStyle: 'casual',
      },
    };

    // Update conversation tracking
    context.conversationCount += 1;
    context.lastConversationDate = now;

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
          changePercent: 0, // Would be calculated from previous values
          lastDiscussed: now
        };
      });
    }

    context.lastDataUpdate = now;
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
    deviceData?: DeviceData[];
    settings?: UserSettings | null;
    labResults?: LabResult[];
    bodySystems?: BodySystem[];
    travelHealth?: TravelHealth | null;
  }): string {
    if (!healthData) return 'No current health data available.';

    let formattedData = '';

    // User Demographics
    if (healthData.profile) {
      const p: any = healthData.profile as any;
      const displayName = p.preferredName || p.displayName || [p.firstName, p.surname].filter(Boolean).join(' ');
      if (displayName) {
        formattedData += `Name: ${displayName}\n`;
      }
      if (p.email) {
        formattedData += `Email: ${p.email}\n`;
      }
      if (healthData.profile.age) {
        formattedData += `Age: ${healthData.profile.age}\n`;
      }
      if (healthData.profile.gender) {
        formattedData += `Gender: ${healthData.profile.gender}\n`;
      }
      if (healthData.profile.height && healthData.profile.weight) {
        const bmi = (healthData.profile.weight / Math.pow(healthData.profile.height / 100, 2)).toFixed(1);
        formattedData += `Height: ${healthData.profile.height} cm\n`;
        formattedData += `Weight: ${healthData.profile.weight} kg\n`;
        formattedData += `BMI: ${bmi}\n`;
      }
      if (p.bloodType) {
        formattedData += `Blood Type: ${p.bloodType}\n`;
      }

      // Allergies
      try {
        const allergies = p.allergies || [];
        if (Array.isArray(allergies) && allergies.length > 0) {
          const list = allergies
            .map((a: any) => a?.name || a?.allergen || '')
            .filter(Boolean)
            .slice(0, 10) // keep concise
            .join(', ');
          if (list) formattedData += `Allergies: ${list}\n`;
        }
      } catch {}

      // Medications
      try {
        const medications = p.medications || [];
        if (Array.isArray(medications) && medications.length > 0) {
          const list = medications
            .map((m: any) => m?.name ? `${m.name}${m?.dose ? ` ${m.dose}` : ''}` : '')
            .filter(Boolean)
            .slice(0, 10)
            .join(', ');
          if (list) formattedData += `Medications: ${list}\n`;
        }
      } catch {}

      // Medical history
      try {
        const history = p.medicalHistory || [];
        if (Array.isArray(history) && history.length > 0) {
          const list = history
            .map((h: any) => h?.name || h?.condition || '')
            .filter(Boolean)
            .slice(0, 10)
            .join(', ');
          if (list) formattedData += `Medical History: ${list}\n`;
        }
      } catch {}

      // Family history
      try {
        const fam = p.familyHistory || [];
        if (Array.isArray(fam) && fam.length > 0) {
          const list = fam
            .map((f: any) => {
              const rel = f?.relation || f?.relative || f?.relationship || '';
              const cond = f?.name || f?.condition || f?.diagnosis || '';
              return [rel, cond].filter(Boolean).join(' - ');
            })
            .filter(Boolean)
            .slice(0, 10)
            .join('; ');
          if (list) formattedData += `Family History: ${list}\n`;
        }
      } catch {}
    }

    // Health Score
    if (healthData.healthScore?.overall) {
      formattedData += `Health Score: ${healthData.healthScore.overall}/100\n`;
    }

    // Connected Devices and Last Sync
    try {
      const deviceEvents = Array.isArray(healthData.deviceData) ? healthData.deviceData : [];
      const deviceTypes = Array.from(new Set(deviceEvents.map((d: any) => d?.deviceType))).filter(Boolean);
      if (deviceTypes.length > 0) {
        formattedData += `Connected Devices: ${deviceTypes.join(', ')}\n`;
      }
      const lastSync = (() => {
        try {
          const times = deviceEvents
            .map((d: any) => (d?.timestamp ? new Date(d.timestamp).getTime() : NaN))
            .filter((t: number) => Number.isFinite(t));
          if (times.length > 0) return new Date(Math.max(...times));
        } catch {}
        return null;
      })();
      if (lastSync) {
        formattedData += `Last Device Sync: ${lastSync.toISOString()}\n`;
      }
    } catch {}

    // Settings: General, Privacy & Security, Data Sync, Notifications, Accessibility / Display, App Info, Support & Legal
    try {
      const s = healthData.settings as any;
      if (s) {
        const general = s.general || {};
        const notifications = s.notifications || {};
        const privacy = s.privacy || {};
        const dataSync = s.dataSync || {};
        const accessibility = s.accessibility || {};
        const biomarkers = s.biomarkers || {};
        const app = s.app || {};

        // General / Display & Format
        const generalParts: string[] = [];
        if (general.units) generalParts.push(`Units: ${general.units}`);
        if (general.timeFormat) generalParts.push(`Time: ${general.timeFormat}`);
        if (general.dateFormat) generalParts.push(`Date: ${general.dateFormat}`);
        if (general.language) generalParts.push(`Language: ${general.language}`);
        if (general.theme) generalParts.push(`Theme: ${general.theme}`);
        if (generalParts.length) formattedData += `Display & Format: ${generalParts.join(', ')}\n`;

        // Accessibility
        const accParts: string[] = [];
        if (accessibility.fontSize) accParts.push(`Font: ${accessibility.fontSize}`);
        if (accessibility.highContrast !== undefined) accParts.push(`HighContrast: ${accessibility.highContrast ? 'on' : 'off'}`);
        if (accessibility.reducedMotion !== undefined) accParts.push(`ReducedMotion: ${accessibility.reducedMotion ? 'on' : 'off'}`);
        if (accessibility.hapticFeedback !== undefined) accParts.push(`Haptics: ${accessibility.hapticFeedback ? 'on' : 'off'}`);
        if (accParts.length) formattedData += `Accessibility: ${accParts.join(', ')}\n`;

        // Privacy & Security
        const privParts: string[] = [];
        if (privacy.biometricAuth !== undefined) privParts.push(`Biometric: ${privacy.biometricAuth ? 'on' : 'off'}`);
        if (privacy.twoFactorAuth !== undefined) privParts.push(`2FA: ${privacy.twoFactorAuth ? 'on' : 'off'}`);
        if (privacy.sessionTimeout) privParts.push(`Timeout: ${privacy.sessionTimeout}`);
        if (privacy.locationServices !== undefined) privParts.push(`Location: ${privacy.locationServices ? 'on' : 'off'}`);
        if (privacy.dataSharing) {
          const ds = privacy.dataSharing;
          privParts.push(`Sharing: analytics=${ds.analytics ? 'on' : 'off'}, anonymized=${ds.anonymizedData ? 'on' : 'off'}, thirdParty=${ds.thirdPartyApps ? 'on' : 'off'}`);
        }
        if (privParts.length) formattedData += `Privacy & Security: ${privParts.join(', ')}\n`;

        // Data & Sync
        const syncParts: string[] = [];
        if (dataSync.autoSync !== undefined) syncParts.push(`AutoSync: ${dataSync.autoSync ? 'on' : 'off'}`);
        if (dataSync.backgroundSync !== undefined) syncParts.push(`Background: ${dataSync.backgroundSync ? 'on' : 'off'}`);
        if (dataSync.syncFrequency) syncParts.push(`Frequency: ${dataSync.syncFrequency}`);
        if (dataSync.wifiOnly !== undefined) syncParts.push(`WiFiOnly: ${dataSync.wifiOnly ? 'on' : 'off'}`);
        if (dataSync.dataRetention) syncParts.push(`Retention: ${dataSync.dataRetention}`);
        if (dataSync.backupEnabled !== undefined) syncParts.push(`Backup: ${dataSync.backupEnabled ? 'on' : 'off'}`);
        if (dataSync.backupFrequency) syncParts.push(`BackupEvery: ${dataSync.backupFrequency}`);
        if (syncParts.length) formattedData += `Data & Sync: ${syncParts.join(', ')}\n`;

        // Notifications
        const notifParts: string[] = [];
        if (notifications.enabled !== undefined) notifParts.push(`Enabled: ${notifications.enabled ? 'on' : 'off'}`);
        ['healthSummaries','biomarkerAlerts','vaccinationReminders','travelWarnings','syncIssues','emergencyAlerts','appUpdates'].forEach((k) => {
          if (notifications[k] !== undefined) notifParts.push(`${k}:${notifications[k] ? 'on' : 'off'}`);
        });
        if (notifications.quietHours && notifications.quietHours.enabled) {
          notifParts.push(`QuietHours: ${notifications.quietHours.startTime}-${notifications.quietHours.endTime}`);
        }
        if (notifParts.length) formattedData += `Notifications: ${notifParts.join(', ')}\n`;

        // Biomarker display prefs (as part of display format)
        if (biomarkers.displaySettings) {
          const ds = biomarkers.displaySettings as any;
          const bds: string[] = [];
          if (ds.showTrends !== undefined) bds.push(`Trends:${ds.showTrends ? 'on' : 'off'}`);
          if (ds.showPercentiles !== undefined) bds.push(`Percentiles:${ds.showPercentiles ? 'on' : 'off'}`);
          if (ds.groupByCategory !== undefined) bds.push(`GroupBy:${ds.groupByCategory ? 'category' : 'none'}`);
          if (ds.sortBy) bds.push(`Sort:${ds.sortBy}`);
          if (bds.length) formattedData += `Biomarker Display: ${bds.join(', ')}\n`;
        }

        // App Info
        const version = (appConfig?.expo?.version) || app?.lastVersion || 'unknown';
        formattedData += `App Info: Version ${version}\n`;

        // Support & Help (static summary for assistant context awareness)
        formattedData += `Support & Help: support@corehealth.com, feedback@corehealth.com, FAQ available in Support & Help.\n`;

        // Legal & Compliance (available documents)
        formattedData += `Legal & Compliance: Terms of Service, Privacy Policy, Consent Forms, HIPAA, Data Processing Agreement, Data Retention Policy.\n`;
      }
    } catch {}

    // Body Systems summary
    try {
      const systems = healthData.bodySystems || [];
      if (systems.length) {
        const rows = systems
          .slice(0, 8)
          .map((bs: any) => `${bs.name || bs.id}: ${typeof bs.riskScore === 'number' ? bs.riskScore : '-'}`)
          .join('; ');
        if (rows) formattedData += `Body Systems Risk: ${rows}\n`;
      }
    } catch {}

    // Travel Health summary
    try {
      const th: any = healthData.travelHealth;
      if (th) {
        const parts: string[] = [];
        if (th.overallRiskLevel) parts.push(`Overall:${th.overallRiskLevel}`);
        if (th.airQuality?.value !== undefined) parts.push(`AQI:${th.airQuality.value}`);
        if (th.pollenLevels?.value !== undefined) parts.push(`Pollen:${th.pollenLevels.value}`);
        if (th.uvIndex?.value !== undefined) parts.push(`UV:${th.uvIndex.value}`);
        if (parts.length) formattedData += `Travel Health: ${parts.join(', ')}\n`;
      }
    } catch {}

    // Recent Lab Results summary
    try {
      const labs = Array.isArray(healthData.labResults) ? healthData.labResults : [];
      if (labs.length) {
        formattedData += `\nRecent Lab Results:\n`;
        labs.slice(-5).forEach((lr: any) => {
          const name = lr.testName || lr.name || 'Lab';
          const value = lr.value !== undefined ? lr.value : '';
          const unit = lr.unit || '';
          const date = lr.date || lr.recorded_at || lr.created_at || '';
          const status = lr.status || '';
          formattedData += `• ${name}: ${value} ${unit} ${status ? `(${status})` : ''} ${date ? `on ${date}` : ''}\n`;
        });
      }
    } catch {}

    // Recent Biomarkers (simplified)
    if (healthData.biomarkers?.length) {
      formattedData += `\nRecent Biomarkers:\n`;
      healthData.biomarkers.slice(0, 5).forEach(biomarker => {
        const status = this.assessBiomarkerStatus(biomarker);
        formattedData += `• ${biomarker.name}: ${biomarker.value} ${biomarker.unit} (${status})\n`;
      });
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
   * Summarize older conversation to preserve context while limiting token usage
   */
  private static async summarizeConversation(messages: HealthChatMessage[]): Promise<{ summary: string; topics: string[] }> {
    try {
      const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a concise summarizer for a health assistant chat. Produce a short summary (80-150 words) capturing user goals, preferences, notable biomarker/health mentions, and any commitments or follow-ups. Also list 3-7 key topics as a comma-separated list.' },
            { role: 'user', content: transcript.slice(0, 12000) }
          ],
          temperature: 0.2,
          max_tokens: 350,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI summarize error: ${response.status}`);
      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content || '';
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      let summary = content;
      let topics: string[] = [];
      // Simple heuristic: if a line starts with Topics: parse it
      const topicsLine = lines.find(l => /^topics\s*:/i.test(l));
      if (topicsLine) {
        summary = lines.filter(l => l !== topicsLine).join('\n');
        const list = topicsLine.split(':')[1] || '';
        topics = list.split(',').map(t => t.trim()).filter(Boolean);
      }
      return { summary: this.stripEmojis(summary), topics };
    } catch (e) {
      console.warn('Summarization failed, skipping:', e);
      return { summary: '', topics: [] };
    }
  }

  /**
   * Trim long histories and persist a summary into user context.
   */
  private static async trimHistoryWithSummary(history: HealthChatMessage[], context: UserHealthContext): Promise<{ history: HealthChatMessage[]; context: UserHealthContext }> {
    try {
      if (history.length <= this.TRIM_THRESHOLD) {
        return { history, context };
      }

      const cutoff = history.length - this.TRIM_KEEP_RECENT;
      const older = history.slice(0, Math.max(0, cutoff));
      const recent = history.slice(-this.TRIM_KEEP_RECENT);

      const { summary, topics } = await this.summarizeConversation(older);
      if (summary) {
        context.conversationSummary = summary;
      }
      if (topics && topics.length) {
        const merged = new Set([...(context.keyTopics || []), ...topics]);
        context.keyTopics = Array.from(merged).slice(-12);
      }

      return { history: recent, context };
    } catch (e) {
      console.warn('trimHistoryWithSummary error, keeping history as-is:', e);
      return { history, context };
    }
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
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
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
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
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
      category: 'nutrition' as const,
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
        concerns: [],
        improvements: []
      },
      nextActions: [
        "Track your sleep for a week to identify patterns",
        "Schedule a check-in with your healthcare provider"
      ],
      followUpQuestions: []
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



  /**
   * Save a chat session with all its messages
   */
  static async saveChatSession(session: ChatSession): Promise<void> {
    try {
      const existingSessions = await this.loadAllChatSessions();
      const updatedSessions = existingSessions.filter(s => s.id !== session.id);
      updatedSessions.push(session);
      
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  }

  /**
   * Load a specific chat session by ID
   */
  static async loadChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessions = await this.loadAllChatSessions();
      return sessions.find(session => session.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to load chat session:', error);
      return null;
    }
  }

  /**
   * Load all chat sessions (for history list)
   */
  static async loadAllChatSessions(): Promise<ChatSession[]> {
    try {
      const stored = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          lastUpdated: new Date(session.lastUpdated),
          messages: session.messages.map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp)
          }))
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return [];
    }
  }

  /**
   * Delete a specific chat session
   */
  static async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.loadAllChatSessions();
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  }

  /**
   * Update chat session title and messages
   */
  static async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    try {
      const sessions = await this.loadAllChatSessions();
      const sessionIndex = sessions.findIndex(session => session.id === sessionId);
      
      if (sessionIndex !== -1) {
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          ...updates,
          lastUpdated: new Date()
        };
        await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to update chat session:', error);
    }
  }
} 