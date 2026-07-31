import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileTabParamList } from "@shared/types";
import { useSettings } from "@shared/context/SettingsContext";
import CategorySection from "./components/CategorySection";
import { BiomarkerInfo } from "./components/BiomarkerItem";

type BiomarkerVisibilityScreenNavigationProp =
  StackNavigationProp<ProfileTabParamList>;

const biomarkerCategories: Record<string, BiomarkerInfo[]> = {
  "Metabolic Health": [
    {
      id: "glucose",
      name: "Glucose",
      category: "Metabolic Health",
      description: "Blood sugar levels",
      icon: "water-outline",
      isCore: true,
    },
    {
      id: "homa_ir",
      name: "HOMA-IR",
      category: "Metabolic Health",
      description: "Insulin resistance index",
      icon: "analytics-outline",
      isCore: true,
    },
    {
      id: "hemoglobin_a1c",
      name: "Hemoglobin A1C",
      category: "Metabolic Health",
      description: "Average blood sugar over 3 months",
      icon: "time-outline",
    },
    {
      id: "insulin",
      name: "Insulin",
      category: "Metabolic Health",
      description: "Hormone that regulates blood sugar",
      icon: "medical-outline",
    },
  ],
  Cardiovascular: [
    {
      id: "cholesterol",
      name: "Total Cholesterol",
      category: "Cardiovascular",
      description: "Overall cholesterol levels",
      icon: "heart-circle-outline",
      isCore: true,
    },
    {
      id: "ldl",
      name: "LDL Cholesterol",
      category: "Cardiovascular",
      description: "Low-density lipoprotein (bad cholesterol)",
      icon: "trending-down-outline",
      isCore: true,
    },
    {
      id: "hdl",
      name: "HDL Cholesterol",
      category: "Cardiovascular",
      description: "High-density lipoprotein (good cholesterol)",
      icon: "trending-up-outline",
      isCore: true,
    },
    {
      id: "triglycerides",
      name: "Triglycerides",
      category: "Cardiovascular",
      description: "Blood fats that affect heart health",
      icon: "pulse-outline",
    },
    {
      id: "hs_crp",
      name: "hs-CRP",
      category: "Cardiovascular",
      description: "C-reactive protein (inflammation marker)",
      icon: "flame-outline",
      isCore: true,
    },
    {
      id: "resting_hr",
      name: "Resting Heart Rate",
      category: "Cardiovascular",
      description: "Heart rate at rest",
      icon: "heart-outline",
      isCore: true,
    },
  ],
  "Liver Function": [
    {
      id: "alt",
      name: "ALT",
      category: "Liver Function",
      description: "Alanine aminotransferase",
      icon: "leaf-outline",
      isCore: true,
    },
    {
      id: "ast",
      name: "AST",
      category: "Liver Function",
      description: "Aspartate aminotransferase",
      icon: "leaf-outline",
    },
    {
      id: "bilirubin",
      name: "Bilirubin",
      category: "Liver Function",
      description: "Waste product processed by liver",
      icon: "color-palette-outline",
    },
    {
      id: "albumin",
      name: "Albumin",
      category: "Liver Function",
      description: "Protein made by the liver",
      icon: "body-outline",
    },
  ],
  "Kidney Function": [
    {
      id: "creatinine",
      name: "Creatinine",
      category: "Kidney Function",
      description: "Waste product filtered by kidneys",
      icon: "fitness-outline",
      isCore: true,
    },
    {
      id: "bun",
      name: "BUN",
      category: "Kidney Function",
      description: "Blood urea nitrogen",
      icon: "water-outline",
    },
    {
      id: "egfr",
      name: "eGFR",
      category: "Kidney Function",
      description: "Estimated glomerular filtration rate",
      icon: "speedometer-outline",
    },
  ],
  Hormones: [
    {
      id: "tsh",
      name: "TSH",
      category: "Hormones",
      description: "Thyroid stimulating hormone",
      icon: "cellular-outline",
      isCore: true,
    },
    {
      id: "free_t3",
      name: "Free T3",
      category: "Hormones",
      description: "Active thyroid hormone",
      icon: "flash-outline",
      isCore: true,
    },
    {
      id: "free_t4",
      name: "Free T4",
      category: "Hormones",
      description: "Thyroid hormone precursor",
      icon: "battery-charging-outline",
    },
    {
      id: "testosterone",
      name: "Testosterone",
      category: "Hormones",
      description: "Primary male sex hormone",
      icon: "fitness-outline",
    },
    {
      id: "cortisol",
      name: "Cortisol",
      category: "Hormones",
      description: "Stress hormone",
      icon: "alert-circle-outline",
    },
  ],
  "Vitamins & Minerals": [
    {
      id: "vitamin_d",
      name: "Vitamin D",
      category: "Vitamins & Minerals",
      description: "Essential for bone health and immunity",
      icon: "sunny-outline",
      isCore: true,
    },
    {
      id: "vitamin_b12",
      name: "Vitamin B12",
      category: "Vitamins & Minerals",
      description: "Important for nerve function",
      icon: "nutrition-outline",
    },
    {
      id: "folate",
      name: "Folate",
      category: "Vitamins & Minerals",
      description: "B vitamin essential for cell division",
      icon: "leaf-outline",
    },
    {
      id: "iron",
      name: "Iron",
      category: "Vitamins & Minerals",
      description: "Mineral essential for oxygen transport",
      icon: "magnet-outline",
    },
    {
      id: "ferritin",
      name: "Ferritin",
      category: "Vitamins & Minerals",
      description: "Iron storage protein",
      icon: "archive-outline",
    },
  ],
  "Blood Count": [
    {
      id: "wbc",
      name: "White Blood Cells",
      category: "Blood Count",
      description: "Immune system cells",
      icon: "shield-outline",
    },
    {
      id: "rbc",
      name: "Red Blood Cells",
      category: "Blood Count",
      description: "Oxygen-carrying cells",
      icon: "ellipse-outline",
    },
    {
      id: "platelets",
      name: "Platelets",
      category: "Blood Count",
      description: "Blood clotting cells",
      icon: "bandage-outline",
    },
    {
      id: "hemoglobin",
      name: "Hemoglobin",
      category: "Blood Count",
      description: "Oxygen-carrying protein",
      icon: "pulse-outline",
    },
  ],
};

const BiomarkerVisibilityScreen: React.FC = () => {
  const navigation = useNavigation<BiomarkerVisibilityScreenNavigationProp>();
  const { settings, updateBiomarkerSettings } = useSettings();
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);

  const handleToggleBiomarker = (biomarkerId: string, isVisible: boolean) => {
    updateBiomarkerSettings({
      visibility: {
        ...settings.biomarkers.visibility,
        [biomarkerId]: isVisible,
      },
    });
  };

  const handleToggleCategory = (category: string, isVisible: boolean) => {
    const newVisibility = { ...settings.biomarkers.visibility };
    biomarkerCategories[category].forEach((b) => {
      newVisibility[b.id] = isVisible;
    });
    updateBiomarkerSettings({ visibility: newVisibility });
  };

  const handleShowAllCore = () => {
    const newVisibility = { ...settings.biomarkers.visibility };
    Object.values(biomarkerCategories)
      .flat()
      .forEach((b) => {
        if (b.isCore) newVisibility[b.id] = true;
      });
    updateBiomarkerSettings({ visibility: newVisibility });
    Alert.alert(
      "Core Biomarkers Enabled",
      "All essential biomarkers have been enabled for comprehensive health tracking.",
    );
  };

  const handleHideAll = () => {
    Alert.alert(
      "Hide All Biomarkers",
      "This will hide all biomarkers from your dashboard. You can re-enable them individually.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Hide All",
          style: "destructive",
          onPress: () => {
            const newVisibility: Record<string, boolean> = {};
            Object.values(biomarkerCategories)
              .flat()
              .forEach((b) => {
                newVisibility[b.id] = false;
              });
            updateBiomarkerSettings({ visibility: newVisibility });
          },
        },
      ],
    );
  };

  const getTotalVisibleBiomarkers = () =>
    Object.values(biomarkerCategories)
      .flat()
      .filter((b) => settings.biomarkers.visibility[b.id] !== false).length;

  const getVisibleCount = (category: string) =>
    biomarkerCategories[category].filter(
      (b) => settings.biomarkers.visibility[b.id] !== false,
    ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biomarker Visibility</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {getTotalVisibleBiomarkers()} biomarkers visible
        </Text>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleShowAllCore}
          >
            <Ionicons name="star-outline" size={16} color="#3AABF0" />
            <Text style={styles.controlButtonText}>Show Core</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleHideAll}
          >
            <Ionicons name="eye-off-outline" size={16} color="#FF3B30" />
            <Text style={[styles.controlButtonText, { color: "#FF3B30" }]}>
              Hide All
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Show only visible biomarkers</Text>
          <Switch
            value={showOnlyVisible}
            onValueChange={setShowOnlyVisible}
            trackColor={{ false: "#E5E5EA", true: "#30D158" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {Object.keys(biomarkerCategories).map((category) => (
          <CategorySection
            key={category}
            category={category}
            biomarkers={biomarkerCategories[category]}
            visibleCount={getVisibleCount(category)}
            showOnlyVisible={showOnlyVisible}
            visibility={settings.biomarkers.visibility}
            onToggleBiomarker={handleToggleBiomarker}
            onToggleCategory={handleToggleCategory}
          />
        ))}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#000000" },
  headerRight: { width: 40 },
  statsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  statsText: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 12,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    gap: 4,
  },
  controlButtonText: { fontSize: 14, color: "#3AABF0", fontWeight: "500" },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterLabel: { fontSize: 15, color: "#000000" },
  scrollView: { flex: 1 },
  bottomSpacing: { height: 50 },
});

export default BiomarkerVisibilityScreen;
