import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BiomarkerDetail {
  description: string;
  normalRange: string;
  optimalRange: string;
  whatItMeans: string;
  recommendations: string[];
  riskFactors: string[];
}

export const getBiomarkerDetails = (id: string): BiomarkerDetail => {
  const details: Record<string, BiomarkerDetail> = {
    total_cholesterol: {
      description: 'Total cholesterol measures the total amount of cholesterol in your blood, including both HDL and LDL cholesterol.',
      normalRange: 'Less than 200 mg/dL',
      optimalRange: 'Less than 180 mg/dL',
      whatItMeans: "High total cholesterol can increase your risk of heart disease and stroke. It's important to maintain healthy levels through diet and exercise.",
      recommendations: [
        'Reduce saturated and trans fats in your diet',
        'Increase fiber intake with fruits, vegetables, and whole grains',
        'Exercise regularly (at least 150 minutes per week)',
        'Maintain a healthy weight',
        "Consider medication if lifestyle changes aren't sufficient",
      ],
      riskFactors: [
        'Family history of high cholesterol',
        'Poor diet high in saturated fats',
        'Lack of physical activity',
        'Obesity',
        'Smoking',
      ],
    },
    ldl_cholesterol: {
      description: 'LDL (low-density lipoprotein) cholesterol is often called "bad" cholesterol because it can build up in artery walls.',
      normalRange: 'Less than 100 mg/dL',
      optimalRange: 'Less than 70 mg/dL',
      whatItMeans: 'High LDL cholesterol is a major risk factor for heart disease and stroke. Lower levels are generally better for heart health.',
      recommendations: [
        'Follow a heart-healthy diet (DASH or Mediterranean)',
        'Limit red meat and full-fat dairy products',
        'Choose lean proteins and plant-based foods',
        'Exercise regularly',
        'Quit smoking if applicable',
      ],
      riskFactors: [
        'High saturated fat diet',
        'Lack of exercise',
        'Obesity',
        'Diabetes',
        'Family history',
      ],
    },
    glucose: {
      description: 'Fasting glucose measures your blood sugar level after not eating for at least 8 hours.',
      normalRange: '70-99 mg/dL',
      optimalRange: '70-85 mg/dL',
      whatItMeans: 'High fasting glucose can indicate prediabetes or diabetes. Maintaining healthy levels is crucial for overall health.',
      recommendations: [
        'Limit refined carbohydrates and sugary foods',
        'Eat regular, balanced meals',
        'Exercise regularly to improve insulin sensitivity',
        'Maintain a healthy weight',
        'Monitor blood sugar if recommended by your doctor',
      ],
      riskFactors: [
        'Family history of diabetes',
        'Obesity',
        'Physical inactivity',
        'Poor diet',
        'Age over 45',
      ],
    },
    creatinine: {
      description: 'Creatinine is a waste product filtered by the kidneys. Levels indicate how well your kidneys are functioning.',
      normalRange: '0.6-1.2 mg/dL (men), 0.5-1.1 mg/dL (women)',
      optimalRange: '0.7-1.0 mg/dL',
      whatItMeans: "High creatinine levels may indicate kidney problems. It's important to monitor kidney function regularly.",
      recommendations: [
        'Stay well hydrated',
        'Follow a kidney-friendly diet if recommended',
        'Control blood pressure and diabetes',
        'Avoid excessive protein intake',
        'Regular check-ups with your doctor',
      ],
      riskFactors: [
        'Diabetes',
        'High blood pressure',
        'Heart disease',
        'Family history of kidney disease',
        'Age over 60',
      ],
    },
    hemoglobin: {
      description: "Hemoglobin is the protein in red blood cells that carries oxygen throughout your body. Levels reflect your blood's oxygen-carrying capacity and can indicate anemia or other conditions.",
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
        'High altitude residence (for high values)',
      ],
    },
    platelets: {
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
        'Bone marrow disorders (rare)',
      ],
    },
  };

  return details[id] || {
    description: 'This biomarker provides important information about your health status.',
    normalRange: 'Consult your healthcare provider',
    optimalRange: 'Consult your healthcare provider',
    whatItMeans: 'Your healthcare provider can explain what this result means for your health.',
    recommendations: ['Consult your healthcare provider for personalized recommendations'],
    riskFactors: ['Consult your healthcare provider for risk assessment'],
  };
};

interface BiomarkerDetailsProps {
  details: BiomarkerDetail;
}

const BiomarkerDetails: React.FC<BiomarkerDetailsProps> = ({ details }) => (
  <>
    <View style={styles.modalSection}>
      <Text style={styles.sectionTitle}>What is this test?</Text>
      <Text style={styles.sectionContent}>{details.description}</Text>
    </View>

    <View style={styles.modalSection}>
      <Text style={styles.sectionTitle}>What this means for you:</Text>
      <Text style={styles.sectionContent}>{details.whatItMeans}</Text>
    </View>

    <View style={styles.modalSection}>
      <Text style={styles.sectionTitle}>Recommendations:</Text>
      {details.recommendations.map((rec, index) => (
        <View key={index} style={styles.recommendationItem}>
          <Ionicons name="arrow-forward" size={16} color="#007AFF" />
          <Text style={styles.recommendationText}>{rec}</Text>
        </View>
      ))}
    </View>

    <View style={[styles.modalSection, { borderBottomWidth: 0 }]}>
      <Text style={styles.sectionTitle}>Risk Factors:</Text>
      {details.riskFactors.map((factor, index) => (
        <View key={index} style={styles.riskItem}>
          <Ionicons name="warning" size={16} color="#FF9500" />
          <Text style={styles.riskText}>{factor}</Text>
        </View>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
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

export default BiomarkerDetails;
