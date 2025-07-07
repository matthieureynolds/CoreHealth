import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
}

interface BiomarkerModalProps {
  visible: boolean;
  biomarker: BiomarkerInfo | null;
  onClose: () => void;
}

const BiomarkerModal: React.FC<BiomarkerModalProps> = ({
  visible,
  biomarker,
  onClose,
}) => {
  if (!biomarker) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#30D158';
      case 'low':
        return '#FF9500';
      case 'high':
        return '#FF9500';
      case 'critical':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return 'checkmark-circle';
      case 'low':
        return 'arrow-down-circle';
      case 'high':
        return 'arrow-up-circle';
      case 'critical':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Your levels are within the healthy range';
      case 'low':
        return 'Your levels are below the normal range';
      case 'high':
        return 'Your levels are above the normal range';
      case 'critical':
        return 'Your levels require immediate attention';
      default:
        return 'Status unknown';
    }
  };

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
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{biomarker.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[
                getStatusColor(biomarker.status),
                `${getStatusColor(biomarker.status)}80`,
              ]}
              style={styles.statusGradient}
            >
              <View style={styles.statusHeader}>
                <Ionicons
                  name={getStatusIcon(biomarker.status)}
                  size={32}
                  color="#fff"
                />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusValue}>
                    {biomarker.value} {biomarker.unit}
                  </Text>
                  <Text style={styles.statusRange}>
                    Normal: {biomarker.referenceRange}
                  </Text>
                </View>
              </View>
              <Text style={styles.statusMessage}>
                {getStatusMessage(biomarker.status)}
              </Text>
            </LinearGradient>
          </View>

          {/* Visual Range Indicator */}
          <View style={styles.rangeIndicator}>
            <Text style={styles.sectionTitle}>Your Level vs Normal Range</Text>
            <View style={styles.rangeBar}>
              <View style={styles.rangeBackground}>
                <View
                  style={[
                    styles.rangeFill,
                    { backgroundColor: getStatusColor(biomarker.status) },
                  ]}
                />
              </View>
              <View style={styles.rangeLabels}>
                <Text style={styles.rangeLabel}>Low</Text>
                <Text style={styles.rangeLabel}>Normal</Text>
                <Text style={styles.rangeLabel}>High</Text>
              </View>
            </View>
          </View>

          {/* What It Is */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is {biomarker.name}?</Text>
            <Text style={styles.sectionText}>{biomarker.explanation}</Text>
          </View>

          {/* What Your Level Means */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Your Level Means</Text>
            <Text style={styles.sectionText}>{biomarker.whatItMeans}</Text>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips to Optimize</Text>
            {biomarker.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={20} color="#30D158" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Category */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{biomarker.category}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  statusGradient: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusRange: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  statusMessage: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  rangeIndicator: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  rangeBar: {
    marginTop: 16,
  },
  rangeBackground: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rangeFill: {
    height: '100%',
    width: '60%', // This would be calculated based on actual value
    borderRadius: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BiomarkerModal;
