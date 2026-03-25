import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import BiomarkerModal, { BiomarkerInfo } from '../../../../shared/components/modals/BiomarkerModal';
import { getBiomarkerInfo } from '../../../../shared/data/biomarkerDatabase';
import { circulationZones } from '../../circulatory';
import { CirculationZone } from '../../circulatory/types';
import { PanelPayload } from '../../types';

const { width } = Dimensions.get('window');

interface CirculationBodyMapProps {
  onPointPress: (pointId: string) => void;
  onZoneSelect?: (zone: PanelPayload) => void;
}

const DOT_POSITIONS = [
  { id: 'heart',                  x: 52,   y: 31 },
  { id: 'arteries_vessels_blood', x: 31.5, y: 30 },
  { id: 'oxygenation',            x: 50,   y: 22 },
] as const;

const CirculationBodyMap: React.FC<CirculationBodyMapProps> = ({
  onPointPress,
  onZoneSelect,
}) => {
  const [showBiomarkerModal, setShowBiomarkerModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);

  const handleZonePress = (zone: CirculationZone) => {
    onPointPress(zone.id);

    onZoneSelect?.({
      data: {
        name: zone.name,
        description: zone.description,
        biomarkers: zone.biomarkers.map(name => ({
          name,
          value: 85,
          unit: 'mg/dL',
          range: '70-100',
          status: 'normal',
        })),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyOutline}>
        <Image
          source={require('../../../../../assets/images/body-map/circulation.png')}
          style={styles.circulationImage}
          resizeMode="contain"
        />

        {DOT_POSITIONS.map(dot => (
          <TouchableOpacity
            key={dot.id}
            style={[styles.zoneDot, { left: `${dot.x}%`, top: `${dot.y}%` }]}
            onPress={() => {
              const zone = circulationZones.find(z => z.id === dot.id);
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

export default CirculationBodyMap;
