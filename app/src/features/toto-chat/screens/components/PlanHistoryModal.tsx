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

interface PlanHistoryItem {
  id: string;
  created_at: string;
  side?: string;
  region?: string;
  severity?: number;
  completed?: number;
  total?: number;
}

interface PlanHistoryModalProps {
  visible: boolean;
  loading: boolean;
  planHistory: PlanHistoryItem[];
  onClose: () => void;
  styles: typeof import("../HealthAssistantScreen.styles").styles;
}

const PlanHistoryModal: React.FC<PlanHistoryModalProps> = ({
  visible,
  loading,
  planHistory,
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
          <Text style={styles.historyTitle}>Leg Pain History</Text>
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
              {planHistory.length === 0 ? (
                <Text
                  style={[
                    styles.mutedText,
                    { textAlign: "center", marginTop: 16 },
                  ]}
                >
                  No history yet.
                </Text>
              ) : (
                planHistory.map((item) => (
                  <View key={item.id} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyRowTitle}>
                        {item.region || "leg"} • {item.side || "unspecified"}
                      </Text>
                      <Text style={styles.historyRowMeta}>
                        Severity {item.severity ?? "-"} •{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.historyProgress}>
                      {item.completed}/{item.total}
                    </Text>
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

export default PlanHistoryModal;
