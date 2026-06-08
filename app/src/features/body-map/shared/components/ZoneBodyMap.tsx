import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageSourcePropType,
  AccessibilityRole,
} from 'react-native';
import { PanelPayload, PanelBiomarker } from '../../types';

const { width } = Dimensions.get('window');

const BODY_ASPECT_RATIO = 1.5;
const BODY_WIDTH_RATIO = 0.99;
const DOT_SIZE = 28;
const DOT_INNER_SIZE = 14;

export interface ZoneDotPosition {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string; // accessibility label
}

export interface ZoneBodyMapProps<Z> {
  imageSource: ImageSourcePropType;
  zones: Z[];
  dotPositions: readonly ZoneDotPosition[];
  findZone: (zones: Z[], dotId: string) => Z | undefined;
  mapZoneToPanelPayload: (zone: Z) => PanelPayload;
  onZoneSelect?: (zone: PanelPayload) => void;
}

function ZoneBodyMap<Z>({
  imageSource,
  zones,
  dotPositions,
  findZone,
  mapZoneToPanelPayload,
  onZoneSelect,
}: ZoneBodyMapProps<Z>) {
  const handleDotPress = (dotId: string) => {
    const zone = findZone(zones, dotId);
    if (zone) {
      onZoneSelect?.(mapZoneToPanelPayload(zone));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyOutline}>
        <Image
          source={imageSource}
          style={styles.bodyImage}
          resizeMode="contain"
        />

        {dotPositions.map(dot => (
          <TouchableOpacity
            key={dot.id}
            style={[styles.zoneDot, { left: `${dot.x}%`, top: `${dot.y}%` }]}
            onPress={() => handleDotPress(dot.id)}
            activeOpacity={0.8}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel={dot.label}
          >
            <View style={styles.dotInner} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    width: '100%',
  },
  bodyOutline: {
    width: width * BODY_WIDTH_RATIO,
    height: width * BODY_WIDTH_RATIO * BODY_ASPECT_RATIO,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  zoneDot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#2196F3',
    borderWidth: 1,
    borderColor: '#7FDBFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -(DOT_SIZE / 2) }, { translateY: -(DOT_SIZE / 2) }],
    zIndex: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dotInner: {
    width: DOT_INNER_SIZE,
    height: DOT_INNER_SIZE,
    borderRadius: DOT_INNER_SIZE / 2,
    backgroundColor: '#00BFFF',
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
});

export default ZoneBodyMap;
