import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { colors } from '../../theme/colors';

type Nav = StackNavigationProp<ProfileTabParamList, 'PublicLeagueDetail'>;
type Route = RouteProp<ProfileTabParamList, 'PublicLeagueDetail'>;

const SF_FONT = Platform.select({ ios: 'SF Pro Text', android: 'System' }) ?? 'System';

type Team = { id: string; name: string; points: number; wins: number; losses: number };

const PublicLeagueDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id, name } = route.params;

  const standings = useMemo(() => {
    const byId: Record<string, Team[]> = {
      rl1: [
        { id: 't1', name: 'Ben', points: 498, wins: 4, losses: 1 },
        { id: 't2', name: 'Josh', points: 482, wins: 4, losses: 1 },
        { id: 't3', name: 'Arun', points: 455, wins: 3, losses: 2 },
        { id: 't4', name: 'Tom', points: 430, wins: 2, losses: 3 },
      ],
      rl3: [
        { id: 't5', name: 'Louise', points: 472, wins: 4, losses: 1 },
        { id: 't6', name: 'Kai', points: 463, wins: 3, losses: 2 },
        { id: 't7', name: 'Maya', points: 448, wins: 3, losses: 2 },
        { id: 't8', name: 'Noah', points: 421, wins: 2, losses: 3 },
      ],
      rl4: [
        { id: 't9', name: 'Focus', points: 492, wins: 4, losses: 1 },
        { id: 't10', name: 'Calm', points: 470, wins: 3, losses: 2 },
        { id: 't11', name: 'Flow', points: 455, wins: 3, losses: 2 },
        { id: 't12', name: 'Zen', points: 438, wins: 2, losses: 3 },
      ],
    };
    return byId[id] || [
      { id: 'a1', name: 'CoreHealth', points: 480, wins: 4, losses: 1 },
      { id: 'a2', name: 'Momentum', points: 466, wins: 3, losses: 2 },
      { id: 'a3', name: 'Rhythm', points: 452, wins: 3, losses: 2 },
      { id: 'a4', name: 'Pulse', points: 439, wins: 2, losses: 3 },
    ];
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={styles.headerBackSpacer} />
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.leaderboardCard]}>
          {standings.map((t, idx) => (
            <View key={t.id} style={styles.lbRow}>
              <Text style={styles.lbRank}>#{idx + 1}</Text>
              <Ionicons name="person" size={14} color="#9AA3AF" style={{ marginRight: 8 }} />
              <Text style={styles.lbName}>{t.name}</Text>
              <Text style={styles.lbScore}>{t.points}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

export default PublicLeagueDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 20, paddingBottom: 4, backgroundColor: colors.bg },
  scrollContent: { flex: 1 },
  headerBackBtn: { padding: 4 },
  headerBackSpacer: { width: 32, height: 32 },
  headerTitle: { flex: 1, color: colors.textPrimary, fontSize: 20, fontWeight: '600', textAlign: 'center', fontFamily: SF_FONT },
  card: { backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 10, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  leaderboardCard: { paddingTop: 4, paddingBottom: 4 },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  lbRank: { color: colors.textSecondary, width: 40, fontSize: 13, fontFamily: SF_FONT },
  lbName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, fontFamily: SF_FONT },
  lbScore: { color: '#FFD60A', fontWeight: '700', textAlign: 'right', fontSize: 14, fontFamily: SF_FONT },
});
