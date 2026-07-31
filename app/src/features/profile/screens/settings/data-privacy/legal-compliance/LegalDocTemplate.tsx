import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingsHeader from "../../components/SettingsHeader";
import { SETTINGS_SCROLL_PT } from "../../components/settingsLayout";

interface Props {
  title: string;
  content: string[];
}

const LegalDocTemplate: React.FC<Props> = ({ title, content }) => {
  // Persist effective dates for assistant/offline answers when available
  useEffect(() => {
    (async () => {
      try {
        const line = (content || []).find((p) => /effective\s+date:/i.test(p));
        if (line) {
          const match = line.match(/effective\s+date:\s*(.+)/i);
          const date = match?.[1]?.trim();
          if (date) {
            if (/privacy/i.test(title)) {
              await AsyncStorage.setItem("@legal_privacy_effective_date", date);
            } else if (/terms/i.test(title)) {
              await AsyncStorage.setItem("@legal_tos_effective_date", date);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [title, content]);
  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <SettingsHeader title={title} />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}
      >
        <View style={styles.section}>
          {content.map((p, idx) => (
            <Text key={idx} style={styles.paragraph}>
              {p}
            </Text>
          ))}
        </View>

        {/* Bottom spacing to match the gap between cards */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollView: { flex: 1 },
  section: { marginHorizontal: 20, marginTop: 24 },
  cardHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8E8E93",
    marginBottom: 16,
    letterSpacing: 0.8,
  },
  paragraph: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomSpacing: { height: 20 },
});

export default LegalDocTemplate;
