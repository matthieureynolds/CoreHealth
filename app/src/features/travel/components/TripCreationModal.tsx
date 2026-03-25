import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Trip } from '../../../shared/types';
import { FlightLookupService } from '../../../shared/services/travel/enhancedJetLagService';
import TripModalHeader from './components/TripModalHeader';
import TripTabBar from './components/TripTabBar';
import ManualEntryStep from './components/ManualEntryStep';
import FlightLookupStep from './components/FlightLookupStep';
import TripPreferencesSection from './components/TripPreferencesSection';

interface TripCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (trip: Partial<Trip>) => void;
  userId: string;
}

interface TripFormData {
  title: string;
  origin_iata: string;
  dest_iata: string;
  dep_local: Date;
  arr_local: Date;
  plan_style: 'gentle' | 'aggressive';
  prefs: {
    sleep_window_local: { start: string; end: string };
    chronotype: 'morning' | 'neutral' | 'evening';
    caffeine: boolean;
    melatonin: boolean;
    naps: boolean;
  };
}

interface FlightLookupData {
  carrier: string;
  number: string;
  date: string;
}

export const TripCreationModal: React.FC<TripCreationModalProps> = ({
  visible,
  onClose,
  onSave,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'flight'>('manual');
  const [showDatePicker, setShowDatePicker] = useState<'dep' | 'arr' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    origin_iata: '',
    dest_iata: '',
    dep_local: new Date(),
    arr_local: new Date(),
    plan_style: 'gentle',
    prefs: {
      sleep_window_local: { start: '23:30', end: '07:00' },
      chronotype: 'neutral',
      caffeine: true,
      melatonin: false,
      naps: false,
    },
  });

  const [flightData, setFlightData] = useState<FlightLookupData>({
    carrier: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (!formData.origin_iata || !formData.dest_iata) {
        Alert.alert('Error', 'Please enter origin and destination airports');
        return;
      }
      if (formData.dep_local >= formData.arr_local) {
        Alert.alert('Error', 'Arrival time must be after departure time');
        return;
      }
      const trip: Partial<Trip> = {
        user_id: userId,
        title: formData.title || `${formData.origin_iata} → ${formData.dest_iata}`,
        origin_iata: formData.origin_iata.toUpperCase(),
        dest_iata: formData.dest_iata.toUpperCase(),
        dep_local: formData.dep_local.toISOString(),
        arr_local: formData.arr_local.toISOString(),
        plan_style: formData.plan_style,
        prefs: formData.prefs,
        status: 'draft',
      };
      onSave(trip);
      onClose();
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Error', 'Failed to save trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightLookup = async () => {
    if (!flightData.carrier || !flightData.number) {
      Alert.alert('Error', 'Please enter carrier and flight number');
      return;
    }
    try {
      setIsLoading(true);
      const result = await FlightLookupService.lookupFlight(
        flightData.carrier,
        flightData.number,
        flightData.date
      );
      if (result) {
        setFormData(prev => ({
          ...prev,
          title: `${result.origin_iata} → ${result.dest_iata}`,
          origin_iata: result.origin_iata,
          dest_iata: result.dest_iata,
          dep_local: new Date(result.dep_local),
          arr_local: new Date(result.arr_local),
        }));
        setActiveTab('manual');
        Alert.alert('Success', 'Flight data loaded successfully!');
      } else {
        Alert.alert(
          'Flight Not Found',
          "We couldn't find that flight. Please enter the details manually.",
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enter Manually', onPress: () => setActiveTab('manual') },
          ]
        );
      }
    } catch (error) {
      console.error('Flight lookup error:', error);
      Alert.alert('Error', 'Failed to lookup flight. Please try manual entry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(null);
    if (selectedDate && showDatePicker) {
      if (showDatePicker === 'dep') {
        setFormData(prev => ({ ...prev, dep_local: selectedDate }));
      } else if (showDatePicker === 'arr') {
        setFormData(prev => ({ ...prev, arr_local: selectedDate }));
      }
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date) => date.toLocaleDateString();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <TripModalHeader onClose={onClose} onSave={handleSave} isLoading={isLoading} />
        <TripTabBar activeTab={activeTab} onSelect={setActiveTab} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'manual' ? (
            <ManualEntryStep
              formData={{
                title: formData.title,
                origin_iata: formData.origin_iata,
                dest_iata: formData.dest_iata,
                dep_local: formData.dep_local,
                arr_local: formData.arr_local,
              }}
              onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
              onPickDate={setShowDatePicker}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ) : (
            <FlightLookupStep
              flightData={flightData}
              isLoading={isLoading}
              onUpdate={(updates) => setFlightData(prev => ({ ...prev, ...updates }))}
              onLookup={handleFlightLookup}
            />
          )}

          <TripPreferencesSection
            prefs={formData.prefs}
            planStyle={formData.plan_style}
            onUpdatePrefs={(updates) =>
              setFormData(prev => ({
                ...prev,
                prefs: { ...prev.prefs, ...updates },
              }))
            }
            onUpdatePlanStyle={(style) =>
              setFormData(prev => ({ ...prev, plan_style: style }))
            }
          />
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={showDatePicker === 'dep' ? formData.dep_local : formData.arr_local}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
