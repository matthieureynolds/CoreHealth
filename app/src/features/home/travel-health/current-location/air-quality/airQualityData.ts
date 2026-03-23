export const airQualityDescription =
  'Air Quality Index (AQI) measures the concentration of pollutants in the air, including particulate matter, ozone, nitrogen dioxide, and sulfur dioxide.';

export const airQualityNormalRange =
  '0-50 (Good) • 51-100 (Moderate) • 101-150 (Unhealthy for Sensitive) • 151-200 (Unhealthy) • 201+ (Hazardous)';

export const airQualityOptimalRange =
  '0-25 (Excellent) - Perfect for outdoor activities';

export const airQualityRiskFactors = [
  'Outdoor exercise during high pollution',
  'Living near busy roads or industrial areas',
  'Pre-existing respiratory conditions',
  'Age (children and elderly more vulnerable)',
  'Smoking or secondhand smoke exposure',
];

export const airQualityRangeSegments = [
  { label: 'Good', color: '#30D158', range: '0-50' },
  { label: 'Moderate', color: '#FF9F0A', range: '51-100', isBold: true },
  { label: 'Unhealthy for Sensitive', color: '#FF6B35', range: '101-150' },
  { label: 'Unhealthy', color: '#FF3B30', range: '151-200' },
  { label: 'Hazardous', color: '#8B0000', range: '201+' },
];

export const airQualityScoreDivisor = 300;

export const getAirQualityExplanation = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'Air quality is excellent with minimal pollutants. Perfect for outdoor activities and exercise.';
    case 'good':
      return 'Air quality is good with low levels of pollutants. Safe for most people, including sensitive groups.';
    case 'moderate':
      return 'Air quality is moderate with some pollutants present. Sensitive individuals may experience minor irritation.';
    case 'poor':
      return 'Air quality is poor with elevated pollutant levels. Sensitive groups should limit outdoor activities.';
    case 'hazardous':
      return 'Air quality is hazardous with very high pollutant levels. Everyone should avoid outdoor activities.';
    default:
      return 'Air quality status is being monitored.';
  }
};

export const getAirQualityHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'excellent':
      return ['No health impacts expected', 'Ideal for outdoor exercise', 'Safe for all age groups'];
    case 'good':
      return ['Minimal health impacts', 'Safe for most activities', 'Sensitive individuals may notice slight irritation'];
    case 'moderate':
      return ['Possible irritation for sensitive individuals', 'Consider reducing outdoor exercise', 'Monitor for respiratory symptoms'];
    case 'poor':
      return ['Increased risk of respiratory irritation', 'Avoid outdoor exercise', 'Sensitive groups should stay indoors'];
    case 'hazardous':
      return ['Serious health risks for everyone', 'Avoid all outdoor activities', 'Use air purifiers indoors'];
    default:
      return ['Monitor for any respiratory symptoms'];
  }
};

export const getAirQualityRecommendations = (status: string): string[] => {
  switch (status) {
    case 'excellent':
      return ['Enjoy outdoor activities', 'Great time for exercise', 'Open windows for fresh air'];
    case 'good':
      return ['Outdoor activities are generally safe', 'Monitor sensitive individuals', 'Consider air purifiers if needed'];
    case 'moderate':
      return ['Limit outdoor exercise', 'Close windows during peak hours', 'Use air purifiers', 'Wear masks if sensitive'];
    case 'poor':
      return ['Avoid outdoor activities', 'Keep windows closed', 'Use air purifiers', 'Wear N95 masks if going outside'];
    case 'hazardous':
      return ['Stay indoors with windows closed', 'Use high-efficiency air purifiers', 'Wear N95 masks if necessary', 'Postpone outdoor plans'];
    default:
      return ['Monitor air quality updates', 'Take appropriate precautions'];
  }
};
