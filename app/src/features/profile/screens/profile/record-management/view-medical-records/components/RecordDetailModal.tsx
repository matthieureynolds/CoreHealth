import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicalRecord } from '../../../../../../../shared/types';

interface RecordType {
  value: string;
  label: string;
}

interface RecordDetailModalProps {
  record: MedicalRecord | null;
  recordTypes: RecordType[];
  onClose: () => void;
  onShare: (record: MedicalRecord) => void;
  onDelete: (id: string) => void;
  getTypeIcon: (type: string) => string;
  getTypeColor: (type: string) => string;
  formatDate: (date: Date) => string;
  formatFileSize: (bytes?: number) => string;
}

const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  recordTypes,
  onClose,
  onShare,
  onDelete,
  getTypeIcon,
  getTypeColor,
  formatDate,
  formatFileSize,
}) => (
  <Modal
    visible={!!record}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    {record && (
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Record Details</Text>
          <TouchableOpacity onPress={() => onShare(record)}>
            <Text style={styles.shareButton}>Share</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.recordDetailCard}>
            <View style={styles.recordDetailHeader}>
              <Ionicons
                name={getTypeIcon(record.type) as any}
                size={32}
                color={getTypeColor(record.type)}
              />
              <View style={styles.recordDetailInfo}>
                <Text style={styles.recordDetailName}>{record.name}</Text>
                <Text style={styles.recordDetailType}>
                  {recordTypes.find(t => t.value === record.type)?.label}
                </Text>
              </View>
            </View>

            <View style={styles.recordDetailMeta}>
              <Text style={styles.recordDetailDate}>Date: {formatDate(record.date)}</Text>
              <Text style={styles.recordDetailSize}>Size: {formatFileSize(record.fileSize)}</Text>
            </View>

            {record.tags && record.tags.length > 0 && (
              <View style={styles.recordDetailTags}>
                <Text style={styles.recordDetailSectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {record.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {record.notes && (
              <View style={styles.recordDetailNotes}>
                <Text style={styles.recordDetailSectionTitle}>Notes</Text>
                <Text style={styles.recordDetailNotesText}>{record.notes}</Text>
              </View>
            )}

            {record.fileUrl && (
              <View style={styles.recordDetailPreview}>
                <Text style={styles.recordDetailSectionTitle}>Preview</Text>
                <Image
                  source={{ uri: record.fileUrl }}
                  style={styles.recordDetailImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>

          <View style={{ marginTop: 16 }}>
            <TouchableOpacity style={styles.deleteRow} onPress={() => onDelete(record.id)}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteRowText}>Delete Record</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )}
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
    color: '#3AABF0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    fontSize: 16,
    color: '#3AABF0',
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#3AABF020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#3AABF0',
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
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  deleteRowText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RecordDetailModal;
