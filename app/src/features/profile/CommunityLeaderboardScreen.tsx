import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const SF_FONT = Platform.select({ ios: 'SF Pro Text', android: 'System' }) ?? 'System';

const CommunityLeaderboardScreen: React.FC = () => {
  const navigation: any = (require('@react-navigation/native') as any).useNavigation?.();
  const countryLeaders = [
    { flag: '🇯🇵', name: 'Japan', score: 82.4 },
    { flag: '🇸🇬', name: 'Singapore', score: 80.9 },
    { flag: '🇨🇭', name: 'Switzerland', score: 79.8 },
    { flag: '🇬🇧', name: 'United Kingdom', score: 78.4 },
    { flag: '🇫🇷', name: 'France', score: 77.9 },
    { flag: '🇪🇸', name: 'Spain', score: 77.2 },
    { flag: '🇨🇦', name: 'Canada', score: 76.9 },
    { flag: '🇳🇱', name: 'Netherlands', score: 76.4 },
    { flag: '🇳🇿', name: 'New Zealand', score: 75.9 },
    { flag: '🇸🇪', name: 'Sweden', score: 75.3 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Community</Text>
      </View>
      <View style={styles.squareRow}>
        <TouchableOpacity
          style={styles.squareCard}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate?.('PrivateCircles')}
        >
          <Text style={styles.squareText}>Private circles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.squareCard}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate?.('PublicLeagues')}
        >
          <Text style={styles.squareText}>Public circles</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.leaderboardSection}>
        <Text style={styles.sectionTitle}>Country leaderboard</Text>
        <TouchableOpacity
          style={styles.leaderboardCard}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate?.('CountryLeaderboard')}
        >
          <View style={styles.leaderboardList}>
            {countryLeaders.map((country, index) => (
              <View key={country.name} style={styles.leaderboardRow}>
                <Text style={styles.rankText}>#{index + 1}</Text>
                <Text style={styles.flagText}>{country.flag}</Text>
                <Text style={styles.countryText}>{country.name}</Text>
                <Text style={styles.scoreText}>{country.score.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  headerRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: SF_FONT,
    textAlign: 'center',
  },
  squareRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  squareCard: {
    width: 150,
    height: 150,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: SF_FONT,
    textAlign: 'center',
  },
  leaderboardSection: {
    width: '100%',
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: SF_FONT,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  leaderboardList: {
    width: '100%',
  },
  leaderboardCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rankText: {
    width: 36,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: SF_FONT,
  },
  flagText: {
    width: 24,
    textAlign: 'center',
    marginRight: 6,
  },
  countryText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: SF_FONT,
  },
  scoreText: {
    color: '#FFD60A',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: SF_FONT,
  },
});

export default CommunityLeaderboardScreen;
