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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import FileViewerModal from '../common/FileViewerModal';
import { useSettings } from '../../context/SettingsContext';

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
  location?: string;
  attachedFile?: any;
}

interface MedicalTimelineProps {
  onEventPress?: (event: MedicalEvent) => void;
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ onEventPress }) => {
  const { settings } = useSettings();
  const [showMore, setShowMore] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDoctor, setNewDoctor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [attachedDoc, setAttachedDoc] = useState<any>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<MedicalEvent | null>(null);
  
  // Autocomplete states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocationSuggestions, setFilteredLocationSuggestions] = useState<string[]>([]);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

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

  // Mock address suggestions
  const addressSuggestions = [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Los Angeles, CA 90210',
    '789 Pine Street, Chicago, IL 60601',
    '321 Elm Drive, Houston, TX 77001',
    '654 Maple Lane, Phoenix, AZ 85001',
    '987 Cedar Road, Philadelphia, PA 19101',
    '147 Birch Street, San Antonio, TX 78201',
    '258 Spruce Avenue, San Diego, CA 92101',
    '369 Willow Way, Dallas, TX 75201',
    '741 Poplar Place, San Jose, CA 95101',
    '852 Ash Street, Austin, TX 78701',
    '963 Hickory Lane, Jacksonville, FL 32201',
    '159 Cherry Court, Fort Worth, TX 76101',
    '357 Walnut Drive, Columbus, OH 43201',
    '468 Chestnut Street, Charlotte, NC 28201'
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
      location: 'Wellness Center, 456 Health Ave, New York, NY 10002',
      notes: 'Focus on lower back exercises',
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
      location: 'Downtown Dental Clinic, 123 Main Street, New York, NY 10001',
      notes: 'Regular cleaning and checkup',
    },
    {
      id: '5',
      title: 'Flu Vaccination',
      subtitle: 'CVS Pharmacy',
      time: 'Tomorrow • 4:30 PM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      location: 'CVS Pharmacy, 789 Broadway, New York, NY 10003',
      notes: 'Annual flu shot',
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
      location: 'Manhattan Medical Center, 321 Park Ave, New York, NY 10010',
      notes: 'Complete annual health assessment',
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
      location: 'Vision Care Associates, 654 5th Avenue, New York, NY 10019',
      notes: 'Comprehensive eye examination',
    },
    {
      id: '8',
      title: 'Blood Test',
      subtitle: 'LabCorp - Fasting Required',
      time: 'Oct 25, 2025 • 9:00 AM',
      status: 'UPCOMING',
      icon: 'medical',
      iconColor: '#007AFF',
      location: 'LabCorp Patient Service Center, 987 Madison Ave, New York, NY 10021',
      notes: 'Fasting required - no food 12 hours before',
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
    setNewLocation(event.location || '');
    setNewNotes(event.notes || '');
    setAttachedDoc(event.attachedFile || null);
    setDetailsModalVisible(false);
    setAddModalVisible(true);
  };

  const openMaps = (location: string) => {
    Alert.alert(
      'Navigate to Location',
      `How would you like to navigate to ${location}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const destination = encodeURIComponent(location);
            const url = `http://maps.apple.com/?daddr=${destination}`;
            Linking.openURL(url);
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const destination = encodeURIComponent(location);
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            Linking.openURL(url);
          },
        },
      ]
    );
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

  const handleLocationChange = (text: string) => {
    setNewLocation(text);
    if (text.length > 0) {
      const filtered = addressSuggestions.filter(address => 
        address.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
      setFilteredLocationSuggestions([]);
    }
  };

  const selectLocation = (location: string) => {
    setNewLocation(location);
    setShowLocationSuggestions(false);
    setFilteredLocationSuggestions([]);
  };

  const handleViewFile = (fileUri: string, fileName: string, fileType?: string) => {
    setCurrentFileUri(fileUri);
    setCurrentFileName(fileName);
    setCurrentFileType(fileType || '');
    setFileViewerVisible(true);
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
  
  const is12h = settings?.general?.timeFormat === '12h';
  const to24h = (hours: number, minutes: number, ampm: string) => {
    let h = hours;
    if (/pm/i.test(ampm) && h < 12) h += 12;
    if (/am/i.test(ampm) && h === 12) h = 0;
    const hh = String(h).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
  };
  const formatEventTimeForDisplay = (label: string): string => {
    if (is12h) return label;
    return label.replace(/(\d{1,2}):(\d{2})\s?(AM|PM)/gi, (_match, h, m, ap) => to24h(parseInt(h, 10), parseInt(m, 10), ap));
  };
  
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

  const formatDateBySetting = (date: Date, formatSetting: string) => {
    if (formatSetting === 'DD/MM/YYYY') {
      return format(date, 'DD/MM/YYYY');
    } else if (formatSetting === 'MM/DD/YYYY') {
      return format(date, 'MM/DD/YYYY');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

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
        <View style={styles.eventRow}>
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
              <Text style={styles.eventTime}>{formatEventTimeForDisplay(event.time)}</Text>
            </View>
            {event.status === 'DUE' && (
              <Text style={styles.dueStatus}>{event.status}</Text>
            )}
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
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
                  placeholder="e.g., Blood Test, Dentist, Physical Therapy"
                  placeholderTextColor="#888"
                  value={newTitle}
                  onChangeText={handleAppointmentTypeChange}
                  style={styles.modalInput}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {filteredSuggestions.slice(0, 8).map((item, index) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.suggestionItem}
                        onPress={() => selectAppointmentType(item)}
                      >
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Doctor Name (optional)</Text>
                <TextInput
                  placeholder="Dr. Smith"
                  placeholderTextColor="#888"
                  value={newDoctor}
                  onChangeText={setNewDoctor}
                  style={styles.modalInput}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location (optional)</Text>
                <TextInput
                  placeholder="Clinic name or address"
                  placeholderTextColor="#888"
                  value={newLocation}
                  onChangeText={handleLocationChange}
                  style={styles.modalInput}
                />
                {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {filteredLocationSuggestions.slice(0, 8).map((item, index) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.suggestionItem}
                        onPress={() => selectLocation(item)}
                      >
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date & Time *</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Ionicons name="calendar" size={20} color="#007AFF" />
                  <Text style={[styles.datePickerText, { color: newDate ? '#fff' : '#888' }]}>
                    {newDate ? `${formatDateBySetting(newDate, settings?.general?.dateFormat || 'DD/MM/YYYY')} • ${newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: settings?.general?.timeFormat === '12h' })}` : 'Select Date & Time'}
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
                  placeholder="Add details"
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
                  if (newTitle.trim() && newDate) {
                    if (editingEvent) {
                      // Update existing event
                      const updatedEvent: MedicalEvent = {
                        ...editingEvent,
                        title: newTitle,
                        subtitle: newDoctor || 'Appointment',
                        time: `${formatDateBySetting(newDate, settings?.general?.dateFormat || 'DD/MM/YYYY')} • ${newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: settings?.general?.timeFormat === '12h' })}`,
                        doctor: newDoctor,
                        notes: newNotes,
                        location: newLocation,
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
                        time: `${formatDateBySetting(newDate, settings?.general?.dateFormat || 'DD/MM/YYYY')} • ${newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: settings?.general?.timeFormat === '12h' })}`,
                        status: 'UPCOMING',
                        icon: 'medical',
                        iconColor: '#007AFF',
                        doctor: newDoctor,
                        notes: newNotes,
                        location: newLocation,
                        attachedFile: attachedDoc,
                      };
                      setEvents([newEvent, ...events]);
                    }
                    setAddModalVisible(false);
                    setNewTitle('');
                    setNewDoctor('');
                    setNewLocation('');
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
              {selectedEvent?.location && (
                <TouchableOpacity onPress={() => openMaps(selectedEvent.location!)}>
                  <Text style={styles.modalText}>Location: {selectedEvent.location}</Text>
                </TouchableOpacity>
              )}
              {selectedEvent?.notes && (
                <Text style={styles.modalText}>Notes: {selectedEvent.notes}</Text>
              )}
              {selectedEvent?.attachedFile && (
                <View style={styles.attachedFileContainer}>
                  <Text style={styles.modalText}>Attached File:</Text>
                  <TouchableOpacity 
                    style={styles.attachedFile}
                    onPress={() => handleViewFile(selectedEvent.attachedFile.uri, selectedEvent.attachedFile.name, selectedEvent.attachedFile.type || undefined)}
                  >
                    <Ionicons name="document" size={16} color="#30D158" />
                    <Text style={styles.attachedFileName}>{selectedEvent.attachedFile.name}</Text>
                    <Ionicons name="eye" size={16} color="#007AFF" />
                  </TouchableOpacity>
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

      {/* File Viewer Modal */}
      <FileViewerModal
        visible={fileViewerVisible}
        onClose={() => setFileViewerVisible(false)}
        fileUri={currentFileUri}
        fileName={currentFileName}
        fileType={currentFileType}
      />
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
  eventRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 8,
    height: 72,
  },
  eventCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    height: 72,
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
    alignItems: 'stretch',
    gap: 8,
    height: 72,
    paddingLeft: 8,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    height: 72,
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