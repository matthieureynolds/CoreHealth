import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AnimatedRing, { RingMetric } from './components/AnimatedRing';
import MetricDetailModal from './components/MetricDetailModal';

interface SupportingRingsProps {
  recovery: number;
  biomarkers: number;
  lifestyle: number;
  onRingPress?: (ringId: string) => void;
}

const SupportingRings: React.FC<SupportingRingsProps> = ({
  recovery,
  biomarkers,
  lifestyle,
  onRingPress,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<RingMetric | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const animatedRecovery = useRef(new Animated.Value(0)).current;
  const animatedBiomarkers = useRef(new Animated.Value(0)).current;
  const animatedLifestyle = useRef(new Animated.Value(0)).current;

  const safeRecovery = recovery && recovery > 0 ? recovery : 85;
  const safeBiomarkers = biomarkers && biomarkers > 0 ? biomarkers : 75;
  const safeLifestyle = lifestyle && lifestyle > 0 ? lifestyle : 75;

  useEffect(() => {
    animatedRecovery.setValue(safeRecovery);
    animatedBiomarkers.setValue(safeBiomarkers);
    animatedLifestyle.setValue(safeLifestyle);
  }, [safeRecovery, safeBiomarkers, safeLifestyle]);

  const metrics: RingMetric[] = [
    { id: 'recovery', title: 'RECOVERY', value: safeRecovery, color: '#30D158', icon: 'refresh', subtitle: 'Sleep & HRV' },
    { id: 'biomarkers', title: 'BIOMARKERS', value: safeBiomarkers, color: '#007AFF', icon: 'water', subtitle: 'Lab Results' },
    { id: 'lifestyle', title: 'LIFESTYLE', value: safeLifestyle, color: '#FF9F0A', icon: 'fitness', subtitle: 'Activity & Habits' },
  ];

  const getAnimatedValue = (id: string): Animated.Value => {
    switch (id) {
      case 'recovery': return animatedRecovery;
      case 'biomarkers': return animatedBiomarkers;
      case 'lifestyle': return animatedLifestyle;
      default: return animatedRecovery;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.ringsRow}>
          {metrics.map((metric) => (
            <AnimatedRing
              key={metric.id}
              metric={metric}
              animatedValue={getAnimatedValue(metric.id)}
              onRingPress={onRingPress}
            />
          ))}
        </View>
      </View>

      <MetricDetailModal
        visible={modalVisible}
        metric={selectedMetric}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: 0,
  },
});

export default SupportingRings;
