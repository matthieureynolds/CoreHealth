import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileTabParamList } from "@shared/types";

type Nav = StackNavigationProp<ProfileTabParamList, "PublicLeagues">;

type LeagueSummary = {
  id: string;
  name: string;
  members: number;
  icon: string;
  color: string;
  category: string;
};

const PublicLeaguesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState("All");

  const leagues = useMemo<LeagueSummary[]>(
    () => [
      {
        id: "rl1",
        name: "UK · Men 20–30",
        members: 128,
        icon: "flag",
        color: "#3AABF0",
        category: "Regional",
      },
      {
        id: "rl3",
        name: "Football · Recovery Circle",
        members: 96,
        icon: "football",
        color: "#FF9F0A",
        category: "Sport",
      },
      {
        id: "rl4",
        name: "Entrepreneurs Anti‑Stress",
        members: 173,
        icon: "briefcase",
        color: "#BF5AF2",
        category: "Lifestyle",
      },
      {
        id: "rl5",
        name: "Paris · Women 30–40",
        members: 88,
        icon: "flag",
        color: "#FF375F",
        category: "Regional",
      },
      {
        id: "rl6",
        name: "NYC · High Performers",
        members: 142,
        icon: "trending-up",
        color: "#FF9F0A",
        category: "Regional",
      },
      {
        id: "rl7",
        name: "Mindful Mornings",
        members: 121,
        icon: "sunny",
        color: "#FFD60A",
        category: "Lifestyle",
      },
      {
        id: "rl8",
        name: "Longevity Pros",
        members: 110,
        icon: "hourglass",
        color: "#30D158",
        category: "Health",
      },
      {
        id: "rl9",
        name: "Sleep Optimizers",
        members: 97,
        icon: "moon",
        color: "#5856D6",
        category: "Health",
      },
      {
        id: "rl10",
        name: "Mediterranean Health",
        members: 104,
        icon: "nutrition",
        color: "#FF6B35",
        category: "Regional",
      },
    ],
    [],
  );

  const categories = ["All", "Regional", "Sport", "Health", "Lifestyle"];
  const myLeagues = leagues.filter((l) => joined[l.id]);
  const filtered =
    activeCategory === "All"
      ? leagues
      : leagues.filter((l) => l.category === activeCategory);

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
        <Text style={styles.headerTitle}>Public Leagues</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {myLeagues.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>MY LEAGUES</Text>
            <View style={styles.card}>
              {myLeagues.map((league, index) => (
                <TouchableOpacity
                  key={league.id}
                  style={[
                    styles.row,
                    index === myLeagues.length - 1 && styles.lastRow,
                  ]}
                  onPress={() =>
                    navigation.navigate("PublicLeagueDetail", {
                      id: league.id,
                      name: league.name,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: league.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={league.icon as any}
                      size={20}
                      color={league.color}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{league.name}</Text>
                    <Text style={styles.rowSubtitle}>
                      {league.members} members · {league.category}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.joinedBtn}
                    onPress={() =>
                      setJoined((prev) => ({ ...prev, [league.id]: false }))
                    }
                  >
                    <Text style={styles.joinedBtnText}>Joined</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>DISCOVER LEAGUES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                activeCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeCategory === cat && styles.filterTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.card}>
          {filtered.map((league, index) => (
            <TouchableOpacity
              key={league.id}
              style={[
                styles.row,
                index === filtered.length - 1 && styles.lastRow,
              ]}
              onPress={() =>
                navigation.navigate("PublicLeagueDetail", {
                  id: league.id,
                  name: league.name,
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: league.color + "20" },
                ]}
              >
                <Ionicons
                  name={league.icon as any}
                  size={20}
                  color={league.color}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{league.name}</Text>
                <Text style={styles.rowSubtitle}>
                  {league.members} members · {league.category}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.joinBtn, joined[league.id] && styles.joinedBtn]}
                onPress={() =>
                  setJoined((prev) => ({
                    ...prev,
                    [league.id]: !prev[league.id],
                  }))
                }
              >
                <Text
                  style={[
                    styles.joinBtnText,
                    joined[league.id] && styles.joinedBtnText,
                  ]}
                >
                  {joined[league.id] ? "Joined" : "Join"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  filterChipActive: { backgroundColor: "#3AABF0", borderColor: "#3AABF0" },
  filterText: { color: "#8E8E93", fontSize: 14, fontWeight: "500" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "600" },
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  lastRow: { borderBottomWidth: 0 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  rowSubtitle: { fontSize: 13, color: "#8E8E93" },
  joinBtn: {
    backgroundColor: "#3AABF0",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  joinBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  joinedBtn: { backgroundColor: "#2C2C2E" },
  joinedBtnText: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
});

export default PublicLeaguesScreen;
