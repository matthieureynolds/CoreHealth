import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import BiomarkerModal, { BiomarkerInfo } from '../../../../shared/components/modals/BiomarkerModal';
import { getBiomarkerInfo } from '../../../../shared/data/biomarkerDatabase';
import { vitamins, majorMinerals, traceMinerals } from '../../nutrition';
import { NutritionItem } from '../../nutrition/types';

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'normal':    return '#30D158';
    case 'low':       return '#FF9500';
    case 'high':      return '#FF3B30';
    case 'deficient': return '#FF3B30';
    default:          return '#8E8E93';
  }
};

const NutritionBodyMap: React.FC = () => {
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleItemPress = (item: NutritionItem) => {
    const biomarkerInfo = getBiomarkerInfo(
      item.name,
      item.value,
      item.status === 'deficient' ? 'low' : item.status,
    );
    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setModalVisible(true);
    }
  };

  const renderNutritionSection = (title: string, items: NutritionItem[]) => {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    return (
      <React.Fragment key={title}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.separatorLine} />
        <View style={styles.biomarkerList}>
          {sorted.map((item, index) => (
            <TouchableOpacity
              key={`${title}-${index}`}
              style={styles.biomarkerItem}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.biomarkerColumn1}>
                <Text style={styles.biomarkerName}>{item.name}</Text>
              </View>
              <View style={styles.biomarkerColumn2}>
                <Text style={[styles.biomarkerValue, { color: getStatusColor(item.status), fontWeight: 'bold' }]}>
                  {item.value} {item.unit}
                </Text>
              </View>
              <View style={styles.biomarkerColumn3}>
                <Text style={styles.biomarkerRange}>({item.range})</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition Profile</Text>
          <Text style={styles.subtitle}>
            Track your vitamin and mineral levels for optimal health
          </Text>
        </View>

        <View style={styles.nutritionTable}>
          {renderNutritionSection('Vitamins',       vitamins)}
          {renderNutritionSection('Major Minerals', majorMinerals)}
          {renderNutritionSection('Trace Minerals', traceMinerals)}
        </View>
      </View>

      <BiomarkerModal
        visible={modalVisible}
        biomarker={selectedBiomarker}
        onClose={() => {
          setModalVisible(false);
          setSelectedBiomarker(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  nutritionTable: {
    gap: 24,
  },
  sectionHeader: {
    marginBottom: -12,
    marginTop: -16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginBottom: 0,
    marginTop: 0,
  },
  biomarkerList: {
    gap: 16,
    paddingBottom: 20,
  },
  biomarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    minHeight: 48,
  },
  biomarkerColumn1: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  biomarkerColumn2: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 10,
  },
  biomarkerColumn3: {
    flex: 1,
    alignItems: 'flex-end',
  },
  biomarkerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  biomarkerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  biomarkerRange: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
});

export default NutritionBodyMap;
