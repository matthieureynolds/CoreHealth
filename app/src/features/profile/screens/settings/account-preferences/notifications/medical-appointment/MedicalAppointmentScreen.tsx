import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATION_TIME_OPTIONS } from '../constants';

const MedicalAppointmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [enabled, setEnabled] = useState(true);
  const [alerts, setAlerts] = useState<string[]>(['1 hour before']);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [en, al] = await Promise.all([
          AsyncStorage.getItem('@notif_appt_enabled'),
          AsyncStorage.getItem('@notif_appt_alerts'),
        ]);
        if (en !== null) setEnabled(en === '1');
        if (al) { const p = JSON.parse(al); if (Array.isArray(p) && p.length) setAlerts(p); }
      } catch {}
    })();
  }, []);

  useEffect(() => { AsyncStorage.setItem('@notif_appt_enabled', enabled ? '1' : '0'); }, [enabled]);
  useEffect(() => { AsyncStorage.setItem('@notif_appt_alerts', JSON.stringify(alerts)); }, [alerts]);

  const addAlert = () => setAlerts([...alerts, '1 day before']);
  const removeAlert = (i: number) => setAlerts(alerts.filter((_, idx) => idx !== i));
  const updateAlert = (i: number, value: string) => { const a = [...alerts]; a[i] = value; setAlerts(a); setEditingIndex(null); };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Medical Appointments</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.labelGroup}>
              <Ionicons name="calendar-outline" size={24} color="#AF52DE" style={{ marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Medical Appointments</Text>
                <Text style={styles.subtitle}>Get reminded about upcoming medical appointments and health tests</Text>
              </View>
            </View>
            <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: '#333', true: '#007AFF' }} thumbColor="#FFFFFF" />
          </View>

          {enabled && (
            <View style={styles.alertsSection}>
              <Text style={styles.alertsLabel}>Alerts</Text>
              {alerts.map((alert, i) => (
                <View key={i} style={styles.alertRow}>
                  <TouchableOpacity style={styles.alertPill} onPress={() => setEditingIndex(editingIndex === i ? null : i)}>
                    <Text style={styles.alertPillText}>{alert}</Text>
                  </TouchableOpacity>
                  {alerts.length > 1 && (
                    <TouchableOpacity onPress={() => removeAlert(i)} style={{ padding: 4 }}>
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {editingIndex !== null && (
                <View style={styles.timePickerList}>
                  {NOTIFICATION_TIME_OPTIONS.map(t => (
                    <TouchableOpacity key={t} style={styles.timeOption} onPress={() => updateAlert(editingIndex, t)}>
                      <Text style={styles.timeOptionText}>{t}</Text>
                      {alerts[editingIndex] === t && <Ionicons name="checkmark" size={18} color="#007AFF" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.addBtn} onPress={addAlert}>
                <Ionicons name="add" size={18} color="#0A84FF" />
                <Text style={styles.addBtnText}>Add Alert</Text>
              </TouchableOpacity>
            </View>
          )}
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
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', lineHeight: 20 },
  alertsSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#333' },
  alertsLabel: { fontSize: 16, color: '#fff', fontWeight: '500', marginBottom: 12 },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  alertPill: { flex: 1, backgroundColor: '#0A84FF14', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, borderWidth: 1, borderColor: '#0A84FF33', alignItems: 'center' },
  alertPillText: { fontSize: 14, color: '#0A84FF', fontWeight: '600' },
  timePickerList: { backgroundColor: '#2C2C2E', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  timeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#3A3A3C' },
  timeOptionText: { fontSize: 15, color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A84FF14', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#0A84FF33', marginTop: 8 },
  addBtnText: { color: '#0A84FF', fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

export default MedicalAppointmentScreen;
