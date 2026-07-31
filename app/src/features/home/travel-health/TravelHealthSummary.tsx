import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TravelHealth } from "@shared/types/travel";
import { JetLagPlanningEvent } from "@shared/types/jetlag";
import { useSettings } from "@shared/context/SettingsContext";
import { metersToDisplay } from "@shared/utils/units";
import EnvironmentalMetricCard, {
  EnvironmentalMetric,
} from "./components/EnvironmentalMetricCard";
import MetricDetailModal from "./components/MetricDetailModal";
import JetLagBanner from "./components/JetLagBanner";
import NearbyFacilitiesSection from "./components/NearbyFacilitiesSection";

interface TravelHealthSummaryProps {
  currentLocation?: string;
  jetLagHours?: number;
  jetLagPlanningEvents?: JetLagPlanningEvent[];
  onJetLagEventPress?: (event: JetLagPlanningEvent) => void;
  nearestHospital?: string;
  nearestPharmacy?: string;
  nearestHospitalData?: Record<string, unknown> | null;
  nearestPharmacyData?: Record<string, unknown> | null;
  travelHealth?: TravelHealth | null;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "excellent":
      return "#30D158";
    case "good":
      return "#32D74B";
    case "moderate":
      return "#FF9F0A";
    case "poor":
      return "#FF6B35";
    case "hazardous":
      return "#FF3B30";
    default:
      return "#8E8E93";
  }
};

const getStatusFromRiskLevel = (
  riskLevel: string,
): EnvironmentalMetric["status"] => {
  switch (riskLevel) {
    case "low":
      return "excellent";
    case "moderate":
      return "good";
    case "high":
      return "moderate";
    case "severe":
      return "poor";
    default:
      return "moderate";
  }
};

const TravelHealthSummary: React.FC<TravelHealthSummaryProps> = ({
  currentLocation = "New York, NY",
  jetLagHours = 0,
  jetLagPlanningEvents = [],
  onJetLagEventPress,
  nearestHospital,
  nearestPharmacy,
  nearestHospitalData,
  nearestPharmacyData,
  travelHealth,
}) => {
  const { settings } = useSettings();
  const [showMore, setShowMore] = useState(false);
  const [selectedMetric, setSelectedMetric] =
    useState<EnvironmentalMetric | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const units: "metric" | "imperial" =
    settings?.general?.units === "imperial" ? "imperial" : "metric";

  const formatFacilityDistance = (raw: unknown): string => {
    const n =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? parseFloat(raw)
          : NaN;
    if (!Number.isFinite(n) || n < 0)
      return units === "imperial" ? "— mi" : "— km";
    const meters = n >= 100 ? n : n * 1000;
    return metersToDisplay(meters, units);
  };

  const environmentalMetrics: EnvironmentalMetric[] = React.useMemo(() => {
    if (!travelHealth) {
      return [
        {
          id: "air_quality",
          label: "Air Quality",
          value: "Loading...",
          status: "moderate",
          icon: "cloud-outline",
          score: 0,
        },
        {
          id: "pollen",
          label: "Pollen",
          value: "Loading...",
          status: "moderate",
          icon: "flower-outline",
          score: 0,
        },
        {
          id: "water_quality",
          label: "Water Quality",
          value: "Loading...",
          status: "moderate",
          icon: "water-outline",
          score: 0,
        },
      ];
    }

    const metrics: EnvironmentalMetric[] = [];

    if (travelHealth.airQuality) {
      metrics.push({
        id: "air_quality",
        label: "Air Quality",
        value: travelHealth.airQuality.status || "Unknown",
        status: getStatusFromRiskLevel(
          travelHealth.airQuality.riskLevel || "moderate",
        ),
        icon: "cloud-outline",
        score:
          typeof travelHealth.airQuality.value === "number"
            ? travelHealth.airQuality.value
            : 0,
      });
    }

    if (travelHealth.pollenLevels) {
      metrics.push({
        id: "pollen",
        label: "Pollen",
        value: travelHealth.pollenLevels.status || "Unknown",
        status: getStatusFromRiskLevel(
          travelHealth.pollenLevels.riskLevel || "moderate",
        ),
        icon: "flower-outline",
        score:
          typeof travelHealth.pollenLevels.value === "number"
            ? travelHealth.pollenLevels.value
            : 0,
      });
    }

    if (travelHealth.waterSafety) {
      metrics.push({
        id: "water_quality",
        label: "Water Quality",
        value: travelHealth.waterSafety.status || "Unknown",
        status: getStatusFromRiskLevel(
          travelHealth.waterSafety.riskLevel || "moderate",
        ),
        icon: "water-outline",
        score:
          typeof travelHealth.waterSafety.value === "number"
            ? travelHealth.waterSafety.value
            : 0,
      });
    }

    return metrics;
  }, [travelHealth]);

  const closestFacilities = [
    ...(nearestHospital && nearestHospitalData
      ? [
          {
            id: "hospital1",
            name: nearestHospital,
            type: "Hospital",
            distance: formatFacilityDistance(nearestHospitalData.distance),
            travelTime: "8 mins",
          },
        ]
      : []),
    ...(nearestPharmacy && nearestPharmacyData
      ? [
          {
            id: "pharmacy1",
            name: nearestPharmacy,
            type: "Pharmacy",
            distance: formatFacilityDistance(nearestPharmacyData.distance),
            travelTime: "6 mins",
          },
        ]
      : []),
  ];

  return (
    <View style={[styles.container, !showMore && styles.containerCollapsed]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={20} color="#3AABF0" />
          <Text style={styles.title}>Travel Health</Text>
        </View>
        <TouchableOpacity onPress={() => setShowMore(!showMore)}>
          <Text style={styles.moreTabText}>
            {showMore ? "Show Less" : "View All"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.currentLocation}>{currentLocation}</Text>
        <Text style={styles.locationSubtitle}>Current Location</Text>
      </View>

      <View style={styles.metricsContainer}>
        {environmentalMetrics.map((metric) => (
          <EnvironmentalMetricCard
            key={metric.id}
            metric={metric}
            getStatusColor={getStatusColor}
            onPress={(m) => {
              setSelectedMetric(m);
              setModalVisible(true);
            }}
          />
        ))}
      </View>

      <JetLagBanner jetLagHours={jetLagHours} />

      <View style={styles.moreTabContainer}>
        {!showMore && (
          <TouchableOpacity
            onPress={() => setShowMore(true)}
            style={styles.moreTab}
          >
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        )}
        {showMore && (
          <NearbyFacilitiesSection
            closestFacilities={closestFacilities}
            jetLagPlanningEvents={jetLagPlanningEvents}
            onJetLagEventPress={onJetLagEventPress}
            onShowLess={() => setShowMore(false)}
            sectionTitleStyle={styles.sectionTitle}
          />
        )}
      </View>

      <MetricDetailModal
        visible={modalVisible}
        metric={selectedMetric}
        getStatusColor={getStatusColor}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
    paddingBottom: 0,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  containerCollapsed: {
    height: 425,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  locationContainer: {
    marginBottom: 16,
  },
  currentLocation: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
  },
  metricsContainer: {
    marginBottom: 12,
  },
  moreTabContainer: {
    marginTop: -10,
    marginBottom: 34,
  },
  moreTab: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 0,
  },
  moreTabText: {
    color: "#3AABF0",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
});

export default TravelHealthSummary;
