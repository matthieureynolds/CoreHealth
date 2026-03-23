export const pollenDescription =
  'Pollen count measures the concentration of pollen grains in the air. Different types of pollen (tree, grass, weed) can trigger allergic reactions.';

export const pollenNormalRange =
  '0-9 (Low) • 10-49 (Moderate) • 50-149 (High) • 150+ (Very High)';

export const pollenOptimalRange =
  '0-4 (Very Low) - Minimal allergy risk';

export const pollenRiskFactors = [
  'Seasonal allergies (hay fever)',
  'Asthma or respiratory conditions',
  'Outdoor activities during peak pollen times',
  'Living in areas with high vegetation',
  'Family history of allergies',
];

export const pollenRangeSegments = [
  { label: 'Very Low', color: '#30D158', range: '0-4' },
  { label: 'Low', color: '#32D74B', range: '5-9' },
  { label: 'Moderate', color: '#FF9F0A', range: '10-49', isBold: true },
  { label: 'High', color: '#FF6B35', range: '50-149' },
  { label: 'Very High', color: '#FF3B30', range: '150+' },
];

export const pollenScoreDivisor = 200;

export const getPollenExplanation = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'Pollen levels are very low. Minimal risk of allergic reactions for most people.';
    case 'good':
      return 'Pollen levels are low. Most people with mild allergies should be comfortable.';
    case 'moderate':
      return 'Pollen levels are moderate. People with allergies may experience symptoms.';
    case 'poor':
      return 'Pollen levels are high. Significant risk of allergic reactions for sensitive individuals.';
    case 'hazardous':
      return 'Pollen levels are very high. Severe allergic reactions possible for sensitive individuals.';
    default:
      return 'Pollen levels are being monitored.';
  }
};

export const getPollenHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'excellent':
      return ['No allergy symptoms expected', 'Safe for outdoor activities', 'Ideal for allergy sufferers'];
    case 'good':
      return ['Minimal allergy symptoms', 'Most people comfortable outdoors', 'Mild symptoms possible for very sensitive individuals'];
    case 'moderate':
      return ['Allergy symptoms likely for sensitive individuals', 'Sneezing, runny nose, itchy eyes possible', 'Consider allergy medications'];
    case 'poor':
      return ['Significant allergy symptoms expected', 'Severe reactions possible', 'Avoid outdoor activities if possible'];
    case 'hazardous':
      return ['Severe allergic reactions likely', 'Asthma attacks possible', 'Stay indoors with windows closed'];
    default:
      return ['Monitor for allergy symptoms'];
  }
};

export const getPollenRecommendations = (status: string): string[] => {
  switch (status) {
    case 'excellent':
      return ['Enjoy outdoor activities', 'Great time for gardening', 'Open windows for fresh air'];
    case 'good':
      return ['Outdoor activities generally safe', 'Take allergy medications if needed', 'Shower after outdoor activities'];
    case 'moderate':
      return ['Take allergy medications before going out', 'Avoid outdoor activities in early morning', 'Wear sunglasses and hat', 'Shower and change clothes after being outside'];
    case 'poor':
      return ['Take allergy medications', 'Limit outdoor activities', 'Keep windows closed', 'Use air purifiers with HEPA filters'];
    case 'hazardous':
      return ['Stay indoors with windows closed', 'Use air purifiers', 'Take allergy medications', 'Consider seeing an allergist'];
    default:
      return ['Monitor pollen forecasts', 'Take appropriate allergy precautions'];
  }
};
