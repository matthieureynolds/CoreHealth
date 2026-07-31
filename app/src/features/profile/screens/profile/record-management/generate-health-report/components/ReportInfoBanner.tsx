import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ReportInfoBanner: React.FC = () => (
  <View style={styles.infoSection}>
    <Ionicons name="document-text-outline" size={48} color="#3AABF0" />
    <Text style={styles.infoTitle}>Health Report</Text>
    <Text style={styles.infoSubtitle}>
      Generate a comprehensive PDF report of your health information
    </Text>
  </View>
);

const styles = StyleSheet.create({
  infoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default ReportInfoBanner;
