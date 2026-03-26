import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ProfileTabParamList } from '../../../../../shared/types';

type Nav = StackNavigationProp<ProfileTabParamList, 'CircleDetail'>;
type Route = RouteProp<ProfileTabParamList, 'CircleDetail'>;

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

const MEMBERS = [
  { name: 'Matthieu', recovery: 86, biomarkers: 72, lifestyle: 81 },
  { name: 'Patrick',  recovery: 83, biomarkers: 67, lifestyle: 78 },
  { name: 'Dad',      recovery: 88, biomarkers: 70, lifestyle: 74 },
  { name: 'Mum',      recovery: 79, biomarkers: 76, lifestyle: 80 },
  { name: 'Eleanor',  recovery: 82, biomarkers: 73, lifestyle: 77 },
].map((m) => ({ ...m, overall: Math.round((m.recovery + m.biomarkers + m.lifestyle) / 3) }))
 .sort((a, b) => b.overall - a.overall);

const ScorePill = ({ value, color }: { value: number; color: string }) => (
  <View style={[styles.scorePill, { backgroundColor: color + '18' }]}>
    <Text style={[styles.scoreValue, { color }]}>{value}</Text>
  </View>
);

const CircleDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { name = 'Circle', members = 0 } = (route.params || {}) as any;

  const [period, setPeriod] = useState<'daily' | '7d' | '30d'>('7d');

  const isNewCircle = members <= 1;

  const inviteCode = `${String(name).replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-JOIN`;

  const leader = MEMBERS[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {isNewCircle ? (
          /* ── Empty state ── */
          <>
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people" size={36} color="#5856D6" />
              </View>
              <Text style={styles.emptyTitle}>It's just you so far</Text>
              <Text style={styles.emptySubtitle}>Share your invite code to bring people into your circle and start competing</Text>
            </View>
          </>
        ) : (
          <>
            {/* Leader hero card */}
            <View style={styles.leaderCard}>
              <View style={styles.leaderLeft}>
                <View style={styles.leaderAvatar}>
                  <Text style={styles.leaderAvatarText}>{leader.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.leaderLabel}>LEADING</Text>
                  <Text style={styles.leaderName}>{leader.name}</Text>
                  <Text style={styles.leaderSub}>{members} members</Text>
                </View>
              </View>
              <View style={styles.leaderRight}>
                <Text style={styles.leaderScore}>{leader.overall}</Text>
                <Text style={styles.leaderScoreLabel}>overall</Text>
              </View>
            </View>

            {/* Period selector */}
            <View style={styles.periodRow}>
              {(['daily', '7d', '30d'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodChip, period === p && styles.periodChipActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                    {p === 'daily' ? 'DAILY' : p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Leaderboard */}
            <Text style={styles.sectionLabel}>LEADERBOARD</Text>
            <View style={styles.card}>
              {/* Column headers */}
              <View style={styles.tableHeader}>
                <View style={{ width: 36 }} />
                <View style={{ width: 32, marginRight: 12 }} />
                <View style={{ flex: 1 }} />
                <Text style={styles.colHeader}>REC</Text>
                <Text style={styles.colHeader}>BIO</Text>
                <Text style={styles.colHeader}>LIFE</Text>
              </View>

              {MEMBERS.map((m, i) => (
                <View key={m.name} style={[styles.row, i === MEMBERS.length - 1 && styles.lastRow]}>
                  {/* Rank */}
                  <View style={styles.rankCell}>
                    {MEDAL[i] ? (
                      <Text style={styles.medal}>{MEDAL[i]}</Text>
                    ) : (
                      <Text style={styles.rank}>#{i + 1}</Text>
                    )}
                  </View>
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{m.name[0]}</Text>
                  </View>
                  {/* Name + overall */}
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{m.name}</Text>
                    <Text style={styles.rowOverall}>{m.overall} overall</Text>
                  </View>
                  {/* Scores */}
                  <ScorePill value={m.recovery}   color="#30D158" />
                  <ScorePill value={m.biomarkers} color="#3AABF0" />
                  <ScorePill value={m.lifestyle}  color="#FF9F0A" />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Share card — always visible */}
        <Text style={styles.sectionLabel}>INVITE</Text>
        <View style={styles.shareCard}>
          <View style={styles.shareLeft}>
            <Text style={styles.shareTitle}>Share Circle</Text>
            <Text style={styles.shareSubtitle}>
              Invite others with code: <Text style={styles.shareCode}>{inviteCode}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => Share.share({
              message: `Join my ${name} circle on TOTO. Invite code: ${inviteCode}`,
            })}
          >
            <Ionicons name="share-social" size={16} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

export default CircleDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
  },
  backButton: { width: 36, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  scroll: { flex: 1 },

  // Leader card
  leaderCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginTop: 8,
    backgroundColor: '#5856D615', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#5856D630',
  },
  leaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  leaderAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#5856D6', justifyContent: 'center', alignItems: 'center',
  },
  leaderAvatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  leaderLabel: { fontSize: 11, fontWeight: '700', color: '#5856D6', letterSpacing: 0.5, marginBottom: 2 },
  leaderName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  leaderSub: { fontSize: 12, color: '#8E8E93' },
  leaderRight: { alignItems: 'center' },
  leaderScore: { fontSize: 36, fontWeight: '900', color: '#FFD60A' },
  leaderScoreLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '600' },

  // Period
  periodRow: {
    flexDirection: 'row', gap: 8, marginHorizontal: 20, marginTop: 20,
    backgroundColor: '#1C1C1E', borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: '#2C2C2E',
  },
  periodChip: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  periodChipActive: { backgroundColor: '#2C2C2E' },
  periodText: { color: '#8E8E93', fontSize: 12, fontWeight: '700' },
  periodTextActive: { color: '#FFFFFF' },

  // Section label
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5,
    marginTop: 24, marginBottom: 8, paddingHorizontal: 20,
  },

  // Leaderboard card
  card: {
    marginHorizontal: 20, backgroundColor: '#1C1C1E',
    borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E', overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E',
  },
  colHeader: {
    width: 44, textAlign: 'center',
    fontSize: 10, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 12, gap: 0,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E',
  },
  lastRow: { borderBottomWidth: 0 },
  rankCell: { width: 36, alignItems: 'center' },
  rank: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  medal: { fontSize: 16 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#5856D620', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#5856D6', fontSize: 13, fontWeight: 'bold' },
  rowText: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 1 },
  rowOverall: { fontSize: 11, color: '#8E8E93' },
  scorePill: {
    width: 44, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreValue: { fontSize: 13, fontWeight: '800' },

  // Share card
  shareCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, backgroundColor: '#1C1C1E',
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#2C2C2E',
  },
  shareLeft: { flex: 1 },
  shareTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  shareSubtitle: { color: '#8E8E93', fontSize: 13 },
  shareCode: { color: '#FFFFFF', fontWeight: '800' },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#5856D6', borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 14,
  },
  shareButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Empty state
  emptyCard: {
    alignItems: 'center', marginHorizontal: 20, marginTop: 32,
    backgroundColor: '#1C1C1E', borderRadius: 16, padding: 32,
    borderWidth: 1, borderColor: '#2C2C2E',
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#5856D620', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: '#8E8E93', fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
