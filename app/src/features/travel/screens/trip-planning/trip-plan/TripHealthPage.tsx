import React from "react";
import { View, Text, ScrollView } from "react-native";
import { s } from "./TripDetailScreen.styles";
import { VACCINATIONS, MEDICATIONS } from "./tripChecklists";

/**
 * The "Travel Health" page of the trip plan: vaccination and medication
 * checklists for the destination.
 *
 * Split out of TripDetailScreen, whose component body had grown past 870
 * lines. This page reads no state from the screen — it renders two static
 * lists — so it was the cleanest seam to cut first.
 */
const TripHealthPage: React.FC = () => (
  <ScrollView
    key="health"
    contentContainerStyle={{ paddingBottom: 90 + 24 }}
    showsVerticalScrollIndicator={false}
  >
    <Text style={s.healthSectionTitle}>Vaccinations</Text>
    <View style={s.healthList}>
      {VACCINATIONS.map((vax) => (
        <View key={vax.name} style={s.healthRow}>
          <View style={s.healthRowLeft}>
            <Text style={s.healthRowName}>{vax.name}</Text>
          </View>
          <View style={s.healthRowRight}>
            <Text style={[s.healthRowBadge, { color: vax.color }]}>
              {vax.severity}
            </Text>
          </View>
        </View>
      ))}
    </View>

    <Text style={s.healthSectionTitle}>Medications</Text>
    <View style={s.healthList}>
      {MEDICATIONS.map((med) => (
        <View key={med.name} style={s.healthRow}>
          <View style={s.healthRowLeft}>
            <Text style={s.healthRowName}>{med.name}</Text>
          </View>
          <View style={s.healthRowRight}>
            <Text style={s.healthRowNote}>{med.note}</Text>
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

export default TripHealthPage;
