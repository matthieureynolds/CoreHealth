import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
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

interface BoneHealthBiomarker {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'optimal' | 'normal' | 'low' | 'high' | 'critical';
  lastUpdated: string;
  trend?: 'improving' | 'stable' | 'declining';
  description: string;
}

interface BoneHealthZone {
  id: string;
  name: string;
  anatomicalFocus: string;
  position: { x: number; y: number };
  biomarkers: BoneHealthBiomarker[];
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  lastAssessment: string;
}

interface SkeletonBodyMapProps {
  onPartPress: (partId: string) => void;
}

const SkeletonBodyMap: React.FC<SkeletonBodyMapProps> = ({ onPartPress }) => {
  const [selectedZone, setSelectedZone] = useState<BoneHealthZone | null>(null);
  const [showBiomarkerModal, setShowBiomarkerModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [animatedValue] = useState(new Animated.Value(1));
  const [panelAnim] = useState(new Animated.Value(0));

  const boneHealthZones: BoneHealthZone[] = [
    {
      id: 'general_systemic',
      name: 'General / Systemic',
      anatomicalFocus: 'Overall Bone Metabolism & Health',
      position: { x: 50, y: 45 }, // Center of body
      overallRisk: 'low',
      riskFactors: ['Age-related bone loss', 'Sedentary lifestyle'],
      lastAssessment: '2024-01-15',
      recommendations: [
        'Maintain adequate Vitamin D supplementation (2000-4000 IU daily)',
        'Ensure calcium intake of 1000-1200mg daily from food and supplements',
        'Weight-bearing exercise 3-4x per week for bone density',
        'Monitor bone turnover markers every 6 months',
        'Consider magnesium supplementation (400-600mg daily)',
      ],
      biomarkers: [
        {
          name: 'Vitamin D (25-OH)',
          value: 45,
          unit: 'ng/mL',
          referenceRange: '30-100',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Essential for calcium absorption and bone mineralization',
        },
        {
          name: 'Calcium (Total)',
          value: 9.8,
          unit: 'mg/dL',
          referenceRange: '8.5-10.5',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Primary mineral component of bone tissue',
        },
        {
          name: 'Phosphorus',
          value: 3.2,
          unit: 'mg/dL',
          referenceRange: '2.5-4.5',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Works with calcium for bone and teeth formation',
        },
        {
          name: 'Magnesium',
          value: 1.9,
          unit: 'mg/dL',
          referenceRange: '1.7-2.2',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Cofactor for bone formation and vitamin D metabolism',
        },
        {
          name: 'Zinc',
          value: 85,
          unit: 'μg/dL',
          referenceRange: '60-120',
          status: 'normal',
          lastUpdated: '2024-01-15',
          description: 'Essential trace element for bone formation',
        },
        {
          name: 'Copper',
          value: 95,
          unit: 'μg/dL',
          referenceRange: '70-140',
          status: 'normal',
          lastUpdated: '2024-01-15',
          description: 'Required for collagen cross-linking in bone',
        },
        {
          name: 'PTH (Intact)',
          value: 35,
          unit: 'pg/mL',
          referenceRange: '15-65',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Parathyroid hormone regulating calcium and phosphate',
        },
        {
          name: 'CRP (hs-CRP)',
          value: 1.2,
          unit: 'mg/L',
          referenceRange: '<3.0',
          status: 'normal',
          lastUpdated: '2024-01-15',
          description: 'Inflammatory marker affecting bone metabolism',
        },
        {
          name: 'ESR',
          value: 8,
          unit: 'mm/hr',
          referenceRange: '<20',
          status: 'normal',
          lastUpdated: '2024-01-15',
          description: 'Erythrocyte sedimentation rate - inflammation marker',
        },
        {
          name: 'BSAP',
          value: 18,
          unit: 'μg/L',
          referenceRange: '6.5-20.1',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Bone-specific alkaline phosphatase - bone formation marker',
        },
        {
          name: 'Osteocalcin',
          value: 22,
          unit: 'ng/mL',
          referenceRange: '11-43',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Bone formation marker produced by osteoblasts',
        },
        {
          name: 'P1NP',
          value: 45,
          unit: 'ng/mL',
          referenceRange: '16.3-78.1',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'Procollagen type 1 N-terminal propeptide - bone formation',
        },
        {
          name: 'CTX',
          value: 0.35,
          unit: 'ng/mL',
          referenceRange: '0.104-0.704',
          status: 'normal',
          lastUpdated: '2024-01-15',
          trend: 'stable',
          description: 'C-terminal telopeptide - bone resorption marker',
        },
        {
          name: 'NTX',
          value: 15,
          unit: 'nmol BCE/mmol Cr',
          referenceRange: '5.4-24.2',
          status: 'normal',
          lastUpdated: '2024-01-15',
          description: 'N-terminal telopeptide - bone resorption marker',
        },
        {
          name: 'TRACP-5b',
          value: 3.2,
          unit: 'U/L',
          referenceRange: '1.03-4.15',
          status: 'normal',
          lastUpdated: '2024-01-15',
          description: 'Tartrate-resistant acid phosphatase - osteoclast marker',
        },
      ],
    },
    {
      id: 'spine',
      name: 'Spine',
      anatomicalFocus: 'Lumbar & Thoracic Vertebrae',
      position: { x: 50, y: 25 }, // Upper center
      overallRisk: 'moderate',
      riskFactors: ['Age >50', 'Previous compression fracture', 'Kyphosis'],
      lastAssessment: '2024-01-10',
      recommendations: [
        'Spine-specific strengthening exercises for vertebral support',
        'Maintain proper posture and ergonomics',
        'Annual DEXA scan monitoring for vertebral bone density',
        'Consider vertebral fracture assessment (VFA) with next DEXA',
        'Calcium and Vitamin D optimization for vertebral health',
      ],
      biomarkers: [
        {
          name: 'Spine T-score (L1-L4)',
          value: -1.8,
          unit: 'SD',
          referenceRange: '>-1.0',
          status: 'low',
          lastUpdated: '2024-01-10',
          trend: 'declining',
          description: 'Lumbar spine bone density compared to young adult peak',
        },
        {
          name: 'Vertebral Fracture Risk (10-yr)',
          value: 12,
          unit: '%',
          referenceRange: '<10%',
          status: 'high',
          lastUpdated: '2024-01-10',
          description: 'FRAX-calculated 10-year probability of vertebral fracture',
        },
        {
          name: 'Spine Z-score (Age-matched)',
          value: -1.2,
          unit: 'SD',
          referenceRange: '>-2.0',
          status: 'normal',
          lastUpdated: '2024-01-10',
          description: 'Lumbar spine bone density compared to age-matched peers',
        },
        {
          name: 'Vertebral Height Loss',
          value: 'None detected',
          unit: '',
          referenceRange: 'None',
          status: 'normal',
          lastUpdated: '2024-01-10',
          description: 'Assessment for vertebral compression fractures',
        },
      ],
    },
    {
      id: 'left_hip',
      name: 'Left Hip',
      anatomicalFocus: 'Left Femoral Neck & Total Hip',
      position: { x: 35, y: 55 }, // Left side
      overallRisk: 'low',
      riskFactors: ['Family history of hip fracture'],
      lastAssessment: '2024-01-10',
      recommendations: [
        'Continue weight-bearing exercises focusing on hip strength',
        'Balance training to prevent falls and hip fractures',
        'Monitor hip bone density every 2 years',
        'Maintain adequate protein intake for muscle mass',
      ],
      biomarkers: [
        {
          name: 'Left Hip T-score (Total)',
          value: -0.8,
          unit: 'SD',
          referenceRange: '>-1.0',
          status: 'normal',
          lastUpdated: '2024-01-10',
          trend: 'stable',
          description: 'Total left hip bone density vs young adult peak',
        },
        {
          name: 'Left Femoral Neck T-score',
          value: -1.2,
          unit: 'SD',
          referenceRange: '>-1.0',
          status: 'low',
          lastUpdated: '2024-01-10',
          trend: 'stable',
          description: 'Left femoral neck bone density vs young adult peak',
        },
        {
          name: 'FRAX Left Hip Risk (10-yr)',
          value: 2.1,
          unit: '%',
          referenceRange: '<3%',
          status: 'normal',
          lastUpdated: '2024-01-10',
          description: 'FRAX-calculated 10-year probability of left hip fracture',
        },
        {
          name: 'Left Hip Z-score',
          value: -0.5,
          unit: 'SD',
          referenceRange: '>-2.0',
          status: 'normal',
          lastUpdated: '2024-01-10',
          description: 'Left hip bone density compared to age-matched peers',
        },
      ],
    },
    {
      id: 'right_hip',
      name: 'Right Hip',
      anatomicalFocus: 'Right Femoral Neck & Total Hip',
      position: { x: 65, y: 55 }, // Right side
      overallRisk: 'low',
      riskFactors: ['Family history of hip fracture'],
      lastAssessment: '2024-01-10',
      recommendations: [
        'Continue weight-bearing exercises focusing on hip strength',
        'Balance training to prevent falls and hip fractures',
        'Monitor hip bone density every 2 years',
        'Maintain adequate protein intake for muscle mass',
      ],
      biomarkers: [
        {
          name: 'Right Hip T-score (Total)',
          value: -0.6,
          unit: 'SD',
          referenceRange: '>-1.0',
          status: 'normal',
          lastUpdated: '2024-01-10',
          trend: 'stable',
          description: 'Total right hip bone density vs young adult peak',
        },
        {
          name: 'Right Femoral Neck T-score',
          value: -1.0,
          unit: 'SD',
          referenceRange: '>-1.0',
          status: 'normal',
          lastUpdated: '2024-01-10',
          trend: 'stable',
          description: 'Right femoral neck bone density vs young adult peak',
        },
        {
          name: 'FRAX Right Hip Risk (10-yr)',
          value: 1.8,
          unit: '%',
          referenceRange: '<3%',
          status: 'normal',
          lastUpdated: '2024-01-10',
          description: 'FRAX-calculated 10-year probability of right hip fracture',
        },
        {
          name: 'Right Hip Z-score',
          value: -0.3,
          unit: 'SD',
          referenceRange: '>-2.0',
          status: 'normal',
          lastUpdated: '2024-01-10',
          description: 'Right hip bone density compared to age-matched peers',
        },
      ],
    },
  ];



  const handleZonePress = (zone: BoneHealthZone) => {
    setSelectedZone(zone);
    onPartPress(zone.id);

    // Animate the pressed zone
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Show the panel
    Animated.spring(panelAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleBiomarkerPress = (biomarker: BoneHealthBiomarker) => {
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
      {/* Skeleton body image with clinical zones */}
      <View style={styles.bodyOutline}>
        <Image
          source={require('../../../../assets/skeleton page.png')}
          style={styles.skeletonImage}
          resizeMode="contain"
        />

        {/* Always-visible biomarker dots for each zone */}
        {[
          // General/Systemic (heart area, moved up)
          { id: 'general_systemic', x: 50, y: 28 },
          // Spine (just below rib cage, moved up)
          { id: 'spine', x: 50, y: 39 },
          // Left Hip (positioned at actual hip bone - adjusted for better positioning)
          { id: 'left_hip', x: 30, y: 62 },
          // Right Hip (positioned at actual hip bone - adjusted for better positioning)
          { id: 'right_hip', x: 70, y: 62 },
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
              const zone = boneHealthZones.find(z => z.id === dot.id);
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
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Text style={styles.zoneDescription}>{selectedZone.anatomicalFocus}</Text>

          <ScrollView
            style={styles.biomarkerScrollView}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.biomarkerList}>
              {selectedZone.biomarkers.map((biomarker, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.biomarkerItem}
                  onPress={() => handleBiomarkerPress(biomarker)}
                >
                  <Text style={styles.biomarkerName}>{biomarker.name}</Text>
                  <Text style={styles.biomarkerValue}>
                    {biomarker.value} {biomarker.unit}
                  </Text>
                  <Text style={styles.biomarkerRange}>({biomarker.referenceRange})</Text>
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
    color: '#34C759',
    marginRight: 8,
  },
  biomarkerRange: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default SkeletonBodyMap;
