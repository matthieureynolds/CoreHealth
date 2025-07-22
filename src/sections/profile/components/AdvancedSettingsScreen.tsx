import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';

const AdvancedSettingsScreen: React.FC = () => {
  const { testNotification, resetSettings } = useSettings();

  const handleTestNotification = async () => {
    await testNotification();
    Alert.alert('Test Sent', 'Check your notifications!');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset All Settings',
      'This will reset all settings to their default values. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetSettings },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 12,
      backgroundColor: '#F8F9FA',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#1A1A1A',
      marginBottom: 0,
      marginTop: 0,
      textAlign: 'left',
    },
    section: {
      backgroundColor: '#FFFFFF',
      marginTop: 20,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#E5E5EA',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    settingsItem: {
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: '#000',
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
      color: '#1A1A1A',
      marginLeft: 12,
    },
  });

  const SettingsItem = ({ icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Advanced</Text>
      </View>
      <View style={styles.section}>
        <SettingsItem
          icon="bug-outline"
          title="Test Notification"
          onPress={handleTestNotification}
        />
        <SettingsItem
          icon="refresh-outline"
          title="Reset All Settings"
          onPress={handleResetSettings}
        />
      </View>
    </ScrollView>
  );
};

export default AdvancedSettingsScreen; 