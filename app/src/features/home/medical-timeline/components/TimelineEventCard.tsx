import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import type { MedicalEvent } from "../types";

interface TimelineEventCardProps {
  event: MedicalEvent;
  formattedTime: string;
  onPress: (event: MedicalEvent) => void;
  onAction: (eventId: string, action: "done" | "ignore") => void;
}

const SwipeActions: React.FC<{
  eventId: string;
  onAction: (id: string, action: "done" | "ignore") => void;
}> = ({ eventId, onAction }) => (
  <View style={styles.swipeActions}>
    <RectButton
      style={[styles.swipeAction, styles.doneAction]}
      onPress={() => onAction(eventId, "done")}
    >
      <Ionicons name="checkmark" size={20} color="#fff" />
      <Text style={styles.swipeActionText}>Done</Text>
    </RectButton>
    <RectButton
      style={[styles.swipeAction, styles.ignoreAction]}
      onPress={() => onAction(eventId, "ignore")}
    >
      <Ionicons name="close" size={20} color="#fff" />
      <Text style={styles.swipeActionText}>Ignore</Text>
    </RectButton>
  </View>
);

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  formattedTime,
  onPress,
  onAction,
}) => (
  <Swipeable
    renderRightActions={() => (
      <SwipeActions eventId={event.id} onAction={onAction} />
    )}
    friction={2}
    rightThreshold={40}
  >
    <View style={styles.eventRow}>
      <TouchableOpacity style={styles.eventCard} onPress={() => onPress(event)}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: event.iconColor + "20" },
          ]}
        >
          <Ionicons name={event.icon} size={20} color={event.iconColor} />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
          <Text style={styles.eventTime}>{formattedTime}</Text>
        </View>
        {event.status === "DUE" && (
          <Text style={styles.dueStatus}>{event.status}</Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  </Swipeable>
);

const styles = StyleSheet.create({
  eventRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 8,
    height: 80,
  },
  eventCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    height: 80,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventSubtitle: { color: "#FFFFFF", fontSize: 14, marginBottom: 2 },
  eventTime: { color: "#8E8E93", fontSize: 12 },
  dueStatus: {
    color: "#FF9500",
    fontWeight: "bold",
    fontSize: 12,
    marginRight: 8,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    height: 80,
    paddingLeft: 8,
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 88,
    height: 80,
    borderRadius: 12,
  },
  doneAction: { backgroundColor: "#34C759" },
  ignoreAction: { backgroundColor: "#FF9500" },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default TimelineEventCard;
