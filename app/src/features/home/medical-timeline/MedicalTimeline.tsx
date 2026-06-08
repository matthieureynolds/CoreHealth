import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FileViewerModal from '../../../shared/components/modals/FileViewerModal';
import EmptyState from '../../../shared/components/feedback/EmptyState';
import { useSettings } from '../../../shared/context/SettingsContext';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { recordAdherence, getDateKey } from '../../../shared/utils/medicationAdherence';
import type { Screening } from '../../../shared/types';
import type { MedicalEvent } from './types';
import AddAppointmentModal from './components/AddAppointmentModal';
import EventDetailsModal from './components/EventDetailsModal';
import TimelineEventCard from './components/TimelineEventCard';
import BpReadingModal from './components/BpReadingModal';
import { DataService } from '../../../shared/services/data/dataService';

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

function rowToEvent(row: any, is12h: boolean): MedicalEvent {
  const date = new Date(row.event_date);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: is12h });
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? row.doctor ?? 'Appointment',
    time: `${dateStr} • ${timeStr}`,
    status: new Date(row.event_date) > new Date() ? 'UPCOMING' : 'PAST',
    icon: 'medical' as any,
    iconColor: '#3AABF0',
    doctor: row.doctor ?? undefined,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
  };
}

const MedicalTimeline: React.FC = () => {
  const { settings } = useSettings();
  const { profile, updateProfile } = useHealthData();
  const { user } = useAuth();

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

  useFocusEffect(useCallback(() => {
    if (!user?.id) return;
    DataService.getAppointments(user.id)
      .then(rows => setEvents(rows.map(r => rowToEvent(r, is12h))))
      .catch(() => {});
  }, [user?.id, is12h]));

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
    if (action === 'ignore' && user?.id) {
      DataService.deleteAppointment(user.id, eventId).catch(() => {});
    }
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

  const hasMoreEvents = grouped.thisWeek.length > 0 || grouped.nextMonth.length > 0 || grouped.future.length > 0;

  return (
    <View style={events.length === 0 ? styles.containerEmpty : styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={24} color="#3AABF0" />
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

      {hasMoreEvents && (
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <TouchableOpacity onPress={() => setShowMore(v => !v)} style={styles.moreTab}>
            <Text style={styles.moreTabText}>{showMore ? 'Show Less' : '+ More'}</Text>
          </TouchableOpacity>
        </View>
      )}

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
        onSave={async event => {
          if (!user?.id) return;
          // Parse the formatted time string back to ISO for storage
          // Format is "DD Mon YYYY • HH:MM" or "Today • HH:MM"
          try {
            const parts = event.time.split(' • ');
            const datePart = parts[0]?.trim() ?? '';
            const timePart = parts[1]?.trim() ?? '09:00';
            let baseDate = new Date();
            if (datePart.toLowerCase() !== 'today' && datePart.toLowerCase() !== 'tomorrow') {
              const parsed = new Date(datePart);
              if (!isNaN(parsed.getTime())) baseDate = parsed;
            } else if (datePart.toLowerCase() === 'tomorrow') {
              baseDate.setDate(baseDate.getDate() + 1);
            }
            // Merge time
            const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (timeMatch) {
              let h = parseInt(timeMatch[1], 10);
              const m = parseInt(timeMatch[2], 10);
              if (timeMatch[3]) {
                if (/pm/i.test(timeMatch[3]) && h < 12) h += 12;
                if (/am/i.test(timeMatch[3]) && h === 12) h = 0;
              }
              baseDate.setHours(h, m, 0, 0);
            }
            const payload = {
              title: event.title,
              subtitle: event.subtitle,
              eventDate: baseDate.toISOString(),
              doctor: event.doctor,
              location: event.location,
              notes: event.notes,
            };
            const isEdit = events.some(e => e.id === event.id);
            if (isEdit) {
              await DataService.updateAppointment(user.id, event.id, payload);
              setEvents(prev => prev.map(e => e.id === event.id ? event : e));
            } else {
              const saved = await DataService.addAppointment(user.id, payload);
              setEvents(prev => [rowToEvent(saved, is12h), ...prev]);
            }
          } catch {
            setEvents(prev => {
              const exists = prev.some(e => e.id === event.id);
              return exists ? prev.map(e => e.id === event.id ? event : e) : [event, ...prev];
            });
          }
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
  containerEmpty: { backgroundColor: '#1C1C1E', borderRadius: 20, padding: 20, paddingBottom: 2, marginHorizontal: 16, marginVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8, flex: 1 },
  categoryTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 8, marginTop: 16, marginLeft: 16, textAlign: 'left' },
  moreTab: { alignItems: 'center', paddingVertical: 8 },
  moreTabText: { color: '#3AABF0', fontWeight: '600', fontSize: 14 },
});
