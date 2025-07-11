import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import BiomarkerModal, { BiomarkerInfo } from '../../../components/common/BiomarkerModal';
import RegionModal, { RegionData, RegionBiomarker } from '../../../components/common/RegionModal';
import { getBiomarkerInfo } from '../../../data/biomarkerDatabase';

const { width, height } = Dimensions.get('window');

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
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [showBiomarkerModal, setShowBiomarkerModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);

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
    setRegionModalVisible(true);
    onPointPress(zone.id);
  };

  const handleBiomarkerPress = (biomarker: RegionBiomarker) => {
    const biomarkerInfo = getBiomarkerInfo(
      biomarker.name,
      typeof biomarker.value === 'number' ? biomarker.value : 0,
      biomarker.status === 'optimal' ? 'normal' : biomarker.status
    );
    
    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setShowBiomarkerModal(true);
    }
  };

  const convertToRegionData = (zone: CirculationZone): RegionData => {
    return {
      name: zone.name,
      description: zone.id === 'oxygenation' 
        ? 'This is about blood oxygenation and pulmonary function, not lung tissue.'
        : zone.description,
      biomarkers: zone.biomarkers.map(biomarkerName => ({
        name: biomarkerName,
        value: 85, // Mock value - in real app this would come from actual data
        unit: 'mg/dL',
        referenceRange: '70-100',
        status: 'normal' as const,
      })),
    };
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
          // Arteries/Vessels & Blood (middle of left arm)
          { id: 'arteries_vessels_blood', x: 23, y: 44 },
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
                setSelectedZone(zone);
                setRegionModalVisible(true);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.dotInner} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Region Modal */}
      <RegionModal
        visible={regionModalVisible}
        region={selectedZone ? convertToRegionData(selectedZone) : null}
        onClose={() => setRegionModalVisible(false)}
        onBiomarkerPress={handleBiomarkerPress}
      />

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
});

export default CirculationBodyMap;
