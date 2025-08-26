import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ImageBackground,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { organsList } from '../organs';
import { Organ } from '../organs/types';
import BiomarkerModal, { BiomarkerInfo } from '../../../components/common/BiomarkerModal';
import { getBiomarkerInfo } from '../../../data/biomarkerDatabase';

interface BodyMapProps {
  onOrganPress: (organId: string) => void;
}

const BODY_IMAGE = require('../../../../assets/bodymaptransparent.png');
const { width, height } = Dimensions.get('window');

const BodyMap: React.FC<BodyMapProps> = ({ onOrganPress }) => {
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
  const [showBiomarkerModal, setShowBiomarkerModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));

  const imageWidth = width * 0.95;
  const imageHeight = imageWidth * 1.5;

  const handleOrganPress = (organId: string) => {
    const organ = organsList.find(o => o.id === organId);
    if (organ) {
      setSelectedOrgan(organ);
      onOrganPress(organId);
      
      // Show the panel
      Animated.spring(panelAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
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
      setSelectedOrgan(null);
    });
  };

  const getBiomarkerStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#34C759';
      case 'borderline': return '#FF9500';
      case 'abnormal': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={BODY_IMAGE}
        style={[
          styles.imageBackground,
          { width: imageWidth, height: imageHeight },
        ]}
        imageStyle={styles.image}
      >
        {organsList.map(organ => (
          <TouchableOpacity
            key={organ.id}
            style={[
              styles.organPill,
              {
                left: organ.position.x * imageWidth - 30,
                top: organ.position.y * imageHeight - 10,
              },
            ]}
            onPress={() => handleOrganPress(organ.id)}
          >
            <Text style={styles.organPillText}>{organ.label}</Text>
          </TouchableOpacity>
        ))}
      </ImageBackground>

      {/* Info Panel */}
      {selectedOrgan && (
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
            <Text style={styles.organTitle}>{selectedOrgan.data.name}</Text>
            <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Text style={styles.organDescription}>{selectedOrgan.data.description}</Text>

          <ScrollView
            style={styles.biomarkerScrollView}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.biomarkerList}>
              {selectedOrgan.data.biomarkers.map((biomarker, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.biomarkerItem}
                  onPress={() => handleBiomarkerPress(biomarker.name)}
                >
                  <Text style={styles.biomarkerName}>{biomarker.name}</Text>
                  <Text style={[styles.biomarkerValue, { color: getBiomarkerStatusColor(biomarker.status) }]}>
                    {biomarker.value} {biomarker.unit}
                  </Text>
                  <Text style={styles.biomarkerRange}>({biomarker.range})</Text>
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
    width: '100%',
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  imageBackground: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
  organPill: {
    position: 'absolute',
    backgroundColor: '#2196F3', // Modern blue
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7FDBFF', // Lighter blue border
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  organPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
  organTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  organDescription: {
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
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  biomarkerName: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  biomarkerValue: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  biomarkerRange: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default BodyMap;
