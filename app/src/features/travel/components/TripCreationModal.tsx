import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Trip } from '../../../shared/types';
import { FlightLookupService } from '../../../shared/services/enhancedJetLagService';

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
      
      // Validate form
      if (!formData.origin_iata || !formData.dest_iata) {
        Alert.alert('Error', 'Please enter origin and destination airports');
        return;
      }

      if (formData.dep_local >= formData.arr_local) {
        Alert.alert('Error', 'Arrival time must be after departure time');
        return;
      }

      // Create trip object
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
        // Populate form with flight data
        setFormData(prev => ({
          ...prev,
          title: `${result.origin_iata} → ${result.dest_iata}`,
          origin_iata: result.origin_iata,
          dest_iata: result.dest_iata,
          dep_local: new Date(result.dep_local),
          arr_local: new Date(result.arr_local),
        }));
        
        // Switch to manual tab to show populated data
        setActiveTab('manual');
        Alert.alert('Success', 'Flight data loaded successfully!');
      } else {
        Alert.alert(
          'Flight Not Found',
          'We couldn\'t find that flight. Please enter the details manually.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enter Manually', onPress: () => setActiveTab('manual') }
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
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }
    
    if (selectedDate && showDatePicker) {
      if (showDatePicker === 'dep') {
        setFormData(prev => ({ ...prev, dep_local: selectedDate }));
      } else if (showDatePicker === 'arr') {
        setFormData(prev => ({ ...prev, arr_local: selectedDate }));
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Trip Plan</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
            onPress={() => setActiveTab('manual')}
          >
            <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
              Manual Entry
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'flight' && styles.activeTab]}
            onPress={() => setActiveTab('flight')}
          >
            <Text style={[styles.tabText, activeTab === 'flight' && styles.activeTabText]}>
              Flight Lookup
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'manual' ? (
            <>
              {/* Trip Title */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trip Title (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                  placeholder="e.g., Milan → Tokyo"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Airports */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Airports</Text>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Origin (IATA)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.origin_iata}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, origin_iata: text }))}
                      placeholder="MXP"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="characters"
                      maxLength={3}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Destination (IATA)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.dest_iata}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, dest_iata: text }))}
                      placeholder="HND"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="characters"
                      maxLength={3}
                    />
                  </View>
                </View>
              </View>

              {/* Times */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Schedule (Local Times)</Text>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Departure</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker('dep')}
                    >
                      <Text style={styles.dateButtonText}>
                        {formatDate(formData.dep_local)} {formatTime(formData.dep_local)}
                      </Text>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Arrival</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker('arr')}
                    >
                      <Text style={styles.dateButtonText}>
                        {formatDate(formData.arr_local)} {formatTime(formData.arr_local)}
                      </Text>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Flight Lookup */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Flight Details</Text>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Carrier</Text>
                    <TextInput
                      style={styles.input}
                      value={flightData.carrier}
                      onChangeText={(text) => setFlightData(prev => ({ ...prev, carrier: text }))}
                      placeholder="AF"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="characters"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Flight Number</Text>
                    <TextInput
                      style={styles.input}
                      value={flightData.number}
                      onChangeText={(text) => setFlightData(prev => ({ ...prev, number: text }))}
                      placeholder="128"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.lookupButtonContainer}>
                  <TouchableOpacity
                    style={[styles.lookupButton, isLoading && styles.disabledButton]}
                    onPress={handleFlightLookup}
                    disabled={isLoading}
                  >
                    <Ionicons name="search" size={16} color="white" />
                    <Text style={styles.lookupButtonText}>Lookup Flight</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalization</Text>
            
            {/* Sleep Window */}
            <View style={styles.preferenceRow}>
              <Text style={styles.label}>Usual Sleep Window</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    style={styles.input}
                    value={formData.prefs.sleep_window_local.start}
                    onChangeText={(text) => setFormData(prev => ({
                      ...prev,
                      prefs: {
                        ...prev.prefs,
                        sleep_window_local: { ...prev.prefs.sleep_window_local, start: text }
                      }
                    }))}
                    placeholder="23:30"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <TextInput
                    style={styles.input}
                    value={formData.prefs.sleep_window_local.end}
                    onChangeText={(text) => setFormData(prev => ({
                      ...prev,
                      prefs: {
                        ...prev.prefs,
                        sleep_window_local: { ...prev.prefs.sleep_window_local, end: text }
                      }
                    }))}
                    placeholder="07:00"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Chronotype */}
            <View style={styles.preferenceRow}>
              <Text style={styles.label}>Chronotype</Text>
              <View style={styles.chronotypeContainer}>
                {(['morning', 'neutral', 'evening'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chronotypeButton,
                      formData.prefs.chronotype === type && styles.activeChronotypeButton
                    ]}
                    onPress={() => setFormData(prev => ({
                      ...prev,
                      prefs: { ...prev.prefs, chronotype: type }
                    }))}
                  >
                    <Text style={[
                      styles.chronotypeText,
                      formData.prefs.chronotype === type && styles.activeChronotypeText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Plan Style */}
            <View style={styles.preferenceRow}>
              <Text style={styles.label}>Adjustment Style</Text>
              <View style={styles.styleContainer}>
                {(['gentle', 'aggressive'] as const).map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.styleButton,
                      formData.plan_style === style && styles.activeStyleButton
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, plan_style: style }))}
                  >
                    <Text style={[
                      styles.styleText,
                      formData.plan_style === style && styles.activeStyleText
                    ]}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Guidance Toggles */}
            <View style={styles.preferenceRow}>
              <Text style={styles.label}>Guidance Options</Text>
              {[
                { key: 'caffeine', label: 'Caffeine guidance' },
                { key: 'melatonin', label: 'Melatonin guidance' },
                { key: 'naps', label: 'Nap suggestions' },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={styles.toggleRow}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    prefs: {
                      ...prev.prefs,
                      [key]: !prev.prefs[key as keyof typeof prev.prefs]
                    }
                  }))}
                >
                  <Text style={styles.toggleLabel}>{label}</Text>
                  <Ionicons
                    name={formData.prefs[key as keyof typeof formData.prefs] ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={formData.prefs[key as keyof typeof formData.prefs] ? '#059669' : '#d1d5db'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Date Picker */}
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
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#059669',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  lookupButtonContainer: {
    marginTop: 16,
  },
  lookupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lookupButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  preferenceRow: {
    marginBottom: 20,
  },
  chronotypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chronotypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  activeChronotypeButton: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chronotypeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeChronotypeText: {
    color: 'white',
    fontWeight: '600',
  },
  styleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  activeStyleButton: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  styleText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeStyleText: {
    color: 'white',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#374151',
  },
});
