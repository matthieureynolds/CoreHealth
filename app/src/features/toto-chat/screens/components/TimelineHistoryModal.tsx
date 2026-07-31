import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TimelineHistoryItem {
  id: string;
  occurred_at: string;
  title: string;
  meta?: Record<string, unknown>;
}

interface TimelineHistoryModalProps {
  visible: boolean;
  loading: boolean;
  title: string;
  timelineHistory: TimelineHistoryItem[];
  onClose: () => void;
  styles: typeof import("../HealthAssistantScreen.styles").styles;
}

const TimelineHistoryModal: React.FC<TimelineHistoryModalProps> = ({
  visible,
  loading,
  title,
  timelineHistory,
  onClose,
  styles,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.historyOverlay}>
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.centeredFill}>
              <ActivityIndicator size="small" color="#93C5FD" />
              <Text style={styles.mutedText}>Loading…</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
              {timelineHistory.length === 0 ? (
                <Text
                  style={[
                    styles.mutedText,
                    { textAlign: "center", marginTop: 16 },
                  ]}
                >
                  No history yet.
                </Text>
              ) : (
                timelineHistory.map((item) => (
                  <View key={item.id} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyRowTitle}>{item.title}</Text>
                      <Text style={styles.historyRowMeta}>
                        {new Date(item.occurred_at).toLocaleString()}
                      </Text>
                    </View>
                    {item.meta?.doseMg ? (
                      <Text style={styles.historyProgress}>
                        {String(item.meta.doseMg)} mg
                      </Text>
                    ) : item.meta?.updatedCount ? (
                      <Text style={styles.historyProgress}>
                        {String(item.meta.updatedCount)} upd.
                      </Text>
                    ) : item.meta?.new ? (
                      <Text style={styles.historyProgress}>
                        → {String(item.meta.new).slice(11, 16)}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

export default TimelineHistoryModal;
