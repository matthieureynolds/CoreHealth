import {
  MedicationInfo,
  CountryMedicationStatus,
  MedicationAvailability,
  ImportRegulations,
  AlternativeMedication,
  TravelMedicationKit,
} from "../../types";
import { MEDICATION_DATABASE, COUNTRY_CODES } from "./medicationData";
import { findNearbyPharmacies as fetchNearbyPharmacies } from "./pharmacyHelpers";
import { logger } from "../../utils/logger";

/**
 * Get medication availability for a specific medication in a country
 */
export const getMedicationAvailability = async (
  medicationName: string,
  country: string,
  latitude?: number,
  longitude?: number,
): Promise<MedicationAvailability | null> => {
  try {
    const medicationId = medicationName.toLowerCase().replace(/\s+/g, "");
    const medication = MEDICATION_DATABASE[medicationId];

    if (!medication) {
      logger.warn(`Medication ${medicationName} not found in database`);
      return null;
    }

    const countryCode = getCountryCode(country);
    const countryStatus = getCountryMedicationStatus(
      medication,
      countryCode,
      country,
    );

    // Find nearby pharmacies if coordinates provided
    const nearbyPharmacies =
      latitude && longitude
        ? await fetchNearbyPharmacies(latitude, longitude, medication.category)
        : [];

    // Get import regulations
    const importRegulations = getImportRegulations(medication, countryCode);

    // Generate recommendations and warnings
    const { recommendations, warnings } = generateMedicationGuidance(
      medication,
      countryStatus,
    );

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
    logger.error("Error getting medication availability:", error);
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
  longitude?: number,
): Promise<MedicationAvailability[]> => {
  try {
    const promises = medications.map((med) =>
      getMedicationAvailability(med, country, latitude, longitude),
    );

    const results = await Promise.all(promises);
    return results.filter(
      (result) => result !== null,
    ) as MedicationAvailability[];
  } catch (error) {
    logger.error("Error getting multiple medications availability:", error);
    return [];
  }
};

/**
 * Generate travel medication kit recommendations
 */
export const generateTravelMedicationKit = (
  country: string,
  _duration: number = 7, // days
  _medicalConditions: string[] = [],
  _activities: string[] = [],
): TravelMedicationKit => {
  const countryCode = getCountryCode(country);

  const essentialMedications = [
    "Pain relievers (Ibuprofen/Acetaminophen)",
    "Bandages and antiseptic",
    "Anti-diarrheal medication",
    "Oral rehydration salts",
    "Sunscreen (SPF 30+)",
    "Insect repellent",
  ];

  const recommendedMedications = [
    "Antihistamines for allergies",
    "Thermometer",
    "Hand sanitizer",
    "Motion sickness medication",
    "Basic first aid supplies",
  ];

  const prescriptionBackups = [
    "Extra supply of regular medications",
    "Prescription copies and doctor's letter",
    "Emergency antibiotic (if traveling to remote areas)",
  ];

  // Country-specific additions
  const countrySpecificNeeds: string[] = [];

  if (["TH", "IN", "CN", "VN", "ID"].includes(countryCode)) {
    countrySpecificNeeds.push("Malaria prophylaxis (consult doctor)");
    countrySpecificNeeds.push("Water purification tablets");
    countrySpecificNeeds.push("Traveler's diarrhea antibiotics");
  }

  if (["AE", "SG", "JP"].includes(countryCode)) {
    countrySpecificNeeds.push("Avoid controlled substances");
    countrySpecificNeeds.push("Carry prescription documentation");
    countrySpecificNeeds.push("Check import regulations before travel");
  }

  if (["US", "CA", "AU"].includes(countryCode)) {
    recommendedMedications.push("EpiPen (if allergic)");
    recommendedMedications.push("Altitude sickness medication");
  }

  const emergencyContacts = [
    "Embassy/Consulate contact information",
    "Travel insurance emergency line",
    "Personal physician contact",
    "Local emergency services number",
    "Pharmacy locator app/website",
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
 * Get country code from country name
 */
const getCountryCode = (country: string): string => {
  return COUNTRY_CODES[country] || "UNKNOWN";
};

/**
 * Get medication status for a specific country
 */
const getCountryMedicationStatus = (
  medication: (typeof MEDICATION_DATABASE)[string],
  countryCode: string,
  countryName: string,
): CountryMedicationStatus => {
  const restriction = medication.countryRestrictions[countryCode];

  if (restriction) {
    return {
      country: countryName,
      countryCode,
      availability: restriction.availability || "unknown",
      alternativeNames: restriction.alternativeNames || [],
      localEquivalents: restriction.localEquivalents || [],
      prescriptionRequired: restriction.prescriptionRequired ?? false,
      restrictions: restriction.restrictions || [],
      notes: restriction.notes,
      pharmacyAvailability: restriction.pharmacyAvailability || "unknown",
    };
  }

  // Default for unknown countries
  return {
    country: countryName,
    countryCode,
    availability: "unknown",
    alternativeNames: [],
    localEquivalents: [],
    prescriptionRequired:
      medication.category === "prescription" ||
      medication.category === "controlled_substance",
    restrictions: [],
    pharmacyAvailability: "unknown",
  };
};

/**
 * Generate medication-specific guidance
 */
const generateMedicationGuidance = (
  medication: (typeof MEDICATION_DATABASE)[string],
  countryStatus: CountryMedicationStatus,
): { recommendations: string[]; warnings: string[] } => {
  const recommendations: string[] = [];
  const warnings: string[] = [];

  // Availability-based guidance
  switch (countryStatus.availability) {
    case "available":
      recommendations.push(
        `${medication.name} is available in ${countryStatus.country}`,
      );
      if (!countryStatus.prescriptionRequired) {
        recommendations.push("Can be purchased over-the-counter");
      }
      break;
    case "prescription_required":
      recommendations.push(
        "Prescription required - bring documentation from home country",
      );
      recommendations.push("Carry extra supply in original packaging");
      recommendations.push(
        "Consider getting prescription from local doctor if staying long-term",
      );
      break;
    case "restricted":
      warnings.push("Medication has special restrictions in this country");
      recommendations.push("Contact local health authorities before travel");
      recommendations.push("Consider supervised import or local alternatives");
      break;
    case "banned":
      warnings.push("⚠️ BANNED: This medication is prohibited in this country");
      warnings.push("Possession may result in arrest and prosecution");
      recommendations.push("Find alternative medications before travel");
      recommendations.push("Consult with doctor about substitutes");
      break;
    case "unknown":
      recommendations.push("Availability unknown - research local regulations");
      recommendations.push("Bring extra supply and prescription documentation");
      break;
  }

  // Category-specific guidance
  if (medication.category === "controlled_substance") {
    recommendations.push("Carry official prescription and doctor's letter");
    recommendations.push("Declare at customs if required");
    recommendations.push("Keep in original pharmacy packaging");
  }

  // Restriction-specific warnings
  if (countryStatus.restrictions.length > 0) {
    warnings.push("Special restrictions apply:");
    countryStatus.restrictions.forEach((restriction) => {
      warnings.push(`• ${restriction}`);
    });
  }

  return { recommendations, warnings };
};

/**
 * Get alternative medications for restricted/banned drugs
 */
const getAlternativeMedications = (
  medication: (typeof MEDICATION_DATABASE)[string],
  _countryCode: string,
): AlternativeMedication[] => {
  const alternatives: AlternativeMedication[] = [];

  // Common alternatives based on medication type
  switch (medication.id) {
    case "codeine":
      alternatives.push({
        name: "Acetaminophen",
        activeIngredient: "Paracetamol",
        availability: "available",
        similarity: "alternative_treatment",
        notes: "Less potent but safer pain relief option",
      });
      alternatives.push({
        name: "Ibuprofen",
        activeIngredient: "Ibuprofen",
        availability: "available",
        similarity: "alternative_treatment",
        notes: "Anti-inflammatory pain relief",
      });
      break;
    case "lorazepam":
      alternatives.push({
        name: "Diazepam",
        activeIngredient: "Diazepam",
        availability: "prescription_required",
        similarity: "similar_effect",
        notes: "Another benzodiazepine with similar effects",
      });
      alternatives.push({
        name: "Hydroxyzine",
        activeIngredient: "Hydroxyzine",
        availability: "prescription_required",
        similarity: "alternative_treatment",
        notes: "Non-benzodiazepine anti-anxiety medication",
      });
      break;
    case "pseudoephedrine":
      alternatives.push({
        name: "Phenylephrine",
        activeIngredient: "Phenylephrine",
        availability: "available",
        similarity: "similar_effect",
        notes: "Nasal decongestant with fewer restrictions",
      });
      alternatives.push({
        name: "Saline nasal spray",
        activeIngredient: "Sodium chloride",
        availability: "available",
        similarity: "alternative_treatment",
        notes: "Drug-free congestion relief",
      });
      break;
  }

  return alternatives;
};

/**
 * Get import regulations for a medication in a country
 */
const getImportRegulations = (
  medication: (typeof MEDICATION_DATABASE)[string],
  countryCode: string,
): ImportRegulations => {
  // Default regulations based on medication category and country
  const regulations: ImportRegulations = {
    allowedQuantity: "90-day supply for personal use",
    declarationRequired: false,
    prescriptionRequired: false,
    restrictions: [],
    penalties: [],
    contactInfo: [],
  };

  // Controlled substances have stricter rules
  if (medication.category === "controlled_substance") {
    regulations.declarationRequired = true;
    regulations.prescriptionRequired = true;
    regulations.allowedQuantity = "30-day supply maximum";
    regulations.restrictions.push("Must be in original packaging");
    regulations.restrictions.push("Prescription and doctor's letter required");
    regulations.restrictions.push("Subject to inspection");
  }

  // Country-specific adjustments
  if (["AE", "SG", "JP"].includes(countryCode)) {
    regulations.declarationRequired = true;
    regulations.prescriptionRequired = true;
    regulations.restrictions.push("Import permit may be required");
    regulations.penalties.push(
      "Severe penalties for undeclared controlled substances",
    );
    regulations.contactInfo.push("Contact customs authority before travel");
  }

  if (["US", "AU", "CA"].includes(countryCode)) {
    regulations.allowedQuantity = "90-day supply for personal use";
    regulations.restrictions.push("FDA/TGA labeling requirements may apply");
  }

  return regulations;
};

/**
 * Search medications by name or condition
 */
export const searchMedications = (query: string): MedicationInfo[] => {
  const searchTerm = query.toLowerCase();
  const results: MedicationInfo[] = [];

  Object.values(MEDICATION_DATABASE).forEach((med) => {
    const matchesName =
      med.name.toLowerCase().includes(searchTerm) ||
      med.genericName.toLowerCase().includes(searchTerm) ||
      med.brandNames.some((brand) => brand.toLowerCase().includes(searchTerm));

    const matchesUse = med.commonUses.some((use) =>
      use.toLowerCase().includes(searchTerm),
    );

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
export const getAvailabilityColor = (
  availability: CountryMedicationStatus["availability"],
): string => {
  switch (availability) {
    case "available":
      return "#30D158"; // Green
    case "prescription_required":
      return "#FF9500"; // Orange
    case "restricted":
      return "#FF5722"; // Red-orange
    case "banned":
      return "#FF3B30"; // Red
    case "unknown":
    default:
      return "#666666"; // Gray
  }
};

/**
 * Format medication availability status for display
 */
export const formatAvailabilityStatus = (
  status: CountryMedicationStatus,
): string => {
  switch (status.availability) {
    case "available":
      return status.prescriptionRequired
        ? "Available (Prescription)"
        : "Available (OTC)";
    case "prescription_required":
      return "Prescription Required";
    case "restricted":
      return "Restricted Access";
    case "banned":
      return "Banned/Prohibited";
    case "unknown":
    default:
      return "Availability Unknown";
  }
};
