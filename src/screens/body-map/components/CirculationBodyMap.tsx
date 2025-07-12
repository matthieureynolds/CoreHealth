import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Text,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BiomarkerModal, { BiomarkerInfo } from '../../../components/common/BiomarkerModal';
import { getBiomarkerInfo } from '../../../data/biomarkerDatabase';

const getWindowDimensions = () => {
  try {
    return Dimensions.get('window');
  } catch (error) {
    return { width: 375, height: 812 }; // fallback dimensions
  }
};

const { width, height } = getWindowDimensions();

interface CirculationZone {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  biomarkers: string[];
  healthScore: number;
  description: string;
  icon: string;
}

interface CirculationBodyMapProps {
  onPointPress: (pointId: string) => void;
}

const CirculationBodyMap: React.FC<CirculationBodyMapProps> = ({
  onPointPress,
}) => {
  const [selectedZone, setSelectedZone] = useState<CirculationZone | null>(null);
  const [showBiomarkerModal, setShowBiomarkerModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));

  const circulationZones: CirculationZone[] = [
    {
      id: 'heart',
      name: 'Heart',
      position: { x: 50, y: 30 },
      size: { width: 120, height: 100 },
      biomarkers: [
        'Blood Pressure',
        'Resting HR',
        'NT-proBNP',
        'VO₂ max',
        'Total Cholesterol',
        'LDL',
        'HDL',
        'Triglycerides',
      ],
      healthScore: 92,
      description: 'Core cardiac function, rhythm, and cardiovascular fitness',
      icon: 'heart',
    },
    {
      id: 'arteries_vessels_blood',
      name: 'Arteries/Vessels & Blood',
      position: { x: 50, y: 54 },
      size: { width: 140, height: 80 },
      biomarkers: [
        'ApoB',
        'Lp(a)',
        'hs-CRP',
        'Homocysteine',
        'Fibrinogen',
        'D-dimer',
        'Platelet Count',
        'Hemoglobin',
      ],
      healthScore: 88,
      description: 'Vascular health, clotting factors, and blood composition',
      icon: 'pulse',
    },
    {
      id: 'oxygenation',
      name: 'Oxygenation',
      position: { x: 50, y: 22 }, // upper chest
      size: { width: 130, height: 70 },
      biomarkers: [
        'SpO₂',
        'FEV1',
        'FVC',
        'DLCO',
        'Hemoglobin',
        'Carbon Monoxide',
        'Pulmonary Function',
      ],
      healthScore: 95,
      description: 'Blood oxygenation and pulmonary function (not lung tissue)',
      icon: 'airplane',
    },
  ];



  const handleZonePress = (zone: CirculationZone) => {
    setSelectedZone(zone);
    onPointPress(zone.id);
    
    // Show the panel
    Animated.spring(panelAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleBiomarkerPress = (biomarkerName: string) => {
    const biomarkerInfo = getBiomarkerInfo(
      biomarkerName,
      85, // Mock value
      'normal'
    );
    
    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setShowBiomarkerModal(true);
    }
  };

  const handleClosePanel = () => {
    Animated.spring(panelAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setSelectedZone(null);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyOutline}>
        <Image
          source={require('../../../../assets/circulation body.png')}
          style={styles.circulationImage}
          resizeMode="contain"
        />

        {/* Always-visible biomarker dots for each zone */}
        {[
          // Heart (center chest)
          { id: 'heart', x: 50, y: 30 },
          // Arteries/Vessels & Blood (bicep location)
          { id: 'arteries_vessels_blood', x: 23, y: 35 },
          // Oxygenation (upper chest)
          { id: 'oxygenation', x: 50, y: 22 },
        ].map(dot => (
          <TouchableOpacity
            key={dot.id}
            style={[
              styles.zoneDot,
              {
                left: `${dot.x}%`,
                top: `${dot.y}%`,
              },
            ]}
            onPress={() => {
              const zone = circulationZones.find(z => z.id === dot.id);
              if (zone) {
                handleZonePress(zone);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.dotInner} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Info Panel */}
      {selectedZone && (
        <Animated.View
          style={[
            styles.infoPanel,
            {
              transform: [{ translateY: panelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              })}],
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.zoneTitle}>{selectedZone.name}</Text>
            <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.zoneDescription}>{selectedZone.description}</Text>

          <ScrollView
            style={styles.biomarkerScrollView}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.biomarkerList}>
              {selectedZone.biomarkers.map((biomarkerName, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.biomarkerItem}
                  onPress={() => handleBiomarkerPress(biomarkerName)}
                >
                  <Text style={styles.biomarkerName}>{biomarkerName}</Text>
                  <Text style={styles.biomarkerValue}>85 mg/dL</Text>
                  <Text style={styles.biomarkerRange}>(70-100)</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Biomarker Modal */}
      <BiomarkerModal
        visible={showBiomarkerModal}
        biomarker={selectedBiomarker}
        onClose={() => setShowBiomarkerModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 0,
  },
  bodyOutline: {
    width: width * 0.99,
    height: width * 0.99 * 1.5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circulationImage: {
    width: '100%',
    height: '100%',
  },
  zoneDot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    zIndex: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  zoneTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  zoneDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  biomarkerScrollView: {
    flex: 1,
  },
  biomarkerList: {
    gap: 16,
    paddingBottom: 20,
  },
  biomarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  biomarkerName: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  biomarkerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginRight: 8,
  },
  biomarkerRange: {
    fontSize: 14,
    color: '#666',
  },
});

export default CirculationBodyMap;
