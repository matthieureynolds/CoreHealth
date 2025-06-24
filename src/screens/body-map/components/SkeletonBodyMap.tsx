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

interface SkeletonPart {
  id: string;
  name: string;
  position: { x: number; y: number };
  healthData: {
    boneDensity?: number;
    flexibility?: number;
    painLevel?: number;
    mobility?: number;
  };
  conditions?: string[];
}

interface SkeletonBodyMapProps {
  onPartPress: (partId: string) => void;
}

const SkeletonBodyMap: React.FC<SkeletonBodyMapProps> = ({ onPartPress }) => {
  const skeletonParts: SkeletonPart[] = [
    {
      id: 'skull',
      name: 'Skull',
      position: { x: 50, y: 8 },
      healthData: {
        boneDensity: 95,
        painLevel: 0,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'cervical_spine',
      name: 'Cervical Spine',
      position: { x: 50, y: 15 },
      healthData: {
        boneDensity: 88,
        flexibility: 75,
        painLevel: 2,
        mobility: 85,
      },
      conditions: ['Mild tension'],
    },
    {
      id: 'shoulder_left',
      name: 'Left Shoulder',
      position: { x: 35, y: 22 },
      healthData: {
        boneDensity: 92,
        flexibility: 80,
        painLevel: 1,
        mobility: 90,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'shoulder_right',
      name: 'Right Shoulder',
      position: { x: 65, y: 22 },
      healthData: {
        boneDensity: 92,
        flexibility: 82,
        painLevel: 0,
        mobility: 92,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'thoracic_spine',
      name: 'Thoracic Spine',
      position: { x: 50, y: 35 },
      healthData: {
        boneDensity: 85,
        flexibility: 70,
        painLevel: 1,
        mobility: 80,
      },
      conditions: ['Mild stiffness'],
    },
    {
      id: 'lumbar_spine',
      name: 'Lumbar Spine',
      position: { x: 50, y: 48 },
      healthData: {
        boneDensity: 82,
        flexibility: 65,
        painLevel: 3,
        mobility: 75,
      },
      conditions: ['Lower back tension'],
    },
    {
      id: 'hip_left',
      name: 'Left Hip',
      position: { x: 42, y: 55 },
      healthData: {
        boneDensity: 88,
        flexibility: 78,
        painLevel: 1,
        mobility: 85,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'hip_right',
      name: 'Right Hip',
      position: { x: 58, y: 55 },
      healthData: {
        boneDensity: 90,
        flexibility: 80,
        painLevel: 0,
        mobility: 88,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'knee_left',
      name: 'Left Knee',
      position: { x: 42, y: 72 },
      healthData: {
        boneDensity: 85,
        flexibility: 85,
        painLevel: 2,
        mobility: 82,
      },
      conditions: ['Mild wear'],
    },
    {
      id: 'knee_right',
      name: 'Right Knee',
      position: { x: 58, y: 72 },
      healthData: {
        boneDensity: 87,
        flexibility: 88,
        painLevel: 1,
        mobility: 85,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'ankle_left',
      name: 'Left Ankle',
      position: { x: 42, y: 88 },
      healthData: {
        boneDensity: 90,
        flexibility: 90,
        painLevel: 0,
        mobility: 95,
      },
      conditions: ['Healthy'],
    },
    {
      id: 'ankle_right',
      name: 'Right Ankle',
      position: { x: 58, y: 88 },
      healthData: {
        boneDensity: 92,
        flexibility: 92,
        painLevel: 0,
        mobility: 95,
      },
      conditions: ['Healthy'],
    },
  ];

  const getHealthColor = (part: SkeletonPart) => {
    const avgScore = (
      (part.healthData.boneDensity || 0) +
      (part.healthData.flexibility || 0) +
      (part.healthData.mobility || 0) +
      (100 - (part.healthData.painLevel || 0) * 10)
    ) / 4;

    if (avgScore >= 85) return '#34C759'; // Green - Healthy
    if (avgScore >= 70) return '#FF9500'; // Orange - Moderate
    return '#FF3B30'; // Red - Needs attention
  };

  return (
    <View style={styles.container}>
      {/* Real skeleton body image */}
      <View style={styles.bodyOutline}>
        <Image 
          source={require('../../../../assets/skeleton page.png')} 
          style={styles.skeletonImage}
          resizeMode="contain"
        />
        
        {/* Interactive points for skeleton parts */}
        {skeletonParts.map((part) => (
          <TouchableOpacity
            key={part.id}
            style={[
              styles.skeletonPoint,
              {
                left: `${part.position.x}%`,
                top: `${part.position.y}%`,
                backgroundColor: getHealthColor(part),
              },
            ]}
            onPress={() => onPartPress(part.id)}
          >
            <Ionicons name="radio-button-on" size={16} color="#fff" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Bone & Joint Health</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
            <Text style={styles.legendText}>Healthy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendText}>Moderate</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
            <Text style={styles.legendText}>Needs Attention</Text>
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
  skeletonImage: {
    width: '100%',
    height: '100%',
  },
  skeletonPoint: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -16,
    marginTop: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
  },
});

export default SkeletonBodyMap; 