import { API_CONFIG } from '../config/api';
import {
  MedicationInfo,
  CountryMedicationStatus,
  MedicationAvailability,
  MedicationPharmacy,
  ImportRegulations,
  AlternativeMedication,
  TravelMedicationKit
} from '../types';

// Common medications database with country restrictions
const MEDICATION_DATABASE: Record<string, MedicationInfo & { countryRestrictions: Record<string, Partial<CountryMedicationStatus>> }> = {
  ibuprofen: {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nurofen', 'Brufen'],
    category: 'over_the_counter',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain relief and reducing inflammation',
    commonUses: ['Pain relief', 'Fever reduction', 'Anti-inflammatory'],
    countryRestrictions: {
      'US': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'UK': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'DE': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'JP': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'AU': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'CA': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'FR': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'ES': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'IT': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'CN': { availability: 'available', pharmacyAvailability: 'limited', prescriptionRequired: false },
    }
  },
  amoxicillin: {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil', 'Trimox', 'Moxatag'],
    category: 'prescription',
    description: 'Penicillin antibiotic used to treat bacterial infections',
    commonUses: ['Bacterial infections', 'Pneumonia', 'Ear infections'],
    countryRestrictions: {
      'US': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'UK': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'DE': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'JP': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'AU': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'CA': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'FR': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'ES': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'IT': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'CN': { availability: 'prescription_required', pharmacyAvailability: 'limited', prescriptionRequired: true },
    }
  },
  lorazepam: {
    id: 'lorazepam',
    name: 'Lorazepam',
    genericName: 'Lorazepam',
    brandNames: ['Ativan', 'Temesta', 'Tavor'],
    category: 'controlled_substance',
    description: 'Benzodiazepine used for anxiety disorders and short-term anxiety relief',
    commonUses: ['Anxiety', 'Insomnia', 'Seizures', 'Sedation'],
    countryRestrictions: {
      'US': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true, restrictions: ['DEA controlled substance', 'Strict prescription limits'] },
      'UK': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true, restrictions: ['Controlled drug Schedule 4'] },
      'DE': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true, restrictions: ['BtMG controlled substance'] },
      'JP': { availability: 'restricted', pharmacyAvailability: 'specialty_only', prescriptionRequired: true, restrictions: ['Psychotropic substance', 'Import permit required'] },
      'AU': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true, restrictions: ['Schedule 4 controlled drug'] },
      'CA': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true, restrictions: ['Controlled substance'] },
      'AE': { availability: 'banned', pharmacyAvailability: 'unavailable', prescriptionRequired: false, restrictions: ['Banned substance', 'No exceptions'], notes: 'Completely prohibited - consider alternatives' },
      'SG': { availability: 'restricted', pharmacyAvailability: 'specialty_only', prescriptionRequired: true, restrictions: ['Import permit required', 'Maximum 30-day supply'] },
    }
  },
  insulin: {
    id: 'insulin',
    name: 'Insulin',
    genericName: 'Insulin',
    brandNames: ['Humalog', 'NovoRapid', 'Lantus', 'Levemir'],
    category: 'prescription',
    description: 'Hormone used to treat diabetes by regulating blood sugar levels',
    commonUses: ['Type 1 diabetes', 'Type 2 diabetes', 'Blood sugar control'],
    countryRestrictions: {
      'US': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'UK': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'DE': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'JP': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'AU': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'CA': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'FR': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'ES': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'IT': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'IN': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
      'TH': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true },
    }
  },
  codeine: {
    id: 'codeine',
    name: 'Codeine',
    genericName: 'Codeine',
    brandNames: ['Tylenol #3', 'Paracetamol/Codeine', 'Co-codamol'],
    category: 'controlled_substance',
    description: 'Opioid pain medication and cough suppressant',
    commonUses: ['Pain relief', 'Cough suppression'],
    countryRestrictions: {
      'US': { availability: 'prescription_required', pharmacyAvailability: 'widely_available', prescriptionRequired: true, restrictions: ['DEA Schedule III/V'] },
      'UK': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false, restrictions: ['OTC limited to 3 days supply'] },
      'AU': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false, restrictions: ['Pharmacy-only medicine'] },
      'CA': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false, restrictions: ['Behind counter, quantity limits'] },
      'JP': { availability: 'banned', pharmacyAvailability: 'unavailable', prescriptionRequired: false, restrictions: ['Prohibited narcotic'], notes: 'Use alternatives like acetaminophen' },
      'AE': { availability: 'banned', pharmacyAvailability: 'unavailable', prescriptionRequired: false, restrictions: ['Banned narcotic'], notes: 'Severe penalties for possession' },
      'SG': { availability: 'banned', pharmacyAvailability: 'unavailable', prescriptionRequired: false, restrictions: ['Prohibited controlled drug'], notes: 'Death penalty for trafficking' },
      'TH': { availability: 'restricted', pharmacyAvailability: 'specialty_only', prescriptionRequired: true, restrictions: ['Special permit required'] },
    }
  },
  pseudoephedrine: {
    id: 'pseudoephedrine',
    name: 'Pseudoephedrine',
    genericName: 'Pseudoephedrine',
    brandNames: ['Sudafed', 'Deconex'],
    category: 'restricted',
    description: 'Decongestant used to treat nasal and sinus congestion',
    commonUses: ['Nasal congestion', 'Sinus congestion', 'Cold symptoms'],
    countryRestrictions: {
      'US': { availability: 'available', pharmacyAvailability: 'limited', prescriptionRequired: false, restrictions: ['Behind pharmacy counter', 'ID required', 'Purchase limits'] },
      'UK': { availability: 'available', pharmacyAvailability: 'widely_available', prescriptionRequired: false },
      'AU': { availability: 'available', pharmacyAvailability: 'limited', prescriptionRequired: false, restrictions: ['Pharmacy-only', 'Project STOP tracking'] },
      'JP': { availability: 'banned', pharmacyAvailability: 'unavailable', prescriptionRequired: false, restrictions: ['Prohibited stimulant'], notes: 'Can result in arrest' },
      'MX': { availability: 'banned', pharmacyAvailability: 'unavailable', prescriptionRequired: false, restrictions: ['Banned substance'] },
      'CN': { availability: 'restricted', pharmacyAvailability: 'specialty_only', prescriptionRequired: true, restrictions: ['Special permit required'] },
    }
  }
};

// Country codes mapping
const COUNTRY_CODES: Record<string, string> = {
  'United States': 'US',
  'United Kingdom': 'UK',
  'Germany': 'DE',
  'Japan': 'JP',
  'Australia': 'AU',
  'Canada': 'CA',
  'France': 'FR',
  'Spain': 'ES',
  'Italy': 'IT',
  'China': 'CN',
  'India': 'IN',
  'Thailand': 'TH',
  'United Arab Emirates': 'AE',
  'Singapore': 'SG',
  'Mexico': 'MX',
};

/**
 * Get medication availability for a specific medication in a country
 */
export const getMedicationAvailability = async (
  medicationName: string,
  country: string,
  latitude?: number,
  longitude?: number
): Promise<MedicationAvailability | null> => {
  try {
    const medicationId = medicationName.toLowerCase().replace(/\s+/g, '');
    const medication = MEDICATION_DATABASE[medicationId];
    
    if (!medication) {
      console.warn(`Medication ${medicationName} not found in database`);
      return null;
    }

    const countryCode = getCountryCode(country);
    const countryStatus = getCountryMedicationStatus(medication, countryCode, country);
    
    // Find nearby pharmacies if coordinates provided
    const nearbyPharmacies = latitude && longitude ? 
      await findNearbyPharmacies(latitude, longitude, medication.category) : [];
    
    // Get import regulations
    const importRegulations = getImportRegulations(medication, countryCode);
    
    // Generate recommendations and warnings
    const { recommendations, warnings } = generateMedicationGuidance(medication, countryStatus);
    
    // Get alternatives
    const alternatives = getAlternativeMedications(medication, countryCode);

    return {
      medication: {
        id: medication.id,
        name: medication.name,
        genericName: medication.genericName,
        brandNames: medication.brandNames,
        category: medication.category,
        description: medication.description,
        commonUses: medication.commonUses,
      },
      currentCountry: countryStatus,
      nearbyPharmacies,
      importRegulations,
      recommendations,
      warnings,
      alternatives,
    };
  } catch (error) {
    console.error('Error getting medication availability:', error);
    return null;
  }
};

/**
 * Get multiple medications availability for a country
 */
export const getMultipleMedicationsAvailability = async (
  medications: string[],
  country: string,
  latitude?: number,
  longitude?: number
): Promise<MedicationAvailability[]> => {
  try {
    const promises = medications.map(med => 
      getMedicationAvailability(med, country, latitude, longitude)
    );
    
    const results = await Promise.all(promises);
    return results.filter(result => result !== null) as MedicationAvailability[];
  } catch (error) {
    console.error('Error getting multiple medications availability:', error);
    return [];
  }
};

/**
 * Generate travel medication kit recommendations
 */
export const generateTravelMedicationKit = (
  country: string,
  duration: number = 7, // days
  medicalConditions: string[] = [],
  activities: string[] = []
): TravelMedicationKit => {
  const countryCode = getCountryCode(country);
  
  const essentialMedications = [
    'Pain relievers (Ibuprofen/Acetaminophen)',
    'Bandages and antiseptic',
    'Anti-diarrheal medication',
    'Oral rehydration salts',
    'Sunscreen (SPF 30+)',
    'Insect repellent',
  ];

  const recommendedMedications = [
    'Antihistamines for allergies',
    'Thermometer',
    'Hand sanitizer',
    'Motion sickness medication',
    'Basic first aid supplies',
  ];

  const prescriptionBackups = [
    'Extra supply of regular medications',
    'Prescription copies and doctor\'s letter',
    'Emergency antibiotic (if traveling to remote areas)',
  ];

  // Country-specific additions
  const countrySpecificNeeds: string[] = [];
  
  if (['TH', 'IN', 'CN', 'VN', 'ID'].includes(countryCode)) {
    countrySpecificNeeds.push('Malaria prophylaxis (consult doctor)');
    countrySpecificNeeds.push('Water purification tablets');
    countrySpecificNeeds.push('Traveler\'s diarrhea antibiotics');
  }
  
  if (['AE', 'SG', 'JP'].includes(countryCode)) {
    countrySpecificNeeds.push('Avoid controlled substances');
    countrySpecificNeeds.push('Carry prescription documentation');
    countrySpecificNeeds.push('Check import regulations before travel');
  }

  if (['US', 'CA', 'AU'].includes(countryCode)) {
    recommendedMedications.push('EpiPen (if allergic)');
    recommendedMedications.push('Altitude sickness medication');
  }

  const emergencyContacts = [
    'Embassy/Consulate contact information',
    'Travel insurance emergency line',
    'Personal physician contact',
    'Local emergency services number',
    'Pharmacy locator app/website',
  ];

  return {
    essentialMedications,
    recommendedMedications,
    prescriptionBackups,
    countrySpecificNeeds,
    emergencyContacts,
  };
};

/**
 * Find nearby pharmacies that may stock specific medication types
 */
const findNearbyPharmacies = async (
  latitude: number,
  longitude: number,
  medicationType: 'prescription' | 'over_the_counter' | 'controlled_substance' | 'restricted'
): Promise<MedicationPharmacy[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found');
      return [];
    }

    const searchTypes = medicationType === 'controlled_substance' ? 
      ['hospital', 'pharmacy'] : ['pharmacy'];
    
    const pharmacies: MedicationPharmacy[] = [];
    
    for (const type of searchTypes) {
      // First, get basic places data
      const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.PLACES_ENDPOINT}` +
        `?location=${latitude},${longitude}` +
        `&radius=5000` +
        `&type=${type}` +
        `&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data.status !== 'OK') continue;

      // For each pharmacy, get detailed information
      for (const place of data.results || []) {
        if (place.place_id) {
          const detailedPharmacy = await getDetailedPharmacyInfo(
            place.place_id, 
            medicationType, 
            latitude, 
            longitude
          );
          
          if (detailedPharmacy) {
            pharmacies.push(detailedPharmacy);
          }
        }
      }
    }

    // Remove duplicates and sort by distance
    const uniquePharmacies = removeDuplicatePharmacies(pharmacies);
    return uniquePharmacies.sort((a, b) => a.distance - b.distance).slice(0, 10);
  } catch (error) {
    console.error('Error finding nearby pharmacies:', error);
    return [];
  }
};

/**
 * Get detailed pharmacy information using Google Places Details API
 */
const getDetailedPharmacyInfo = async (
  placeId: string,
  medicationType: string,
  userLat: number,
  userLng: number
): Promise<MedicationPharmacy | null> => {
  try {
    // Get detailed place information
    const detailsUrl = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/details/json` +
      `?place_id=${placeId}` +
      `&fields=name,formatted_address,geometry,opening_hours,formatted_phone_number,website,rating,user_ratings_total,price_level,photos,types,business_status` +
      `&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(detailsUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 'OK' || !data.result) return null;

    const place = data.result;
    
    // Calculate distance
    const placeLat = place.geometry?.location?.lat || 0;
    const placeLng = place.geometry?.location?.lng || 0;
    const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
    
    // Process opening hours
    const openingHours = processOpeningHours(place.opening_hours);
    
    // Determine pharmacy type and specialties
    const pharmacyType = determinePharmacyType(place.types || [], place.name);
    const specialties = determinePharmacySpecialties(place.types || [], place.name);
    const services = determinePharmacyServices(place.types || [], place.name);
    
    // Process photos
    const photos = place.photos ? place.photos.slice(0, 3).map((photo: any) => 
      `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
    ) : [];

    const requiresPrescription = medicationType === 'prescription' || medicationType === 'controlled_substance';
    
    return {
      id: placeId,
      name: place.name || 'Unknown Pharmacy',
      address: place.formatted_address || '',
      coordinates: {
        latitude: placeLat,
        longitude: placeLng,
      },
      distance: Math.round(distance),
      isOpen: place.opening_hours?.open_now ?? false,
      hasStock: null, // Unknown without real-time inventory
      requiresPrescription,
      phoneNumber: place.formatted_phone_number,
      website: place.website,
      rating: place.rating,
      totalRatings: place.user_ratings_total,
      priceLevel: place.price_level,
      specialties,
      openingHours,
      photos,
      services,
      accessibility: determineAccessibility(place.types || []),
      paymentMethods: determinePaymentMethods(pharmacyType),
      pharmacyType,
      languages: determineLanguages(place.name, pharmacyType),
    };
  } catch (error) {
    console.error('Error getting detailed pharmacy info:', error);
    return null;
  }
};

/**
 * Process Google Places opening hours into our format
 */
const processOpeningHours = (openingHours: any): MedicationPharmacy['openingHours'] => {
  if (!openingHours) {
    return {
      weekdayText: [],
      currentStatus: 'unknown',
    };
  }

  const currentStatus = openingHours.open_now === true ? 'open' : 
                       openingHours.open_now === false ? 'closed' : 'unknown';

  // Process next open/close time
  let nextOpenClose: { time: string; day: string } | undefined;
  
  if (openingHours.periods && openingHours.periods.length > 0) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

    // Find next opening or closing time
    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const period = openingHours.periods.find((p: any) => p.open?.day === checkDay);
      
      if (period) {
        if (i === 0 && currentStatus === 'open' && period.close) {
          // Currently open, find closing time today
          const closeTime = period.close.time;
          if (parseInt(closeTime) > currentTime) {
            nextOpenClose = {
              time: formatTime(closeTime),
              day: i === 0 ? 'today' : getDayName(checkDay),
            };
            break;
          }
        } else if (currentStatus === 'closed' && period.open) {
          // Currently closed, find next opening time
          const openTime = period.open.time;
          if (i > 0 || parseInt(openTime) > currentTime) {
            nextOpenClose = {
              time: formatTime(openTime),
              day: i === 0 ? 'today' : getDayName(checkDay),
            };
            break;
          }
        }
      }
    }
  }

  return {
    weekdayText: openingHours.weekday_text || [],
    currentStatus,
    nextOpenClose,
  };
};

/**
 * Determine pharmacy type from Google Places data
 */
const determinePharmacyType = (types: string[], name: string): MedicationPharmacy['pharmacyType'] => {
  const nameUpper = name.toUpperCase();
  
  // Check for hospital/clinic
  if (types.includes('hospital') || types.includes('health')) {
    return 'hospital';
  }
  
  if (types.includes('doctor') || nameUpper.includes('CLINIC')) {
    return 'clinic';
  }
  
  // Check for supermarket
  if (types.includes('supermarket') || types.includes('grocery_or_supermarket')) {
    return 'supermarket';
  }
  
  // Check for chain pharmacies
  const chains = ['CVS', 'WALGREENS', 'RITE AID', 'WALMART', 'TARGET', 'COSTCO', 'KROGER'];
  if (chains.some(chain => nameUpper.includes(chain))) {
    return 'chain';
  }
  
  if (types.includes('pharmacy')) {
    return 'independent';
  }
  
  return 'unknown';
};

/**
 * Determine pharmacy services
 */
const determinePharmacyServices = (types: string[], name: string): string[] => {
  const services: string[] = [];
  const nameUpper = name.toUpperCase();
  
  // Basic pharmacy services
  if (types.includes('pharmacy')) {
    services.push('Prescription filling', 'Over-the-counter medications');
  }
  
  // Additional services based on type and name
  if (types.includes('health') || nameUpper.includes('HEALTH')) {
    services.push('Health screenings', 'Vaccinations');
  }
  
  if (nameUpper.includes('24') || nameUpper.includes('HOUR')) {
    services.push('24-hour service');
  }
  
  if (nameUpper.includes('COMPOUND')) {
    services.push('Compounding pharmacy');
  }
  
  if (nameUpper.includes('DRIVE') || nameUpper.includes('THRU')) {
    services.push('Drive-through service');
  }
  
  // Chain-specific services
  if (['CVS', 'WALGREENS'].some(chain => nameUpper.includes(chain))) {
    services.push('Photo services', 'MinuteClinic', 'Insurance accepted');
  }
  
  return services;
};

/**
 * Determine accessibility features
 */
const determineAccessibility = (types: string[]): string[] => {
  const accessibility: string[] = [];
  
  // Most modern pharmacies have basic accessibility
  accessibility.push('Wheelchair accessible entrance');
  
  if (types.includes('hospital') || types.includes('health')) {
    accessibility.push('Handicapped parking', 'Accessible restrooms');
  }
  
  return accessibility;
};

/**
 * Determine payment methods based on pharmacy type
 */
const determinePaymentMethods = (pharmacyType: MedicationPharmacy['pharmacyType']): string[] => {
  const methods = ['Cash', 'Credit cards', 'Debit cards'];
  
  if (pharmacyType === 'chain' || pharmacyType === 'supermarket') {
    methods.push('Insurance plans', 'FSA/HSA cards', 'Mobile payments');
  } else if (pharmacyType === 'hospital') {
    methods.push('Insurance plans', 'Hospital billing');
  } else {
    methods.push('Most insurance plans');
  }
  
  return methods;
};

/**
 * Determine languages spoken
 */
const determineLanguages = (name: string, pharmacyType: MedicationPharmacy['pharmacyType']): string[] => {
  const languages = ['English'];
  
  // Chain pharmacies often have multilingual staff
  if (pharmacyType === 'chain') {
    languages.push('Spanish', 'Multilingual staff available');
  }
  
  // Hospital pharmacies often have translator services
  if (pharmacyType === 'hospital') {
    languages.push('Translator services available');
  }
  
  return languages;
};

/**
 * Format time from HHMM to readable format
 */
const formatTime = (timeString: string): string => {
  const hours = parseInt(timeString.substring(0, 2));
  const minutes = timeString.substring(2, 4);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  return `${displayHours}:${minutes} ${ampm}`;
};

/**
 * Get day name from day number
 */
const getDayName = (dayNum: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNum] || 'Unknown';
};

/**
 * Determine pharmacy specialties based on place data
 */
const determinePharmacySpecialties = (types: string[], name: string): string[] => {
  const specialties: string[] = [];
  
  if (types.includes('hospital')) {
    specialties.push('Hospital pharmacy', 'Controlled substances', 'Prescription medications');
  }
  
  if (types.includes('pharmacy')) {
    specialties.push('Prescription medications', 'Over-the-counter drugs');
  }
  
  if (name.toLowerCase().includes('24') || name.toLowerCase().includes('hour')) {
    specialties.push('24-hour service');
  }
  
  if (name.toLowerCase().includes('compounding')) {
    specialties.push('Compounding pharmacy');
  }
  
  return specialties;
};

/**
 * Remove duplicate pharmacies based on proximity
 */
const removeDuplicatePharmacies = (pharmacies: MedicationPharmacy[]): MedicationPharmacy[] => {
  const uniquePharmacies: MedicationPharmacy[] = [];
  const minDistance = 100; // 100 meters minimum distance

  for (const pharmacy of pharmacies) {
    const isDuplicate = uniquePharmacies.some(existing => 
      calculateDistance(
        pharmacy.coordinates.latitude,
        pharmacy.coordinates.longitude,
        existing.coordinates.latitude,
        existing.coordinates.longitude
      ) < minDistance
    );

    if (!isDuplicate) {
      uniquePharmacies.push(pharmacy);
    }
  }

  return uniquePharmacies;
};

/**
 * Calculate distance between two points in meters
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

/**
 * Get country code from country name
 */
const getCountryCode = (country: string): string => {
  return COUNTRY_CODES[country] || 'UNKNOWN';
};

/**
 * Get medication status for a specific country
 */
const getCountryMedicationStatus = (
  medication: typeof MEDICATION_DATABASE[string],
  countryCode: string,
  countryName: string
): CountryMedicationStatus => {
  const restriction = medication.countryRestrictions[countryCode];
  
  if (restriction) {
    return {
      country: countryName,
      countryCode,
      availability: restriction.availability || 'unknown',
      alternativeNames: restriction.alternativeNames || [],
      localEquivalents: restriction.localEquivalents || [],
      prescriptionRequired: restriction.prescriptionRequired ?? false,
      restrictions: restriction.restrictions || [],
      notes: restriction.notes,
      pharmacyAvailability: restriction.pharmacyAvailability || 'unknown',
    };
  }

  // Default for unknown countries
  return {
    country: countryName,
    countryCode,
    availability: 'unknown',
    alternativeNames: [],
    localEquivalents: [],
    prescriptionRequired: medication.category === 'prescription' || medication.category === 'controlled_substance',
    restrictions: [],
    pharmacyAvailability: 'unknown',
  };
};

/**
 * Generate medication-specific guidance
 */
const generateMedicationGuidance = (
  medication: typeof MEDICATION_DATABASE[string],
  countryStatus: CountryMedicationStatus
): { recommendations: string[]; warnings: string[] } => {
  const recommendations: string[] = [];
  const warnings: string[] = [];

  // Availability-based guidance
  switch (countryStatus.availability) {
    case 'available':
      recommendations.push(`${medication.name} is available in ${countryStatus.country}`);
      if (!countryStatus.prescriptionRequired) {
        recommendations.push('Can be purchased over-the-counter');
      }
      break;
    case 'prescription_required':
      recommendations.push('Prescription required - bring documentation from home country');
      recommendations.push('Carry extra supply in original packaging');
      recommendations.push('Consider getting prescription from local doctor if staying long-term');
      break;
    case 'restricted':
      warnings.push('Medication has special restrictions in this country');
      recommendations.push('Contact local health authorities before travel');
      recommendations.push('Consider supervised import or local alternatives');
      break;
    case 'banned':
      warnings.push('⚠️ BANNED: This medication is prohibited in this country');
      warnings.push('Possession may result in arrest and prosecution');
      recommendations.push('Find alternative medications before travel');
      recommendations.push('Consult with doctor about substitutes');
      break;
    case 'unknown':
      recommendations.push('Availability unknown - research local regulations');
      recommendations.push('Bring extra supply and prescription documentation');
      break;
  }

  // Category-specific guidance
  if (medication.category === 'controlled_substance') {
    recommendations.push('Carry official prescription and doctor\'s letter');
    recommendations.push('Declare at customs if required');
    recommendations.push('Keep in original pharmacy packaging');
  }

  // Restriction-specific warnings
  if (countryStatus.restrictions.length > 0) {
    warnings.push('Special restrictions apply:');
    countryStatus.restrictions.forEach(restriction => {
      warnings.push(`• ${restriction}`);
    });
  }

  return { recommendations, warnings };
};

/**
 * Get alternative medications for restricted/banned drugs
 */
const getAlternativeMedications = (
  medication: typeof MEDICATION_DATABASE[string],
  countryCode: string
): AlternativeMedication[] => {
  const alternatives: AlternativeMedication[] = [];

  // Common alternatives based on medication type
  switch (medication.id) {
    case 'codeine':
      alternatives.push({
        name: 'Acetaminophen',
        activeIngredient: 'Paracetamol',
        availability: 'available',
        similarity: 'alternative_treatment',
        notes: 'Less potent but safer pain relief option'
      });
      alternatives.push({
        name: 'Ibuprofen',
        activeIngredient: 'Ibuprofen',
        availability: 'available',
        similarity: 'alternative_treatment',
        notes: 'Anti-inflammatory pain relief'
      });
      break;
    case 'lorazepam':
      alternatives.push({
        name: 'Diazepam',
        activeIngredient: 'Diazepam',
        availability: 'prescription_required',
        similarity: 'similar_effect',
        notes: 'Another benzodiazepine with similar effects'
      });
      alternatives.push({
        name: 'Hydroxyzine',
        activeIngredient: 'Hydroxyzine',
        availability: 'prescription_required',
        similarity: 'alternative_treatment',
        notes: 'Non-benzodiazepine anti-anxiety medication'
      });
      break;
    case 'pseudoephedrine':
      alternatives.push({
        name: 'Phenylephrine',
        activeIngredient: 'Phenylephrine',
        availability: 'available',
        similarity: 'similar_effect',
        notes: 'Nasal decongestant with fewer restrictions'
      });
      alternatives.push({
        name: 'Saline nasal spray',
        activeIngredient: 'Sodium chloride',
        availability: 'available',
        similarity: 'alternative_treatment',
        notes: 'Drug-free congestion relief'
      });
      break;
  }

  return alternatives;
};

/**
 * Get import regulations for a medication in a country
 */
const getImportRegulations = (
  medication: typeof MEDICATION_DATABASE[string],
  countryCode: string
): ImportRegulations => {
  // Default regulations based on medication category and country
  const regulations: ImportRegulations = {
    allowedQuantity: '90-day supply for personal use',
    declarationRequired: false,
    prescriptionRequired: false,
    restrictions: [],
    penalties: [],
    contactInfo: [],
  };

  // Controlled substances have stricter rules
  if (medication.category === 'controlled_substance') {
    regulations.declarationRequired = true;
    regulations.prescriptionRequired = true;
    regulations.allowedQuantity = '30-day supply maximum';
    regulations.restrictions.push('Must be in original packaging');
    regulations.restrictions.push('Prescription and doctor\'s letter required');
    regulations.restrictions.push('Subject to inspection');
  }

  // Country-specific adjustments
  if (['AE', 'SG', 'JP'].includes(countryCode)) {
    regulations.declarationRequired = true;
    regulations.prescriptionRequired = true;
    regulations.restrictions.push('Import permit may be required');
    regulations.penalties.push('Severe penalties for undeclared controlled substances');
    regulations.contactInfo.push('Contact customs authority before travel');
  }

  if (['US', 'AU', 'CA'].includes(countryCode)) {
    regulations.allowedQuantity = '90-day supply for personal use';
    regulations.restrictions.push('FDA/TGA labeling requirements may apply');
  }

  return regulations;
};

/**
 * Search medications by name or condition
 */
export const searchMedications = (query: string): MedicationInfo[] => {
  const searchTerm = query.toLowerCase();
  const results: MedicationInfo[] = [];

  Object.values(MEDICATION_DATABASE).forEach(med => {
    const matchesName = med.name.toLowerCase().includes(searchTerm) ||
                       med.genericName.toLowerCase().includes(searchTerm) ||
                       med.brandNames.some(brand => brand.toLowerCase().includes(searchTerm));
    
    const matchesUse = med.commonUses.some(use => use.toLowerCase().includes(searchTerm));
    
    if (matchesName || matchesUse) {
      results.push({
        id: med.id,
        name: med.name,
        genericName: med.genericName,
        brandNames: med.brandNames,
        category: med.category,
        description: med.description,
        commonUses: med.commonUses,
      });
    }
  });

  return results;
};

/**
 * Get availability status color for UI
 */
export const getAvailabilityColor = (availability: CountryMedicationStatus['availability']): string => {
  switch (availability) {
    case 'available':
      return '#30D158'; // Green
    case 'prescription_required':
      return '#FF9500'; // Orange
    case 'restricted':
      return '#FF5722'; // Red-orange
    case 'banned':
      return '#FF3B30'; // Red
    case 'unknown':
    default:
      return '#666666'; // Gray
  }
};

/**
 * Format medication availability status for display
 */
export const formatAvailabilityStatus = (status: CountryMedicationStatus): string => {
  switch (status.availability) {
    case 'available':
      return status.prescriptionRequired ? 'Available (Prescription)' : 'Available (OTC)';
    case 'prescription_required':
      return 'Prescription Required';
    case 'restricted':
      return 'Restricted Access';
    case 'banned':
      return 'Banned/Prohibited';
    case 'unknown':
    default:
      return 'Availability Unknown';
  }
}; 