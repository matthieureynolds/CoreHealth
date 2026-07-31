import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsHeader from "@features/profile/screens/settings/components/SettingsHeader";
import { SETTINGS_SCROLL_PT } from "@features/profile/screens/settings/components/settingsLayout";
import { useAuth } from "@shared/context/AuthContext";
import { DataService } from "@shared/services/data/dataService";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

const HealthDataDownloadScreen: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please sign in to export your data.");
      return;
    }
    try {
      setIsLoading(true);
      const exportData = await DataService.exportUserData(user.id);

      const p = exportData.profile ?? {};
      const counts = {
        biomarkers: exportData.biomarkers?.length ?? 0,
        labResults: exportData.labResults?.length ?? 0,
        allergies: exportData.allergies?.length ?? 0,
        medications: exportData.medications?.length ?? 0,
        conditions: exportData.conditions?.length ?? 0,
        vaccinations: exportData.vaccinations?.length ?? 0,
        appointments: exportData.appointments?.length ?? 0,
        symptoms: exportData.symptoms?.length ?? 0,
        chatMessages: exportData.chatHistory?.length ?? 0,
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>CoreHealth Data Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #3AABF0; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; page-break-inside: avoid; }
            .section-title { font-size: 18px; font-weight: bold; color: #3AABF0; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .info-item { margin-bottom: 8px; padding: 5px 0; }
            .label { font-weight: 600; color: #555; display: inline-block; width: 160px; }
            .value { color: #333; }
            .json-data { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CoreHealth Data Export</h1>
            <p>GDPR Article 20 — Right to Data Portability</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          <div class="section">
            <div class="section-title">Profile</div>
            <div class="info-item"><span class="label">Name:</span><span class="value">${[p.first_name, p.surname].filter(Boolean).join(" ") || "Not provided"}</span></div>
            <div class="info-item"><span class="label">Email:</span><span class="value">${p.email || "Not provided"}</span></div>
            <div class="info-item"><span class="label">Date of Birth:</span><span class="value">${p.date_of_birth || "Not provided"}</span></div>
            <div class="info-item"><span class="label">Gender:</span><span class="value">${p.gender || "Not provided"}</span></div>
            <div class="info-item"><span class="label">Height:</span><span class="value">${p.height_cm ? p.height_cm + " cm" : "Not provided"}</span></div>
            <div class="info-item"><span class="label">Weight:</span><span class="value">${p.weight_kg ? p.weight_kg + " kg" : "Not provided"}</span></div>
            <div class="info-item"><span class="label">Account created:</span><span class="value">${p.created_at ? new Date(p.created_at).toLocaleDateString() : "Not provided"}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Data Summary</div>
            ${Object.entries(counts)
              .map(
                ([k, v]) =>
                  `<div class="info-item"><span class="label">${k}:</span><span class="value">${v} records</span></div>`,
              )
              .join("")}
          </div>
          <div class="section">
            <div class="section-title">Complete Data (JSON)</div>
            <div class="json-data">${JSON.stringify(exportData, null, 2).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          </div>
          <div class="footer">
            <p>This document contains all personal data held by CoreHealth for this account.</p>
            <p>Keep this file secure and private.</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      setPdfUri(uri);
      setShowPdfModal(true);
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        "Export Failed",
        "There was an error generating your health data PDF. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharePdf = async () => {
    if (!pdfUri) return;
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Health Data PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        await Share.share({
          url: pdfUri,
          title: "TOTO Health Data",
          message: "Here is your health data export from TOTO.",
        });
      }
    } catch (error) {
      Alert.alert("Share Failed", "Unable to share the PDF. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <SettingsHeader title="Health Data Download" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>EXPORT YOUR DATA</Text>
            <View style={styles.infoRow}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#5856D6"
                style={styles.cardIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Full Health Data Export</Text>
                <Text style={styles.infoText}>
                  Download a complete PDF export of all your health data
                  including biomarkers, lab results, profile, and settings. Keep
                  this file secure.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.downloadButton,
                isLoading && styles.downloadButtonDisabled,
              ]}
              onPress={handleDownload}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isLoading ? "sync" : "download-outline"}
                size={20}
                color="#fff"
                style={styles.cardIcon}
              />
              <Text style={styles.downloadButtonText}>
                {isLoading ? "Generating PDF..." : "Download Health Data"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>WHAT IS INCLUDED</Text>
            {[
              {
                icon: "person-outline",
                color: "#3AABF0",
                title: "Profile & Personal Info",
              },
              {
                icon: "pulse-outline",
                color: "#34C759",
                title: "Biomarkers & Lab Results",
              },
              {
                icon: "watch-outline",
                color: "#FF9500",
                title: "Device & Activity Data",
              },
              {
                icon: "settings-outline",
                color: "#8E8E93",
                title: "App Settings & Preferences",
              },
            ].map((item) => (
              <View key={item.title} style={styles.infoRow}>
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.color}
                  style={styles.cardIcon}
                />
                <Text style={styles.infoTitle}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {showPdfModal && pdfUri && (
        <View style={styles.modalOverlay}>
          <View style={styles.pdfModal}>
            <View style={styles.pdfModalHeader}>
              <Text style={styles.pdfModalTitle}>Health Data Export</Text>
              <TouchableOpacity
                onPress={() => setShowPdfModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#3AABF0" />
              </TouchableOpacity>
            </View>
            <View style={styles.pdfContent}>
              <Ionicons name="document-text" size={64} color="#3AABF0" />
              <Text style={styles.pdfMessage}>
                Your health data has been exported to a PDF document.
              </Text>
              <Text style={styles.pdfSubMessage}>
                You can now share, save, or print this document.
              </Text>
            </View>
            <View style={styles.pdfActions}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleSharePdf}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>Share PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowPdfModal(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 },
  card: {
    backgroundColor: "#181818",
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardIcon: { marginRight: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  infoText: { fontSize: 12, color: "#8E8E93", lineHeight: 16 },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5856D6",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 14,
    borderRadius: 10,
  },
  downloadButtonDisabled: { opacity: 0.6 },
  downloadButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  pdfModal: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: "90%",
  },
  pdfModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pdfModalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  closeButton: { padding: 8 },
  pdfContent: { alignItems: "center", marginBottom: 24 },
  pdfMessage: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  pdfSubMessage: { fontSize: 14, color: "#8E8E93", textAlign: "center" },
  pdfActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3AABF0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeModalButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3AABF0",
  },
  closeModalButtonText: { color: "#3AABF0", fontSize: 16, fontWeight: "600" },
});

export default HealthDataDownloadScreen;
