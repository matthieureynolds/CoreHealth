/**
 * UV Index Service - Static Data Implementation
 * Provides UV Index estimates based on location, time, and season
 */

export interface UVIndexData {
  uvIndex: number;
  category: string;
  description: string;
  recommendation: string;
  timestamp: string;
}

export interface UVIndexRequest {
  latitude: number;
  longitude: number;
  date?: string; // Optional date, defaults to current date
}

/**
 * UV Index categories and recommendations
 */
const UV_CATEGORIES = {
  0: {
    category: "Low",
    description: "Minimal sun protection required",
  },
  1: {
    category: "Low",
    description: "Minimal sun protection required",
  },
  2: {
    category: "Low",
    description: "Minimal sun protection required",
  },
  3: {
    category: "Moderate",
    description: "Some sun protection required",
  },
  4: {
    category: "Moderate",
    description: "Some sun protection required",
  },
  5: {
    category: "Moderate",
    description: "Some sun protection required",
  },
  6: {
    category: "High",
    description: "Sun protection essential",
  },
  7: {
    category: "High",
    description: "Sun protection essential",
  },
  8: {
    category: "Very High",
    description: "Extra sun protection required",
  },
  9: {
    category: "Very High",
    description: "Extra sun protection required",
  },
  10: {
    category: "Very High",
    description: "Extra sun protection required",
  },
  11: {
    category: "Extreme",
    description: "Avoid sun exposure",
  },
  12: {
    category: "Extreme",
    description: "Avoid sun exposure",
  },
  13: {
    category: "Extreme",
    description: "Avoid sun exposure",
  },
  14: {
    category: "Extreme",
    description: "Avoid sun exposure",
  },
  15: {
    category: "Extreme",
    description: "Avoid sun exposure",
  },
};

/**
 * Get UV Index recommendations based on category
 */
function getUVRecommendation(category: string, _uvIndex: number): string {
  const recommendations = {
    Low: [
      "You can safely enjoy being outside!",
      "Wear sunglasses on bright days.",
      "If you burn easily, cover up and use sunscreen.",
    ],
    Moderate: [
      "Seek shade during midday hours.",
      "Wear protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.",
      "Generously apply broad spectrum SPF 30+ sunscreen every 2 hours.",
      "Watch out for bright surfaces like sand, water and snow which reflect UV rays.",
    ],
    High: [
      "Seek shade during midday hours.",
      "Wear protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.",
      "Generously apply broad spectrum SPF 30+ sunscreen every 2 hours.",
      "Watch out for bright surfaces like sand, water and snow which reflect UV rays.",
      "Avoid being outside during midday hours.",
    ],
    "Very High": [
      "Avoid being outside during midday hours.",
      "Seek shade and wear protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.",
      "Generously apply broad spectrum SPF 30+ sunscreen every 2 hours.",
      "Watch out for bright surfaces like sand, water and snow which reflect UV rays.",
      "If you must be outside, seek shade and wear protective clothing.",
    ],
    Extreme: [
      "Avoid being outside during midday hours.",
      "If you must be outside, seek shade and wear protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.",
      "Generously apply broad spectrum SPF 30+ sunscreen every 2 hours.",
      "Watch out for bright surfaces like sand, water and snow which reflect UV rays.",
      "Consider staying indoors during peak UV hours.",
    ],
  };

  const categoryRecs =
    recommendations[category as keyof typeof recommendations] ||
    recommendations["Low"];
  return categoryRecs[Math.floor(Math.random() * categoryRecs.length)];
}

/**
 * Calculate UV Index based on location, time, and season
 */
function calculateUVIndex(
  latitude: number,
  longitude: number,
  date: Date,
): number {
  const month = date.getMonth() + 1; // 1-12
  const hour = date.getHours(); // 0-23

  // Base UV Index by latitude (higher latitude = lower UV)
  let baseUV = 0;
  if (Math.abs(latitude) <= 10) {
    baseUV = 12; // Equatorial regions
  } else if (Math.abs(latitude) <= 20) {
    baseUV = 10; // Tropical regions
  } else if (Math.abs(latitude) <= 30) {
    baseUV = 8; // Subtropical regions
  } else if (Math.abs(latitude) <= 40) {
    baseUV = 6; // Temperate regions
  } else if (Math.abs(latitude) <= 50) {
    baseUV = 4; // Cool temperate regions
  } else if (Math.abs(latitude) <= 60) {
    baseUV = 2; // Subarctic regions
  } else {
    baseUV = 1; // Arctic regions
  }

  // Seasonal adjustment (Northern Hemisphere)
  let seasonalMultiplier = 1;
  if (latitude >= 0) {
    // Northern Hemisphere
    if (month >= 3 && month <= 8) {
      seasonalMultiplier = 1.2; // Summer months
    } else if (month === 2 || month === 9) {
      seasonalMultiplier = 0.8; // Spring/Fall
    } else {
      seasonalMultiplier = 0.4; // Winter months
    }
  } else {
    // Southern Hemisphere (opposite seasons)
    if (month >= 9 || month <= 2) {
      seasonalMultiplier = 1.2; // Summer months
    } else if (month === 3 || month === 8) {
      seasonalMultiplier = 0.8; // Spring/Fall
    } else {
      seasonalMultiplier = 0.4; // Winter months
    }
  }

  // Time of day adjustment (peak at noon)
  let timeMultiplier = 1;
  if (hour >= 6 && hour <= 18) {
    // Daylight hours
    const noon = 12;
    const hoursFromNoon = Math.abs(hour - noon);
    timeMultiplier = Math.max(0.1, 1 - hoursFromNoon * 0.15);
  } else {
    timeMultiplier = 0.1; // Night time
  }

  // Calculate final UV Index
  const uvIndex = Math.round(baseUV * seasonalMultiplier * timeMultiplier);

  // Add some randomness for realism (±1)
  const randomVariation = (Math.random() - 0.5) * 2;
  return Math.max(0, Math.min(15, Math.round(uvIndex + randomVariation)));
}

/**
 * Get UV Index data for a specific location and time
 */
export function getUVIndexData(request: UVIndexRequest): UVIndexData {
  const date = request.date ? new Date(request.date) : new Date();
  const uvIndex = calculateUVIndex(request.latitude, request.longitude, date);

  const categoryData =
    UV_CATEGORIES[uvIndex as keyof typeof UV_CATEGORIES] || UV_CATEGORIES[0];
  const recommendation = getUVRecommendation(categoryData.category, uvIndex);

  return {
    uvIndex,
    category: categoryData.category,
    description: categoryData.description,
    recommendation,
    timestamp: date.toISOString(),
  };
}

/**
 * Get UV Index forecast for multiple days
 */
export function getUVIndexForecast(
  latitude: number,
  longitude: number,
  days: number = 5,
): UVIndexData[] {
  const forecast: UVIndexData[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Use noon time for forecast
    date.setHours(12, 0, 0, 0);

    const uvData = getUVIndexData({
      latitude,
      longitude,
      date: date.toISOString(),
    });

    forecast.push(uvData);
  }

  return forecast;
}

/**
 * Get current UV Index (real-time estimate)
 */
export function getCurrentUVIndex(
  latitude: number,
  longitude: number,
): UVIndexData {
  return getUVIndexData({ latitude, longitude });
}

/**
 * Check if UV protection is recommended
 */
export function isUVProtectionRecommended(uvIndex: number): boolean {
  return uvIndex >= 3;
}

/**
 * Get UV protection level recommendation
 */
export function getUVProtectionLevel(
  uvIndex: number,
): "minimal" | "moderate" | "high" | "extreme" {
  if (uvIndex <= 2) return "minimal";
  if (uvIndex <= 5) return "moderate";
  if (uvIndex <= 10) return "high";
  return "extreme";
}
