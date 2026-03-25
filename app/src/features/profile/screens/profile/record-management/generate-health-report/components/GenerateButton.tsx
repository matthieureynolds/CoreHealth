import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GenerateButtonProps {
  isGenerating: boolean;
  disabled: boolean;
  onPress: () => void;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ isGenerating, disabled, onPress }) => (
  <View style={styles.generateSection}>
    <TouchableOpacity
      style={[styles.generateButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Ionicons name="document-text-outline" size={20} color="#fff" />
      )}
      <Text style={styles.generateButtonText}>
        {isGenerating ? 'Generating Report...' : 'Generate Health Report'}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  generateSection: {
    marginBottom: 32,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GenerateButton;
