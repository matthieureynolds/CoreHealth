import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../../../../../shared/context/SettingsContext';

const unitOptions = [
  { value: 'metric', label: 'Metric', description: 'Celsius, kg, cm' },
  { value: 'imperial', label: 'Imperial', description: 'Fahrenheit, lbs, ft' },
];

const dateOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', description: '31/12/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', description: '12/31/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', description: '2024-12-31' },
];

const timeOptions = [
  { value: '12h', label: '12-Hour', description: '1:30 PM' },
  { value: '24h', label: '24-Hour', description: '13:30' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

function mapLanguageToCode(lang: string): string {
  const match = languageOptions.find(o => o.label === lang);
  return match ? match.value : 'en';
}
function mapCodeToLanguage(code: string): string {
  const match = languageOptions.find(o => o.value === code);
  return match ? match.label : 'English';
}

type PickerType = 'units' | 'date' | 'time' | 'language' | null;

const DisplayFormatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateGeneralSettings } = useSettings();
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const translateY = useRef(new Animated.Value(1000)).current;

  const openPicker = (type: PickerType) => {
    setActivePicker(type);
    translateY.setValue(1000);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closePicker = () => {
    setActivePicker(null);
    translateY.setValue(1000);
  };

  const handleUnitSelect = async (value: string) => {
    await updateGeneralSettings({ units: value as any });
  };

  const handleDateSelect = async (value: string) => {
    await updateGeneralSettings({ dateFormat: value as any });
  };

  const handleTimeSelect = async (value: string) => {
    await updateGeneralSettings({ timeFormat: value as any });
  };

  const handleLanguageSelect = async (value: string) => {
    await updateGeneralSettings({ language: mapCodeToLanguage(value) });
  };

  const currentDateOption = dateOptions.find(o => o.value === settings.general.dateFormat);
  const currentTimeOption = timeOptions.find(o => o.value === settings.general.timeFormat);
  const currentLanguage = languageOptions.find(o => o.value === mapLanguageToCode(settings.general.language))?.label ?? 'English';

  const items = [
    {
      title: 'Units',
      icon: 'scale-outline' as const,
      color: '#FF9500',
      value: settings.general.units === 'metric' ? 'Metric' : 'Imperial',
      onPress: () => openPicker('units'),
    },
    {
      title: 'Date Format',
      icon: 'calendar-outline' as const,
      color: '#34C759',
      value: currentDateOption?.description || settings.general.dateFormat,
      onPress: () => openPicker('date'),
    },
    {
      title: 'Time Format',
      icon: 'time-outline' as const,
      color: '#5856D6',
      value: currentTimeOption?.description || settings.general.timeFormat,
      onPress: () => openPicker('time'),
    },
    {
      title: 'Language',
      icon: 'language-outline' as const,
      color: '#4CD964',
      value: currentLanguage,
      onPress: () => openPicker('language'),
    },
  ];

  const getPickerConfig = () => {
    switch (activePicker) {
      case 'units':
        return { title: 'Units', options: unitOptions, selected: settings.general.units, onSelect: handleUnitSelect, hasDescription: true };
      case 'date':
        return { title: 'Date Format', options: dateOptions, selected: settings.general.dateFormat, onSelect: handleDateSelect, hasDescription: true };
      case 'time':
        return { title: 'Time Format', options: timeOptions, selected: settings.general.timeFormat, onSelect: handleTimeSelect, hasDescription: true };
      case 'language':
        return { title: 'Language', options: languageOptions, selected: mapLanguageToCode(settings.general.language), onSelect: handleLanguageSelect, hasDescription: false };
      default:
        return null;
    }
  };

  const pickerConfig = getPickerConfig();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Display & Format</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DISPLAY & FORMAT</Text>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.cardRow, index === items.length - 1 && styles.lastRow]}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={22} color={item.color} style={styles.cardIcon} />
              <Text style={styles.cardLabel}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!activePicker} transparent animationType="none" onRequestClose={closePicker}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={closePicker}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
          <View style={styles.sheetContainer}>
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
              <View style={styles.handleContainer}><View style={styles.handle} /></View>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={closePicker} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>{pickerConfig?.title}</Text>
                <View style={{ width: 32 }} />
              </View>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
                {pickerConfig?.options.map((option: any) => (
                  <TouchableOpacity key={option.value} style={styles.optionRow} onPress={() => pickerConfig.onSelect(option.value)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.description && <Text style={styles.optionDesc}>{option.description}</Text>}
                    </View>
                    {pickerConfig.selected === option.value && <Ionicons name="checkmark" size={20} color="#34C759" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: '#000000', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10 },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', flex: 1 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', height: 50, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  lastRow: { borderBottomWidth: 0 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  cardValue: { fontSize: 14, color: '#8E8E93', marginRight: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handleContainer: { paddingVertical: 8, alignItems: 'center' },
  handle: { width: 40, height: 4, backgroundColor: '#3A3A3C', borderRadius: 2 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  closeBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', flex: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  optionLabel: { fontSize: 16, color: '#fff', marginBottom: 2 },
  optionDesc: { fontSize: 14, color: '#888' },
});

export default DisplayFormatScreen;
