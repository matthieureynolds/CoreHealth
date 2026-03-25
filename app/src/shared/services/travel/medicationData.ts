import { MedicationInfo, CountryMedicationStatus } from '../../types';

// Common medications database with country restrictions
export const MEDICATION_DATABASE: Record<string, MedicationInfo & { countryRestrictions: Record<string, Partial<CountryMedicationStatus>> }> = {
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
export const COUNTRY_CODES: Record<string, string> = {
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
