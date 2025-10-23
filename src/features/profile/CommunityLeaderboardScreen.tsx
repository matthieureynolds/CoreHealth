import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHealthData } from '../../context/HealthDataContext';
import { leaderboardService } from '../../services/leaderboardService';
import { LeaderboardData, LeaderboardSettings, ScoreBreakdown } from '../../types/leaderboard';

const CommunityLeaderboardScreen: React.FC = () => {
  const { profile } = useHealthData();
  const [period, setPeriod] = useState<'monthly' | 'overall'>('monthly');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [userScore, setUserScore] = useState<ScoreBreakdown | null>(null);
  const [settings, setSettings] = useState<LeaderboardSettings>({
    showRankingToFriends: true,
    showRankingGlobally: false,
    includeInMonthly: true,
    includeInOverall: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboardData();
  }, [period]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      const [leaderboard, scoreBreakdown] = await Promise.all([
        leaderboardService.getLeaderboardData(period, settings),
        leaderboardService.getUserScoreBreakdown(profile, {}), // Mock health data
      ]);
      setLeaderboardData(leaderboard);
      setUserScore(scoreBreakdown);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      Alert.alert('Error', 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof LeaderboardSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    leaderboardService.updateLeaderboardSettings(newSettings);
  };

  const renderScoreBar = (label: string, score: number, color: string) => (
    <View style={styles.scoreBarContainer}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreBar}>
        <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: color }]} />
        <Text style={styles.scoreText}>{score}/100</Text>
      </View>
    </View>
  );

  const renderLeaderboardItem = (user: any, index: number, isGlobal = false) => {
    const getRankIcon = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `${rank}.`;
    };

    const getRankColor = (rank: number) => {
      if (rank <= 3) return '#FFD700';
      if (rank <= 10) return '#C0C0C0';
      return '#8E8E93';
    };

    return (
      <View key={user.userId} style={styles.leaderboardItem}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(user.rank) }]}>
            {getRankIcon(user.rank)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.scoreText}>{user.overallScore} points</Text>
        </View>
        <View style={styles.improvementContainer}>
          <Ionicons 
            name={user.improvement > 0 ? "trending-up" : "trending-down"} 
            size={16} 
            color={user.improvement > 0 ? "#4CD964" : "#FF3B30"} 
          />
          <Text style={[
            styles.improvementText, 
            { color: user.improvement > 0 ? "#4CD964" : "#FF3B30" }
          ]}>
            {user.improvement > 0 ? '+' : ''}{user.improvement}%
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Health Community</Text>
        <View style={styles.periodToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, period === 'monthly' && styles.toggleButtonActive]}
            onPress={() => setPeriod('monthly')}
          >
            <Text style={[styles.toggleText, period === 'monthly' && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, period === 'overall' && styles.toggleButtonActive]}
            onPress={() => setPeriod('overall')}
          >
            <Text style={[styles.toggleText, period === 'overall' && styles.toggleTextActive]}>
              Overall
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Your Status Card */}
      {userScore && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Your {period === 'monthly' ? 'Monthly' : 'Overall'} Status</Text>
          {leaderboardData && (
            <View style={styles.rankInfo}>
              <Text style={styles.rankInfoText}>
                Friends: #{leaderboardData.userRank.friends} of {leaderboardData.userRank.totalFriends}
              </Text>
              <Text style={styles.rankInfoText}>
                Global: #{leaderboardData.userRank.global} of {leaderboardData.userRank.totalGlobal}
              </Text>
            </View>
          )}
          
          <View style={styles.scoreBreakdown}>
            {renderScoreBar('Daily Activity', userScore.dailyActivity.score, '#4CD964')}
            {renderScoreBar('Recovery', userScore.recovery.score, '#007AFF')}
            {renderScoreBar('Lab Results', userScore.labResults.score, '#FF9500')}
            {renderScoreBar('Overall', userScore.overall, '#5856D6')}
          </View>
        </View>
      )}

      {/* Friends Leaderboard */}
      {leaderboardData && (
        <View style={styles.leaderboardSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Top Friends</Text>
          </View>
          {leaderboardData.friends.map((user, index) => renderLeaderboardItem(user, index))}
        </View>
      )}

      {/* Global Leaderboard */}
      {leaderboardData && settings.showRankingGlobally && (
        <View style={styles.leaderboardSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe" size={20} color="#FF9500" />
            <Text style={styles.sectionTitle}>Global Champions</Text>
          </View>
          {leaderboardData.global.map((user, index) => renderLeaderboardItem(user, index, true))}
        </View>
      )}

      {/* Privacy Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Privacy Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Show my ranking to friends</Text>
          <Switch
            value={settings.showRankingToFriends}
            onValueChange={(value) => handleSettingChange('showRankingToFriends', value)}
            trackColor={{ false: '#3A3A3C', true: '#007AFF' }}
            thumbColor={settings.showRankingToFriends ? '#FFFFFF' : '#8E8E93'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Show my ranking globally</Text>
          <Switch
            value={settings.showRankingGlobally}
            onValueChange={(value) => handleSettingChange('showRankingGlobally', value)}
            trackColor={{ false: '#3A3A3C', true: '#007AFF' }}
            thumbColor={settings.showRankingGlobally ? '#FFFFFF' : '#8E8E93'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Include in monthly leaderboard</Text>
          <Switch
            value={settings.includeInMonthly}
            onValueChange={(value) => handleSettingChange('includeInMonthly', value)}
            trackColor={{ false: '#3A3A3C', true: '#007AFF' }}
            thumbColor={settings.includeInMonthly ? '#FFFFFF' : '#8E8E93'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Include in overall leaderboard</Text>
          <Switch
            value={settings.includeInOverall}
            onValueChange={(value) => handleSettingChange('includeInOverall', value)}
            trackColor={{ false: '#3A3A3C', true: '#007AFF' }}
            thumbColor={settings.includeInOverall ? '#FFFFFF' : '#8E8E93'}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
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
    marginBottom: 20,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: '#1C1C1E',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  rankInfo: {
    marginBottom: 20,
  },
  rankInfoText: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 4,
  },
  scoreBreakdown: {
    gap: 16,
  },
  scoreBarContainer: {
    marginBottom: 12,
  },
  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#3A3A3C',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  leaderboardSection: {
    backgroundColor: '#1C1C1E',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  settingsSection: {
    backgroundColor: '#1C1C1E',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
});

export default CommunityLeaderboardScreen;
