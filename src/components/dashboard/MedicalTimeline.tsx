import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
}

interface MedicalTimelineProps {
  onEventPress?: (event: MedicalEvent) => void;
  onViewAllPress?: () => void;
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ 
  onEventPress, 
  onViewAllPress 
}) => {
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
      icon: 'medical'
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
      icon: 'medical-outline'
    },
    {
      id: 'flu_shot',
      type: 'preventive',
      title: 'Flu Vaccination',
      subtitle: 'Annual immunization',
      date: 'This week',
      priority: 'high',
      status: 'due',
      icon: 'shield-checkmark'
    },
    {
      id: 'cholesterol_check',
      type: 'reminder',
      title: 'Cholesterol Check',
      subtitle: 'Schedule lab work',
      date: 'Jan 2025',
      priority: 'medium',
      status: 'upcoming',
      icon: 'analytics'
    }
  ];

  const [completed, setCompleted] = useState<string[]>([]);
  const [ignored, setIgnored] = useState<string[]>([]);

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

  const renderEvent = (event: MedicalEvent) => {
    if (completed.includes(event.id) || ignored.includes(event.id)) return null;
    const eventColor = getEventColor(event);
    const statusText = getStatusText(event.status);

    // Special logic for Vitamin D Supplement
    if (event.id === 'vitamin_d') {
      const renderRightActions = () => (
        <TouchableOpacity
          style={styles.ignoreButton}
          onPress={() => setIgnored(prev => [...prev, event.id])}
        >
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
          <Text style={styles.ignoreText}>Ignore</Text>
        </TouchableOpacity>
      );
      return (
        <Swipeable renderRightActions={renderRightActions}>
          <View style={styles.eventItem}>
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
            <TouchableOpacity onPress={() => setCompleted(prev => [...prev, event.id])} style={styles.tickButton}>
              <Ionicons name="checkmark-circle" size={22} color="#30D158" />
            </TouchableOpacity>
          </View>
        </Swipeable>
      );
    }

    // Default event rendering
    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventItem}
        onPress={() => onEventPress?.(event)}
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
    );
  };

  const renderEventsByCategory = () => {
    const dueEvents = upcomingEvents.filter(e => e.status === 'due' || e.status === 'overdue');
    const upcomingEventsFiltered = upcomingEvents.filter(e => e.status === 'upcoming');

    return (
      <>
        {dueEvents.length > 0 && (
          <>
            <Text style={styles.categoryTitle}>Due Now</Text>
            {dueEvents.map(renderEvent)}
          </>
        )}
        
        {upcomingEventsFiltered.length > 0 && (
          <>
            <Text style={styles.categoryTitle}>Upcoming</Text>
            {upcomingEventsFiltered.map(renderEvent)}
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
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {renderEventsByCategory()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Appointment</Text>
        </TouchableOpacity>
      </View>
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
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  eventsList: {
    maxHeight: 240,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 8,
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  tickButton: {
    padding: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ignoreButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
    marginRight: 8,
  },
  ignoreText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
});

export default MedicalTimeline; 