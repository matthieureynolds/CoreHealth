import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileHomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const profileSections = [
    {
      title: 'Personal Information',
      icon: 'person-outline',
      onPress: () => {
        // Navigate to personal info screen
      },
      description: 'Manage your personal details',
    },
    {
      title: 'Medical History',
      icon: 'medical-outline',
      onPress: () => {
        // Navigate to medical history
      },
      description: 'View and edit your medical records',
    },
    {
      title: 'Health IDs',
      icon: 'card-outline',
      onPress: () => {
        // Navigate to health IDs
      },
      description: 'Manage your health identification',
    },
    {
      title: 'Emergency Contacts',
      icon: 'call-outline',
      onPress: () => {
        // Navigate to emergency contacts
      },
      description: 'Set up emergency contact information',
    },
    {
      title: 'Health Report',
      icon: 'document-text-outline',
      onPress: () => {
        // Navigate to health report
      },
      description: 'Generate and share health reports',
    },
  ];

  const renderProfileItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.profileItem}
      onPress={item.onPress}
    >
      <View style={styles.profileItemContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.profileTitle}>{item.title}</Text>
          <Text style={styles.profileDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your personal health information
          </Text>
        </View>

        <View style={styles.profileSection}>
          {profileSections.map(renderProfileItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  profileSection: {
    paddingHorizontal: 20,
  },
  profileItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  profileItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
});

export default ProfileHomeScreen;
