import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useAuth } from "@shared/context/AuthContext";
import { useHealthData } from "@shared/context/HealthDataContext";
import ReportHeader from "./components/ReportHeader";
import ReportInfoBanner from "./components/ReportInfoBanner";
import SectionSelector from "./components/SectionSelector";
import GenerateButton from "./components/GenerateButton";
import { generateReportHTML } from "./components/generateReportHTML";

const REPORT_SECTIONS = [
  {
    id: "personal_info",
    label: "Personal Information",
    icon: "person-outline",
  },
  {
    id: "medical_conditions",
    label: "Medical Conditions",
    icon: "medical-outline",
  },
  { id: "medications", label: "Medications", icon: "medical-outline" },
  { id: "allergies", label: "Allergies", icon: "warning-outline" },
  { id: "family_history", label: "Family History", icon: "people-outline" },
  {
    id: "vaccinations",
    label: "Vaccinations",
    icon: "shield-checkmark-outline",
  },
  { id: "screenings", label: "Screenings", icon: "search-outline" },
  { id: "medical_records", label: "Medical Records", icon: "folder-outline" },
];

const GenerateHealthReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile } = useHealthData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "personal_info",
    "medical_conditions",
    "medications",
    "allergies",
    "family_history",
    "vaccinations",
    "screenings",
    "medical_records",
  ]);

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const getSectionCount = (sectionId: string): number => {
    switch (sectionId) {
      case "medical_conditions":
        return profile?.medicalHistory?.length || 0;
      case "medications":
        return profile?.medications?.length || 0;
      case "allergies":
        return profile?.allergies?.length || 0;
      case "family_history":
        return profile?.familyHistory?.length || 0;
      case "vaccinations":
        return profile?.vaccinations?.length || 0;
      case "screenings":
        return profile?.screenings?.length || 0;
      case "medical_records":
        return profile?.medicalRecords?.length || 0;
      default:
        return 0;
    }
  };

  const generateReport = async () => {
    if (selectedSections.length === 0) {
      Alert.alert(
        "Error",
        "Please select at least one section to include in the report",
      );
      return;
    }
    setIsGenerating(true);
    try {
      const patientName = user?.displayName || user?.firstName || "User";
      const html = generateReportHTML(patientName, selectedSections, profile);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 612,
        height: 792,
        margins: { left: 36, right: 36, top: 36, bottom: 36 },
      });
      setIsGenerating(false);
      const date = new Date().toISOString().split("T")[0];
      const filename = `TOTO_Report_${patientName.replace(/\s+/g, "_")}_${date}.pdf`;

      Alert.alert(
        "Health Report Generated! 📄",
        "Your comprehensive health report has been created successfully.",
        [
          {
            text: "Save to Device",
            onPress: async () => {
              try {
                if (Platform.OS === "ios") {
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, {
                      mimeType: "application/pdf",
                      dialogTitle: "Save Health Report",
                      UTI: "com.adobe.pdf",
                    });
                  }
                } else {
                  const downloadsDir =
                    (FileSystem as any).documentDirectory + "Downloads/";
                  await FileSystem.makeDirectoryAsync(downloadsDir, {
                    intermediates: true,
                  });
                  const newUri = downloadsDir + filename;
                  await FileSystem.copyAsync({ from: uri, to: newUri });
                  Alert.alert(
                    "Saved!",
                    `Report saved as ${filename} in Downloads folder.`,
                  );
                }
              } catch {
                Alert.alert(
                  "Error",
                  "Could not save the report. Please try sharing instead.",
                );
              }
            },
          },
          {
            text: "Share Report",
            onPress: async () => {
              try {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, {
                    mimeType: "application/pdf",
                    dialogTitle: "Share Health Report",
                    UTI: "com.adobe.pdf",
                  });
                } else {
                  Alert.alert(
                    "Sharing not available",
                    "Sharing is not available on this device",
                  );
                }
              } catch {
                Alert.alert("Error", "Could not share the report");
              }
            },
          },
          {
            text: "View Report",
            onPress: async () => {
              try {
                const { Linking } = require("react-native");
                const canOpen = await Linking.canOpenURL(uri);
                if (canOpen) {
                  await Linking.openURL(uri);
                } else if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, {
                    mimeType: "application/pdf",
                    dialogTitle: "View Health Report",
                    UTI: "com.adobe.pdf",
                  });
                } else {
                  Alert.alert(
                    "Viewing not available",
                    "PDF viewing is not available on this device",
                  );
                }
              } catch {
                Alert.alert("Error", "Could not open the report");
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } catch (error) {
      setIsGenerating(false);
      Alert.alert(
        "Error",
        "Failed to generate the health report. Please try again.",
      );
      console.error("PDF generation error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ReportHeader onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 95 }}
      >
        <View style={styles.content}>
          <ReportInfoBanner />
          <SectionSelector
            reportSections={REPORT_SECTIONS}
            selectedSections={selectedSections}
            onToggle={toggleSection}
            getSectionCount={getSectionCount}
          />
          <GenerateButton
            isGenerating={isGenerating}
            disabled={selectedSections.length === 0}
            onPress={generateReport}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
});

export default GenerateHealthReportScreen;
