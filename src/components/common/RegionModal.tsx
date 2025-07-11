import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BiomarkerInfo } from './BiomarkerModal';

const { width, height } = Dimensions.get('window');

export interface RegionBiomarker {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical' | 'optimal';
  description?: string;
}

export interface RegionData {
  name: string;
  description: string;
  biomarkers: RegionBiomarker[];
}

interface RegionModalProps {
  visible: boolean;
  region: RegionData | null;
  onClose: () => void;
  onBiomarkerPress: (biomarker: RegionBiomarker) => void;
}

const RegionModal: React.FC<RegionModalProps> = ({
  visible,
  region,
  onClose,
  onBiomarkerPress,
}) => {
  const [panelAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(panelAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(panelAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, panelAnim]);

  const getBiomarkerStatusColor = (status: string) => {
    switch (status) {
      case 'high':
      case 'critical':
        return '#FF3B30';
      case 'low':
        return '#FF9500';
      case 'normal':
      case 'optimal':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getBiomarkerStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
      case 'critical':
        return 'warning';
      case 'low':
        return 'alert-circle';
      case 'normal':
      case 'optimal':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  if (!region) return null;

  const translateY = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Animated.View
      style={[
        styles.infoPanel,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.panelHeader}>
        <Text style={styles.regionTitle}>{region.name}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.regionDescription}>{region.description}</Text>

      <ScrollView
        style={styles.biomarkerScrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.biomarkerList}>
          {region.biomarkers.map((biomarker, index) => (
            <TouchableOpacity
              key={index}
              style={styles.biomarkerItem}
              onPress={() => onBiomarkerPress(biomarker)}
            >
              <View style={styles.biomarkerInfo}>
                <Text style={styles.biomarkerName}>{biomarker.name}</Text>
                <View style={styles.biomarkerValues}>
                  <Text style={styles.biomarkerValue}>
                    {biomarker.value} {biomarker.unit}
                  </Text>
                  <Text style={styles.biomarkerRange}>
                    ({biomarker.referenceRange})
                  </Text>
                </View>
              </View>
              <View style={styles.biomarkerStatus}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: getBiomarkerStatusColor(biomarker.status),
                    },
                  ]}
                >
                  <Ionicons
                    name={getBiomarkerStatusIcon(biomarker.status)}
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  regionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  regionDescription: {
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  biomarkerInfo: {
    flex: 1,
  },
  biomarkerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  biomarkerValues: {
    flexDirection: 'row',
    alignItems: 'center',
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
  biomarkerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});

export default RegionModal; 