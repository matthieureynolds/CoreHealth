import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TravelStackParamList } from '../../../../../shared/types';

type Nav = StackNavigationProp<TravelStackParamList>;

type MetricItem = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  route: keyof TravelStackParamList;
};

const METRICS: MetricItem[] = [
  { title: 'Air Quality', subtitle: 'Pollutants, particulates & AQI score', icon: 'cloud-outline', iconColor: '#5AC8FA', route: 'AirQuality' },
  { title: 'Water Safety', subtitle: 'Drinking water quality & contamination', icon: 'water-outline', iconColor: '#007AFF', route: 'WaterSafety' },
  { title: 'UV Index', subtitle: 'Sunburn risk & sun protection guidance', icon: 'sunny-outline', iconColor: '#FF9500', route: 'UVIndex' },
  { title: 'Food Safety', subtitle: 'Food hygiene & traveler\'s risk', icon: 'restaurant-outline', iconColor: '#34C759', route: 'FoodSafety' },
  { title: 'Pollen', subtitle: 'Pollen count & allergy risk', icon: 'flower-outline', iconColor: '#AF52DE', route: 'PollenMetric' },
  { title: 'Altitude', subtitle: 'Elevation & acclimatization risk', icon: 'trending-up-outline', iconColor: '#FF6B35', route: 'Altitude' },
  { title: 'Disease Outbreaks', subtitle: 'Local infectious disease activity', icon: 'medkit-outline', iconColor: '#FF3B30', route: 'DiseaseOutbreak' },
];

const HealthMetricsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Health Metrics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 32 }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ENVIRONMENTAL HEALTH METRICS</Text>
          {METRICS.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.cardRow, index === METRICS.length - 1 && styles.lastRow]}
              onPress={() => navigation.navigate(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${item.iconColor}20` }]}>
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1 },
  header: { paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10 },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', position: 'absolute', left: 0, right: 0, paddingTop: 32.2, paddingBottom: 8 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, marginHorizontal: 20, marginTop: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  lastRow: { borderBottomWidth: 0 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  rowSub: { fontSize: 12, color: '#8E8E93' },
});

export default HealthMetricsScreen;
