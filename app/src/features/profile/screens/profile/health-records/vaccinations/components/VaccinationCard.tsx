import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Vaccination, AttachedFile } from '../../../../../../../shared/types';

interface VaccinationCardProps {
  vaccination: Vaccination;
  onOptions: (v: Vaccination) => void;
  onViewFile: (uri: string, name: string, type?: string) => void;
}

const formatDate = (dateInput: Date | string) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const isOverdue = (nextDueInput: Date | string) => {
  const d = nextDueInput instanceof Date ? nextDueInput : new Date(nextDueInput);
  return !isNaN(d.getTime()) && new Date().getTime() > d.getTime();
};

const VaccinationCard: React.FC<VaccinationCardProps> = ({ vaccination, onOptions, onViewFile }) => (
  <View style={styles.vaccinationCard}>
    <View style={styles.vaccinationHeader}>
      <View style={styles.vaccinationInfo}>
        <Text style={styles.vaccineName}>{vaccination.name}</Text>
        <Text style={styles.vaccinationDate}>Received: {formatDate(vaccination.date)}</Text>
        {vaccination.nextDue && (
          <View style={styles.nextDueContainer}>
            <Text style={[
              styles.nextDueText,
              isOverdue(vaccination.nextDue as any) && styles.overdueText,
            ]}>
              Next due: {formatDate(vaccination.nextDue as any)}
            </Text>
            {isOverdue(vaccination.nextDue as any) && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueBadgeText}>OVERDUE</Text>
              </View>
            )}
          </View>
        )}
        {vaccination.location && (
          <Text style={styles.location}>Location: {vaccination.location}</Text>
        )}
        {vaccination.batchNumber && (
          <Text style={styles.batchNumber}>Batch: {vaccination.batchNumber}</Text>
        )}
        {vaccination.notes && <Text style={styles.notes}>{vaccination.notes}</Text>}
        {!!vaccination.attachments?.length && (
          <View style={{ marginTop: 10 }}>
            <View style={styles.attachmentsRow}>
              {vaccination.attachments.map((file: AttachedFile) => (
                <TouchableOpacity
                  key={file.uri}
                  style={styles.attachmentChip}
                  onPress={() => onViewFile(file.uri, file.name, file.type)}
                >
                  <Ionicons
                    name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'}
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onOptions(vaccination)}
        style={styles.editPenButton}
        accessibilityLabel="Edit vaccination"
      >
        <Feather name="edit-2" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  vaccinationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3AABF0',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  vaccinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaccinationInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vaccinationDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  nextDueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextDueText: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  overdueText: {
    color: '#FF3B30',
  },
  overdueBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  batchNumber: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  attachmentText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
    maxWidth: 140,
  },
  editPenButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 6,
  },
});

export default VaccinationCard;
