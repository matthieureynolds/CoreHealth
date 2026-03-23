import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymptomEntry, StateOfMindChartData, SymptomStats } from '../../../shared/types/symptoms';
import { symptomService } from '../../../shared/services/symptomService';
import StateOfMindChart from '../../home/components/StateOfMindChart';

const SymptomRegisteredScreen: React.FC = () => {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [chartData, setChartData] = useState<StateOfMindChartData | null>(null);
  const [stats, setStats] = useState<SymptomStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | '6months' | 'yearly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'physical' | 'mental'>('all');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [symptomsData, chartDataResult, statsData] = await Promise.all([
        symptomService.getSymptoms(),
        symptomService.getStateOfMindChartData(selectedPeriod),
        symptomService.getSymptomStats(),
      ]);
      
      setSymptoms(symptomsData);
      setChartData(chartDataResult);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading symptom data:', error);
      Alert.alert('Error', 'Failed to load symptom data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSymptom = async (symptomId: string) => {
    Alert.alert(
      'Delete Symptom',
      'Are you sure you want to delete this symptom entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await symptomService.deleteSymptom(symptomId);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete symptom');
            }
          },
        },
      ]
    );
  };

  const getFilteredSymptoms = () => {
    if (filter === 'all') return symptoms;
    return symptoms.filter(symptom => symptom.type === filter);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return '#4CD964'; // Green for mild
    if (severity <= 6) return '#FFD93D'; // Yellow for moderate
    if (severity <= 8) return '#FF9500'; // Orange for severe
    return '#FF3B30'; // Red for extreme
  };

  const getSeverityLabel = (severity: number) => {
    const labels = ['Very Mild', 'Mild', 'Moderate', 'Moderate-Severe', 'Severe', 'Very Severe', 'Extreme', 'Unbearable', 'Critical', 'Emergency'];
    return labels[severity - 1] || 'Unknown';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading symptom data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Symptom Registered</Text>
        <Text style={styles.subtitle}>Track your health patterns over time</Text>
      </View>

      {/* State of Mind Chart */}
      {chartData && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>State of Mind</Text>
          <StateOfMindChart data={chartData} />
        </View>
      )}

      {/* Stats Summary */}
      {stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.physicalEntries}</Text>
              <Text style={styles.statLabel}>Physical</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.mentalEntries}</Text>
              <Text style={styles.statLabel}>Mental</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageSeverity.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Severity</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'physical' && styles.filterTabActive]}
            onPress={() => setFilter('physical')}
          >
            <Text style={[styles.filterTabText, filter === 'physical' && styles.filterTabTextActive]}>
              Physical
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'mental' && styles.filterTabActive]}
            onPress={() => setFilter('mental')}
          >
            <Text style={[styles.filterTabText, filter === 'mental' && styles.filterTabTextActive]}>
              Mental
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Symptoms List */}
      <View style={styles.symptomsSection}>
        <Text style={styles.sectionTitle}>Recent Symptoms</Text>
        {getFilteredSymptoms().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No symptoms logged yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Use the + button on the home screen to log your first symptom
            </Text>
          </View>
        ) : (
          getFilteredSymptoms().map((symptom) => (
            <View key={symptom.id} style={styles.symptomCard}>
              <View style={styles.symptomHeader}>
                <View style={styles.symptomInfo}>
                  <View style={styles.symptomTypeContainer}>
                    <Ionicons
                      name={symptom.type === 'physical' ? 'medical-outline' : 'heart-outline'}
                      size={16}
                      color={symptom.type === 'physical' ? '#FF6B6B' : '#5856D6'}
                    />
                    <Text style={styles.symptomType}>
                      {symptom.type === 'physical' ? 'Physical' : 'Mental'}
                    </Text>
                  </View>
                  <Text style={styles.symptomCategory}>{symptom.category}</Text>
                  <Text style={styles.symptomDate}>{formatDate(symptom.timestamp)}</Text>
                </View>
                <View style={styles.symptomActions}>
                  <View style={styles.severityContainer}>
                    <View
                      style={[
                        styles.severityDot,
                        { backgroundColor: getSeverityColor(symptom.severity) }
                      ]}
                    />
                    <Text style={styles.severityText}>
                      {getSeverityLabel(symptom.severity)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSymptom(symptom.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {symptom.notes && (
                <Text style={styles.symptomNotes}>{symptom.notes}</Text>
              )}
              
              {symptom.location && (
                <View style={styles.symptomMeta}>
                  <Ionicons name="location-outline" size={14} color="#8E8E93" />
                  <Text style={styles.symptomMetaText}>{symptom.location}</Text>
                </View>
              )}
              
              {symptom.factors && symptom.factors.length > 0 && (
                <View style={styles.factorsContainer}>
                  {symptom.factors.map((factor, index) => (
                    <View key={index} style={styles.factorChip}>
                      <Text style={styles.factorChipText}>{factor}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  chartSection: {
    backgroundColor: '#1C1C1E',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsSection: {
    backgroundColor: '#1C1C1E',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  symptomsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  symptomCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symptomInfo: {
    flex: 1,
  },
  symptomTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  symptomType: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  symptomCategory: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  symptomDate: {
    color: '#8E8E93',
    fontSize: 12,
  },
  symptomActions: {
    alignItems: 'flex-end',
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  symptomNotes: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  symptomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  symptomMetaText: {
    color: '#8E8E93',
    fontSize: 12,
    marginLeft: 4,
  },
  factorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  factorChip: {
    backgroundColor: '#3A3A3C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  factorChipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default SymptomRegisteredScreen;
