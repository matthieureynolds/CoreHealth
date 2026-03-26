import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { metricScreenStyles as s } from '../metricScreenStyles';

const IMPACTS = ['Elevated infection risk in outbreak zones', 'Potential healthcare system strain in severe outbreaks', 'Cross-border spread risk for highly contagious diseases'];
const RECOMMENDATIONS = ['Keep routine vaccinations up to date before travel', 'Practice strict hand hygiene — wash or sanitize frequently', 'Avoid crowded indoor spaces during active outbreaks', 'Follow local health authority guidelines and advisories', 'Carry a basic medical kit including masks and hand sanitizer'];
const RISK_FACTORS = ['Immunocompromised individuals', 'Crowded transport hubs and accommodation', 'Low local vaccination coverage', 'Travel during peak transmission seasons'];
const RESOURCES = [
  { label: 'WHO Travel Advisories', url: 'https://www.who.int/emergencies/disease-outbreak-news' },
  { label: 'CDC Traveler\'s Health', url: 'https://wwwnc.cdc.gov/travel' },
  { label: 'ECDC Outbreak News', url: 'https://www.ecdc.europa.eu/en/threats-and-outbreaks' },
];

const DiseaseOutbreakScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">Disease Outbreaks</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Ionicons name="medkit-outline" size={36} color="#FF3B30" /></View>
          <Text style={s.heroTitle}>Disease Outbreaks</Text>
          <Text style={s.heroDesc}>Summarises notable infectious disease activity at your current or planned travel destination, based on public health surveillance data.</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>RISK LEVELS</Text>
          {[{ label: 'None (0–19)', color: '#30D158', note: 'No significant outbreaks — routine precautions' }, { label: 'Low (20–39)', color: '#32D74B', note: 'Minor activity — standard hygiene' }, { label: 'Moderate (40–59)', color: '#FF9500', note: 'Localised outbreaks — heightened awareness' }, { label: 'High (60–79)', color: '#FF6B35', note: 'Widespread activity — avoid if possible' }, { label: 'Severe (80–100)', color: '#FF3B30', note: 'Consider postponing non-essential travel' }].map(r => (
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
          {IMPACTS.map((i, idx) => <View key={idx} style={s.row}><Ionicons name="alert-circle-outline" size={16} color="#FF3B30" /><Text style={s.rowText}>{i}</Text></View>)}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>RECOMMENDATIONS</Text>
          {RECOMMENDATIONS.map((r, idx) => <View key={idx} style={s.row}><Ionicons name="arrow-forward" size={16} color="#3AABF0" /><Text style={s.rowText}>{r}</Text></View>)}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>RISK FACTORS</Text>
          {RISK_FACTORS.map((r, idx) => <View key={idx} style={s.row}><Ionicons name="warning-outline" size={16} color="#FF9500" /><Text style={s.rowText}>{r}</Text></View>)}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>HEALTH AUTHORITY RESOURCES</Text>
          {RESOURCES.map(res => (
            <TouchableOpacity key={res.url} style={styles.linkRow} onPress={() => Linking.openURL(res.url)}>
              <Ionicons name="open-outline" size={16} color="#3AABF0" />
              <Text style={styles.linkText}>{res.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#FF3B3030' },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF3B3020', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scaleLabel: { fontSize: 14, color: '#fff' },
  scaleNote: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  linkText: { fontSize: 14, color: '#3AABF0', marginLeft: 10, fontWeight: '500' },
});

export default DiseaseOutbreakScreen;
