# Environmental APIs Setup Guide

This guide will help you set up the APIs needed to get real-time environmental data (location, air quality, pollen, and water quality) in your CoreHealth app.

## Required APIs

### 1. Google Maps Platform APIs

You'll need a Google Cloud Platform account and the following APIs enabled:

#### Required APIs:
- **Maps JavaScript API** - For location services
- **Places API** - For finding nearby facilities
- **Geocoding API** - For converting addresses to coordinates
- **Air Quality API** - For real-time air quality data (NEW)
- **Pollen API** - For pollen forecast data (NEW)

#### Setup Steps:

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search for and enable each API:
     - Maps JavaScript API
     - Places API
     - Geocoding API
     - Air Quality API
     - Pollen API

3. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

4. **Secure Your API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `localhost:3000`, `*.expo.dev`)
   - Under "API restrictions", select "Restrict key"
   - Choose the APIs you enabled above

### 2. OpenWeather API (Optional)

For weather data and backup air quality data:

1. **Sign up for OpenWeather**
   - Go to [OpenWeatherMap](https://openweathermap.org/api)
   - Create a free account
   - Get your API key

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```env
# Google Maps API Key (Required)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenWeather API Key (Optional)
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## Testing Your Setup

1. **Start your development server:**
   ```bash
   npm start
   # or
   expo start
   ```

2. **Check the console logs:**
   - Look for API validation messages
   - You should see "✅ All required API keys are configured" if setup correctly
   - If APIs are not enabled, you'll see specific error messages

3. **Test location services:**
   - Allow location permissions when prompted
   - The app should show your current location
   - Environmental data should load (air quality, pollen, water quality)

## Troubleshooting

### Common Issues:

1. **"API not enabled" errors:**
   - Make sure you've enabled the specific APIs in Google Cloud Console
   - Wait a few minutes for API changes to propagate

2. **"API key not found" errors:**
   - Check your `.env` file is in the project root
   - Make sure variable names match exactly (case-sensitive)
   - Restart your development server after adding environment variables

3. **Location permission denied:**
   - Check device location settings
   - Make sure the app has location permissions
   - On iOS, you may need to add location usage descriptions to `app.json`

4. **No environmental data showing:**
   - Check console logs for API errors
   - Verify your API key has the correct permissions
   - Some APIs may not be available in all regions

### API Quotas and Limits:

- **Google Maps APIs**: Free tier includes 28,000 requests/month
- **Air Quality API**: Free tier includes 1,000 requests/month
- **Pollen API**: Free tier includes 1,000 requests/month
- **OpenWeather**: Free tier includes 1,000 requests/day

## Features Enabled

With proper API setup, you'll get:

### Real-time Environmental Data:
- **Air Quality**: AQI levels, pollutant details, health recommendations
- **Pollen Levels**: Tree, grass, and weed pollen forecasts
- **Water Quality**: Safety assessment, nearby water stations
- **Location Services**: Current location, nearby healthcare facilities

### Fallback Behavior:
- If APIs are not configured, the app will use mock data
- Location services will still work with basic geocoding
- All features remain functional with simulated data

## Security Notes

- Never commit your `.env` file to version control
- Use environment-specific API keys for production
- Regularly rotate your API keys
- Monitor your API usage in Google Cloud Console

## Support

If you encounter issues:

1. Check the console logs for specific error messages
2. Verify your API keys are correct and have proper permissions
3. Ensure all required APIs are enabled in Google Cloud Console
4. Check your internet connection and API quotas

For more help, refer to:
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [OpenWeather API Documentation](https://openweathermap.org/api)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
