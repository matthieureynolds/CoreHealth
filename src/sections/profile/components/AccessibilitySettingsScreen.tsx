import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';

const AccessibilitySettingsScreen: React.FC = () => {
  const { settings, updateAccessibilitySettings } = useSettings();
  const isDark = (settings.general.theme === 'dark');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#F8F9FA',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 12,
      backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#FFF' : '#1A1A1A',
      marginBottom: 0,
      marginTop: 0,
      textAlign: 'left',
    },
    section: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      marginTop: 20,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
      borderRadius: 16,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    settingsItem: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingsItemTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#FFF' : '#1A1A1A',
      marginLeft: 12,
    },
  });

  const SettingsItem = ({ icon, title, rightElement }: any) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
      {rightElement}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accessibility</Text>
      </View>
      <View style={styles.section}>
        <SettingsItem
          icon="text-outline"
          title="Font Size"
          rightElement={<Text style={styles.settingsItemTitle}>{settings.accessibility.fontSize}</Text>}
        />
        <SettingsItem
          icon="hand-left-outline"
          title="Haptic Feedback"
          rightElement={
            <Switch
              value={settings.accessibility.hapticFeedback}
              onValueChange={(value: boolean) => updateAccessibilitySettings({ hapticFeedback: value })}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <SettingsItem
          icon="contrast-outline"
          title="High Contrast"
          rightElement={
            <Switch
              value={settings.accessibility.highContrast}
              onValueChange={(value: boolean) => updateAccessibilitySettings({ highContrast: value })}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <SettingsItem
          icon="eye-off-outline"
          title="Reduce Motion"
          rightElement={
            <Switch
              value={settings.accessibility.reducedMotion}
              onValueChange={(value: boolean) => updateAccessibilitySettings({ reducedMotion: value })}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>
    </ScrollView>
  );
};

export default AccessibilitySettingsScreen; 