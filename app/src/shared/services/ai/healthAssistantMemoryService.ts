import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Biomarker } from '../../types';
import type { UserSettings } from '../../types/settings';
import type { HealthChatMessage, UserHealthContext } from './healthAssistantService';
import { OPENAI_API_KEY } from './healthAssistantService';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const CONVERSATION_HISTORY_KEY = 'healthAssistant_conversationHistory';
const USER_CONTEXT_KEY = 'healthAssistant_userContext';
const CHAT_SESSIONS_KEY = 'healthAssistant_chatSessions';
const SETTINGS_SNAPSHOT_KEY = 'healthAssistant_latestSettingsSnapshot';

const TRIM_THRESHOLD = 60;
const TRIM_KEEP_RECENT = 24;

// ---------------------------------------------------------------------------
// Conversation history
// ---------------------------------------------------------------------------

/**
 * Load full conversation history from AsyncStorage
 */
export async function loadConversationHistory(): Promise<HealthChatMessage[]> {
  try {
    const stored = await AsyncStorage.getItem(CONVERSATION_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
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
 * Save conversation history to AsyncStorage
 */
export async function saveConversationHistory(history: HealthChatMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save conversation history:', error);
  }
}

// ---------------------------------------------------------------------------
// User context
// ---------------------------------------------------------------------------

/**
 * Load user health context and preferences
 */
export async function loadUserContext(): Promise<UserHealthContext | null> {
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
 * Save user health context
 */
export async function saveUserContext(context: UserHealthContext): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Failed to save user context:', error);
  }
}

// ---------------------------------------------------------------------------
// Settings snapshot
// ---------------------------------------------------------------------------

/**
 * Persist the latest settings so the assistant can use them immediately across screens.
 */
export async function syncSettingsSnapshot(settings: UserSettings): Promise<void> {
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
export async function loadSettingsSnapshot(): Promise<UserSettings | null> {
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

// ---------------------------------------------------------------------------
// Clear memory
// ---------------------------------------------------------------------------

/**
 * Clear/reset conversation memory
 */
export async function clearConversationMemory(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([CONVERSATION_HISTORY_KEY, USER_CONTEXT_KEY, CHAT_SESSIONS_KEY]);
  } catch (error) {
    console.error('Failed to clear conversation memory:', error);
  }
}

// ---------------------------------------------------------------------------
// Context update helpers
// ---------------------------------------------------------------------------

function assessBiomarkerSignificance(biomarker: Biomarker): 'normal' | 'concerning' | 'critical' {
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
 * Update user context based on conversation
 */
export async function updateUserContext(
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

  context.conversationCount += 1;
  context.lastConversationDate = now;

  if (intent && !context.preferredTopics.includes(intent)) {
    context.preferredTopics.push(intent);
    if (context.preferredTopics.length > 10) {
      context.preferredTopics = context.preferredTopics.slice(-10);
    }
  }

  if (healthData?.biomarkers) {
    healthData.biomarkers.forEach((biomarker: Biomarker) => {
      context.biomarkerTrends[biomarker.name] = {
        trend: 'stable',
        significance: assessBiomarkerSignificance(biomarker),
        lastValue: biomarker.value,
        changePercent: 0,
        lastDiscussed: now
      };
    });
  }

  context.lastDataUpdate = now;
  return context;
}

// ---------------------------------------------------------------------------
// Summarization & trim
// ---------------------------------------------------------------------------

function stripEmojis(input: string): string {
  try {
    return input
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .replace(/[\u200D\uFE0F]/g, '');
  } catch {
    return input;
  }
}

/**
 * Summarize older conversation to preserve context while limiting token usage
 */
export async function summarizeConversation(
  messages: HealthChatMessage[]
): Promise<{ summary: string; topics: string[] }> {
  try {
    const transcript = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

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
            content:
              'You are a concise summarizer for a health assistant chat. Produce a short summary (80-150 words) capturing user goals, preferences, notable biomarker/health mentions, and any commitments or follow-ups. Also list 3-7 key topics as a comma-separated list.'
          },
          { role: 'user', content: transcript.slice(0, 12000) }
        ],
        temperature: 0.2,
        max_tokens: 350,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI summarize error: ${response.status}`);
    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content || '';
    const lines = content.split('\n').map((l: string) => l.trim()).filter(Boolean);
    let summary = content;
    let topics: string[] = [];
    const topicsLine = lines.find((l: string) => /^topics\s*:/i.test(l));
    if (topicsLine) {
      summary = lines.filter((l: string) => l !== topicsLine).join('\n');
      const list = topicsLine.split(':')[1] || '';
      topics = list.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return { summary: stripEmojis(summary), topics };
  } catch (e) {
    console.warn('Summarization failed, skipping:', e);
    return { summary: '', topics: [] };
  }
}

/**
 * Trim long histories and persist a summary into user context.
 */
export async function trimHistoryWithSummary(
  history: HealthChatMessage[],
  context: UserHealthContext
): Promise<{ history: HealthChatMessage[]; context: UserHealthContext }> {
  try {
    if (history.length <= TRIM_THRESHOLD) {
      return { history, context };
    }

    const cutoff = history.length - TRIM_KEEP_RECENT;
    const older = history.slice(0, Math.max(0, cutoff));
    const recent = history.slice(-TRIM_KEEP_RECENT);

    const { summary, topics } = await summarizeConversation(older);
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
