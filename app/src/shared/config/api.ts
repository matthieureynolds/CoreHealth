// API Configuration
export const API_CONFIG = {
  // OpenWeather API Key
  // Get your free API key at: https://openweathermap.org/api
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  
  // OpenWeather API Base URL
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // OpenWeather API endpoints
  WEATHER_ENDPOINT: '/weather',
  AIR_QUALITY_ENDPOINT: '/air_pollution',
  UV_INDEX_ENDPOINT: '/uvi',

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // Google Maps API Base URL
  GOOGLE_MAPS_BASE_URL: 'https://maps.googleapis.com/maps/api',
  
  // Google Maps API Endpoints
  GEOCODING_ENDPOINT: '/geocode/json',
  TIMEZONE_ENDPOINT: '/timezone/json',
  PLACES_ENDPOINT: '/place/nearbysearch/json',
  
  // Google Air Quality API
  GOOGLE_AIR_QUALITY_BASE_URL: 'https://airquality.googleapis.com/v1',
  GOOGLE_AIR_QUALITY_ENDPOINT: '/currentConditions:lookup',
  
  // Google Pollen API
  GOOGLE_POLLEN_BASE_URL: 'https://pollen.googleapis.com/v1',
  GOOGLE_POLLEN_ENDPOINT: '/forecast:lookup',
};

// API validation
export const validateApiKeys = () => {
  const missing = [];
  const warnings = [];
  
  if (!API_CONFIG.OPENWEATHER_API_KEY) {
    missing.push('EXPO_PUBLIC_OPENWEATHER_API_KEY');
  }
  
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY || 
      API_CONFIG.GOOGLE_MAPS_API_KEY === 'your-key-here' || 
      API_CONFIG.GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
    missing.push('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
  }
  
  if (missing.length > 0) {
    console.warn('🚨 Missing API keys:', missing.join(', '));
    console.warn('📋 To get real environmental data, please:');
    console.warn('1. OpenWeather: https://openweathermap.org/api');
    console.warn('2. Google Maps: https://console.cloud.google.com/');
    console.warn('3. Add API keys to your .env file');
    console.warn('4. Restart your development server');
    console.warn('');
    console.warn('🔧 Google Cloud Console Setup:');
    console.warn('1. Go to: https://console.cloud.google.com/');
    console.warn('2. Enable these APIs:');
    console.warn('   - Maps JavaScript API');
    console.warn('   - Places API');
    console.warn('   - Geocoding API');
    console.warn('   - Air Quality API (NEW)');
    console.warn('   - Pollen API (NEW)');
    console.warn('3. Create API key with these APIs enabled');
    console.warn('4. Add to .env: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here');
  } else {
  }
  
  return missing.length === 0;
}; 