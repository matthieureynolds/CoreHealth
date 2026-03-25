import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecordsHeaderProps {
  onBack: () => void;
  onAdd: () => void;
  onFilter: () => void;
}

const RecordsHeader: React.FC<RecordsHeaderProps> = ({ onBack, onAdd, onFilter }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color="#007AFF" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Medical Records</Text>
    <View style={styles.headerActions}>
      <TouchableOpacity onPress={onAdd} style={styles.uploadHeaderButton}>
        <Ionicons name="add" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onFilter} style={styles.filterButton}>
        <Ionicons name="filter" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 3,
    top: -45.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 16.5,
    paddingBottom: 8,
    top: -55,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 3,
    top: -45.8,
  },
  uploadHeaderButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
});

export default RecordsHeader;
