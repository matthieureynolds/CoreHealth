import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type TabKey = 'my' | 'discover' | 'global';

type Team = {
  id: string;
  name: string;
  points: number; // season points
  wins: number;
  losses: number;
};

type Matchup = {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  start: string; // ISO
};

type League = {
  id: string;
  name: string;
  type: 'private' | 'public';
  commissioner: string;
  inviteCode: string;
  teams: Team[];
  rules: string[];
  schedule: Matchup[];
};

type LeagueSummary = {
  id: string;
  name: string;
  members: number;
  type: 'private' | 'public';
};

type Period = 'daily' | '7d' | '30d';

const CommunityLeaderboardScreen: React.FC = () => {
  // Access navigation via hook for navigating to CircleDetail
  // Using any to avoid tight coupling to navigator typing in this module
  const navigation: any = (require('@react-navigation/native') as any).useNavigation?.();
  const [period, setPeriod] = useState<Period>('7d');
  const [tab, setTab] = useState<TabKey>('my');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [leagueTab, setLeagueTab] = useState<'standings' | 'matchups' | 'rules'>('standings');
  const [joinedPublic, setJoinedPublic] = useState<Record<string, boolean>>({});
  const [myCountry, setMyCountry] = useState<string>('United Kingdom');

  const leagues: League[] = useMemo(
    () => [
      {
        id: 'l1',
        name: 'Wellness Warriors',
        type: 'private',
        commissioner: 'Alex',
        inviteCode: 'WW-7K3J',
        teams: [
          { id: 't1', name: 'Alex', points: 482, wins: 4, losses: 1 },
          { id: 't2', name: 'Sam', points: 471, wins: 4, losses: 1 },
          { id: 't3', name: 'Jordan', points: 455, wins: 3, losses: 2 },
          { id: 't4', name: 'Taylor', points: 430, wins: 3, losses: 2 },
          { id: 't5', name: 'Riley', points: 401, wins: 2, losses: 3 },
          { id: 't6', name: 'Casey', points: 372, wins: 1, losses: 4 },
        ],
        rules: [
          'Scoring: Daily CoreHealth score summed weekly',
          'Bonuses: +10 for 7-day streak, +5 for personal best',
          'Matchups: Head-to-head weekly; W/L based on total points',
        ],
        schedule: [
          { id: 'm1', week: 5, homeTeamId: 't1', awayTeamId: 't4', start: '2025-10-27T09:00:00Z' },
          { id: 'm2', week: 5, homeTeamId: 't2', awayTeamId: 't5', start: '2025-10-27T09:00:00Z' },
          { id: 'm3', week: 5, homeTeamId: 't3', awayTeamId: 't6', start: '2025-10-27T09:00:00Z' },
        ],
      },
      {
        id: 'l2',
        name: 'Longevity Pros',
        type: 'public',
        commissioner: 'Maya',
        inviteCode: 'LP-9ZQ2',
        teams: [
          { id: 't7', name: 'Maya', points: 520, wins: 5, losses: 0 },
          { id: 't8', name: 'Kai', points: 476, wins: 3, losses: 2 },
          { id: 't9', name: 'Noah', points: 468, wins: 3, losses: 2 },
          { id: 't10', name: 'Luca', points: 441, wins: 2, losses: 3 },
        ],
        rules: [
          'Scoring: Weighted across sleep, activity, recovery',
          'Bonuses: +8 for 5-day streak, +3 for improvement week-over-week',
          'Playoffs: Weeks 13–15',
        ],
        schedule: [
          { id: 'm4', week: 5, homeTeamId: 't7', awayTeamId: 't10', start: '2025-10-27T09:00:00Z' },
          { id: 'm5', week: 5, homeTeamId: 't8', awayTeamId: 't9', start: '2025-10-27T09:00:00Z' },
        ],
      },
      // Public leagues corresponding to recommendations
      {
        id: 'rl1',
        name: 'UK · Men 20–30',
        type: 'public',
        commissioner: 'Community',
        inviteCode: 'UKM-2030',
        teams: [
          { id: 'u1', name: 'Ben', points: 498, wins: 4, losses: 1 },
          { id: 'u2', name: 'Josh', points: 482, wins: 4, losses: 1 },
          { id: 'u3', name: 'Arun', points: 455, wins: 3, losses: 2 },
          { id: 'u4', name: 'Tom', points: 430, wins: 2, losses: 3 },
        ],
        rules: [
          'Scoring: Daily CoreHealth total per week',
          'Bonuses: +10 for 7-day streak',
        ],
        schedule: [
          { id: 'uk1', week: 5, homeTeamId: 'u1', awayTeamId: 'u4', start: '2025-10-27T09:00:00Z' },
          { id: 'uk2', week: 5, homeTeamId: 'u2', awayTeamId: 'u3', start: '2025-10-27T09:00:00Z' },
        ],
      },
      {
        id: 'rl2',
        name: 'Women 30–45 · Hormone Reset',
        type: 'public',
        commissioner: 'Community',
        inviteCode: 'W30-45',
        teams: [
          { id: 'w1', name: 'Ava', points: 510, wins: 5, losses: 0 },
          { id: 'w2', name: 'Mia', points: 488, wins: 4, losses: 1 },
          { id: 'w3', name: 'Isla', points: 462, wins: 3, losses: 2 },
          { id: 'w4', name: 'Emma', points: 439, wins: 2, losses: 3 },
        ],
        rules: [
          'Scoring: Balanced across sleep, activity, recovery',
          'Supportive leaderboard (consistency + improvement)',
        ],
        schedule: [
          { id: 'w11', week: 5, homeTeamId: 'w1', awayTeamId: 'w4', start: '2025-10-27T09:00:00Z' },
          { id: 'w12', week: 5, homeTeamId: 'w2', awayTeamId: 'w3', start: '2025-10-27T09:00:00Z' },
        ],
      },
      {
        id: 'rl3',
        name: 'Football · Recovery Circle',
        type: 'public',
        commissioner: 'Community',
        inviteCode: 'FB-REC',
        teams: [
          { id: 'f1', name: 'Strikers', points: 505, wins: 4, losses: 1 },
          { id: 'f2', name: 'Keepers', points: 480, wins: 3, losses: 2 },
          { id: 'f3', name: 'Wingers', points: 466, wins: 3, losses: 2 },
          { id: 'f4', name: 'Midfield', points: 440, wins: 2, losses: 3 },
        ],
        rules: [
          'Recovery-heavy scoring profile',
        ],
        schedule: [
          { id: 'f11', week: 5, homeTeamId: 'f1', awayTeamId: 'f4', start: '2025-10-27T09:00:00Z' },
          { id: 'f12', week: 5, homeTeamId: 'f2', awayTeamId: 'f3', start: '2025-10-27T09:00:00Z' },
        ],
      },
      {
        id: 'rl4',
        name: 'Entrepreneurs Anti‑Stress',
        type: 'public',
        commissioner: 'Community',
        inviteCode: 'ENT-RELAX',
        teams: [
          { id: 'e1', name: 'Focus', points: 492, wins: 4, losses: 1 },
          { id: 'e2', name: 'Calm', points: 470, wins: 3, losses: 2 },
          { id: 'e3', name: 'Flow', points: 455, wins: 3, losses: 2 },
          { id: 'e4', name: 'Zen', points: 438, wins: 2, losses: 3 },
        ],
        rules: [
          'Stress management bonus weeks',
        ],
        schedule: [
          { id: 'e11', week: 5, homeTeamId: 'e1', awayTeamId: 'e4', start: '2025-10-27T09:00:00Z' },
          { id: 'e12', week: 5, homeTeamId: 'e2', awayTeamId: 'e3', start: '2025-10-27T09:00:00Z' },
        ],
      },
    ],
    []
  );

  const recommendedLeagues: LeagueSummary[] = [
    { id: 'rl1', name: 'UK · Men 20–30', members: 128, type: 'public' },
    { id: 'rl2', name: 'Women 30–45 · Hormone Reset', members: 214, type: 'public' },
    { id: 'rl3', name: 'Football · Recovery Circle', members: 96, type: 'public' },
    { id: 'rl4', name: 'Entrepreneurs Anti‑Stress', members: 173, type: 'public' },
  ];

  const selectedLeague = useMemo(
    () => leagues.find((l) => l.id === selectedLeagueId) || null,
    [leagues, selectedLeagueId]
  );

  const standings = useMemo(() => {
    if (!selectedLeague) return [] as Team[];
    return [...selectedLeague.teams].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name);
    });
  }, [selectedLeague]);

  const currentWeek = 5; // mock current week
  const weekMatchups = useMemo(() => {
    if (!selectedLeague) return [] as Matchup[];
    return selectedLeague.schedule.filter((m) => m.week === currentWeek);
  }, [selectedLeague]);

  const TabButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress}>
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const SmallCTA = ({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) => (
    <TouchableOpacity style={styles.smallCta} onPress={onPress}>
      <Ionicons name={icon} size={16} color={colors.cta} />
      <Text style={styles.smallCtaText}>{label}</Text>
    </TouchableOpacity>
  );

  // Mock KPI data
  const kpis = useMemo(() => [], [period]);

  const countryAverages = useMemo(
    () => [
      { flag: '🇯🇵', name: 'Japan', score: 82.4 },
      { flag: '🇸🇬', name: 'Singapore', score: 80.9 },
      { flag: '🇨🇭', name: 'Switzerland', score: 79.8 },
      { flag: '🇬🇧', name: 'United Kingdom', score: 78.4 },
      { flag: '🇫🇷', name: 'France', score: 77.9 },
      { flag: '🇪🇸', name: 'Spain', score: 77.2 },
      { flag: '🇨🇦', name: 'Canada', score: 76.9 },
    ],
    []
  );

  const worldwideLeaders = useMemo(
    () => [
      { name: 'Alex M.', score: 96 },
      { name: 'Sofia L.', score: 95 },
      { name: 'Kenji T.', score: 94 },
      { name: 'Priya R.', score: 93 },
      { name: 'Jonas K.', score: 92 },
    ],
    []
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Community</Text>

      {/* Your Circles - list */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderLabel}>YOUR CIRCLES</Text>
        <RankFilter />
      </View>

      {([
        { name: 'FAMILY', members: 5, rank: '2nd', color: '#6D28D9', icon: 'people' as keyof typeof Ionicons.glyphMap, delta: 1 },
        { name: 'FRIENDS', members: 8, rank: '5th', color: '#DB2777', icon: 'people' as keyof typeof Ionicons.glyphMap, delta: 0 },
        { name: 'HIKES AND PARTIES', members: 42, rank: '7th', color: '#16A34A', icon: 'walk' as keyof typeof Ionicons.glyphMap, delta: 3 },
        { name: 'FOOTBALL PARIS', members: 18, rank: '10th', color: '#2563EB', icon: 'football' as keyof typeof Ionicons.glyphMap, delta: -1 },
      ]).map((c, idx) => (
        <TouchableOpacity key={c.name + idx} onPress={() => (navigation as any)?.navigate?.('CircleDetail', { name: c.name, members: c.members })}>
          <AnimatedTeamRow circle={c} />
        </TouchableOpacity>
      ))}

      <View style={styles.dashedRow}>
        <TouchableOpacity style={styles.dashedBtn}>
          <Text style={styles.dashedText}>CREATE A CIRCLE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dashedBtn}>
          <Text style={styles.dashedText}>ENTER INVITE CODE</Text>
        </TouchableOpacity>
      </View>

      {/* Public Leagues */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderLabel}>PUBLIC LEAGUES</Text>
      </View>
      <View style={styles.card}>
        {selectedLeague && tab === 'my' && selectedLeagueId && selectedLeagueId.startsWith('rl') ? (
          <View>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setSelectedLeagueId(null)} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={18} color={colors.cta} />
                <Text style={styles.backBtnText}>Leagues</Text>
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{selectedLeague.name}</Text>
              <View style={{ width: 70 }} />
            </View>
            <View>
              {standings.map((t, idx) => (
                <View key={t.id} style={styles.teamRow}>
                  <Text style={styles.teamRank}>#{idx + 1}</Text>
                  <Text style={styles.teamName}>{t.name}</Text>
                  <Text style={styles.teamRecord}>{t.wins}-{t.losses}</Text>
                  <Text style={styles.teamPoints}>{t.points} pts</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
        recommendedLeagues.map((l) => (
          <TouchableOpacity key={l.id} style={styles.discoverRow} onPress={() => {
            setSelectedLeagueId(l.id);
            setTab('my');
          }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.discoverName}>{l.name}</Text>
              <Text style={styles.discoverMeta}>{l.members} members · Public</Text>
            </View>
            {joinedPublic[l.id] ? (
              <View style={[styles.joinBtn, { backgroundColor: '#2C2C2E' }]}>
                <Text style={[styles.joinBtnText, { color: '#9AA3AF' }]}>Joined</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => {
                  setJoinedPublic((prev) => ({ ...prev, [l.id]: true }));
                  Alert.alert('Joined', `You joined ${l.name}`);
                }}
              >
                <Text style={styles.joinBtnText}>Join</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))
        )}
        <View style={{ height: 4 }} />
        <TouchableOpacity style={styles.smallCta} onPress={() => Alert.alert('Browse', 'Public league browsing coming soon')}>
          <Ionicons name="search" size={16} color={colors.cta} />
          <Text style={styles.smallCtaText}>Find More</Text>
        </TouchableOpacity>
      </View>

      {/* Country Leaderboard */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderLabel}>COUNTRY LEADERBOARD</Text>
        <TouchableOpacity style={styles.rankFilterBtn} onPress={() => Alert.alert('Choose Country', 'Country selector coming soon')}>
          <Text style={styles.rankFilterText}>My Country: {myCountry}</Text>
          <Ionicons name="chevron-down" size={14} color="#9AA3AF" />
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        {countryAverages.map((c, idx) => (
          <TouchableOpacity key={c.name} style={styles.lbRow} onPress={() => setMyCountry(c.name)}>
            <Text style={styles.lbRank}>#{idx + 1}</Text>
            <Text style={styles.lbFlag}>{c.flag}</Text>
            <Text style={[styles.lbName, myCountry === c.name && styles.lbNameYou]}>{c.name}{myCountry === c.name ? ' · You' : ''}</Text>
            <Text style={styles.lbScore}>{c.score.toFixed(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Worldwide Leaderboard */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderLabel}>WORLDWIDE LEADERBOARD</Text>
      </View>
      <View style={styles.card}>
        {worldwideLeaders.map((p, idx) => (
          <View key={p.name} style={styles.lbRow}>
            <Text style={styles.lbRank}>#{idx + 1}</Text>
            <Ionicons name="person" size={14} color="#9AA3AF" style={{ marginRight: 8 }} />
            <Text style={styles.lbName}>{p.name}</Text>
            <Text style={styles.lbScore}>{p.score}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const RankFilter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [metric, setMetric] = useState<'overall' | 'recovery' | 'biomarkers' | 'lifestyle'>('strain' as any);

  // Backward safety: normalize initial metric to overall
  const normalizedMetric = (['overall', 'recovery', 'biomarkers', 'lifestyle'] as const).includes(metric as any)
    ? metric
    : 'overall';

  const label = `${period.toUpperCase()} ${normalizedMetric.toUpperCase()} RANK`;

  return (
    <>
      <TouchableOpacity style={styles.rankFilterBtn} onPress={() => setOpen(true)}>
        <Text style={styles.rankFilterText}>{label}</Text>
        <Ionicons name="chevron-down" size={14} color="#9AA3AF" />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rank Filter</Text>
            <Text style={styles.modalSection}>Period</Text>
            <View style={styles.modalList}>
              {(['weekly', 'monthly', 'yearly'] as const).map(p => (
                <TouchableOpacity key={p} style={[styles.modalOption, period === p && styles.modalOptionActive]} onPress={() => setPeriod(p)}>
                  <Text style={[styles.modalOptionText, period === p && styles.modalOptionTextActive]}>{p.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.modalSection, { marginTop: 12 }]}>Metric</Text>
            <View style={styles.modalList}>
              {(['overall', 'recovery', 'biomarkers', 'lifestyle'] as const).map(m => (
                <TouchableOpacity key={m} style={[styles.modalOption, normalizedMetric === m && styles.modalOptionActive]} onPress={() => setMetric(m)}>
                  <Text style={[styles.modalOptionText, normalizedMetric === m && styles.modalOptionTextActive]}>{m.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalApply]} onPress={() => setOpen(false)}>
                <Text style={styles.modalApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const AnimatedTeamRow: React.FC<{ circle: { name: string; members: number; rank: string; color: string; icon: keyof typeof Ionicons.glyphMap; delta?: number; unread?: number } }> = ({ circle }) => {
  const scale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (circle.delta && circle.delta > 0) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
        Animated.timing(scale, { toValue: 1.1, duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
      ]).start();
    }
  }, [circle.delta]);

  return (
    <View style={styles.teamCard}>
      <View style={styles.teamLeft}>
        <View style={[styles.teamIcon, { backgroundColor: circle.color }]}>
          <Ionicons name={circle.icon} size={14} color="#fff" />
        </View>
        <Text style={styles.teamNameUpper}>{circle.name}</Text>
      </View>
      <View style={styles.teamRight}>
        <View style={styles.rankRow}>
          {circle.delta && circle.delta > 0 ? (
            <Animated.View style={[styles.deltaPill, styles.deltaUp, { transform: [{ scale }] }]}>
              <Ionicons name="arrow-up" size={10} color="#34C759" />
              <Text style={[styles.deltaText, styles.deltaTextUp]}>{circle.delta}</Text>
            </Animated.View>
          ) : null}
          <Text style={styles.rankPrimary}>{circle.rank}</Text>
        </View>
        <Text style={styles.rankSecondary}>of {circle.members}</Text>
        {circle.unread ? (
          <View style={styles.badge}><Text style={styles.badgeText}>{circle.unread}</Text></View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: '700', paddingHorizontal: 20, paddingTop: 56 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 14, marginBottom: 8 },
  sectionHeaderLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  rankFilterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.divider },
  rankFilterText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  teamCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.divider },
  teamLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  teamNameUpper: { color: colors.textPrimary, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  teamRight: { alignItems: 'flex-end' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankPrimary: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  rankSecondary: { color: colors.textSecondary, fontSize: 12, marginTop: -2 },
  badge: { position: 'absolute', right: -6, top: -6, backgroundColor: '#FF3B30', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: colors.textPrimary, fontSize: 10, fontWeight: '800' },
  deltaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  deltaUp: { backgroundColor: '#0A2F12' },
  deltaDown: { backgroundColor: '#3A1E1E' },
  deltaText: { fontSize: 10, fontWeight: '800' },
  deltaTextUp: { color: '#34C759' },
  deltaTextDown: { color: '#FF3B30' },
  dashedRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 6, marginBottom: 20 },
  dashedBtn: { flex: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.divider, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.bg },
  dashedText: { color: colors.textSecondary, fontWeight: '800', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.divider, padding: 16, width: '100%', maxWidth: 420 },
  modalTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  modalSection: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  modalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalList: { flexDirection: 'column', gap: 8 },
  modalOption: { backgroundColor: '#2C2C2E', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.divider },
  modalOptionActive: { backgroundColor: 'rgba(25,118,210,0.2)', borderColor: 'rgba(25,118,210,0.33)' },
  modalOptionText: { color: '#E5E5EA', fontWeight: '700' },
  modalOptionTextActive: { color: colors.cta },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  modalCancel: { backgroundColor: '#2C2C2E' },
  modalApply: { backgroundColor: colors.cta },
  modalCancelText: { color: '#E5E5EA', fontWeight: '700' },
  modalApplyText: { color: colors.ctaText, fontWeight: '800' },
  headerSubtitle: { color: colors.textSecondary, fontSize: 12, paddingHorizontal: 20, marginBottom: 10 },
  periodRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  periodChip: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#2C2C2E', borderRadius: 8 },
  periodChipActive: { backgroundColor: 'rgba(25,118,210,0.2)' },
  periodChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  periodChipTextActive: { color: colors.cta },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.divider },
  kpiValue: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  kpiUnit: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  kpiLabel: { color: '#C7C7CC', fontSize: 12, marginTop: 2 },
  kpiTrend: { marginTop: 6, fontSize: 12, fontWeight: '700' },
  kpiTrendUp: { color: '#34C759' },
  kpiTrendDown: { color: '#FF453A' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tabBtn: { flex: 1, backgroundColor: '#2C2C2E', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.cta },
  tabBtnText: { color: colors.textSecondary, fontWeight: '600' },
  tabBtnTextActive: { color: colors.ctaText },
  card: { backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 16 },
  cardTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { color: '#C7C7CC', fontSize: 14, lineHeight: 20 },
  small: { color: colors.textSecondary, fontSize: 12 },
  footerNote: { padding: 20 },
  ctaRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 10 },
  smallCta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(25,118,210,0.15)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start' },
  smallCtaText: { color: colors.cta, fontWeight: '700' },
  leagueHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  leagueIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  leagueBadge: { color: colors.textSecondary, fontSize: 12, marginLeft: 'auto' },
  previewStandingsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  previewChip: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  previewRank: { color: '#FFD60A', fontWeight: '700', marginBottom: 2 },
  previewName: { color: colors.textPrimary, fontWeight: '600' },
  previewMeta: { color: colors.textSecondary, fontSize: 12 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { color: colors.cta, fontWeight: '700' },
  subTabsRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  teamRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  teamRank: { color: colors.textSecondary, width: 28, textAlign: 'left' },
  teamName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 },
  teamRecord: { color: '#E5E5EA', width: 60, textAlign: 'right' },
  teamPoints: { color: '#FFD60A', width: 80, textAlign: 'right' },
  matchupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  matchupTeam: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  vsText: { color: colors.textSecondary, fontSize: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  ruleText: { color: '#E5E5EA', fontSize: 14, flex: 1 },
  discoverRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  discoverName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  discoverMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  joinBtn: { backgroundColor: colors.cta, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  joinBtnText: { color: colors.ctaText, fontWeight: '700' },
  flagRow: { color: colors.textPrimary, fontSize: 16, marginVertical: 2 },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  lbRank: { color: colors.textSecondary, width: 28 },
  lbFlag: { width: 24, textAlign: 'center' },
  lbName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  lbNameYou: { color: colors.cta },
  lbScore: { color: '#FFD60A', fontWeight: '800', width: 60, textAlign: 'right' },
});

export default CommunityLeaderboardScreen;
