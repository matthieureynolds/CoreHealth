import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { metricScreenStyles as s } from '../metricScreenStyles';

const IMPACTS = ['Gastrointestinal illness from bacterial or chemical contamination', 'Dehydration if safe water is unavailable', 'Long-term effects from heavy metal exposure'];
const RECOMMENDATIONS = ['Drink bottled or filtered water when quality is poor', 'Use water purification tablets when travelling remotely', 'Avoid ice made from untreated tap water', 'Brush teeth with bottled water in high-risk areas', 'Boil water for at least 1 minute if unsure'];
const RISK_FACTORS = ['Travelling to regions with poor sanitation infrastructure', 'Immunocompromised individuals', 'Young children and infants', 'Consuming untreated or surface water'];

const WaterSafetyScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">Water Safety</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Ionicons name="water-outline" size={36} color="#007AFF" /></View>
          <Text style={s.heroTitle}>Water Quality</Text>
          <Text style={s.heroDesc}>Measures the safety of local water sources, including bacterial contamination, chemical pollutants, and mineral content.</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>QUALITY SCALE</Text>
          {[{ label: 'Excellent', color: '#30D158', note: '95–100 — No treatment needed' }, { label: 'Very Good', color: '#32D74B', note: '80–94 — Safe to drink' }, { label: 'Good', color: '#FF9500', note: '65–79 — Consider filtration' }, { label: 'Marginal', color: '#FF6B35', note: '45–64 — Use filtered water' }, { label: 'Poor', color: '#FF3B30', note: '0–44 — Do not drink tap water' }].map(r => (
            <View key={r.label} style={s.scaleRow}>
              <View style={[s.dot, { backgroundColor: r.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scaleLabel}>{r.label}</Text>
                <Text style={styles.scaleNote}>{r.note}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>HEALTH IMPACTS</Text>
          {IMPACTS.map((i, idx) => <View key={idx} style={s.row}><Ionicons name="alert-circle-outline" size={16} color="#007AFF" /><Text style={s.rowText}>{i}</Text></View>)}
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
  heroCard: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#007AFF30' },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#007AFF20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scaleLabel: { fontSize: 14, color: '#fff' },
  scaleNote: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
});

export default WaterSafetyScreen;
