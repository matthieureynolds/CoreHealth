import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AttachedFile } from '../../../../../../../shared/types';

interface AttachmentsSectionProps {
  attachments: AttachedFile[];
  onRemoveAttachment: (name: string) => void;
  onAttachFile: () => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  onRemoveAttachment,
  onAttachFile,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Attachments:</Text>
    <View style={styles.attachmentsRow}>
      {attachments.map((file) => (
        <View key={file.uri} style={styles.attachmentChip}>
          <Ionicons
            name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.attachmentText} numberOfLines={1}>
            {file.name}
          </Text>
          <TouchableOpacity
            onPress={() => onRemoveAttachment(file.name)}
            style={styles.attachmentRemove}
          >
            <Ionicons name="close" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addAttachmentButton} onPress={onAttachFile}>
        <Ionicons name="attach" size={16} color="#3AABF0" />
        <Text style={styles.addAttachmentText}>Add file</Text>
      </TouchableOpacity>
    </View>
    <Text style={styles.attachmentsHelp}>PDFs and images are supported.</Text>
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
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
  attachmentRemove: {
    marginLeft: 6,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3AABF0',
  },
  addAttachmentText: {
    color: '#3AABF0',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  attachmentsHelp: {
    marginTop: 8,
    color: '#8E8E93',
    fontSize: 12,
  },
});

export default AttachmentsSection;
