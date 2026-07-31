import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { SessionItem } from "../../components/SessionItem";
import { AshParticles } from "../../components/AshParticles";
import type { ChatSession } from "@shared/services/ai/healthAssistantService";

interface ChatHistoryDrawerProps {
  visible: boolean;
  chatSessions: ChatSession[];
  historyLoading: boolean;
  historyError: string | null;
  onClose: () => void;
  onLoadSession: (session: ChatSession) => void;
  onSessionDeleted: (id: string) => void;
  onRetry: () => void;
  onNewChat: () => void;
  styles: typeof import("../HealthAssistantScreen.styles").styles;
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  visible,
  chatSessions,
  historyLoading,
  historyError,
  onClose,
  onLoadSession,
  onSessionDeleted,
  onRetry,
  onNewChat,
  styles,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [ashY, setAshY] = useState<number | null>(null);
  const drawerRef = useRef<View>(null);
  const [drawerPageY, setDrawerPageY] = useState(0);

  const sortedSessions = useMemo(
    () =>
      (chatSessions || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime(),
        ),
    [chatSessions],
  );

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sortedSessions;
    const q = searchQuery.toLowerCase();
    return sortedSessions.filter((s) => s.title?.toLowerCase().includes(q));
  }, [sortedSessions, searchQuery]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            ref={drawerRef}
            onLayout={() => {
              drawerRef.current?.measureInWindow((_x, y) => setDrawerPageY(y));
            }}
            style={[styles.chatDrawer, { overflow: "visible" }]}
          >
            {/* Header: Toto + X */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingBottom: 20,
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}
              >
                Toto
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* New chat button */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onNewChat();
              }}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#1C1C1E",
                marginHorizontal: 16,
                borderRadius: 28,
                paddingVertical: 14,
                paddingHorizontal: 18,
                marginBottom: 8,
              }}
            >
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: 12 }}
              >
                <Path
                  d="M 17.5 3.5 A 9.5 9.5 0 1 0 20.5 6.5"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M10 14 L16 8"
                  stroke="#fff"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
                <Path
                  d="M10 14 L8.5 15.5"
                  stroke="#fff"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "500" }}
              >
                New chat
              </Text>
            </TouchableOpacity>

            {/* Search chats — inline input replaces label on tap */}
            <TouchableOpacity
              onPress={() => setShowSearch(true)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 34,
                paddingVertical: 14,
              }}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color="#8E8E93"
                style={{ marginRight: 12 }}
              />
              {showSearch ? (
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search chats"
                  placeholderTextColor="#666"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) setShowSearch(false);
                  }}
                  style={{
                    flex: 1,
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "500",
                    paddingVertical: 0,
                  }}
                />
              ) : (
                <Text
                  style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "500" }}
                >
                  Search chats
                </Text>
              )}
            </TouchableOpacity>

            {/* Recent label */}
            <Text
              style={{
                color: "#8E8E93",
                fontSize: 13,
                fontWeight: "600",
                paddingHorizontal: 20,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Recent
            </Text>

            {/* Sessions list */}
            <View style={{ flex: 1, overflow: "visible" }}>
              {historyLoading && (
                <View style={styles.centeredFill}>
                  <ActivityIndicator size="small" color="#3AABF0" />
                  <Text style={styles.mutedText}>Loading chats...</Text>
                </View>
              )}
              {!historyLoading && historyError && (
                <View style={styles.centeredFill}>
                  <Text style={{ color: "#FF453A" }}>{historyError}</Text>
                  <TouchableOpacity
                    onPress={onRetry}
                    style={styles.retryButton}
                  >
                    <Text style={{ color: "#FFFFFF" }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!historyLoading &&
                !historyError &&
                (filteredSessions.length > 0 ? (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ overflow: "visible" }}
                    contentContainerStyle={{ overflow: "visible" }}
                  >
                    {filteredSessions.map((session) => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        onPress={onLoadSession}
                        onDeleted={(id) => {
                          setAshY(null);
                          onSessionDeleted(id);
                        }}
                        onAshStart={(pageY) => setAshY(pageY - drawerPageY)}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.centeredFill}>
                    <Text style={styles.mutedText}>
                      {searchQuery
                        ? "No matches found."
                        : "No previous chats yet."}
                    </Text>
                  </View>
                ))}
            </View>

            {/* Ash particles — rendered at drawer root so they fly across full screen */}
            {ashY !== null && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: ashY,
                  left: "50%",
                  width: 0,
                  height: 0,
                  overflow: "visible",
                  zIndex: 9999,
                }}
              >
                <AshParticles visible onComplete={() => setAshY(null)} />
              </View>
            )}
          </View>

          {/* Tap outside to close */}
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "25%",
              height: "100%",
            }}
            onPress={onClose}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChatHistoryDrawer;
