import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';

interface MedicalEvent {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  doctor?: string;
  notes?: string;
}

interface MedicalTimelineProps {
  onEventPress?: (event: MedicalEvent) => void;
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ onEventPress }) => {
  const [showMore, setShowMore] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDoctor, setNewDoctor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [attachedDoc, setAttachedDoc] = useState<any>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);

  // Simplified events data with proper date categorization
  const [events, setEvents] = useState<MedicalEvent[]>([
    {
      id: '1',
      title: 'Vitamin D Supplement',
      subtitle: 'Take with breakfast',
      time: 'Today • 8:00 AM',
      status: 'DUE',
      icon: 'star',
      iconColor: '#FF9500',
    },
    {
      id: '2',
      title: 'Blood Pressure Check',
      subtitle: 'Home monitoring',
      time: 'Today • 6:00 PM',
      status: 'DUE',
      icon: 'heart',
      iconColor: '#FF3B30',
    },
    {
      id: '3',
      title: 'Dental Checkup',
      subtitle: 'Dr. Michael Brown, DDS',
      time: 'Tomorrow • 2:00 PM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: 'Dr. Michael Brown, DDS',
    },
    {
      id: '4',
      title: 'Flu Vaccination',
      subtitle: 'CVS Pharmacy',
      time: 'Tomorrow • 4:30 PM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
    },
    {
      id: '5',
      title: 'Annual Physical',
      subtitle: 'Dr. Sarah Chen, MD',
      time: 'Dec 15, 2024 • 10:00 AM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: 'Dr. Sarah Chen, MD',
    },
    {
      id: '6',
      title: 'Eye Exam',
      subtitle: 'Dr. Emily Davis, OD',
      time: 'Dec 20, 2024 • 11:00 AM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: 'Dr. Emily Davis, OD',
    },
    {
      id: '7',
      title: 'Blood Test',
      subtitle: 'LabCorp - Fasting Required',
      time: 'Dec 25, 2024 • 9:00 AM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
    },
  ]);

  const handleEventAction = (eventId: string, action: 'done' | 'ignore') => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleEventPress = (event: MedicalEvent) => {
      setSelectedEvent(event);
    setDetailsModalVisible(true);
  };

  const renderRightActions = (eventId: string) => (
    <View style={styles.swipeActions}>
      <RectButton style={[styles.swipeAction, styles.doneAction]} onPress={() => handleEventAction(eventId, 'done')}>
        <Ionicons name="checkmark" size={20} color="#fff" />
        <Text style={styles.swipeActionText}>Done</Text>
      </RectButton>
      <RectButton style={[styles.swipeAction, styles.ignoreAction]} onPress={() => handleEventAction(eventId, 'ignore')}>
        <Ionicons name="close" size={20} color="#fff" />
        <Text style={styles.swipeActionText}>Ignore</Text>
      </RectButton>
    </View>
  );

  // Group events by date category
  const groupEventsByDate = (events: MedicalEvent[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const grouped = {
      today: [] as MedicalEvent[],
      tomorrow: [] as MedicalEvent[],
      thisWeek: [] as MedicalEvent[],
      nextMonth: [] as MedicalEvent[],
      future: [] as MedicalEvent[]
    };
    
    events.forEach(event => {
      const eventTime = event.time.toLowerCase();
      if (eventTime.includes('today')) {
        grouped.today.push(event);
      } else if (eventTime.includes('tomorrow')) {
        grouped.tomorrow.push(event);
      } else if (eventTime.includes('dec 15') || eventTime.includes('dec 20')) {
        grouped.thisWeek.push(event);
      } else if (eventTime.includes('dec 25')) {
        grouped.nextMonth.push(event);
      } else {
        grouped.future.push(event);
      }
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);
  
  // Get visible events based on showMore state
  const getVisibleEvents = () => {
    if (showMore) {
      return groupedEvents;
    } else {
      // Show limited events: 2 today, 2 tomorrow, 1 this week, 2 next month
      return {
        today: groupedEvents.today.slice(0, 2),
        tomorrow: groupedEvents.tomorrow.slice(0, 2),
        thisWeek: groupedEvents.thisWeek.slice(0, 1),
        nextMonth: groupedEvents.nextMonth.slice(0, 2),
        future: []
      };
    }
  };

  const visibleGroupedEvents = getVisibleEvents();

    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={24} color="#007AFF" />
        <Text style={styles.title}>Medical Timeline</Text>
        <TouchableOpacity onPress={() => setShowMore(!showMore)}>
          <Text style={styles.viewAll}>{showMore ? 'Show Less' : 'View All'}</Text>
        </TouchableOpacity>
    </View>

      {Object.entries(visibleGroupedEvents).map(([category, categoryEvents]) => {
        if (categoryEvents.length === 0) return null;

    return (
          <View key={category}>
            <Text style={styles.categoryTitle}>
              {category === 'today' ? 'Today' : 
               category === 'tomorrow' ? 'Tomorrow' : 
               category === 'thisWeek' ? 'This Week' : 
               category === 'nextMonth' ? 'Next Month' : 'Future'}
            </Text>
            {categoryEvents.map((event) => (
      <Swipeable
        key={event.id}
                renderRightActions={() => renderRightActions(event.id)}
                rightThreshold={40}
      >
      <TouchableOpacity
                  style={styles.eventCard}
          onPress={() => handleEventPress(event)}
      >
                  <View style={[styles.iconCircle, { backgroundColor: event.iconColor + '20' }]}>
                    <Ionicons name={event.icon} size={20} color={event.iconColor} />
          </View>
                  <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
            </View>
                  {event.status === 'DUE' && (
                    <Text style={styles.dueStatus}>{event.status}</Text>
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </TouchableOpacity>
      </Swipeable>
            ))}
          </View>
          );
        })}

      {/* Add Appointment Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Appointment</Text>
            
              <TextInput
              placeholder="Appointment Title"
              placeholderTextColor="#888"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.modalInput}
            />
            
              <TextInput
              placeholder="Doctor Name (optional)"
              placeholderTextColor="#888"
              value={newDoctor}
              onChangeText={setNewDoctor}
              style={styles.modalInput}
            />
            
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
              style={styles.modalInput}
              >
              <Text style={{ color: newDate ? '#fff' : '#888', fontSize: 16 }}>
                {newDate ? newDate.toLocaleString() : 'Select Date & Time'}
                </Text>
              </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={newDate || new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setNewDate(selectedDate);
                }}
              />
            )}
            
              <TextInput
              placeholder="Notes (optional)"
              placeholderTextColor="#888"
              value={newNotes}
              onChangeText={setNewNotes}
                multiline
              numberOfLines={3}
              style={[styles.modalInput, { textAlignVertical: 'top' }]}
            />
            
            <View style={styles.modalButtons}>
                      <TouchableOpacity 
                  onPress={() => {
                  setAddModalVisible(false);
                  setNewTitle('');
                  setNewDoctor('');
                  setNewDate(null);
                  setNewNotes('');
                }}
                style={styles.modalButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              
                <TouchableOpacity 
                  onPress={() => {
                  if (newTitle.trim() && newDate) {
                    const newEvent: MedicalEvent = {
                      id: Date.now().toString(),
                      title: newTitle,
                      subtitle: newDoctor || 'Appointment',
                      time: format(newDate, 'MMM d, yyyy • h:mm a'),
                      status: 'UPCOMING',
                      icon: 'medical',
                      iconColor: '#007AFF',
                      doctor: newDoctor,
                      notes: newNotes,
                    };
                    setEvents([newEvent, ...events]);
                    setAddModalVisible(false);
                    setNewTitle('');
                    setNewDoctor('');
                    setNewDate(null);
                    setNewNotes('');
                  }
                }}
                style={styles.modalButton}
              >
                <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      {/* Event Details Modal */}
      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
            <Text style={styles.modalSubtitle}>{selectedEvent?.subtitle}</Text>
            <Text style={styles.modalText}>Date: {selectedEvent?.time}</Text>
            {selectedEvent?.doctor && (
              <Text style={styles.modalText}>Doctor: {selectedEvent.doctor}</Text>
            )}
            {selectedEvent?.notes && (
              <Text style={styles.modalText}>Notes: {selectedEvent.notes}</Text>
            )}
                <TouchableOpacity 
              onPress={() => setDetailsModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.addButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Modal>

      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Appointment</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  viewAll: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    minHeight: 72,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 2,
  },
  eventTime: {
    color: '#8E8E93',
    fontSize: 12,
  },
  dueStatus: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  doneAction: {
    backgroundColor: '#34C759',
  },
  ignoreAction: {
    backgroundColor: '#FF3B30',
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 12,
  },
  modalText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
});

export default MedicalTimeline; 