import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavItem = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  route: string;
  storageKey: string;
};

const ITEMS: NavItem[] = [
  { title: 'Supplements & Medication Reminders', subtitle: 'Reminders to take supplements or medications', icon: 'medical-outline', iconColor: '#FF9500', route: 'SupplementsMedicationReminders', storageKey: '@notif_med_enabled' },
  { title: 'Medical Appointments', subtitle: 'Reminders for upcoming appointments and health tests', icon: 'calendar-outline', iconColor: '#AF52DE', route: 'MedicalAppointment', storageKey: '@notif_appt_enabled' },
  { title: 'Monthly Health Summary', subtitle: 'Monthly overview of your health and insights', icon: 'bar-chart-outline', iconColor: '#34C759', route: 'MonthlyHealthSummary', storageKey: '@notif_monthly_enabled' },
  { title: 'Weekly Health Summary', subtitle: 'Weekly recap of your health progress', icon: 'trending-up-outline', iconColor: '#007AFF', route: 'WeeklyHealthSummary', storageKey: '@notif_weekly_enabled' },
  { title: 'Sleep Reminders', subtitle: 'Bedtime reminders to improve your sleep', icon: 'bed-outline', iconColor: '#FF3B30', route: 'SleepReminders', storageKey: '@notif_sleep_enabled' },
];

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all(ITEMS.map(i => AsyncStorage.getItem(i.storageKey)));
        const map: Record<string, boolean> = {};
        ITEMS.forEach((item, idx) => { map[item.storageKey] = results[idx] !== '0'; });
        setStatuses(map);
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>NOTIFICATION TYPES</Text>
          {ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.cardRow, index === ITEMS.length - 1 && styles.lastRow]}
              onPress={() => (navigation as any).navigate(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={22} color={item.iconColor} style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.subtitle}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: statuses[item.storageKey] !== false ? '#34C759' : '#555' }]} />
              <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 8 }} />
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
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  lastRow: { borderBottomWidth: 0 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#8E8E93' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});

export default NotificationsScreen;
