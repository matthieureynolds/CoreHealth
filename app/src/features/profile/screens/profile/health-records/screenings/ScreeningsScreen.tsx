import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { Screening } from '../../../../../../shared/types';
import FileViewerModal from '../../../../../../shared/components/FileViewerModal';
import ScreeningFormModal from './ScreeningFormModal';

const ScreeningsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFileType, setCurrentFileType] = useState('');

  const handleSave = (screening: Screening) => {
    const existing = profile?.screenings || [];
    const isEdit = existing.some(s => s.id === screening.id);
    updateProfile({
      ...profile,
      screenings: isEdit ? existing.map(s => s.id === screening.id ? screening : s) : [...existing, screening],
    });
    setShowAddModal(false);
    setEditingScreening(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Screening', 'Are you sure you want to delete this screening?', [
        { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateProfile({ ...profile, screenings: profile?.screenings?.filter(s => s.id !== id) || [] }) },
    ]);
  };

  const openScreeningOptions = (s: Screening) => {
    Alert.alert(s.name, undefined, [
      { text: 'Edit', onPress: () => { setEditingScreening(s); setShowAddModal(true); } },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(s.id) },
        { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleViewFile = (uri: string, name: string, type?: string) => {
    setCurrentFileUri(uri); setCurrentFileName(name); setCurrentFileType(type || ''); setFileViewerVisible(true);
  };

  const getResultColor = (result: string) => result === 'normal' ? '#34C759' : result === 'abnormal' ? '#FF3B30' : '#FF9500';

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Screenings</Text>
        <TouchableOpacity onPress={() => { setEditingScreening(null); setShowAddModal(true); }} style={styles.addButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, padding: 20 }}>
          {profile?.screenings?.length ? (
            profile.screenings.map((screening) => (
              <View key={screening.id} style={styles.screeningCard}>
                <View style={styles.screeningHeader}>
                  <View style={styles.screeningInfo}>
                    <Text style={styles.screeningName}>{screening.name}</Text>
                  <View style={styles.resultBadge}>
                    <View style={[styles.resultDot, { backgroundColor: getResultColor(screening.result) }]} />
                        <Text style={[styles.resultText, { color: getResultColor(screening.result) }]}>
                          {screening.result.charAt(0).toUpperCase() + screening.result.slice(1)}
                        </Text>
                      </View>
                  <Text style={styles.screeningDate}>Date: {formatDate(screening.date)}</Text>
                  {screening.nextDue && <Text style={styles.nextDue}>Next Due: {formatDate(screening.nextDue as any)}</Text>}
                  {screening.location && <Text style={styles.location}>{screening.location}</Text>}
                    {screening.notes && <Text style={styles.notes}>{screening.notes}</Text>}
                    {!!screening.attachments?.length && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.attachmentsRow}>
                          {screening.attachments.map(file => (
                          <TouchableOpacity key={file.uri} style={styles.attachmentChip} onPress={() => handleViewFile(file.uri, file.name, file.type)}>
                              <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                              <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                <TouchableOpacity onPress={() => openScreeningOptions(screening)} style={styles.editPenButton} accessibilityLabel="Edit screening">
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Screenings</Text>
            <Text style={styles.emptySubtitle}>Add your screenings to keep track of your health checks</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={() => { setEditingScreening(null); setShowAddModal(true); }}>
                <Text style={styles.addFirstButtonText}>Add Screening</Text>
              </TouchableOpacity>
            </View>
          )}
      </ScrollView>

      <ScreeningFormModal
        visible={showAddModal}
        editingScreening={editingScreening}
        onClose={() => { setShowAddModal(false); setEditingScreening(null); }}
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
  screeningCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#30D158', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  screeningHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  screeningInfo: { flex: 1 },
  screeningName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 6 },
  resultBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  resultDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  resultText: { fontSize: 14, fontWeight: '500' },
  screeningDate: { fontSize: 14, color: '#888', marginBottom: 2 },
  nextDue: { fontSize: 14, color: '#FF9500', marginBottom: 2 },
  location: { fontSize: 14, color: '#888', marginBottom: 2 },
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

export default ScreeningsScreen; 
