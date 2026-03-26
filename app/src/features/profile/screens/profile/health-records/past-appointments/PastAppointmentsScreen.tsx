import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { PastAppointment } from '../../../../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../../../../../shared/components/modals/FileViewerModal';
import AppointmentCard from './components/AppointmentCard';
import AppointmentDetailModal from './components/AppointmentDetailModal';
import AddAppointmentModal from './components/AddAppointmentModal';

const PastAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ uri: string; name: string; type?: string } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<PastAppointment | null>(null);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [viewingFileUri, setViewingFileUri] = useState('');
  const [viewingFileName, setViewingFileName] = useState('');
  const [viewingFileType, setViewingFileType] = useState('');

  const appointments = (profile?.pastAppointments ?? []).slice().sort((a, b) => {
    const dA = a.date instanceof Date ? a.date.getTime() : new Date(a.date as any).getTime();
    const dB = b.date instanceof Date ? b.date.getTime() : new Date(b.date as any).getTime();
    return dB - dA;
  });

  const formatDate = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets[0]) {
        setAttachedFile({ uri: result.assets[0].uri, name: result.assets[0].name || 'attachment', type: result.assets[0].mimeType });
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not attach file');
    }
  };

  const addAppointment = () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter an appointment title'); return; }
    const newAppointment: PastAppointment = {
      id: Date.now().toString(),
      title: title.trim(),
      doctor: doctor.trim() || undefined,
      date: appointmentDate || new Date(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      fileUrl: attachedFile?.uri,
      fileSize: undefined,
    };
    updateProfile({ ...profile, pastAppointments: [...(profile?.pastAppointments ?? []), newAppointment] });
    setShowAddModal(false);
    setTitle(''); setDoctor(''); setAppointmentDate(null); setLocation(''); setNotes(''); setAttachedFile(null);
  };

  const deleteAppointment = (id: string) => {
    Alert.alert('Delete appointment', 'Remove this past appointment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          updateProfile({ ...profile, pastAppointments: (profile?.pastAppointments ?? []).filter(a => a.id !== id) });
          setSelectedAppointment(null);
        },
      },
    ]);
  };

  const openAttachment = (apt: PastAppointment) => {
    if (!apt.fileUrl) return;
    setViewingFileUri(apt.fileUrl);
    setViewingFileName(apt.title + ' attachment');
    setViewingFileType(apt.fileUrl.toLowerCase().includes('.pdf') ? 'application/pdf' : '');
    setFileViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Appointments</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#3AABF0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95, paddingBottom: 40 }}>
        <View style={styles.content}>
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onPress={setSelectedAppointment}
                onAttachmentPress={openAttachment}
                formatDate={formatDate}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No past appointments</Text>
              <Text style={styles.emptySubtitle}>Add appointments you attended and attach notes or documents from the doctor</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onDelete={deleteAppointment}
        onViewAttachment={openAttachment}
        formatDate={formatDate}
      />

      <AddAppointmentModal
        visible={showAddModal}
        title={title}
        doctor={doctor}
        appointmentDate={appointmentDate}
        location={location}
        notes={notes}
        attachedFile={attachedFile}
        showDatePicker={showDatePicker}
        onClose={() => setShowAddModal(false)}
        onSave={addAppointment}
        onChangeTitle={setTitle}
        onChangeDoctor={setDoctor}
        onChangeLoc={setLocation}
        onChangeNotes={setNotes}
        onShowDatePicker={() => setShowDatePicker(true)}
        onDateChange={(_, d) => { setShowDatePicker(false); if (d) setAppointmentDate(d); }}
        onAttachFile={handleAttachFile}
        formatDate={formatDate}
      />

      <FileViewerModal
        visible={fileViewerVisible}
        onClose={() => setFileViewerVisible(false)}
        fileUri={viewingFileUri}
        fileName={viewingFileName}
        fileType={viewingFileType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  addButton: { padding: 8 },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8, paddingHorizontal: 24 },
  addFirstButton: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#3AABF0', borderRadius: 12 },
  addFirstButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default PastAppointmentsScreen;
