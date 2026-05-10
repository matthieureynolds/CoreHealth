import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JetLagPlanningEvent } from '../../../../shared/types/jetlag';
import JetLagPlanningCard from '../jet-lag-planning/JetLagPlanningCard';
import EmptyState from '../../../../shared/components/feedback/EmptyState';

interface Facility {
  id: string;
  name: string;
  type: string;
  distance: string;
  travelTime: string;
}

interface Props {
  closestFacilities: Facility[];
  jetLagPlanningEvents: JetLagPlanningEvent[];
  onJetLagEventPress?: (event: JetLagPlanningEvent) => void;
  onTravelPress?: () => void;
  onShowLess: () => void;
  sectionTitleStyle: object;
}

const NearbyFacilitiesSection: React.FC<Props> = ({
  closestFacilities,
  jetLagPlanningEvents,
  onJetLagEventPress,
  onTravelPress,
  onShowLess,
  sectionTitleStyle,
}) => {
  const handleFacilityPress = (facility: Facility) => {
    Alert.alert(
      'Open Maps',
      `How would you like to navigate to ${facility.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apple Maps',
          onPress: () => {
            const destination = encodeURIComponent(facility.name);
            Linking.openURL(`http://maps.apple.com/?daddr=${destination}`);
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const destination = encodeURIComponent(facility.name);
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Nearby Medical Facilities */}
      <View style={{ marginTop: 17 }}>
        <Text style={sectionTitleStyle}>Nearby Medical Facilities</Text>
      </View>

      {closestFacilities.map(facility => (
        <TouchableOpacity
          key={facility.id}
          style={styles.facilityCard}
          onPress={() => handleFacilityPress(facility)}
        >
          <View style={styles.facilityIconContainer}>
            <Ionicons
              name={facility.type === 'Pharmacy' ? 'medkit' : facility.type === 'Hospital' ? 'business' : 'help-circle'}
              size={20}
              color="#30D158"
            />
          </View>
          <View style={styles.facilityInfo}>
            <Text style={styles.facilityName}>{facility.name}</Text>
            <Text style={styles.facilityDetails}>{facility.type} • {facility.distance}</Text>
          </View>
          <View style={styles.travelTimeContainer}>
            <Ionicons name="car" size={14} color="#8E8E93" />
            <Text style={styles.travelTime}>{facility.travelTime}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Jet Lag Planning */}
      <View style={{ marginTop: 17 }}>
        <Text style={sectionTitleStyle}>Jet Lag Planning</Text>
        {jetLagPlanningEvents.length > 0 ? (
          jetLagPlanningEvents.map((event, index) => (
            <JetLagPlanningCard
              key={event.id || index}
              event={event}
              onPress={() => onJetLagEventPress?.(event)}
            />
          ))
        ) : (
          <EmptyState
            icon="airplane-outline"
            title="No Upcoming Trips"
            subtitle="Add your travel plans to get personalized jet lag preparation schedules"
            buttonText="Add Trip"
            onButtonPress={onTravelPress}
            iconColor="#8E8E93"
            buttonColor="#3AABF0"
          />
        )}
      </View>

      <TouchableOpacity onPress={onShowLess} style={styles.lessTab}>
        <Text style={styles.lessTabText}>Show Less</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  facilityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#30D15820',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  facilityDetails: {
    color: '#8E8E93',
    fontSize: 12,
  },
  travelTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  lessTab: {
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 5.5,
  },
  lessTabText: {
    color: '#3AABF0',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default NearbyFacilitiesSection;
