import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  healthScore?: { overall?: number } | null;
  biomarkerCount?: number;
}

const HealthContextBar: React.FC<Props> = ({ healthScore, biomarkerCount }) => {
  if (!healthScore && (!biomarkerCount || biomarkerCount === 0)) return null;

  return (
    <View style={styles.healthContextContainer}>
      <Text style={styles.healthContextTitle}>Current Health Context</Text>
      <View style={styles.healthContextRow}>
        {healthScore?.overall && (
          <View style={styles.healthContextItem}>
            <Ionicons name="fitness" size={16} color="#3AABF0" />
            <Text style={styles.healthContextText}>Health Score: {healthScore.overall}</Text>
          </View>
        )}
        {biomarkerCount !== undefined && biomarkerCount > 0 && (
          <View style={styles.healthContextItem}>
            <Ionicons name="analytics" size={16} color="#3AABF0" />
            <Text style={styles.healthContextText}>{biomarkerCount} Biomarkers</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  healthContextContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  healthContextTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  healthContextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthContextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  healthContextText: {
    fontSize: 12,
    color: '#3AABF0',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default HealthContextBar;
