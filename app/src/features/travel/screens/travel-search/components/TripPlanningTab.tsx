import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TravelStackParamList, SerializedTrip } from '../../../../../shared/types';
import { styles } from '../TravelScreen.styles';

type Nav = CompositeNavigationProp<
  StackNavigationProp<TravelStackParamList, 'TravelList'>,
  StackNavigationProp<RootStackParamList>
>;

interface Trip {
  id: string;
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  timezone: string;
  notes?: string;
  jetLagData?: any;
  isSequential?: boolean;
  previousTripImpact?: number;
  checklist?: {
    vaccines: Array<{ name: string; completed: boolean }>;
    medicines: Array<{ name: string; completed: boolean }>;
  };
  jetLagPlanner?: {
    departureTime: string;
    arrivalTime: string;
    outboundPlan: {
      direction: 'outbound';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
    returnPlan?: {
      direction: 'return';
      timezoneAdjustment: string;
      circadianPlan: Array<{ day: number; action: string; time: string }>;
    };
  };
}

function serializeTrip(t: Trip): SerializedTrip {
  return {
    id: t.id,
    departureLocation: t.departureLocation,
    destination: t.destination,
    departureDate: t.departureDate.toISOString(),
    returnDate: t.returnDate?.toISOString(),
    timezone: t.timezone,
    notes: t.notes,
    jetLagPlanner: t.jetLagPlanner,
  };
}

interface TripPlanningTabProps {
  trips: Trip[];
  tripModalTranslateY: Animated.Value;
  onOpenAddTrip: () => void;
}

const TripPlanningTab: React.FC<TripPlanningTabProps> = ({
  trips,
  tripModalTranslateY,
  onOpenAddTrip,
}) => {
  const navigation = useNavigation<Nav>();

  const handleOpenAddTrip = () => {
    tripModalTranslateY.setValue(1000);
    Animated.spring(tripModalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    onOpenAddTrip();
  };

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={[styles.content, styles.contentTrips]}>
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No trips planned</Text>
            <Text style={styles.emptyStateText}>
              Add your first trip to get personalized health recommendations
            </Text>
            <TouchableOpacity style={styles.addTripButton} onPress={handleOpenAddTrip}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addTripButtonText}>Add a Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tripsContainer}>
            <TouchableOpacity
              style={[styles.addTripButton, styles.addTripButtonTop]}
              onPress={handleOpenAddTrip}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addTripButtonText}>Add Another Trip</Text>
            </TouchableOpacity>

            {trips.map((trip) => {
              const tripLabel = `${trip.departureLocation} → ${trip.destination}`;
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.tripRowWrapper, styles.tripRowCompact]}
                  onPress={() => navigation.navigate('TripDetail', { trip: serializeTrip(trip) })}
                  activeOpacity={0.7}
                >
                  <View style={styles.tripRowTextWrap}>
                    <Text style={styles.tripRowTitle}>{tripLabel}</Text>
                    <Text style={styles.tripRowSubtitle}>Tap to see planning</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.tripRowChevron} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TripPlanningTab;
