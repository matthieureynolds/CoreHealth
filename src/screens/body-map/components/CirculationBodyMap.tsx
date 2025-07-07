import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface CirculationPoint {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'heart' | 'artery' | 'vein' | 'capillary';
  healthData: {
    bloodFlow?: number;
    pressure?: number;
    oxygenation?: number;
    health?: number;
  };
  conditions?: string[];
}

interface CirculationBodyMapProps {
  onPointPress: (pointId: string) => void;
}

const CirculationBodyMap: React.FC<CirculationBodyMapProps> = ({
  onPointPress,
}) => {
  const circulationPoints: CirculationPoint[] = [
    {
      id: 'heart',
      name: 'Heart',
      position: { x: 50, y: 30 },
      type: 'heart',
      healthData: {
        bloodFlow: 95,
        pressure: 85,
        oxygenation: 98,
        health: 92,
      },
      conditions: ['Healthy rhythm', 'Good output'],
    },
    {
      id: 'carotid_left',
      name: 'Left Carotid Artery',
      position: { x: 45, y: 18 },
      type: 'artery',
      healthData: {
        bloodFlow: 88,
        pressure: 90,
        health: 89,
      },
      conditions: ['Clear'],
    },
    {
      id: 'carotid_right',
      name: 'Right Carotid Artery',
      position: { x: 55, y: 18 },
      type: 'artery',
      healthData: {
        bloodFlow: 90,
        pressure: 88,
        health: 89,
      },
      conditions: ['Clear'],
    },
    {
      id: 'aorta',
      name: 'Aorta',
      position: { x: 50, y: 35 },
      type: 'artery',
      healthData: {
        bloodFlow: 92,
        pressure: 85,
        health: 88,
      },
      conditions: ['Healthy elasticity'],
    },
    {
      id: 'pulmonary_left',
      name: 'Left Pulmonary',
      position: { x: 45, y: 28 },
      type: 'artery',
      healthData: {
        bloodFlow: 85,
        oxygenation: 96,
        health: 90,
      },
      conditions: ['Good oxygenation'],
    },
    {
      id: 'pulmonary_right',
      name: 'Right Pulmonary',
      position: { x: 55, y: 28 },
      type: 'artery',
      healthData: {
        bloodFlow: 87,
        oxygenation: 97,
        health: 92,
      },
      conditions: ['Good oxygenation'],
    },
    {
      id: 'renal_left',
      name: 'Left Renal Artery',
      position: { x: 45, y: 48 },
      type: 'artery',
      healthData: {
        bloodFlow: 82,
        pressure: 88,
        health: 85,
      },
      conditions: ['Mild narrowing'],
    },
    {
      id: 'renal_right',
      name: 'Right Renal Artery',
      position: { x: 55, y: 48 },
      type: 'artery',
      healthData: {
        bloodFlow: 85,
        pressure: 85,
        health: 85,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'femoral_left',
      name: 'Left Femoral Artery',
      position: { x: 42, y: 65 },
      type: 'artery',
      healthData: {
        bloodFlow: 80,
        pressure: 82,
        health: 81,
      },
      conditions: ['Mild plaque'],
    },
    {
      id: 'femoral_right',
      name: 'Right Femoral Artery',
      position: { x: 58, y: 65 },
      type: 'artery',
      healthData: {
        bloodFlow: 85,
        pressure: 85,
        health: 85,
      },
      conditions: ['Healthy'],
    },
  ];

  const getHealthColor = (point: CirculationPoint) => {
    const health = point.healthData.health || 0;
    if (health >= 85) return '#34C759'; // Green - Healthy
    if (health >= 70) return '#FF9500'; // Orange - Moderate
    return '#FF3B30'; // Red - Needs attention
  };

  const getPointSize = (type: string) => {
    switch (type) {
      case 'heart':
        return 40;
      case 'artery':
        return 28;
      case 'vein':
        return 24;
      case 'capillary':
        return 20;
      default:
        return 28;
    }
  };

  return (
    <View style={styles.container}>
      {/* Real circulation body image */}
      <View style={styles.bodyOutline}>
        <Image
          source={require('../../../../assets/circulation body.png')}
          style={styles.circulationImage}
          resizeMode="contain"
        />

        {/* Interactive circulation points */}
        {circulationPoints.map(point => (
          <TouchableOpacity
            key={point.id}
            style={[
              styles.circulationPoint,
              {
                left: `${point.position.x}%`,
                top: `${point.position.y}%`,
                backgroundColor: getHealthColor(point),
                width: getPointSize(point.type),
                height: getPointSize(point.type),
                borderRadius: getPointSize(point.type) / 2,
              },
            ]}
            onPress={() => onPointPress(point.id)}
          >
            <Ionicons
              name={point.type === 'heart' ? 'heart' : 'radio-button-on'}
              size={point.type === 'heart' ? 24 : 16}
              color="#fff"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Cardiovascular Health</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: '#34C759' }]}
            />
            <Text style={styles.legendText}>Healthy</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: '#FF9500' }]}
            />
            <Text style={styles.legendText}>Moderate</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: '#FF3B30' }]}
            />
            <Text style={styles.legendText}>Needs Attention</Text>
          </View>
        </View>
        <View style={styles.legendTypes}>
          <View style={styles.legendItem}>
            <Ionicons name="heart" size={16} color="#FF3B30" />
            <Text style={styles.legendText}>Heart</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="radio-button-on" size={16} color="#007AFF" />
            <Text style={styles.legendText}>Blood Vessels</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
  },
  bodyOutline: {
    width: width * 0.8,
    height: height * 0.7,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circulationImage: {
    width: '100%',
    height: '100%',
  },
  circulationPoint: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  legend: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    width: width * 0.8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  legendTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default CirculationBodyMap;
