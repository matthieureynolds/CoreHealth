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
    <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
      <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Medical Records</Text>
    <View style={styles.headerActions}>
      <TouchableOpacity onPress={onAdd} style={styles.actionButton}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onFilter} style={styles.actionButton}>
        <Ionicons name="filter" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
});

export default RecordsHeader;
