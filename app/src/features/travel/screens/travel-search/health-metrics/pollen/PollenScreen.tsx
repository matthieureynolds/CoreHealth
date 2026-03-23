import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { metricScreenStyles as s } from '../metricScreenStyles';

const IMPACTS = ['Hay fever symptoms: sneezing, runny nose, itchy eyes', 'Asthma exacerbation in sensitive individuals', 'Skin reactions and contact dermatitis in rare cases'];
const RECOMMENDATIONS = ['Take antihistamines before peak pollen hours (morning)', 'Shower and change clothes after outdoor activities', 'Wear wraparound sunglasses outdoors', 'Keep windows closed on high pollen days', 'Use HEPA air purifiers indoors'];
const RISK_FACTORS = ['Seasonal allergies (allergic rhinitis)', 'Asthma or other respiratory conditions', 'Family history of allergies', 'Living in high-vegetation areas'];

const PollenScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">Pollen</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Ionicons name="flower-outline" size={36} color="#AF52DE" /></View>
          <Text style={s.heroTitle}>Pollen Count</Text>
          <Text style={s.heroDesc}>Measures the concentration of pollen grains (tree, grass, weed) per cubic metre of air. High counts trigger allergic reactions in sensitive individuals.</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>POLLEN SCALE (grains/m³)</Text>
          {[{ label: 'Very Low', range: '0–4', color: '#30D158' }, { label: 'Low', range: '5–9', color: '#32D74B' }, { label: 'Moderate', range: '10–49', color: '#FF9500' }, { label: 'High', range: '50–149', color: '#FF6B35' }, { label: 'Very High', range: '150+', color: '#FF3B30' }].map(r => (
            <View key={r.label} style={s.scaleRow}>
              <View style={[s.dot, { backgroundColor: r.color }]} />
              <Text style={styles.scaleLabel}>{r.label}</Text>
              <Text style={styles.scaleRange}>{r.range}</Text>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>HEALTH IMPACTS</Text>
          {IMPACTS.map((i, idx) => <View key={idx} style={s.row}><Ionicons name="alert-circle-outline" size={16} color="#AF52DE" /><Text style={s.rowText}>{i}</Text></View>)}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>RECOMMENDATIONS</Text>
          {RECOMMENDATIONS.map((r, idx) => <View key={idx} style={s.row}><Ionicons name="arrow-forward" size={16} color="#007AFF" /><Text style={s.rowText}>{r}</Text></View>)}
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
  heroCard: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#AF52DE30' },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#AF52DE20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scaleLabel: { fontSize: 14, color: '#fff', flex: 1 },
  scaleRange: { fontSize: 13, color: '#8E8E93' },
});

export default PollenScreen;
