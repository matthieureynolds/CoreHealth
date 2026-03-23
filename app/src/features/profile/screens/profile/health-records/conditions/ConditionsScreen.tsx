import React, { useState } from 'react';
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
import FileViewerModal from '../../../../../../shared/components/FileViewerModal';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { MedicalCondition } from '../../../../../../shared/types';
import ConditionFormModal from './ConditionFormModal';

const ConditionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCondition, setEditingCondition] = useState<MedicalCondition | null>(null);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  const handleSave = (condition: MedicalCondition) => {
    const existing = profile?.medicalHistory || [];
    const isEdit = existing.some(c => c.id === condition.id);
    updateProfile({
      ...profile,
      medicalHistory: isEdit
        ? existing.map(c => c.id === condition.id ? condition : c)
        : [...existing, condition],
    });
    setShowAddModal(false);
    setEditingCondition(null);
  };

  const handleEdit = (c: MedicalCondition) => {
    setEditingCondition(c);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Condition', 'Are you sure you want to delete this condition?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => updateProfile({ ...profile, medicalHistory: profile?.medicalHistory?.filter(c => c.id !== id) || [] }),
      },
    ]);
  };

  const openConditionOptions = (c: MedicalCondition) => {
    Alert.alert(c.condition, undefined, [
      { text: 'Edit', onPress: () => handleEdit(c) },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(c.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleViewFile = (fileUri: string, fileName: string, fileType?: string) => {
    setCurrentFileUri(fileUri);
    setCurrentFileName(fileName);
    setCurrentFileType(fileType || '');
    setFileViewerVisible(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#4CD964';
      case 'moderate': return '#FF9500';
      case 'severe': return '#FF3B30';
      default: return '#888';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#FF3B30';
      case 'resolved': return '#4CD964';
      case 'managed': return '#007AFF';
      default: return '#888';
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Medical Conditions</Text>
        <TouchableOpacity onPress={() => { setEditingCondition(null); setShowAddModal(true); }} style={styles.addButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          {profile?.medicalHistory?.length ? (
            profile.medicalHistory.map((condition) => (
              <View key={condition.id} style={styles.conditionCard}>
                <View style={styles.conditionHeader}>
                  <View style={styles.conditionHeaderLeft}>
                    <View style={styles.conditionIcon}>
                      <Ionicons name="medkit-outline" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.conditionInfo}>
                      <Text style={styles.conditionName}>{condition.condition}</Text>
                      <View style={styles.conditionTagsRow}>
                        <View style={[styles.pillTag, { backgroundColor: getSeverityColor(condition.severity) + '20', borderColor: getSeverityColor(condition.severity) }]}>
                          <Text style={[styles.pillTagText, { color: getSeverityColor(condition.severity) }]}>
                            {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)}
                          </Text>
                        </View>
                        <View style={[styles.pillTag, { backgroundColor: getStatusColor(condition.status) + '20', borderColor: getStatusColor(condition.status) }]}>
                          <Text style={[styles.pillTagText, { color: getStatusColor(condition.status) }]}>
                            {condition.status.charAt(0).toUpperCase() + condition.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => openConditionOptions(condition)} style={styles.editPenButton} accessibilityLabel="Edit condition">
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.conditionMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                    <Text style={styles.metaText}>Diagnosed: {formatDate(condition.diagnosedDate)}</Text>
                  </View>
                  {condition.resolvedDate && (
                    <View style={styles.metaItem}>
                      <Ionicons name="checkmark-done-outline" size={16} color="#8E8E93" />
                      <Text style={styles.metaText}>Resolved: {formatDate(condition.resolvedDate)}</Text>
                    </View>
                  )}
                </View>

                {condition.notes && <Text style={styles.notes}>{condition.notes}</Text>}

                {!!condition.attachments?.length && (
                  <View style={[styles.conditionMeta, { marginTop: 10 }]}>
                    <View style={styles.attachmentsRow}>
                      {condition.attachments.map((file) => (
                        <TouchableOpacity key={file.uri} style={styles.attachmentChip} onPress={() => handleViewFile(file.uri, file.name, file.type)}>
                          <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                          <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Conditions</Text>
              <Text style={styles.emptySubtitle}>Add your medical conditions to keep track of your health</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => { setEditingCondition(null); setShowAddModal(true); }}>
                <Text style={styles.addFirstButtonText}>Add Condition</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <ConditionFormModal
        visible={showAddModal}
        editingCondition={editingCondition}
        onClose={() => { setShowAddModal(false); setEditingCondition(null); }}
        onSave={handleSave}
      />

      <FileViewerModal
        visible={fileViewerVisible}
        onClose={() => setFileViewerVisible(false)}
        fileUri={currentFileUri}
        fileName={currentFileName}
        fileType={currentFileType}
      />
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
  content: { padding: 20 },
  conditionCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#007AFF', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  conditionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conditionHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  conditionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A84FF33', alignItems: 'center', justifyContent: 'center' },
  conditionInfo: { flex: 1 },
  conditionName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
  conditionTagsRow: { flexDirection: 'row', gap: 8 },
  pillTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillTagText: { fontSize: 12, fontWeight: '600' },
  editPenButton: { position: 'absolute', top: 6, right: 6, padding: 6 },
  conditionMeta: { marginTop: 12, gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#A0A0A0' },
  attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachmentText: { color: '#FFFFFF', fontSize: 12, marginLeft: 6, maxWidth: 140 },
  notes: { fontSize: 13, color: '#C7C7CC', marginTop: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, paddingHorizontal: 40 },
  addFirstButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addFirstButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ConditionsScreen;
