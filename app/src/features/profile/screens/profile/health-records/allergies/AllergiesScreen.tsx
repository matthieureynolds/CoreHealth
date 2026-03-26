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
import FileViewerModal from '../../../../../../shared/components/modals/FileViewerModal';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { Allergy } from '../../../../../../shared/types';
import AllergyFormModal from './AllergyFormModal';
import { useFileViewer } from '../hooks/useFileViewer';

const AllergiesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const { fileViewerVisible, currentFileUri, currentFileName, currentFileType, handleViewFile, closeFileViewer } = useFileViewer();

  const handleSave = (allergy: Allergy) => {
    const existing = profile?.allergies || [];
    const isEdit = existing.some(a => a.id === allergy.id);
    updateProfile({
      ...profile,
      allergies: isEdit ? existing.map(a => a.id === allergy.id ? allergy : a) : [...existing, allergy],
    });
    setShowAddModal(false);
    setEditingAllergy(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Allergy', 'Are you sure you want to delete this allergy?', [
        { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateProfile({ ...profile, allergies: profile?.allergies?.filter(a => a.id !== id) || [] }) },
    ]);
  };

  const openAllergyOptions = (a: Allergy) => {
    Alert.alert(a.name, undefined, [
      { text: 'Edit', onPress: () => { setEditingAllergy(a); setShowAddModal(true); } },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(a.id) },
        { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) { case 'mild': return '#4CD964'; case 'moderate': return '#FF9500'; case 'severe': return '#FF3B30'; default: return '#888'; }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Allergies</Text>
        <TouchableOpacity onPress={() => { setEditingAllergy(null); setShowAddModal(true); }} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#3AABF0" />
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {profile?.allergies?.length ? (
            profile.allergies.map((allergy) => (
              <View key={allergy.id} style={styles.allergyCard}>
                <View style={styles.allergyHeader}>
                  <View style={styles.allergyInfo}>
                    <Text style={styles.allergyName}>{allergy.name}</Text>
                    <View style={styles.allergyTags}>
                      <View style={[styles.tag, { backgroundColor: getSeverityColor(allergy.severity) + '20' }]}>
                        <Text style={[styles.tagText, { color: getSeverityColor(allergy.severity) }]}>
                          {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                        </Text>
                      </View>
                    </View>
                    {allergy.reaction && <Text style={styles.reaction}>Reaction: {allergy.reaction}</Text>}
                    <Text style={styles.allergyDate}>Started: {formatDate(allergy.startDate)}</Text>
                    {allergy.endDate && <Text style={styles.allergyDate}>Ended: {formatDate(allergy.endDate)}</Text>}
                    {allergy.notes && <Text style={styles.notes}>{allergy.notes}</Text>}
                    {!!allergy.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                          {allergy.attachments.map(file => (
                            <TouchableOpacity key={file.uri} style={styles.attachmentChip} onPress={() => handleViewFile(file.uri, file.name, file.type)}>
                              <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                              <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => openAllergyOptions(allergy)} style={styles.editPenButton} accessibilityLabel="Edit allergy">
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="warning-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Allergies</Text>
              <Text style={styles.emptySubtitle}>Add your allergies to keep track of your sensitivities</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => { setEditingAllergy(null); setShowAddModal(true); }}>
                <Text style={styles.addFirstButtonText}>Add Allergy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <AllergyFormModal
        visible={showAddModal}
        editingAllergy={editingAllergy}
        onClose={() => { setShowAddModal(false); setEditingAllergy(null); }}
        onSave={handleSave}
      />

      <FileViewerModal visible={fileViewerVisible} onClose={closeFileViewer} fileUri={currentFileUri} fileName={currentFileName} fileType={currentFileType} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: '#000000', zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, elevation: 10 },
  backButton: { padding: 8, width: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', flex: 1 },
  addButton: { padding: 8, width: 40, alignItems: 'flex-end' },
  content: { padding: 20, paddingTop: 95 },
  allergyCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#3AABF0', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  allergyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  allergyInfo: { flex: 1 },
  allergyName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  allergyTags: { flexDirection: 'row', marginBottom: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  tagText: { fontSize: 12, fontWeight: '500' },
  reaction: { fontSize: 14, color: '#FF9500', marginBottom: 4 },
  allergyDate: { fontSize: 14, color: '#888', marginBottom: 4 },
  notes: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  editPenButton: { position: 'absolute', top: 6, right: 6, padding: 6 },
  attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachmentText: { color: '#FFFFFF', fontSize: 12, marginLeft: 6, maxWidth: 140 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, paddingHorizontal: 40 },
  addFirstButton: { backgroundColor: '#3AABF0', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addFirstButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AllergiesScreen; 
