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
  if (!labResult) return null;

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Lab Result Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* Result Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.biomarkerName}>{labResult.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {labResult.status.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.valueContainer}>
              <Text style={styles.value}>
                {labResult.value} {labResult.unit}
              </Text>
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
            </View>
            
            <Text style={styles.lastUpdated}>Last updated: {labResult.lastUpdated}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is this test?</Text>
            <Text style={styles.sectionText}>{biomarkerDetails.description}</Text>
          </View>

          {/* Ranges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reference Ranges</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.rangeItem}>
                <Text style={styles.rangeLabel}>Normal Range:</Text>
                <Text style={styles.rangeValue}>{biomarkerDetails.normalRange}</Text>
              </View>
              <View style={styles.rangeItem}>
                <Text style={styles.rangeLabel}>Optimal Range:</Text>
                <Text style={styles.rangeValue}>{biomarkerDetails.optimalRange}</Text>
              </View>
            </View>
          </View>

          {/* What it means */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What does this mean?</Text>
            <Text style={styles.sectionText}>{biomarkerDetails.whatItMeans}</Text>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {biomarkerDetails.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={16} color="#30D158" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Risk Factors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Factors</Text>
            {biomarkerDetails.riskFactors.map((factor, index) => (
              <View key={index} style={styles.riskFactorItem}>
                <Ionicons name="warning" size={16} color="#FF9F0A" />
                <Text style={styles.riskFactorText}>{factor}</Text>
              </View>
            ))}
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  biomarkerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
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
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#EBEBF5',
    lineHeight: 20,
  },
  rangeContainer: {
    gap: 12,
  },
  rangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  riskFactorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskFactorText: {
    fontSize: 14,
    color: '#EBEBF5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default LabResultDetailModal; 