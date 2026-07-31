import React, { memo, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useAuth } from "@shared/context/AuthContext";
import { useHealthData } from "@shared/context/HealthDataContext";
import { useSettings } from "@shared/context/SettingsContext";
import {
  formatTimeBySetting,
  formatShortDateBySetting,
} from "@shared/utils/dateFormat";
import type { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const { profile } = useHealthData();
  const { settings } = useSettings();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const formatDateTime = (date: Date) => {
    if (!date || !(date instanceof Date)) return "";
    const datePart = formatShortDateBySetting(
      date,
      settings?.general?.dateFormat || "DD/MM/YYYY",
    );
    const timePart = formatTimeBySetting(
      date,
      settings?.general?.timeFormat === "12h" ? "12h" : "24h",
    );
    return `${timePart} ${datePart}`;
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const photoUri =
    (profile as any)?.photoUri ||
    (profile as any)?.photoURL ||
    (user as any)?.photoURL;

  return (
    <View
      style={[
        styles.messageContainer,
        message.role === "user"
          ? styles.userMessageContainer
          : styles.assistantMessageContainer,
      ]}
    >
      {message.role === "assistant" && (
        <View style={styles.assistantAvatar}>
          <Image
            source={require("../../../../assets/images/brand/turtle.png")}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.role === "user"
            ? styles.userMessageBubble
            : styles.assistantMessageBubble,
        ]}
      >
        {message.imageUri && (
          <Image
            source={{ uri: message.imageUri }}
            style={styles.messageImage}
          />
        )}
        {message.documentUri && (
          <View style={styles.documentPreview}>
            <Ionicons
              name="document"
              size={22}
              color="#3AABF0"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.documentText}>
              {message.documentName || "Document"}
            </Text>
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            message.role === "user"
              ? styles.userMessageText
              : styles.assistantMessageText,
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          {message.role === "user" && (
            <Text style={styles.messageTimeUserOnly}>
              {formatDateTime(message.timestamp)}
            </Text>
          )}
        </View>
      </View>
      {message.role === "user" && (
        <View style={styles.userAvatar}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri as string }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.userAvatarFallback}>
              <Ionicons name="person" size={16} color="#2563EB" />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export const MessageBubbleMemo = memo(MessageBubble);
export default MessageBubble;

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 8,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3AABF020",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#3AABF030",
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB20",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#2563EB30",
  },
  userAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageBubble: {
    backgroundColor: "#0088CC",
    borderBottomRightRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 60,
    alignSelf: "flex-end",
    maxWidth: "75%",
  },
  assistantMessageBubble: {
    backgroundColor: "#2A2A2A",
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 60,
    maxWidth: "75%",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
    textAlign: "left",
  },
  assistantMessageText: {
    color: "#FFFFFF",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  messageTimeUserOnly: {
    fontSize: 12,
    color: "#3A3A3C",
    marginTop: 6,
    textAlign: "right",
    alignSelf: "flex-end",
  },
  messageImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#3AABF0",
    shadowColor: "#3AABF0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  documentPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#222C",
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: "#3AABF0",
  },
  documentText: {
    color: "#3AABF0",
    fontWeight: "700",
    fontSize: 15,
  },
});
