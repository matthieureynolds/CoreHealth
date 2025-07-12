import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

interface MedicalEvent {
  id: string;
  type: 'appointment' | 'medication' | 'preventive' | 'reminder';
  title: string;
  subtitle: string;
  date: string;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'upcoming' | 'due' | 'overdue';
  icon: keyof typeof Ionicons.glyphMap;
  doctor?: {
    name: string;
    specialty: string;
    address: string;
    phone: string;
  };
  details?: string;
  history?: string;
}

interface MedicalTimelineProps {
  onEventPress?: (event: MedicalEvent) => void;
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ onEventPress }) => {
  // Mock data - in real app this would come from props or context
  const upcomingEvents: MedicalEvent[] = [
    {
      id: 'annual_physical',
      type: 'appointment',
      title: 'Annual Physical',
      subtitle: 'Dr. Sarah Chen, MD',
      date: 'Dec 15, 2024',
      time: '10:00 AM',
      priority: 'medium',
      status: 'upcoming',
      icon: 'medical',
      doctor: {
        name: 'Dr. Sarah Chen, MD',
        specialty: 'Internal Medicine',
        address: '123 Medical Center Dr, Suite 200, New York, NY 10001',
        phone: '(555) 123-4567'
      },
      details: 'Comprehensive annual physical examination including blood work, EKG, and health assessment.',
      history: 'Previous visits: Dec 2023, Dec 2022, Dec 2021. All visits showed good health status.'
    },
    {
      id: 'vitamin_d',
      type: 'medication',
      title: 'Vitamin D Supplement',
      subtitle: 'Take with breakfast',
      date: 'Today',
      time: '8:00 AM',
      priority: 'low',
      status: 'due',
      icon: 'medical-outline',
      details: '2000 IU daily supplement to maintain optimal vitamin D levels.'
    },
    {
      id: 'flu_shot',
      type: 'preventive',
      title: 'Flu Vaccination',
      subtitle: 'Annual immunization',
      date: 'This week',
      priority: 'high',
      status: 'due',
      icon: 'shield-checkmark',
      details: 'Annual flu shot to protect against seasonal influenza.'
    },
    {
      id: 'dental_cleaning',
      type: 'appointment',
      title: 'Dental Cleaning',
      subtitle: 'Dr. Michael Rodriguez, DDS',
      date: 'Dec 20, 2024',
      time: '2:00 PM',
      priority: 'medium',
      status: 'upcoming',
      icon: 'medical',
      doctor: {
        name: 'Dr. Michael Rodriguez, DDS',
        specialty: 'General Dentistry',
        address: '456 Dental Plaza, Floor 3, New York, NY 10002',
        phone: '(555) 987-6543'
      },
      details: 'Regular dental cleaning and examination.',
      history: 'Previous visits: Jun 2024, Dec 2023. Good oral health maintained.'
    },
    {
      id: 'cholesterol_check',
      type: 'reminder',
      title: 'Cholesterol Check',
      subtitle: 'Schedule lab work',
      date: 'Jan 2025',
      priority: 'medium',
      status: 'upcoming',
      icon: 'analytics',
      details: 'Blood test to check cholesterol levels and cardiovascular health markers.'
    }
  ];

  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const getEventColor = (event: MedicalEvent): string => {
    if (event.status === 'overdue') return '#FF3B30';
    if (event.status === 'due') return '#FF9F0A';
    
    switch (event.priority) {
      case 'high': return '#FF6B35';
      case 'medium': return '#007AFF';
      case 'low': return '#30D158';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'due': return 'Due';
      case 'overdue': return 'Overdue';
      case 'upcoming': return '';
      default: return '';
    }
  };

  const handleEventPress = (event: MedicalEvent) => {
    if (event.type === 'appointment') {
      setSelectedEvent(event);
      setShowEventModal(true);
    } else {
      onEventPress?.(event);
    }
  };

  const handleAddAppointment = () => {
    Alert.alert(
      'Add Appointment',
      'This would open a form to add a new appointment. In a real app, this would navigate to an appointment creation screen.',
      [{ text: 'OK' }]
    );
  };

  const renderRightActions = (event: MedicalEvent) => (
    <TouchableOpacity
      style={styles.doneButton}
      onPress={() => setCompleted(prev => [...prev, event.id])}
    >
      <Ionicons name="checkmark-circle" size={24} color="#30D158" />
      <Text style={styles.doneText}>Done</Text>
    </TouchableOpacity>
  );

  const renderEvent = (event: MedicalEvent) => {
    if (completed.includes(event.id)) return null;
    
    const eventColor = getEventColor(event);
    const statusText = getStatusText(event.status);

    return (
      <Swipeable key={event.id} renderRightActions={() => renderRightActions(event)}>
        <TouchableOpacity
          style={styles.eventItem}
          onPress={() => handleEventPress(event)}
          activeOpacity={0.7}
        >
          <View style={styles.eventLeft}>
            <View style={[styles.eventIconContainer, { backgroundColor: `${eventColor}20` }]}> 
              <Ionicons name={event.icon} size={18} color={eventColor} />
            </View>
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {statusText && (
                  <Text style={[styles.statusBadge, { color: eventColor }]}> {statusText} </Text>
                )}
              </View>
              <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
              <View style={styles.eventDateContainer}>
                <Text style={styles.eventDate}>{event.date}</Text>
                {event.time && (
                  <>
                    <Text style={styles.eventDateSeparator}>•</Text>
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderEventsByCategory = () => {
    const appointments = upcomingEvents.filter(e => e.type === 'appointment' && !completed.includes(e.id));
    const medications = upcomingEvents.filter(e => e.type === 'medication' && !completed.includes(e.id));
    const otherEvents = upcomingEvents.filter(e => 
      e.type !== 'appointment' && e.type !== 'medication' && !completed.includes(e.id)
    );

    return (
      <>
        {appointments.length > 0 && (
          <>
            <Text style={styles.categoryTitle}>Appointments</Text>
            {appointments.map(renderEvent)}
          </>
        )}
        
        {medications.length > 0 && (
          <>
            <Text style={styles.categoryTitle}>Medications & Supplements</Text>
            {medications.map(renderEvent)}
          </>
        )}
        
        {otherEvents.length > 0 && (
          <>
            <Text style={styles.categoryTitle}>Other</Text>
            {otherEvents.map(renderEvent)}
          </>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color="#007AFF" />
          <Text style={styles.title}>Medical Timeline</Text>
        </View>
      </View>

      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {renderEventsByCategory()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
          <Ionicons name="add" size={16} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Detail Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Appointment Details</Text>
            <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {selectedEvent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.appointmentCard}>
                <Text style={styles.appointmentTitle}>{selectedEvent.title}</Text>
                <Text style={styles.appointmentDateTime}>
                  {selectedEvent.date} at {selectedEvent.time}
                </Text>
              </View>

              {selectedEvent.doctor && (
                <View style={styles.doctorSection}>
                  <Text style={styles.sectionTitle}>Doctor Information</Text>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{selectedEvent.doctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{selectedEvent.doctor.specialty}</Text>
                    <Text style={styles.doctorAddress}>{selectedEvent.doctor.address}</Text>
                    <Text style={styles.doctorPhone}>{selectedEvent.doctor.phone}</Text>
                  </View>
                </View>
              )}

              {selectedEvent.details && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Appointment Details</Text>
                  <Text style={styles.detailsText}>{selectedEvent.details}</Text>
                </View>
              )}

              {selectedEvent.history && (
                <View style={styles.historySection}>
                  <Text style={styles.sectionTitle}>Visit History</Text>
                  <Text style={styles.historyText}>{selectedEvent.history}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  eventsList: {
    maxHeight: 300,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 12,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 68,
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  eventIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eventContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventSubtitle: {
    fontSize: 13,
    color: '#EBEBF5',
    marginBottom: 4,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  eventDateSeparator: {
    fontSize: 12,
    color: '#8E8E93',
    marginHorizontal: 6,
  },
  eventTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#007AFF20',
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  doneButton: {
    backgroundColor: '#30D158',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
    marginRight: 8,
  },
  doneText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  appointmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appointmentDateTime: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  doctorSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  doctorInfo: {
    gap: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  doctorAddress: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  doctorPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailsSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 14,
    color: '#EBEBF5',
    lineHeight: 20,
  },
  historySection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  historyText: {
    fontSize: 14,
    color: '#EBEBF5',
    lineHeight: 20,
  },
});

export default MedicalTimeline; 