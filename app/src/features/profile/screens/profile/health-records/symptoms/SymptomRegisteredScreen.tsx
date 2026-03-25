import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymptomEntry, StateOfMindChartData, SymptomStats } from '../../../../../../shared/types/symptoms';
import { symptomService } from '../../../../../../shared/services/user/symptomService';
import StateOfMindChart from '../../../../../home/health-metrics/lifestyle/StateOfMindChart';
import SymptomCard from './components/SymptomCard';
import SymptomStatsGrid from './components/SymptomStatsGrid';
import SymptomFilterTabs from './components/SymptomFilterTabs';

type FilterType = 'all' | 'physical' | 'mental';

const getSeverityColor = (severity: number): string => {
  if (severity <= 3) return '#4CD964';
  if (severity <= 6) return '#FFD93D';
  if (severity <= 8) return '#FF9500';
  return '#FF3B30';
};

const getSeverityLabel = (severity: number): string => {
  const labels = ['Very Mild', 'Mild', 'Moderate', 'Moderate-Severe', 'Severe', 'Very Severe', 'Extreme', 'Unbearable', 'Critical', 'Emergency'];
  return labels[severity - 1] || 'Unknown';
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SymptomRegisteredScreen: React.FC = () => {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [chartData, setChartData] = useState<StateOfMindChartData | null>(null);
  const [stats, setStats] = useState<SymptomStats | null>(null);
  const [selectedPeriod] = useState<'weekly' | 'monthly' | '6months' | 'yearly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => { loadData(); }, [selectedPeriod]);

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
    Alert.alert('Delete Symptom', 'Are you sure you want to delete this symptom entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await symptomService.deleteSymptom(symptomId);
            await loadData();
          } catch {
            Alert.alert('Error', 'Failed to delete symptom');
          }
        },
      },
    ]);
  };

  const filteredSymptoms = filter === 'all' ? symptoms : symptoms.filter(s => s.type === filter);

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
      <View style={styles.header}>
        <Text style={styles.title}>Symptom Registered</Text>
        <Text style={styles.subtitle}>Track your health patterns over time</Text>
      </View>

      {chartData && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>State of Mind</Text>
          <StateOfMindChart data={chartData} />
        </View>
      )}

      {stats && <SymptomStatsGrid stats={stats} />}

      <SymptomFilterTabs filter={filter} onFilterChange={setFilter} />

      <View style={styles.symptomsSection}>
        <Text style={styles.sectionTitle}>Recent Symptoms</Text>
        {filteredSymptoms.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No symptoms logged yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Use the + button on the home screen to log your first symptom
            </Text>
          </View>
        ) : (
          filteredSymptoms.map((symptom) => (
            <SymptomCard
              key={symptom.id}
              symptom={symptom}
              onDelete={handleDeleteSymptom}
              formatDate={formatDate}
              getSeverityColor={getSeverityColor}
              getSeverityLabel={getSeverityLabel}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  loadingText: { color: '#FFFFFF', marginTop: 16, fontSize: 16 },
  header: { padding: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#8E8E93' },
  chartSection: {
    backgroundColor: '#1C1C1E',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  symptomsSection: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateSubtext: { color: '#8E8E93', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

export default SymptomRegisteredScreen;
