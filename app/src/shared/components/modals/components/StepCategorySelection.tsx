import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SymptomCategory,
  PHYSICAL_SYMPTOM_CATEGORIES,
  MENTAL_SYMPTOM_CATEGORIES,
} from '../../../types/symptoms';

interface StepCategorySelectionProps {
  selectedType: 'physical' | 'mental' | null;
  onSelect: (category: SymptomCategory) => void;
}

const StepCategorySelection: React.FC<StepCategorySelectionProps> = ({ selectedType, onSelect }) => {
  if (!selectedType) {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Loading...</Text>
      </View>
    );
  }

  const categories = selectedType === 'physical' ? PHYSICAL_SYMPTOM_CATEGORIES : MENTAL_SYMPTOM_CATEGORIES;

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>No categories available</Text>
      </View>
    );
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select {selectedType} symptom</Text>

      <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { borderColor: category.color }]}
              onPress={() => onSelect(category)}
            >
              <Ionicons name={category.icon as any} size={24} color={category.color} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  categoriesContainer: {
    maxHeight: 400,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default StepCategorySelection;
