import React, { useState } from 'react';
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

const DisplayFormatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedUnits, setSelectedUnits] = useState('metric');
  const [selectedDateFormat, setSelectedDateFormat] = useState('DD/MM/YYYY');
  const [selectedTimeFormat, setSelectedTimeFormat] = useState('12h');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showPicker, setShowPicker] = useState<string | null>(null);

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

  const handleSelect = (type: string, value: string) => {
    switch (type) {
      case 'units':
        setSelectedUnits(value);
        break;
      case 'dateFormat':
        setSelectedDateFormat(value);
        break;
      case 'timeFormat':
        setSelectedTimeFormat(value);
        break;
      case 'language':
        setSelectedLanguage(value);
        break;
    }
    setShowPicker(null);
  };

  const getOptions = (type: string) => {
    switch (type) {
      case 'units': return unitsOptions;
      case 'dateFormat': return dateFormatOptions;
      case 'timeFormat': return timeFormatOptions;
      case 'language': return languageOptions;
      default: return [];
    }
  };

  const formatItems = [
    {
      title: 'Units',
      subtitle: 'Choose your preferred measurement system',
      icon: 'scale-outline',
      type: 'units',
      value: getCurrentValue('units'),
      description: getCurrentDescription('units'),
    },
    {
      title: 'Date Format',
      subtitle: 'Select how dates are displayed',
      icon: 'calendar-outline',
      type: 'dateFormat',
      value: getCurrentValue('dateFormat'),
      description: getCurrentDescription('dateFormat'),
    },
    {
      title: 'Time Format',
      subtitle: 'Choose 12-hour or 24-hour time',
      icon: 'time-outline',
      type: 'timeFormat',
      value: getCurrentValue('timeFormat'),
      description: getCurrentDescription('timeFormat'),
    },
    {
      title: 'Language',
      subtitle: 'Select your preferred language',
      icon: 'language-outline',
      type: 'language',
      value: getCurrentValue('language'),
      description: '',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Display & Format</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {formatItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingsItem}
              onPress={() => setShowPicker(item.type)}
            >
              <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemValue}>{item.value}</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
                {(showPicker === 'units' && selectedUnits === option.value) ||
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
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