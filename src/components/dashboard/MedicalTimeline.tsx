import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Image,
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
      details: 'Annual flu shot to protect against seasonal influenza.',
      location: {
        name: 'CVS Pharmacy',
        address: '789 Main Street, New York, NY 10003',
        phone: '(555) 456-7890',
        hours: 'Open daily 8:00 AM - 10:00 PM',
        cost: 'Free with insurance, $25 without'
      }
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
      details: 'Blood test to check cholesterol levels and cardiovascular health markers.',
      location: {
        name: 'Quest Diagnostics',
        address: '456 Lab Center Blvd, New York, NY 10004',
        phone: '(555) 789-0123',
        hours: 'Mon-Fri 7:00 AM - 6:00 PM, Sat 8:00 AM - 2:00 PM',
        cost: 'Covered by insurance, fasting required'
      }
    }
  ];

  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    doctor: '',
    date: '',
    time: '',
    details: '',
    documents: [] as Array<{ uri: string; name: string; type: 'image' | 'document' }>
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Appointment title suggestions
  const appointmentSuggestions = [
    'Dentist Check Up Annual',
    'Dentist Hygienist Cleaning',
    'Dentist Root Canal',
    'Dentist Filling',
    'Dentist X-Ray',
    'Dentist Consultation',
    'Annual Physical',
    'Blood Work',
    'Cardiologist Consultation',
    'Dermatologist Check',
    'Eye Exam',
    'Flu Shot',
    'Vaccination',
    'Physical Therapy',
    'Chiropractor',
    'Massage Therapy',
    'Mental Health Session',
    'Nutritionist Consultation',
    'Lab Work',
    'X-Ray',
    'MRI Scan',
    'Ultrasound',
    'Surgery Consultation',
    'Follow Up Appointment',
    'Emergency Visit',
    'Specialist Consultation',
    'Vaccination',
    'Immunization',
    'Health Screening',
    'Preventive Care'
  ];

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
    if (event.type === 'appointment' || event.type === 'preventive' || event.type === 'reminder') {
      setSelectedEvent(event);
      setShowEventModal(true);
    } else {
      onEventPress?.(event);
    }
  };

  const handleAddAppointment = () => {
    setShowAddModal(true);
  };

  const filteredSuggestions = appointmentSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(newAppointment.title.toLowerCase())
  );

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleTitleChange = (text: string) => {
    setNewAppointment(prev => ({ ...prev, title: text }));
    setShowSuggestions(text.length > 0);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setNewAppointment(prev => ({ ...prev, title: suggestion }));
    setShowSuggestions(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setNewAppointment(prev => ({ ...prev, date: formatDate(date) }));
    setShowDatePicker(false);
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setNewAppointment(prev => ({ ...prev, time: formatTime(time) }));
    setShowTimePicker(false);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newDocument = {
          uri: result.assets[0].uri,
          name: `Photo_${Date.now()}.jpg`,
          type: 'image' as const,
        };
        setNewAppointment(prev => ({
          ...prev,
          documents: [...prev.documents, newDocument]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const newDocument = {
          uri: result.assets[0].uri,
          name: result.assets[0].name || `Document_${Date.now()}`,
          type: 'document' as const,
        };
        setNewAppointment(prev => ({
          ...prev,
          documents: [...prev.documents, newDocument]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveDocument = (index: number) => {
    setNewAppointment(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSaveAppointment = (isDraft: boolean = false) => {
    if (!newAppointment.title || !newAppointment.date) {
      Alert.alert('Error', 'Please fill in the title and date');
      return;
    }

    const newEvent: MedicalEvent = {
      id: `appointment_${Date.now()}`,
      type: 'appointment',
      title: newAppointment.title,
      subtitle: newAppointment.doctor || 'No doctor specified',
      date: newAppointment.date,
      time: newAppointment.time || undefined,
      priority: 'medium',
      status: isDraft ? 'upcoming' : 'upcoming',
      icon: 'medical',
      details: newAppointment.details || 'No additional details',
      doctor: newAppointment.doctor ? {
        name: newAppointment.doctor,
        specialty: 'General',
        address: 'Address to be added',
        phone: 'Phone to be added'
      } : undefined
    };

    upcomingEvents.push(newEvent);
    setShowAddModal(false);
    setNewAppointment({ title: '', doctor: '', date: '', time: '', details: '', documents: [] });
    Alert.alert('Success', `Appointment ${isDraft ? 'saved as draft' : 'added'} successfully!`);
  };

  const renderRightActions = (event: MedicalEvent) => (
    <View style={styles.rightActionsFull}>
      {event.type === 'medication' && (
        <TouchableOpacity
          style={[styles.fullWidthActionButton, styles.ignoreButton]}
          onPress={() => setCompleted(prev => [...prev, event.id])}
        >
          <Ionicons name="close-circle" size={24} color="#FF9500" />
          <Text style={styles.ignoreText}>Ignore</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.fullWidthActionButton, styles.doneButton]}
        onPress={() => setCompleted(prev => [...prev, event.id])}
      >
        <Ionicons name="checkmark-circle" size={24} color="#30D158" />
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
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

  const renderEventsByDate = () => {
    // Sort all events chronologically by date
    const sortedEvents = [...upcomingEvents]
      .filter(e => !completed.includes(e.id))
      .sort((a, b) => {
        // Convert date strings to Date objects for comparison
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    // Group events by date category
    const todayEvents = sortedEvents.filter((e: MedicalEvent) => e.date === 'Today');
    const thisWeekEvents = sortedEvents.filter((e: MedicalEvent) => e.date === 'This week');
    const upcomingEventsList = sortedEvents.filter((e: MedicalEvent) => 
      e.date !== 'Today' && e.date !== 'This week' && !e.date.includes('2024') && !e.date.includes('2025')
    );
    const futureEvents = sortedEvents.filter((e: MedicalEvent) => 
      e.date.includes('2024') || e.date.includes('2025')
    );

    // Show limited events when not expanded
    const limitedEvents = showAllEvents ? sortedEvents : sortedEvents.slice(0, 3);

    if (showAllEvents) {
    return (
      <>
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
        
          {upcomingEventsList.length > 0 && (
          <>
            <Text style={styles.categoryTitle}>Upcoming</Text>
              {upcomingEventsList.map(renderEvent)}
            </>
          )}
          
          {futureEvents.length > 0 && (
            <>
              <Text style={styles.categoryTitle}>Future</Text>
              {futureEvents.map(renderEvent)}
          </>
        )}
      </>
    );
    } else {
      return (
        <>
          {limitedEvents.map(renderEvent)}
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color="#007AFF" />
          <Text style={styles.title}>Medical Timeline</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAllEvents(!showAllEvents)}>
          <Text style={styles.viewAllText}>
            {showAllEvents ? 'Show Less' : 'View All'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {renderEventsByDate()}
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

              {selectedEvent.location && (
                <View style={styles.locationSection}>
                  <Text style={styles.sectionTitle}>Location Information</Text>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{selectedEvent.location.name}</Text>
                    <Text style={styles.locationAddress}>{selectedEvent.location.address}</Text>
                    <Text style={styles.locationPhone}>{selectedEvent.location.phone}</Text>
                    <Text style={styles.locationHours}>{selectedEvent.location.hours}</Text>
                    <Text style={styles.locationCost}>{selectedEvent.location.cost}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Appointment</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Appointment Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newAppointment.title}
                onChangeText={handleTitleChange}
                placeholder="e.g., Annual Physical"
                placeholderTextColor="#8E8E93"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={filteredSuggestions.slice(0, 5)}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleSuggestionPress(item)}
                      >
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Doctor Name</Text>
              <TextInput
                style={styles.textInput}
                value={newAppointment.doctor}
                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, doctor: text }))}
                placeholder="e.g., Dr. Sarah Chen"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.textInputText, { color: newAppointment.date ? '#FFFFFF' : '#8E8E93' }]}>
                  {newAppointment.date || 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.textInputText, { color: newAppointment.time ? '#FFFFFF' : '#8E8E93' }]}>
                  {newAppointment.time || 'Select time'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Details</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newAppointment.details}
                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, details: text }))}
                placeholder="Additional details about the appointment..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Document Attachment Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Attachments</Text>
              <View style={styles.attachmentButtons}>
                <TouchableOpacity style={styles.attachmentButton} onPress={handleTakePhoto}>
                  <Ionicons name="camera" size={20} color="#007AFF" />
                  <Text style={styles.attachmentButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentButton} onPress={handlePickDocument}>
                  <Ionicons name="document" size={20} color="#007AFF" />
                  <Text style={styles.attachmentButtonText}>Add Document</Text>
                </TouchableOpacity>
              </View>
              
              {/* Display attached documents */}
              {newAppointment.documents.length > 0 && (
                <View style={styles.documentsList}>
                  {newAppointment.documents.map((doc, index) => (
                    <View key={index} style={styles.documentItem}>
                      {doc.type === 'image' ? (
                        <Image source={{ uri: doc.uri }} style={styles.documentThumbnail} />
                      ) : (
                        <View style={styles.documentIcon}>
                          <Ionicons name="document" size={24} color="#007AFF" />
                        </View>
                      )}
                      <Text style={styles.documentName} numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <TouchableOpacity 
                        style={styles.removeDocumentButton}
                        onPress={() => handleRemoveDocument(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.saveButton, styles.draftButton]} 
                onPress={() => handleSaveAppointment(true)}
              >
                <Text style={styles.saveButtonText}>Save as Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={() => handleSaveAppointment(false)}
              >
                <Text style={styles.saveButtonText}>Save Appointment</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) {
                    handleDateSelect(date);
                  }
                }}
                style={styles.dateTimePicker}
                textColor="#FFFFFF"
              />
              <View style={styles.pickerButtons}>
                <TouchableOpacity 
                  style={styles.pickerButton} 
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.pickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.pickerButtonPrimary]} 
                  onPress={() => {
                    handleDateSelect(selectedDate);
                  }}
                >
                  <Text style={[styles.pickerButtonText, styles.pickerButtonTextPrimary]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  if (time) {
                    handleTimeSelect(time);
                  }
                }}
                style={styles.dateTimePicker}
                textColor="#FFFFFF"
              />
              <View style={styles.pickerButtons}>
                <TouchableOpacity 
                  style={styles.pickerButton} 
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.pickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.pickerButtonPrimary]} 
                  onPress={() => {
                    handleTimeSelect(selectedTime);
                  }}
                >
                  <Text style={[styles.pickerButtonText, styles.pickerButtonTextPrimary]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActionsFull: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  fullWidthActionButton: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ignoreButton: {
    backgroundColor: '#FF9500',
  },
  doneButton: {
    backgroundColor: '#30D158',
  },
  ignoreText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
  locationSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  locationInfo: {
    gap: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationAddress: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  locationPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  locationHours: {
    fontSize: 14,
    color: '#8E8E93',
  },
  locationCost: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  suggestionsContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  suggestionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  textInputText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  draftButton: {
    backgroundColor: '#8E8E93',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF30',
  },
  attachmentButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  documentsList: {
    marginTop: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  removeDocumentButton: {
    padding: 4,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateTimePicker: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 20,
  },
  pickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  pickerButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pickerButtonTextPrimary: {
    color: '#FFFFFF',
  },
});

export default MedicalTimeline; 