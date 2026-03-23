import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHealthData } from '../../../shared/context/HealthDataContext';
import { PastAppointment } from '../../../shared/types';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../../shared/components/FileViewerModal';

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
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setAttachedFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name || 'attachment',
          type: result.assets[0].mimeType,
        });
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not attach file');
    }
  };

  const addAppointment = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an appointment title');
      return;
    }
    const newAppointment: PastAppointment = {
      id: Date.now().toString(),
      title: title.trim(),
      doctor: doctor.trim() || undefined,
      date: appointmentDate || new Date(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      fileUrl: attachedFile?.uri,
      fileSize: attachedFile ? undefined : undefined,
    };
    const updated = [...(profile?.pastAppointments ?? []), newAppointment];
    updateProfile({ ...profile, pastAppointments: updated });
    setShowAddModal(false);
    setTitle('');
    setDoctor('');
    setAppointmentDate(null);
    setLocation('');
    setNotes('');
    setAttachedFile(null);
  };

  const deleteAppointment = (id: string) => {
    Alert.alert(
      'Delete appointment',
      'Remove this past appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = (profile?.pastAppointments ?? []).filter(a => a.id !== id);
            updateProfile({ ...profile, pastAppointments: updated });
            setSelectedAppointment(null);
          },
        },
      ]
    );
  };

  const openAttachment = (appointment: PastAppointment) => {
    if (!appointment.fileUrl) return;
    setViewingFileUri(appointment.fileUrl);
    setViewingFileName(appointment.title + ' attachment');
    setViewingFileType(appointment.fileUrl.toLowerCase().includes('.pdf') ? 'application/pdf' : '');
    setFileViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Appointments</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}>
        <View style={styles.content}>
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <TouchableOpacity
                key={apt.id}
                style={styles.card}
                onPress={() => setSelectedAppointment(apt)}
                activeOpacity={0.8}
              >
                <View style={styles.cardMain}>
                  <Text style={styles.cardTitle}>{apt.title}</Text>
                  {apt.doctor && <Text style={styles.cardDoctor}>{apt.doctor}</Text>}
                  <Text style={styles.cardDate}>{formatDate(apt.date)}</Text>
                  {apt.location && <Text style={styles.cardLocation}>{apt.location}</Text>}
                </View>
                {apt.fileUrl ? (
                  <TouchableOpacity
                    style={styles.attachmentBadge}
                    onPress={() => openAttachment(apt)}
                  >
                    <Ionicons name="document-attach" size={20} color="#007AFF" />
                    <Text style={styles.attachmentText}>Attachment</Text>
                  </TouchableOpacity>
                ) : null}
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
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

      {/* Detail modal */}
      <Modal visible={!!selectedAppointment} transparent animationType="slide" presentationStyle="pageSheet">
        {selectedAppointment && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedAppointment(null)}>
                  <Text style={styles.cancelButton}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Appointment</Text>
                <TouchableOpacity onPress={() => deleteAppointment(selectedAppointment.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.detailTitle}>{selectedAppointment.title}</Text>
                {selectedAppointment.doctor && (
                  <Text style={styles.detailRow}><Text style={styles.detailLabel}>Doctor:</Text> {selectedAppointment.doctor}</Text>
                )}
                <Text style={styles.detailRow}><Text style={styles.detailLabel}>Date:</Text> {formatDate(selectedAppointment.date)}</Text>
                {selectedAppointment.location && (
                  <Text style={styles.detailRow}><Text style={styles.detailLabel}>Location:</Text> {selectedAppointment.location}</Text>
                )}
                {selectedAppointment.notes && (
                  <Text style={styles.detailNotes}>{selectedAppointment.notes}</Text>
                )}
                {selectedAppointment.fileUrl && (
                  <TouchableOpacity style={styles.viewAttachmentButton} onPress={() => openAttachment(selectedAppointment)}>
                    <Ionicons name="document-attach" size={22} color="#007AFF" />
                    <Text style={styles.viewAttachmentText}>View attachment from doctor</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Add appointment modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add appointment</Text>
              <TouchableOpacity onPress={addAppointment}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Physical therapy, Dental checkup"
                placeholderTextColor="#8E8E93"
              />
              <Text style={styles.inputLabel}>Doctor</Text>
              <TextInput
                style={styles.input}
                value={doctor}
                onChangeText={setDoctor}
                placeholder="Dr. name"
                placeholderTextColor="#8E8E93"
              />
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={[styles.inputText, !appointmentDate && styles.placeholder]}>
                  {appointmentDate ? formatDate(appointmentDate) : 'Select date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, d) => {
                    setShowDatePicker(false);
                    if (d) setAppointmentDate(d);
                  }}
                />
              )}
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Clinic or hospital"
                placeholderTextColor="#8E8E93"
              />
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes from the visit"
                placeholderTextColor="#8E8E93"
                multiline
              />
              <Text style={styles.inputLabel}>Attachment from doctor</Text>
              <TouchableOpacity style={styles.attachButton} onPress={handleAttachFile}>
                <Ionicons name="document-attach" size={22} color="#007AFF" />
                <Text style={styles.attachButtonText}>
                  {attachedFile ? attachedFile.name : 'Attach PDF or image'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  addButton: { padding: 8 },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardMain: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardDoctor: { fontSize: 14, color: '#8E8E93', marginBottom: 2 },
  cardDate: { fontSize: 13, color: '#007AFF', marginBottom: 2 },
  cardLocation: { fontSize: 12, color: '#8E8E93' },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,122,255,0.15)',
  },
  attachmentText: { fontSize: 12, color: '#007AFF', marginLeft: 4, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8, paddingHorizontal: 24 },
  addFirstButton: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#007AFF', borderRadius: 12 },
  addFirstButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  cancelButton: { fontSize: 16, color: '#8E8E93' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  saveButton: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  deleteButton: { fontSize: 16, color: '#FF3B30', fontWeight: '600' },
  modalBody: { padding: 20 },
  detailTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 },
  detailRow: { fontSize: 15, color: '#E5E5EA', marginBottom: 8 },
  detailLabel: { color: '#8E8E93', fontWeight: '600' },
  detailNotes: { fontSize: 14, color: '#8E8E93', marginTop: 12, lineHeight: 22 },
  viewAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderRadius: 12,
  },
  viewAttachmentText: { fontSize: 16, color: '#007AFF', marginLeft: 10, fontWeight: '600' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  inputText: { fontSize: 16, color: '#fff' },
  placeholder: { color: '#8E8E93' },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  attachButtonText: { fontSize: 16, color: '#007AFF', marginLeft: 10 },
});

export default PastAppointmentsScreen;
