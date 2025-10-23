import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { useSettings } from '../../context/SettingsContext';

type BiomarkerVisibilityScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface BiomarkerInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  isCore?: boolean; // Core biomarkers that are recommended for everyone
}

const BiomarkerVisibilityScreen: React.FC = () => {
  const navigation = useNavigation<BiomarkerVisibilityScreenNavigationProp>();
  const { settings, updateBiomarkerSettings } = useSettings();
  
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);

  // Define available biomarkers organized by category
  const biomarkerCategories = {
    'Metabolic Health': [
      { id: 'glucose', name: 'Glucose', description: 'Blood sugar levels', icon: 'water-outline', isCore: true },
      { id: 'homa_ir', name: 'HOMA-IR', description: 'Insulin resistance index', icon: 'analytics-outline', isCore: true },
      { id: 'hemoglobin_a1c', name: 'Hemoglobin A1C', description: 'Average blood sugar over 3 months', icon: 'time-outline' },
      { id: 'insulin', name: 'Insulin', description: 'Hormone that regulates blood sugar', icon: 'medical-outline' },
    ],
    'Cardiovascular': [
      { id: 'cholesterol', name: 'Total Cholesterol', description: 'Overall cholesterol levels', icon: 'heart-circle-outline', isCore: true },
      { id: 'ldl', name: 'LDL Cholesterol', description: 'Low-density lipoprotein (bad cholesterol)', icon: 'trending-down-outline', isCore: true },
      { id: 'hdl', name: 'HDL Cholesterol', description: 'High-density lipoprotein (good cholesterol)', icon: 'trending-up-outline', isCore: true },
      { id: 'triglycerides', name: 'Triglycerides', description: 'Blood fats that affect heart health', icon: 'pulse-outline' },
      { id: 'hs_crp', name: 'hs-CRP', description: 'C-reactive protein (inflammation marker)', icon: 'flame-outline', isCore: true },
      { id: 'resting_hr', name: 'Resting Heart Rate', description: 'Heart rate at rest', icon: 'heart-outline', isCore: true },
    ],
    'Liver Function': [
      { id: 'alt', name: 'ALT', description: 'Alanine aminotransferase', icon: 'leaf-outline', isCore: true },
      { id: 'ast', name: 'AST', description: 'Aspartate aminotransferase', icon: 'leaf-outline' },
      { id: 'bilirubin', name: 'Bilirubin', description: 'Waste product processed by liver', icon: 'color-palette-outline' },
      { id: 'albumin', name: 'Albumin', description: 'Protein made by the liver', icon: 'body-outline' },
    ],
    'Kidney Function': [
      { id: 'creatinine', name: 'Creatinine', description: 'Waste product filtered by kidneys', icon: 'fitness-outline', isCore: true },
      { id: 'bun', name: 'BUN', description: 'Blood urea nitrogen', icon: 'water-outline' },
      { id: 'egfr', name: 'eGFR', description: 'Estimated glomerular filtration rate', icon: 'speedometer-outline' },
    ],
    'Hormones': [
      { id: 'tsh', name: 'TSH', description: 'Thyroid stimulating hormone', icon: 'cellular-outline', isCore: true },
      { id: 'free_t3', name: 'Free T3', description: 'Active thyroid hormone', icon: 'flash-outline', isCore: true },
      { id: 'free_t4', name: 'Free T4', description: 'Thyroid hormone precursor', icon: 'battery-charging-outline' },
      { id: 'testosterone', name: 'Testosterone', description: 'Primary male sex hormone', icon: 'fitness-outline' },
      { id: 'cortisol', name: 'Cortisol', description: 'Stress hormone', icon: 'alert-circle-outline' },
    ],
    'Vitamins & Minerals': [
      { id: 'vitamin_d', name: 'Vitamin D', description: 'Essential for bone health and immunity', icon: 'sunny-outline', isCore: true },
      { id: 'vitamin_b12', name: 'Vitamin B12', description: 'Important for nerve function', icon: 'nutrition-outline' },
      { id: 'folate', name: 'Folate', description: 'B vitamin essential for cell division', icon: 'leaf-outline' },
      { id: 'iron', name: 'Iron', description: 'Mineral essential for oxygen transport', icon: 'magnet-outline' },
      { id: 'ferritin', name: 'Ferritin', description: 'Iron storage protein', icon: 'archive-outline' },
    ],
    'Blood Count': [
      { id: 'wbc', name: 'White Blood Cells', description: 'Immune system cells', icon: 'shield-outline' },
      { id: 'rbc', name: 'Red Blood Cells', description: 'Oxygen-carrying cells', icon: 'ellipse-outline' },
      { id: 'platelets', name: 'Platelets', description: 'Blood clotting cells', icon: 'bandage-outline' },
      { id: 'hemoglobin', name: 'Hemoglobin', description: 'Oxygen-carrying protein', icon: 'pulse-outline' },
    ],
  };

  const handleToggleBiomarker = (biomarkerId: string, isVisible: boolean) => {
    const newVisibility = {
      ...settings.biomarkers.visibility,
      [biomarkerId]: isVisible,
    };
    
    updateBiomarkerSettings({ visibility: newVisibility });
  };

  const handleToggleCategory = (category: string, isVisible: boolean) => {
    const biomarkers = biomarkerCategories[category as keyof typeof biomarkerCategories];
    const newVisibility = { ...settings.biomarkers.visibility };
    
    biomarkers.forEach(biomarker => {
      newVisibility[biomarker.id] = isVisible;
    });
    
    updateBiomarkerSettings({ visibility: newVisibility });
  };

  const handleShowAllCore = () => {
    const newVisibility = { ...settings.biomarkers.visibility };
    
    Object.values(biomarkerCategories).flat().forEach(biomarker => {
      if (biomarker.isCore) {
        newVisibility[biomarker.id] = true;
      }
    });
    
    updateBiomarkerSettings({ visibility: newVisibility });
    
    Alert.alert(
      'Core Biomarkers Enabled',
      'All essential biomarkers have been enabled for comprehensive health tracking.'
    );
  };

  const handleHideAll = () => {
    Alert.alert(
      'Hide All Biomarkers',
      'This will hide all biomarkers from your dashboard. You can re-enable them individually.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Hide All', 
          style: 'destructive',
          onPress: () => {
            const newVisibility: { [key: string]: boolean } = {};
            Object.values(biomarkerCategories).flat().forEach(biomarker => {
              newVisibility[biomarker.id] = false;
            });
            updateBiomarkerSettings({ visibility: newVisibility });
          }
        },
      ]
    );
  };

  const getVisibleCount = (category: string) => {
    const biomarkers = biomarkerCategories[category as keyof typeof biomarkerCategories];
    return biomarkers.filter(biomarker => 
      settings.biomarkers.visibility[biomarker.id] !== false
    ).length;
  };

  const getTotalVisibleBiomarkers = () => {
    return Object.values(biomarkerCategories).flat().filter(biomarker =>
      settings.biomarkers.visibility[biomarker.id] !== false
    ).length;
  };

  const BiomarkerItem = ({ biomarker }: { biomarker: BiomarkerInfo }) => {
    const isVisible = settings.biomarkers.visibility[biomarker.id] !== false;
    
    if (showOnlyVisible && !isVisible) return null;
    
    return (
      <View style={styles.biomarkerItem}>
        <View style={styles.biomarkerLeft}>
          <Ionicons name={biomarker.icon as any} size={24} color={isVisible ? "#007AFF" : "#C7C7CC"} />
          <View style={styles.biomarkerInfo}>
            <View style={styles.biomarkerTitleRow}>
              <Text style={[styles.biomarkerName, !isVisible && styles.disabledText]}>
                {biomarker.name}
              </Text>
              {biomarker.isCore && (
                <View style={styles.coreIndicator}>
                  <Text style={styles.coreText}>CORE</Text>
                </View>
              )}
            </View>
            <Text style={styles.biomarkerDescription}>{biomarker.description}</Text>
          </View>
        </View>
        <Switch
          value={isVisible}
          onValueChange={(value) => handleToggleBiomarker(biomarker.id, value)}
          trackColor={{ false: '#E5E5EA', true: '#30D158' }}
          thumbColor="#fff"
        />
      </View>
    );
  };

  const CategorySection = ({ category }: { category: string }) => {
    const biomarkers = biomarkerCategories[category as keyof typeof biomarkerCategories];
    const visibleCount = getVisibleCount(category);
    const allVisible = visibleCount === biomarkers.length;
    const someVisible = visibleCount > 0;
    
    return (
      <View style={styles.categorySection}>
        <TouchableOpacity 
          style={styles.categoryHeader}
          onPress={() => handleToggleCategory(category, !allVisible)}
        >
          <View style={styles.categoryLeft}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <Text style={styles.categoryCount}>
              {visibleCount} of {biomarkers.length} visible
            </Text>
          </View>
          <Switch
            value={allVisible}
            onValueChange={(value) => handleToggleCategory(category, value)}
            trackColor={{ false: '#E5E5EA', true: '#30D158' }}
            thumbColor="#fff"
          />
        </TouchableOpacity>
        
        {biomarkers.map(biomarker => (
          <BiomarkerItem key={biomarker.id} biomarker={biomarker} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biomarker Visibility</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stats and Controls */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {getTotalVisibleBiomarkers()} biomarkers visible
        </Text>
        
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton} onPress={handleShowAllCore}>
            <Ionicons name="star-outline" size={16} color="#007AFF" />
            <Text style={styles.controlButtonText}>Show Core</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={handleHideAll}>
            <Ionicons name="eye-off-outline" size={16} color="#FF3B30" />
            <Text style={[styles.controlButtonText, { color: '#FF3B30' }]}>Hide All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Show only visible biomarkers</Text>
          <Switch
            value={showOnlyVisible}
            onValueChange={setShowOnlyVisible}
            trackColor={{ false: '#E5E5EA', true: '#30D158' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Biomarker Categories */}
      <ScrollView style={styles.scrollView}>
        {Object.keys(biomarkerCategories).map(category => (
          <CategorySection key={category} category={category} />
        ))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    width: 40,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  statsText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    gap: 4,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 15,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginTop: 35,
  },
  categoryHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  categoryLeft: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  categoryCount: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  biomarkerItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    paddingLeft: 32,
  },
  biomarkerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biomarkerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  biomarkerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  biomarkerName: {
    fontSize: 16,
    color: '#000000',
  },
  disabledText: {
    color: '#8E8E93',
  },
  biomarkerDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  coreIndicator: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coreText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default BiomarkerVisibilityScreen; 