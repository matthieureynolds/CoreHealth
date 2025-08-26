import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));
  
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return 'checkmark-circle';
      case 'low':
        return 'warning';
      case 'high':
        return 'alert-circle';
      case 'deficient':
        return 'close-circle';
      default:
        return 'help-circle';
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

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    Animated.spring(panelAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleClosePanel = () => {
    Animated.spring(panelAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setSelectedCategory(null);
    });
  };

  const getCategoryData = (category: string) => {
    switch (category) {
      case 'vitamins':
        return vitamins;
      case 'majorMinerals':
        return majorMinerals;
      case 'traceMinerals':
        return traceMinerals;
      default:
        return [];
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'vitamins':
        return 'Vitamins';
      case 'majorMinerals':
        return 'Major Minerals';
      case 'traceMinerals':
        return 'Trace Minerals';
      default:
        return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vitamins':
        return 'leaf';
      case 'majorMinerals':
        return 'diamond';
      case 'traceMinerals':
        return 'diamond';
      default:
        return 'nutrition';
    }
  };

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

        {/* Category Cards */}
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('vitamins')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons name="leaf" size={32} color="#30D158" />
            </View>
            <Text style={styles.categoryTitle}>Vitamins</Text>
            <Text style={styles.categorySubtitle}>{vitamins.length} nutrients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('majorMinerals')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons name="diamond" size={32} color="#007AFF" />
            </View>
            <Text style={styles.categoryTitle}>Major Minerals</Text>
            <Text style={styles.categorySubtitle}>{majorMinerals.length} nutrients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('traceMinerals')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons name="diamond" size={32} color="#FF9500" />
            </View>
            <Text style={styles.categoryTitle}>Trace Minerals</Text>
            <Text style={styles.categorySubtitle}>{traceMinerals.length} nutrients</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Panel */}
      {selectedCategory && (
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
            <Text style={styles.panelTitle}>{getCategoryTitle(selectedCategory)}</Text>
            <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Text style={styles.panelSubtitle}>
            Essential {getCategoryTitle(selectedCategory).toLowerCase()} for optimal health
          </Text>

          <ScrollView
            style={styles.biomarkerScrollView}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.biomarkerList}>
              {getCategoryData(selectedCategory).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.biomarkerItem}
                  onPress={() => {
                    const nutritionInfo = getNutritionInfo(item.name);
                    if (nutritionInfo) {
                      setSelectedNutrition(nutritionInfo);
                      setModalVisible(true);
                    }
                  }}
                >
                  <Text style={styles.biomarkerName}>{item.name}</Text>
                  <Text style={[styles.biomarkerValue, { color: getStatusColor(item.status) }]}>
                    {item.value} {item.unit}
                  </Text>
                  <Text style={styles.biomarkerRange}>({item.range})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      )}

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
    backgroundColor: '#000000',
    position: 'relative',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
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
  categoriesContainer: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
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
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  panelSubtitle: {
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

export default NutritionBodyMap; 