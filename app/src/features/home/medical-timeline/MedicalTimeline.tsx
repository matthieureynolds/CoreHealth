import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FileViewerModal from '../../../shared/components/modals/FileViewerModal';
import EmptyState from '../../../shared/components/feedback/EmptyState';
import { useSettings } from '../../../shared/context/SettingsContext';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { recordAdherence, getDateKey } from '../../../shared/utils/medicationAdherence';
import type { Screening } from '../../../shared/types';
import type { MedicalEvent } from './types';
import AddAppointmentModal from './components/AddAppointmentModal';
import EventDetailsModal from './components/EventDetailsModal';
import TimelineEventCard from './components/TimelineEventCard';
import BpReadingModal from './components/BpReadingModal';

type GroupKey = 'today' | 'tomorrow' | 'thisWeek' | 'nextMonth' | 'future';

const GROUP_LABELS: Record<GroupKey, string> = {
  today: 'Today', tomorrow: 'Tomorrow', thisWeek: 'This Week', nextMonth: 'Next Month', future: 'Future',
};

const groupEventsByDate = (events: MedicalEvent[]): Record<GroupKey, MedicalEvent[]> => {
  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();
  const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(now); nextMonth.setMonth(nextMonth.getMonth() + 1);

  const grouped: Record<GroupKey, MedicalEvent[]> = { today: [], tomorrow: [], thisWeek: [], nextMonth: [], future: [] };

  events.forEach(event => {
    const label = event.time.toLowerCase();
    if (label.includes('today')) { grouped.today.push(event); return; }
    if (label.includes('tomorrow')) { grouped.tomorrow.push(event); return; }
    const datePart = event.time.split('•')[0]?.trim();
    const parsed = datePart ? new Date(datePart) : null;
    if (parsed && !isNaN(parsed.getTime())) {
      const d = parsed.toDateString();
      if (d === todayStr) grouped.today.push(event);
      else if (d === tomorrowStr) grouped.tomorrow.push(event);
      else if (parsed <= nextWeek) grouped.thisWeek.push(event);
      else if (parsed <= nextMonth) grouped.nextMonth.push(event);
      else grouped.future.push(event);
    } else {
      grouped.future.push(event);
    }
  });
  return grouped;
};

interface MedicalTimelineProps {
  onEventPress?: (event: MedicalEvent) => void;
}

const MedicalTimeline: React.FC<MedicalTimelineProps> = () => {
  const { settings } = useSettings();
  const { profile, updateProfile } = useHealthData();

  const [events, setEvents]     = useState<MedicalEvent[]>([]);
  const [showMore, setShowMore] = useState(false);

  const [showBpModal, setShowBpModal]                 = useState(false);
  const [bpReading, setBpReading]                     = useState('');
  const [pendingBpEventId, setPendingBpEventId]       = useState<string | null>(null);

  const [addModalVisible, setAddModalVisible]         = useState(false);
  const [editingEvent, setEditingEvent]               = useState<MedicalEvent | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent]             = useState<MedicalEvent | null>(null);

  const [fileViewerVisible, setFileViewerVisible]     = useState(false);
  const [currentFileUri, setCurrentFileUri]           = useState('');
  const [currentFileName, setCurrentFileName]         = useState('');
  const [currentFileType, setCurrentFileType]         = useState('');

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
    recordAdherence(event.title, dateKey, action === 'done' ? 'took' : 'skipped').catch(() => {});
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
    if (!profile || !pendingBpEventId) { closeBpModal(); return; }
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
    updateProfile({ ...profile, screenings: [...(profile.screenings || []), newScreening] })
      .then(closeBpModal).catch(closeBpModal);
  };

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
        <TouchableOpacity onPress={() => { setEditingEvent(null); setAddModalVisible(true); }} style={{ padding: 6 }}>
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
              <TimelineEventCard
                key={event.id}
                event={event}
                formattedTime={formatEventTimeForDisplay(event.time)}
                onPress={ev => { setSelectedEvent(ev); setDetailsModalVisible(true); }}
                onAction={handleEventAction}
              />
            ))}
          </View>
        ))
      )}

      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <TouchableOpacity onPress={() => setShowMore(v => !v)} style={styles.moreTab}>
          <Text style={styles.moreTabText}>{showMore ? 'Show Less' : '+ More'}</Text>
        </TouchableOpacity>
      </View>

      <BpReadingModal
        visible={showBpModal}
        value={bpReading}
        onChange={setBpReading}
        onSkip={closeBpModal}
        onSave={saveBpAndClose}
      />

      <AddAppointmentModal
        visible={addModalVisible}
        editingEvent={editingEvent}
        onClose={() => { setAddModalVisible(false); setEditingEvent(null); }}
        onSave={event => {
          setEvents(prev => {
            const exists = prev.some(e => e.id === event.id);
            return exists ? prev.map(e => e.id === event.id ? event : e) : [event, ...prev];
          });
          setEditingEvent(null);
          setAddModalVisible(false);
        }}
      />

      <EventDetailsModal
        visible={detailsModalVisible}
        event={selectedEvent}
        onClose={() => setDetailsModalVisible(false)}
        onEdit={ev => { setDetailsModalVisible(false); setEditingEvent(ev); setAddModalVisible(true); }}
        onViewFile={(uri, name, type) => { setCurrentFileUri(uri); setCurrentFileName(name); setCurrentFileType(type || ''); setFileViewerVisible(true); }}
      />

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
  container: { backgroundColor: '#1C1C1E', borderRadius: 20, padding: 20, marginHorizontal: 16, marginVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8, flex: 1 },
  categoryTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 8, marginTop: 16, marginLeft: 16, textAlign: 'left' },
  moreTab: { alignItems: 'center', paddingVertical: 8 },
  moreTabText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
});
