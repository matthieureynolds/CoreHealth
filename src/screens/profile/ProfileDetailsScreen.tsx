import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';

type ProfileDetailsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const ProfileDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ProfileDetailsScreenNavigationProp>();
  const { user } = useAuth();
  const { profile } = useHealthData();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
        <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user && typeof (user as any).avatar === 'string' && (user as any).avatar.length > 0 ? (
            <Image source={{ uri: (user as any).avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{user?.displayName?.charAt(0) || 'U'}</Text>
            </View>
          )}
        </View>
        <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
      </View>

      {/* Profile Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>PERSONAL INFORMATION</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="person-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Basic Details</Text>
          <Text style={styles.cardValue}>{profile ? `${profile.age} years old, ${profile.gender}` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="fitness-outline" size={22} color="#4CD964" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Physical Stats</Text>
          <Text style={styles.cardValue}>{profile ? `${profile.height}cm, ${profile.weight}kg` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="location-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Ethnicity</Text>
          <Text style={styles.cardValue}>{profile?.ethnicity || 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Health Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>HEALTH PROFILE</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('MedicalHistory')}>
          <Ionicons name="medical-outline" size={22} color="#FF9500" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Medical History</Text>
          <Text style={styles.cardValue}>{profile?.medicalHistory?.length ? `${profile.medicalHistory.length} conditions` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('MedicalHistory')}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#6BCF7F" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Vaccinations</Text>
          <Text style={styles.cardValue}>{profile?.vaccinations?.length ? `${profile.vaccinations.length} vaccines` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('MedicalHistory')}>
          <Ionicons name="warning-outline" size={22} color="#FFD93D" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Allergies</Text>
          <Text style={styles.cardValue}>{profile?.allergies?.length ? `${profile.allergies.length} allergies` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('MedicalHistory')}>
          <Ionicons name="people-outline" size={22} color="#4ECDC4" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Family History</Text>
          <Text style={styles.cardValue}>{profile?.familyHistory?.length ? `${profile.familyHistory.length} conditions` : 'Not set'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>QUICK ACTIONS</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => {}}>
          <Ionicons name="add-circle-outline" size={22} color="#FF6B6B" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Add Medical Record</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => {}}>
          <Ionicons name="document-text-outline" size={22} color="#4ECDC4" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Generate Health Report</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => {}}>
          <Ionicons name="share-outline" size={22} color="#45B7D1" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Share with Doctor</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 0,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  editProfileText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#181818',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    color: '#888',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  cardIcon: {
    marginRight: 16,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  cardValue: {
    color: '#aaa',
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default ProfileDetailsScreen; 