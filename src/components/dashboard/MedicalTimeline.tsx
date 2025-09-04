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
  ScrollView,
  FlatList,
  Linking,
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
  attachedFile?: any;
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
  const [editingEvent, setEditingEvent] = useState<MedicalEvent | null>(null);
  
  // Autocomplete states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Predefined appointment types
  const appointmentTypes = [
    'Dentist',
    'GP / Primary Care',
    'Cardiologist',
    'Eye Test / Ophthalmologist',
    'Blood Test',
    'Vaccination',
    'Physiotherapist',
    'Dermatologist',
    'Gynecologist',
    'Urologist',
    'Orthopedic',
    'Neurologist',
    'Psychiatrist',
    'Nutritionist',
    'Chiropractor',
    'Acupuncturist',
    'Massage Therapy',
    'X-Ray / Imaging',
    'Surgery Consultation',
    'Follow-up Appointment',
    'Emergency Room',
    'Urgent Care',
    'Specialist Consultation',
    'Lab Work',
    'Physical Therapy',
    'Mental Health',
    'Dental Cleaning',
    'Root Canal',
    'Crown / Bridge',
    'Wisdom Teeth',
    'Cancer Screening',
    'Mammogram',
    'Colonoscopy',
    'Endoscopy',
    'Biopsy',
    'Allergy Testing',
    'Sleep Study',
    'Cardiac Stress Test',
    'Echocardiogram',
    'MRI Scan',
    'CT Scan',
    'Ultrasound',
    'Bone Density Test',
    'Hormone Testing',
    'Thyroid Function',
    'Diabetes Management',
    'Hypertension Check',
    'Cholesterol Screening',
    'Liver Function Test',
    'Kidney Function Test',
    'Vitamin D Test',
    'Iron Studies',
    'Pregnancy Test',
    'STI Testing',
    'Travel Vaccination',
    'Flu Shot',
    'COVID-19 Vaccine',
    'Other'
  ];

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
      title: 'Physical Therapy',
      subtitle: 'Dr. Lisa Johnson, PT',
      time: 'Today • 10:00 AM',
      status: 'DUE',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: 'Dr. Lisa Johnson, PT',
      notes: 'Wellness Center, 456 Health Ave, New York, NY 10002',
    },
    {
      id: '4',
      title: 'Dental Checkup',
      subtitle: 'Dr. Michael Brown, DDS',
      time: 'Tomorrow • 2:00 PM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: 'Dr. Michael Brown, DDS',
      notes: 'Downtown Dental Clinic, 123 Main Street, New York, NY 10001',
    },
    {
      id: '5',
      title: 'Flu Vaccination',
      subtitle: 'CVS Pharmacy',
      time: 'Tomorrow • 4:30 PM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      notes: 'CVS Pharmacy, 789 Broadway, New York, NY 10003',
    },
    {
      id: '6',
      title: 'Annual Physical',
      subtitle: 'Dr. Sarah Chen, MD',
      time: 'Sep 8, 2025 • 10:00 AM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: 'Dr. Sarah Chen, MD',
      notes: 'Manhattan Medical Center, 321 Park Ave, New York, NY 10010',
    },
    {
      id: '7',
      title: 'Eye Exam',
      subtitle: 'Dr. Emily Davis, OD',
      time: 'Sep 10, 2025 • 11:00 AM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      doctor: 'Dr. Emily Davis, OD',
      notes: 'Vision Care Associates, 654 5th Avenue, New York, NY 10019',
    },
    {
      id: '8',
      title: 'Blood Test',
      subtitle: 'LabCorp - Fasting Required',
      time: 'Oct 25, 2025 • 9:00 AM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      notes: 'LabCorp Patient Service Center, 987 Madison Ave, New York, NY 10021',
    },
  ]);

  const handleEventAction = (eventId: string, action: 'done' | 'ignore') => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleEventPress = (event: MedicalEvent) => {
      setSelectedEvent(event);
    setDetailsModalVisible(true);
  };

  const handleEditEvent = (event: MedicalEvent) => {
    setEditingEvent(event);
    setNewTitle(event.title);
    setNewDoctor(event.doctor || '');
    setNewNotes(event.notes || '');
    setAttachedDoc(event.attachedFile || null);
    setDetailsModalVisible(false);
    setAddModalVisible(true);
  };

  const openMaps = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    const url = Platform.OS === 'ios' 
      ? `maps://maps.google.com/maps?daddr=${encodedLocation}`
      : `geo:0,0?q=${encodedLocation}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        Linking.openURL(webUrl);
      }
    }).catch(err => {
      console.error('Error opening maps:', err);
      // Fallback to Google Maps web
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      Linking.openURL(webUrl);
    });
  };

  // Handle appointment type input with autocomplete
  const handleAppointmentTypeChange = (text: string) => {
    setNewTitle(text);
    if (text.length > 0) {
      const filtered = appointmentTypes.filter(type => 
        type.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const selectAppointmentType = (type: string) => {
    setNewTitle(type);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  // Handle file attachment
  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        setAttachedDoc(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to attach file');
    }
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
      // Show only today and tomorrow by default
      return {
        today: groupedEvents.today,
        tomorrow: groupedEvents.tomorrow,
        thisWeek: [],
        nextMonth: [],
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEvent ? 'Edit Appointment' : 'Add Appointment'}</Text>
              <TouchableOpacity 
                onPress={() => setAddModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Appointment Type with Autocomplete */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Appointment Type *</Text>
                <TextInput
                  placeholder="Start typing appointment type..."
                  placeholderTextColor="#888"
                  value={newTitle}
                  onChangeText={handleAppointmentTypeChange}
                  style={styles.modalInput}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <FlatList
                      data={filteredSuggestions.slice(0, 8)}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.suggestionItem}
                          onPress={() => selectAppointmentType(item)}
                        >
                          <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.suggestionsList}
                    />
                  </View>
                )}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Doctor Name (optional)</Text>
                <TextInput
                  placeholder="Doctor Name"
                  placeholderTextColor="#888"
                  value={newDoctor}
                  onChangeText={setNewDoctor}
                  style={styles.modalInput}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date & Time *</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Ionicons name="calendar" size={20} color="#007AFF" />
                  <Text style={[styles.datePickerText, { color: newDate ? '#fff' : '#888' }]}>
                    {newDate ? format(newDate, 'MMM d, yyyy • h:mm a') : 'Select Date & Time'}
                  </Text>
                </TouchableOpacity>
              </View>
            
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
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  placeholder="Add notes about the appointment..."
                  placeholderTextColor="#888"
                  value={newNotes}
                  onChangeText={setNewNotes}
                  multiline
                  numberOfLines={3}
                  style={[styles.modalInput, { textAlignVertical: 'top' }]}
                />
              </View>

              {/* File Attachment */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Attach Files (optional)</Text>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={handleAttachFile}
                >
                  <Ionicons name="attach" size={20} color="#007AFF" />
                  <Text style={styles.attachButtonText}>
                    {attachedDoc ? 'File Attached' : 'Attach File'}
                  </Text>
                </TouchableOpacity>
                {attachedDoc && (
                  <View style={styles.attachedFile}>
                    <Ionicons name="document" size={16} color="#30D158" />
                    <Text style={styles.attachedFileName}>{attachedDoc.name}</Text>
                    <TouchableOpacity
                      onPress={() => setAttachedDoc(null)}
                      style={styles.removeFileButton}
                    >
                      <Ionicons name="close-circle" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => {
                  setAddModalVisible(false);
                  setNewTitle('');
                  setNewDoctor('');
                  setNewDate(null);
                  setNewNotes('');
                  setAttachedDoc(null);
                  setEditingEvent(null);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                  if (newTitle.trim() && newDate) {
                    if (editingEvent) {
                      // Update existing event
                      const updatedEvent: MedicalEvent = {
                        ...editingEvent,
                        title: newTitle,
                        subtitle: newDoctor || 'Appointment',
                        time: format(newDate, 'MMM d, yyyy • h:mm a'),
                        doctor: newDoctor,
                        notes: newNotes,
                        attachedFile: attachedDoc,
                      };
                      setEvents(events.map(event => 
                        event.id === editingEvent.id ? updatedEvent : event
                      ));
                      setEditingEvent(null);
                    } else {
                      // Add new event
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
                        attachedFile: attachedDoc,
                      };
                      setEvents([newEvent, ...events]);
                    }
                    setAddModalVisible(false);
                    setNewTitle('');
                    setNewDoctor('');
                    setNewDate(null);
                    setNewNotes('');
                    setAttachedDoc(null);
                  }
                }}
                style={styles.modalButton}
              >
                <Text style={styles.addButtonText}>{editingEvent ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Details Modal */}
      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
              <TouchableOpacity 
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>{selectedEvent?.subtitle}</Text>
              <Text style={styles.modalText}>Date: {selectedEvent?.time}</Text>
              {selectedEvent?.notes && (
                <TouchableOpacity onPress={() => openMaps(selectedEvent.notes)}>
                  <Text style={styles.modalText}>Location: {selectedEvent.notes}</Text>
                </TouchableOpacity>
              )}
              {selectedEvent?.attachedFile && (
                <View style={styles.attachedFileContainer}>
                  <Text style={styles.modalText}>Attached File:</Text>
                  <View style={styles.attachedFile}>
                    <Ionicons name="document" size={16} color="#30D158" />
                    <Text style={styles.attachedFileName}>{selectedEvent.attachedFile.name}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => selectedEvent && handleEditEvent(selectedEvent)}
                style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
              >
                <Text style={styles.addButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
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
    height: 70,
    borderRadius: 12,
  },
  doneAction: {
    backgroundColor: '#34C759',
  },
  ignoreAction: {
    backgroundColor: '#FF9500',
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  attachButton: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  attachedFileContainer: {
    marginTop: 12,
  },
  attachedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  attachedFileName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 16,
    textAlign: 'left',
  },
});

export default MedicalTimeline; 