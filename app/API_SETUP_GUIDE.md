# 🔧 API Setup Guide for CoreHealth

## 🚨 Current Status
Your app is working great with the **static healthcare database** for Haslemere and Milan, but some APIs are failing. Here's how to fix them:

## 🏥 Healthcare Facilities (WORKING ✅)
- **Status**: Working perfectly with static database
- **Coverage**: Haslemere, Milan, London, Paris, NYC
- **Fallback**: OpenStreetMap for other cities
- **No API key needed** for basic functionality

## 🗺️ Google Places API (FAILING ❌)
- **Current Error**: REQUEST_DENIED
- **Cause**: Invalid/placeholder API key
- **Impact**: Healthcare facilities fallback to static data (still works!)

### How to Fix Google Places API:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create/Select Project:**
   - Create new project or select existing one
   - Give it a name like "CoreHealth"

3. **Enable Required APIs:**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - ✅ Places API
     - ✅ Geocoding API
     - ✅ Maps JavaScript API

4. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated key

5. **Update .env file:**
   ```bash
   # Replace this line in your .env file:
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```

6. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

## 🌤️ Weather APIs (FAILING ❌)
- **Current Error**: 401 Unauthorized
- **Cause**: Invalid API keys
- **Impact**: Weather data shows mock values

### How to Fix Weather APIs:

1. **OpenWeather API:**
   - Visit: https://openweathermap.org/api
   - Sign up for free account
   - Get your API key
   - Update .env: `EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here`

2. **Google Air Quality API:**
   - Same Google Cloud Console project
   - Enable "Air Quality API"
   - Use same API key as Places API

## 🔍 Google Vision API (FAILING ❌)
- **Purpose**: Medical record scanning
- **Setup**: Enable "Vision API" in Google Cloud Console

## 📊 Current Working Features:

✅ **Location Detection** - GPS coordinates and city names  
✅ **Healthcare Facilities** - Hospitals and pharmacies for major cities  
✅ **Static Data Fallbacks** - Reliable data when APIs fail  
✅ **Travel Health Summary** - Location-specific health info  
✅ **Jet Lag Planning** - Timezone calculations  

## 🚀 Quick Fix Summary:

**For immediate functionality (no API keys needed):**
- Healthcare facilities work with static database
- Location detection works with GPS
- Basic travel health features work

**For enhanced functionality (requires API keys):**
- Real-time weather data
- Air quality information
- Pollen levels
- Comprehensive healthcare facility search
- Medical record scanning

## 💡 Recommendation:

Your app is already working great! The static healthcare database provides reliable data for Haslemere and Milan. You can add API keys later for enhanced features, but the core functionality is solid.

**Priority order for API setup:**
1. 🏥 Google Places API (for comprehensive healthcare search)
2. 🌤️ OpenWeather API (for real weather data)
3. 🔍 Google Vision API (for medical record scanning)
