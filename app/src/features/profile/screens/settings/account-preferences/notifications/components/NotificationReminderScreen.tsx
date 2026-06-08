import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingsHeader from '../../../components/SettingsHeader';
import { SETTINGS_SCROLL_PT } from '../../../components/settingsLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATION_TIME_OPTIONS } from '../constants';

interface NotificationReminderScreenProps {
  headerTitle: string;
  enabledStorageKey: string;
  alertsStorageKey: string;
  defaultAlert: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
}

const NotificationReminderScreen: React.FC<NotificationReminderScreenProps> = ({
  headerTitle,
  enabledStorageKey,
  alertsStorageKey,
  defaultAlert,
  icon,
  iconColor,
  title,
  subtitle,
}) => {
  const [enabled, setEnabled] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([defaultAlert]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [en, al] = await Promise.all([
          AsyncStorage.getItem(enabledStorageKey),
          AsyncStorage.getItem(alertsStorageKey),
        ]);
        if (en !== null) setEnabled(en === '1');
        if (al) { const p = JSON.parse(al); if (Array.isArray(p) && p.length) setAlerts(p); }
      } catch (e) { console.error(e); }
    })();
  }, [enabledStorageKey, alertsStorageKey]);

  useEffect(() => { AsyncStorage.setItem(enabledStorageKey, enabled ? '1' : '0'); }, [enabled, enabledStorageKey]);
  useEffect(() => { AsyncStorage.setItem(alertsStorageKey, JSON.stringify(alerts)); }, [alerts, alertsStorageKey]);

  const addAlert = () => setAlerts([...alerts, '1 day before']);
  const removeAlert = (i: number) => setAlerts(alerts.filter((_, idx) => idx !== i));
  const updateAlert = (i: number, value: string) => { const a = [...alerts]; a[i] = value; setAlerts(a); setEditingIndex(null); };

  return (
    <View style={styles.container}>
      <SettingsHeader title={headerTitle} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.labelGroup}>
              <Ionicons name={icon} size={24} color={iconColor} style={{ marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>
            <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: '#333', true: '#3AABF0' }} thumbColor="#FFFFFF" />
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
                      {alerts[editingIndex] === t && <Ionicons name="checkmark" size={18} color="#3AABF0" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.addBtn} onPress={addAlert}>
                <Ionicons name="add" size={18} color="#3AABF0" />
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
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, margin: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', lineHeight: 20 },
  alertsSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#333' },
  alertsLabel: { fontSize: 16, color: '#fff', fontWeight: '500', marginBottom: 12 },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  alertPill: { flex: 1, backgroundColor: '#3AABF014', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, borderWidth: 1, borderColor: '#3AABF033', alignItems: 'center' },
  alertPillText: { fontSize: 14, color: '#3AABF0', fontWeight: '600' },
  timePickerList: { backgroundColor: '#2C2C2E', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  timeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#3A3A3C' },
  timeOptionText: { fontSize: 15, color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3AABF014', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#3AABF033', marginTop: 8 },
  addBtnText: { color: '#3AABF0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

export default NotificationReminderScreen;
