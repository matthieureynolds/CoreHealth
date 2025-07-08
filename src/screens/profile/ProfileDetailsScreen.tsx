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
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
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
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ProfileItem
          icon="fitness-outline"
          title="Physical Stats"
          value={profile ? `${profile.height}cm, ${profile.weight}kg` : 'Not set'}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ProfileItem
          icon="location-outline"
          title="Ethnicity"
          value={profile?.ethnicity || 'Not set'}
          onPress={() => navigation.navigate('EditProfile')}
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
          onPress={() => navigation.navigate('MedicalHistory')}
        />
        <ProfileItem
          icon="shield-checkmark-outline"
          title="Vaccinations"
          value={
            profile?.vaccinations.length
              ? `${profile.vaccinations.length} vaccines`
              : 'Not set'
          }
          onPress={() => navigation.navigate('MedicalHistory')}
        />
        <ProfileItem
          icon="warning-outline"
          title="Allergies"
          value={
            profile?.allergies.length
              ? `${profile.allergies.length} allergies`
              : 'Not set'
          }
          onPress={() => navigation.navigate('MedicalHistory')}
        />
        <ProfileItem
          icon="people-outline"
          title="Family History"
          value={
            profile?.familyHistory.length
              ? `${profile.familyHistory.length} conditions`
              : 'Not set'
          }
          onPress={() => navigation.navigate('MedicalHistory')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        
        {/* Fitness Trackers */}
        <ProfileItem
          icon="watch-outline"
          title="Apple Watch"
          value="Connected"
          onPress={() => {
            Alert.alert('Apple Watch', 'Device management coming soon!');
          }}
        />
        <ProfileItem
          icon="fitness-outline"
          title="Whoop 4.0"
          value="Not connected"
          onPress={() => {
            Alert.alert('Whoop 4.0', 'Device management coming soon!');
          }}
        />
        <ProfileItem
          icon="ellipse-outline"
          title="Oura Ring"
          value="Not connected"
          onPress={() => {
            Alert.alert('Oura Ring', 'Device management coming soon!');
          }}
        />
        <ProfileItem
          icon="speedometer-outline"
          title="Garmin"
          value="Not connected"
          onPress={() => {
            Alert.alert('Garmin', 'Device management coming soon!');
          }}
        />
        <ProfileItem
          icon="walk-outline"
          title="Fitbit"
          value="Not connected"
          onPress={() => {
            Alert.alert('Fitbit', 'Device management coming soon!');
          }}
        />
        
        {/* Health Monitoring */}
        <ProfileItem
          icon="scale-outline"
          title="Withings Body+"
          value="Not connected"
          onPress={() => {
            Alert.alert('Withings Body+', 'Device management coming soon!');
          }}
        />
        <ProfileItem
          icon="thermometer-outline"
          title="Withings Thermo"
          value="Not connected"
          onPress={() => {
            Alert.alert('Withings Thermo', 'Device management coming soon!');
          }}
        />
        <ProfileItem
          icon="heart-outline"
          title="KardiaMobile"
          value="Not connected"
          onPress={() => {
            Alert.alert('KardiaMobile', 'Device management coming soon!');
          }}
        />
        
        {/* Sleep & Recovery */}
        <ProfileItem
          icon="bed-outline"
          title="Eight Sleep Pod"
          value="Not connected"
          onPress={() => {
            Alert.alert('Eight Sleep Pod', 'Device management coming soon!');
          }}
        />
        
        {/* Oral Health */}
        <ProfileItem
          icon="medical-outline"
          title="Oral-B iO"
          value="Not connected"
          onPress={() => {
            Alert.alert('Oral-B iO', 'Device management coming soon!');
          }}
        />
        
        {/* Health Apps */}
        <ProfileItem
          icon="phone-portrait-outline"
          title="Apple Health"
          value="Connected"
          onPress={() => {
            Alert.alert('Apple Health', 'Device management coming soon!');
          }}
        />
        <ProfileItem
          icon="phone-portrait-outline"
          title="Samsung Health"
          value="Not connected"
          onPress={() => {
            Alert.alert('Samsung Health', 'Device management coming soon!');
          }}
        />
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