import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AppInfoSection,
  WhatsNewSection,
  MissionSection,
  TeamSection,
  TechSection,
  ConnectSection,
  LegalSection,
  AcknowledgmentsSection,
} from "./components/AboutSections";

const AboutScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={64} color="#FF3B30" />
        </View>
        <Text style={styles.appName}>TOTO</Text>
        <Text style={styles.tagline}>Your Personal Health Companion</Text>
        <Text style={styles.version}>Version 1.0.0 (Build 001)</Text>
      </View>

      <AppInfoSection />
      <WhatsNewSection />
      <MissionSection />
      <TeamSection />
      <TechSection />
      <ConnectSection />
      <LegalSection />
      <AcknowledgmentsSection />

      <View style={styles.footer}>
        <Text style={styles.copyright}>© 2024 TOTO. All rights reserved.</Text>
        <Text style={styles.footerText}>
          Made with ❤️ for better health outcomes
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: "#8E8E93",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 35,
  },
  copyright: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  bottomSpacing: {
    height: 50,
  },
});

export default AboutScreen;
