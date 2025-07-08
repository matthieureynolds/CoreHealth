import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';

const ProfileDetailsScreen: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useHealthData();

  const ProfileItem = ({ icon, title, value, onPress }: any) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <Text style={styles.profileItemTitle}>{title}</Text>
      </View>
      <View style={styles.profileItemRight}>
        {value && <Text style={styles.profileItemValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0) || 'U'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <ProfileItem
          icon="person-outline"
          title="Basic Details"
          value={profile ? `${profile.age} years old, ${profile.gender}` : 'Not set'}
          onPress={() => {}}
        />
        <ProfileItem
          icon="fitness-outline"
          title="Physical Stats"
          value={profile ? `${profile.height}cm, ${profile.weight}kg` : 'Not set'}
          onPress={() => {}}
        />
        <ProfileItem
          icon="location-outline"
          title="Ethnicity"
          value={profile?.ethnicity || 'Not set'}
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Profile</Text>
        <ProfileItem
          icon="medical-outline"
          title="Medical History"
          value={
            profile?.medicalHistory.length
              ? `${profile.medicalHistory.length} conditions`
              : 'Not set'
          }
          onPress={() => {}}
        />
        <ProfileItem
          icon="shield-checkmark-outline"
          title="Vaccinations"
          value={
            profile?.vaccinations.length
              ? `${profile.vaccinations.length} vaccines`
              : 'Not set'
          }
          onPress={() => {}}
        />
        <ProfileItem
          icon="warning-outline"
          title="Allergies"
          value={
            profile?.allergies.length
              ? `${profile.allergies.length} allergies`
              : 'Not set'
          }
          onPress={() => {}}
        />
        <ProfileItem
          icon="people-outline"
          title="Family History"
          value={
            profile?.familyHistory.length
              ? `${profile.familyHistory.length} conditions`
              : 'Not set'
          }
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="heart" size={24} color="#FF3B30" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Overall Health Score</Text>
              <Text style={styles.summaryValue}>85/100</Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="pulse" size={24} color="#30D158" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Active Biomarkers</Text>
              <Text style={styles.summaryValue}>12 tracked</Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Last Check-up</Text>
              <Text style={styles.summaryValue}>2 months ago</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ProfileItem
          icon="add-circle-outline"
          title="Add Medical Record"
          onPress={() => {}}
        />
        <ProfileItem
          icon="document-text-outline"
          title="Generate Health Report"
          onPress={() => {}}
        />
        <ProfileItem
          icon="share-outline"
          title="Share with Doctor"
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 16,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryContent: {
    marginLeft: 16,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});

export default ProfileDetailsScreen; 