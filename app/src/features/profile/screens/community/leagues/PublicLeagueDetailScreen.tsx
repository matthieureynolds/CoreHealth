import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileTabParamList } from "@shared/types";

type Nav = StackNavigationProp<ProfileTabParamList, "PublicLeagueDetail">;
type Route = RouteProp<ProfileTabParamList, "PublicLeagueDetail">;

type Player = {
  id: string;
  name: string;
  points: number;
  wins: number;
  losses: number;
};

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

const PublicLeagueDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id, name } = route.params;

  const standings = useMemo(() => {
    const byId: Record<string, Player[]> = {
      rl1: [
        { id: "t1", name: "Ben", points: 498, wins: 4, losses: 1 },
        { id: "t2", name: "Josh", points: 482, wins: 4, losses: 1 },
        { id: "t3", name: "Arun", points: 455, wins: 3, losses: 2 },
        { id: "t4", name: "Tom", points: 430, wins: 2, losses: 3 },
        { id: "t5", name: "James", points: 410, wins: 2, losses: 3 },
      ],
      rl3: [
        { id: "t5", name: "Louise", points: 472, wins: 4, losses: 1 },
        { id: "t6", name: "Kai", points: 463, wins: 3, losses: 2 },
        { id: "t7", name: "Maya", points: 448, wins: 3, losses: 2 },
        { id: "t8", name: "Noah", points: 421, wins: 2, losses: 3 },
      ],
      rl4: [
        { id: "t9", name: "Focus", points: 492, wins: 4, losses: 1 },
        { id: "t10", name: "Calm", points: 470, wins: 3, losses: 2 },
        { id: "t11", name: "Flow", points: 455, wins: 3, losses: 2 },
        { id: "t12", name: "Zen", points: 438, wins: 2, losses: 3 },
      ],
    };
    return (
      byId[id] || [
        { id: "a1", name: "TOTO", points: 480, wins: 4, losses: 1 },
        { id: "a2", name: "Momentum", points: 466, wins: 3, losses: 2 },
        { id: "a3", name: "Rhythm", points: 452, wins: 3, losses: 2 },
        { id: "a4", name: "Pulse", points: 439, wins: 2, losses: 3 },
      ]
    );
  }, [id]);

  const topPlayer = standings[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.leaderCard}>
          <View style={styles.leaderLeft}>
            <View style={styles.leaderAvatar}>
              <Text style={styles.leaderAvatarText}>{topPlayer.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.leaderLabel}>LEADING</Text>
              <Text style={styles.leaderName}>{topPlayer.name}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.leaderPoints}>{topPlayer.points}</Text>
            <Text style={styles.leaderPtsLabel}>pts</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>STANDINGS</Text>
        <View style={styles.card}>
          {standings.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.row,
                index === standings.length - 1 && styles.lastRow,
              ]}
            >
              <View style={styles.rankCell}>
                {MEDAL[index] ? (
                  <Text style={styles.medal}>{MEDAL[index]}</Text>
                ) : (
                  <Text style={styles.rank}>#{index + 1}</Text>
                )}
              </View>
              <View style={[styles.avatarSmall]}>
                <Text style={styles.avatarSmallText}>{player.name[0]}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{player.name}</Text>
                <Text style={styles.rowRecord}>
                  {player.wins}W · {player.losses}L
                </Text>
              </View>
              <Text style={styles.points}>{player.points} pts</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#1C1C1E",
  },
  backButton: { padding: 8, width: 40 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  scroll: { flex: 1 },
  leaderCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#3AABF015",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#3AABF030",
  },
  leaderLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  leaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3AABF0",
    justifyContent: "center",
    alignItems: "center",
  },
  leaderAvatarText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  leaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3AABF0",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  leaderName: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  leaderPoints: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFD60A",
    textAlign: "right",
  },
  leaderPtsLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
    textAlign: "right",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  lastRow: { borderBottomWidth: 0 },
  rankCell: { width: 36, alignItems: "center" },
  rank: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
  medal: { fontSize: 18 },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3AABF020",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarSmallText: { color: "#3AABF0", fontSize: 14, fontWeight: "bold" },
  rowText: { flex: 1 },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  rowRecord: { fontSize: 12, color: "#8E8E93" },
  points: { color: "#FFD60A", fontSize: 14, fontWeight: "700" },
});

export default PublicLeagueDetailScreen;
