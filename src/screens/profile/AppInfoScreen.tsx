import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const AppInfoScreen: React.FC = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation();

  const appInfoItems = [
    {
      title: 'App Version',
      value: '1.0.0',
      icon: 'information-circle-outline',
      color: '#007AFF', // Keep this one blue
    },
    {
      title: 'Build Number',
      value: '2024.1.15',
      icon: 'code-outline',
      color: '#34C759', // Green for build
    },
    {
      title: 'Last Updated',
      value: 'January 15, 2024',
      icon: 'calendar-outline',
      color: '#FF9500', // Orange for calendar
    },
  ];

  const actionItems = [
    {
      title: 'Reset App',
      subtitle: 'Reset all app data and settings',
      icon: 'refresh-outline',
      color: '#FF9500',
      onPress: () => Alert.alert('Reset App', 'This will reset all app data. Continue?'),
    },
    {
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      color: '#FF3B30',
      onPress: () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]);
      },
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Info</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* About Card at Top */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>ABOUT</Text>
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={styles.aboutText}>
            CoreHealth is your comprehensive health companion, designed to help you track, understand, and
            optimize your health journey. Built with privacy and security at its core, CoreHealth provides
            personalized insights and actionable recommendations to support your wellness goals.
          </Text>
        </View>
      </View>

      {/* App Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>APP INFORMATION</Text>
        {appInfoItems.map((item, index) => (
          <View key={index} style={styles.cardRow}>
            <Ionicons name={item.icon as any} size={22} color={item.color} style={styles.cardIcon} />
            <Text style={styles.cardLabel}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Actions Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>ACTIONS</Text>
        {actionItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.cardRow} onPress={item.onPress}>
            <Ionicons name={item.icon as any} size={22} color={item.color} style={styles.cardIcon} />
            <Text style={[styles.cardLabel, { color: item.color }]}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>
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
  aboutText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});

export default AppInfoScreen; 