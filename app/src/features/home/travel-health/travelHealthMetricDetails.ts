export interface MetricDetails {
  description: string;
  normalRange?: string;
  optimalRange?: string;
  whatItMeans: string;
  healthImpacts: string[];
  recommendations: string[];
  riskFactors?: string[];
}

const getAirQualityExplanation = (status: string): string => {
  switch (status) {
    case 'excellent': return 'Air quality is excellent with minimal pollutants. Perfect for outdoor activities and exercise.';
    case 'good': return 'Air quality is good with low levels of pollutants. Safe for most people, including sensitive groups.';
    case 'moderate': return 'Air quality is moderate with some pollutants present. Sensitive individuals may experience minor irritation.';
    case 'poor': return 'Air quality is poor with elevated pollutant levels. Sensitive groups should limit outdoor activities.';
    case 'hazardous': return 'Air quality is hazardous with very high pollutant levels. Everyone should avoid outdoor activities.';
    default: return 'Air quality status is being monitored.';
  }
};

const getAirQualityHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'excellent': return ['No health impacts expected', 'Ideal for outdoor exercise', 'Safe for all age groups'];
    case 'good': return ['Minimal health impacts', 'Safe for most activities', 'Sensitive individuals may notice slight irritation'];
    case 'moderate': return ['Possible irritation for sensitive individuals', 'Consider reducing outdoor exercise', 'Monitor for respiratory symptoms'];
    case 'poor': return ['Increased risk of respiratory irritation', 'Avoid outdoor exercise', 'Sensitive groups should stay indoors'];
    case 'hazardous': return ['Serious health risks for everyone', 'Avoid all outdoor activities', 'Use air purifiers indoors'];
    default: return ['Monitor for any respiratory symptoms'];
  }
};

const getAirQualityRecommendations = (status: string): string[] => {
  switch (status) {
    case 'excellent': return ['Enjoy outdoor activities', 'Great time for exercise', 'Open windows for fresh air'];
    case 'good': return ['Outdoor activities are generally safe', 'Monitor sensitive individuals', 'Consider air purifiers if needed'];
    case 'moderate': return ['Limit outdoor exercise', 'Close windows during peak hours', 'Use air purifiers', 'Wear masks if sensitive'];
    case 'poor': return ['Avoid outdoor activities', 'Keep windows closed', 'Use air purifiers', 'Wear N95 masks if going outside'];
    case 'hazardous': return ['Stay indoors with windows closed', 'Use high-efficiency air purifiers', 'Wear N95 masks if necessary', 'Postpone outdoor plans'];
    default: return ['Monitor air quality updates', 'Take appropriate precautions'];
  }
};

const getPollenExplanation = (status: string): string => {
  switch (status) {
    case 'excellent': return 'Pollen levels are very low. Minimal risk of allergic reactions for most people.';
    case 'good': return 'Pollen levels are low. Most people with mild allergies should be comfortable.';
    case 'moderate': return 'Pollen levels are moderate. People with allergies may experience symptoms.';
    case 'poor': return 'Pollen levels are high. Significant risk of allergic reactions for sensitive individuals.';
    case 'hazardous': return 'Pollen levels are very high. Severe allergic reactions possible for sensitive individuals.';
    default: return 'Pollen levels are being monitored.';
  }
};

const getPollenHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'excellent': return ['No allergy symptoms expected', 'Safe for outdoor activities', 'Ideal for allergy sufferers'];
    case 'good': return ['Minimal allergy symptoms', 'Most people comfortable outdoors', 'Mild symptoms possible for very sensitive individuals'];
    case 'moderate': return ['Allergy symptoms likely for sensitive individuals', 'Sneezing, runny nose, itchy eyes possible', 'Consider allergy medications'];
    case 'poor': return ['Significant allergy symptoms expected', 'Severe reactions possible', 'Avoid outdoor activities if possible'];
    case 'hazardous': return ['Severe allergic reactions likely', 'Asthma attacks possible', 'Stay indoors with windows closed'];
    default: return ['Monitor for allergy symptoms'];
  }
};

const getPollenRecommendations = (status: string): string[] => {
  switch (status) {
    case 'excellent': return ['Enjoy outdoor activities', 'Great time for gardening', 'Open windows for fresh air'];
    case 'good': return ['Outdoor activities generally safe', 'Take allergy medications if needed', 'Shower after outdoor activities'];
    case 'moderate': return ['Take allergy medications before going out', 'Avoid outdoor activities in early morning', 'Wear sunglasses and hat', 'Shower and change clothes after being outside'];
    case 'poor': return ['Take allergy medications', 'Limit outdoor activities', 'Keep windows closed', 'Use air purifiers with HEPA filters'];
    case 'hazardous': return ['Stay indoors with windows closed', 'Use air purifiers', 'Take allergy medications', 'Consider seeing an allergist'];
    default: return ['Monitor pollen forecasts', 'Take appropriate allergy precautions'];
  }
};

const getWaterQualityExplanation = (status: string): string => {
  switch (status) {
    case 'excellent': return 'Water is completely safe to drink with no harmful contaminants. Contains beneficial minerals and meets all health standards.';
    case 'good': return 'Water is safe to drink with minimal contaminants well below harmful levels. Meets health standards and suitable for all daily uses.';
    case 'moderate': return 'Water is generally safe but may have taste, odor, or minor quality issues. Contaminants are present but below dangerous levels.';
    case 'poor': return 'Water has elevated contaminant levels that may pose health risks. Not recommended for drinking without treatment.';
    case 'hazardous': return 'Water is unsafe to drink with high contaminant levels that pose serious health risks. Do not consume tap water.';
    default: return 'Water quality is being monitored for safety.';
  }
};

const getWaterQualityHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'excellent': return ['No health risks', 'Provides beneficial minerals', 'Supports optimal hydration'];
    case 'good': return ['Minimal health risks', 'Safe for daily consumption', 'Good for hydration'];
    case 'moderate': return ['Possible gastrointestinal issues', 'May affect taste and odor', 'Consider filtration for sensitive individuals'];
    case 'poor': return ['Increased risk of gastrointestinal illness', 'May cause nausea or diarrhea', 'Avoid drinking untreated water'];
    case 'hazardous': return ['High risk of serious illness', 'Potential for severe gastrointestinal problems', 'Do not drink tap water'];
    default: return ['Monitor for any digestive symptoms'];
  }
};

const getWaterQualityRecommendations = (status: string): string[] => {
  switch (status) {
    case 'excellent': return ['Drink tap water freely', 'Great for cooking and hydration', 'No additional treatment needed'];
    case 'good': return ['Tap water is safe to drink', 'Good for daily use', 'Consider filtration for taste preferences'];
    case 'moderate': return ['Use water filters for drinking', 'Boil water for cooking', 'Consider bottled water for sensitive individuals'];
    case 'poor': return ['Use high-quality water filters', 'Drink bottled or filtered water', 'Avoid ice made from tap water'];
    case 'hazardous': return ['Use only bottled or filtered water', 'Avoid tap water completely', 'Use bottled water for cooking and brushing teeth'];
    default: return ['Check local water quality reports', 'Use appropriate water treatment methods'];
  }
};

export function getMetricDetails(metricId: string, status: string): MetricDetails {
  const details: Record<string, MetricDetails> = {
    air_quality: {
      description: 'Air Quality Index (AQI) measures the concentration of pollutants in the air, including particulate matter, ozone, nitrogen dioxide, and sulfur dioxide.',
      normalRange: '0-50 (Good) • 51-100 (Moderate) • 101-150 (Unhealthy for Sensitive) • 151-200 (Unhealthy) • 201+ (Hazardous)',
      optimalRange: '0-25 (Excellent) - Perfect for outdoor activities',
      whatItMeans: getAirQualityExplanation(status),
      healthImpacts: getAirQualityHealthImpacts(status),
      recommendations: getAirQualityRecommendations(status),
      riskFactors: [
        'Outdoor exercise during high pollution',
        'Living near busy roads or industrial areas',
        'Pre-existing respiratory conditions',
        'Age (children and elderly more vulnerable)',
        'Smoking or secondhand smoke exposure',
      ],
    },
    pollen: {
      description: 'Pollen count measures the concentration of pollen grains in the air. Different types of pollen (tree, grass, weed) can trigger allergic reactions.',
      normalRange: '0-9 (Low) • 10-49 (Moderate) • 50-149 (High) • 150+ (Very High)',
      optimalRange: '0-4 (Very Low) - Minimal allergy risk',
      whatItMeans: getPollenExplanation(status),
      healthImpacts: getPollenHealthImpacts(status),
      recommendations: getPollenRecommendations(status),
      riskFactors: [
        'Seasonal allergies (hay fever)',
        'Asthma or respiratory conditions',
        'Outdoor activities during peak pollen times',
        'Living in areas with high vegetation',
        'Family history of allergies',
      ],
    },
    water_quality: {
      description: 'Water quality measures the safety and cleanliness of local water sources, including chemical contaminants, bacteria, and mineral content.',
      normalRange: 'Safe for consumption • Meets health standards • May have taste/odor issues',
      optimalRange: 'Excellent quality with beneficial minerals - Perfect for all uses',
      whatItMeans: getWaterQualityExplanation(status),
      healthImpacts: getWaterQualityHealthImpacts(status),
      recommendations: getWaterQualityRecommendations(status),
      riskFactors: [
        'Drinking untreated water',
        'Traveling to areas with poor sanitation',
        'Compromised immune system',
        'Pregnancy or young children',
        'Local water treatment issues',
      ],
    },
  };

  return details[metricId] ?? {
    description: 'This metric provides important information about your travel environment.',
    whatItMeans: 'Monitor this metric for potential health impacts.',
    healthImpacts: [],
    recommendations: ['Stay informed about local conditions', 'Take appropriate precautions'],
  };
}
