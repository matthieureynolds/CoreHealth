import {
  UserProfile,
  Biomarker,
  HealthScore,
  DailyInsight,
  DeviceData,
  LabResult,
  BodySystem,
  TravelHealth,
} from "../../types";
import { TextDecoder } from "text-encoding";
import type { UserSettings } from "../../types/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  formatDateBySetting,
  formatTimeBySetting,
} from "../../utils/dateFormat";
import { loadUserSnapshot } from "../user/userSnapshotService";
import {
  buildSystemPrompt,
  formatHealthDataForPrompt,
} from "./healthAssistantPrompt";
import {
  generateHealthInsights as _generateHealthInsights,
  generateDailyRecommendations as _generateDailyRecommendations,
} from "./healthAssistantInsights";
import {
  loadConversationHistory,
  saveConversationHistory,
  loadUserContext,
  saveUserContext,
  syncSettingsSnapshot,
  loadSettingsSnapshot,
  clearConversationMemory,
  updateUserContext,
  trimHistoryWithSummary,
} from "./healthAssistantMemoryService";
import {
  saveChatSession,
  loadChatSession,
  loadAllChatSessions,
  deleteChatSession,
  updateChatSession,
} from "./healthAssistantSessionService";
import { DataService } from "../data/dataService";

// OpenAI API Configuration
export const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY || "your-openai-api-key-here";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// ---------------------------------------------------------------------------
// Types (kept here so all existing consumers can import from this file)
// ---------------------------------------------------------------------------

export interface HealthChatMessage {
  id: string;
  role: "user" | "assistant";
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
  conversationStyle: "detailed" | "concise" | "technical";

  // Memory and learning
  lastDataUpdate: Date;
  conversationCount: number;
  lastConversationDate: Date;
  favoriteTopics: string[];
  avoidedTopics: string[];

  // Health tracking
  biomarkerTrends: {
    [key: string]: {
      trend: "improving" | "stable" | "declining";
      significance: "normal" | "concerning" | "critical";
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
    responseLength: "short" | "medium" | "long";
    technicalLevel: "basic" | "intermediate" | "advanced";
    focusAreas: string[];
    communicationStyle: "casual" | "professional" | "motivational";
  };

  // Conversation memory
  conversationSummary?: string;
  keyTopics?: string[];
}

export interface HealthAssistantResponse {
  insights: string[];
  recommendations: string[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    concerns: string[];
    improvements: string[];
  };
  nextActions: string[];
  followUpQuestions: string[];
}

// ---------------------------------------------------------------------------
// Main service class
// ---------------------------------------------------------------------------

export class HealthAssistantService {
  private static readonly MAX_CONTEXT_MESSAGES = 20;

  // Remove emojis & pictographs from AI text
  private static stripEmojis(input: string): string {
    try {
      return input
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // Misc Symbols & Pictographs
        .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // Emoticons
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // Transport & Map
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, "") // Supplemental Symbols & Pictographs
        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "") // Symbols & Pictographs Extended-A
        .replace(/[\u{2600}-\u{27BF}]/gu, "") // Misc symbols + Dingbats subset
        .replace(/[\u200D\uFE0F]/g, ""); // ZWJ and VS16
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
      if (typeof profile.age === "number" && profile.age > 0)
        return profile.age;
      return null;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Memory / context delegation (forwarded to healthAssistantMemoryService)
  // ---------------------------------------------------------------------------

  static async loadConversationHistory(): Promise<HealthChatMessage[]> {
    return loadConversationHistory();
  }

  static async saveConversationHistory(
    history: HealthChatMessage[],
  ): Promise<void> {
    return saveConversationHistory(history);
  }

  static async loadUserContext(): Promise<UserHealthContext | null> {
    return loadUserContext();
  }

  static async saveUserContext(context: UserHealthContext): Promise<void> {
    return saveUserContext(context);
  }

  static async syncSettingsSnapshot(settings: UserSettings): Promise<void> {
    return syncSettingsSnapshot(settings);
  }

  static async loadSettingsSnapshot(): Promise<UserSettings | null> {
    return loadSettingsSnapshot();
  }

  static async clearConversationMemory(): Promise<void> {
    return clearConversationMemory();
  }

  // ---------------------------------------------------------------------------
  // Session delegation (forwarded to healthAssistantSessionService)
  // ---------------------------------------------------------------------------

  static async saveChatSession(session: ChatSession): Promise<void> {
    return saveChatSession(session);
  }

  static async loadChatSession(sessionId: string): Promise<ChatSession | null> {
    return loadChatSession(sessionId);
  }

  static async loadAllChatSessions(): Promise<ChatSession[]> {
    return loadAllChatSessions();
  }

  static async deleteChatSession(sessionId: string): Promise<void> {
    return deleteChatSession(sessionId);
  }

  static async updateChatSession(
    sessionId: string,
    updates: Partial<ChatSession>,
  ): Promise<void> {
    return updateChatSession(sessionId, updates);
  }

  // ---------------------------------------------------------------------------
  // Greeting
  // ---------------------------------------------------------------------------

  /**
   * Enhanced greeting with personalization
   */
  static async getPersonalizedGreeting(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null,
  ): Promise<string> {
    const name =
      (profile as any)?.preferredName || (profile as any)?.displayName;
    const hello = name ? `Hello, ${name}!` : "Hello!";
    const intro = `${hello} I'm Toto. How can I help you today?`;
    const disclosure =
      "I provide educational information and support — not a substitute for professional medical advice. Always consult your doctor for diagnosis or treatment.";
    return this.stripEmojis(`${intro} ${disclosure}`);
  }

  // ---------------------------------------------------------------------------
  // Intent & topic helpers
  // ---------------------------------------------------------------------------

  /**
   * Analyze user intent from message
   */
  private static analyzeUserIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    const trimmed = lowerMessage.trim();

    // Direct definition / factual question
    if (
      /^(what is|what's|whats|define|explain|how does|how do)\b/.test(
        trimmed,
      ) ||
      trimmed.includes("definition")
    ) {
      return "direct_question";
    }

    // Medication/supplement specifics: dosage, safety, interactions
    if (
      /(dose|dosage|how much|mg|milligram|microgram|mcg|side effect|adverse|contraindicat|interaction|interact|safety)/.test(
        lowerMessage,
      )
    ) {
      return "medication_info";
    }

    if (
      lowerMessage.includes("biomarker") ||
      lowerMessage.includes("lab") ||
      lowerMessage.includes("test")
    ) {
      return "biomarker_analysis";
    } else if (
      lowerMessage.includes("diet") ||
      lowerMessage.includes("nutrition") ||
      lowerMessage.includes("food")
    ) {
      return "nutrition_guidance";
    } else if (
      lowerMessage.includes("exercise") ||
      lowerMessage.includes("workout") ||
      lowerMessage.includes("fitness")
    ) {
      return "fitness_guidance";
    } else if (lowerMessage.includes("sleep")) {
      return "sleep_optimization";
    } else if (
      lowerMessage.includes("stress") ||
      lowerMessage.includes("mental")
    ) {
      return "stress_management";
    } else if (
      lowerMessage.includes("supplement") ||
      lowerMessage.includes("vitamin")
    ) {
      return "supplement_guidance";
    } else if (
      lowerMessage.includes("symptom") ||
      lowerMessage.includes("pain")
    ) {
      return "symptom_discussion";
    }

    return "general_health";
  }

  /**
   * Extract topics from message
   */
  private static extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    const topicKeywords: Record<string, string[]> = {
      cardiovascular: [
        "heart",
        "blood pressure",
        "cholesterol",
        "cardiovascular",
      ],
      metabolic: ["glucose", "diabetes", "insulin", "metabolism"],
      nutrition: ["diet", "food", "nutrition", "eating"],
      exercise: ["exercise", "workout", "fitness", "training"],
      sleep: ["sleep", "rest", "insomnia", "circadian"],
      stress: ["stress", "anxiety", "mental health", "mood"],
      supplements: ["supplement", "vitamin", "mineral", "omega"],
      liver: ["liver", "alt", "ast", "bilirubin"],
      kidney: ["kidney", "creatinine", "egfr", "urea"],
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // ---------------------------------------------------------------------------
  // Core chat
  // ---------------------------------------------------------------------------

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
    },
  ): Promise<string> {
    // Handle simple, deterministic questions without calling the model
    const lower = (message || "").trim().toLowerCase();
    if (healthData?.profile) {
      if (/\bwhat\s+is\s+my\s+age\b|\bhow\s+old\s+am\s+i\b/.test(lower)) {
        const age = this.getUserAge(healthData.profile);
        if (typeof age === "number") {
          return `Based on your TOTO profile, you are ${age} years old.`;
        }
        return "I couldn't find your age in your TOTO profile.";
      }
    }

    // Offline answers for settings/devices so we don't rely on network
    try {
      const wantsPrivacy =
        /privacy\s*(settings)?|biometric|2fa|two\s*factor|location\s*services|data\s*sharing/.test(
          lower,
        );
      const wantsSync =
        /last\s*(device\s*)?sync|when\s+did\s+i\s+last\s+sync/.test(lower);
      const wantsNotifications =
        /(notification|notifications|alert|alerts|reminder|reminders|motivat\w+|quiet\s*hours|before\s+(an?\s*)?(appointment|medication|event))/i.test(
          message,
        );
      const wantsDisplay =
        /(units|date\s*format|time\s*format|theme|language)/.test(lower) &&
        /what|which|show/i.test(message);
      const wantsDevices =
        /which\s+devices\s+are\s+connected|connected\s+devices/.test(lower);
      const wantsEmail =
        /what\s+email\s+is\s+my\s+account|my\s+account\s+email/.test(lower);
      const wantsTos =
        /(terms|t&c|tandc|t\s*&\s*c|terms\s*and\s*conditions)/i.test(message);
      const wantsPrivacyPolicy = /privacy\s*policy/i.test(message);

      if (
        wantsPrivacy ||
        wantsSync ||
        wantsNotifications ||
        wantsDisplay ||
        wantsDevices ||
        wantsEmail ||
        wantsTos ||
        wantsPrivacyPolicy
      ) {
        let s: UserSettings | null | undefined = healthData?.settings || null;
        if (!s) s = await loadSettingsSnapshot();

        const lines: string[] = [];
        if (wantsTos || /when\s*(were|was)\s*(the\s*)?terms/i.test(lower)) {
          try {
            let effective = await AsyncStorage.getItem(
              "@legal_tos_effective_date",
            );
            const lastUpdated = await AsyncStorage.getItem(
              "@legal_tos_last_updated",
            );
            const fallbackLastUpdated = "December 2024";
            const tosStr = effective
              ? `effective ${effective}`
              : lastUpdated
                ? `last updated ${lastUpdated}`
                : `last updated ${fallbackLastUpdated}`;
            lines.push(`Terms of Service — ${tosStr}`);
          } catch {
            /* graceful degradation */
          }
        }

        if (
          wantsPrivacyPolicy ||
          /when\s*(was|were)\s*privacy\s*policy/i.test(lower)
        ) {
          try {
            const effective =
              (await AsyncStorage.getItem("@legal_privacy_effective_date")) ||
              "1 January 2025";
            lines.push(`Privacy Policy — effective ${effective}`);
          } catch {
            /* graceful degradation */
          }
        }

        if (wantsPrivacy) {
          if (s?.privacy) {
            const p = s.privacy as any;
            lines.push(
              `Privacy & Security — Biometric: ${p.biometricAuth ? "on" : "off"}, 2FA: ${p.twoFactorAuth ? "on" : "off"}, Timeout: ${p.sessionTimeout}, Location: ${p.locationServices ? "on" : "off"}, Sharing: analytics=${p.dataSharing?.analytics ? "on" : "off"}, anonymized=${p.dataSharing?.anonymizedData ? "on" : "off"}, third-party=${p.dataSharing?.thirdPartyApps ? "on" : "off"}`,
            );
          } else {
            lines.push("Privacy & Security — not found in your settings yet.");
          }
        }

        if (wantsSync) {
          const deviceEvents = Array.isArray(healthData?.deviceData)
            ? healthData!.deviceData!
            : [];
          let lastSync: Date | null = null;
          try {
            const times = deviceEvents
              .map((d: any) =>
                d?.timestamp ? new Date(d.timestamp).getTime() : NaN,
              )
              .filter((t: number) => Number.isFinite(t));
            if (times.length > 0) lastSync = new Date(Math.max(...times));
          } catch {
            /* graceful degradation */
          }
          if (!lastSync) {
            try {
              const iso = await AsyncStorage.getItem(
                "@corehealth_last_sync_at",
              );
              if (iso) lastSync = new Date(iso);
            } catch {
              /* graceful degradation */
            }
          }
          if (lastSync) {
            try {
              const timeFmt = (
                s?.general?.timeFormat === "12h" ? "12h" : "24h"
              ) as "12h" | "24h";
              const dateFmt = (s?.general?.dateFormat || "DD/MM/YYYY") as any;
              const d = formatDateBySetting(lastSync, dateFmt);
              const t = formatTimeBySetting(lastSync, timeFmt);
              lines.push(`Last Device Sync — ${d} ${t}`);
            } catch {
              lines.push(`Last Device Sync — ${lastSync.toISOString()}`);
            }
          } else {
            lines.push("Last Device Sync — no recent sync recorded");
          }
        }

        if (wantsNotifications) {
          if (s?.notifications) {
            const n = s.notifications as any;
            const enabledList = [
              "healthSummaries",
              "biomarkerAlerts",
              "vaccinationReminders",
              "travelWarnings",
              "syncIssues",
              "emergencyAlerts",
              "appUpdates",
            ]
              .filter((k) => n[k])
              .map((k) => k);
            const qh = n.quietHours?.enabled
              ? `${n.quietHours.startTime}-${n.quietHours.endTime}`
              : "off";
            let medAlerts: string[] = [];
            let apptAlerts: string[] = [];
            try {
              const [med, appt] = await Promise.all([
                AsyncStorage.getItem("@notif_med_alerts"),
                AsyncStorage.getItem("@notif_appt_alerts"),
              ]);
              if (med) {
                const p = JSON.parse(med);
                if (Array.isArray(p)) medAlerts = p;
              }
              if (appt) {
                const p = JSON.parse(appt);
                if (Array.isArray(p)) apptAlerts = p;
              }
            } catch {
              /* graceful degradation */
            }
            const normalize = (s: string): string => {
              const m = s.match(
                /(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks)/i,
              );
              if (m) {
                const n = m[1];
                const unit = m[2].toLowerCase();
                const short = unit.startsWith("min")
                  ? "m"
                  : unit.startsWith("hour")
                    ? "h"
                    : unit.startsWith("day")
                      ? "d"
                      : "w";
                return `${n}${short} before`;
              }
              if (/at\s*time\s*of\s*event/i.test(s)) return "0m at event";
              return s;
            };
            const medStr = medAlerts.length
              ? `medication alerts: ${medAlerts.map(normalize).join(", ")}`
              : "";
            const apptStr = apptAlerts.length
              ? `appointment alerts: ${apptAlerts.map(normalize).join(", ")}`
              : "";
            const extras = [medStr, apptStr].filter(Boolean).join("; ");
            lines.push(
              `Notifications — master: ${n.enabled ? "on" : "off"}, enabled: ${enabledList.length ? enabledList.join(", ") : "none"}, quiet hours: ${qh}${extras ? `, ${extras}` : ""}`,
            );
          } else {
            lines.push("Notifications — not found in your settings yet.");
          }
        }

        if (wantsDisplay) {
          if (s?.general) {
            const g = s.general as any;
            lines.push(
              `Display & Format — Units: ${g.units}, Date: ${g.dateFormat}, Time: ${g.timeFormat}, Language: ${g.language}, Theme: ${g.theme}`,
            );
          } else {
            lines.push("Display & Format — not found in your settings yet.");
          }
        }

        if (wantsDevices) {
          try {
            const deviceEvents = Array.isArray(healthData?.deviceData)
              ? healthData!.deviceData!
              : [];
            let types = Array.from(
              new Set(deviceEvents.map((d: any) => d?.deviceType)),
            ).filter(Boolean);
            if (!types.length) {
              try {
                const raw = await AsyncStorage.getItem("connectedDevices");
                if (raw) {
                  const list = JSON.parse(raw);
                  if (Array.isArray(list)) {
                    types = Array.from(
                      new Set(list.map((d: any) => d?.name).filter(Boolean)),
                    );
                  }
                }
              } catch {
                /* graceful degradation */
              }
            }
            lines.push(
              `Connected Devices — ${types.length ? types.join(", ") : "none detected"}`,
            );
          } catch {
            lines.push("Connected Devices — not available.");
          }
        }

        if (wantsEmail) {
          let email = (healthData?.profile as any)?.email;
          if (!email) {
            try {
              const mock = await AsyncStorage.getItem("mockUserData");
              if (mock) {
                const m = JSON.parse(mock);
                if (m?.email) email = m.email;
              }
            } catch {
              /* graceful degradation */
            }
          }
          if (!email) {
            try {
              const prof = await AsyncStorage.getItem("profile");
              if (prof) {
                const p = JSON.parse(prof);
                if (p?.email) email = p.email;
              }
            } catch {
              /* graceful degradation */
            }
          }
          lines.push(`Account Email — ${email || "not set"}`);
        }

        if (lines.length) {
          return lines.join("\n");
        }
      }
    } catch {
      /* graceful degradation */
    }

    try {
      const { reply } = await DataService.sendChatMessage(message);
      return this.stripEmojis(reply);
    } catch (error) {
      console.error("Backend AI chat error:", error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }

    try {
      let history = conversationHistory || (await loadConversationHistory());
      const userContext = await loadUserContext();
      const intent = this.analyzeUserIntent(message);
      const updatedContext = await updateUserContext(
        userContext,
        intent,
        healthData,
      );

      const newMessage: HealthChatMessage = {
        id: `${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
        metadata: {
          healthDataSnapshot: healthData
            ? {
                healthScore: healthData.healthScore?.overall,
                biomarkerCount: healthData.biomarkers?.length || 0,
                lastUpdate: new Date(),
              }
            : undefined,
          userIntent: intent,
          topics: this.extractTopics(message),
        },
      };
      history.push(newMessage);

      const maxMessages = this.MAX_CONTEXT_MESSAGES;
      let mergedHealthData = healthData ? { ...healthData } : ({} as any);
      try {
        const snap = await loadUserSnapshot();
        if (snap) {
          if (!mergedHealthData.profile && snap.profile)
            mergedHealthData.profile = snap.profile;
          if (
            (!mergedHealthData.biomarkers ||
              mergedHealthData.biomarkers.length === 0) &&
            snap.biomarkers
          )
            mergedHealthData.biomarkers = snap.biomarkers;
          if (!mergedHealthData.healthScore && snap.healthScore)
            mergedHealthData.healthScore = snap.healthScore;
          if (
            (!mergedHealthData.deviceData ||
              mergedHealthData.deviceData.length === 0) &&
            snap.deviceData
          )
            mergedHealthData.deviceData = snap.deviceData;
          if (!mergedHealthData.settings && snap.settings)
            mergedHealthData.settings = snap.settings;
          if (!mergedHealthData.labResults && snap.labResults)
            mergedHealthData.labResults = snap.labResults;
          if (!mergedHealthData.bodySystems && snap.profile?.bodySystems)
            mergedHealthData.bodySystems = snap.profile.bodySystems;
        } else if (!mergedHealthData.settings) {
          const s = await loadSettingsSnapshot();
          if (s) mergedHealthData.settings = s;
        }
      } catch {
        /* graceful degradation */
      }

      const systemPrompt = buildSystemPrompt(
        updatedContext,
        mergedHealthData,
        intent,
      );
      const isDirect =
        intent === "direct_question" || intent === "medication_info";
      const historyForModel = isDirect
        ? history.slice(-2)
        : history.slice(-maxMessages);

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...historyForModel.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          temperature: isDirect ? 0.25 : 0.7,
          max_tokens: 800,
          presence_penalty: 0.0,
          frequency_penalty: 0.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiRaw =
        data.choices[0]?.message?.content ||
        "I'm sorry, I couldn't generate a response. Please try again.";
      const aiContent = this.stripEmojis(aiRaw);

      const aiMessage: HealthChatMessage = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
        metadata: { topics: this.extractTopics(aiContent) },
      };
      history.push(aiMessage);

      const { history: trimmedHistory, context: finalContext } =
        await trimHistoryWithSummary(history, updatedContext);
      await saveConversationHistory(trimmedHistory);
      await saveUserContext(finalContext);

      return aiContent;
    } catch (error) {
      console.error("Health Assistant Error:", error);
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
    onDelta?: (accumulatedText: string) => void,
  ): Promise<string> {
    try {
      const { reply } = await DataService.sendChatMessage(message);
      const cleaned = this.stripEmojis(reply);
      onDelta?.(cleaned);
      return cleaned;
    } catch (error) {
      console.error("Backend AI chat error:", error);
      const fallback =
        "I'm having trouble connecting right now. Please try again in a moment.";
      onDelta?.(fallback);
      return fallback;
    }

    try {
      let history = conversationHistory || (await loadConversationHistory());
      const userContext = await loadUserContext();
      const intent = this.analyzeUserIntent(message);
      const updatedContext = await updateUserContext(
        userContext,
        intent,
        healthData,
      );

      const newMessage: HealthChatMessage = {
        id: `${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
        metadata: {
          healthDataSnapshot: healthData
            ? {
                healthScore: healthData.healthScore?.overall,
                biomarkerCount: healthData.biomarkers?.length || 0,
                lastUpdate: new Date(),
              }
            : undefined,
          userIntent: intent,
          topics: this.extractTopics(message),
        },
      };
      history.push(newMessage);

      let mergedHealthData = healthData ? { ...healthData } : ({} as any);
      try {
        const snap = await loadUserSnapshot();
        if (snap) {
          if (!mergedHealthData.profile && snap.profile)
            mergedHealthData.profile = snap.profile;
          if (
            (!mergedHealthData.biomarkers ||
              mergedHealthData.biomarkers.length === 0) &&
            snap.biomarkers
          )
            mergedHealthData.biomarkers = snap.biomarkers;
          if (!mergedHealthData.healthScore && snap.healthScore)
            mergedHealthData.healthScore = snap.healthScore;
          if (
            (!mergedHealthData.deviceData ||
              mergedHealthData.deviceData.length === 0) &&
            snap.deviceData
          )
            mergedHealthData.deviceData = snap.deviceData;
          if (!mergedHealthData.settings && snap.settings)
            mergedHealthData.settings = snap.settings;
          if (!mergedHealthData.labResults && snap.labResults)
            mergedHealthData.labResults = snap.labResults;
          if (!mergedHealthData.bodySystems && snap.profile?.bodySystems)
            mergedHealthData.bodySystems = snap.profile.bodySystems;
        } else if (!mergedHealthData.settings) {
          const s = await loadSettingsSnapshot();
          if (s) mergedHealthData.settings = s;
        }
      } catch {
        /* graceful degradation */
      }

      const systemPrompt = buildSystemPrompt(
        updatedContext,
        mergedHealthData,
        intent,
      );
      const isDirect =
        intent === "direct_question" || intent === "medication_info";
      const historyForModel = isDirect
        ? history.slice(-2)
        : history.slice(-this.MAX_CONTEXT_MESSAGES);

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...historyForModel.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      const payload = {
        model: "gpt-4o",
        messages,
        temperature: isDirect ? 0.25 : 0.7,
        max_tokens: 800,
        stream: true,
      };

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const reader = (response as any).body?.getReader?.();
      if (!reader) {
        const nonStreamPayload = { ...payload, stream: false } as any;
        const nonStreamRes = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify(nonStreamPayload),
        });
        if (!nonStreamRes.ok) {
          throw new Error(`OpenAI API error: ${nonStreamRes.status}`);
        }
        const data = await nonStreamRes.json();
        const aiRaw = data.choices?.[0]?.message?.content || "";
        const finalText = this.stripEmojis(
          aiRaw || "I'm sorry, I couldn't generate a response.",
        );
        onDelta?.(finalText);
        const aiMessage: HealthChatMessage = {
          id: `${Date.now()}-ai`,
          role: "assistant",
          content: finalText,
          timestamp: new Date(),
          metadata: { topics: this.extractTopics(finalText) },
        };
        history.push(aiMessage);
        const { history: trimmedHistory, context: finalContext } =
          await trimHistoryWithSummary(history, updatedContext);
        await saveConversationHistory(trimmedHistory);
        await saveUserContext(finalContext);
        return finalText;
      }

      const decoder = new TextDecoder("utf-8");
      let accumulated = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const streamPayload = trimmed.replace(/^data:\s*/i, "");
          if (streamPayload === "[DONE]") {
            done = true;
            break;
          }
          try {
            const obj = JSON.parse(streamPayload);
            const delta = obj?.choices?.[0]?.delta?.content || "";
            if (delta) {
              accumulated += delta;
              onDelta?.(this.stripEmojis(accumulated));
            }
          } catch {
            /* graceful degradation */
          }
        }
      }

      const finalText = this.stripEmojis(
        accumulated || "I'm sorry, I couldn't generate a response.",
      );
      const aiMessage: HealthChatMessage = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: finalText,
        timestamp: new Date(),
        metadata: { topics: this.extractTopics(finalText) },
      };
      history.push(aiMessage);
      const { history: trimmedHistory, context: finalContext } =
        await trimHistoryWithSummary(history, updatedContext);
      await saveConversationHistory(trimmedHistory);
      await saveUserContext(finalContext);
      return finalText;
    } catch (error) {
      console.error("Health Assistant Streaming Error:", error);
      const fallback =
        "I'm having trouble connecting right now. Please try again in a moment.";
      onDelta?.(fallback);
      return fallback;
    }
  }

  // ---------------------------------------------------------------------------
  // Health insights & daily recommendations (delegated to healthAssistantInsights)
  // ---------------------------------------------------------------------------

  static async generateHealthInsights(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null,
    _recentInsights?: DailyInsight[],
  ): Promise<HealthAssistantResponse> {
    return _generateHealthInsights(
      OPENAI_API_KEY,
      profile,
      biomarkers,
      healthScore,
    );
  }

  static async generateDailyRecommendations(
    profile: UserProfile | null,
    biomarkers: Biomarker[],
    healthScore: HealthScore | null,
    _currentDate: Date = new Date(),
  ): Promise<DailyInsight[]> {
    return _generateDailyRecommendations(
      OPENAI_API_KEY,
      profile,
      biomarkers,
      healthScore,
    );
  }
}
