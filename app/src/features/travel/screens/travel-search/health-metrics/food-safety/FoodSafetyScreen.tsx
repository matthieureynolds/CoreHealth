import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { metricScreenStyles as s } from '../metricScreenStyles';

const IMPACTS = ["Traveller's diarrhea (most common travel illness)", 'Nausea, vomiting and stomach cramps', 'Dehydration, especially in hot climates', 'Foodborne illness from bacteria, viruses or parasites'];
const RECOMMENDATIONS = ['Eat freshly cooked, hot food from reputable venues', 'Avoid raw or undercooked meat and seafood', 'Use bottled or purified water for drinking and brushing teeth', 'Wash hands thoroughly before eating', 'Carry oral rehydration salts for emergencies'];
const RISK_FACTORS = ['Street food from low-hygiene environments', 'Compromised immune system', 'Consuming raw salads or unwashed fruit', 'Travelling to regions with poor sanitation'];

const FoodSafetyScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">Food Safety</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Ionicons name="restaurant-outline" size={36} color="#34C759" /></View>
          <Text style={s.heroTitle}>Food Safety</Text>
          <Text style={s.heroDesc}>Assesses local food hygiene standards, preparation practices, contamination risk and overall foodborne illness risk for travellers.</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>RISK LEVELS</Text>
          {[{ label: 'Good (70–100)', color: '#30D158', note: 'Low risk — standard precautions apply' }, { label: 'Moderate (40–69)', color: '#FF9500', note: 'Be selective; prefer cooked food' }, { label: 'Poor (0–39)', color: '#FF3B30', note: 'High risk — strict food safety required' }].map(r => (
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
          {IMPACTS.map((i, idx) => <View key={idx} style={s.row}><Ionicons name="alert-circle-outline" size={16} color="#34C759" /><Text style={s.rowText}>{i}</Text></View>)}
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
  heroCard: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#34C75930' },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#34C75920', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scaleLabel: { fontSize: 14, color: '#fff' },
  scaleNote: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
});

export default FoodSafetyScreen;
