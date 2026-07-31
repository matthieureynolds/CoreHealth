import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useHealthData } from "@shared/context/HealthDataContext";
import { useAuth } from "@shared/context/AuthContext";
import { RootStackParamList } from "@shared/types";
import { deriveDashboardScores } from "../score/utils";
import { LabResult } from "../recent-lab-results/results/types";

type NavigationProp = StackNavigationProp<RootStackParamList>;
import TwitterLoadingIndicator from "@shared/components/feedback/TwitterLoadingIndicator";
import QuickSymptomLogModal from "@shared/components/modals/QuickSymptomLogModal";

import HeroHealthScore from "../score/HeroHealthScore";
import SupportingRings from "../health-metrics/rings/SupportingRings";
import LabInsightsCard from "../recent-lab-results/LabInsightsCard";
import TravelHealthSummary from "../travel-health/TravelHealthSummary";
import MedicalTimeline from "../medical-timeline/MedicalTimeline";
import { DataService } from "@shared/services/data/dataService";

const PULL_TO_REFRESH_THRESHOLD = -100;
const LOCATION_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VISIBLE_ALERTS = 3;

const ALERT_SEVERITY_COLORS: Record<string, string> = {
  critical: "#FF3B30",
  warning: "#FF9500",
};
const ALERT_DEFAULT_COLOR = "#3AABF0";

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const AlertCard: React.FC<{
  alert: {
    id: string;
    type: string;
    severity: string;
    title: string;
    body: string;
  };
  onDismiss: (id: string) => void;
}> = React.memo(({ alert, onDismiss }) => {
  const borderColor =
    ALERT_SEVERITY_COLORS[alert.severity] ?? ALERT_DEFAULT_COLOR;
  return (
    <View style={[styles.alertCard, { borderLeftColor: borderColor }]}>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{alert.title}</Text>
        <Text style={styles.alertBody}>{alert.body}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onDismiss(alert.id)}
        style={styles.alertDismiss}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Ionicons name="close" size={16} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
});

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const {
    healthScore,
    travelHealth,
    generateDailyInsights,
    getUpcomingJetLagEvents,
    getCurrentLocation,
    updateTravelHealthData,
  } = useHealthData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const lastLocationUpdateRef = useRef<number>(0);
  const [healthAlerts, setHealthAlerts] = useState<
    Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      body: string;
    }>
  >([]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      DataService.getAlerts(user.id)
        .then((alerts) => setHealthAlerts(alerts.slice(0, MAX_VISIBLE_ALERTS)))
        .catch(() => {});
    }, [user?.id]),
  );

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const now = Date.now();
        const shouldRefreshLocation =
          !travelHealth?.location ||
          now - lastLocationUpdateRef.current > LOCATION_REFRESH_INTERVAL_MS;

        if (shouldRefreshLocation) {
          const locationData = await getCurrentLocation();
          if (locationData) {
            await updateTravelHealthData(locationData);
            lastLocationUpdateRef.current = now;
          }
        }
      } catch (error) {
        console.error("Error getting current location:", error);
      }
    };

    initializeLocation();
  }, [travelHealth?.location, getCurrentLocation, updateTravelHealthData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData) {
        await updateTravelHealthData(locationData);
        lastLocationUpdateRef.current = Date.now();
      }
      await generateDailyInsights();
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [getCurrentLocation, updateTravelHealthData, generateDailyInsights]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (
        event.nativeEvent.contentOffset.y < PULL_TO_REFRESH_THRESHOLD &&
        !isRefreshing
      ) {
        handleRefresh();
      }
    },
    [isRefreshing, handleRefresh],
  );

  const handleLabResultPress = useCallback(
    (labResult: LabResult) => {
      navigation.navigate("LabResultDetail", { labResult });
    },
    [navigation],
  );

  const handleDismissAlert = useCallback(
    async (alertId: string) => {
      if (!user?.id) return;
      setHealthAlerts((prev) => prev.filter((a) => a.id !== alertId));
      DataService.dismissAlert(user.id, alertId).catch(() => {});
    },
    [user?.id],
  );

  const {
    overallHealthScore,
    finalRecoveryScore,
    finalBiomarkersScore,
    finalLifestyleScore,
  } = useMemo(() => deriveDashboardScores(healthScore), [healthScore]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <TwitterLoadingIndicator
        visible={isRefreshing}
        text="Refreshing your health data..."
      />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {`Good ${getTimeOfDay()}, ${user?.firstName || user?.preferredName || ""}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => setShowSymptomModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        {healthAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {healthAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
              />
            ))}
          </View>
        )}

        <View style={styles.firstComponent}>
          <HeroHealthScore
            score={overallHealthScore}
            onPress={() => navigation.navigate("HealthScoreDetail")}
          />
        </View>

        <SupportingRings
          recovery={finalRecoveryScore}
          biomarkers={finalBiomarkersScore}
          lifestyle={finalLifestyleScore}
        />

        <LabInsightsCard onLabResultPress={handleLabResultPress} />

        <TravelHealthSummary
          currentLocation={travelHealth?.location || "Getting location..."}
          jetLagHours={0}
          jetLagPlanningEvents={getUpcomingJetLagEvents()}
          nearestHospital={travelHealth?.nearestHospital}
          nearestPharmacy={travelHealth?.nearestPharmacy}
          nearestHospitalData={travelHealth?.nearestHospitalData}
          nearestPharmacyData={travelHealth?.nearestPharmacyData}
          travelHealth={travelHealth}
        />

        <MedicalTimeline />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <QuickSymptomLogModal
        visible={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        onSuccess={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 2,
    backgroundColor: "#000000",
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3AABF0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3AABF0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  bottomSpacing: {
    height: 40,
  },
  firstComponent: {
    marginTop: 20,
  },
  alertsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  alertCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 3,
  },
  alertBody: {
    fontSize: 12,
    color: "#A0A0A0",
    lineHeight: 17,
  },
  alertDismiss: {
    marginLeft: 8,
    paddingTop: 2,
  },
});

export default DashboardScreen;
