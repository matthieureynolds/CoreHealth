import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@shared/types";
import { palette } from "@shared/theme/colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type EnvironmentalMetricRoute = RouteProp<
  RootStackParamList,
  "EnvironmentalMetric"
>;
type Nav = StackNavigationProp<RootStackParamList, "EnvironmentalMetric">;

// ─────────────────── status helpers ───────────────────

const STATUS_COLORS: Record<string, string> = {
  excellent: palette.success,
  good: palette.success,
  moderate: palette.warningAlt,
  poor: palette.alert,
  hazardous: palette.danger,
};

const STATUS_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  moderate: "Moderate",
  poor: "Poor",
  hazardous: "Hazardous",
};

// ─────────────────── metric config ───────────────────

type MetricConfig = {
  whatItMeasures: string;
  segments: { label: string; color: string }[];
  divisor: number;
  getTakeaway: (status: string) => string;
  getMeaning: (status: string) => string;
  getRecommendations: (status: string) => string[];
  homeScore: number;
  getComparison: (status: string, homeStatus: string) => string;
};

const METRIC_CONFIGS: Record<string, MetricConfig> = {
  air_quality: {
    whatItMeasures:
      "The Air Quality Index (AQI) measures concentrations of pollutants including particulate matter (PM2.5, PM10), ozone, nitrogen dioxide, and sulfur dioxide. Values range from 0 to 300+.",
    segments: [
      { label: "Good", color: palette.success },
      { label: "Moderate", color: palette.warningAlt },
      { label: "Unhealthy\nSensitive", color: palette.alert },
      { label: "Unhealthy", color: palette.danger },
      { label: "Hazardous", color: palette.dangerDeep },
    ],
    divisor: 300,
    homeScore: 35,
    getTakeaway: (status: string) => {
      switch (status) {
        case "excellent":
          return "Nothing to worry about";
        case "good":
          return "You're all clear";
        case "moderate":
          return "Be mindful if you're sensitive";
        case "poor":
          return "Limit your time outdoors today";
        case "hazardous":
          return "Stay indoors if you can";
        default:
          return "Checking conditions";
      }
    },
    getMeaning: (status: string) => {
      switch (status) {
        case "excellent":
          return "The air is really clean right now. Perfect day to be outside — go for that run, open the windows, enjoy it.";
        case "good":
          return "The air is clean and safe for everyone, including kids and older adults. No need to think twice about being outside.";
        case "moderate":
          return "There are some pollutants in the air, but nothing most people will notice. If you have asthma or allergies though, maybe keep that outdoor workout shorter today.";
        case "poor":
          return "The air isn't great right now. Try to keep outdoor time short and avoid heavy exercise outside. If you need to head out, a well-ventilated space is your friend.";
        case "hazardous":
          return "The air is really bad right now. Best to stay inside with the windows shut. If you have an air purifier, now's the time to use it.";
        default:
          return "We're still checking the air quality here. Check back shortly.";
      }
    },
    getRecommendations: (status: string) => {
      switch (status) {
        case "excellent":
          return [
            "Perfect for a run or outdoor workout",
            "Open the windows and let fresh air in",
          ];
        case "good":
          return ["Go ahead with any outdoor plans", "No precautions needed"];
        case "moderate":
          return [
            "Keep intense outdoor workouts short",
            "Close windows during peak traffic hours",
            "Run an air purifier if you're sensitive",
          ];
        case "poor":
          return [
            "Skip the outdoor workout today",
            "Keep windows shut",
            "Grab an N95 if you need to go out",
          ];
        case "hazardous":
          return [
            "Stay inside — windows and doors shut",
            "Run your air purifier on high",
            "N95 mask is a must if you go outside",
          ];
        default:
          return ["Keep an eye on updates"];
      }
    },
    getComparison: (status: string, homeStatus: string) => {
      const here = STATUS_COLORS[status] ? status : "moderate";
      const ranks: Record<string, number> = {
        excellent: 5,
        good: 4,
        moderate: 3,
        poor: 2,
        hazardous: 1,
      };
      const diff = ranks[here] - ranks[homeStatus];
      if (diff >= 2) return "Much better than what you're used to at home";
      if (diff === 1) return "A bit better than your usual at home";
      if (diff === 0) return "About the same as home";
      if (diff === -1) return "A bit worse than your usual at home";
      return "Noticeably worse than what you're used to";
    },
  },
  pollen: {
    whatItMeasures:
      "Pollen count measures the concentration of pollen grains per cubic metre of air. Includes tree, grass, and weed pollen — each can trigger different allergic reactions.",
    segments: [
      { label: "Very Low", color: palette.success },
      { label: "Low", color: palette.success },
      { label: "Moderate", color: palette.warningAlt },
      { label: "High", color: palette.alert },
      { label: "Very High", color: palette.danger },
    ],
    divisor: 200,
    homeScore: 15,
    getTakeaway: (status: string) => {
      switch (status) {
        case "excellent":
          return "Allergy-free vibes today";
        case "good":
          return "You should be fine outside";
        case "moderate":
          return "Pop an antihistamine before heading out";
        case "poor":
          return "Tough day for allergy sufferers";
        case "hazardous":
          return "Stay inside if you can";
        default:
          return "Checking conditions";
      }
    },
    getMeaning: (status: string) => {
      switch (status) {
        case "excellent":
          return "Barely any pollen in the air. Even if you usually struggle with allergies, today should be a breeze — literally.";
        case "good":
          return "Pollen is low. You should be comfortable outside. If your allergies are normally quite bad, maybe keep antihistamines nearby just in case.";
        case "moderate":
          return "If you get hay fever, you'll probably feel it today. Take an antihistamine before you head out, and jump in the shower when you get back. Early mornings are when counts tend to peak.";
        case "poor":
          return "It's a rough one for anyone with allergies. Your best bet is to limit time outside, keep the windows closed, and make sure you've taken your medication.";
        case "hazardous":
          return "Pollen levels are really high. If you're at all sensitive, stay indoors with windows shut. Air purifiers will help if you have one running.";
        default:
          return "We're still getting pollen data for this area. Check back shortly.";
      }
    },
    getRecommendations: (status: string) => {
      switch (status) {
        case "excellent":
          return ["Great day to be outside", "Open the windows if you like"];
        case "good":
          return [
            "Enjoy the outdoors",
            "Quick shower after a long time outside doesn't hurt",
          ];
        case "moderate":
          return [
            "Antihistamine before you go out",
            "Avoid early mornings when pollen peaks",
            "Shower and change when you get home",
          ];
        case "poor":
          return [
            "Take your allergy meds",
            "Keep windows closed at home",
            "Sunglasses help keep pollen out of your eyes",
          ];
        case "hazardous":
          return [
            "Stay inside with windows shut",
            "Run an air purifier if you have one",
            "Talk to your doctor if symptoms are bad",
          ];
        default:
          return ["Keep an eye on the pollen forecast"];
      }
    },
    getComparison: (status: string, homeStatus: string) => {
      const ranks: Record<string, number> = {
        excellent: 5,
        good: 4,
        moderate: 3,
        poor: 2,
        hazardous: 1,
      };
      const diff = ranks[status] - ranks[homeStatus];
      if (diff >= 2) return "Much better than what you're used to at home";
      if (diff === 1) return "A bit better than your usual at home";
      if (diff === 0) return "About the same as home";
      if (diff === -1) return "A bit worse than your usual at home";
      return "Noticeably worse than what you're used to";
    },
  },
  water_quality: {
    whatItMeasures:
      "Water quality measures the safety of local water sources, testing for bacteria, chemical contaminants, heavy metals, and mineral content. Standards vary by country.",
    segments: [
      { label: "Poor", color: palette.danger },
      { label: "Marginal", color: palette.alert },
      { label: "Good", color: palette.warningAlt },
      { label: "Very Good", color: palette.success },
      { label: "Excellent", color: palette.success },
    ],
    divisor: 100,
    homeScore: 85,
    getTakeaway: (status: string) => {
      switch (status) {
        case "excellent":
          return "Drink straight from the tap";
        case "good":
          return "Tap water is safe here";
        case "moderate":
          return "Consider bottled or filtered water";
        case "poor":
          return "Don't drink the tap water";
        case "hazardous":
          return "Bottled water only";
        default:
          return "Checking water safety";
      }
    },
    getMeaning: (status: string) => {
      switch (status) {
        case "excellent":
          return "The water here is top quality — completely safe to drink from the tap, cook with, everything. No filter or bottles needed.";
        case "good":
          return "Tap water is safe to drink. You might notice it tastes a little different from home, but there's nothing to worry about health-wise.";
        case "moderate":
          return "The water is okay but not perfect. You might want to grab a filter or stick to bottled water for drinking, just for peace of mind.";
        case "poor":
          return "You'll want to skip the tap water here. Stick to bottled or filtered water for drinking and cooking. Watch out for ice at restaurants too — it's often made from tap.";
        case "hazardous":
          return "The tap water isn't safe. Use sealed bottled water for everything — drinking, cooking, even brushing your teeth. Skip the ice and be careful with raw foods washed in local water.";
        default:
          return "We're still checking the water quality here. Use bottled water to be safe.";
      }
    },
    getRecommendations: (status: string) => {
      switch (status) {
        case "excellent":
          return ["Drink from the tap freely", "No filter or bottles needed"];
        case "good":
          return [
            "Tap water is perfectly safe",
            "A filter can improve taste if you're fussy",
          ];
        case "moderate":
          return [
            "Use a filter or bottled water for drinking",
            "Tap is fine for showering and washing",
          ];
        case "poor":
          return [
            "Bottled or filtered water only",
            "Skip ice at restaurants",
            "Use bottled water for cooking too",
          ];
        case "hazardous":
          return [
            "Sealed bottled water for everything",
            "That includes brushing your teeth",
            "Avoid ice and raw washed produce",
          ];
        default:
          return ["Stick to bottled water for now"];
      }
    },
    getComparison: (status: string, homeStatus: string) => {
      const ranks: Record<string, number> = {
        excellent: 5,
        good: 4,
        moderate: 3,
        poor: 2,
        hazardous: 1,
      };
      const diff = ranks[status] - ranks[homeStatus];
      if (diff >= 2) return "Much better than what you're used to at home";
      if (diff === 1) return "A bit better than your usual at home";
      if (diff === 0) return "About the same as home";
      if (diff === -1) return "A bit worse than your usual at home";
      return "Noticeably worse than what you're used to";
    },
  },
  uv_index: {
    whatItMeasures:
      "The UV Index measures the strength of ultraviolet radiation from the sun that can cause sunburn and skin damage. Scale runs from 0 (minimal) to 11+ (extreme).",
    segments: [
      { label: "Low", color: palette.success },
      { label: "Moderate", color: palette.warningAlt },
      { label: "High", color: palette.alert },
      { label: "Very High", color: palette.danger },
      { label: "Extreme", color: palette.dangerDeep },
    ],
    divisor: 100,
    homeScore: 15,
    getTakeaway: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "No sun worries today";
        case "moderate":
          return "Sunscreen if you're out long";
        case "poor":
          return "Cover up and use SPF 50+";
        case "hazardous":
          return "Avoid direct sun";
        default:
          return "Checking UV levels";
      }
    },
    getMeaning: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "UV is really low — you don't need to worry about sunburn today. Sunglasses if it's bright, but that's about it.";
        case "moderate":
          return "The sun has some bite to it today. If you're going to be outside for more than half an hour, put on some SPF 30+ and wear sunglasses. Shade around midday is a good call.";
        case "poor":
          return "UV is high — you can burn in under 30 minutes without protection. Slap on SPF 50+, wear a hat, and try to avoid the midday sun between 10am and 4pm.";
        case "hazardous":
          return "The UV is extreme today. You'll burn quickly without protection. Stay out of direct sun during peak hours, cover up fully, and use SPF 50+ on any exposed skin.";
        default:
          return "We're still checking UV levels here.";
      }
    },
    getRecommendations: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return ["Sunscreen is optional today", "Sunglasses for comfort"];
        case "moderate":
          return [
            "SPF 30+ for extended time outside",
            "Hat and sunglasses are a good idea",
            "Find shade around midday",
          ];
        case "poor":
          return [
            "SPF 50+ is a must",
            "Hat, sunglasses, and long sleeves",
            "Stay out of direct sun 10am–4pm",
          ];
        case "hazardous":
          return [
            "Avoid being outside 10am–4pm",
            "SPF 50+ on all exposed skin",
            "Full coverage clothing and shade",
          ];
        default:
          return ["Use sun protection to be safe"];
      }
    },
    getComparison: (status: string, homeStatus: string) => {
      const ranks: Record<string, number> = {
        excellent: 5,
        good: 4,
        moderate: 3,
        poor: 2,
        hazardous: 1,
      };
      const diff = ranks[status] - ranks[homeStatus];
      if (diff >= 2) return "Much less intense than home";
      if (diff === 1) return "A bit milder than home";
      if (diff === 0) return "About the same as home";
      if (diff === -1) return "Stronger than you're used to";
      return "Much stronger than what you get at home";
    },
  },
  food_safety: {
    whatItMeasures:
      "Food safety risk reflects local hygiene standards, food preparation practices, and contamination risk. Based on WHO data and traveller health reports.",
    segments: [
      { label: "Poor", color: palette.danger },
      { label: "Moderate", color: palette.warningAlt },
      { label: "Good", color: palette.success },
    ],
    divisor: 100,
    homeScore: 80,
    getTakeaway: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "Eat freely, just wash your hands";
        case "moderate":
          return "Be choosy about where you eat";
        case "poor":
          return "Stick to cooked food from trusted places";
        default:
          return "Checking food safety";
      }
    },
    getMeaning: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "Food hygiene standards are solid here. Eat where you like — just the normal hand-washing before meals and you're good.";
        case "moderate":
          return "Food safety varies here. You'll be fine at reputable restaurants, but be a bit pickier — go for freshly cooked food, skip the raw salads, and avoid anything that's been sitting out.";
        case "poor":
          return "Food safety is a real concern here. Stick to well-cooked meals from reputable places, avoid street food and anything raw. Bottled water for drinking is a must.";
        default:
          return "We're still checking food safety conditions here.";
      }
    },
    getRecommendations: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return ["Eat normally", "Wash your hands before meals"];
        case "moderate":
          return [
            "Go for freshly cooked food",
            "Skip raw or undercooked meats",
            "Bottled water for brushing teeth",
          ];
        case "poor":
          return [
            "Avoid street food and raw produce",
            "Only drink sealed bottled water",
            "Pack some rehydration salts just in case",
          ];
        default:
          return ["Be careful with food and water"];
      }
    },
    getComparison: (status: string, homeStatus: string) => {
      const ranks: Record<string, number> = {
        excellent: 5,
        good: 4,
        moderate: 3,
        poor: 2,
        hazardous: 1,
      };
      const diff = ranks[status] - ranks[homeStatus];
      if (diff >= 2) return "Better standards than home";
      if (diff === 1) return "Slightly better than home";
      if (diff === 0) return "About the same as home";
      if (diff === -1) return "Not quite up to what you're used to";
      return "Much lower standards than home — be careful";
    },
  },
  altitude: {
    whatItMeasures:
      "Altitude affects oxygen availability. Above 2,500m your body needs time to acclimatise. Rapid ascent increases the risk of acute mountain sickness (AMS).",
    segments: [
      { label: "Low", color: palette.success },
      { label: "Moderate", color: palette.warningAlt },
      { label: "High", color: palette.alert },
      { label: "Extreme", color: palette.danger },
    ],
    divisor: 100,
    homeScore: 10,
    getTakeaway: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "No altitude concerns";
        case "moderate":
          return "Take it easy on day one";
        case "poor":
          return "Your body needs time to adjust";
        default:
          return "Checking altitude";
      }
    },
    getMeaning: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "The altitude here is low — your body won't notice any difference. Carry on as normal and stay hydrated.";
        case "moderate":
          return "You're at a moderate altitude, so you might feel a bit more breathless during exercise or notice your sleep is slightly off. Take it easy on your first day and drink plenty of water.";
        case "poor":
          return "This is high altitude — your body needs 1-2 days to adjust before you push yourself. Stay hydrated, skip the alcohol on arrival, and head down if you get a persistent headache or feel nauseous.";
        default:
          return "We're still assessing the altitude impact here.";
      }
    },
    getRecommendations: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return ["Stay hydrated as usual", "All activities are fine"];
        case "moderate":
          return [
            "Ease into exercise on day one",
            "Drink more water than usual",
            "Skip alcohol for the first day",
          ];
        case "poor":
          return [
            "Give yourself 1-2 days to acclimatise",
            "Don't rush the ascent",
            "Talk to your doctor about acetazolamide",
          ];
        default:
          return ["Take it easy until you know how you feel"];
      }
    },
    getComparison: (status: string, homeStatus: string) => {
      const ranks: Record<string, number> = {
        excellent: 5,
        good: 4,
        moderate: 3,
        poor: 2,
        hazardous: 1,
      };
      const diff = ranks[status] - ranks[homeStatus];
      if (diff >= 1) return "Lower than home — you'll feel great";
      if (diff === 0) return "About the same as home";
      if (diff === -1) return "Higher than you're used to";
      return "Much higher than home — take it slow";
    },
  },
  outbreaks: {
    whatItMeasures:
      "Outbreak risk summarises notable infectious disease activity from WHO, CDC, and local health authorities. Covers diseases like dengue, cholera, flu, and respiratory infections.",
    segments: [
      { label: "None", color: palette.success },
      { label: "Low", color: palette.success },
      { label: "Moderate", color: palette.warningAlt },
      { label: "High", color: palette.alert },
      { label: "Severe", color: palette.danger },
    ],
    divisor: 100,
    homeScore: 5,
    getTakeaway: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "No outbreaks to worry about";
        case "moderate":
          return "Some local outbreaks — stay aware";
        case "poor":
          return "Take extra precautions";
        default:
          return "Checking outbreak data";
      }
    },
    getMeaning: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return "No notable outbreaks here. Just keep your vaccinations current and wash your hands — the usual.";
        case "moderate":
          return "There are some localised outbreaks in this area. Nothing to panic about, but wash your hands more often, try to avoid packed indoor spaces, and wear a mask if local health authorities recommend it.";
        case "poor":
          return "There are widespread outbreaks here. Be strict with hygiene, wear a mask in crowded places, and keep a close eye on local health advisories. If you can postpone visiting affected areas, that's worth considering.";
        default:
          return "We're still gathering outbreak data for this area.";
      }
    },
    getRecommendations: (status: string) => {
      switch (status) {
        case "excellent":
        case "good":
          return ["Make sure your vaccinations are up to date"];
        case "moderate":
          return [
            "Wash your hands more often",
            "Avoid packed indoor spaces",
            "Mask up if local authorities advise it",
          ];
        case "poor":
          return [
            "Think about postponing non-essential visits",
            "Strict hand hygiene and masking",
            "Follow local health advisories closely",
          ];
        default:
          return ["Stay tuned for updates"];
      }
    },
    getComparison: (status: string, homeStatus: string) => {
      const ranks: Record<string, number> = {
        excellent: 5,
        good: 4,
        moderate: 3,
        poor: 2,
        hazardous: 1,
      };
      const diff = ranks[status] - ranks[homeStatus];
      if (diff >= 2) return "Much safer than home right now";
      if (diff === 1) return "A bit safer than home";
      if (diff === 0) return "About the same as home";
      if (diff === -1) return "A bit more risk than home";
      return "Significantly more outbreak activity than home";
    },
  },
};

// Derive the correct segment color from position on the bar
const getSegmentColor = (
  segments: { label: string; color: string }[],
  position: number,
): string => {
  const idx = Math.min(
    Math.floor(position * segments.length),
    segments.length - 1,
  );
  return segments[Math.max(0, idx)].color;
};

// Derive a status key from the position + segments
const deriveStatus = (
  segments: { label: string; color: string }[],
  position: number,
): string => {
  const color = getSegmentColor(segments, position);
  if (color === palette.success || color === palette.success) return "good";
  if (color === palette.warningAlt) return "moderate";
  if (color === palette.alert) return "poor";
  if (color === palette.danger || color === palette.dangerDeep)
    return "hazardous";
  return "moderate";
};

// ─────────────────── range bar ───────────────────

const RangeBar: React.FC<{
  segments: { label: string; color: string }[];
  position: number;
  comparisonText: string;
  comparisonColor: string;
}> = ({ segments, position, comparisonText, comparisonColor }) => {
  const clampedPos = Math.max(0.03, Math.min(0.97, position));
  const dotColor = getSegmentColor(segments, clampedPos);

  return (
    <View>
      {/* Bar */}
      <View
        style={{
          height: 10,
          flexDirection: "row",
          borderRadius: 5,
          overflow: "visible",
          position: "relative",
        }}
      >
        {segments.map((seg, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: seg.color,
              marginHorizontal: 0.5,
              ...(i === 0
                ? { borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }
                : {}),
              ...(i === segments.length - 1
                ? { borderTopRightRadius: 5, borderBottomRightRadius: 5 }
                : {}),
            }}
          />
        ))}
        <View
          style={{
            position: "absolute",
            top: -4,
            left: `${clampedPos * 100}%`,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: palette.textPrimary,
            borderWidth: 3,
            borderColor: dotColor,
            marginLeft: -9,
          }}
        />
      </View>

      {/* Segment labels */}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        {segments.map((seg, i) => (
          <Text
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              color: "#636366",
              fontWeight: "500",
              lineHeight: 13,
            }}
            numberOfLines={2}
          >
            {seg.label}
          </Text>
        ))}
      </View>

      {/* Comparison to home */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
          gap: 6,
        }}
      >
        <Ionicons name="home-outline" size={14} color={comparisonColor} />
        <Text
          style={{ color: comparisonColor, fontSize: 15, fontWeight: "600" }}
        >
          {comparisonText}
        </Text>
      </View>
    </View>
  );
};

// ─────────────────── main screen ───────────────────

const EnvironmentalMetricScreen: React.FC = () => {
  const route = useRoute<EnvironmentalMetricRoute>();
  const navigation = useNavigation<Nav>();
  const { metricId, label, score = 0, icon = "cloud-outline" } = route.params;
  const [showInfo, setShowInfo] = useState(false);

  const config = METRIC_CONFIGS[metricId] || METRIC_CONFIGS.air_quality;
  const position = Math.max(0, Math.min(1, score / config.divisor));

  // Derive the actual status from where the dot sits on the bar, not the passed-in status
  const derivedStatus = deriveStatus(config.segments, position);
  const actualStatus = derivedStatus;
  const statusColor = getSegmentColor(config.segments, position);
  const statusLabel = STATUS_LABELS[actualStatus] || actualStatus;

  const meaning = config.getMeaning(actualStatus);
  const recommendations = config.getRecommendations(actualStatus);

  const homePosition = Math.max(
    0,
    Math.min(1, config.homeScore / config.divisor),
  );
  const homeStatus = deriveStatus(config.segments, homePosition);
  const comparisonText = config.getComparison(actualStatus, homeStatus);
  const comparisonRanks: Record<string, number> = {
    excellent: 5,
    good: 4,
    moderate: 3,
    poor: 2,
    hazardous: 1,
  };
  const diff =
    (comparisonRanks[actualStatus] || 3) - (comparisonRanks[homeStatus] || 3);
  const comparisonColor =
    diff > 0
      ? palette.success
      : diff < 0
        ? palette.warningAlt
        : palette.textSecondary;

  const toggleInfo = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowInfo(!showInfo);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient hero */}
        <LinearGradient
          colors={[palette.bg, palette.bg]}
          locations={[0, 1]}
          style={{ paddingTop: 50, paddingBottom: 16 }}
        >
          {/* Nav row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ padding: 6 }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={palette.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleInfo}
              style={{ padding: 6 }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={
                  showInfo ? "information-circle" : "information-circle-outline"
                }
                size={22}
                color={showInfo ? palette.accent : "rgba(255,255,255,0.4)"}
              />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: `${statusColor}15`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name={icon as any} size={22} color={statusColor} />
            </View>
            <Text
              style={{
                color: palette.textPrimary,
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              {label}
            </Text>
            <Text
              style={{ color: statusColor, fontSize: 15, fontWeight: "600" }}
            >
              {statusLabel}
            </Text>
          </View>
        </LinearGradient>

        {/* Range bar */}
        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <Text
            style={{
              color: palette.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 16,
            }}
          >
            Current level
          </Text>
          <RangeBar
            segments={config.segments}
            position={position}
            comparisonText={comparisonText}
            comparisonColor={comparisonColor}
          />
        </View>

        {/* Divider */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: palette.surfaceElevated,
            marginHorizontal: 24,
            marginTop: 24,
          }}
        />

        {/* What this means for you */}
        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <Text
            style={{
              color: palette.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            What this means for you
          </Text>
          <Text style={{ color: "#A1A1A6", fontSize: 15, lineHeight: 24 }}>
            {meaning}
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: palette.surfaceElevated,
            marginHorizontal: 24,
            marginTop: 24,
          }}
        />

        {/* Recommendations */}
        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <Text
            style={{
              color: palette.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 14,
            }}
          >
            What to do
          </Text>
          {recommendations.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 12,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: statusColor,
                  marginTop: 7,
                  opacity: 0.6,
                }}
              />
              <Text
                style={{
                  color: "#A1A1A6",
                  fontSize: 15,
                  lineHeight: 22,
                  flex: 1,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Info (expandable) */}
        {showInfo && (
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <View
              style={{
                backgroundColor: palette.surface,
                borderRadius: 14,
                padding: 18,
              }}
            >
              <Text
                style={{
                  color: palette.textPrimary,
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                What this measures
              </Text>
              <Text style={{ color: "#A1A1A6", fontSize: 14, lineHeight: 22 }}>
                {config.whatItMeasures}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default EnvironmentalMetricScreen;
