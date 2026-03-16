import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { colors } from '../../theme/colors';

type Nav = StackNavigationProp<ProfileTabParamList, 'PublicLeagues'>;

const SF_FONT = Platform.select({ ios: 'SF Pro Text', android: 'System' }) ?? 'System';

type LeagueSummary = {
  id: string;
  name: string;
  members: number;
};

const PublicLeaguesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const { width: windowWidth } = useWindowDimensions();

  const publicLeagues = useMemo<LeagueSummary[]>(
    () => [
      { id: 'rl1', name: 'UK · Men 20–30', members: 128 },
      { id: 'rl3', name: 'Football · Recovery Circle', members: 96 },
      { id: 'rl4', name: 'Entrepreneurs Anti‑Stress', members: 173 },
      { id: 'rl5', name: 'Paris · Women 30–40', members: 88 },
      { id: 'rl6', name: 'NYC · High Performers', members: 142 },
      { id: 'rl7', name: 'Mindful Mornings', members: 121 },
      { id: 'rl8', name: 'Longevity Pros', members: 110 },
      { id: 'rl9', name: 'Sleep Optimizers', members: 97 },
      { id: 'rl10', name: 'Mediterranean Health', members: 104 },
    ],
    []
  );

  const publicPages = useMemo(() => {
    const pageSize = 3;
    const pages: LeagueSummary[][] = [];
    for (let i = 0; i < publicLeagues.length; i += pageSize) {
      pages.push(publicLeagues.slice(i, i + pageSize));
    }
    return pages;
  }, [publicLeagues]);

  const resolvedPageWidth = pageWidth || windowWidth - 40;
  const joinedLeagues = publicLeagues.filter((league) => joined[league.id]);

  const worldwideLeaders = [
    { name: 'Alex M.', score: 96 },
    { name: 'Sofia L.', score: 95 },
    { name: 'Kenji T.', score: 94 },
    { name: 'Priya R.', score: 93 },
    { name: 'Jonas K.', score: 92 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Public Leagues</Text>
        <View style={styles.headerBackSpacer} />
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your public leagues</Text>
        <View style={styles.listCard}>
          {joinedLeagues.length === 0 ? (
            <Text style={styles.emptyText}>No public leagues joined yet.</Text>
          ) : (
            joinedLeagues.map((league) => (
              <TouchableOpacity
                key={league.id}
                style={styles.leagueRow}
                onPress={() => navigation.navigate('PublicLeagueDetail', { id: league.id, name: league.name })}
              >
                <View style={styles.leagueInfo}>
                  <Text style={styles.leagueName}>{league.name}</Text>
                  <Text style={styles.leagueMeta}>{league.members} members · Public</Text>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, styles.joinedBtn]}
                  onPress={() => setJoined((prev) => ({ ...prev, [league.id]: false }))}
                >
                  <Text style={[styles.joinBtnText, styles.joinedBtnText]}>Joined</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>Join league</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>Create league</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Public leagues</Text>
          <View style={styles.dotRow}>
            {publicPages.map((_, idx) => (
              <View key={`dot-${idx}`} style={[styles.dot, idx === pageIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
        <View
          style={styles.carouselWrap}
          onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
        >
          <ScrollView
            ref={(ref) => {
              scrollRef.current = ref;
            }}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / resolvedPageWidth);
              setPageIndex(nextIndex);
            }}
          >
            {publicPages.map((page, idx) => (
              <View key={`page-${idx}`} style={[styles.carouselPage, { width: resolvedPageWidth }]}>
                {page.map((league) => (
                  <TouchableOpacity
                    key={league.id}
                    style={styles.leagueRow}
                    onPress={() => navigation.navigate('PublicLeagueDetail', { id: league.id, name: league.name })}
                  >
                    <View style={styles.leagueInfo}>
                      <Text style={styles.leagueName}>{league.name}</Text>
                      <Text style={styles.leagueMeta}>{league.members} members · Public</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.joinBtn, joined[league.id] && styles.joinedBtn]}
                      onPress={() => setJoined((prev) => ({ ...prev, [league.id]: !prev[league.id] }))}
                    >
                      <Text style={[styles.joinBtnText, joined[league.id] && styles.joinedBtnText]}>
                        {joined[league.id] ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Worldwide leaderboard</Text>
        <View style={styles.listCard}>
          {worldwideLeaders.map((leader, idx) => (
            <View key={leader.name} style={styles.leaderRow}>
              <Text style={styles.rankText}>#{idx + 1}</Text>
              <Ionicons name="person" size={14} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={styles.leaderName}>{leader.name}</Text>
              <Text style={styles.scoreText}>{leader.score}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 20, paddingBottom: 4, backgroundColor: colors.bg },
  scrollContent: { flex: 1 },
  headerBackBtn: { padding: 4 },
  headerBackSpacer: { width: 32, height: 32 },
  headerTitle: { flex: 1, color: colors.textPrimary, fontSize: 20, fontWeight: '600', textAlign: 'center', fontFamily: SF_FONT },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8, paddingHorizontal: 20 },
  sectionTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', fontFamily: SF_FONT, letterSpacing: 0.4, marginTop: 16, paddingHorizontal: 20 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { backgroundColor: colors.textPrimary },
  listCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.divider },
  leagueRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  leagueInfo: { flex: 1, marginRight: 10 },
  leagueName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', fontFamily: SF_FONT },
  leagueMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2, fontFamily: SF_FONT },
  emptyText: { color: colors.textSecondary, fontSize: 12, paddingVertical: 12, fontFamily: SF_FONT },
  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 8 },
  actionBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.divider },
  actionBtnText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', fontFamily: SF_FONT },
  carouselWrap: { marginHorizontal: 20 },
  carouselPage: { backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.divider },
  joinBtn: { backgroundColor: colors.cta, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  joinBtnText: { color: colors.ctaText, fontSize: 12, fontWeight: '700', fontFamily: SF_FONT },
  joinedBtn: { backgroundColor: colors.surfaceMuted },
  joinedBtnText: { color: colors.textSecondary },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  leaderName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, fontFamily: SF_FONT },
  rankText: { width: 36, color: colors.textSecondary, fontSize: 12, fontFamily: SF_FONT },
  scoreText: { color: '#FFD60A', fontSize: 14, fontWeight: '700', fontFamily: SF_FONT },
});

export default PublicLeaguesScreen;
