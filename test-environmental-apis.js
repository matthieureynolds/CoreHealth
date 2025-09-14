#!/usr/bin/env node

/**
 * Test script for environmental APIs
 * Run with: node test-environmental-apis.js
 */

const API_CONFIG = {
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
};

// Test coordinates (New York City)
const TEST_COORDINATES = {
  latitude: 40.7128,
  longitude: -74.0060,
};

async function testGoogleAirQualityAPI() {
  console.log('🧪 Testing Google Air Quality API...');
  
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.log('❌ Google Maps API key not found');
    return false;
  }

  try {
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
    
    const requestBody = {
      universalAqi: true,
      location: {
        latitude: TEST_COORDINATES.latitude,
        longitude: TEST_COORDINATES.longitude,
      },
      extraComputations: [
        "HEALTH_RECOMMENDATIONS",
        "DOMINANT_POLLUTANT",
        "POLLUTANT_CONCENTRATION",
        "LOCAL_AQI",
        "POLLUTANT_ADDITIONAL_INFO"
      ],
      languageCode: "en"
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Google Air Quality API: Success');
      console.log('   Universal AQI:', data.indexes?.[0]?.aqi || 'N/A');
      return true;
    } else {
      console.log('❌ Google Air Quality API failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Google Air Quality API error:', error.message);
    return false;
  }
}

async function testGooglePollenAPI() {
  console.log('🧪 Testing Google Pollen API...');
  
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.log('❌ Google Maps API key not found');
    return false;
  }

  try {
    const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
    
    const requestBody = {
      location: {
        latitude: TEST_COORDINATES.latitude,
        longitude: TEST_COORDINATES.longitude,
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

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Google Pollen API: Success');
      console.log('   Tree pollen:', data.pollen?.tree?.indexValue || 'N/A');
      console.log('   Grass pollen:', data.pollen?.grass?.indexValue || 'N/A');
      console.log('   Weed pollen:', data.pollen?.weed?.indexValue || 'N/A');
      return true;
    } else {
      console.log('❌ Google Pollen API failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Google Pollen API error:', error.message);
    return false;
  }
}

async function testGoogleGeocodingAPI() {
  console.log('🧪 Testing Google Geocoding API...');
  
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.log('❌ Google Maps API key not found');
    return false;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${TEST_COORDINATES.latitude},${TEST_COORDINATES.longitude}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      console.log('✅ Google Geocoding API: Success');
      console.log('   Location:', data.results?.[0]?.formatted_address || 'N/A');
      return true;
    } else {
      console.log('❌ Google Geocoding API failed:', data.status, data.error_message);
      return false;
    }
  } catch (error) {
    console.log('❌ Google Geocoding API error:', error.message);
    return false;
  }
}

async function testOpenWeatherAPI() {
  console.log('🧪 Testing OpenWeather API...');
  
  if (!API_CONFIG.OPENWEATHER_API_KEY) {
    console.log('❌ OpenWeather API key not found');
    return false;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${TEST_COORDINATES.latitude}&lon=${TEST_COORDINATES.longitude}&appid=${API_CONFIG.OPENWEATHER_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ OpenWeather API: Success');
      console.log('   Temperature:', data.main?.temp ? `${Math.round(data.main.temp - 273.15)}°C` : 'N/A');
      console.log('   Weather:', data.weather?.[0]?.description || 'N/A');
      return true;
    } else {
      console.log('❌ OpenWeather API failed:', data.cod, data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ OpenWeather API error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Environmental APIs Test...\n');
  
  const results = {
    airQuality: await testGoogleAirQualityAPI(),
    pollen: await testGooglePollenAPI(),
    geocoding: await testGoogleGeocodingAPI(),
    weather: await testOpenWeatherAPI(),
  };

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log('Google Air Quality API:', results.airQuality ? '✅ Working' : '❌ Failed');
  console.log('Google Pollen API:', results.pollen ? '✅ Working' : '❌ Failed');
  console.log('Google Geocoding API:', results.geocoding ? '✅ Working' : '❌ Failed');
  console.log('OpenWeather API:', results.weather ? '✅ Working' : '❌ Failed');

  const workingAPIs = Object.values(results).filter(Boolean).length;
  const totalAPIs = Object.keys(results).length;

  console.log(`\n🎯 ${workingAPIs}/${totalAPIs} APIs are working`);

  if (workingAPIs === 0) {
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add your API keys:');
    console.log('   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here');
    console.log('   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here');
    console.log('3. Enable the required APIs in Google Cloud Console');
    console.log('4. Run this test again');
  } else if (workingAPIs < totalAPIs) {
    console.log('\n⚠️  Some APIs are not working. Check the error messages above.');
    console.log('💡 Make sure all required APIs are enabled in Google Cloud Console.');
  } else {
    console.log('\n🎉 All APIs are working correctly!');
    console.log('✨ Your environmental data should now be available in the app.');
  }
}

// Run the tests
runTests().catch(console.error);
