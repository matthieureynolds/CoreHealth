import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { RootStackParamList } from '../../../shared/types';
import { deriveDashboardScores } from '../score/utils';
import { LabResult } from '../recent-lab-results/results/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;
import BiomarkerModal, {
  BiomarkerInfo,
} from '../../../shared/components/modals/BiomarkerModal';
import { getBiomarkerInfo } from '../../../shared/data/biomarkerDatabase';
import HealthChatModal from '../travel-health/nearby-medical/HealthChatModal';
import LabResultDetailModal from '../recent-lab-results/LabResultDetailModal';
import TwitterLoadingIndicator from '../../../shared/components/feedback/TwitterLoadingIndicator';
import QuickSymptomLogModal from '../../../shared/components/modals/QuickSymptomLogModal';

import HeroHealthScore from '../score/HeroHealthScore';
import SupportingRings from '../health-metrics/rings/SupportingRings';
import LabInsightsCard from '../recent-lab-results/LabInsightsCard';
import TravelHealthSummary from '../travel-health/TravelHealthSummary';
import MedicalTimeline from '../medical-timeline/MedicalTimeline';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const {
    healthScore,
    dailyInsights,
    biomarkers,
    travelHealth,
    generateDailyInsights,
    getUpcomingJetLagEvents,
    getCurrentLocation,
    updateTravelHealthData
  } = useHealthData();
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLabResult, setSelectedLabResult] = useState<LabResult | null>(null);
  const [labResultModalVisible, setLabResultModalVisible] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<number>(0);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastLocationUpdate;
        const shouldRefreshLocation = !travelHealth?.location || timeSinceLastUpdate > 300000;

        if (shouldRefreshLocation) {
          const locationData = await getCurrentLocation();
          if (locationData) {
            await updateTravelHealthData(locationData);
            setLastLocationUpdate(now);
          }
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    initializeLocation();
  }, [travelHealth?.location, getCurrentLocation, updateTravelHealthData, lastLocationUpdate]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData) {
        await updateTravelHealthData(locationData);
        setLastLocationUpdate(Date.now());
      }
      await generateDailyInsights();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y < -100 && !isRefreshing) {
      handleRefresh();
    }
  };

  const handleBiomarkerPress = (biomarkerName: string, value: number) => {
    const getStatus = (
      name: string,
      val: number,
    ): 'normal' | 'low' | 'high' | 'critical' => {
      const normalRanges: { [key: string]: { min: number; max: number } } = {
        'Heart Rate Variability': { min: 30, max: 60 },
        'Resting Heart Rate': { min: 50, max: 100 },
        'Blood Glucose': { min: 70, max: 99 },
        Creatinine: { min: 0.6, max: 1.2 },
        ALT: { min: 7, max: 56 },
        AST: { min: 10, max: 40 },
      };

      const range = normalRanges[name];
      if (!range) return 'normal';
      if (val < range.min) return 'low';
      if (val > range.max) return 'high';
      return 'normal';
    };

    const status = getStatus(biomarkerName, value);
    const biomarkerInfo = getBiomarkerInfo(biomarkerName, value, status);

    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setModalVisible(true);
    }
  };

  const handleRingPress = (_ringId: string) => {};

  const handleLabResultPress = (labResult: LabResult) => {
    setSelectedLabResult(labResult);
    setLabResultModalVisible(true);
  };

  const handleTravelPress = () => {};

  const handleMedicalEventPress = (_event: unknown) => {};

  const handleJetLagEventPress = (_event: unknown) => {};

  const {
    overallHealthScore,
    finalRecoveryScore,
    finalBiomarkersScore,
    finalLifestyleScore,
  } = deriveDashboardScores(healthScore);

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
            {`Good ${getTimeOfDay()}, ${user?.firstName || user?.preferredName || ''}`}
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
        <View style={styles.firstComponent}>
          <HeroHealthScore
            score={overallHealthScore}
            onPress={() => navigation.navigate('HealthScoreDetail')}
          />
        </View>

        <SupportingRings
          recovery={finalRecoveryScore}
          biomarkers={finalBiomarkersScore}
          lifestyle={finalLifestyleScore}
          onRingPress={handleRingPress}
        />

        <LabInsightsCard
          onViewAllPress={() => {}}
          onLabResultPress={handleLabResultPress}
        />

        <TravelHealthSummary
          currentLocation={travelHealth?.location || 'Getting location...'}
          jetLagHours={0}
          onTravelPress={handleTravelPress}
          jetLagPlanningEvents={getUpcomingJetLagEvents()}
          onJetLagEventPress={handleJetLagEventPress}
          nearestHospital={travelHealth?.nearestHospital}
          nearestPharmacy={travelHealth?.nearestPharmacy}
          nearestHospitalData={travelHealth?.nearestHospitalData}
          nearestPharmacyData={travelHealth?.nearestPharmacyData}
          travelHealth={travelHealth}
        />

        <MedicalTimeline
          onEventPress={handleMedicalEventPress}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BiomarkerModal
        visible={modalVisible}
        biomarker={selectedBiomarker}
        onClose={() => {
          setModalVisible(false);
          setSelectedBiomarker(null);
        }}
      />

      <HealthChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
      />

      <LabResultDetailModal
        visible={labResultModalVisible}
        labResult={selectedLabResult}
        onClose={() => {
          setLabResultModalVisible(false);
          setSelectedLabResult(null);
        }}
      />

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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 2,
    backgroundColor: '#000000',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3AABF0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3AABF0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bottomSpacing: {
    height: 40,
  },
  firstComponent: {
    marginTop: 20,
  },
});

export default DashboardScreen;
