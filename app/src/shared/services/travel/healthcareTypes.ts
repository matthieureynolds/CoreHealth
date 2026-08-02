/**
 * Shared shape for a healthcare facility.
 *
 * In its own module because both the service and its static fallback table
 * need it — importing the type from the service made the two files circular.
 */
export interface HealthcareFacility {
  id: string;
  name: string;
  type: "hospital" | "pharmacy" | "clinic" | "dentist";
  address: string;
  distance: number; // in meters
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  openingHours?: string[];
  rating?: number;
  isEmergency?: boolean;
}
