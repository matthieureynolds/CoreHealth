import React from "react";
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
import { metricScreenStyles as s } from "./metricScreenStyles";
import type { MetricScreenConfig } from "./metricScreens.config";
import { palette } from "@shared/theme/colors";

/** Icon tints that are the same on every metric screen. */
const RECOMMENDATION_TINT = palette.link;
const RISK_TINT = palette.warning;

/**
 * One reference screen for every travel health metric (air quality, UV, pollen,
 * altitude, water, food, outbreaks). All seven were byte-for-byte copies apart
 * from their copy, icon and accent colour, so they now share this renderer and
 * differ only by the config passed in — see metricScreens.config.ts.
 */
const MetricDetailScreen: React.FC<{ config: MetricScreenConfig }> = ({
  config,
}) => {
  const navigation = useNavigation();
  const {
    headerTitle,
    icon,
    accent,
    heroTitle,
    heroDesc,
    scaleTitle,
    scale,
    impacts,
    recommendations,
    riskFactors,
    resources,
  } = config;

  return (
    <View style={s.container}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backButton}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color={palette.link} />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">
          {headerTitle}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
      >
        <View style={[styles.heroCard, { borderColor: `${accent}30` }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${accent}20` }]}>
            <Ionicons name={icon} size={36} color={accent} />
          </View>
          <Text style={s.heroTitle}>{heroTitle}</Text>
          <Text style={s.heroDesc}>{heroDesc}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>{scaleTitle}</Text>
          {scale.map((r) => (
            <View key={r.label} style={s.scaleRow}>
              <View style={[s.dot, { backgroundColor: r.color }]} />
              {r.note ? (
                // Stacked layout: the range (when present) reads inline with the label.
                <View style={{ flex: 1 }}>
                  <Text style={styles.scaleLabel}>
                    {r.range ? `${r.label} (${r.range})` : r.label}
                  </Text>
                  <Text style={styles.scaleNote}>{r.note}</Text>
                </View>
              ) : (
                // Single-line layout: range sits right-aligned opposite the label.
                <>
                  <Text style={[styles.scaleLabel, { flex: 1 }]}>
                    {r.label}
                  </Text>
                  <Text style={styles.scaleRange}>{r.range}</Text>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>HEALTH IMPACTS</Text>
          {impacts.map((i) => (
            <View key={i} style={s.row}>
              <Ionicons name="alert-circle-outline" size={16} color={accent} />
              <Text style={s.rowText}>{i}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>RECOMMENDATIONS</Text>
          {recommendations.map((r) => (
            <View key={r} style={s.row}>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={RECOMMENDATION_TINT}
              />
              <Text style={s.rowText}>{r}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>RISK FACTORS</Text>
          {riskFactors.map((r) => (
            <View key={r} style={s.row}>
              <Ionicons name="warning-outline" size={16} color={RISK_TINT} />
              <Text style={s.rowText}>{r}</Text>
            </View>
          ))}
        </View>

        {resources && resources.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>HEALTH AUTHORITY RESOURCES</Text>
            {resources.map((res) => (
              <TouchableOpacity
                key={res.url}
                style={styles.linkRow}
                onPress={() => Linking.openURL(res.url)}
              >
                <Ionicons name="open-outline" size={16} color={palette.link} />
                <Text style={styles.linkText}>{res.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    margin: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scaleLabel: { fontSize: 14, color: palette.textPrimary },
  scaleNote: { fontSize: 12, color: palette.textSecondary, marginTop: 1 },
  scaleRange: { fontSize: 13, color: palette.textSecondary },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  linkText: {
    fontSize: 14,
    color: palette.link,
    marginLeft: 10,
    fontWeight: "500",
  },
});

export default MetricDetailScreen;
