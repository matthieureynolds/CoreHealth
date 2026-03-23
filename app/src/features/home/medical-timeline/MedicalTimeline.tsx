import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import FileViewerModal from '../../../shared/components/modals/FileViewerModal';
import EmptyState from '../../../shared/components/feedback/EmptyState';
import { useSettings } from '../../../shared/context/SettingsContext';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { recordAdherence, getDateKey } from '../../../shared/utils/medicationAdherence';
import type { Screening } from '../../../shared/types';
import type { MedicalEvent } from './types';
import AddAppointmentModal from './components/AddAppointmentModal';
import EventDetailsModal from './components/EventDetailsModal';

interface MedicalTimelineProps {
  onEventPress?: (event: MedicalEvent) => void;
}

type GroupKey = 'today' | 'tomorrow' | 'thisWeek' | 'nextMonth' | 'future';

const GROUP_LABELS: Record<GroupKey, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  thisWeek: 'This Week',
  nextMonth: 'Next Month',
  future: 'Future',
};

const groupEventsByDate = (events: MedicalEvent[]): Record<GroupKey, MedicalEvent[]> => {
  const now = new Date();
  const todayStr = now.toDateString();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const grouped: Record<GroupKey, MedicalEvent[]> = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    nextMonth: [],
    future: [],
  };

  events.forEach(event => {
    const label = event.time.toLowerCase();
    if (label.includes('today')) {
      grouped.today.push(event);
    } else if (label.includes('tomorrow')) {
      grouped.tomorrow.push(event);
    } else {
      // Try to parse a real date from the time string
      const datePart = event.time.split('•')[0]?.trim();
      const parsed = datePart ? new Date(datePart) : null;
      if (parsed && !isNaN(parsed.getTime())) {
        const d = parsed.toDateString();
        if (d === todayStr) {
          grouped.today.push(event);
        } else if (d === tomorrowStr) {
          grouped.tomorrow.push(event);
        } else if (parsed <= nextWeek) {
          grouped.thisWeek.push(event);
        } else if (parsed <= nextMonth) {
          grouped.nextMonth.push(event);
        } else {
          grouped.future.push(event);
        }
      } else {
        grouped.future.push(event);
      }
    }
  });

  return grouped;
};

const MedicalTimeline: React.FC<MedicalTimelineProps> = () => {
  const { settings } = useSettings();
  const { profile, updateProfile } = useHealthData();

  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [showMore, setShowMore] = useState(false);

  // Blood pressure modal state
  const [showBpModal, setShowBpModal] = useState(false);
  const [bpReading, setBpReading] = useState('');
  const [pendingBpEventId, setPendingBpEventId] = useState<string | null>(null);

  // Add/Edit modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MedicalEvent | null>(null);

  // Details modal state
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);

  // File viewer state
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  const is12h = settings?.general?.timeFormat === '12h';

  const formatEventTimeForDisplay = (label: string): string => {
    if (is12h) return label;
    return label.replace(/(\d{1,2}):(\d{2})\s?(AM|PM)/gi, (_match, h, m, ap) => {
      let hours = parseInt(h, 10);
      if (/pm/i.test(ap) && hours < 12) hours += 12;
      if (/am/i.test(ap) && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${m}`;
    });
  };

  const handleEventAction = (eventId: string, action: 'done' | 'ignore') => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (action === 'done' && event.title === 'Blood Pressure Check') {
      setPendingBpEventId(eventId);
      setBpReading('');
      setShowBpModal(true);
      return;
    }

    const dateKey = getDateKey(new Date());
    const adherenceAction = action === 'done' ? ('took' as const) : ('skipped' as const);
    recordAdherence(event.title, dateKey, adherenceAction).catch(() => {});
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const closeBpModal = () => {
    const idToRemove = pendingBpEventId;
    setPendingBpEventId(null);
    setShowBpModal(false);
    setBpReading('');
    if (idToRemove) {
      const dateKey = getDateKey(new Date());
      recordAdherence('Blood Pressure Check', dateKey, 'took').catch(() => {});
      setEvents(prev => prev.filter(e => e.id !== idToRemove));
    }
  };

  const saveBpAndClose = () => {
    if (!profile || !pendingBpEventId) {
      closeBpModal();
      return;
    }
    const reading = bpReading.trim();
    let result: 'normal' | 'abnormal' | 'inconclusive' = 'normal';
    if (reading) {
      const match = reading.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const systolic = parseInt(match[1], 10);
        const diastolic = parseInt(match[2], 10);
        if (systolic > 130 || diastolic > 80) result = 'abnormal';
      }
    }
    const newScreening: Screening = {
      id: Date.now().toString(),
      name: 'Blood Pressure',
      date: new Date(),
      result,
      notes: reading ? `${reading} mmHg` : undefined,
    };
    const updatedScreenings = [...(profile.screenings || []), newScreening];
    updateProfile({ ...profile, screenings: updatedScreenings })
      .then(closeBpModal)
      .catch(closeBpModal);
  };

  const handleEventPress = (event: MedicalEvent) => {
    setSelectedEvent(event);
    setDetailsModalVisible(true);
  };

  const handleEditFromDetails = (event: MedicalEvent) => {
    setDetailsModalVisible(false);
    setEditingEvent(event);
    setAddModalVisible(true);
  };

  const handleSaveAppointment = (event: MedicalEvent) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === event.id);
      if (exists) return prev.map(e => (e.id === event.id ? event : e));
      return [event, ...prev];
    });
    setEditingEvent(null);
    setAddModalVisible(false);
  };

  const handleViewFile = (fileUri: string, fileName: string, fileType?: string) => {
    setCurrentFileUri(fileUri);
    setCurrentFileName(fileName);
    setCurrentFileType(fileType || '');
    setFileViewerVisible(true);
  };

  const renderRightActions = (eventId: string) => (
    <View style={styles.swipeActions}>
      <RectButton
        style={[styles.swipeAction, styles.doneAction]}
        onPress={() => handleEventAction(eventId, 'done')}
      >
        <Ionicons name="checkmark" size={20} color="#fff" />
        <Text style={styles.swipeActionText}>Done</Text>
      </RectButton>
      <RectButton
        style={[styles.swipeAction, styles.ignoreAction]}
        onPress={() => handleEventAction(eventId, 'ignore')}
      >
        <Ionicons name="close" size={20} color="#fff" />
        <Text style={styles.swipeActionText}>Ignore</Text>
      </RectButton>
    </View>
  );

  const grouped = groupEventsByDate(events);
  const visibleGrouped: Record<GroupKey, MedicalEvent[]> = showMore
    ? grouped
    : { today: grouped.today, tomorrow: grouped.tomorrow, thisWeek: [], nextMonth: [], future: [] };

  const groupEntries = (Object.entries(visibleGrouped) as [GroupKey, MedicalEvent[]][]).filter(
    ([, evts]) => evts.length > 0
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={24} color="#007AFF" />
        <Text style={styles.title}>Medical Timeline</Text>
        <TouchableOpacity
          onPress={() => {
            setEditingEvent(null);
            setAddModalVisible(true);
          }}
          style={{ padding: 6 }}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {events.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Appointments"
          subtitle="Add your medical appointments to keep track of your health schedule"
          iconColor="#8E8E93"
        />
      ) : (
        groupEntries.map(([category, categoryEvents]) => (
          <View key={category}>
            <Text style={styles.categoryTitle}>{GROUP_LABELS[category]}</Text>
            {categoryEvents.map(event => (
              <Swipeable
                key={event.id}
                renderRightActions={() => renderRightActions(event.id)}
                friction={2}
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
        ))
      )}

      {/* Blood Pressure reading modal */}
      <Modal visible={showBpModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={styles.bpCard}>
            <Text style={styles.bpTitle}>Blood pressure?</Text>
            <Text style={styles.bpSubtitle}>Add your reading or skip</Text>
            <TextInput
              style={styles.bpInput}
              value={bpReading}
              onChangeText={setBpReading}
              placeholder="e.g. 120/80"
              placeholderTextColor="#8E8E93"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <View style={styles.bpButtons}>
              <TouchableOpacity style={styles.bpSkip} onPress={closeBpModal}>
                <Text style={styles.bpSkipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bpSave} onPress={saveBpAndClose}>
                <Text style={styles.bpSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AddAppointmentModal
        visible={addModalVisible}
        editingEvent={editingEvent}
        onClose={() => {
          setAddModalVisible(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveAppointment}
      />

      <EventDetailsModal
        visible={detailsModalVisible}
        event={selectedEvent}
        onClose={() => setDetailsModalVisible(false)}
        onEdit={handleEditFromDetails}
        onViewFile={handleViewFile}
      />

      <View style={{ alignItems: 'center', marginTop: 4 }}>
        {!showMore ? (
          <TouchableOpacity onPress={() => setShowMore(true)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>+ More</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowMore(false)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>Show Less</Text>
          </TouchableOpacity>
        )}
      </View>

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

export default MedicalTimeline;

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
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 16,
    textAlign: 'left',
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
  moreTab: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  moreTabText: {
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
  bpCard: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  bpTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bpSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 16,
  },
  bpInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 20,
  },
  bpButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  bpSkip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#3A3A3C',
  },
  bpSkipText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  bpSave: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  bpSaveText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
