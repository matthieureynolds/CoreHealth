import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../context/SettingsContext';

const DisplayFormatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateGeneralSettings } = useSettings();
  const [selectedUnits, setSelectedUnits] = useState(settings.general.units);
  const [selectedDateFormat, setSelectedDateFormat] = useState(settings.general.dateFormat);
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(settings.general.timeFormat);
  const [selectedLanguage, setSelectedLanguage] = useState(mapLanguageToCode(settings.general.language));
  const [showPicker, setShowPicker] = useState<string | null>(null);

  useEffect(() => {
    setSelectedUnits(settings.general.units);
    setSelectedDateFormat(settings.general.dateFormat);
    setSelectedTimeFormat(settings.general.timeFormat);
    setSelectedLanguage(mapLanguageToCode(settings.general.language));
  }, [settings.general]);

  function mapLanguageToCode(lang: string): string {
    switch (lang) {
      case 'English': return 'en';
      case 'Español': return 'es';
      case 'Français': return 'fr';
      case 'Deutsch': return 'de';
      case 'Italiano': return 'it';
      case 'Português': return 'pt';
      case 'Русский': return 'ru';
      case '中文': return 'zh';
      case '日本語': return 'ja';
      case '한국어': return 'ko';
      default: return 'en';
    }
  }

  function mapCodeToLanguage(code: string): string {
    switch (code) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      case 'de': return 'Deutsch';
      case 'it': return 'Italiano';
      case 'pt': return 'Português';
      case 'ru': return 'Русский';
      case 'zh': return '中文';
      case 'ja': return '日本語';
      case 'ko': return '한국어';
      default: return 'English';
    }
  }

  const unitsOptions = [
    { value: 'metric', label: 'Metric', description: 'Celsius, kg, cm' },
    { value: 'imperial', label: 'Imperial', description: 'Fahrenheit, lbs, ft' },
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', description: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', description: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', description: '2024-12-31' },
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12-Hour', description: '1:30 PM' },
    { value: '24h', label: '24-Hour', description: '13:30' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
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

  const getCurrentValue = (type: string) => {
    switch (type) {
      case 'theme': return settings.general.theme === 'dark' ? 'Dark' : 'Light';
      case 'units': return unitsOptions.find(opt => opt.value === selectedUnits)?.label || '';
      case 'dateFormat': return dateFormatOptions.find(opt => opt.value === selectedDateFormat)?.label || '';
      case 'timeFormat': return timeFormatOptions.find(opt => opt.value === selectedTimeFormat)?.label || '';
      case 'language': return languageOptions.find(opt => opt.value === selectedLanguage)?.label || '';
      default: return '';
    }
  };

  const getCurrentDescription = (type: string) => {
    switch (type) {
      case 'units': return unitsOptions.find(opt => opt.value === selectedUnits)?.description || '';
      case 'dateFormat': return dateFormatOptions.find(opt => opt.value === selectedDateFormat)?.description || '';
      case 'timeFormat': return timeFormatOptions.find(opt => opt.value === selectedTimeFormat)?.description || '';
      case 'language': return '';
      default: return '';
    }
  };

  const handleSelect = async (type: string, value: string) => {
    switch (type) {
      case 'theme':
        await updateGeneralSettings({ theme: value as any });
        break;
      case 'units':
        setSelectedUnits(value as 'metric' | 'imperial');
        await updateGeneralSettings({ units: value as any });
        break;
      case 'dateFormat':
        setSelectedDateFormat(value as any);
        await updateGeneralSettings({ dateFormat: value as any });
        break;
      case 'timeFormat':
        setSelectedTimeFormat(value as any);
        await updateGeneralSettings({ timeFormat: value as any });
        break;
      case 'language':
        setSelectedLanguage(value);
        await updateGeneralSettings({ language: mapCodeToLanguage(value) });
        break;
    }
    setShowPicker(null);
  };

  const getOptions = (type: string) => {
    switch (type) {
      case 'theme': return themeOptions;
      case 'units': return unitsOptions;
      case 'dateFormat': return dateFormatOptions;
      case 'timeFormat': return timeFormatOptions;
      case 'language': return languageOptions;
      default: return [];
    }
  };

  const formatItems = [
    {
      title: 'Theme',
      subtitle: 'Light or Dark appearance',
      icon: 'color-palette-outline',
      type: 'theme',
      value: getCurrentValue('theme'),
      description: '',
      color: '#8E44AD',
    },
    {
      title: 'Units',
      subtitle: 'Choose your preferred measurement system',
      icon: 'scale-outline',
      type: 'units',
      value: getCurrentValue('units'),
      description: getCurrentDescription('units'),
      color: '#FF9500',
    },
    {
      title: 'Date Format',
      subtitle: 'Select how dates are displayed',
      icon: 'calendar-outline',
      type: 'dateFormat',
      value: getCurrentValue('dateFormat'),
      description: getCurrentDescription('dateFormat'),
      color: '#34C759',
    },
    {
      title: 'Time Format',
      subtitle: 'Choose 12-hour or 24-hour time',
      icon: 'time-outline',
      type: 'timeFormat',
      value: getCurrentValue('timeFormat'),
      description: getCurrentDescription('timeFormat'),
      color: '#5856D6',
    },
    {
      title: 'Language',
      subtitle: 'Select your preferred language',
      icon: 'language-outline',
      type: 'language',
      value: getCurrentValue('language'),
      description: '',
      color: '#4CD964',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Display & Format</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>DISPLAY & FORMAT</Text>
        {formatItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.cardRow} onPress={() => setShowPicker(item.type)}>
            <Ionicons name={item.icon as any} size={22} color={item.color as any} style={styles.cardIcon} />
            <Text style={styles.cardLabel}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Picker Modal */}
      <Modal
        visible={showPicker !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPicker(null)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {showPicker === 'units' && 'Units'}
              {showPicker === 'dateFormat' && 'Date Format'}
              {showPicker === 'timeFormat' && 'Time Format'}
              {showPicker === 'language' && 'Language'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {showPicker && getOptions(showPicker).map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={() => handleSelect(showPicker, option.value)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {option.description && (
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  )}
                </View>
                {(showPicker === 'theme' && settings.general.theme === option.value) ||
                 (showPicker === 'units' && selectedUnits === option.value) ||
                 (showPicker === 'dateFormat' && selectedDateFormat === option.value) ||
                 (showPicker === 'timeFormat' && selectedTimeFormat === option.value) ||
                 (showPicker === 'language' && selectedLanguage === option.value) ? (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  cardValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  chevron: {
    marginLeft: 'auto',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
  },
});

export default DisplayFormatScreen; 