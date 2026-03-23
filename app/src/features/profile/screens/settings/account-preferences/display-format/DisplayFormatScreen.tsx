import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../../../../../shared/context/SettingsContext';

const DisplayFormatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings } = useSettings();

  const items = [
    {
      title: 'Units',
      icon: 'scale-outline' as const,
      color: '#FF9500',
      route: 'Units',
      value: settings.general.units === 'metric' ? 'Metric' : 'Imperial',
    },
    {
      title: 'Date Format',
      icon: 'calendar-outline' as const,
      color: '#34C759',
      route: 'DateFormat',
      value: settings.general.dateFormat,
    },
    {
      title: 'Time Format',
      icon: 'time-outline' as const,
      color: '#5856D6',
      route: 'TimeFormat',
      value: settings.general.timeFormat === '12h' ? '12-Hour' : '24-Hour',
    },
    {
      title: 'Language',
      icon: 'language-outline' as const,
      color: '#4CD964',
      route: 'Language',
      value: settings.general.language,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Display & Format</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DISPLAY & FORMAT</Text>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.cardRow, index === items.length - 1 && styles.lastRow]}
              onPress={() => (navigation as any).navigate(item.route)}
            >
              <Ionicons name={item.icon} size={22} color={item.color} style={styles.cardIcon} />
              <Text style={styles.cardLabel}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: { paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10 },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', position: 'absolute', left: 0, right: 0, paddingTop: 32.2, paddingBottom: 8 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', height: 50, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  lastRow: { borderBottomWidth: 0 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  cardValue: { fontSize: 14, color: '#8E8E93', marginRight: 8 },
});

export default DisplayFormatScreen;
