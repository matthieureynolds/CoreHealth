import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Trip, PlanDay, NowCard } from '../../types';
import { EnhancedJetLagService } from '../../services/enhancedJetLagService';
import { NowCard as NowCardComponent } from '../../components/jetlag/NowCard';
import { PlanTimeline } from '../../components/jetlag/PlanTimeline';
import { TripCreationModal } from '../../components/jetlag/TripCreationModal';

export const EnhancedJetLagScreen: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [planDays, setPlanDays] = useState<PlanDay[]>([]);
  const [nowCard, setNowCard] = useState<NowCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load trips on mount
  useEffect(() => {
    loadTrips();
  }, []);

  // Update plan and now card when active trip changes
  useEffect(() => {
    if (activeTrip) {
      updatePlanAndNowCard(activeTrip);
    }
  }, [activeTrip]);

  // Update now card every minute for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTrip && planDays.length > 0) {
        const newNowCard = EnhancedJetLagService.generateNowCard(activeTrip, planDays);
        setNowCard(newNowCard);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeTrip, planDays]);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would load from Supabase
      // For now, we'll use mock data
      const mockTrips: Trip[] = [
        {
          id: '1',
          user_id: user?.id || 'mock-user',
          title: 'Milan → Tokyo',
          origin_iata: 'MXP',
          dest_iata: 'HND',
          dep_local: '2025-10-20T21:15:00.000Z',
          arr_local: '2025-10-21T17:45:00.000Z',
          origin_tz: 'Europe/Rome',
          dest_tz: 'Asia/Tokyo',
          dep_utc: '2025-10-20T19:15:00.000Z',
          arr_utc: '2025-10-21T08:45:00.000Z',
          tz_diff_hours: 7,
          direction: 'east',
          plan_style: 'aggressive',
          prefs: {
            sleep_window_local: { start: '23:30', end: '07:00' },
            chronotype: 'neutral',
            caffeine: true,
            melatonin: true,
            naps: false,
          },
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setTrips(mockTrips);
      
      // Set the first trip as active if none is selected
      if (!activeTrip && mockTrips.length > 0) {
        setActiveTrip(mockTrips[0]);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlanAndNowCard = (trip: Trip) => {
    try {
      const newPlanDays = EnhancedJetLagService.generatePlan(trip);
      const newNowCard = EnhancedJetLagService.generateNowCard(trip, newPlanDays);
      
      setPlanDays(newPlanDays);
      setNowCard(newNowCard);
    } catch (error) {
      console.error('Error generating plan:', error);
      Alert.alert('Error', 'Failed to generate plan');
    }
  };

  const handleCreateTrip = async (tripData: Partial<Trip>) => {
    try {
      setIsLoading(true);
      
      // Create new trip with proper timezone calculations
      const newTrip: Trip = {
        ...tripData,
        id: Date.now().toString(), // In production, use proper UUID
        user_id: user?.id || 'mock-user',
        dep_utc: tripData.dep_local || '',
        arr_utc: tripData.arr_local || '',
        tz_diff_hours: 0, // Calculate this based on timezones
        direction: 'east', // Calculate this based on timezone difference
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Trip;

      // Add to trips list
      setTrips(prev => [...prev, newTrip]);
      setActiveTrip(newTrip);
      
      Alert.alert('Success', 'Trip created successfully!');
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionComplete = () => {
    // In a real app, this would mark the action as complete
    Alert.alert('Action Completed', 'Great job following your jet lag plan!');
  };

  const handleSnooze = () => {
    // In a real app, this would snooze the reminder
    Alert.alert('Snoozed', 'Reminder will come back in 30 minutes');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTrips();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jet Lag Planner</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Now Card */}
        <NowCardComponent
          nowCard={nowCard}
          onActionComplete={handleActionComplete}
          onSnooze={handleSnooze}
          isLoading={isLoading}
        />

        {/* Active Trip Info */}
        {activeTrip && (
          <View style={styles.tripInfo}>
            <View style={styles.tripHeader}>
              <Text style={styles.tripTitle}>{activeTrip.title}</Text>
              <View style={styles.tripMeta}>
                <Text style={styles.tripDate}>
                  {formatDate(activeTrip.dep_local)} - {formatDate(activeTrip.arr_local)}
                </Text>
                <View style={[
                  styles.directionBadge,
                  { backgroundColor: activeTrip.direction === 'east' ? '#f59e0b' : '#6366f1' }
                ]}>
                  <Text style={styles.directionText}>
                    {activeTrip.direction === 'east' ? 'E' : 'W'} {Math.abs(activeTrip.tz_diff_hours)}h
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Trip Selector */}
        {trips.length > 1 && (
          <View style={styles.tripSelector}>
            <Text style={styles.selectorTitle}>Active Trip</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={[
                    styles.tripOption,
                    activeTrip?.id === trip.id && styles.activeTripOption,
                  ]}
                  onPress={() => setActiveTrip(trip)}
                >
                  <Text style={[
                    styles.tripOptionText,
                    activeTrip?.id === trip.id && styles.activeTripOptionText,
                  ]}>
                    {trip.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Plan Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Your Plan</Text>
          <PlanTimeline
            planDays={planDays}
            currentDay={getCurrentDate()}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="refresh" size={24} color="#059669" />
              <Text style={styles.actionButtonText}>Recalculate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={24} color="#6b7280" />
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share" size={24} color="#6b7280" />
              <Text style={styles.actionButtonText}>Share Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle" size={24} color="#6b7280" />
              <Text style={styles.actionButtonText}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Trip Creation Modal */}
      <TripCreationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTrip}
        userId={user?.id || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  tripInfo: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  directionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  tripSelector: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tripOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    backgroundColor: 'white',
  },
  activeTripOption: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  tripOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTripOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  timelineContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  quickActions: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
