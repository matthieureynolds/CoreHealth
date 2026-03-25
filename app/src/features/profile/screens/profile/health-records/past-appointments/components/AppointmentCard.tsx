import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PastAppointment } from '../../../../../../../shared/types';

interface AppointmentCardProps {
  appointment: PastAppointment;
  onPress: (apt: PastAppointment) => void;
  onAttachmentPress: (apt: PastAppointment) => void;
  formatDate: (d: Date | string) => string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment: apt,
  onPress,
  onAttachmentPress,
  formatDate,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(apt)}
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
        onPress={() => onAttachmentPress(apt)}
      >
        <Ionicons name="document-attach" size={20} color="#007AFF" />
        <Text style={styles.attachmentText}>Attachment</Text>
      </TouchableOpacity>
    ) : null}
    <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
});

export default AppointmentCard;
