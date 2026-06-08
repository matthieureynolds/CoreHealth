import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsHeader from '../../components/SettingsHeader';
import { SETTINGS_SCROLL_PT } from '../../components/settingsLayout';
import { NOTIFICATION_TIME_OPTIONS } from './constants';

type NotifItem = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  storageKey: string;
  alertsKey?: string;
  defaultAlerts?: string[];
};

const ITEMS: NotifItem[] = [
  { title: 'Supplements & Medication Reminders', subtitle: 'Reminders to take supplements or medications', icon: 'medical-outline', iconColor: '#FF9500', storageKey: '@notif_med_enabled', alertsKey: '@notif_med_alerts', defaultAlerts: ['30 minutes before'] },
  { title: 'Medical Appointments', subtitle: 'Reminders for upcoming appointments and health tests', icon: 'calendar-outline', iconColor: '#AF52DE', storageKey: '@notif_appt_enabled', alertsKey: '@notif_appt_alerts', defaultAlerts: ['1 hour before'] },
  { title: 'Monthly Health Summary', subtitle: 'Monthly overview of your health and insights', icon: 'bar-chart-outline', iconColor: '#34C759', storageKey: '@notif_monthly_enabled' },
  { title: 'Weekly Health Summary', subtitle: 'Weekly recap of your health progress', icon: 'trending-up-outline', iconColor: '#3AABF0', storageKey: '@notif_weekly_enabled' },
  { title: 'Sleep Reminders', subtitle: 'Bedtime reminders to improve your sleep', icon: 'bed-outline', iconColor: '#FF3B30', storageKey: '@notif_sleep_enabled', alertsKey: '@notif_sleep_alerts', defaultAlerts: ['30 minutes before bed'] },
];

const NotificationsScreen: React.FC = () => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<Record<string, string[]>>({});
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const enabledMap: Record<string, boolean> = {};
        const alertsMap: Record<string, string[]> = {};
        for (const item of ITEMS) {
          const val = await AsyncStorage.getItem(item.storageKey);
          enabledMap[item.storageKey] = val !== '0';
          if (item.alertsKey) {
            const al = await AsyncStorage.getItem(item.alertsKey);
            if (al) {
              const p = JSON.parse(al);
              alertsMap[item.alertsKey] = Array.isArray(p) && p.length ? p : (item.defaultAlerts || []);
            } else {
              alertsMap[item.alertsKey] = item.defaultAlerts || [];
            }
          }
        }
        setEnabled(enabledMap);
        setAlerts(alertsMap);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const toggleEnabled = async (key: string, value: boolean) => {
    setEnabled(prev => ({ ...prev, [key]: value }));
    await AsyncStorage.setItem(key, value ? '1' : '0');
    const item = ITEMS.find(i => i.storageKey === key);
    if (item?.alertsKey) {
      setExpandedKey(value ? key : null);
    }
  };

  const updateAlerts = async (alertsKey: string, newAlerts: string[]) => {
    setAlerts(prev => ({ ...prev, [alertsKey]: newAlerts }));
    await AsyncStorage.setItem(alertsKey, JSON.stringify(newAlerts));
  };

  const handleRowPress = (item: NotifItem) => {
    if (!item.alertsKey) return;
    setEditingIndex(null);
    setExpandedKey(expandedKey === item.storageKey ? null : item.storageKey);
  };

  return (
    <View style={styles.container}>
      <SettingsHeader title="Notifications" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: SETTINGS_SCROLL_PT }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>NOTIFICATION TYPES</Text>
          {ITEMS.map((item, index) => {
            const isEnabled = enabled[item.storageKey] !== false;
            const isExpanded = expandedKey === item.storageKey && isEnabled;
            const hasExtra = !!item.alertsKey;
            const itemAlerts = item.alertsKey ? (alerts[item.alertsKey] || item.defaultAlerts || []) : [];

            return (
              <View key={item.storageKey}>
                <TouchableOpacity
                  style={[styles.cardRow, !hasExtra && index === ITEMS.length - 1 && !isExpanded && styles.lastRow]}
                  onPress={() => handleRowPress(item)}
                  activeOpacity={hasExtra ? 0.7 : 1}
                >
                  <Ionicons name={item.icon} size={22} color={item.iconColor} style={styles.cardIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>{item.title}</Text>
                    <Text style={styles.cardSub}>{item.subtitle}</Text>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={(val) => toggleEnabled(item.storageKey, val)}
                    trackColor={{ false: '#333', true: '#3AABF0' }}
                    thumbColor="#FFFFFF"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>

                {isExpanded && item.alertsKey && (
                  <View style={styles.expandedSection}>
                    <View style={styles.alertList}>
                      {itemAlerts.map((alert, i) => (
                        <View key={i}>
                          <TouchableOpacity
                            style={styles.alertRow}
                            onPress={() => setEditingIndex(editingIndex === i ? null : i)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="time-outline" size={16} color="#8E8E93" style={{ marginRight: 10 }} />
                            <Text style={styles.alertRowText}>{alert}</Text>
                            {itemAlerts.length > 1 && (
                              <TouchableOpacity
                                onPress={() => updateAlerts(item.alertsKey!, itemAlerts.filter((_, idx) => idx !== i))}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Ionicons name="remove-circle-outline" size={18} color="#8E8E93" />
                              </TouchableOpacity>
                            )}
                          </TouchableOpacity>
                          {editingIndex === i && (
                            <View style={styles.timePickerList}>
                              {NOTIFICATION_TIME_OPTIONS.map(t => (
                                <TouchableOpacity
                                  key={t}
                                  style={styles.timeOption}
                                  onPress={() => {
                                    const newAlerts = [...itemAlerts];
                                    newAlerts[editingIndex] = t;
                                    updateAlerts(item.alertsKey!, newAlerts);
                                    setEditingIndex(null);
                                  }}
                                >
                                  <Text style={styles.timeOptionText}>{t}</Text>
                                  {itemAlerts[editingIndex] === t && <Ionicons name="checkmark" size={18} color="#3AABF0" />}
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                          {i < itemAlerts.length - 1 && <View style={styles.alertSeparator} />}
                        </View>
                      ))}
                      <View style={styles.alertSeparator} />
                      <TouchableOpacity
                        style={styles.addAlertRow}
                        onPress={() => updateAlerts(item.alertsKey!, [...itemAlerts, '1 hour before'])}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add-circle-outline" size={16} color="#3AABF0" style={{ marginRight: 10 }} />
                        <Text style={styles.addAlertText}>Add Alert</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {index < ITEMS.length - 1 && !isExpanded && <View style={styles.separator} />}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingTop: 16, overflow: 'hidden' },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  lastRow: { borderBottomWidth: 0 },
  separator: { height: 1, backgroundColor: '#2A2A2A', marginHorizontal: 20 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#8E8E93' },
  expandedSection: { paddingBottom: 4 },
  alertList: { borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  alertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 20 },
  alertRowText: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  alertSeparator: { height: 1, backgroundColor: '#2A2A2A', marginHorizontal: 20 },
  addAlertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 20 },
  addAlertText: { fontSize: 14, color: '#3AABF0' },
  timePickerList: { backgroundColor: '#2C2C2E', marginHorizontal: 20, borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  timeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#3A3A3C' },
  timeOptionText: { fontSize: 14, color: '#fff' },
});

export default NotificationsScreen;
