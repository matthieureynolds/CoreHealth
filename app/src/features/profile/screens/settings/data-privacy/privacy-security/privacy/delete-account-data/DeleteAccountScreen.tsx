import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../../../../../shared/context/AuthContext';
import { DataService } from '../../../../../../../../shared/services/data/dataService';

const DeleteAccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteRequest = () => {
    Alert.alert(
      'Delete Account & Data',
      'This will permanently delete your account and all associated health data. This cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!user?.id) return;
    setDeleting(true);
    try {
      await DataService.deleteAccount(user.id);
      await signOut();
    } catch (e: any) {
      setDeleting(false);
      Alert.alert('Error', e.message || 'Could not delete account. Please try again or contact support.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Delete Account & Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={24} color="#FF3B30" style={styles.warningIcon} />
            <Text style={styles.warningText}>
              Deleting your account is permanent and cannot be undone. All your health data will be removed.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>WHAT WILL BE DELETED</Text>
            {[
              { icon: 'person-outline', text: 'Your profile and personal information' },
              { icon: 'pulse-outline', text: 'All biomarkers, lab results, and health records' },
              { icon: 'watch-outline', text: 'Device data and activity history' },
              { icon: 'document-text-outline', text: 'Uploaded medical documents' },
              { icon: 'settings-outline', text: 'All app settings and preferences' },
            ].map((item) => (
              <View key={item.text} style={styles.infoRow}>
                <Ionicons name={item.icon as any} size={18} color="#FF3B30" style={styles.cardIcon} />
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>BEFORE YOU DELETE</Text>
            <View style={styles.infoRow}>
              <Ionicons name="download-outline" size={18} color="#3AABF0" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Download Your Data First</Text>
                <Text style={styles.infoText}>
                  Consider downloading your health data before deleting your account. Go to Health Data Download to export a PDF of all your data.
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color="#FF9500" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Processing Time</Text>
                <Text style={styles.infoText}>
                  Account deletion requests are processed within 30 days of verification. Backup copies are purged within 35 days per our data retention policy.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteRequest} activeOpacity={0.8} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color="#fff" style={styles.cardIcon} />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#fff" style={styles.cardIcon} />
            )}
            <Text style={styles.deleteButtonText}>{deleting ? 'Deleting…' : 'Delete Account & Data'}</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Your account and all health data will be permanently deleted immediately. This cannot be undone.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: {
    paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818',
    borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between',
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10,
  },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center',
    position: 'absolute', left: 0, right: 0, paddingTop: 32.2, paddingBottom: 8,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  warningBanner: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', borderRadius: 12,
    padding: 16, marginBottom: 20,
  },
  warningIcon: { marginRight: 12, marginTop: 2 },
  warningText: { flex: 1, color: '#FF3B30', fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: '#181818', borderRadius: 12, marginBottom: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 12, marginHorizontal: 20, letterSpacing: 0.5 },
  cardIcon: { marginRight: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, paddingHorizontal: 20 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  infoText: { flex: 1, fontSize: 13, color: '#8E8E93', lineHeight: 18 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 12, marginBottom: 16,
  },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerNote: { fontSize: 12, color: '#8E8E93', textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
});

export default DeleteAccountScreen;
