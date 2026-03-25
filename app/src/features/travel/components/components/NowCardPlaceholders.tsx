import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const NowCardLoading: React.FC = () => (
  <View style={styles.card}>
    <Text style={styles.loadingText}>Generating your plan...</Text>
  </View>
);

export const NowCardEmpty: React.FC = () => (
  <View style={styles.card}>
    <Ionicons name="airplane-outline" size={32} color="#6b7280" />
    <Text style={styles.noPlanTitle}>No Active Trip</Text>
    <Text style={styles.noPlanSubtitle}>
      Create a trip plan to get personalized jet lag guidance
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  noPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  noPlanSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
