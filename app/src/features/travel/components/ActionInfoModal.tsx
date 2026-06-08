import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionInfoModalProps {
  info: { title: string; body: string } | null;
  onClose: () => void;
}

const ActionInfoModal: React.FC<ActionInfoModalProps> = ({ info, onClose }) => (
  <Modal
    visible={!!info}
    animationType="fade"
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.infoOverlay}>
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <TouchableOpacity onPress={onClose} style={styles.infoBack}>
            <Ionicons name="chevron-back" size={22} color="#6B655F" />
          </TouchableOpacity>
          <Text style={styles.infoTitle}>{info?.title}</Text>
          <View style={styles.infoSpacer} />
        </View>
        <Text style={styles.infoBody}>{info?.body}</Text>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  infoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#F7F3EE',
    borderRadius: 16,
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoBack: {
    padding: 6,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B655F',
  },
  infoSpacer: {
    width: 24,
  },
  infoBody: {
    fontSize: 14,
    color: '#6B655F',
    lineHeight: 22,
  },
});

export default ActionInfoModal;
