import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../../../../shared/types';
import { useSettings } from '../../../../../../shared/context/SettingsContext';
import { LifestyleSettings } from '../../../../../../shared/types/settings';
import SleepClockPicker from '../../../../../../shared/components/ui/SleepClockPicker';

type LifestyleInfoScreenNavigationProp = StackNavigationProp<ProfileTabParamList, 'LifestyleInfo'>;

const LifestyleInfoScreen: React.FC = () => {
  const navigation = useNavigation<LifestyleInfoScreenNavigationProp>();
  const { settings, updateSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  
  // Sleep clock picker state
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<LifestyleSettings>(settings.lifestyle);
  const [hasChanges, setHasChanges] = useState(false);

  // Handle sleep schedule change from clock picker
  const handleSleepScheduleChange = (wakeUpTime: string, bedTime: string) => {
    setFormData(prev => ({
      ...prev,
      sleepSchedule: {
        ...prev.sleepSchedule,
        wakeUpTime,
        bedTime,
      },
    }));
    setHasChanges(true);
    setShowSleepPicker(false);
  };

  // Save settings
  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateSettings('lifestyle', formData);
      setHasChanges(false);
      Alert.alert('Success', 'Lifestyle settings updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update lifestyle settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    setFormData(settings.lifestyle);
    setHasChanges(false);
    navigation.goBack();
  };

  // Format time for display
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with divider, back arrow, and save button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lifestyle Info</Text>
        {hasChanges ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Ionicons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              <Ionicons name="checkmark" size={24} color="#4CD964" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        {/* Sleep Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SLEEP SCHEDULE</Text>
          
          {/* Wake Up Time */}
          <TouchableOpacity 
            style={styles.cardRow} 
            onPress={() => setShowSleepPicker(true)}
          >
            <Ionicons name="sunny-outline" size={22} color="#FF9500" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Wake Up Time</Text>
            <Text style={styles.cardValue}>{formatTime(formData.sleepSchedule.wakeUpTime)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>

          {/* Bed Time */}
          <TouchableOpacity 
            style={[styles.cardRow, styles.lastRow]} 
            onPress={() => setShowSleepPicker(true)}
          >
            <Ionicons name="moon-outline" size={22} color="#5856D6" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Bed Time</Text>
            <Text style={styles.cardValue}>{formatTime(formData.sleepSchedule.bedTime)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sleep Clock Picker */}
      <SleepClockPicker
        visible={showSleepPicker}
        wakeUpTime={formData.sleepSchedule.wakeUpTime}
        bedTime={formData.sleepSchedule.bedTime}
        onConfirm={handleSleepScheduleChange}
        onCancel={() => setShowSleepPicker(false)}
      />
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#000000',
    zIndex: 1000,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 10,
    marginRight: 8,
  },
  saveButton: {
    padding: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#8E8E93',
    marginHorizontal: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#181818',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginBottom: 8,
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
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

export default LifestyleInfoScreen;
