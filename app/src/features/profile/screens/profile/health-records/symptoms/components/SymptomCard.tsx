import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymptomEntry } from '../../../../../../../shared/types/symptoms';

interface SymptomCardProps {
  symptom: SymptomEntry;
  onDelete: (id: string) => void;
  formatDate: (ts: string) => string;
  getSeverityColor: (severity: number) => string;
  getSeverityLabel: (severity: number) => string;
}

const SymptomCard: React.FC<SymptomCardProps> = ({
  symptom,
  onDelete,
  formatDate,
  getSeverityColor,
  getSeverityLabel,
}) => (
  <View style={styles.symptomCard}>
    <View style={styles.symptomHeader}>
      <View style={styles.symptomInfo}>
        <View style={styles.symptomTypeContainer}>
          <Ionicons
            name={symptom.type === 'physical' ? 'medical-outline' : 'heart-outline'}
            size={16}
            color={symptom.type === 'physical' ? '#FF6B6B' : '#5856D6'}
          />
          <Text style={styles.symptomType}>
            {symptom.type === 'physical' ? 'Physical' : 'Mental'}
          </Text>
        </View>
        <Text style={styles.symptomCategory}>{symptom.category}</Text>
        <Text style={styles.symptomDate}>{formatDate(symptom.timestamp)}</Text>
      </View>
      <View style={styles.symptomActions}>
        <View style={styles.severityContainer}>
          <View style={[styles.severityDot, { backgroundColor: getSeverityColor(symptom.severity) }]} />
          <Text style={styles.severityText}>{getSeverityLabel(symptom.severity)}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(symptom.id)}>
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>

    {symptom.notes && <Text style={styles.symptomNotes}>{symptom.notes}</Text>}

    {symptom.location && (
      <View style={styles.symptomMeta}>
        <Ionicons name="location-outline" size={14} color="#8E8E93" />
        <Text style={styles.symptomMetaText}>{symptom.location}</Text>
      </View>
    )}

    {symptom.factors && symptom.factors.length > 0 && (
      <View style={styles.factorsContainer}>
        {symptom.factors.map((factor, index) => (
          <View key={index} style={styles.factorChip}>
            <Text style={styles.factorChipText}>{factor}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  symptomCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symptomInfo: { flex: 1 },
  symptomTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  symptomType: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  symptomCategory: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  symptomDate: { color: '#8E8E93', fontSize: 12 },
  symptomActions: { alignItems: 'flex-end' },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  deleteButton: { padding: 4 },
  symptomNotes: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  symptomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  symptomMetaText: { color: '#8E8E93', fontSize: 12, marginLeft: 4 },
  factorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  factorChip: {
    backgroundColor: '#3A3A3C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  factorChipText: { color: '#FFFFFF', fontSize: 12 },
});

export default SymptomCard;
