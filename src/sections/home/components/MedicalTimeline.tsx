import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

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
  location?: {
    name: string;
    address: string;
    phone: string;
    hours: string;
    cost: string;
  };
  details?: string;
  history?: string;
}

interface MedicalTimelineProps {
  onEventPress?: (event: MedicalEvent) => void;
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ onEventPress }) => {
  // Mock data
  const upcomingEvents: MedicalEvent[] = [
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
    },
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
    },
  ];

  const [completed, setCompleted] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    doctor: '',
    date: '',
    time: '',
    details: '',
    documents: [] as Array<{ uri: string; name: string; type: 'image' | 'document' }>
  });
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<Date | null>(null);

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
      case 'due': return 'DUE';
      case 'overdue': return 'OVERDUE';
      case 'upcoming': return '';
      default: return '';
    }
  };

  const renderEvent = (event: MedicalEvent) => {
    if (completed.includes(event.id)) return null;
    const eventColor = getEventColor(event);
    const statusText = getStatusText(event.status);
    return (
      <Swipeable key={event.id}>
        <TouchableOpacity style={styles.eventItem} onPress={() => setSelectedEvent(event)}>
        <View style={styles.eventLeft}>
          <View style={[styles.eventIconContainer, { backgroundColor: `${eventColor}20` }]}> 
            <Ionicons name={event.icon} size={18} color={eventColor} />
          </View>
          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {statusText && (
                  <Text style={[styles.statusBadge, { color: eventColor }]}>{statusText}</Text>
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

  // Group events by category
  const todayEvents = upcomingEvents.filter(e => e.date === 'Today');
  const thisWeekEvents = upcomingEvents.filter(e => e.date === 'This week');
  const futureEvents = upcomingEvents.filter(e => e.date !== 'Today' && e.date !== 'This week');

      return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color="#007AFF" />
          <Text style={styles.title}>Medical Timeline</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAllEvents(!showAllEvents)}>
          <Text style={styles.viewAllText}>{showAllEvents ? 'Show Less' : '+ More'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {todayEvents.length > 0 && (
            <>
              <Text style={styles.categoryTitle}>Today</Text>
              {todayEvents.map(renderEvent)}
            </>
          )}
          {thisWeekEvents.length > 0 && (
            <>
              <Text style={styles.categoryTitle}>This Week</Text>
              {thisWeekEvents.map(renderEvent)}
            </>
          )}
          {futureEvents.length > 0 && (
            <>
              <Text style={styles.categoryTitle}>Future</Text>
              {futureEvents.map(renderEvent)}
            </>
          )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={16} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Appointment</Text>
        </TouchableOpacity>
      </View>
      {/* Add Appointment Modal (simplified for brevity) */}
      <Modal visible={showAddModal} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Appointment</Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
      </Modal>
      {/* Event Detail Modal (simplified for brevity) */}
      <Modal visible={showEventModal} animationType="slide" onRequestClose={() => setShowEventModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Event Details</Text>
          <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default MedicalTimeline; 