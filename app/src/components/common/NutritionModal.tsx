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

export interface NutritionInfo {
  name: string;
  value: number;
  unit: string;
  range: string;
  status: 'normal' | 'low' | 'high' | 'deficient';
  category: 'vitamin' | 'mineral';
  description: string;
  detailedInfo: {
    whatItIs: string;
    whatItDoes: string;
    whatYourLevelMeans: string;
    foodSources: string[];
    healthBenefits: string[];
    deficiencySymptoms: string[];
    excessSymptoms: string[];
    dailyRecommendation: string;
    absorptionFactors: string[];
    interactions: string[];
  };
}

interface NutritionModalProps {
  visible: boolean;
  nutrition: NutritionInfo | null;
  onClose: () => void;
}

const NutritionModal: React.FC<NutritionModalProps> = ({
  visible,
  nutrition,
  onClose,
}) => {
  if (!nutrition) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#30D158';
      case 'low':
        return '#FF9500';
      case 'high':
        return '#FF9500';
      case 'deficient':
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
      case 'deficient':
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
        return 'Your levels are below the optimal range';
      case 'high':
        return 'Your levels are above the optimal range';
      case 'deficient':
        return 'Your levels indicate a deficiency';
      default:
        return 'Status unknown';
    }
  };

  const getCategoryIcon = (category: string) => {
    return category === 'vitamin' ? 'leaf' : 'diamond';
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
          <Text style={styles.title}>{nutrition.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[
                getStatusColor(nutrition.status),
                `${getStatusColor(nutrition.status)}80`,
              ]}
              style={styles.statusGradient}
            >
              <View style={styles.statusHeader}>
                <Ionicons
                  name={getStatusIcon(nutrition.status)}
                  size={32}
                  color="#fff"
                />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusValue}>
                    {nutrition.value} {nutrition.unit}
                  </Text>
                  <Text style={styles.statusRange}>
                    Optimal: {nutrition.range}
                  </Text>
                </View>
              </View>
              <Text style={styles.statusMessage}>
                {getStatusMessage(nutrition.status)}
              </Text>
            </LinearGradient>
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Ionicons 
              name={getCategoryIcon(nutrition.category) as any} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.categoryText}>
              {nutrition.category.charAt(0).toUpperCase() + nutrition.category.slice(1)}
            </Text>
          </View>

          {/* What It Is */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is {nutrition.name}?</Text>
            <Text style={styles.sectionText}>{nutrition.detailedInfo.whatItIs}</Text>
          </View>

          {/* What It Does */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What does it do?</Text>
            <Text style={styles.sectionText}>{nutrition.detailedInfo.whatItDoes}</Text>
          </View>

          {/* What Your Level Means */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Your Level Means</Text>
            <Text style={styles.sectionText}>{nutrition.detailedInfo.whatYourLevelMeans}</Text>
          </View>

          {/* Daily Recommendation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Recommendation</Text>
            <Text style={styles.sectionText}>{nutrition.detailedInfo.dailyRecommendation}</Text>
          </View>

          {/* Food Sources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Food Sources</Text>
            {nutrition.detailedInfo.foodSources.map((source, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="restaurant" size={16} color="#30D158" />
                <Text style={styles.listText}>{source}</Text>
              </View>
            ))}
          </View>

          {/* Health Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Benefits</Text>
            {nutrition.detailedInfo.healthBenefits.map((benefit, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color="#30D158" />
                <Text style={styles.listText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Deficiency Symptoms */}
          {nutrition.status === 'low' || nutrition.status === 'deficient' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deficiency Symptoms</Text>
              {nutrition.detailedInfo.deficiencySymptoms.map((symptom, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="warning" size={16} color="#FF9500" />
                  <Text style={styles.listText}>{symptom}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Excess Symptoms */}
          {nutrition.status === 'high' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Excess Symptoms</Text>
              {nutrition.detailedInfo.excessSymptoms.map((symptom, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.listText}>{symptom}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Absorption Factors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Absorption Factors</Text>
            {nutrition.detailedInfo.absorptionFactors.map((factor, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="arrow-up-circle" size={16} color="#007AFF" />
                <Text style={styles.listText}>{factor}</Text>
              </View>
            ))}
          </View>

          {/* Interactions */}
          {nutrition.detailedInfo.interactions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Important Interactions</Text>
              {nutrition.detailedInfo.interactions.map((interaction, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="information-circle" size={16} color="#007AFF" />
                  <Text style={styles.listText}>{interaction}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    zIndex: 1000,
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
    marginBottom: 16,
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
});

export default NutritionModal; 