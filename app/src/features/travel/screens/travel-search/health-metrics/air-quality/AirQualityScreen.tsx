import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { metricScreenStyles as s } from '../metricScreenStyles';

const IMPACTS = ['Respiratory irritation with elevated pollutants', 'Aggravated asthma and lung conditions', 'Cardiovascular stress during prolonged exposure'];
const RECOMMENDATIONS = ['Check AQI before outdoor exercise', 'Wear N95 masks on poor air quality days', 'Keep windows closed when AQI > 100', 'Use HEPA air purifiers indoors', 'Avoid exercising near busy roads'];
const RISK_FACTORS = ['Pre-existing respiratory or cardiovascular conditions', 'Outdoor exercise during high pollution', 'Living near industrial areas or heavy traffic', 'Children and elderly are more vulnerable'];

const AirQualityScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">Air Quality</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Ionicons name="cloud-outline" size={36} color="#3AABF0" /></View>
          <Text style={s.heroTitle}>Air Quality Index (AQI)</Text>
          <Text style={s.heroDesc}>Measures concentrations of pollutants including particulate matter (PM2.5 / PM10), ozone, nitrogen dioxide, and sulfur dioxide.</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>AQI SCALE</Text>
          {[{ label: 'Good', range: '0–50', color: '#30D158' }, { label: 'Moderate', range: '51–100', color: '#FF9500' }, { label: 'Unhealthy (Sensitive)', range: '101–150', color: '#FF6B35' }, { label: 'Unhealthy', range: '151–200', color: '#FF3B30' }, { label: 'Hazardous', range: '201+', color: '#8B0000' }].map(r => (
            <View key={r.label} style={s.scaleRow}>
              <View style={[s.dot, { backgroundColor: r.color }]} />
              <Text style={styles.scaleLabel}>{r.label}</Text>
              <Text style={styles.scaleRange}>{r.range}</Text>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>HEALTH IMPACTS</Text>
          {IMPACTS.map((i, idx) => <View key={idx} style={s.row}><Ionicons name="alert-circle-outline" size={16} color="#3AABF0" /><Text style={s.rowText}>{i}</Text></View>)}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>RECOMMENDATIONS</Text>
          {RECOMMENDATIONS.map((r, idx) => <View key={idx} style={s.row}><Ionicons name="arrow-forward" size={16} color="#3AABF0" /><Text style={s.rowText}>{r}</Text></View>)}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>RISK FACTORS</Text>
          {RISK_FACTORS.map((r, idx) => <View key={idx} style={s.row}><Ionicons name="warning-outline" size={16} color="#FF9500" /><Text style={s.rowText}>{r}</Text></View>)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#3AABF030' },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#3AABF020', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scaleLabel: { fontSize: 14, color: '#fff', flex: 1 },
  scaleRange: { fontSize: 13, color: '#8E8E93' },
});

export default AirQualityScreen;
