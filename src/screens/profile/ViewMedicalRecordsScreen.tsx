import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { MedicalRecord } from '../../types';

const ViewMedicalRecordsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateProfile } = useHealthData();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const recordTypes = [
    { value: 'all', label: 'All Records' },
    { value: 'lab_result', label: 'Lab Results' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'consultation', label: 'Consultations' },
    { value: 'procedure', label: 'Procedures' },
    { value: 'other', label: 'Other' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab_result': return 'flask-outline';
      case 'imaging': return 'scan-outline';
      case 'prescription': return 'medical-outline';
      case 'consultation': return 'people-outline';
      case 'procedure': return 'bandage-outline';
      default: return 'document-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab_result': return '#4CD964';
      case 'imaging': return '#007AFF';
      case 'prescription': return '#FF9500';
      case 'consultation': return '#6BCF7F';
      case 'procedure': return '#FF3B30';
      default: return '#888';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

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
            updateProfile({
              ...profile,
              medicalRecords: updatedRecords,
            });
          },
        },
      ]
    );
  };

  const shareRecord = (record: MedicalRecord) => {
    Alert.alert('Share Record', `Sharing ${record.name} would be implemented here`);
  };

  const filteredRecords = profile?.medicalRecords?.filter(record => 
    selectedFilter === 'all' || record.type === selectedFilter
  ) || [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Records</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Display */}
        <View style={styles.filterDisplay}>
          <Text style={styles.filterText}>
            {recordTypes.find(t => t.value === selectedFilter)?.label}
          </Text>
          <Text style={styles.recordCount}>
            {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Records List */}
        <View style={styles.content}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordInfo}>
                    <View style={styles.recordTitleRow}>
                      <Ionicons 
                        name={getTypeIcon(record.type) as any} 
                        size={20} 
                        color={getTypeColor(record.type)} 
                      />
                      <Text style={styles.recordName}>{record.name}</Text>
                    </View>
                    <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                    <Text style={styles.recordSize}>{formatFileSize(record.fileSize)}</Text>
                    {record.tags && record.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {record.tags.slice(0, 3).map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                        {record.tags.length > 3 && (
                          <Text style={styles.moreTags}>+{record.tags.length - 3}</Text>
                        )}
                      </View>
                    )}
                    {record.notes && <Text style={styles.recordNotes}>{record.notes}</Text>}
                  </View>
                  <View style={styles.recordActions}>
                    <TouchableOpacity
                      onPress={() => setSelectedRecord(record)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="eye-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => shareRecord(record)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="share-outline" size={20} color="#4CD964" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteRecord(record.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Medical Records</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'all' 
                  ? 'Upload your first medical record to get started'
                  : `No ${recordTypes.find(t => t.value === selectedFilter)?.label.toLowerCase()} found`
                }
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

      {/* Record Detail Modal */}
      <Modal
        visible={!!selectedRecord}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                <Text style={styles.cancelButton}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Record Details</Text>
              <TouchableOpacity onPress={() => shareRecord(selectedRecord)}>
                <Text style={styles.shareButton}>Share</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.recordDetailCard}>
                <View style={styles.recordDetailHeader}>
                  <Ionicons 
                    name={getTypeIcon(selectedRecord.type) as any} 
                    size={32} 
                    color={getTypeColor(selectedRecord.type)} 
                  />
                  <View style={styles.recordDetailInfo}>
                    <Text style={styles.recordDetailName}>{selectedRecord.name}</Text>
                    <Text style={styles.recordDetailType}>
                      {recordTypes.find(t => t.value === selectedRecord.type)?.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.recordDetailMeta}>
                  <Text style={styles.recordDetailDate}>
                    Date: {formatDate(selectedRecord.date)}
                  </Text>
                  <Text style={styles.recordDetailSize}>
                    Size: {formatFileSize(selectedRecord.fileSize)}
                  </Text>
                </View>

                {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                  <View style={styles.recordDetailTags}>
                    <Text style={styles.recordDetailSectionTitle}>Tags</Text>
                    <View style={styles.tagsContainer}>
                      {selectedRecord.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {selectedRecord.notes && (
                  <View style={styles.recordDetailNotes}>
                    <Text style={styles.recordDetailSectionTitle}>Notes</Text>
                    <Text style={styles.recordDetailNotesText}>{selectedRecord.notes}</Text>
                  </View>
                )}

                {selectedRecord.fileUrl && (
                  <View style={styles.recordDetailPreview}>
                    <Text style={styles.recordDetailSectionTitle}>Preview</Text>
                    <Image 
                      source={{ uri: selectedRecord.fileUrl }} 
                      style={styles.recordDetailImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Records</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {recordTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.filterOption}
                onPress={() => {
                  setSelectedFilter(type.value);
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterOptionText}>{type.label}</Text>
                {selectedFilter === type.value && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  filterButton: {
    padding: 8,
  },
  filterDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  recordCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  recordDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  recordSize: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
  },
  moreTags: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  recordNotes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  recordActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  recordDetailCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  recordDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordDetailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recordDetailName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  recordDetailType: {
    fontSize: 14,
    color: '#888',
  },
  recordDetailMeta: {
    marginBottom: 16,
  },
  recordDetailDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  recordDetailSize: {
    fontSize: 14,
    color: '#888',
  },
  recordDetailTags: {
    marginBottom: 16,
  },
  recordDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  recordDetailNotes: {
    marginBottom: 16,
  },
  recordDetailNotesText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  recordDetailPreview: {
    marginBottom: 16,
  },
  recordDetailImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default ViewMedicalRecordsScreen; 