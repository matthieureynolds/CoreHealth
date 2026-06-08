import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { Screening } from '../../../../../../shared/types';
import FileViewerModal from '../../../../../../shared/components/modals/FileViewerModal';
import ScreeningFormModal from './ScreeningFormModal';
import { useProfileRecordList } from '../hooks/useHealthRecordList';

const RESULT_COLORS: Record<string, string> = {
  normal: '#34C759',
  abnormal: '#FF3B30',
};
const RESULT_DEFAULT_COLOR = '#FF9500';

const ScreeningsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useHealthData();

  const config = useMemo(() => ({
    items: profile?.screenings,
    updateItems: (screenings: Screening[]) => updateProfile({ ...profile, screenings }),
    recordName: 'Screening' as const,
    getItemName: (s: Screening) => s.name,
  }), [profile, updateProfile]);

  const {
    items: screenings, showModal, editingItem,
    handleSave, openOptions, openAddModal, closeModal, fileViewer,
  } = useProfileRecordList(config);

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Screenings</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="add" size={24} color="#3AABF0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110, padding: 20 }}>
        {screenings.length ? (
          screenings.map((screening) => {
            const resultColor = RESULT_COLORS[screening.result] ?? RESULT_DEFAULT_COLOR;
            return (
              <View key={screening.id} style={styles.screeningCard}>
                <View style={styles.screeningHeader}>
                  <View style={styles.screeningInfo}>
                    <Text style={styles.screeningName}>{screening.name}</Text>
                    <View style={styles.resultBadge}>
                      <View style={[styles.resultDot, { backgroundColor: resultColor }]} />
                      <Text style={[styles.resultText, { color: resultColor }]}>
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
                            <TouchableOpacity key={file.uri} style={styles.attachmentChip} onPress={() => fileViewer.handleViewFile(file.uri, file.name, file.type)}>
                              <Ionicons name={file.type?.includes('pdf') ? 'document-outline' : 'image-outline'} size={14} color="#FFFFFF" />
                              <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => openOptions(screening)} style={styles.editPenButton} accessibilityLabel="Edit screening">
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No Screenings</Text>
            <Text style={styles.emptySubtitle}>Add your screenings to keep track of your health checks</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
              <Text style={styles.addFirstButtonText}>Add Screening</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ScreeningFormModal
        visible={showModal}
        editingScreening={editingItem}
        onClose={closeModal}
        onSave={handleSave}
      />

      <FileViewerModal visible={fileViewer.fileViewerVisible} onClose={fileViewer.closeFileViewer} fileUri={fileViewer.currentFileUri} fileName={fileViewer.currentFileName} fileType={fileViewer.currentFileType} />
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
  addFirstButton: { backgroundColor: '#3AABF0', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addFirstButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ScreeningsScreen;
