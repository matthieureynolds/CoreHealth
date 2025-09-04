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
  onZoneSelect?: (zone: any) => void;
}

const CirculationBodyMap: React.FC<CirculationBodyMapProps> = ({
  onPointPress,
  onZoneSelect,
}) => {
  const [selectedZone, setSelectedZone] = useState<CirculationZone | null>(null);
  const [showBiomarkerModal, setShowBiomarkerModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));

  const getBiomarkerStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return '#30D158';
      case 'low':
        return '#FF9F0A';
      case 'high':
        return '#FF6B35';
      case 'critical':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

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
    
    // Pass zone data to parent for full-width panel
    if (onZoneSelect) {
      onZoneSelect({
        data: {
          name: zone.name,
          description: zone.description,
          biomarkers: zone.biomarkers.map(name => ({
            name,
            value: 85, // Mock value
            unit: 'mg/dL', // Mock unit
            range: '70-100', // Mock range
            status: 'normal'
          }))
        }
      });
    }
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
          { id: 'heart', x: 52, y: 31 },
          // Arteries/Vessels & Blood (moved much more to the left)
          { id: 'arteries_vessels_blood', x: 31.5, y: 30 },
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
    backgroundColor: 'transparent',
    paddingVertical: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3', // Modern blue
    borderWidth: 1,
    borderColor: '#7FDBFF', // Lighter blue border
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    zIndex: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00BFFF', // Lighter blue for inner dot
    borderWidth: 1,
    borderColor: '#E3F2FD', // Very light blue border
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '70%',
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
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
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  zoneDescription: {
    fontSize: 16,
    color: '#8E8E93',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    minHeight: 48,
  },
  biomarkerColumn1: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  biomarkerColumn2: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 10,
  },
  biomarkerColumn3: {
    flex: 1,
    alignItems: 'flex-end',
  },
  biomarkerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  biomarkerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  biomarkerRange: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
});

export default CirculationBodyMap;
