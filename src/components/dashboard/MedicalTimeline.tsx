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
    section: 'This Week',
    icon: 'shield-checkmark-outline',
    title: 'Flu Vaccination',
    subtitle: 'Annual immunization',
    time: 'This week',
    status: 'DUE',
  },
];

const groupedEvents = {
  Today: mockEvents.filter(e => e.section === 'Today'),
  'This Week': mockEvents.filter(e => e.section === 'This Week'),
  Future: [],
};

const MedicalTimeline = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={20} color="#007AFF" />
        <Text style={styles.title}>Medical Timeline</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>Show Less</Text>
        </TouchableOpacity>
      </View>
      {Object.entries(groupedEvents).map(([section, events]) => (
        <View key={section} style={styles.section}>
          <Text style={styles.sectionHeader}>{section}</Text>
          {events.length === 0 && <View style={styles.emptySection} />}
          {events.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.iconCircle}>
                <Ionicons name={event.icon as any} size={22} color="#FFB300" />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
              <Text style={styles.eventStatus}>{event.status}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          ))}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton}>
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
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
    fontWeight: '600',
    fontSize: 16,
  },
  eventSubtitle: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
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
});

export default MedicalTimeline; 