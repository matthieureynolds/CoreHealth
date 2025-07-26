import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';

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

const mockEvents = [
  {
    id: '1',
    section: 'Today',
    icon: 'medkit-outline',
      title: 'Vitamin D Supplement',
      subtitle: 'Take with breakfast',
    time: 'Today • 8:00 AM',
    status: 'DUE',
  },
  {
    id: '2',
    section: 'Today',
    icon: 'shield-checkmark-outline',
      title: 'Flu Vaccination',
      subtitle: 'Annual immunization',
    time: 'Today • 2:00 PM',
    status: 'DUE',
  },
];

// Helper to get date group
function getEventGroup(dateStr: string) {
  const eventDate = new Date(dateStr);
  if (isNaN(eventDate.getTime())) return 'Future';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  nextMonth.setDate(1);
  const endOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
  if (eventDate.toDateString() === today.toDateString()) return 'Today';
  if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  if (eventDate > tomorrow && eventDate <= weekFromNow) return 'This Week';
  if (eventDate > weekFromNow && eventDate <= endOfNextMonth) return 'Next Month';
  return 'Future';
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ onEventPress }) => {
  const [showMore, setShowMore] = useState(false); // Default to 'Show More'
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attachedDoc, setAttachedDoc] = useState<any>(null);
  const [futureEvents, setFutureEvents] = useState<Array<
    {
      id: string;
      icon: string;
      title: string;
      subtitle: string;
      time: string;
      status: string;
      document?: any;
      doctor?: { name: string };
      notes?: string;
    }
  >>([
    {
      id: 'future1',
      icon: 'calendar-outline',
      title: 'Dental Checkup',
      subtitle: '',
      time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: 'UPCOMING',
    },
    {
      id: 'future2',
      icon: 'medkit-outline',
      title: 'Eye Exam',
      subtitle: '',
      time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: 'UPCOMING',
    },
    {
      id: 'future3',
      icon: 'fitness-outline',
      title: 'Physical Therapy',
      subtitle: '',
      time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // Next week
      status: 'UPCOMING',
    },
    {
      id: 'future4',
      icon: 'flask-outline',
      title: 'Blood Test',
      subtitle: '',
      time: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // Next month
      status: 'UPCOMING',
    },
    {
      id: 'future5',
      icon: 'medal-outline',
      title: 'Annual Checkup',
      subtitle: '',
      time: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), // Next month
      status: 'UPCOMING',
    },
  ]);
  const [isDraft, setIsDraft] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [newDoctor, setNewDoctor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const SUGGESTIONS = [
    'Dentist Annual Check',
    'Dentist Hygienist',
    'Dental Filling',
    'Dental X-Ray',
    'Eye Exam',
    'Blood Test',
    'MRI Scan',
    'Annual Checkup',
    'Physical Therapy',
    'Vaccination',
    'Flu Shot',
    'General Practitioner',
  ];

  // Add state for todayEvents and thisWeekEvents
  const [todayEvents, setTodayEvents] = useState([mockEvents[0], mockEvents[1]]);
  const [thisWeekEvents, setThisWeekEvents] = useState([]);

  // Update groupedEvents to use state
  const groupedEvents = [
    {
      title: 'Today',
      data: todayEvents,
    },
    {
      title: 'Tomorrow',
      data: futureEvents.filter(event => {
        const eventDate = new Date(event.time);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return eventDate.toDateString() === tomorrow.toDateString();
      }) as any[],
    },
    {
      title: 'Next Week',
      data: futureEvents.filter(event => {
        const eventDate = new Date(event.time);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const weekAfter = new Date();
        weekAfter.setDate(weekAfter.getDate() + 14);
        return eventDate >= nextWeek && eventDate < weekAfter;
      }) as any[],
    },
    {
      title: 'Next Month',
      data: futureEvents.filter(event => {
        const eventDate = new Date(event.time);
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        const monthAfter = new Date();
        monthAfter.setDate(monthAfter.getDate() + 60);
        return eventDate >= nextMonth && eventDate < monthAfter;
      }) as any[],
    },
  ];

  // Add handler functions for Done and Ignore
  const handleEventAction = (eventId: string, action: 'done' | 'ignore') => {
    setTodayEvents(prev => prev.filter(e => e.id !== eventId));
    setThisWeekEvents(prev => prev.filter(e => e.id !== eventId));
    setFutureEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Flatten all events and group by date
  const allEvents = [...todayEvents, ...thisWeekEvents, ...futureEvents].map(event => {
    const dateStr = event.time || '';
    let group = 'Future';
    let subtitle = event.subtitle;
    let formattedDate = '';
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      group = getEventGroup(dateStr);
      formattedDate = format(parsedDate, 'MMM d, yyyy');
      subtitle = formattedDate;
    }
    return { ...event, group, subtitle, parsedDate } as any;
  });
  // Group and sort events chronologically within each group
  const grouped: Record<'Today' | 'Tomorrow' | 'This Week' | 'Next Month' | 'Future', typeof allEvents> = {
    Today: [],
    Tomorrow: [],
    'This Week': [],
    'Next Month': [],
    Future: [],
  };
  allEvents.forEach(e => { grouped[e.group as keyof typeof grouped].push(e); });
  Object.keys(grouped).forEach(key => {
    grouped[key as keyof typeof grouped].sort((a, b) => (a.parsedDate?.getTime?.() || 0) - (b.parsedDate?.getTime?.() || 0));
  });
  // Flatten back in correct order for display
  const orderedEvents = [
    ...grouped['Today'],
    ...grouped['Tomorrow'],
    ...grouped['This Week'],
    ...grouped['Next Month'],
    ...grouped['Future'],
  ];
  const visibleEvents = showMore
    ? orderedEvents.slice(0, 8)
    : orderedEvents.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={20} color="#007AFF" />
        <Text style={styles.title}>Medical Timeline</Text>
        {/* View All / Show Less button */}
        <TouchableOpacity onPress={() => setShowMore(!showMore)} style={styles.moreTab}>
          <Text style={styles.moreTabText}>{showMore ? 'Show Less' : 'View All'}</Text>
        </TouchableOpacity>
      </View>
      {visibleEvents.map((event: any) => (
        <Swipeable
          key={event.id}
          renderRightActions={(_, dragX) => (
            <View style={{ flexDirection: 'row', height: '100%' }}>
              <RectButton
                style={{ backgroundColor: '#30D158', justifyContent: 'center', alignItems: 'center', width: 80 }}
                onPress={() => handleEventAction(event.id, 'done')}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Done</Text>
              </RectButton>
              <RectButton
                style={{ backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'center', width: 80 }}
                onPress={() => handleEventAction(event.id, 'ignore')}
              >
                <Ionicons name="close" size={24} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ignore</Text>
              </RectButton>
            </View>
          )}
        >
          <TouchableOpacity onPress={() => { setSelectedEvent(event); setDetailsModalVisible(true); }} activeOpacity={0.8}>
            <View style={styles.eventCard}>
              <View style={styles.iconCircle}>
                <Ionicons name={event.icon as any} size={22} color="#FFB300" />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
              <Text style={[styles.eventStatus, event.status === 'DRAFT' && { color: '#FFB300' }]}>{event.status === 'DRAFT' ? 'DRAFT' : event.status}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </TouchableOpacity>
        </Swipeable>
      ))}
      {/* Add modal for adding appointment */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000A', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#222', borderRadius: 16, padding: 32, width: 380, minHeight: 420 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>Add Appointment</Text>
            <TextInput
              placeholder="Title"
              placeholderTextColor="#888"
              value={newTitle}
              onChangeText={text => {
                setNewTitle(text);
                if (text.length > 0) {
                  setTitleSuggestions(SUGGESTIONS.filter(s => s.toLowerCase().includes(text.toLowerCase())));
    } else {
                  setTitleSuggestions([]);
                }
              }}
              style={{ backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 16 }}
            />
            {titleSuggestions.length > 0 && (
              <View style={{ backgroundColor: '#333', borderRadius: 8, marginBottom: 8 }}>
                {titleSuggestions.map(s => (
                  <TouchableOpacity key={s} onPress={() => { setNewTitle(s); setTitleSuggestions([]); }}>
                    <Text style={{ color: '#fff', padding: 10, fontSize: 16 }}>{s}</Text>
          </TouchableOpacity>
                ))}
        </View>
      )}
              <TextInput
              placeholder="Doctor Name"
              placeholderTextColor="#888"
              value={newDoctor}
              onChangeText={setNewDoctor}
              style={{ backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 }}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ backgroundColor: '#333', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: newDate ? '#fff' : '#888', fontSize: 16 }}>{newDate ? newDate.toLocaleString() : 'Select Date & Time'}</Text>
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
              <TouchableOpacity
              onPress={async () => {
                const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
                if (!result.canceled && result.assets && result.assets.length > 0) setAttachedDoc(result.assets[0]);
              }}
              style={{ backgroundColor: '#333', borderRadius: 8, padding: 12, marginBottom: 12 }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>{attachedDoc ? `Attached: ${attachedDoc.name}` : 'Attach Document'}</Text>
              </TouchableOpacity>
              <TextInput
                placeholder="Notes (optional)"
                placeholderTextColor="#888"
                value={newNotes}
                onChangeText={setNewNotes}
                multiline
                numberOfLines={3}
                style={{ backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, textAlignVertical: 'top' }}
              />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <TouchableOpacity onPress={() => { setAddModalVisible(false); setAttachedDoc(null); setNewDate(null); setNewTitle(''); setNewDoctor(''); setNewNotes(''); setIsDraft(false); }}>
                <Text style={{ color: '#aaa', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
                      <TouchableOpacity 
                onPress={() => {
                  if (newTitle.trim() && newDate) {
                    setFutureEvents([
                      ...futureEvents,
                      {
                        id: `future${futureEvents.length + 1}`,
                        icon: 'calendar-outline',
                        title: newTitle,
                        subtitle: 'Upcoming',
                        time: newDate.toISOString(), // Use ISO string for correct grouping
                        status: isDraft ? 'DRAFT' : 'UPCOMING',
                        document: attachedDoc,
                        doctor: { name: newDoctor },
                        notes: newNotes,
                      },
                    ]);
                    setNewTitle('');
                    setNewDate(null);
                    setAttachedDoc(null);
                    setNewDoctor('');
                    setAddModalVisible(false);
                    setIsDraft(false);
                  }
                }}
              >
                <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                  if (newTitle.trim() && newDate) {
                    setFutureEvents([
                      ...futureEvents,
                      {
                        id: `future${futureEvents.length + 1}`,
                        icon: 'calendar-outline',
                        title: newTitle,
                        subtitle: 'Upcoming',
                        time: newDate.toISOString(), // Use ISO string for correct grouping
                        status: 'DRAFT',
                        document: attachedDoc,
                        doctor: { name: newDoctor },
                        notes: newNotes,
                      },
                    ]);
                    setNewTitle('');
                    setNewDate(null);
                    setAttachedDoc(null);
                    setNewDoctor('');
                    setNewNotes('');
                    setAddModalVisible(false);
                    setIsDraft(false);
                  }
                }}
              >
                <Text style={{ color: '#FFB300', fontWeight: 'bold', fontSize: 16 }}>Save as Draft</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Appointment</Text>
                </TouchableOpacity>
      {/* Add the details modal at the end of the component */}
      <Modal visible={detailsModalVisible} transparent animationType="slide" onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000A', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#222', borderRadius: 16, padding: 24, width: 320 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>{selectedEvent?.title}</Text>
            <Text style={{ color: '#aaa', fontSize: 15, marginBottom: 8 }}>{selectedEvent?.subtitle}</Text>
            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>Date: {selectedEvent?.time ? new Date(selectedEvent.time).toLocaleString() : ''}</Text>
            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>Doctor: {selectedEvent?.doctor?.name || 'Dr. John Smith'}</Text>
            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>Location: {selectedEvent?.location?.name || 'Central Clinic, 123 Main St.'}</Text>
            {selectedEvent?.document && (
              <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>Attachment: {selectedEvent.document.name}</Text>
            )}
            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>Previous Visits:</Text>
            <View style={{ backgroundColor: '#333', borderRadius: 8, padding: 10, marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>- Jan 2023: Routine checkup</Text>
              <Text style={{ color: '#fff', fontSize: 14 }}>- Aug 2022: Follow-up</Text>
              </View>
            <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  emptySection: {
    height: 8,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14, // match labResultItem
    paddingHorizontal: 16, // match labResultItem
    backgroundColor: '#2C2C2E', // match labResultItem
    borderRadius: 12, // match labResultItem
    marginBottom: 8, // match labResultItem
    minHeight: 60, // match labResultItem
    width: '100%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3E3E42',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontWeight: '500', // match labResultName
    fontSize: 15, // match labResultName
    marginBottom: 2, // match labResultName
  },
  eventSubtitle: {
    color: '#8E8E93', // match labResultDate
    fontSize: 12, // match labResultDate
  },
  eventTime: {
    color: '#8E8E93',
    fontSize: 12,
  },
  eventStatus: {
    color: '#FFB300',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  moreTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  moreTabText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default MedicalTimeline; 