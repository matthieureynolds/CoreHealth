import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { Medication } from '../../../../../../shared/types';
import { getAdherence, getLastNDays, type AdherenceData } from '../../../../../../shared/utils/medicationAdherence';
import FileViewerModal from '../../../../../../shared/components/modals/FileViewerModal';
import MedicationFormModal from './MedicationFormModal';

const TIMELINE_MEDICATION_NAMES = ['Vitamin D Supplement'];

const MedicationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');
  const [adherenceData, setAdherenceData] = useState<AdherenceData>({});
  const [expandedAdherenceMed, setExpandedAdherenceMed] = useState<string | null>(null);

  const loadAdherence = useCallback(async () => {
    const data = await getAdherence();
    setAdherenceData(data);
  }, []);

  useFocusEffect(useCallback(() => { loadAdherence(); }, [loadAdherence]));

  const adherenceMedicationNames = [...TIMELINE_MEDICATION_NAMES, ...Object.keys(adherenceData)].filter((name, i, arr) => arr.indexOf(name) === i);

  const handleSave = (medication: Medication) => {
    const existing = profile?.medications || [];
    const isEdit = existing.some(m => m.id === medication.id);
    updateProfile({
      ...profile,
      medications: isEdit ? existing.map(m => m.id === medication.id ? medication : m) : [...existing, medication],
    });
    setShowAddModal(false);
    setEditingMedication(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Medication', 'Are you sure you want to delete this medication?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateProfile({ ...profile, medications: profile?.medications?.filter(m => m.id !== id) || [] }) },
    ]);
  };

  const openMedicationOptions = (m: Medication) => {
    Alert.alert(m.name, undefined, [
      { text: 'Edit', onPress: () => { setEditingMedication(m); setShowAddModal(true); } },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(m.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleViewFile = (fileUri: string, fileName: string, fileType?: string) => {
    setCurrentFileUri(fileUri); setCurrentFileName(fileName); setCurrentFileType(fileType || ''); setFileViewerVisible(true);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Medications</Text>
        <TouchableOpacity onPress={() => { setEditingMedication(null); setShowAddModal(true); }} style={styles.addButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.adherenceSection}>
          <Text style={styles.adherenceSectionTitle}>Adherence</Text>
          {adherenceMedicationNames.map((medName) => {
            const byDate = adherenceData[medName] ?? {};
            const last14 = getLastNDays(14);
            const isExpanded = expandedAdherenceMed === medName;
            return (
              <View key={medName} style={styles.adherenceCard}>
                <TouchableOpacity style={styles.adherenceCardHeader} onPress={() => setExpandedAdherenceMed(isExpanded ? null : medName)} activeOpacity={0.7}>
                  <View style={styles.adherenceCardHeaderLeft}>
                    <Text style={styles.adherenceMedName}>{medName}</Text>
                    <Text style={styles.adherenceCardSubtitle}>Tap to see days</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-down' : 'chevron-forward'} size={20} color="#8E8E93" />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.adherenceExpandedContent}>
                    <View style={styles.adherenceDaysRow}>
                      {last14.map((dateKey) => {
                        const action = byDate[dateKey];
                        const isTook = action === 'took'; const isSkipped = action === 'skipped';
                        return (
                          <View key={dateKey} style={styles.adherenceDayWrap}>
                            <View style={[styles.adherenceDay, isTook && styles.adherenceDayTook, isSkipped && styles.adherenceDaySkipped]}>
                              {isTook && <Ionicons name="checkmark" size={14} color="#fff" />}
                              {isSkipped && <Ionicons name="close" size={14} color="#fff" />}
                            </View>
                            <Text style={styles.adherenceDayLabel}>{dateKey.slice(-2)}</Text>
                          </View>
                        );
                      })}
                    </View>
                    <Text style={styles.adherenceLegend}>Last 14 days • green = took, orange = skipped</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.content}>
          {profile?.medications?.length ? (
            profile.medications.map((medication) => (
              <View key={medication.id} style={styles.medicationCard}>
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationDetails}>{medication.dosage} • {medication.frequency}</Text>
                    <Text style={styles.medicationDate}>Started: {formatDate(medication.startDate ?? '')}</Text>
                    {medication.duration && <Text style={styles.medicationDuration}>Duration: {medication.duration}</Text>}
                    {medication.notes && <Text style={styles.notes}>{medication.notes}</Text>}
                    {!!medication.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                          {medication.attachments.map(file => (
                            <TouchableOpacity key={file.uri} style={styles.attachmentChip} onPress={() => handleViewFile(file.uri, file.name, file.type)}>
                              <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                              <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => openMedicationOptions(medication)} style={styles.editPenButton} accessibilityLabel="Edit medication">
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Medications</Text>
              <Text style={styles.emptySubtitle}>Add your medications to keep track of your treatment</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => { setEditingMedication(null); setShowAddModal(true); }}>
                <Text style={styles.addFirstButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <MedicationFormModal
        visible={showAddModal}
        editingMedication={editingMedication}
        onClose={() => { setShowAddModal(false); setEditingMedication(null); }}
        onSave={handleSave}
      />

      <FileViewerModal visible={fileViewerVisible} onClose={() => setFileViewerVisible(false)} fileUri={currentFileUri} fileName={currentFileName} fileType={currentFileType} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#222', zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, elevation: 10 },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 24.7, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', position: 'absolute', left: 0, right: 0, paddingTop: 16.5, paddingBottom: 8 },
  addButton: { padding: 8, position: 'absolute', right: 20, top: 24.7, zIndex: 1 },
  adherenceSection: { paddingHorizontal: 20, paddingBottom: 24 },
  adherenceSectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  adherenceCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2C2C2E' },
  adherenceCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  adherenceCardHeaderLeft: { flex: 1 },
  adherenceMedName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 2 },
  adherenceCardSubtitle: { fontSize: 12, color: '#8E8E93' },
  adherenceExpandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  adherenceDaysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  adherenceDayWrap: { alignItems: 'center', width: 28 },
  adherenceDay: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3A3A3C', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  adherenceDayTook: { backgroundColor: '#34C759' },
  adherenceDaySkipped: { backgroundColor: '#FF9500' },
  adherenceDayLabel: { fontSize: 10, color: '#8E8E93' },
  adherenceLegend: { fontSize: 11, color: '#8E8E93' },
  content: { padding: 20 },
  medicationCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#007AFF', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  medicationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  medicationDetails: { fontSize: 14, color: '#007AFF', marginBottom: 4 },
  medicationDate: { fontSize: 14, color: '#888', marginBottom: 4 },
  medicationDuration: { fontSize: 14, color: '#888', marginBottom: 4 },
  notes: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  editPenButton: { position: 'absolute', top: 6, right: 6, padding: 6 },
  attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachmentText: { color: '#FFFFFF', fontSize: 12, marginLeft: 6, maxWidth: 140 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, paddingHorizontal: 40 },
  addFirstButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addFirstButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default MedicationsScreen;
