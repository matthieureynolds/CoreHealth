import React, { useState, useRef } from 'react';
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
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, RectButton, PanGestureHandler, State } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import FileViewerModal from '../common/FileViewerModal';
import EmptyState from '../common/EmptyState';
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
  
  // Animated value for bottom sheet drag and slide-in
  const translateY = useRef(new Animated.Value(1000)).current; // Start off-screen

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
    // Reset animation when opening
    translateY.setValue(0);
    // Animate bottom sheet sliding up
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const handleEditEvent = (event: MedicalEvent) => {
    setEditingEvent(event);
    setNewTitle(event.title);
    setNewDoctor(event.doctor || '');
    setNewLocation(event.location || '');
    setNewNotes(event.notes || '');
    setAttachedDoc(event.attachedFile || null);
    
    // Parse date from event.time string
    // Format is like "Tomorrow • 2:00 PM" or "Sep 10, 2025 • 11:00 AM" or "Today • 8:00 AM"
    let parsedDate: Date | null = null;
    try {
      const timeParts = event.time.split('•');
      if (timeParts.length === 2) {
        const datePart = timeParts[0].trim();
        const timePart = timeParts[1].trim();
        
        // Try to parse date part
        let dateToUse = new Date();
        
        if (datePart.toLowerCase().includes('today')) {
          // Use today's date
          dateToUse = new Date();
        } else if (datePart.toLowerCase().includes('tomorrow')) {
          // Use tomorrow's date
          dateToUse = new Date();
          dateToUse.setDate(dateToUse.getDate() + 1);
        } else {
          // Try to parse as a date string
          const parsed = new Date(datePart);
          if (!isNaN(parsed.getTime())) {
            dateToUse = parsed;
          }
        }
        
        // Parse time part (e.g., "2:00 PM" or "14:00")
        const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3];
          
          if (ampm) {
            // 12-hour format
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
          
          dateToUse.setHours(hours, minutes, 0, 0);
          parsedDate = dateToUse;
        }
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    
    setNewDate(parsedDate);
    setDetailsModalVisible(false);
    setAddModalVisible(true);
    // Animate bottom sheet sliding up
    translateY.setValue(1000);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
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

  // Handle swipe down gesture on bottom sheet
  const handleSwipeDown = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    // If swiping down with sufficient velocity or translation, dismiss
    if (translationY > 50 || velocityY > 500) {
      Animated.timing(translateY, {
        toValue: 1000, // Move off screen
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setDetailsModalVisible(false);
        translateY.setValue(0); // Reset for next time
      });
    } else {
      // Snap back if not enough to dismiss
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

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
      return format(date, 'dd/MM/yyyy');
    } else if (formatSetting === 'MM/DD/YYYY') {
      return format(date, 'MM/dd/yyyy');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={24} color="#007AFF" />
        <Text style={styles.title}>Medical Timeline</Text>
        <TouchableOpacity 
          onPress={() => {
            setAddModalVisible(true);
            // Animate bottom sheet sliding up
            translateY.setValue(1000);
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 65,
              friction: 11,
            }).start();
          }} 
          style={{ padding: 6 }}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
    </View>

      {/* Check if there are any events to display */}
      {events.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Appointments"
          subtitle="Add your medical appointments to keep track of your health schedule"
          iconColor="#8E8E93"
        />
      ) : (
        Object.entries(visibleGroupedEvents).map(([category, categoryEvents]) => {
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
              ))}
            </View>
            );
          })
      )}

      {/* Add/Edit Appointment Modal - Modern Bottom Sheet Style */}
      <Modal 
        visible={addModalVisible} 
        transparent 
        animationType="none"
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback 
            onPress={() => {
              setAddModalVisible(false);
              setEditingEvent(null);
              setNewTitle('');
              setNewDoctor('');
              setNewLocation('');
              setNewDate(null);
              setNewNotes('');
              setAttachedDoc(null);
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheetContainer}>
            <Animated.View 
              style={[
                styles.bottomSheetContent,
                {
                  transform: [{ translateY: translateY }],
                },
              ]}
            >
              {/* Handle bar */}
              <View style={styles.bottomSheetHandleContainer}>
                <View style={styles.bottomSheetHandle} />
              </View>
              
              {/* Header */}
              <View style={styles.bottomSheetHeader} pointerEvents="box-none">
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setAddModalVisible(false);
                    setEditingEvent(null);
                    setNewTitle('');
                    setNewDoctor('');
                    setNewLocation('');
                    setNewDate(null);
                    setNewNotes('');
                    setAttachedDoc(null);
                  }}
                  style={styles.bottomSheetCloseButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.bottomSheetTitle}>{editingEvent ? 'Edit Appointment' : 'Add Appointment'}</Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    console.log('Checkmark pressed, title:', newTitle, 'date:', newDate);
                    if (newTitle.trim() && newDate) {
                      console.log('Saving appointment...');
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
                    } else {
                      console.log('Form not valid - missing title or date');
                    }
                  }}
                  style={styles.bottomSheetCloseButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  activeOpacity={0.6}
                >
                  <Ionicons 
                    name="checkmark" 
                    size={24} 
                    color={(!newTitle.trim() || !newDate) ? "#8E8E93" : "#34C759"} 
                  />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.bottomSheetBody} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bottomSheetBodyContent}
              >
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
            </Animated.View>
          </View>
        </View>
      </Modal>

      {/* Event Details Modal - Modern Bottom Sheet Style */}
      <Modal 
        visible={detailsModalVisible} 
        transparent 
        animationType="none"
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback 
            onPress={() => {
              setDetailsModalVisible(false);
              translateY.setValue(0);
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheetContainer}>
            <Animated.View 
              style={[
                styles.bottomSheetContent,
                {
                  transform: [{ translateY: translateY }],
                },
              ]}
              pointerEvents="auto"
            >
              {/* Handle bar area with swipe gesture */}
              <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={(event) => {
                  if (event.nativeEvent.state === State.END) {
                    handleSwipeDown(event);
                  }
                }}
                activeOffsetY={[-10, 1000]}
                failOffsetX={[-50, 50]}
              >
                <View style={styles.bottomSheetHandleContainer}>
                  <View style={styles.bottomSheetHandle} />
                </View>
              </PanGestureHandler>
              
              {/* Header with edit button */}
              <View style={styles.bottomSheetHeader}>
                <View style={{ width: 32 }} />
                <Text style={styles.bottomSheetTitle}>{selectedEvent?.title}</Text>
                <TouchableOpacity 
                  onPress={() => selectedEvent && handleEditEvent(selectedEvent)}
                  style={styles.bottomSheetEditIconButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={20} color="#FF9500" />
                </TouchableOpacity>
              </View>
              
              {/* Content */}
              <ScrollView 
                style={styles.bottomSheetBody} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bottomSheetBodyContent}
              >
                {/* Doctor Section */}
                {selectedEvent?.doctor && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Doctor</Text>
                    <Text style={styles.infoValue}>{selectedEvent.doctor}</Text>
                  </View>
                )}
                
                {/* Date & Time Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Date & Time</Text>
                  <Text style={styles.infoValue}>{selectedEvent?.time}</Text>
                </View>
                
                {/* Location Section */}
                {selectedEvent?.location && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <TouchableOpacity onPress={() => openMaps(selectedEvent.location!)}>
                      <Text style={[styles.infoValue, styles.linkValue]}>{selectedEvent.location}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Notes Section */}
                {selectedEvent?.notes && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Notes</Text>
                    <Text style={styles.infoValue}>{selectedEvent.notes}</Text>
                  </View>
                )}
                
                {/* Attached File Section */}
                {selectedEvent?.attachedFile && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Attached File</Text>
                    <TouchableOpacity 
                      style={styles.attachedFileRow}
                      onPress={() => handleViewFile(selectedEvent.attachedFile.uri, selectedEvent.attachedFile.name, selectedEvent.attachedFile.type || undefined)}
                    >
                      <Ionicons name="document" size={18} color="#007AFF" />
                      <Text style={[styles.infoValue, styles.attachedFileName]}>{selectedEvent.attachedFile.name}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>

      <View style={{ alignItems: 'center', marginTop: 4 }}>
        {!showMore && (
          <TouchableOpacity onPress={() => setShowMore(true)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        )}
        {showMore && (
          <TouchableOpacity onPress={() => setShowMore(false)} style={styles.lessTab}>
            <Text style={styles.lessTabText}>Show Less</Text>
          </TouchableOpacity>
        )}
      </View>

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
    height: 80,
  },
  eventCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    height: 80,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    height: 80,
    paddingLeft: 8,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    height: 80,
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
  moreTab: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  moreTabText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  lessTab: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  lessTabText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    padding: 12,
  },
  closeButtonLeft: {
    position: 'absolute',
    left: 16,
    top: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    zIndex: 10,
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
  // Bottom Sheet Styles
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  bottomSheetContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSheetHandleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  bottomSheetCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetEditIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  bottomSheetBody: {
    flex: 0,
  },
  bottomSheetBodyContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  linkValue: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  attachedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomSheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  bottomSheetEditButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bottomSheetEditButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MedicalTimeline; 