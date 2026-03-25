import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MedicalRecord } from '../../../../../../../shared/types';

interface RecordCardProps {
  record: MedicalRecord;
  onView: (record: MedicalRecord) => void;
  onEdit: (record: MedicalRecord) => void;
  onShare: (record: MedicalRecord) => void;
  getTypeIcon: (type: string) => string;
  getTypeColor: (type: string) => string;
  formatDate: (date: Date) => string;
}

const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onView,
  onEdit,
  onShare,
  getTypeIcon,
  getTypeColor,
  formatDate,
}) => (
  <View style={[styles.recordCard, { borderWidth: 1, borderColor: getTypeColor(record.type) }]}>
    <View style={styles.recordHeader}>
      <View style={styles.recordInfo}>
        <View style={styles.recordTitleRow}>
          <Ionicons name={getTypeIcon(record.type) as any} size={20} color={getTypeColor(record.type)} />
          <Text style={styles.recordName}>{record.name}</Text>
        </View>
        <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
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
        <TouchableOpacity onPress={() => onView(record)} style={styles.actionButton}>
          <Ionicons name="eye-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEdit(record)} style={styles.actionButton}>
          <Feather name="edit-2" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare(record)} style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#4CD964" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
});

export default RecordCard;
