import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { metricScreenStyles as s } from '../metricScreenStyles';

const IMPACTS = ['Sunburn can occur within minutes at extreme UV levels', 'Cumulative UV exposure increases skin cancer risk', 'UV rays can cause eye damage and cataracts'];
const RECOMMENDATIONS = ['Apply SPF 30+ sunscreen every 2 hours outdoors', 'Wear protective clothing, hat and UV-blocking sunglasses', 'Seek shade between 10am and 4pm', 'Use SPF 50+ when UV Index is 8 or above', 'Reapply sunscreen after swimming or sweating'];
const RISK_FACTORS = ['Fair skin, light eyes, or red/blonde hair', 'History of sunburn or skin cancer', 'High altitude or equatorial locations', 'Reflective surfaces (snow, water, sand)'];

const UVIndexScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">UV Index</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Ionicons name="sunny-outline" size={36} color="#FF9500" /></View>
          <Text style={s.heroTitle}>UV Index</Text>
          <Text style={s.heroDesc}>The UV Index measures the strength of ultraviolet radiation reaching the Earth's surface and predicts sunburn risk for the average person.</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>UV INDEX SCALE</Text>
          {[{ label: 'Low', range: '0–2', color: '#30D158', note: 'Minimal protection needed' }, { label: 'Moderate', range: '3–5', color: '#FF9500', note: 'Some protection recommended' }, { label: 'High', range: '6–7', color: '#FF6B35', note: 'Protection essential' }, { label: 'Very High', range: '8–10', color: '#FF3B30', note: 'Extra protection required' }, { label: 'Extreme', range: '11+', color: '#8B0000', note: 'Stay out of direct sun' }].map(r => (
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
          {IMPACTS.map((i, idx) => <View key={idx} style={s.row}><Ionicons name="alert-circle-outline" size={16} color="#FF9500" /><Text style={s.rowText}>{i}</Text></View>)}
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
  heroCard: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#FF950030' },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF950020', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scaleLabel: { fontSize: 14, color: '#fff' },
  scaleNote: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
});

export default UVIndexScreen;
