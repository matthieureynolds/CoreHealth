import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import BiomarkerSummaryCard from '../../../../shared/components/BiomarkerSummaryCard';
import { colors } from '../../../../shared/theme/colors';

export default function BiomarkerDashboard() {
  const handleUpload = () => {
    Alert.alert(
      'Upload Lab Results',
      'This will open the lab results upload feature.',
      [{ text: 'OK' }]
    );
  };

  const handleFilterChange = (filter: string) => {
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <BiomarkerSummaryCard
        total={65}
        buckets={{ optimal: 52, sufficient: 10, out: 3 }}
        onUpload={handleUpload}
        onFilterChange={handleFilterChange}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 16,
  },
});
