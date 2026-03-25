// UV Index helpers
export const getUVExplanation = (status: string): string => {
  switch (status) {
    case 'excellent':
    case 'good':
      return 'UV levels are low. Minimal protection needed.';
    case 'moderate':
      return 'UV levels are moderate. Protection is recommended during midday.';
    case 'poor':
      return 'UV levels are high. Extra protection is required, especially midday.';
    case 'hazardous':
      return 'UV levels are very high to extreme. Avoid direct sun and use maximum protection.';
    default:
      return 'UV levels are being monitored.';
  }
};

export const getUVHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'good':
      return ['Very low risk of skin damage'];
    case 'moderate':
      return ['Risk of sunburn for unprotected skin', 'Eye strain possible'];
    case 'poor':
      return ['Increased sunburn risk within 30–60 minutes', 'Potential eye damage without protection'];
    case 'hazardous':
      return ['Sunburn in minutes', 'High risk of skin and eye damage'];
    default:
      return [];
  }
};

export const getUVRecommendations = (status: string): string[] => {
  switch (status) {
    case 'good':
      return ['Sunscreen optional', 'Sunglasses for comfort'];
    case 'moderate':
      return ['Use SPF 30+ sunscreen', 'Wear sunglasses and a hat', 'Seek shade near midday'];
    case 'poor':
      return ['Use SPF 50+ sunscreen', 'Wear protective clothing and hat', 'Limit time in direct sun'];
    case 'hazardous':
      return ['Avoid direct sun 10am–4pm', 'SPF 50+, sunglasses (UV400)', 'Seek shade and cover up'];
    default:
      return ['Use appropriate sun protection'];
  }
};

// Food safety helpers
export const getFoodSafetyExplanation = (status: string): string => {
  switch (status) {
    case 'good':
      return 'Food safety standards are generally good. Low risk of foodborne illness.';
    case 'moderate':
      return 'Food safety varies. Be selective with vendors and preparation.';
    case 'poor':
      return 'Higher risk of foodborne illness. Choose reputable venues and cooked food.';
    default:
      return 'Food safety conditions are being monitored.';
  }
};

export const getFoodSafetyHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'moderate':
      return ['Traveler\u2019s diarrhea risk present', 'Mild GI upset possible'];
    case 'poor':
      return ['Higher risk of GI illness', 'Dehydration and electrolyte imbalance possible'];
    default:
      return [];
  }
};

export const getFoodSafetyRecommendations = (status: string): string[] => {
  switch (status) {
    case 'good':
      return ['Normal precautions', 'Wash hands before eating'];
    case 'moderate':
      return ['Eat freshly cooked food', 'Avoid raw/undercooked meats', 'Use bottled water for brushing teeth'];
    case 'poor':
      return ['Avoid street food/raw salads', 'Drink sealed bottled water', 'Carry oral rehydration salts'];
    default:
      return ['Follow safe food and water practices'];
  }
};

// Altitude helpers
export const getAltitudeExplanation = (status: string): string => {
  switch (status) {
    case 'good':
      return 'Altitude is low; minimal physiological impact.';
    case 'moderate':
      return 'Moderate altitude may affect sleep and exercise tolerance.';
    case 'poor':
      return 'High altitude increases risk of acute mountain sickness without acclimatization.';
    default:
      return 'Altitude impact is being assessed.';
  }
};

export const getAltitudeHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'moderate':
      return ['Mild headache or fatigue', 'Reduced exercise tolerance'];
    case 'poor':
      return ['Headache, nausea, insomnia', 'Risk of AMS at >2500m (8200ft)'];
    default:
      return [];
  }
};

export const getAltitudeRecommendations = (status: string): string[] => {
  switch (status) {
    case 'good':
      return ['Stay hydrated', 'Normal activity acceptable'];
    case 'moderate':
      return ['Ascend gradually', 'Hydrate and avoid alcohol on arrival'];
    case 'poor':
      return ['Acclimatize 1–2 days', 'Avoid rapid ascent', 'Consider acetazolamide if advised'];
    default:
      return ['Follow acclimatization guidance'];
  }
};

// Disease outbreaks helpers
export const getOutbreaksExplanation = (status: string): string => {
  switch (status) {
    case 'good':
      return 'No significant outbreaks reported.';
    case 'moderate':
      return 'Localized outbreaks present. Follow public health guidance.';
    case 'poor':
      return 'Widespread outbreaks. Heightened precautions recommended.';
    default:
      return 'Outbreak status is being monitored.';
  }
};

export const getOutbreaksHealthImpacts = (status: string): string[] => {
  switch (status) {
    case 'moderate':
      return ['Elevated infection risk in specific areas'];
    case 'poor':
      return ['High infection risk', 'Potential healthcare strain'];
    default:
      return [];
  }
};

export const getOutbreaksRecommendations = (status: string): string[] => {
  switch (status) {
    case 'good':
      return ['Keep routine vaccinations up to date'];
    case 'moderate':
      return ['Practice hand hygiene', 'Avoid crowded indoor spaces', 'Use masks where advised'];
    case 'poor':
      return ['Consider postponing non-essential travel', 'Strict hygiene and masking', 'Follow local advisories'];
    default:
      return ['Follow health authority guidance'];
  }
};
