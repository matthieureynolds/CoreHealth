import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Alert,
  StatusBar,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { enrichOrganPanel } from '../utils/organBiomarkers';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import BodyMap from '../organs/components/BodyMap';
import {
  ProcessedDocument,
  ExtractedBiomarker,
} from '../../../shared/services/data/documentProcessor';
import BiomarkerModal, {
  BiomarkerInfo,
} from '../../../shared/components/modals/BiomarkerModal';
import { getBiomarkerInfo } from '../../../shared/data/biomarkerDatabase';
import BodySystemSelector, {
  BodySystemType,
} from '../organs/components/BodySystemSelector';
import SkeletonBodyMap from '../skeleton/components/SkeletonBodyMap';
import CirculationBodyMap from '../circulatory/components/CirculationBodyMap';
import NutritionBodyMap from '../nutrition/components/NutritionBodyMap';
import AddDataModal from '../../../shared/components/modals/AddDataModal';
import { PanelPayload } from '../types';
import BiomarkerResults from './components/BiomarkerResults';
import BiomarkerDetailPanel from './components/BiomarkerDetailPanel';
import { useDocumentHandlers } from './components/useDocumentHandlers';
import styles from './components/BodyMapStyles';

const BodyMapScreen: React.FC = () => {
  const { biomarkers } = useHealthData();
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [selectedOrganData, setSelectedOrganData] = useState<PanelPayload | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));
  const [uploadedDocuments, setUploadedDocuments] = useState<ProcessedDocument[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [extractedBiomarkers, setExtractedBiomarkers] = useState<ExtractedBiomarker[]>([]);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<BodySystemType>('organs');
  const [slideAnim] = useState(new Animated.Value(0));
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [isHeadZoomed, setIsHeadZoomed] = useState(false);

  const systems: BodySystemType[] = ['organs', 'skeleton', 'circulation', 'nutrition'];

  const handleOrganPress = (_organId: string) => {
    // Selection is handled in BodyMap via onOrganSelect
  };

  const { handleCameraPress, handleDocumentPicker } = useDocumentHandlers({
    uploadedDocuments,
    setUploadedDocuments,
    setProcessedDocuments,
    setIsProcessing,
    setProcessingStep,
    setExtractedBiomarkers,
    onOrganPress: handleOrganPress,
  });

  const handleOrganSelect = (organ: PanelPayload) => {
    const enriched = enrichOrganPanel(organ, biomarkers);
    setSelectedOrganData(enriched);
    setSelectedOrgan(organ.id ?? null);
    Animated.spring(panelAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleClosePanel = () => {
    Animated.spring(panelAnim, { toValue: 0, useNativeDriver: true }).start(() => {
      setSelectedOrgan(null);
      setSelectedOrganData(null);
    });
  };

  const handleBiomarkerPress = (name: string, value: number, status?: string) => {
    const biomarkerStatus = status as 'normal' | 'low' | 'high' | 'critical';
    const biomarkerInfo = getBiomarkerInfo(name, value, biomarkerStatus || 'normal');
    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setModalVisible(true);
    }
  };

  const handleSystemChange = (system: BodySystemType) => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
      setSelectedSystem(system);
      setSelectedOrgan(null);
      panelAnim.setValue(0);
    });
  };

  const handleSwipeGesture = (event: { nativeEvent: { state: number; translationX: number } }) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const currentIndex = systems.indexOf(selectedSystem);
      if (translationX > 50 && currentIndex > 0) {
        handleSystemChange(systems[currentIndex - 1]);
      } else if (translationX < -50 && currentIndex < systems.length - 1) {
        handleSystemChange(systems[currentIndex + 1]);
      }
    }
  };

  const handleAddData = (data: { biomarkers?: unknown[] }) => {
    Alert.alert(
      'Data Added Successfully',
      `Successfully added ${data.biomarkers?.length ?? 0} biomarkers from your scan.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Body</Text>
          <Text style={styles.headerSubtitle}>Explore your organs and track your biomarkers</Text>
        </View>
      </View>

      <BodySystemSelector selectedSystem={selectedSystem} onSystemChange={handleSystemChange} />

      <PanGestureHandler onHandlerStateChange={handleSwipeGesture} minDist={10}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!isHeadZoomed}
        >
          <View style={styles.bodyMapContainer}>
            <Animated.View
              style={[
                styles.bodyMapWrapper,
                {
                  opacity: slideAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.3, 1],
                  }),
                },
              ]}
            >
              {selectedSystem === 'organs' && (
                <BodyMap
                  onOrganPress={handleOrganPress}
                  onOrganSelect={handleOrganSelect}
                  onZoomChange={(zoomed) => {
                    setIsHeadZoomed(zoomed);
                    if (zoomed) {
                      scrollRef.current?.scrollTo({ y: 0, animated: true });
                    }
                  }}
                />
              )}
              {selectedSystem === 'skeleton' && (
                <SkeletonBodyMap
                  onPartPress={() => {}}
                  onZoneSelect={handleOrganSelect}
                />
              )}
              {selectedSystem === 'circulation' && (
                <CirculationBodyMap
                  onPointPress={() => {}}
                  onZoneSelect={handleOrganSelect}
                />
              )}
              {selectedSystem === 'nutrition' && (
                <NutritionBodyMap onNutritionItemPress={() => {}} />
              )}
            </Animated.View>
          </View>

          <BiomarkerResults
            extractedBiomarkers={extractedBiomarkers}
            onBiomarkerPress={handleBiomarkerPress}
          />

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </PanGestureHandler>

      {selectedOrganData && (
        <TouchableWithoutFeedback onPress={handleClosePanel}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 999,
                opacity: panelAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <BiomarkerDetailPanel
        selectedOrganData={selectedOrganData}
        panelAnim={panelAnim}
        onClose={handleClosePanel}
        onBiomarkerPress={(info) => {
          setSelectedBiomarker(info);
          setModalVisible(true);
        }}
      />

      <BiomarkerModal
        visible={modalVisible}
        biomarker={selectedBiomarker}
        onClose={() => {
          setModalVisible(false);
          setSelectedBiomarker(null);
        }}
      />

      <AddDataModal
        visible={showAddDataModal}
        onClose={() => setShowAddDataModal(false)}
        onDataAdded={handleAddData}
      />
    </View>
  );
};

export default BodyMapScreen;
