import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const KIT_ITEMS = [
  {
    name: "Pain relievers (paracetamol / ibuprofen)",
    category: "Pain & Fever",
  },
  { name: "Antihistamines (loratadine / cetirizine)", category: "Allergy" },
  { name: "Oral rehydration salts", category: "Stomach" },
  { name: "Anti-diarrhea tablets (loperamide)", category: "Stomach" },
  { name: "Antacids / heartburn relief", category: "Stomach" },
  { name: "Motion sickness tablets", category: "Travel" },
  { name: "Sunscreen SPF 50+", category: "Sun Protection" },
  { name: "Insect repellent (DEET ≥ 30%)", category: "Insect Protection" },
  { name: "Antiseptic wipes and cream", category: "First Aid" },
  { name: "Adhesive bandages and plasters", category: "First Aid" },
  { name: "Hand sanitizer (≥ 60% alcohol)", category: "Hygiene" },
  { name: "Face masks", category: "Hygiene" },
];

const PRESCRIPTION_TIPS = [
  "Carry enough prescription medication for the entire trip plus extra",
  "Keep medications in original labelled containers",
  "Carry a letter from your doctor listing medications and dosages",
  "Store insulin and temperature-sensitive medications appropriately",
  "Research local regulations — some medications are controlled substances abroad",
];

const TravelMedicationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (name: string) =>
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  const packed = Object.values(checked).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">
          Travel Medications
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
      >
        <View style={styles.progressCard}>
          <Ionicons
            name="bag-outline"
            size={32}
            color="#FF9500"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.progressTitle}>Medical Kit Checklist</Text>
          <Text style={styles.progressCount}>
            {packed} / {KIT_ITEMS.length} items packed
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(packed / KIT_ITEMS.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECOMMENDED TRAVEL KIT</Text>
          {KIT_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.itemRow}
              onPress={() => toggle(item.name)}
            >
              <View
                style={[
                  styles.checkbox,
                  checked[item.name] && styles.checkboxDone,
                ]}
              >
                {checked[item.name] && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.itemName,
                    checked[item.name] && styles.itemNameDone,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRESCRIPTION MEDICATIONS</Text>
          {PRESCRIPTION_TIPS.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#FF9500"
              />
              <Text style={styles.tipText}>{t}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() =>
            Linking.openURL("https://wwwnc.cdc.gov/travel/page/pack-smart")
          }
        >
          <Ionicons name="open-outline" size={18} color="#3AABF0" />
          <Text style={styles.linkBtnText}>CDC — Pack Smart for Travel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: "#181818",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 20,
    top: 23.5,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    position: "absolute",
    left: 0,
    right: 0,
    paddingTop: 32.2,
    paddingBottom: 8,
  },
  progressCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    margin: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF950030",
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  progressCount: { fontSize: 14, color: "#8E8E93", marginBottom: 14 },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#2C2C2E",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#FF9500", borderRadius: 3 },
  section: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#555",
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: "#34C759", borderColor: "#34C759" },
  itemName: { fontSize: 14, color: "#fff", marginBottom: 2 },
  itemNameDone: { color: "#555", textDecorationLine: "line-through" },
  itemCategory: { fontSize: 12, color: "#8E8E93" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#E5E5EA",
    marginLeft: 10,
    lineHeight: 18,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3AABF030",
  },
  linkBtnText: {
    fontSize: 14,
    color: "#3AABF0",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default TravelMedicationsScreen;
