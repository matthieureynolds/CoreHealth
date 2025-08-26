import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface HeroHealthScoreProps {
  score: number;
  onPress?: () => void;
}

const HeroHealthScore: React.FC<HeroHealthScoreProps> = ({ 
  score, 
  onPress 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Use consistent, responsive sizing
  const circleSize = Math.min(width * 0.45, 180); // Max 180px, responsive to screen
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(score, 100)) / 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#30D158'; // Green - Excellent
    if (score >= 65) return '#32D74B'; // Light Green - Good  
    if (score >= 50) return '#FF9F0A'; // Orange - Fair
    if (score >= 35) return '#FF6B35'; // Red Orange - Poor
    return '#FF3B30'; // Red - Critical
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 65) return 'GOOD';
    if (score >= 50) return 'FAIR';
    if (score >= 35) return 'POOR';
    return 'CRITICAL';
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 80) return 'You\'re in the top 15% of users. Your health metrics are exceptional and you\'re maintaining excellent habits.';
    if (score >= 65) return 'You\'re in the top 35% of users. Your health is good with room for improvement in specific areas.';
    if (score >= 50) return 'You\'re in the middle 50% of users. Focus on improving sleep, activity, and stress management.';
    if (score >= 35) return 'You\'re in the bottom 25% of users. Consider consulting with healthcare professionals for guidance.';
    return 'You\'re in the bottom 10% of users. Immediate attention to health habits is recommended.';
  };

  const getComparisonText = (score: number): string => {
    if (score >= 80) return 'Top 15%';
    if (score >= 65) return 'Top 35%';
    if (score >= 50) return 'Top 50%';
    if (score >= 35) return 'Top 75%';
    return 'Top 90%';
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  const handlePress = () => {
    setModalVisible(true);
    onPress?.();
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.scoreContainer}>
          <View style={[styles.circleWrapper, { width: circleSize, height: circleSize }]}>
            <Svg 
              width={circleSize} 
              height={circleSize} 
              style={styles.svg}
            >
              {/* Background circle */}
              <Circle
                stroke="#2C2C2E"
                fill="none"
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <Circle
                stroke={scoreColor}
                fill="none"
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
              />
            </Svg>
            
            <View style={styles.scoreContent}>
              <Text style={styles.brandText}>COREHEALTH</Text>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
              <Text style={styles.scoreSubtitle}>HEALTH SCORE</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Health Score Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Health Score Details</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Score Display */}
              <View style={styles.scoreDisplay}>
                <View style={styles.scoreCircle}>
                  <Text style={[styles.modalScoreValue, { color: scoreColor }]}>{score}</Text>
                  <Text style={[styles.modalScoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
                </View>
              </View>

              {/* Comparison Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How You Compare</Text>
                <View style={styles.comparisonCard}>
                  <Ionicons name="trending-up" size={24} color={scoreColor} />
                  <Text style={styles.comparisonText}>{getComparisonText(score)}</Text>
                  <Text style={styles.comparisonSubtext}>of CoreHealth users</Text>
                </View>
              </View>

              {/* Description Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What This Means</Text>
                <Text style={styles.descriptionText}>{getScoreDescription(score)}</Text>
              </View>

              {/* How It's Measured Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How It's Measured</Text>
                <View style={styles.measurementItem}>
                  <Ionicons name="moon" size={20} color="#9013FE" />
                  <View style={styles.measurementText}>
                    <Text style={styles.measurementTitle}>Sleep Quality (25%)</Text>
                    <Text style={styles.measurementDesc}>Based on sleep duration, consistency, and recovery metrics</Text>
                  </View>
                </View>
                <View style={styles.measurementItem}>
                  <Ionicons name="fitness" size={20} color="#FF6B35" />
                  <View style={styles.measurementText}>
                    <Text style={styles.measurementTitle}>Physical Activity (25%)</Text>
                    <Text style={styles.measurementDesc}>Daily steps, exercise, and movement patterns</Text>
                  </View>
                </View>
                <View style={styles.measurementItem}>
                  <Ionicons name="heart" size={20} color="#FF3B30" />
                  <View style={styles.measurementText}>
                    <Text style={styles.measurementTitle}>Stress & Recovery (25%)</Text>
                    <Text style={styles.measurementDesc}>Heart rate variability and stress indicators</Text>
                  </View>
                </View>
                <View style={styles.measurementItem}>
                  <Ionicons name="water" size={20} color="#007AFF" />
                  <View style={styles.measurementText}>
                    <Text style={styles.measurementTitle}>Biomarkers (25%)</Text>
                    <Text style={styles.measurementDesc}>Lab results and health metrics</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scoreContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 48,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scoreSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  comparisonCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  comparisonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  comparisonSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  descriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  measurementText: {
    flex: 1,
    marginLeft: 12,
  },
  measurementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  measurementDesc: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

export default HeroHealthScore; 