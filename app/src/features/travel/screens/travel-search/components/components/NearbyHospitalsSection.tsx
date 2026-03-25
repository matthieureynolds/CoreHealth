import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../TravelScreen.styles';

interface NearbyHospitalsSectionProps {
  selectedLocation: string;
  getRowAnim: (key: string) => { opacity: Animated.Value; translate: Animated.Value };
  onOpenMaps: (destination: string) => void;
  onEmergencyContactPress: () => void;
}

const NearbyHospitalsSection: React.FC<NearbyHospitalsSectionProps> = ({
  selectedLocation,
  getRowAnim,
  onOpenMaps,
  onEmergencyContactPress,
}) => (
  <Animated.View
    style={[
      styles.hospitalsSection,
      {
        opacity: getRowAnim('hospitals').opacity,
        transform: [{ translateY: getRowAnim('hospitals').translate }],
      },
    ]}
  >
    <View style={styles.sectionGroupCard}>
      <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
      <TouchableOpacity style={styles.hospitalCard} onPress={() => onOpenMaps('Central Hospital')}>
        <View style={styles.hospitalHeader}>
          <Ionicons name="medical" size={20} color="#FF3B30" />
          <Text style={styles.hospitalTitle}>Central Hospital</Text>
          {selectedLocation === 'Current Location' && (
            <Text style={styles.hospitalDistance}>2.1km</Text>
          )}
        </View>
        <Text style={styles.hospitalInfo}>24/7 Emergency Services • ICU Available</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hospitalCard} onPress={() => onOpenMaps('City Medical Center')}>
        <View style={styles.hospitalHeader}>
          <Ionicons name="medical" size={20} color="#FF3B30" />
          <Text style={styles.hospitalTitle}>City Medical Center</Text>
          {selectedLocation === 'Current Location' && (
            <Text style={styles.hospitalDistance}>3.8km</Text>
          )}
        </View>
        <Text style={styles.hospitalInfo}>General Practice • Emergency Care</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hospitalCard} onPress={() => onOpenMaps('Emergency Clinic')}>
        <View style={styles.hospitalHeader}>
          <Ionicons name="medical" size={20} color="#FF3B30" />
          <Text style={styles.hospitalTitle}>Emergency Clinic</Text>
          {selectedLocation === 'Current Location' && (
            <Text style={styles.hospitalDistance}>4.2km</Text>
          )}
        </View>
        <Text style={styles.hospitalInfo}>Urgent Care • Walk-in Available</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hospitalCard} onPress={onEmergencyContactPress}>
        <View style={styles.hospitalHeader}>
          <Ionicons name="call" size={20} color="#FF3B30" />
          <Text style={styles.hospitalTitle}>Emergency Contact</Text>
          <Text style={styles.hospitalDistance}>112</Text>
        </View>
        <Text style={styles.hospitalInfo}>Tap to call emergency services</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
);

export default NearbyHospitalsSection;
