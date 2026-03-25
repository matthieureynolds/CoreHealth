import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepTypeSelectionProps {
  onSelect: (type: 'physical' | 'mental') => void;
}

const StepTypeSelection: React.FC<StepTypeSelectionProps> = ({ onSelect }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>What would you like to log?</Text>

    <View style={styles.typeCards}>
      <TouchableOpacity
        style={[styles.typeCard, { backgroundColor: '#FF6B6B' }]}
        onPress={() => onSelect('physical')}
      >
        <Ionicons name="medical-outline" size={40} color="#FFFFFF" />
        <Text style={styles.typeCardTitle}>Physical Symptom</Text>
        <Text style={styles.typeCardSubtitle}>How your body feels right now</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.typeCard, { backgroundColor: '#5856D6' }]}
        onPress={() => onSelect('mental')}
      >
        <Ionicons name="heart-outline" size={40} color="#FFFFFF" />
        <Text style={styles.typeCardTitle}>Mental Symptom</Text>
        <Text style={styles.typeCardSubtitle}>How you're feeling emotionally</Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
  typeCards: {
    gap: 16,
  },
  typeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  typeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  typeCardSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});

export default StepTypeSelection;
