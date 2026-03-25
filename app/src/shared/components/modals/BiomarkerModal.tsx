import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BiomarkerComparisonModal from './BiomarkerComparisonModal';
import BiomarkerResultCard from './components/BiomarkerResultCard';
import BiomarkerRangeIndicator from './components/BiomarkerRangeIndicator';
import BiomarkerHistoryGraph from './components/BiomarkerHistoryGraph';
import BiomarkerInfoSections from './components/BiomarkerInfoSections';

export interface BiomarkerInfo {
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  explanation: string;
  whatItMeans: string;
  tips: string[];
  category: string;
  organSystem?: string;
  lastTested?: string;
  percentile?: number;
  whyItMatters?: string;
  levelMeaning?: {
    low?: string;
    normal?: string;
    high?: string;
    critical?: string;
  };
  historyData?: number[];
  comparisonData?: {
    allPopulation: number;
    ageSexGroup: number;
  };
}

interface BiomarkerModalProps {
  visible: boolean;
  biomarker: BiomarkerInfo | null;
  onClose: () => void;
}

const getBackgroundColor = (status: string) => {
  switch (status) {
    case 'normal': return '#1C3A1C';
    case 'low': return '#3A2F1C';
    case 'high': return '#3A2F1C';
    case 'critical': return '#3A1C1C';
    default: return '#2C2C2E';
  }
};

const BiomarkerModal: React.FC<BiomarkerModalProps> = ({ visible, biomarker, onClose }) => {
  const [comparisonModalVisible, setComparisonModalVisible] = useState(false);

  if (!biomarker) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FF3B30" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{biomarker.name}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <BiomarkerResultCard
            biomarker={biomarker}
            backgroundColor={getBackgroundColor(biomarker.status)}
          />

          <BiomarkerRangeIndicator
            referenceRange={biomarker.referenceRange}
            value={biomarker.value}
          />

          <BiomarkerHistoryGraph historyData={biomarker.historyData} />

          <BiomarkerInfoSections
            biomarker={biomarker}
            onComparePress={() => setComparisonModalVisible(true)}
          />
        </ScrollView>
      </View>

      <BiomarkerComparisonModal
        visible={comparisonModalVisible}
        biomarker={biomarker}
        onClose={() => setComparisonModalVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  closeButton: {
    padding: 8,
    marginTop: 15,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginTop: -70,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default BiomarkerModal;
