import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import familyService from '../../../../../../shared/services/user/familyService';
import { FamilyCondition } from '../../../../../../shared/types';
import FileViewerModal from '../../../../../../shared/components/modals/FileViewerModal';
import FamilyHistoryFormModal from './FamilyHistoryFormModal';

const FamilyHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [linkCount, setLinkCount] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyCondition | null>(null);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  React.useEffect(() => {
    const loadLinks = async () => {
      try {
        const links = await familyService.listLinks();
        setLinkCount(links.filter(l => l.status === 'active').length);
      } catch { /* silent */ }
    };
    const unsubscribe = (navigation as any).addListener?.('focus', loadLinks);
    loadLinks();
    return unsubscribe;
  }, [navigation]);

  const handleSave = (item: FamilyCondition) => {
    const existing = profile?.familyHistory || [];
    const isEdit = existing.some(f => f.id === item.id);
      updateProfile({
        ...profile,
      familyHistory: isEdit ? existing.map(f => f.id === item.id ? item : f) : [...existing, item],
    });
    setShowAddModal(false);
    setEditingFamily(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Family History', 'Are you sure you want to delete this family condition?', [
        { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateProfile({ ...profile, familyHistory: profile?.familyHistory?.filter(f => f.id !== id) || [] }) },
    ]);
  };

  const openFamilyOptions = (f: FamilyCondition) => {
    Alert.alert(`${f.relation} • ${f.condition}`, undefined, [
      { text: 'Edit', onPress: () => { setEditingFamily(f); setShowAddModal(true); } },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(f.id) },
        { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleViewFile = (uri: string, name: string, type?: string) => {
    setCurrentFileUri(uri); setCurrentFileName(name); setCurrentFileType(type || ''); setFileViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Family History</Text>
        <TouchableOpacity onPress={() => { setEditingFamily(null); setShowAddModal(true); }} style={styles.addButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, padding: 20 }}>
        <TouchableOpacity style={[styles.familyCard, { borderColor: '#0A84FF' }]} onPress={() => navigation.navigate('FamilyLink')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="link-outline" size={22} color="#0A84FF" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.relation}>Family Link (Risk-Only)</Text>
              <Text style={styles.condition}>Leverage family history without sharing anyone's data</Text>
                <Text style={styles.ageOfOnset}>Active links: {linkCount}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </View>
          </TouchableOpacity>

          {profile?.familyHistory?.length ? (
          profile.familyHistory.map((item) => (
            <View key={item.id} style={styles.familyCard}>
                <View style={styles.familyHeader}>
                  <View style={styles.familyInfo}>
                  <Text style={styles.relation}>{item.relation}{(item as any).side ? ` • ${((item as any).side as string).charAt(0).toUpperCase()}${((item as any).side as string).slice(1)}` : ''}</Text>
                  <Text style={styles.condition}>{item.condition}</Text>
                  {item.ageOfOnset && <Text style={styles.ageOfOnset}>Age of onset: {item.ageOfOnset} years old</Text>}
                  {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
                  {!!item.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                        {item.attachments.map(file => (
                          <TouchableOpacity key={file.uri} style={styles.attachmentChip} onPress={() => handleViewFile(file.uri, file.name, file.type)}>
                              <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                              <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                <TouchableOpacity onPress={() => openFamilyOptions(item)} style={styles.editPenButton} accessibilityLabel="Edit family history">
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Family History</Text>
              <Text style={styles.emptySubtitle}>Add family medical conditions to help with risk assessment</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={() => { setEditingFamily(null); setShowAddModal(true); }}>
                <Text style={styles.addFirstButtonText}>Add Family History</Text>
              </TouchableOpacity>
            </View>
          )}
      </ScrollView>

      <FamilyHistoryFormModal
        visible={showAddModal}
        editingFamily={editingFamily}
        onClose={() => { setShowAddModal(false); setEditingFamily(null); }}
        onSave={handleSave}
      />

      <FileViewerModal visible={fileViewerVisible} onClose={() => setFileViewerVisible(false)} fileUri={currentFileUri} fileName={currentFileName} fileType={currentFileType} />
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
  familyCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#30D158', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  familyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  familyInfo: { flex: 1 },
  relation: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  condition: { fontSize: 14, color: '#30D158', marginBottom: 4 },
  ageOfOnset: { fontSize: 14, color: '#888', marginBottom: 2 },
  notes: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  editPenButton: { position: 'absolute', top: 6, right: 6, padding: 6 },
  attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#3A3A3C' },
  attachmentText: { color: '#FFFFFF', fontSize: 12, marginLeft: 6, maxWidth: 140 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, paddingHorizontal: 40 },
  addFirstButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addFirstButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default FamilyHistoryScreen; 
