import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BiomarkerRangeIndicatorProps {
  referenceRange: string;
  value: number;
}

const BiomarkerRangeIndicator: React.FC<BiomarkerRangeIndicatorProps> = ({ referenceRange, value }) => {
  const rangeParts = referenceRange.split('-');
  const minRange = parseFloat(rangeParts[0]);
  const maxRange = parseFloat(rangeParts[1]);
  const currentValue = value;

  const extendedMin = minRange - (maxRange - minRange) * 0.5;
  const extendedMax = maxRange + (maxRange - minRange) * 0.5;
  const totalExtendedRange = extendedMax - extendedMin;

  const position = Math.max(0, Math.min(1, (currentValue - extendedMin) / totalExtendedRange));
  const normalStart = (minRange - extendedMin) / totalExtendedRange;
  const normalWidth = (maxRange - minRange) / totalExtendedRange;

  return (
    <View style={styles.rangeIndicator}>
      <Text style={styles.sectionTitle}>Range Indicator</Text>
      <View style={styles.rangeBarContainer}>
        <View style={styles.rangeBar}>
          <LinearGradient
            colors={['#FF3B30', '#FF9500', '#30D158', '#FF9500', '#FF3B30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rangeGradient}
          />
          <View style={[styles.normalRange, {
            left: `${normalStart * 100}%`,
            width: `${normalWidth * 100}%`,
          }]} />
          <View style={[styles.valueMarker, { left: `${position * 100}%` }]}>
            <View style={styles.markerDot} />
            <Text style={styles.markerValue}>{currentValue}</Text>
          </View>
        </View>
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>{Math.round(extendedMin)}</Text>
          <Text style={styles.rangeLabel}>Normal Range</Text>
          <Text style={styles.rangeLabel}>{Math.round(extendedMax)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rangeIndicator: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rangeBarContainer: {
    marginTop: 16,
  },
  rangeBar: {
    height: 12,
    borderRadius: 6,
    position: 'relative',
    overflow: 'visible',
  },
  rangeGradient: {
    height: '100%',
    borderRadius: 6,
  },
  normalRange: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: '#1C3A1C',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30D158',
  },
  valueMarker: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
    transform: [{ translateX: -15 }],
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  markerValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 2,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
});

export default BiomarkerRangeIndicator;
