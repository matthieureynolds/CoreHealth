import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatSession } from "./healthAssistantService";

const CHAT_SESSIONS_KEY = "healthAssistant_chatSessions";

/**
 * Save a chat session with all its messages
 */
export async function saveChatSession(session: ChatSession): Promise<void> {
  try {
    const existingSessions = await loadAllChatSessions();
    const updatedSessions = existingSessions.filter((s) => s.id !== session.id);
    updatedSessions.push(session);
    await AsyncStorage.setItem(
      CHAT_SESSIONS_KEY,
      JSON.stringify(updatedSessions),
    );
  } catch (error) {
    console.error("Failed to save chat session:", error);
  }
}

/**
 * Load a specific chat session by ID
 */
export async function loadChatSession(
  sessionId: string,
): Promise<ChatSession | null> {
  try {
    const sessions = await loadAllChatSessions();
    return sessions.find((session) => session.id === sessionId) || null;
  } catch (error) {
    console.error("Failed to load chat session:", error);
    return null;
  }
}

/**
 * Load all chat sessions (for history list)
 */
export async function loadAllChatSessions(): Promise<ChatSession[]> {
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
          timestamp: new Date(message.timestamp),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to load chat sessions:", error);
    return [];
  }
}

/**
 * Delete a specific chat session
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    const sessions = await loadAllChatSessions();
    const updatedSessions = sessions.filter(
      (session) => session.id !== sessionId,
    );
    await AsyncStorage.setItem(
      CHAT_SESSIONS_KEY,
      JSON.stringify(updatedSessions),
    );
  } catch (error) {
    console.error("Failed to delete chat session:", error);
  }
}

/**
 * Update chat session title and messages
 */
export async function updateChatSession(
  sessionId: string,
  updates: Partial<ChatSession>,
): Promise<void> {
  try {
    const sessions = await loadAllChatSessions();
    const sessionIndex = sessions.findIndex(
      (session) => session.id === sessionId,
    );
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        lastUpdated: new Date(),
      };
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error("Failed to update chat session:", error);
  }
}
