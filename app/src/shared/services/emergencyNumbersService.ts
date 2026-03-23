/**
 * Emergency Numbers Service - Real API Implementation
 * Uses emergencynumberapi.com for real-time emergency numbers
 */

export interface EmergencyContacts {
  countryCode: string;
  country: string;
  emergency: string;
  police: string;
  fire: string;
  ambulance: string;
  poisonControl?: string;
  mentalHealth?: string;
  nonEmergencyMedical?: string;
  touristHotline?: string;
  lastUpdated: string;
  source: string;
}

export interface EmergencyNumbersResponse {
  success: boolean;
  data: EmergencyContacts | null;
  error?: string;
}

/**
 * Get emergency numbers for a specific country using real API
 */
export const getEmergencyContacts = async (countryCode: string): Promise<EmergencyContacts> => {
  try {
    
    const response = await fetch(`https://emergencynumberapi.com/api/country/${countryCode}`);
    
    if (!response.ok) {
      throw new Error(`Emergency API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    const emergencyData = data.data;
    const countryInfo = emergencyData.country;
    
    // Extract numbers from the API response
    const getFirstNumber = (numbers: any) => {
      if (Array.isArray(numbers?.all) && numbers.all.length > 0) {
        const firstNumber = numbers.all[0];
        return firstNumber && firstNumber.trim() !== '' ? firstNumber : 'Unknown';
      }
      return 'Unknown';
    };
    
    // Get basic data from API
    const apiEmergency = getFirstNumber(emergencyData.dispatch) || getFirstNumber(emergencyData.police);
    const apiPolice = getFirstNumber(emergencyData.police);
    const apiFire = getFirstNumber(emergencyData.fire);
    const apiAmbulance = getFirstNumber(emergencyData.ambulance);
    
    // Get fallback data for comprehensive coverage
    const fallbackData = getFallbackEmergencyContacts(countryCode);
    
    return {
      countryCode: countryInfo?.ISOCode || countryCode,
      country: countryInfo?.name || countryCode,
      emergency: apiEmergency !== 'Unknown' ? apiEmergency : fallbackData.emergency,
      police: apiPolice !== 'Unknown' ? apiPolice : fallbackData.police,
      fire: apiFire !== 'Unknown' ? apiFire : fallbackData.fire,
      ambulance: apiAmbulance !== 'Unknown' ? apiAmbulance : fallbackData.ambulance,
      poisonControl: fallbackData.poisonControl,
      mentalHealth: fallbackData.mentalHealth,
      nonEmergencyMedical: fallbackData.nonEmergencyMedical,
      touristHotline: fallbackData.touristHotline,
      lastUpdated: new Date().toISOString(),
      source: 'emergencynumberapi.com + static_fallback'
    };
    
  } catch (error) {
    console.error('Error fetching emergency numbers:', error);
    
    // Fallback to static data for common countries
    return getFallbackEmergencyContacts(countryCode);
  }
};

/**
 * Fallback emergency contacts for common countries
 */
const getFallbackEmergencyContacts = (countryCode: string): EmergencyContacts => {
  const fallbackData: Record<string, EmergencyContacts> = {
    'US': {
      countryCode: 'US',
      country: 'United States',
      emergency: '911',
      police: '911',
      fire: '911',
      ambulance: '911',
      poisonControl: '1-800-222-1222',
      mentalHealth: '988',
      nonEmergencyMedical: '311',
      touristHotline: '1-800-255-3050',
      lastUpdated: new Date().toISOString(),
      source: 'static_fallback'
    },
    'GB': {
      countryCode: 'GB',
      country: 'United Kingdom',
      emergency: '999',
      police: '999',
      fire: '999',
      ambulance: '999',
      nonEmergencyMedical: '111',
      touristHotline: '0300 123 9999',
      lastUpdated: new Date().toISOString(),
      source: 'static_fallback'
    },
    'FR': {
      countryCode: 'FR',
      country: 'France',
      emergency: '112',
      police: '17',
      fire: '18',
      ambulance: '15',
      poisonControl: '01 40 05 48 48',
      touristHotline: '3975',
      lastUpdated: new Date().toISOString(),
      source: 'static_fallback'
    },
    'DE': {
      countryCode: 'DE',
      country: 'Germany',
      emergency: '112',
      police: '110',
      fire: '112',
      ambulance: '112',
      lastUpdated: new Date().toISOString(),
      source: 'static_fallback'
    },
    'CA': {
      countryCode: 'CA',
      country: 'Canada',
      emergency: '911',
      police: '911',
      fire: '911',
      ambulance: '911',
      poisonControl: '1-800-268-9017',
      lastUpdated: new Date().toISOString(),
      source: 'static_fallback'
    },
    'AU': {
      countryCode: 'AU',
      country: 'Australia',
      emergency: '000',
      police: '000',
      fire: '000',
      ambulance: '000',
      lastUpdated: new Date().toISOString(),
      source: 'static_fallback'
    }
  };
  
  return fallbackData[countryCode] || {
    countryCode,
    country: countryCode,
    emergency: 'Unknown',
    police: 'Unknown',
    fire: 'Unknown',
    ambulance: 'Unknown',
    lastUpdated: new Date().toISOString(),
    source: 'static_fallback'
  };
};

/**
 * Get emergency numbers for multiple countries
 */
export const getMultipleEmergencyContacts = async (countryCodes: string[]): Promise<Record<string, EmergencyContacts>> => {
  const results: Record<string, EmergencyContacts> = {};
  
  const promises = countryCodes.map(async (countryCode) => {
    try {
      const contacts = await getEmergencyContacts(countryCode);
      results[countryCode] = contacts;
    } catch (error) {
      console.error(`Error fetching emergency contacts for ${countryCode}:`, error);
      results[countryCode] = getFallbackEmergencyContacts(countryCode);
    }
  });
  
  await Promise.all(promises);
  return results;
};

/**
 * Search for emergency numbers by country name
 */
export const searchEmergencyContacts = async (countryName: string): Promise<EmergencyContacts | null> => {
  try {
    // Try common country code mappings
    const countryMappings: Record<string, string> = {
      'united states': 'US',
      'usa': 'US',
      'america': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'britain': 'GB',
      'france': 'FR',
      'germany': 'DE',
      'canada': 'CA',
      'australia': 'AU',
      'japan': 'JP',
      'spain': 'ES',
      'italy': 'IT',
      'netherlands': 'NL',
      'sweden': 'SE',
      'norway': 'NO',
      'denmark': 'DK',
      'finland': 'FI',
      'switzerland': 'CH',
      'austria': 'AT',
      'belgium': 'BE',
      'portugal': 'PT',
      'ireland': 'IE',
      'new zealand': 'NZ',
      'south korea': 'KR',
      'singapore': 'SG',
      'hong kong': 'HK',
      'taiwan': 'TW',
      'thailand': 'TH',
      'malaysia': 'MY',
      'indonesia': 'ID',
      'philippines': 'PH',
      'vietnam': 'VN',
      'india': 'IN',
      'china': 'CN',
      'brazil': 'BR',
      'mexico': 'MX',
      'argentina': 'AR',
      'chile': 'CL',
      'south africa': 'ZA',
      'egypt': 'EG',
      'nigeria': 'NG',
      'kenya': 'KE',
      'morocco': 'MA',
      'tunisia': 'TN',
      'algeria': 'DZ',
      'russia': 'RU',
      'ukraine': 'UA',
      'poland': 'PL',
      'czech republic': 'CZ',
      'hungary': 'HU',
      'romania': 'RO',
      'bulgaria': 'BG',
      'croatia': 'HR',
      'serbia': 'RS',
      'slovenia': 'SI',
      'slovakia': 'SK',
      'estonia': 'EE',
      'latvia': 'LV',
      'lithuania': 'LT',
      'greece': 'GR',
      'cyprus': 'CY',
      'malta': 'MT',
      'luxembourg': 'LU',
      'iceland': 'IS',
      'turkey': 'TR',
      'israel': 'IL',
      'saudi arabia': 'SA',
      'uae': 'AE',
      'qatar': 'QA',
      'kuwait': 'KW',
      'bahrain': 'BH',
      'oman': 'OM',
      'jordan': 'JO',
      'lebanon': 'LB',
      'syria': 'SY',
      'iraq': 'IQ',
      'iran': 'IR',
      'afghanistan': 'AF',
      'pakistan': 'PK',
      'bangladesh': 'BD',
      'sri lanka': 'LK',
      'nepal': 'NP',
      'bhutan': 'BT',
      'maldives': 'MV',
      'myanmar': 'MM',
      'cambodia': 'KH',
      'laos': 'LA',
      'brunei': 'BN',
      'mongolia': 'MN',
      'kazakhstan': 'KZ',
      'uzbekistan': 'UZ',
      'turkmenistan': 'TM',
      'tajikistan': 'TJ',
      'kyrgyzstan': 'KG'
    };
    
    const normalizedName = countryName.toLowerCase().trim();
    const countryCode = countryMappings[normalizedName];
    
    if (countryCode) {
      return await getEmergencyContacts(countryCode);
    }
    
    return null;
  } catch (error) {
    console.error('Error searching emergency contacts:', error);
    return null;
  }
};

/**
 * Get emergency numbers for current location (requires country detection)
 */
export const getEmergencyContactsForLocation = async (
  latitude: number, 
  longitude: number, 
  countryCode?: string
): Promise<EmergencyContacts | null> => {
  try {
    // If country code is provided, use it directly
    if (countryCode) {
      return await getEmergencyContacts(countryCode);
    }
    
    // Otherwise, we would need to reverse geocode to get country
    // For now, return null and let the caller handle country detection
    console.warn('Country code required for location-based emergency contacts');
    return null;
  } catch (error) {
    console.error('Error getting emergency contacts for location:', error);
    return null;
  }
};

/**
 * Format emergency contacts for display
 */
export const formatEmergencyContacts = (contacts: EmergencyContacts): string => {
  let formatted = `🚨 Emergency Numbers for ${contacts.country}:\n\n`;
  
  formatted += `📞 Emergency: ${contacts.emergency}\n`;
  formatted += `👮 Police: ${contacts.police}\n`;
  formatted += `🚒 Fire: ${contacts.fire}\n`;
  formatted += `🚑 Ambulance: ${contacts.ambulance}\n`;
  
  if (contacts.poisonControl) {
    formatted += `☠️ Poison Control: ${contacts.poisonControl}\n`;
  }
  
  if (contacts.mentalHealth) {
    formatted += `🧠 Mental Health: ${contacts.mentalHealth}\n`;
  }
  
  if (contacts.nonEmergencyMedical) {
    formatted += `🏥 Non-Emergency Medical: ${contacts.nonEmergencyMedical}\n`;
  }
  
  if (contacts.touristHotline) {
    formatted += `🏛️ Tourist Hotline: ${contacts.touristHotline}\n`;
  }
  
  formatted += `\n📅 Last Updated: ${new Date(contacts.lastUpdated).toLocaleDateString()}`;
  formatted += `\n📡 Source: ${contacts.source}`;
  
  return formatted;
};
