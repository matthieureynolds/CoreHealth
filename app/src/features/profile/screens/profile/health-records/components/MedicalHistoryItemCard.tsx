import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabConfig {
  id: number;
  title: string;
  icon: string;
  color: string;
}

interface MedicalHistoryItemCardProps {
  item: any;
  index: number;
  activeTab: number;
  tabConfig: TabConfig;
  onEdit: (item: any, index: number) => void;
  onDelete: (index: number) => void;
}

const getItemTitle = (item: any, activeTab: number): string => {
  if (activeTab === 2) return String(item);
  if (typeof item !== 'object') return 'Untitled';
  return (
    ('condition' in item && item.condition) ||
    ('name' in item && item.name) ||
    ('procedure' in item && item.procedure) ||
    'Untitled'
  );
};

const getItemSubtitle = (item: any, activeTab: number): string => {
  if (activeTab === 0 && typeof item === 'object' && 'diagnosedDate' in item && item.diagnosedDate)
    return `Diagnosed: ${item.diagnosedDate}`;
  if (activeTab === 1 && typeof item === 'object' && 'dosage' in item && item.dosage)
    return `Dosage: ${item.dosage}`;
  if (activeTab === 2 && typeof item === 'object' && 'reaction' in item && item.reaction)
    return `Reaction: ${item.reaction}`;
  if (activeTab === 3 && typeof item === 'object' && 'relation' in item && item.relation)
    return `${item.relation}${('ageOfOnset' in item && item.ageOfOnset) ? ` (Age ${item.ageOfOnset})` : ''}`;
  if (activeTab === 4 && typeof item === 'object' && 'date' in item && item.date)
    return `Date: ${new Date(item.date).toLocaleDateString()}`;
  if (activeTab === 5 && typeof item === 'object' && 'date' in item && item.date)
    return `Date: ${item.date}`;
  return '';
};

const MedicalHistoryItemCard: React.FC<MedicalHistoryItemCardProps> = ({
  item,
  index,
  activeTab,
  tabConfig,
  onEdit,
  onDelete,
}) => (
  <TouchableOpacity style={styles.itemCard} onPress={() => onEdit(item, index)}>
    <View style={styles.itemContent}>
      <View style={styles.itemHeader}>
        <View style={[styles.itemIcon, { backgroundColor: tabConfig.color }]}>
          <Ionicons name={tabConfig.icon as any} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{getItemTitle(item, activeTab)}</Text>
          <Text style={styles.itemSubtitle}>{getItemSubtitle(item, activeTab)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(index)}>
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
  },
});

export default MedicalHistoryItemCard;
