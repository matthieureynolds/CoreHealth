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

const AppearanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState('auto');
  const [selectedFontSize, setSelectedFontSize] = useState('medium');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light', description: 'Use light theme always' },
    { value: 'dark', label: 'Dark', description: 'Use dark theme always' },
    { value: 'auto', label: 'Automatic', description: 'Match system setting' },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];

  const getCurrentTheme = () => {
    const theme = themeOptions.find(opt => opt.value === selectedTheme);
    return theme?.label || '';
  };

  const getCurrentFontSize = () => {
    const fontSize = fontSizeOptions.find(opt => opt.value === selectedFontSize);
    return fontSize?.label || '';
  };

  const appearanceItems = [
    {
      title: 'Theme',
      subtitle: 'Choose your preferred appearance',
      icon: 'color-palette-outline',
      value: getCurrentTheme(),
      onPress: () => setShowThemePicker(true),
    },
    {
      title: 'Font Size',
      subtitle: 'Adjust text size for better readability',
      icon: 'text-outline',
      value: getCurrentFontSize(),
      onPress: () => setShowFontPicker(true),
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
          <Text style={styles.headerTitle}>Appearance</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {appearanceItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemValue}>{item.value}</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Preview Section */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Sample Text</Text>
              <Text style={styles.previewSubtitle}>
                This is how your text will appear with the current settings.
              </Text>
              <View style={styles.previewMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Theme</Text>
                  <Text style={styles.metricValue}>{getCurrentTheme()}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Font Size</Text>
                  <Text style={styles.metricValue}>{getCurrentFontSize()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Theme Picker Modal */}
      <Modal
        visible={showThemePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowThemePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowThemePicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Theme</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {themeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={() => {
                  setSelectedTheme(option.value);
                  setShowThemePicker(false);
                }}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {selectedTheme === option.value && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Font Size Picker Modal */}
      <Modal
        visible={showFontPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFontPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFontPicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Font Size</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {fontSizeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={() => {
                  setSelectedFontSize(option.value);
                  setShowFontPicker(false);
                }}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </View>
                {selectedFontSize === option.value && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
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
  previewSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
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

export default AppearanceScreen; 