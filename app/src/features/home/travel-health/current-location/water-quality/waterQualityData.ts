export const waterQualityDescription =
  'Water quality measures the safety and cleanliness of local water sources, including chemical contaminants, bacteria, and mineral content.';

export const waterQualityNormalRange =
  'Poor • Marginal • Good • Very Good • Excellent (country standards vary)';

export const waterQualityOptimalRange =
  'Excellent quality with beneficial minerals - Perfect for all uses';

export const waterQualityRiskFactors = [
  'Drinking untreated water',
  'Traveling to areas with poor sanitation',
  'Compromised immune system',
  'Pregnancy or young children',
  'Local water treatment issues',
];

export const waterQualityRangeSegments = [
  { label: 'Poor', color: '#FF3B30', range: '0-44' },
  { label: 'Marginal', color: '#FF6B35', range: '45-64' },
  { label: 'Good', color: '#FF9F0A', range: '65-79', isBold: true },
  { label: 'Very Good', color: '#32D74B', range: '80-94' },
  { label: 'Excellent', color: '#30D158', range: '95-100' },
];

export const waterQualityScoreDivisor = 100;

export const getWaterQualityExplanation = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'Water is completely safe to drink with no harmful contaminants. Contains beneficial minerals and meets all health standards. Perfect for drinking, cooking, and all household uses.';
    case 'good':
      return 'Water is safe to drink with minimal contaminants well below harmful levels. Meets health standards and is suitable for all daily uses including drinking and cooking.';
    case 'moderate':
      return 'Water is generally safe to drink but may have taste, odor, or minor quality issues. Contaminants are present but below dangerous levels. Consider filtration for better taste.';
    case 'poor':
      return 'Water has elevated contaminant levels that may pose health risks. Not recommended for drinking without treatment. Use filtered or bottled water for consumption.';
    case 'hazardous':
      return 'Water is unsafe to drink with high contaminant levels that pose serious health risks. Do not consume tap water. Use only bottled or properly filtered water.';
    default:
      return 'Water quality is being monitored for safety.';
  }
};

export const getWaterQualityHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'excellent':
      return ['No health risks', 'Provides beneficial minerals', 'Supports optimal hydration'];
    case 'good':
      return ['Minimal health risks', 'Safe for daily consumption', 'Good for hydration'];
    case 'moderate':
      return ['Possible gastrointestinal issues', 'May affect taste and odor', 'Consider filtration for sensitive individuals'];
    case 'poor':
      return ['Increased risk of gastrointestinal illness', 'May cause nausea or diarrhea', 'Avoid drinking untreated water'];
    case 'hazardous':
      return ['High risk of serious illness', 'Potential for severe gastrointestinal problems', 'Do not drink tap water'];
    default:
      return ['Monitor for any digestive symptoms'];
  }
};

export const getWaterQualityRecommendations = (status: string): string[] => {
  switch (status) {
    case 'excellent':
      return ['Drink tap water freely', 'Great for cooking and hydration', 'No additional treatment needed'];
    case 'good':
      return ['Tap water is safe to drink', 'Good for daily use', 'Consider filtration for taste preferences'];
    case 'moderate':
      return ['Use water filters for drinking', 'Boil water for cooking', 'Consider bottled water for sensitive individuals'];
    case 'poor':
      return ['Use high-quality water filters', 'Drink bottled or filtered water', 'Avoid ice made from tap water'];
    case 'hazardous':
      return ['Use only bottled or filtered water', 'Avoid tap water completely', 'Use bottled water for cooking and brushing teeth'];
    default:
      return ['Check local water quality reports', 'Use appropriate water treatment methods'];
  }
};
