import { API_CONFIG } from "../../config/api";
import { MedicationPharmacy } from "../../types";

export const processOpeningHours = (
  openingHours: any,
): MedicationPharmacy["openingHours"] => {
  if (!openingHours) {
    return { weekdayText: [], currentStatus: "unknown" };
  }

  const currentStatus =
    openingHours.open_now === true
      ? "open"
      : openingHours.open_now === false
        ? "closed"
        : "unknown";

  let nextOpenClose: { time: string; day: string } | undefined;

  if (openingHours.periods && openingHours.periods.length > 0) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const period = openingHours.periods.find(
        (p: any) => p.open?.day === checkDay,
      );

      if (period) {
        if (i === 0 && currentStatus === "open" && period.close) {
          const closeTime = period.close.time;
          if (parseInt(closeTime) > currentTime) {
            nextOpenClose = {
              time: formatTime(closeTime),
              day: i === 0 ? "today" : getDayName(checkDay),
            };
            break;
          }
        } else if (currentStatus === "closed" && period.open) {
          const openTime = period.open.time;
          if (i > 0 || parseInt(openTime) > currentTime) {
            nextOpenClose = {
              time: formatTime(openTime),
              day: i === 0 ? "today" : getDayName(checkDay),
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

export const determinePharmacyType = (
  types: string[],
  name: string,
): MedicationPharmacy["pharmacyType"] => {
  const nameUpper = name.toUpperCase();
  if (types.includes("hospital") || types.includes("health")) return "hospital";
  if (types.includes("doctor") || nameUpper.includes("CLINIC")) return "clinic";
  if (types.includes("supermarket") || types.includes("grocery_or_supermarket"))
    return "supermarket";
  const chains = [
    "CVS",
    "WALGREENS",
    "RITE AID",
    "WALMART",
    "TARGET",
    "COSTCO",
    "KROGER",
  ];
  if (chains.some((chain) => nameUpper.includes(chain))) return "chain";
  if (types.includes("pharmacy")) return "independent";
  return "unknown";
};

export const determinePharmacyServices = (
  types: string[],
  name: string,
): string[] => {
  const services: string[] = [];
  const nameUpper = name.toUpperCase();
  if (types.includes("pharmacy"))
    services.push("Prescription filling", "Over-the-counter medications");
  if (types.includes("health") || nameUpper.includes("HEALTH"))
    services.push("Health screenings", "Vaccinations");
  if (nameUpper.includes("24") || nameUpper.includes("HOUR"))
    services.push("24-hour service");
  if (nameUpper.includes("COMPOUND")) services.push("Compounding pharmacy");
  if (nameUpper.includes("DRIVE") || nameUpper.includes("THRU"))
    services.push("Drive-through service");
  if (["CVS", "WALGREENS"].some((chain) => nameUpper.includes(chain)))
    services.push("Photo services", "MinuteClinic", "Insurance accepted");
  return services;
};

export const determineAccessibility = (types: string[]): string[] => {
  const accessibility = ["Wheelchair accessible entrance"];
  if (types.includes("hospital") || types.includes("health"))
    accessibility.push("Handicapped parking", "Accessible restrooms");
  return accessibility;
};

export const determinePaymentMethods = (
  pharmacyType: MedicationPharmacy["pharmacyType"],
): string[] => {
  const methods = ["Cash", "Credit cards", "Debit cards"];
  if (pharmacyType === "chain" || pharmacyType === "supermarket")
    methods.push("Insurance plans", "FSA/HSA cards", "Mobile payments");
  else if (pharmacyType === "hospital")
    methods.push("Insurance plans", "Hospital billing");
  else methods.push("Most insurance plans");
  return methods;
};

export const determineLanguages = (
  name: string,
  pharmacyType: MedicationPharmacy["pharmacyType"],
): string[] => {
  const languages = ["English"];
  if (pharmacyType === "chain")
    languages.push("Spanish", "Multilingual staff available");
  if (pharmacyType === "hospital")
    languages.push("Translator services available");
  return languages;
};

export const determinePharmacySpecialties = (
  types: string[],
  name: string,
): string[] => {
  const specialties: string[] = [];
  if (types.includes("hospital"))
    specialties.push(
      "Hospital pharmacy",
      "Controlled substances",
      "Prescription medications",
    );
  if (types.includes("pharmacy"))
    specialties.push("Prescription medications", "Over-the-counter drugs");
  if (name.toLowerCase().includes("24") || name.toLowerCase().includes("hour"))
    specialties.push("24-hour service");
  if (name.toLowerCase().includes("compounding"))
    specialties.push("Compounding pharmacy");
  return specialties;
};

export const removeDuplicatePharmacies = (
  pharmacies: MedicationPharmacy[],
): MedicationPharmacy[] => {
  const uniquePharmacies: MedicationPharmacy[] = [];
  for (const pharmacy of pharmacies) {
    const isDuplicate = uniquePharmacies.some(
      (existing) =>
        calculateDistance(
          pharmacy.coordinates.latitude,
          pharmacy.coordinates.longitude,
          existing.coordinates.latitude,
          existing.coordinates.longitude,
        ) < 100,
    );
    if (!isDuplicate) uniquePharmacies.push(pharmacy);
  }
  return uniquePharmacies;
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatTime = (timeString: string): string => {
  const hours = parseInt(timeString.substring(0, 2));
  const minutes = timeString.substring(2, 4);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes} ${ampm}`;
};

const getDayName = (dayNum: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNum] || "Unknown";
};

export const getDetailedPharmacyInfo = async (
  placeId: string,
  medicationType: string,
  userLat: number,
  userLng: number,
): Promise<MedicationPharmacy | null> => {
  try {
    const detailsUrl =
      `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/details/json` +
      `?place_id=${placeId}` +
      `&fields=name,formatted_address,geometry,opening_hours,formatted_phone_number,website,rating,user_ratings_total,price_level,photos,types,business_status` +
      `&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(detailsUrl);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== "OK" || !data.result) return null;

    const place = data.result;
    const placeLat = place.geometry?.location?.lat || 0;
    const placeLng = place.geometry?.location?.lng || 0;
    const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
    const openingHours = processOpeningHours(place.opening_hours);
    const pharmacyType = determinePharmacyType(place.types || [], place.name);
    const specialties = determinePharmacySpecialties(
      place.types || [],
      place.name,
    );
    const services = determinePharmacyServices(place.types || [], place.name);
    const photos = place.photos
      ? place.photos
          .slice(0, 3)
          .map(
            (photo: any) =>
              `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`,
          )
      : [];
    const requiresPrescription =
      medicationType === "prescription" ||
      medicationType === "controlled_substance";

    return {
      id: placeId,
      name: place.name || "Unknown Pharmacy",
      address: place.formatted_address || "",
      coordinates: { latitude: placeLat, longitude: placeLng },
      distance: Math.round(distance),
      isOpen: place.opening_hours?.open_now ?? false,
      hasStock: null,
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
    console.error("Error getting detailed pharmacy info:", error);
    return null;
  }
};

export const findNearbyPharmacies = async (
  latitude: number,
  longitude: number,
  medicationType:
    | "prescription"
    | "over_the_counter"
    | "controlled_substance"
    | "restricted",
): Promise<MedicationPharmacy[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not found");
      return [];
    }
    const searchTypes =
      medicationType === "controlled_substance"
        ? ["hospital", "pharmacy"]
        : ["pharmacy"];
    const pharmacies: MedicationPharmacy[] = [];

    for (const type of searchTypes) {
      const url =
        `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.PLACES_ENDPOINT}` +
        `?location=${latitude},${longitude}&radius=5000&type=${type}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      if (data.status !== "OK") continue;

      for (const place of data.results || []) {
        if (place.place_id) {
          const detailedPharmacy = await getDetailedPharmacyInfo(
            place.place_id,
            medicationType,
            latitude,
            longitude,
          );
          if (detailedPharmacy) pharmacies.push(detailedPharmacy);
        }
      }
    }

    const uniquePharmacies = removeDuplicatePharmacies(pharmacies);
    return uniquePharmacies
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  } catch (error) {
    console.error("Error finding nearby pharmacies:", error);
    return [];
  }
};
