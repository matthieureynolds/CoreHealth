import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [supplementMedicationEnabled, setSupplementMedicationEnabled] = useState(true);
  const [medicalAppointmentsEnabled, setMedicalAppointmentsEnabled] = useState(true);
  const [monthlyHealthSummaryEnabled, setMonthlyHealthSummaryEnabled] = useState(true);
  const [weeklyHealthSummaryEnabled, setWeeklyHealthSummaryEnabled] = useState(true);
  const [sleepRemindersEnabled, setSleepRemindersEnabled] = useState(true);
  
  // Multiple alerts states
  const [medicationAlerts, setMedicationAlerts] = useState(['30 minutes before']);
  const [appointmentAlerts, setAppointmentAlerts] = useState(['1 hour before']);
  const [showMedicationTimePicker, setShowMedicationTimePicker] = useState(false);
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] = useState(false);
  const [editingAlertIndex, setEditingAlertIndex] = useState<number | null>(null);

  const timeOptions = [
    'At time of event',
    '5 minutes before',
    '10 minutes before',
    '15 minutes before',
    '30 minutes before',
    '1 hour before',
    '2 hours before',
    '1 day before',
    '2 days before',
    '1 week before',
  ];

  const handleAddAlert = (type: 'medication' | 'appointment') => {
    if (type === 'medication') {
      setMedicationAlerts([...medicationAlerts, '1 hour before']);
    } else {
      setAppointmentAlerts([...appointmentAlerts, '1 day before']);
    }
  };

  const handleRemoveAlert = (type: 'medication' | 'appointment', index: number) => {
    if (type === 'medication') {
      setMedicationAlerts(medicationAlerts.filter((_, i) => i !== index));
    } else {
      setAppointmentAlerts(appointmentAlerts.filter((_, i) => i !== index));
    }
  };

  const handleTimeSelection = (time: string, type: 'medication' | 'appointment') => {
    if (type === 'medication' && editingAlertIndex !== null) {
      const newAlerts = [...medicationAlerts];
      newAlerts[editingAlertIndex] = time;
      setMedicationAlerts(newAlerts);
    } else if (type === 'appointment' && editingAlertIndex !== null) {
      const newAlerts = [...appointmentAlerts];
      newAlerts[editingAlertIndex] = time;
      setAppointmentAlerts(newAlerts);
    }
    setShowMedicationTimePicker(false);
    setShowAppointmentTimePicker(false);
    setEditingAlertIndex(null);
  };

  const openTimePicker = (type: 'medication' | 'appointment', index: number) => {
    setEditingAlertIndex(index);
    if (type === 'medication') {
      setShowMedicationTimePicker(true);
    } else {
      setShowAppointmentTimePicker(true);
    }
  };

  const TimePickerModal = ({ 
    visible, 
    onClose, 
    onSelect, 
    currentValue, 
    title 
  }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (time: string) => void;
    currentValue: string;
    title: string;
  }) => {
    if (!visible) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <ScrollView style={styles.timeOptionsList}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={styles.timeOption}
                onPress={() => onSelect(time)}
              >
                <Text style={styles.timeOptionText}>{time}</Text>
                {currentValue === time && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Supplement & Medication Reminders */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Ionicons name="medical-outline" size={24} color="#FF9500" style={styles.notificationIcon} />
                <View style={styles.notificationDetails}>
                  <Text style={styles.notificationTitle}>Supplement & Medication Reminders</Text>
                  <Text style={styles.notificationSubtitle}>Get notified when it's time to take your supplements or medications</Text>
                </View>
              </View>
              <Switch 
                value={supplementMedicationEnabled} 
                onValueChange={setSupplementMedicationEnabled} 
                trackColor={{ false: '#333', true: '#007AFF' }} 
                thumbColor="#FFFFFF" 
              />
            </View>
            {supplementMedicationEnabled && (
              <View style={styles.alertsSection}>
                <Text style={styles.alertsLabel}>Alerts</Text>
                {medicationAlerts.map((alert, index) => (
                  <View key={index} style={styles.alertRow}>
                    <TouchableOpacity 
                      style={styles.alertTimeSelector}
                      onPress={() => openTimePicker('medication', index)}
                    >
                      <Text style={styles.alertTimeText}>{alert}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#888" />
                    </TouchableOpacity>
                    {medicationAlerts.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeAlertButton}
                        onPress={() => handleRemoveAlert('medication', index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addAlertButton}
                  onPress={() => handleAddAlert('medication')}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addAlertText}>Add Alert</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Medical Appointments */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Ionicons name="calendar-outline" size={24} color="#AF52DE" style={styles.notificationIcon} />
                <View style={styles.notificationDetails}>
                  <Text style={styles.notificationTitle}>Medical Appointments</Text>
                  <Text style={styles.notificationSubtitle}>Get reminded about upcoming medical appointments and health tests</Text>
                </View>
              </View>
              <Switch 
                value={medicalAppointmentsEnabled} 
                onValueChange={setMedicalAppointmentsEnabled} 
                trackColor={{ false: '#333', true: '#007AFF' }} 
                thumbColor="#FFFFFF" 
              />
            </View>
            {medicalAppointmentsEnabled && (
              <View style={styles.alertsSection}>
                <Text style={styles.alertsLabel}>Alerts</Text>
                {appointmentAlerts.map((alert, index) => (
                  <View key={index} style={styles.alertRow}>
                    <TouchableOpacity 
                      style={styles.alertTimeSelector}
                      onPress={() => openTimePicker('appointment', index)}
                    >
                      <Text style={styles.alertTimeText}>{alert}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#888" />
                    </TouchableOpacity>
                    {appointmentAlerts.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeAlertButton}
                        onPress={() => handleRemoveAlert('appointment', index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addAlertButton}
                  onPress={() => handleAddAlert('appointment')}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addAlertText}>Add Alert</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Monthly Health Summary */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Ionicons name="bar-chart-outline" size={24} color="#34C759" style={styles.notificationIcon} />
                <View style={styles.notificationDetails}>
                  <Text style={styles.notificationTitle}>Monthly Health Summary</Text>
                  <Text style={styles.notificationSubtitle}>Receive a monthly overview of your health</Text>
                </View>
              </View>
              <Switch 
                value={monthlyHealthSummaryEnabled} 
                onValueChange={setMonthlyHealthSummaryEnabled} 
                trackColor={{ false: '#333', true: '#007AFF' }} 
                thumbColor="#FFFFFF" 
              />
            </View>
          </View>

          {/* Weekly Health Summary */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Ionicons name="trending-up-outline" size={24} color="#007AFF" style={styles.notificationIcon} />
                <View style={styles.notificationDetails}>
                  <Text style={styles.notificationTitle}>Weekly Health Summary</Text>
                  <Text style={styles.notificationSubtitle}>Get a weekly summary of your health progress and insights</Text>
                </View>
              </View>
              <Switch 
                value={weeklyHealthSummaryEnabled} 
                onValueChange={setWeeklyHealthSummaryEnabled} 
                trackColor={{ false: '#333', true: '#007AFF' }} 
                thumbColor="#FFFFFF" 
              />
            </View>
          </View>

          {/* Sleep Reminders */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Ionicons name="bed-outline" size={24} color="#FF3B30" style={styles.notificationIcon} />
                <View style={styles.notificationDetails}>
                  <Text style={styles.notificationTitle}>Sleep Reminders</Text>
                  <Text style={styles.notificationSubtitle}>Get bedtime reminders 3 hours before your planned bedtime</Text>
                </View>
              </View>
              <Switch 
                value={sleepRemindersEnabled} 
                onValueChange={setSleepRemindersEnabled} 
                trackColor={{ false: '#333', true: '#007AFF' }} 
                thumbColor="#FFFFFF" 
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modals */}
      <TimePickerModal
        visible={showMedicationTimePicker}
        onClose={() => {
          setShowMedicationTimePicker(false);
          setEditingAlertIndex(null);
        }}
        onSelect={(time) => handleTimeSelection(time, 'medication')}
        currentValue={editingAlertIndex !== null ? medicationAlerts[editingAlertIndex] : ''}
        title="Medication Alert"
      />
      
      <TimePickerModal
        visible={showAppointmentTimePicker}
        onClose={() => {
          setShowAppointmentTimePicker(false);
          setEditingAlertIndex(null);
        }}
        onSelect={(time) => handleTimeSelection(time, 'appointment')}
        currentValue={editingAlertIndex !== null ? appointmentAlerts[editingAlertIndex] : ''}
        title="Appointment Alert"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  notificationIcon: {
    marginRight: 16,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  alertsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  alertsLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
  },
  alertTimeText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 8,
  },
  removeAlertButton: {
    padding: 4,
  },
  addAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF20',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addAlertText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  timeOptionsList: {
    maxHeight: 400,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default NotificationsScreen; 