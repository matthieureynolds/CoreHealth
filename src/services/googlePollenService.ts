import { API_CONFIG } from '../config/api';

// Google Pollen API response interfaces
export interface GooglePollenData {
  regionCode: string;
  pollen: {
    tree: {
      indexValue: number;
      indexDescription: string;
      category: string;
      color: {
        red: number;
        green: number;
        blue: number;
      };
    };
    grass: {
      indexValue: number;
      indexDescription: string;
      category: string;
      color: {
        red: number;
        green: number;
        blue: number;
      };
    };
    weed: {
      indexValue: number;
      indexDescription: string;
      category: string;
      color: {
        red: number;
        green: number;
        blue: number;
      };
    };
  };
  plantInfo: Array<{
    code: string;
    displayName: string;
    inSeason: boolean;
    indexValue: number;
    indexDescription: string;
    plantDescription: {
      family: string;
      season: string;
      specialColors: string;
      specialShapes: string;
      crossReaction: string;
    };
  }>;
  dailyInfo: Array<{
    date: {
      year: number;
      month: number;
      day: number;
    };
    pollenTypeInfo: Array<{
      code: string;
      displayName: string;
      inSeason: boolean;
      indexValue: number;
      indexDescription: string;
      healthRecommendations: string[];
    }>;
  }>;
}

export interface GooglePollenResponse {
  regionCode: string;
  pollen: {
    tree: {
      indexValue: number;
      indexDescription: string;
      category: string;
      color: {
        red: number;
        green: number;
        blue: number;
      };
    };
    grass: {
      indexValue: number;
      indexDescription: string;
      category: string;
      color: {
        red: number;
        green: number;
        blue: number;
      };
    };
    weed: {
      indexValue: number;
      indexDescription: string;
      category: string;
      color: {
        red: number;
        green: number;
        blue: number;
      };
    };
  };
  plantInfo: Array<{
    code: string;
    displayName: string;
    inSeason: boolean;
    indexValue: number;
    indexDescription: string;
    plantDescription: {
      family: string;
      season: string;
      specialColors: string;
      specialShapes: string;
      crossReaction: string;
    };
  }>;
  dailyInfo: Array<{
    date: {
      year: number;
      month: number;
      day: number;
    };
    pollenTypeInfo: Array<{
      code: string;
      displayName: string;
      inSeason: boolean;
      indexValue: number;
      indexDescription: string;
      healthRecommendations: string[];
    }>;
  }>;
}

/**
 * Get current pollen data from Google Pollen API
 */
export const getGooglePollenData = async (
  latitude: number,
  longitude: number
): Promise<GooglePollenData | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, cannot get pollen data');
      return null;
    }

    const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
    
    const requestBody = {
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      days: 1,
      languageCode: "en"
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Pollen API error: ${response.status}`);
    }

    const data: GooglePollenResponse = await response.json();
    
    return {
      regionCode: data.regionCode,
      pollen: data.pollen,
      plantInfo: data.plantInfo || [],
      dailyInfo: data.dailyInfo || [],
    };
  } catch (error) {
    console.error('Error fetching Google pollen data:', error);
    return null;
  }
};

/**
 * Get overall pollen risk level
 */
export const getOverallPollenRiskLevel = (pollenData: GooglePollenData): 'low' | 'moderate' | 'high' | 'severe' => {
  const { tree, grass, weed } = pollenData.pollen;
  const maxIndex = Math.max(tree.indexValue, grass.indexValue, weed.indexValue);
  
  if (maxIndex <= 1) return 'low';
  if (maxIndex <= 2) return 'moderate';
  if (maxIndex <= 3) return 'high';
  return 'severe';
};

/**
 * Get pollen status description
 */
export const getPollenStatus = (pollenData: GooglePollenData): string => {
  const { tree, grass, weed } = pollenData.pollen;
  const maxIndex = Math.max(tree.indexValue, grass.indexValue, weed.indexValue);
  
  if (maxIndex <= 1) return 'Low';
  if (maxIndex <= 2) return 'Moderate';
  if (maxIndex <= 3) return 'High';
  return 'Very High';
};

/**
 * Get pollen recommendations
 */
export const getPollenRecommendations = (pollenData: GooglePollenData): string => {
  const { tree, grass, weed } = pollenData.pollen;
  const maxIndex = Math.max(tree.indexValue, grass.indexValue, weed.indexValue);
  
  if (maxIndex <= 1) {
    return 'Pollen levels are low. Great time to enjoy outdoor activities!';
  }
  
  if (maxIndex <= 2) {
    return 'Moderate pollen levels. Sensitive individuals may experience mild symptoms.';
  }
  
  if (maxIndex <= 3) {
    return 'High pollen levels. Keep windows closed and limit outdoor activities.';
  }
  
  return 'Very high pollen levels. Stay indoors, use air purifiers, and take allergy medication if needed.';
};

/**
 * Get detailed pollen breakdown
 */
export const getPollenBreakdown = (pollenData: GooglePollenData): string => {
  const { tree, grass, weed } = pollenData.pollen;
  
  const breakdown = [
    `Tree: ${tree.indexDescription}`,
    `Grass: ${grass.indexDescription}`,
    `Weed: ${weed.indexDescription}`
  ];
  
  return breakdown.join(', ');
};

/**
 * Get active allergens
 */
export const getActiveAllergens = (pollenData: GooglePollenData): string[] => {
  return pollenData.plantInfo
    .filter(plant => plant.inSeason && plant.indexValue > 0)
    .map(plant => plant.displayName);
};

/**
 * Get pollen health recommendations
 */
export const getPollenHealthRecommendations = (pollenData: GooglePollenData): string[] => {
  const recommendations = [];
  const { tree, grass, weed } = pollenData.pollen;
  const maxIndex = Math.max(tree.indexValue, grass.indexValue, weed.indexValue);
  
  if (maxIndex > 1) {
    recommendations.push('Keep windows closed during high pollen times');
    recommendations.push('Consider wearing sunglasses to protect eyes');
  }
  
  if (maxIndex > 2) {
    recommendations.push('Limit outdoor activities during peak pollen hours (5-10 AM)');
    recommendations.push('Shower after spending time outdoors');
    recommendations.push('Use air purifiers indoors');
  }
  
  if (maxIndex > 3) {
    recommendations.push('Stay indoors as much as possible');
    recommendations.push('Take allergy medication as prescribed');
    recommendations.push('Consider wearing a mask when outdoors');
  }
  
  return recommendations;
}; 