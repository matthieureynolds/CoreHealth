import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Polygon, Text as SvgText, G } from 'react-native-svg';

interface LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  status: 'optimal' | 'normal' | 'borderline' | 'high' | 'low';
  lastUpdated: string;
}

interface LabResultDetailModalProps {
  visible: boolean;
  labResult: LabResult | null;
  onClose: () => void;
}

const LabResultDetailModal: React.FC<LabResultDetailModalProps> = ({
  visible,
  labResult,
  onClose,
}) => {
  if (!visible || !labResult) return null;

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'optimal': return '#30D158';
      case 'normal': return '#32D74B';
      case 'borderline': return '#FF9F0A';
      case 'high': return '#FF6B35';
      case 'low': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getTrendIcon = (trend: string): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string, isGoodTrend: boolean): string => {
    if (trend === 'stable') return '#8E8E93';
    return isGoodTrend ? '#30D158' : '#FF3B30';
  };

  const getBiomarkerDetails = (id: string) => {
    const details: { [key: string]: any } = {
      'total_cholesterol': {
        description: 'Total cholesterol measures the total amount of cholesterol in your blood, including both HDL and LDL cholesterol.',
        normalRange: 'Less than 200 mg/dL',
        optimalRange: 'Less than 180 mg/dL',
        whatItMeans: 'High total cholesterol can increase your risk of heart disease and stroke. It\'s important to maintain healthy levels through diet and exercise.',
        recommendations: [
          'Reduce saturated and trans fats in your diet',
          'Increase fiber intake with fruits, vegetables, and whole grains',
          'Exercise regularly (at least 150 minutes per week)',
          'Maintain a healthy weight',
          'Consider medication if lifestyle changes aren\'t sufficient'
        ],
        riskFactors: [
          'Family history of high cholesterol',
          'Poor diet high in saturated fats',
          'Lack of physical activity',
          'Obesity',
          'Smoking'
        ]
      },
      'ldl_cholesterol': {
        description: 'LDL (low-density lipoprotein) cholesterol is often called "bad" cholesterol because it can build up in artery walls.',
        normalRange: 'Less than 100 mg/dL',
        optimalRange: 'Less than 70 mg/dL',
        whatItMeans: 'High LDL cholesterol is a major risk factor for heart disease and stroke. Lower levels are generally better for heart health.',
        recommendations: [
          'Follow a heart-healthy diet (DASH or Mediterranean)',
          'Limit red meat and full-fat dairy products',
          'Choose lean proteins and plant-based foods',
          'Exercise regularly',
          'Quit smoking if applicable'
        ],
        riskFactors: [
          'High saturated fat diet',
          'Lack of exercise',
          'Obesity',
          'Diabetes',
          'Family history'
        ]
      },
      'glucose': {
        description: 'Fasting glucose measures your blood sugar level after not eating for at least 8 hours.',
        normalRange: '70-99 mg/dL',
        optimalRange: '70-85 mg/dL',
        whatItMeans: 'High fasting glucose can indicate prediabetes or diabetes. Maintaining healthy levels is crucial for overall health.',
        recommendations: [
          'Limit refined carbohydrates and sugary foods',
          'Eat regular, balanced meals',
          'Exercise regularly to improve insulin sensitivity',
          'Maintain a healthy weight',
          'Monitor blood sugar if recommended by your doctor'
        ],
        riskFactors: [
          'Family history of diabetes',
          'Obesity',
          'Physical inactivity',
          'Poor diet',
          'Age over 45'
        ]
      },
      'creatinine': {
        description: 'Creatinine is a waste product filtered by the kidneys. Levels indicate how well your kidneys are functioning.',
        normalRange: '0.6-1.2 mg/dL (men), 0.5-1.1 mg/dL (women)',
        optimalRange: '0.7-1.0 mg/dL',
        whatItMeans: 'High creatinine levels may indicate kidney problems. It\'s important to monitor kidney function regularly.',
        recommendations: [
          'Stay well hydrated',
          'Follow a kidney-friendly diet if recommended',
          'Control blood pressure and diabetes',
          'Avoid excessive protein intake',
          'Regular check-ups with your doctor'
        ],
        riskFactors: [
          'Diabetes',
          'High blood pressure',
          'Heart disease',
          'Family history of kidney disease',
          'Age over 60'
        ]
      }
      ,
      'hemoglobin': {
        description: 'Hemoglobin is the protein in red blood cells that carries oxygen throughout your body. Levels reflect your blood\'s oxygen-carrying capacity and can indicate anemia or other conditions.',
        normalRange: 'Approx. 12.0–15.5 g/dL (women), 13.5–17.5 g/dL (men)',
        optimalRange: 'Generally mid-range for sex-specific normals',
        whatItMeans: 'Low hemoglobin suggests anemia (due to iron, B12/folate deficiency, chronic disease, or blood loss). High levels may be seen with dehydration, smoking, lung disease, or living at altitude.',
        recommendations: [
          'Eat iron-rich foods (lean meats, beans, leafy greens) with vitamin C',
          'Ensure adequate B12 and folate intake',
          'Discuss iron supplementation with your clinician if needed',
          'Investigate sources of blood loss if low (e.g., GI tract)',
          'Stay well hydrated if elevated',
        ],
        riskFactors: [
          'Iron deficiency or poor diet',
          'Chronic kidney disease or inflammatory conditions',
          'GI blood loss (ulcers, polyps)',
          'Smoking or chronic lung disease (for high values)',
          'High altitude residence (for high values)'
        ]
      },
      'platelets': {
        description: 'Platelets help your blood to clot. Abnormal levels can increase the risk of bleeding (low) or clotting (high).',
        normalRange: '150–450 ×10^3/uL',
        optimalRange: 'Mid-normal range (about 200–300 ×10^3/uL)',
        whatItMeans: 'Low platelets (thrombocytopenia) can be due to infections, medications, immune conditions, or bone marrow disorders. High platelets (thrombocytosis) can occur with inflammation, iron deficiency, or rarely bone marrow disease.',
        recommendations: [
          'Review medications and alcohol intake if low',
          'Treat underlying causes (e.g., iron deficiency, infection, inflammation)',
          'Avoid contact sports if very low to reduce bleeding risk',
          'Follow hematology guidance if markedly abnormal',
        ],
        riskFactors: [
          'Recent infections or viral illness',
          'Autoimmune conditions',
          'Iron deficiency (for high counts)',
          'Chronic inflammation',
          'Bone marrow disorders (rare)'
        ]
      }
    };

    return details[id] || {
      description: 'This biomarker provides important information about your health status.',
      normalRange: 'Consult your healthcare provider',
      optimalRange: 'Consult your healthcare provider',
      whatItMeans: 'Your healthcare provider can explain what this result means for your health.',
      recommendations: ['Consult your healthcare provider for personalized recommendations'],
      riskFactors: ['Consult your healthcare provider for risk assessment']
    };
  };

  const biomarkerDetails = getBiomarkerDetails(labResult.id);
  const isGoodTrend = () => {
    const lowerIsBetter = ['total_cholesterol', 'ldl_cholesterol', 'glucose', 'creatinine'];
    if (lowerIsBetter.includes(labResult.id)) {
      return labResult.trend === 'down';
    }
    return labResult.trend === 'up';
  };

  const trendColor = getTrendColor(labResult.trend, isGoodTrend());
  const statusColor = getStatusColor(labResult.status);
  const trendLabel = labResult.trend === 'stable' ? 'Stable' : isGoodTrend() ? 'Improving' : 'Worsening';

  // Range indicator for lab results
  const renderRangeIndicator = () => {
    const getRangeData = (id: string, value: number) => {
      switch (id) {
        case 'total_cholesterol':
          return {
            segments: [
              { label: 'Optimal', range: '<180', color: '#30D158', isBold: false },
              { label: 'Normal', range: '180-199', color: '#32D74B', isBold: false },
              { label: 'Borderline', range: '200-239', color: '#FF9F0A', isBold: false },
              { label: 'High', range: '240+', color: '#FF3B30', isBold: false }
            ],
            currentValue: value,
            currentLabel: value < 180 ? 'Optimal' : value < 200 ? 'Normal' : value < 240 ? 'Borderline' : 'High'
          };
        case 'ldl_cholesterol':
          return {
            segments: [
              { label: 'Optimal', range: '<70', color: '#30D158', isBold: false },
              { label: 'Near Optimal', range: '70-99', color: '#32D74B', isBold: false },
              { label: 'Borderline', range: '100-129', color: '#FF9F0A', isBold: false },
              { label: 'High', range: '130+', color: '#FF3B30', isBold: false }
            ],
            currentValue: value,
            currentLabel: value < 70 ? 'Optimal' : value < 100 ? 'Near Optimal' : value < 130 ? 'Borderline' : 'High'
          };
        case 'glucose':
          return {
            segments: [
              { label: 'Normal', range: '70-99', color: '#30D158', isBold: false },
              { label: 'Prediabetes', range: '100-125', color: '#FF9F0A', isBold: false },
              { label: 'Diabetes', range: '126+', color: '#FF3B30', isBold: false }
            ],
            currentValue: value,
            currentLabel: value < 100 ? 'Normal' : value < 126 ? 'Prediabetes' : 'Diabetes'
          };
        case 'creatinine':
          return {
            segments: [
              { label: 'Normal', range: '0.6-1.2', color: '#30D158', isBold: false },
              { label: 'High', range: '1.3+', color: '#FF3B30', isBold: false }
            ],
            currentValue: value,
            currentLabel: value <= 1.2 ? 'Normal' : 'High'
          };
        default:
          return {
            segments: [
              { label: 'Normal', range: 'Normal', color: '#30D158', isBold: false }
            ],
            currentValue: value,
            currentLabel: 'Normal'
          };
      }
    };

    const rangeData = getRangeData(labResult.id, labResult.value);
    const barWidth = 280;
    const barHeight = 16;
    const gap = 2;
    const totalGaps = (rangeData.segments.length - 1) * gap;
    const availableWidth = barWidth - totalGaps;
    const segmentWidth = availableWidth / rangeData.segments.length;

    // Calculate pointer position based on current value
    let pointerPosition = 0;
    if (rangeData.segments.length > 1) {
      const currentSegmentIndex = rangeData.segments.findIndex(segment => 
        rangeData.currentLabel === segment.label
      );
      if (currentSegmentIndex >= 0) {
        pointerPosition = (currentSegmentIndex * (segmentWidth + gap)) + (segmentWidth / 2);
      }
    }

    return (
      <View style={styles.rangeIndicatorContainer}>
        {Svg ? (
          <Svg width={barWidth} height={50} style={styles.rangeIndicatorSvg}>
          {/* Range bar segments */}
          {rangeData.segments.map((segment, index) => {
            const x = index * (segmentWidth + gap);
            return (
              <Rect
                key={index}
                x={x}
                y={2}
                width={segmentWidth}
                height={barHeight}
                fill={segment.color}
                rx={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
                ry={index === 0 ? 8 : index === rangeData.segments.length - 1 ? 8 : 0}
              />
            );
          })}
          
          {/* White triangle pointer */}
          <Polygon
            points={`${Math.min(Math.max(pointerPosition, 10), barWidth - 10)},0 ${Math.min(Math.max(pointerPosition - 6, 4), barWidth - 16)},15 ${Math.min(Math.max(pointerPosition + 6, 16), barWidth - 4)},15`}
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          
          {/* Range labels directly in SVG */}
          {rangeData.segments.map((segment, index) => {
            const x = index * (segmentWidth + gap);
            const centerX = x + (segmentWidth / 2);
            
            return (
              <G key={index}>
                <SvgText
                  x={centerX}
                  y={32}
                  fontSize="10"
                  fill="#FFFFFF"
                  fontWeight={segment.isBold ? "bold" : "600"}
                  textAnchor="middle"
                >
                  {segment.label}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={42}
                  fontSize="10"
                  fill="#8E8E93"
                  textAnchor="middle"
                >
                  {segment.range}
                </SvgText>
              </G>
            );
          })}
        </Svg>
        ) : (
          <View style={styles.rangeIndicatorContainer}>
            <Text style={styles.currentScoreText}>
              Range indicator not available
            </Text>
          </View>
        )}
        
        {/* Current score info */}
        <View style={styles.currentScoreContainer}>
          <Text style={styles.currentScoreText}>
            Your result is in the {rangeData.currentLabel} range ({rangeData.currentValue} {labResult.unit}).
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Fixed Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { backgroundColor: `${statusColor}20` }]}>
              <Ionicons name="flask" size={32} color={statusColor} />
            </View>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{labResult.name}</Text>
              <Text style={[styles.modalStatus, { color: statusColor }]}>
                {labResult.value} {labResult.unit} • {labResult.status.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollContent}>
            {/* Current Result Card */}
            <View style={styles.currentResultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultValue}>
                  {labResult.value} {labResult.unit}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {labResult.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.trendContainer}>
                <Ionicons 
                  name={getTrendIcon(labResult.trend)} 
                  size={16} 
                  color={trendColor} 
                />
                {labResult.trend !== 'stable' && (
                  <Text style={[styles.trendPercent, { color: trendColor }]}>
                    {labResult.trendPercent}%
                  </Text>
                )}
                <Text style={[styles.trendLabel, { color: trendColor }]}>
                  {trendLabel}
                </Text>
              </View>
              
              <Text style={styles.lastUpdated}>Last updated: {labResult.lastUpdated}</Text>
            </View>

            {/* Range Indicator */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Range Indicator</Text>
              {renderRangeIndicator()}
            </View>

            {/* What is this test */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>What is this test?</Text>
              <Text style={styles.sectionContent}>{biomarkerDetails.description}</Text>
            </View>

            {/* What it means */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>What this means for you:</Text>
              <Text style={styles.sectionContent}>{biomarkerDetails.whatItMeans}</Text>
            </View>

            {/* Recommendations */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Recommendations:</Text>
              {biomarkerDetails.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>

            {/* Risk Factors */}
            <View style={[styles.modalSection, { borderBottomWidth: 0 }]}>
              <Text style={styles.sectionTitle}>Risk Factors:</Text>
              {biomarkerDetails.riskFactors.map((factor, index) => (
                <View key={index} style={styles.riskItem}>
                  <Ionicons name="warning" size={16} color="#FF9500" />
                  <Text style={styles.riskText}>{factor}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flex: 1,
    padding: 20,
  },
  currentResultCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  trendPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalSection: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#EBEBF5',
    lineHeight: 20,
    textAlign: 'justify',
  },
  rangeIndicatorContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  rangeIndicatorSvg: {
    marginBottom: 16,
  },
  currentScoreContainer: {
    alignItems: 'center',
  },
  currentScoreText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default LabResultDetailModal; 