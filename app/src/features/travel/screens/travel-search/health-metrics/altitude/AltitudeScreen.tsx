import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { metricScreenStyles as s } from '../metricScreenStyles';

const IMPACTS = ['Acute Mountain Sickness (AMS): headache, nausea, fatigue', 'Reduced exercise tolerance and oxygen saturation', 'High Altitude Pulmonary Edema (HAPE) in rare severe cases', 'Sleep disruption and vivid dreams at altitude'];
const RECOMMENDATIONS = ['Ascend gradually — no more than 300–500m/day above 2500m', 'Hydrate well and avoid alcohol on first day', 'Rest for 24–48h before strenuous activity at altitude', 'Descend immediately if AMS symptoms worsen', 'Consider acetazolamide if prescribed by a doctor'];
const RISK_FACTORS = ['Rapid ascent to high altitude', 'History of altitude illness', 'Strenuous exercise immediately on arrival', 'Pre-existing heart or lung conditions'];

const AltitudeScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">Altitude</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Ionicons name="trending-up-outline" size={36} color="#FF6B35" /></View>
          <Text style={s.heroTitle}>Altitude Risk</Text>
          <Text style={s.heroDesc}>Assesses the physiological impact of your destination's elevation on oxygen availability, exercise tolerance, and acclimatization needs.</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>ALTITUDE ZONES</Text>
          {[{ label: 'Low', range: '< 1,500m', color: '#30D158', note: 'Minimal physiological impact' }, { label: 'Moderate', range: '1,500–2,500m', color: '#FF9500', note: 'May affect sleep and exercise' }, { label: 'High', range: '2,500–3,500m', color: '#FF6B35', note: 'AMS risk — gradual ascent needed' }, { label: 'Very High', range: '3,500–5,500m', color: '#FF3B30', note: 'Acclimatization essential' }, { label: 'Extreme', range: '> 5,500m', color: '#8B0000', note: 'Expert preparation required' }].map(r => (
            <View key={r.label} style={s.scaleRow}>
              <View style={[s.dot, { backgroundColor: r.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scaleLabel}>{r.label} ({r.range})</Text>
                <Text style={styles.scaleNote}>{r.note}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>HEALTH IMPACTS</Text>
          {IMPACTS.map((i, idx) => <View key={idx} style={s.row}><Ionicons name="alert-circle-outline" size={16} color="#FF6B35" /><Text style={s.rowText}>{i}</Text></View>)}
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
  heroCard: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B3530' },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF6B3520', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scaleLabel: { fontSize: 14, color: '#fff' },
  scaleNote: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
});

export default AltitudeScreen;
