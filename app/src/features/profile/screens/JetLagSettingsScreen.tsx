import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../../shared/context/SettingsContext';
import { UserSettings } from '../../../shared/types/settings';

export const JetLagSettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      Alert.alert('Success', 'Jet lag settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updateJetLagSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      travel: {
        ...prev.travel,
        jetLag: {
          ...prev.travel.jetLag,
          [key]: value,
        },
      },
    }));
  };

  const updateGuidanceOption = (key: string, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      travel: {
        ...prev.travel,
        jetLag: {
          ...prev.travel.jetLag,
          guidanceOptions: {
            ...prev.travel.jetLag.guidanceOptions,
            [key]: value,
          },
        },
      },
    }));
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      travel: {
        ...prev.travel,
        jetLag: {
          ...prev.travel.jetLag,
          notifications: {
            ...prev.travel.jetLag.notifications,
            [key]: value,
          },
        },
      },
    }));
  };

  const updatePrivacySetting = (key: string, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      travel: {
        ...prev.travel,
        jetLag: {
          ...prev.travel.jetLag,
          privacy: {
            ...prev.travel.jetLag.privacy,
            [key]: value,
          },
        },
      },
    }));
  };

  const renderChronotypeSelector = () => {
    const chronotypes = [
      { key: 'morning', label: 'Morning Person', description: 'Naturally early riser' },
      { key: 'neutral', label: 'Neutral', description: 'Flexible sleep schedule' },
      { key: 'evening', label: 'Evening Person', description: 'Naturally late sleeper' },
    ] as const;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chronotype</Text>
        <Text style={styles.sectionDescription}>
          Your natural sleep-wake preference affects how your circadian rhythm adjusts
        </Text>
        {chronotypes.map(({ key, label, description }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionCard,
              localSettings.travel.jetLag.chronotype === key && styles.selectedOption,
            ]}
            onPress={() => updateJetLagSetting('chronotype', key)}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionTitle,
                localSettings.travel.jetLag.chronotype === key && styles.selectedOptionText,
              ]}>
                {label}
              </Text>
              <Text style={[
                styles.optionDescription,
                localSettings.travel.jetLag.chronotype === key && styles.selectedOptionDescription,
              ]}>
                {description}
              </Text>
            </View>
            {localSettings.travel.jetLag.chronotype === key && (
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPlanStyleSelector = () => {
    const styles = [
      { key: 'gentle', label: 'Gentle', description: 'Slower adjustment, easier to follow' },
      { key: 'aggressive', label: 'Aggressive', description: 'Faster adjustment, more effective' },
    ] as const;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Plan Style</Text>
        <Text style={styles.sectionDescription}>
          How quickly your sleep schedule adjusts to new time zones
        </Text>
        {styles.map(({ key, label, description }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionCard,
              localSettings.travel.jetLag.defaultPlanStyle === key && styles.selectedOption,
            ]}
            onPress={() => updateJetLagSetting('defaultPlanStyle', key)}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionTitle,
                localSettings.travel.jetLag.defaultPlanStyle === key && styles.selectedOptionText,
              ]}>
                {label}
              </Text>
              <Text style={[
                styles.optionDescription,
                localSettings.travel.jetLag.defaultPlanStyle === key && styles.selectedOptionDescription,
              ]}>
                {description}
              </Text>
            </View>
            {localSettings.travel.jetLag.defaultPlanStyle === key && (
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderGuidanceOptions = () => {
    const options = [
      {
        key: 'caffeine',
        label: 'Caffeine Guidance',
        description: 'Show caffeine timing recommendations',
        icon: 'cafe-outline',
      },
      {
        key: 'melatonin',
        label: 'Melatonin Guidance',
        description: 'Show melatonin timing (not medical advice)',
        icon: 'medical-outline',
      },
      {
        key: 'naps',
        label: 'Nap Suggestions',
        description: 'Include strategic nap recommendations',
        icon: 'bed-outline',
      },
    ] as const;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guidance Options</Text>
        <Text style={styles.sectionDescription}>
          Choose which types of guidance to include in your plans
        </Text>
        {options.map(({ key, label, description, icon }) => (
          <View key={key} style={styles.toggleCard}>
            <View style={styles.toggleContent}>
              <Ionicons name={icon} size={20} color="#6b7280" />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>{label}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
              </View>
            </View>
            <Switch
              value={localSettings.travel.jetLag.guidanceOptions[key]}
              onValueChange={(value) => updateGuidanceOption(key, value)}
              trackColor={{ false: '#e5e7eb', true: '#059669' }}
              thumbColor="white"
            />
          </View>
        ))}
      </View>
    );
  };

  const renderNotificationSettings = () => {
    const notifications = [
      {
        key: 'actionReminders',
        label: 'Action Reminders',
        description: 'Notify me when it\'s time for plan actions',
      },
      {
        key: 'planUpdates',
        label: 'Plan Updates',
        description: 'Notify me when plans are updated',
      },
      {
        key: 'flightChanges',
        label: 'Flight Changes',
        description: 'Notify me about flight schedule changes',
      },
    ] as const;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.sectionDescription}>
          Choose which notifications you want to receive
        </Text>
        {notifications.map(({ key, label, description }) => (
          <View key={key} style={styles.toggleCard}>
            <View style={styles.toggleContent}>
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>{label}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
              </View>
            </View>
            <Switch
              value={localSettings.travel.jetLag.notifications[key]}
              onValueChange={(value) => updateNotificationSetting(key, value)}
              trackColor={{ false: '#e5e7eb', true: '#059669' }}
              thumbColor="white"
            />
          </View>
        ))}
      </View>
    );
  };

  const renderPrivacySettings = () => {
    const privacyOptions = [
      {
        key: 'sharePlans',
        label: 'Share Plans',
        description: 'Allow sharing jet lag plans with others',
      },
      {
        key: 'anonymizedData',
        label: 'Anonymized Data',
        description: 'Share anonymized data to improve recommendations',
      },
    ] as const;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.sectionDescription}>
          Control how your data is used and shared
        </Text>
        {privacyOptions.map(({ key, label, description }) => (
          <View key={key} style={styles.toggleCard}>
            <View style={styles.toggleContent}>
              <Ionicons name="shield-outline" size={20} color="#6b7280" />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>{label}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
              </View>
            </View>
            <Switch
              value={localSettings.travel.jetLag.privacy[key]}
              onValueChange={(value) => updatePrivacySetting(key, value)}
              trackColor={{ false: '#e5e7eb', true: '#059669' }}
              thumbColor="white"
            />
          </View>
        ))}
      </View>
    );
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderChronotypeSelector()}
        {renderPlanStyleSelector()}
        {renderGuidanceOptions()}
        {renderNotificationSettings()}
        {renderPrivacySettings()}
        
        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          <Text style={styles.disclaimerText}>
            Jet lag plans are for wellness purposes only and do not constitute medical advice. 
            Consult your healthcare provider for medical concerns.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    backgroundColor: 'white',
  },
  selectedOption: {
    borderColor: '#059669',
    backgroundColor: '#f0f9ff',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  selectedOptionText: {
    color: '#059669',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  selectedOptionDescription: {
    color: '#059669',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toggleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  saveContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
