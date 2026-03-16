import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { colors } from '../../theme/colors';

type Nav = StackNavigationProp<ProfileTabParamList, 'PrivateCircles'>;

const SF_FONT = Platform.select({ ios: 'SF Pro Text', android: 'System' }) ?? 'System';

type CircleSummary = {
  id: string;
  name: string;
  members: number;
};

const PrivateCirclesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [joined, setJoined] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
  });

  const privateCircles = useMemo<CircleSummary[]>(
    () => [
      { id: 'c1', name: 'Family', members: 5 },
      { id: 'c2', name: 'Friends', members: 8 },
      { id: 'c3', name: 'Hikes and Parties', members: 42 },
      { id: 'c4', name: 'Football Paris', members: 18 },
      { id: 'c5', name: 'Wellness Warriors', members: 12 },
      { id: 'c6', name: 'Weekend Runners', members: 9 },
      { id: 'c7', name: 'Strength Club', members: 15 },
      { id: 'c8', name: 'Yoga Crew', members: 11 },
      { id: 'c9', name: 'Recovery Lab', members: 7 },
    ],
    []
  );

  const joinedCircles = privateCircles.filter((circle) => joined[circle.id]);

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
        <Text style={styles.headerTitle}>Private Circles</Text>
        <View style={styles.headerBackSpacer} />
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your private circles</Text>
        <View style={styles.listCard}>
          {joinedCircles.length === 0 ? (
            <Text style={styles.emptyText}>No private circles yet.</Text>
          ) : (
            joinedCircles.map((circle) => (
              <TouchableOpacity
                key={circle.id}
                style={styles.leagueRow}
                onPress={() => navigation.navigate('CircleDetail', { name: circle.name, members: circle.members })}
              >
                <View style={styles.leagueInfo}>
                  <Text style={styles.leagueName}>{circle.name}</Text>
                  <Text style={styles.leagueMeta}>{circle.members} members · Private</Text>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, styles.joinedBtn]}
                  onPress={() => setJoined((prev) => ({ ...prev, [circle.id]: false }))}
                >
                  <Text style={[styles.joinBtnText, styles.joinedBtnText]}>Joined</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Private circles</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>Join league</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>Create league</Text>
          </TouchableOpacity>
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
  sectionTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', fontFamily: SF_FONT, letterSpacing: 0.4, marginTop: 16, paddingHorizontal: 20 },
  listCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.divider },
  leagueRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  leagueInfo: { flex: 1, marginRight: 10 },
  leagueName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', fontFamily: SF_FONT },
  leagueMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2, fontFamily: SF_FONT },
  emptyText: { color: colors.textSecondary, fontSize: 12, paddingVertical: 12, fontFamily: SF_FONT },
  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 12 },
  actionBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.divider },
  actionBtnText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', fontFamily: SF_FONT },
  joinBtn: { backgroundColor: colors.cta, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  joinBtnText: { color: colors.ctaText, fontSize: 12, fontWeight: '700', fontFamily: SF_FONT },
  joinedBtn: { backgroundColor: colors.surfaceMuted },
  joinedBtnText: { color: colors.textSecondary },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  leaderName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, fontFamily: SF_FONT },
  rankText: { width: 36, color: colors.textSecondary, fontSize: 12, fontFamily: SF_FONT },
  scoreText: { color: '#FFD60A', fontSize: 14, fontWeight: '700', fontFamily: SF_FONT },
});

export default PrivateCirclesScreen;
