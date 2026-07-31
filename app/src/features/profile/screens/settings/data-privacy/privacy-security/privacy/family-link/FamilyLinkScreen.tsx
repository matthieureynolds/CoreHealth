import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SettingsHeader from "@features/profile/screens/settings/components/SettingsHeader";
import { SETTINGS_SCROLL_PT } from "@features/profile/screens/settings/components/settingsLayout";
import familyService from "@shared/services/user/familyService";
import { RelationshipLink } from "@shared/types";

const FamilyLinkScreen: React.FC = () => {
  const navigation = useNavigation();
  const [links, setLinks] = useState<RelationshipLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [relativeHandle, setRelativeHandle] = useState("");
  const [degree, setDegree] = useState<
    "parent" | "child" | "sibling" | "partner" | "other"
  >("parent");

  const hashHandle = (handle: string) => {
    return `hash_${handle.trim().toLowerCase()}`;
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const result = await familyService.listLinks();
      setLinks(result);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message ?? "Failed to load links");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const requestLink = async () => {
    if (!relativeHandle.trim()) {
      Alert.alert("Missing", "Enter your relative's handle or email hash");
      return;
    }
    setIsLoading(true);
    try {
      await familyService.requestLink({
        relativeUidHash: hashHandle(relativeHandle),
        relativeSupabaseUid: null,
        degree,
        direction: "one_way",
      });
      setRelativeHandle("");
      await load();
      Alert.alert("Requested", "Link request sent for Risk-Only insights.");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message ?? "Failed to request link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SettingsHeader title="Family Link (Risk-Only)" />

      <View style={[styles.content, { paddingTop: SETTINGS_SCROLL_PT }]}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ABOUT</Text>
          <Text style={styles.body}>
            Link for Risk-Only insights. Your relatives won't see your health,
            and you won't see theirs. The app only uses anonymous family-history
            signals to personalize your screening reminders.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>LINK A RELATIVE</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Relative handle (or email hash)"
              placeholderTextColor="#888"
              value={relativeHandle}
              onChangeText={setRelativeHandle}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.degreePill}
              onPress={() => setDegree("parent")}
            >
              <Text
                style={[
                  styles.pillText,
                  degree === "parent" && styles.pillActive,
                ]}
              >
                Parent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.degreePill}
              onPress={() => setDegree("child")}
            >
              <Text
                style={[
                  styles.pillText,
                  degree === "child" && styles.pillActive,
                ]}
              >
                Child
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.degreePill}
              onPress={() => setDegree("sibling")}
            >
              <Text
                style={[
                  styles.pillText,
                  degree === "sibling" && styles.pillActive,
                ]}
              >
                Sibling
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.degreePill}
              onPress={() => setDegree("partner")}
            >
              <Text
                style={[
                  styles.pillText,
                  degree === "partner" && styles.pillActive,
                ]}
              >
                Partner
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Request Link</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: "#2C2C2E", marginTop: 10 },
            ]}
            onPress={() => {
              (navigation as any).navigate("FamilyLinkConsent");
            }}
          >
            <Text style={[styles.primaryButtonText, { color: "#fff" }]}>
              Consent & Broadcast
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>MY LINKS</Text>
          {isLoading ? (
            <ActivityIndicator color="#3AABF0" />
          ) : (
            <FlatList
              data={links}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.linkRow}>
                  <Ionicons
                    name="person"
                    color="#3AABF0"
                    size={18}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkText}>
                      {item.degree} • {item.direction} • {item.status}
                    </Text>
                    <Text style={styles.subText}>
                      hash: {item.relativeUidHash}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.subText}>No links yet.</Text>
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  card: {
    backgroundColor: "#181818",
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  body: { color: "#fff", fontSize: 14, lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  degreePill: {
    backgroundColor: "#222",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  pillText: { color: "#8E8E93", fontWeight: "600" },
  pillActive: { color: "#fff" },
  primaryButton: {
    backgroundColor: "#3AABF0",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  linkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  linkText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  subText: { color: "#8E8E93", fontSize: 12 },
});

export default FamilyLinkScreen;
