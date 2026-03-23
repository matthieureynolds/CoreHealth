import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../../../../shared/context/SettingsContext';

const DisplayFormatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateGeneralSettings } = useSettings();
  const [selectedUnits, setSelectedUnits] = useState(settings.general.units);
  const [selectedDateFormat, setSelectedDateFormat] = useState(settings.general.dateFormat);
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(settings.general.timeFormat);
  const [selectedLanguage, setSelectedLanguage] = useState(mapLanguageToCode(settings.general.language));
  const [showPicker, setShowPicker] = useState<string | null>(null);
  
  // Animated value for bottom sheet
  const pickerModalTranslateY = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    setSelectedUnits(settings.general.units);
    setSelectedDateFormat(settings.general.dateFormat);
    setSelectedTimeFormat(settings.general.timeFormat);
    setSelectedLanguage(mapLanguageToCode(settings.general.language));
  }, [settings.general]);

  // Animate bottom sheet when opening/closing
  useEffect(() => {
    if (showPicker !== null) {
      // Start from off-screen and slide up
      pickerModalTranslateY.setValue(1000);
      Animated.spring(pickerModalTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      pickerModalTranslateY.setValue(0);
    }
  }, [showPicker]);

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

  // Theme is fixed to Dark; no options rendered

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
      case 'theme': return 'Dark';
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
    Animated.timing(pickerModalTranslateY, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowPicker(null);
      pickerModalTranslateY.setValue(0);
    });
  };

  const handleClosePicker = () => {
    Animated.timing(pickerModalTranslateY, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowPicker(null);
      pickerModalTranslateY.setValue(0);
    });
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
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Display & Format</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={[styles.card, styles.cardTightBottom]}>
        <Text style={styles.cardHeader}>DISPLAY & FORMAT</Text>
        {formatItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cardRow,
              styles.tallRow50,
              index === formatItems.length - 1 ? styles.lastRow : null,
            ]}
            onPress={() => setShowPicker(item.type)}
          >
            <Ionicons name={item.icon as any} size={22} color={item.color as any} style={styles.cardIcon} />
            <Text style={styles.cardLabel}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Picker Modal - Modern Bottom Sheet Style */}
      <Modal
        visible={showPicker !== null}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={handleClosePicker}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleClosePicker}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheetContainer}>
            <Animated.View
              style={[
                styles.bottomSheetContent,
                {
                  transform: [{ translateY: pickerModalTranslateY }],
                },
              ]}
            >
              {/* Handle bar */}
              <View style={styles.bottomSheetHandleContainer}>
                <View style={styles.bottomSheetHandle} />
              </View>

              {/* Header */}
              <View style={styles.bottomSheetHeader} pointerEvents="box-none">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleClosePicker();
                  }}
                  style={styles.bottomSheetCloseButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.bottomSheetTitle}>
                  {showPicker === 'units' && 'Units'}
                  {showPicker === 'dateFormat' && 'Date Format'}
                  {showPicker === 'timeFormat' && 'Time Format'}
                  {showPicker === 'language' && 'Language'}
                </Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Options List */}
              <ScrollView
                style={styles.bottomSheetBody}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bottomSheetBodyContent}
              >
                {showPicker && showPicker !== 'theme' && getOptions(showPicker).map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => handleSelect(showPicker, option.value)}
                    activeOpacity={0.7}
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
                      <Ionicons name="checkmark" size={20} color="#34C759" />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: 23.5,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 32.2,
    paddingBottom: 8,
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
  cardTightBottom: {
    paddingBottom: 0,
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
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  tallRow50: {
    height: 50,
  },
  lastRow: {
    borderBottomWidth: 0,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  bottomSheetContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSheetHandleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  bottomSheetCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  bottomSheetBody: {
    flex: 0,
  },
  bottomSheetBodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
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