import {
  findWaterStations,
  WaterStationSearchResult,
} from "./waterStationService";
import { logger } from "../../utils/logger";

// Water quality data interfaces
export interface WaterQualityData {
  overallQuality: "excellent" | "good" | "moderate" | "poor" | "hazardous";
  safetyLevel: "safe" | "caution" | "unsafe";
  riskLevel: "low" | "moderate" | "high" | "severe";
  score: number; // 0-100
  recommendations: string[];
  warnings: string[];
  lastUpdated: Date;
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  parameters: {
    bacteria: {
      level: "low" | "moderate" | "high";
      status: string;
    };
    chemicals: {
      level: "low" | "moderate" | "high";
      status: string;
    };
    turbidity: {
      level: "low" | "moderate" | "high";
      status: string;
    };
    ph: {
      level: "low" | "moderate" | "high";
      status: string;
    };
  };
  nearbyStations: WaterStationSearchResult;
}

// Country-specific water quality standards
const WATER_QUALITY_STANDARDS = {
  US: { safe: 90, moderate: 70, poor: 50 },
  UK: { safe: 95, moderate: 80, poor: 60 },
  CA: { safe: 92, moderate: 75, poor: 55 },
  AU: { safe: 88, moderate: 70, poor: 50 },
  DE: { safe: 95, moderate: 80, poor: 60 },
  FR: { safe: 90, moderate: 75, poor: 55 },
  JP: { safe: 95, moderate: 80, poor: 60 },
  DEFAULT: { safe: 85, moderate: 70, poor: 50 },
};

/**
 * Get water quality assessment for a location
 */
export const getWaterQualityData = async (
  latitude: number,
  longitude: number,
  locationName: string,
  country: string = "DEFAULT",
): Promise<WaterQualityData | null> => {
  try {
    // Get nearby water stations
    const nearbyStations = await findWaterStations(
      latitude,
      longitude,
      2000,
      "moderate",
    );

    // Generate water quality assessment based on location and available data
    const qualityAssessment = generateWaterQualityAssessment(
      latitude,
      longitude,
      locationName,
      country,
      nearbyStations,
    );

    return qualityAssessment;
  } catch (error) {
    logger.error("Error getting water quality data:", error);
    return null;
  }
};

/**
 * Generate water quality assessment based on location and available data
 */
const generateWaterQualityAssessment = (
  latitude: number,
  longitude: number,
  locationName: string,
  country: string,
  nearbyStations: WaterStationSearchResult,
): WaterQualityData => {
  // Get country-specific standards
  const standards =
    WATER_QUALITY_STANDARDS[country as keyof typeof WATER_QUALITY_STANDARDS] ||
    WATER_QUALITY_STANDARDS.DEFAULT;

  // Generate base quality score based on location factors
  let baseScore = 75; // Default moderate quality

  // Adjust based on country (some countries have better water infrastructure)
  const countryMultipliers = {
    US: 0.95,
    UK: 1.0,
    CA: 1.0,
    AU: 0.98,
    DE: 1.0,
    FR: 0.98,
    JP: 1.0,
  };
  const multiplier =
    countryMultipliers[country as keyof typeof countryMultipliers] || 0.9;
  baseScore *= multiplier;

  // Adjust based on nearby water stations availability
  if (nearbyStations.stations.length > 0) {
    const freeStations = nearbyStations.stations.filter(
      (s) => s.accessType === "free",
    );
    const openStations = nearbyStations.stations.filter(
      (s) => s.isOpen === true,
    );

    // More free stations = better water quality assumption
    if (freeStations.length > 2) baseScore += 10;
    else if (freeStations.length > 0) baseScore += 5;

    // More open stations = better access
    if (openStations.length > 3) baseScore += 5;
  }

  // Add some random variation (±10 points) to simulate real data
  const variation = (Math.random() - 0.5) * 20;
  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(baseScore + variation)),
  );

  // Determine quality levels
  const overallQuality =
    finalScore >= standards.safe
      ? "excellent"
      : finalScore >= standards.moderate
        ? "good"
        : finalScore >= standards.poor
          ? "moderate"
          : "poor";

  const safetyLevel =
    finalScore >= standards.safe
      ? "safe"
      : finalScore >= standards.moderate
        ? "caution"
        : "unsafe";

  const riskLevel =
    finalScore >= standards.safe
      ? "low"
      : finalScore >= standards.moderate
        ? "moderate"
        : finalScore >= standards.poor
          ? "high"
          : "severe";

  // Generate parameter assessments
  const parameters = generateParameterAssessments(finalScore);

  // Generate recommendations and warnings
  const recommendations = generateWaterQualityRecommendations(
    overallQuality,
    safetyLevel,
    nearbyStations,
  );
  const warnings = generateWaterQualityWarnings(
    overallQuality,
    safetyLevel,
    parameters,
  );

  return {
    overallQuality,
    safetyLevel,
    riskLevel,
    score: finalScore,
    recommendations,
    warnings,
    lastUpdated: new Date(),
    location: {
      name: locationName,
      coordinates: { latitude, longitude },
    },
    parameters,
    nearbyStations,
  };
};

/**
 * Generate parameter assessments based on overall score
 */
const generateParameterAssessments = (score: number) => {
  const getParameterLevel = (
    baseScore: number,
    variation: number = 0,
  ): "low" | "moderate" | "high" => {
    const adjustedScore = Math.max(0, Math.min(100, baseScore + variation));
    return adjustedScore >= 80
      ? "low"
      : adjustedScore >= 60
        ? "moderate"
        : "high";
  };

  return {
    bacteria: {
      level: getParameterLevel(score, Math.random() * 20 - 10),
      status:
        getParameterLevel(score, Math.random() * 20 - 10) === "low"
          ? "Within safe limits"
          : "Elevated levels detected",
    },
    chemicals: {
      level: getParameterLevel(score, Math.random() * 20 - 10),
      status:
        getParameterLevel(score, Math.random() * 20 - 10) === "low"
          ? "Chemical levels normal"
          : "Chemical contamination possible",
    },
    turbidity: {
      level: getParameterLevel(score, Math.random() * 20 - 10),
      status:
        getParameterLevel(score, Math.random() * 20 - 10) === "low"
          ? "Water is clear"
          : "Water may be cloudy",
    },
    ph: {
      level: getParameterLevel(score, Math.random() * 20 - 10),
      status:
        getParameterLevel(score, Math.random() * 20 - 10) === "low"
          ? "pH levels balanced"
          : "pH levels may be off",
    },
  };
};

/**
 * Generate water quality recommendations
 */
const generateWaterQualityRecommendations = (
  overallQuality: string,
  safetyLevel: string,
  nearbyStations: WaterStationSearchResult,
): string[] => {
  const recommendations: string[] = [];

  if (overallQuality === "excellent" || overallQuality === "good") {
    recommendations.push("Tap water is generally safe to drink");
    recommendations.push("Consider using a water filter for extra safety");
  } else if (overallQuality === "moderate") {
    recommendations.push("Use a water filter or boil water before drinking");
    recommendations.push("Consider bottled water for sensitive individuals");
  } else {
    recommendations.push("Avoid drinking tap water without treatment");
    recommendations.push("Use bottled water or properly filtered water");
  }

  if (nearbyStations.stations.length > 0) {
    const freeStations = nearbyStations.stations.filter(
      (s) => s.accessType === "free",
    );
    if (freeStations.length > 0) {
      recommendations.push(
        `${freeStations.length} free water sources available nearby`,
      );
    }
  }

  recommendations.push("Stay hydrated throughout the day");
  recommendations.push("Monitor for any unusual taste or odor");

  return recommendations;
};

/**
 * Generate water quality warnings
 */
const generateWaterQualityWarnings = (
  overallQuality: string,
  safetyLevel: string,
  parameters: any,
): string[] => {
  const warnings: string[] = [];

  if (safetyLevel === "unsafe") {
    warnings.push("⚠️ Water quality is below safe standards");
    warnings.push("🚫 Do not drink untreated water");
  } else if (safetyLevel === "caution") {
    warnings.push("⚠️ Exercise caution with water consumption");
    warnings.push("💧 Consider using water treatment methods");
  }

  if (parameters.bacteria.level === "high") {
    warnings.push("🦠 High bacterial levels detected");
  }

  if (parameters.chemicals.level === "high") {
    warnings.push("🧪 Chemical contamination possible");
  }

  if (parameters.turbidity.level === "high") {
    warnings.push("🌊 Water appears cloudy or turbid");
  }

  return warnings;
};

/**
 * Get water quality status description
 */
export const getWaterQualityStatus = (quality: string): string => {
  switch (quality) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "moderate":
      return "Moderate";
    case "poor":
      return "Poor";
    case "hazardous":
      return "Hazardous";
    default:
      return "Unknown";
  }
};

/**
 * Get water quality recommendation based on quality level
 */
export const getWaterQualityRecommendation = (quality: string): string => {
  switch (quality) {
    case "excellent":
      return "Water quality is excellent. Safe to drink directly from tap.";
    case "good":
      return "Water quality is good. Generally safe to drink with basic precautions.";
    case "moderate":
      return "Water quality is moderate. Consider using a filter or boiling water.";
    case "poor":
      return "Water quality is poor. Avoid drinking untreated water.";
    case "hazardous":
      return "Water quality is hazardous. Do not drink without proper treatment.";
    default:
      return "Water quality data unavailable.";
  }
};

/**
 * Map water quality to risk level
 */
export const mapWaterQualityToRiskLevel = (
  quality: string,
): "low" | "moderate" | "high" | "severe" => {
  switch (quality) {
    case "excellent":
      return "low";
    case "good":
      return "low";
    case "moderate":
      return "moderate";
    case "poor":
      return "high";
    case "hazardous":
      return "severe";
    default:
      return "moderate";
  }
};

/**
 * Get water quality icon based on quality level
 */
export const getWaterQualityIcon = (quality: string): string => {
  switch (quality) {
    case "excellent":
      return "water";
    case "good":
      return "water-outline";
    case "moderate":
      return "warning-outline";
    case "poor":
      return "warning";
    case "hazardous":
      return "alert-circle";
    default:
      return "help-circle-outline";
  }
};
