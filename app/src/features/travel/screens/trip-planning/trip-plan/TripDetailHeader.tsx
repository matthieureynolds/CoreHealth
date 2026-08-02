import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@shared/theme/colors";
import { s } from "./TripDetailScreen.styles";

interface Props {
  depCode: string;
  destCode: string;
  dateRange: string;
  tzLabel: string;
  sectionTab: "sleep" | "health";
  onSelectSection: (tab: "sleep" | "health") => void;
  onBack: () => void;
}

/**
 * Fixed header and the Sleep Plan / Travel Health tab bar.
 *
 * Purely presentational — it takes the two city codes, the formatted date
 * range and which tab is active. Extracted last, to bring TripDetailScreen's
 * body under the 400-line limit.
 */
const TripDetailHeader: React.FC<Props> = ({
  depCode,
  destCode,
  dateRange,
  tzLabel,
  sectionTab,
  onSelectSection,
  onBack,
}) => (
  <>
    {/* Fixed header */}
    <View style={s.headerRow}>
      <TouchableOpacity
        onPress={() => onBack()}
        style={s.backBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-back" size={28} color={palette.textPrimary} />
      </TouchableOpacity>
      <View style={s.heroRoute}>
        <Text style={s.heroCode}>{depCode}</Text>
        <Text style={s.heroArrow}>→</Text>
        <Text style={s.heroCode}>{destCode}</Text>
      </View>
      <View style={s.headerSpacer} />
    </View>

    <View style={s.heroMeta}>
      <Text style={s.heroDates}>{dateRange}</Text>
      <Text style={s.heroDir}>→ {tzLabel}</Text>
    </View>

    {/* Section tabs: Sleep Plan / Travel Health */}
    <View style={s.sectionTabsRow}>
      <TouchableOpacity
        style={[s.sectionTab, sectionTab === "sleep" && s.sectionTabActive]}
        onPress={() => onSelectSection("sleep")}
      >
        <Text
          style={[
            s.sectionTabText,
            sectionTab === "sleep" && s.sectionTabTextActive,
          ]}
        >
          Sleep Plan
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.sectionTab, sectionTab === "health" && s.sectionTabActive]}
        onPress={() => onSelectSection("health")}
      >
        <Text
          style={[
            s.sectionTabText,
            sectionTab === "health" && s.sectionTabTextActive,
          ]}
        >
          Travel Health
        </Text>
      </TouchableOpacity>
    </View>
  </>
);

export default TripDetailHeader;
