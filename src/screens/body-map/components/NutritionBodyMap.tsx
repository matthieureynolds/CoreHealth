import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NutritionModal, { NutritionInfo } from '../../../components/common/NutritionModal';
import { getNutritionInfo } from '../../../data/nutritionDatabase';

interface NutritionItem {
  name: string;
  value: number;
  unit: string;
  range: string;
  status: 'normal' | 'low' | 'high' | 'deficient';
  category: 'vitamin' | 'mineral';
  description: string;
}

const nutritionData: NutritionItem[] = [
  // Vitamins
  {
    name: 'Vitamin A',
    value: 45,
    unit: 'μg/dL',
    range: '20-80',
    status: 'normal',
    category: 'vitamin',
    description: 'Important for vision, immune function, and cell growth',
  },
  {
    name: 'Vitamin D',
    value: 32,
    unit: 'ng/mL',
    range: '30-100',
    status: 'normal',
    category: 'vitamin',
    description: 'Essential for bone health and immune function',
  },
  {
    name: 'Vitamin E',
    value: 12.5,
    unit: 'mg/L',
    range: '5.5-17.0',
    status: 'normal',
    category: 'vitamin',
    description: 'Antioxidant that protects cells from damage',
  },
  {
    name: 'Vitamin K',
    value: 1.2,
    unit: 'ng/mL',
    range: '0.2-3.2',
    status: 'normal',
    category: 'vitamin',
    description: 'Essential for blood clotting and bone metabolism',
  },
  {
    name: 'Vitamin C',
    value: 0.8,
    unit: 'mg/dL',
    range: '0.4-2.0',
    status: 'normal',
    category: 'vitamin',
    description: 'Antioxidant that supports immune system and collagen synthesis',
  },
  {
    name: 'Vitamin B1 (Thiamine)',
    value: 85,
    unit: 'nmol/L',
    range: '70-180',
    status: 'normal',
    category: 'vitamin',
    description: 'Essential for energy metabolism and nerve function',
  },
  {
    name: 'Vitamin B2 (Riboflavin)',
    value: 120,
    unit: 'nmol/L',
    range: '100-300',
    status: 'normal',
    category: 'vitamin',
    description: 'Important for energy production and cellular growth',
  },
  {
    name: 'Vitamin B3 (Niacin)',
    value: 45,
    unit: 'mg/L',
    range: '30-70',
    status: 'normal',
    category: 'vitamin',
    description: 'Supports cardiovascular health and energy metabolism',
  },
  {
    name: 'Vitamin B5 (Pantothenic Acid)',
    value: 2.1,
    unit: 'mg/L',
    range: '1.5-3.0',
    status: 'normal',
    category: 'vitamin',
    description: 'Essential for hormone and cholesterol synthesis',
  },
  {
    name: 'Vitamin B6 (Pyridoxine)',
    value: 35,
    unit: 'nmol/L',
    range: '20-125',
    status: 'normal',
    category: 'vitamin',
    description: 'Important for brain development and immune function',
  },
  {
    name: 'Vitamin B7 (Biotin)',
    value: 450,
    unit: 'pg/mL',
    range: '200-1200',
    status: 'normal',
    category: 'vitamin',
    description: 'Essential for hair, skin, and nail health',
  },
  {
    name: 'Vitamin B9 (Folate)',
    value: 8.2,
    unit: 'ng/mL',
    range: '2.0-20.0',
    status: 'normal',
    category: 'vitamin',
    description: 'Critical for DNA synthesis and cell division',
  },
  {
    name: 'Vitamin B12',
    value: 450,
    unit: 'pg/mL',
    range: '200-900',
    status: 'normal',
    category: 'vitamin',
    description: 'Important for nerve function and red blood cell formation',
  },
  // Major Minerals
  {
    name: 'Calcium',
    value: 9.8,
    unit: 'mg/dL',
    range: '8.5-10.5',
    status: 'normal',
    category: 'mineral',
    description: 'Essential for bone health and muscle function',
  },
  {
    name: 'Magnesium',
    value: 2.1,
    unit: 'mg/dL',
    range: '1.7-2.2',
    status: 'normal',
    category: 'mineral',
    description: 'Involved in over 300 enzymatic reactions',
  },
  {
    name: 'Phosphorus',
    value: 3.5,
    unit: 'mg/dL',
    range: '2.5-4.5',
    status: 'normal',
    category: 'mineral',
    description: 'Essential for bone formation and energy storage',
  },
  {
    name: 'Potassium',
    value: 4.2,
    unit: 'mEq/L',
    range: '3.5-5.0',
    status: 'normal',
    category: 'mineral',
    description: 'Critical for heart function and muscle contractions',
  },
  {
    name: 'Sodium',
    value: 140,
    unit: 'mEq/L',
    range: '135-145',
    status: 'normal',
    category: 'mineral',
    description: 'Maintains fluid balance and nerve function',
  },
  {
    name: 'Chloride',
    value: 102,
    unit: 'mEq/L',
    range: '96-106',
    status: 'normal',
    category: 'mineral',
    description: 'Helps maintain acid-base balance',
  },
  {
    name: 'Sulfur',
    value: 1.2,
    unit: 'mg/dL',
    range: '0.8-1.6',
    status: 'normal',
    category: 'mineral',
    description: 'Important for protein structure and detoxification',
  },
  // Trace Minerals
  {
    name: 'Iron',
    value: 85,
    unit: 'μg/dL',
    range: '60-170',
    status: 'normal',
    category: 'mineral',
    description: 'Essential for oxygen transport and energy production',
  },
  {
    name: 'Zinc',
    value: 95,
    unit: 'μg/dL',
    range: '70-120',
    status: 'normal',
    category: 'mineral',
    description: 'Important for immune function and wound healing',
  },
  {
    name: 'Copper',
    value: 95,
    unit: 'μg/dL',
    range: '70-140',
    status: 'normal',
    category: 'mineral',
    description: 'Important for iron metabolism and connective tissue',
  },
  {
    name: 'Iodine',
    value: 15,
    unit: 'μg/dL',
    range: '4.5-25.0',
    status: 'normal',
    category: 'mineral',
    description: 'Essential for thyroid hormone production',
  },
  {
    name: 'Selenium',
    value: 120,
    unit: 'μg/L',
    range: '70-150',
    status: 'normal',
    category: 'mineral',
    description: 'Antioxidant that supports thyroid function',
  },
  {
    name: 'Manganese',
    value: 8.5,
    unit: 'μg/L',
    range: '4.0-15.0',
    status: 'normal',
    category: 'mineral',
    description: 'Important for bone formation and metabolism',
  },
  {
    name: 'Chromium',
    value: 0.15,
    unit: 'μg/L',
    range: '0.05-0.25',
    status: 'normal',
    category: 'mineral',
    description: 'Helps regulate blood sugar levels',
  },
  {
    name: 'Molybdenum',
    value: 2.5,
    unit: 'μg/L',
    range: '1.0-4.0',
    status: 'normal',
    category: 'mineral',
    description: 'Essential for enzyme function and detoxification',
  },
  {
    name: 'Fluoride',
    value: 0.8,
    unit: 'mg/L',
    range: '0.7-1.2',
    status: 'normal',
    category: 'mineral',
    description: 'Important for dental health and bone strength',
  },
];

interface NutritionBodyMapProps {
  onNutritionItemPress?: (item: NutritionItem) => void;
}

const { width, height } = Dimensions.get('window');

const NutritionBodyMap: React.FC<NutritionBodyMapProps> = ({
  onNutritionItemPress,
}) => {
  const [selectedNutrition, setSelectedNutrition] = useState<NutritionInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#30D158';
      case 'low':
        return '#FF9500';
      case 'high':
        return '#FF3B30';
      case 'deficient':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const vitamins = nutritionData.filter(item => item.category === 'vitamin');
  const majorMinerals = nutritionData.filter(item => 
    item.category === 'mineral' && 
    ['Calcium', 'Magnesium', 'Phosphorus', 'Potassium', 'Sodium', 'Chloride', 'Sulfur'].includes(item.name)
  );
  const traceMinerals = nutritionData.filter(item => 
    item.category === 'mineral' && 
    ['Iron', 'Zinc', 'Copper', 'Iodine', 'Selenium', 'Manganese', 'Chromium', 'Molybdenum', 'Fluoride'].includes(item.name)
  );

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition Profile</Text>
          <Text style={styles.subtitle}>
            Track your vitamin and mineral levels for optimal health
          </Text>
        </View>

        {/* Nutrition Table */}
        <View style={styles.nutritionTable}>
          {/* Vitamins Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vitamins</Text>
          </View>
          {/* Separator Line */}
          <View style={styles.separatorLine} />
          <View style={styles.biomarkerList}>
            {vitamins.map((item, index) => (
              <TouchableOpacity
                key={`vitamin-${index}`}
                style={styles.biomarkerItem}
                onPress={() => {
                  const nutritionInfo = getNutritionInfo(item.name);
                  if (nutritionInfo) {
                    setSelectedNutrition(nutritionInfo);
                    setModalVisible(true);
                  }
                }}
              >
                <View style={styles.biomarkerColumn1}>
                  <Text style={styles.biomarkerName}>{item.name}</Text>
                </View>
                <View style={styles.biomarkerColumn2}>
                  <Text style={[styles.biomarkerValue, { color: getStatusColor(item.status), fontWeight: 'bold' }]}>
                    {item.value} {item.unit}
                  </Text>
                </View>
                <View style={styles.biomarkerColumn3}>
                  <Text style={styles.biomarkerRange}>({item.range})</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Major Minerals Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Major Minerals</Text>
          </View>
          {/* Separator Line */}
          <View style={styles.separatorLine} />
          <View style={styles.biomarkerList}>
            {majorMinerals.map((item, index) => (
              <TouchableOpacity
                key={`major-${index}`}
                style={styles.biomarkerItem}
                onPress={() => {
                  const nutritionInfo = getNutritionInfo(item.name);
                  if (nutritionInfo) {
                    setSelectedNutrition(nutritionInfo);
                    setModalVisible(true);
                  }
                }}
              >
                <View style={styles.biomarkerColumn1}>
                  <Text style={styles.biomarkerName}>{item.name}</Text>
                </View>
                <View style={styles.biomarkerColumn2}>
                  <Text style={[styles.biomarkerValue, { color: getStatusColor(item.status), fontWeight: 'bold' }]}>
                    {item.value} {item.unit}
                  </Text>
                </View>
                <View style={styles.biomarkerColumn3}>
                  <Text style={styles.biomarkerRange}>({item.range})</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trace Minerals Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trace Minerals</Text>
          </View>
          {/* Separator Line */}
          <View style={styles.separatorLine} />
          <View style={styles.biomarkerList}>
            {traceMinerals.map((item, index) => (
              <TouchableOpacity
                key={`trace-${index}`}
                style={styles.biomarkerItem}
                onPress={() => {
                  const nutritionInfo = getNutritionInfo(item.name);
                  if (nutritionInfo) {
                    setSelectedNutrition(nutritionInfo);
                    setModalVisible(true);
                  }
                }}
              >
                <View style={styles.biomarkerColumn1}>
                  <Text style={styles.biomarkerName}>{item.name}</Text>
                </View>
                <View style={styles.biomarkerColumn2}>
                  <Text style={[styles.biomarkerValue, { color: getStatusColor(item.status), fontWeight: 'bold' }]}>
                    {item.value} {item.unit}
                  </Text>
                </View>
                <View style={styles.biomarkerColumn3}>
                  <Text style={styles.biomarkerRange}>({item.range})</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Nutrition Modal */}
      <NutritionModal
        visible={modalVisible}
        nutrition={selectedNutrition}
        onClose={() => {
          setModalVisible(false);
          setSelectedNutrition(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  nutritionTable: {
    gap: 24,
  },
  sectionHeader: {
    marginBottom: -12,
    marginTop: -16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginBottom: 0,
    marginTop: 0,
  },
  biomarkerList: {
    gap: 16,
    paddingBottom: 20,
  },
  biomarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    minHeight: 48,
  },
  biomarkerColumn1: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  biomarkerColumn2: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 10,
  },
  biomarkerColumn3: {
    flex: 1,
    alignItems: 'flex-end',
  },
  biomarkerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  biomarkerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  biomarkerRange: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
});

export default NutritionBodyMap;