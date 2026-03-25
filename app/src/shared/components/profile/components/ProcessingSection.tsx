import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProcessingSection: React.FC = () => (
  <View style={styles.processingSection}>
    <View style={styles.processingIcon}>
      <Ionicons name="scan" size={48} color="#007AFF" />
    </View>
    <Text style={styles.processingTitle}>Processing Document</Text>
    <Text style={styles.processingSubtitle}>
      AI is extracting data from your document...
    </Text>
  </View>
);

const styles = StyleSheet.create({
  processingSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingIcon: {
    marginBottom: 16,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ProcessingSection;
