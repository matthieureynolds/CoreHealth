import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import BiomarkerModal, { BiomarkerInfo } from '../../../../shared/components/modals/BiomarkerModal';
import { getBiomarkerInfo } from '../../../../shared/data/biomarkerDatabase';
import { boneHealthZones } from '../../skeleton';
import { BoneHealthZone } from '../../skeleton/types';
import { PanelPayload } from '../../types';
import { useState } from 'react';

const { width } = Dimensions.get('window');

interface SkeletonBodyMapProps {
  onPartPress: (partId: string) => void;
  onZoneSelect?: (zone: PanelPayload) => void;
}

const DOT_POSITIONS = [
  { id: 'general_systemic', x: 50.2, y: 28 },
  { id: 'spine',            x: 50.2, y: 39 },
  { id: 'left_hip',         x: 42,   y: 49.2 },
  { id: 'right_hip',        x: 58.7, y: 49.2 },
] as const;

const SkeletonBodyMap: React.FC<SkeletonBodyMapProps> = ({ onPartPress, onZoneSelect }) => {
  const [showBiomarkerModal, setShowBiomarkerModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);

  const handleZonePress = (zone: BoneHealthZone) => {
    onPartPress(zone.id);

    onZoneSelect?.({
      data: {
        name: zone.name,
        description: zone.anatomicalFocus,
        biomarkers: zone.biomarkers.map(b => ({
          name: b.name,
          value: typeof b.value === 'number' ? b.value : 0,
          unit: b.unit,
          range: b.referenceRange,
          status: b.status === 'optimal' ? 'normal' : b.status,
        })),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyOutline}>
        <Image
          source={require('../../../../../assets/images/body-map/skeleton.png')}
          style={styles.skeletonImage}
          resizeMode="contain"
        />

        {DOT_POSITIONS.map(dot => (
          <TouchableOpacity
            key={dot.id}
            style={[styles.zoneDot, { left: `${dot.x}%`, top: `${dot.y}%` }]}
            onPress={() => {
              const zone = boneHealthZones.find(z => z.id === dot.id);
              if (zone) handleZonePress(zone);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.dotInner} />
          </TouchableOpacity>
        ))}
      </View>

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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  bodyOutline: {
    width: width * 0.99,
    height: width * 0.99 * 1.5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
  },
  zoneDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    borderWidth: 1,
    borderColor: '#7FDBFF',
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
    backgroundColor: '#00BFFF',
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
});

export default SkeletonBodyMap;
