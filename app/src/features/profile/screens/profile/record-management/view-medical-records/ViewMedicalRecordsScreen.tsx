import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { MedicalRecord } from '../../../../../../shared/types';
import * as Sharing from 'expo-sharing';
import RecordsHeader from './components/RecordsHeader';
import RecordCard from './components/RecordCard';
import RecordDetailModal from './components/RecordDetailModal';
import FilterModal from './components/FilterModal';
import EditRecordModal from './components/EditRecordModal';

const RECORD_TYPES = [
  { value: 'all', label: 'All Records' },
  { value: 'lab_result', label: 'Lab Results' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'prescription', label: 'Prescriptions' },
  { value: 'consultation', label: 'Consultations' },
  { value: 'procedure', label: 'Procedures' },
  { value: 'other', label: 'Other' },
];

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'lab_result': return 'flask-outline';
    case 'imaging': return 'scan-outline';
    case 'prescription': return 'medical-outline';
    case 'consultation': return 'people-outline';
    case 'procedure': return 'bandage-outline';
    default: return 'document-outline';
  }
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'lab_result': return '#4CD964';
    case 'imaging': return '#3AABF0';
    case 'prescription': return '#FF9500';
    case 'consultation': return '#6BCF7F';
    case 'procedure': return '#FF3B30';
    default: return '#888';
  }
};

const formatDate = (date: Date): string => date.toLocaleDateString();

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  const mb = bytes / (1024 * 1024);
  return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};

const ViewMedicalRecordsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  const deleteRecord = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this medical record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedRecords = profile?.medicalRecords?.filter(r => r.id !== id) || [];
            updateProfile({ ...profile, medicalRecords: updatedRecords });
            setSelectedRecord(null);
          },
        },
      ]
    );
  };

  const shareRecord = async (record: MedicalRecord) => {
    try {
      if (!record.fileUrl) {
        Alert.alert('Share', 'No file available to share.');
        return;
      }
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Share not available', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(record.fileUrl, {
        mimeType: record.fileUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : undefined,
        dialogTitle: `Share ${record.name}`,
        UTI: 'public.data',
      });
    } catch (e) {
      console.error('Share error', e);
      Alert.alert('Error', 'Could not share this record.');
    }
  };

  const openEditRecord = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setEditName(record.name || '');
    setEditNotes(record.notes || '');
    setEditTags((record.tags || []).join(', '));
    setEditModalVisible(true);
  };

  const saveEditRecord = () => {
    if (!editingRecordId) return;
    const updated = (profile?.medicalRecords || []).map(r => {
      if (r.id !== editingRecordId) return r;
      const updatedTags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      return {
        ...r,
        name: editName.trim() || r.name,
        notes: editNotes.trim() || undefined,
        tags: updatedTags.length ? updatedTags : undefined,
      } as MedicalRecord;
    });
    updateProfile({ ...profile, medicalRecords: updated });
    setEditModalVisible(false);
    setEditingRecordId(null);
  };

  const filteredRecords = profile?.medicalRecords?.filter(
    record => selectedFilter === 'all' || record.type === selectedFilter
  ) || [];

  const currentFilterLabel = RECORD_TYPES.find(t => t.value === selectedFilter)?.label || '';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <RecordsHeader
          onBack={() => navigation.goBack()}
          onAdd={() => navigation.navigate('UploadMedicalRecord')}
          onFilter={() => setShowFilterModal(true)}
        />

        <View style={styles.filterDisplay}>
          <Text style={styles.filterText}>{currentFilterLabel}</Text>
          <Text style={styles.recordCount}>
            {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.content}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onView={setSelectedRecord}
                onEdit={openEditRecord}
                onShare={shareRecord}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                formatDate={formatDate}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Medical Records</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'all'
                  ? 'Upload your first medical record to get started'
                  : `No ${currentFilterLabel.toLowerCase()} found`}
              </Text>
              {selectedFilter === 'all' && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => navigation.navigate('UploadMedicalRecord')}
                >
                  <Text style={styles.uploadButtonText}>Upload Record</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <RecordDetailModal
        record={selectedRecord}
        recordTypes={RECORD_TYPES}
        onClose={() => setSelectedRecord(null)}
        onShare={shareRecord}
        onDelete={deleteRecord}
        getTypeIcon={getTypeIcon}
        getTypeColor={getTypeColor}
        formatDate={formatDate}
        formatFileSize={formatFileSize}
      />

      <FilterModal
        visible={showFilterModal}
        selectedFilter={selectedFilter}
        recordTypes={RECORD_TYPES}
        onClose={() => setShowFilterModal(false)}
        onSelect={(value) => {
          setSelectedFilter(value);
          setShowFilterModal(false);
        }}
      />

      <EditRecordModal
        visible={editModalVisible}
        editName={editName}
        editNotes={editNotes}
        editTags={editTags}
        onChangeName={setEditName}
        onChangeNotes={setEditNotes}
        onChangeTags={setEditTags}
        onCancel={() => setEditModalVisible(false)}
        onSave={saveEditRecord}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  filterDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 20,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  recordCount: {
    fontSize: 14,
    color: '#888',
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  uploadButton: {
    backgroundColor: '#3AABF0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewMedicalRecordsScreen;
