# Travel Health APIs Setup Guide

## Google Maps Platform APIs Setup

### Your API Key
```
AIzaSyB3IChMH_lt7BVxERt5OR5oi8IMHNToLFE
```

### Required Steps in Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Enable the following APIs** for your project:
   - ✅ Time Zone API
   - ✅ Air Quality API  
   - ✅ Pollen API
   - 🔄 Places API (optional - for healthcare facilities)
   - 🔄 Geocoding API (optional - for address conversion)

3. **Verify API Key Restrictions**:
   - Go to Credentials → API Keys
   - Click on your API key
   - Under "API restrictions", ensure selected APIs are enabled
   - Consider IP restrictions for security

## API Integration Plan

### 1. Google Time Zone API ⏰
**Current Status**: Not integrated
**Purpose**: Accurate local time for health reminders
**Integration**: High priority for travel health

```typescript
// Example usage
const timeZoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${API_KEY}`;
```

### 2. Google Air Quality API 🌬️
**Current Status**: Using OpenWeatherMap (working)
**Purpose**: Alternative/additional air quality data
**Integration**: Could replace or supplement current data

```typescript
// Example usage  
const airQualityUrl = `https://maps.googleapis.com/maps/api/airquality/current?location=${lat},${lng}&key=${API_KEY}`;
```

### 3. Google Pollen API 🌸
**Current Status**: Not integrated
**Purpose**: Allergy information for travelers
**Integration**: New health metric to add

```typescript
// Example usage
const pollenUrl = `https://maps.googleapis.com/maps/api/airquality/pollen?location=${lat},${lng}&key=${API_KEY}`;
```

## Additional Recommended APIs

### 4. CDC Travel Health API 🦠
**URL**: `https://wwwnc.cdc.gov/travel/api/`
**Purpose**: Disease outbreaks, vaccination requirements
**Cost**: Free
**Status**: Would replace mock disease risk data

### 5. OpenWeatherMap UV Index ☀️
**URL**: Already have API key setup
**Purpose**: Real UV index data
**Cost**: Free tier available
**Status**: Easy upgrade from mock data

### 6. WHO Disease Surveillance 🏥
**URL**: `https://disease.sh/v3/covid-19/`
**Purpose**: Global disease monitoring
**Cost**: Free
**Status**: Supplement disease risk data

## Cost Estimates (Google APIs)

| API | Cost per 1000 requests | Monthly budget estimate |
|-----|------------------------|-------------------------|
| Time Zone API | $5.00 | $5-15 |
| Air Quality API | $2.00 | $5-10 |
| Pollen API | $2.00 | $5-10 |
| Places API | $17.00 | $20-50 |
| **Total** | | **$35-85/month** |

## Implementation Priority

### Phase 1: Core Travel Health (Week 1)
1. **Google Time Zone API** - Essential for travel
2. **Google Pollen API** - New health metric
3. **OpenWeatherMap UV Index** - Upgrade existing mock data

### Phase 2: Enhanced Health Data (Week 2)
1. **CDC Travel Health API** - Real disease/vaccination data
2. **Google Places API** - Healthcare facility finder
3. **WHO Disease Surveillance** - Enhanced disease monitoring

### Phase 3: Advanced Features (Week 3)
1. **Google Air Quality API** - Compare with OpenWeatherMap
2. **Water Quality APIs** - Real water safety data
3. **Food Safety APIs** - Restaurant/food safety scores

## Environment Configuration

Add to your `.env` file:

```bash
# Existing APIs
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key

# Google Maps Platform APIs
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB3IChMH_lt7BVxERt5OR5oi8IMHNToLFE

# Optional: CDC/WHO APIs (free, no key needed)
# These APIs are free government APIs
```

## Next Steps

1. **Confirm API priorities** - Which APIs should we implement first?
2. **Enable APIs in Google Cloud Console** - I can walk you through this
3. **Start with Phase 1** - Time Zone and Pollen APIs are high-impact
4. **Test incrementally** - Add one API at a time to avoid complexity

## Questions for You

1. **Which APIs should we prioritize?** (Time Zone, Pollen, UV Index upgrade?)
2. **Budget comfort level?** (Google APIs will cost ~$35-85/month)
3. **Integration approach?** (Add to existing structure or new services?)

Would you like me to start with a specific API integration, or would you prefer to enable the APIs in Google Cloud Console first? 