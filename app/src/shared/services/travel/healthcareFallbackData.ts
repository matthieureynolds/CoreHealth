import { distanceInMetres as calculateDistance } from "./geo";
import type { HealthcareFacility } from "./healthcareTypes";

/**
 * Hand-maintained facility data for major cities, used when both Google Places
 * and OpenStreetMap come back empty.
 *
 * A table rather than logic — it lived inside the service and made that file
 * the largest in the service layer.
 */
export const getStaticHealthcareData = (
  cityName: string,
  latitude: number,
  longitude: number,
): HealthcareFacility[] => {
  const city = cityName.toLowerCase();
  const facilities: HealthcareFacility[] = [];

  /** Shape of the hand-maintained fallback entries below. */
  type StaticFacility = {
    name: string;
    lat: number;
    lon: number;
    phone?: string;
  };
  // Major city healthcare data
  const staticData: Record<
    string,
    { hospitals: StaticFacility[]; pharmacies: StaticFacility[] }
  > = {
    london: {
      hospitals: [
        {
          name: "Guy's Hospital",
          lat: 51.5038,
          lon: -0.0875,
          phone: "+44 20 7188 7188",
        },
        {
          name: "St Thomas' Hospital",
          lat: 51.499,
          lon: -0.1193,
          phone: "+44 20 7188 7188",
        },
        {
          name: "University College Hospital",
          lat: 51.5249,
          lon: -0.1342,
          phone: "+44 20 3456 7890",
        },
      ],
      pharmacies: [
        {
          name: "Boots Pharmacy",
          lat: 51.5074,
          lon: -0.1278,
          phone: "+44 20 7946 0958",
        },
        {
          name: "Lloyds Pharmacy",
          lat: 51.5154,
          lon: -0.0922,
          phone: "+44 20 7242 1010",
        },
        {
          name: "Superdrug Pharmacy",
          lat: 51.5085,
          lon: -0.1257,
          phone: "+44 20 7747 8000",
        },
      ],
    },
    paris: {
      hospitals: [
        {
          name: "Hôpital de la Pitié-Salpêtrière",
          lat: 48.8389,
          lon: 2.3589,
          phone: "+33 1 42 16 00 00",
        },
        {
          name: "Hôpital Saint-Antoine",
          lat: 48.8489,
          lon: 2.3889,
          phone: "+33 1 49 28 20 00",
        },
        {
          name: "Hôpital Necker",
          lat: 48.8389,
          lon: 2.3389,
          phone: "+33 1 44 49 40 00",
        },
      ],
      pharmacies: [
        {
          name: "Pharmacie de la Bastille",
          lat: 48.8534,
          lon: 2.3686,
          phone: "+33 1 43 71 85 85",
        },
        {
          name: "Pharmacie du Marais",
          lat: 48.8566,
          lon: 2.3522,
          phone: "+33 1 42 77 20 00",
        },
        {
          name: "Pharmacie des Halles",
          lat: 48.862,
          lon: 2.3469,
          phone: "+33 1 42 36 85 00",
        },
      ],
    },
    "new york": {
      hospitals: [
        {
          name: "Bellevue Hospital",
          lat: 40.7411,
          lon: -73.9897,
          phone: "+1 212-562-4141",
        },
        {
          name: "Mount Sinai Hospital",
          lat: 40.787,
          lon: -73.9518,
          phone: "+1 212-241-6500",
        },
        {
          name: "NYU Langone Health",
          lat: 40.7431,
          lon: -73.9762,
          phone: "+1 212-263-7300",
        },
      ],
      pharmacies: [
        {
          name: "CVS Pharmacy",
          lat: 40.7589,
          lon: -73.9851,
          phone: "+1 212-247-4218",
        },
        {
          name: "Walgreens Pharmacy",
          lat: 40.7505,
          lon: -73.9934,
          phone: "+1 212-695-9080",
        },
        {
          name: "Duane Reade Pharmacy",
          lat: 40.7614,
          lon: -73.9776,
          phone: "+1 212-247-4218",
        },
      ],
    },
    haslemere: {
      hospitals: [
        {
          name: "Royal Surrey County Hospital",
          lat: 51.2351,
          lon: -0.5847,
          phone: "+44 1483 571122",
        },
        {
          name: "St Peter's Hospital",
          lat: 51.3597,
          lon: -0.4767,
          phone: "+44 1932 872000",
        },
        {
          name: "Frimley Park Hospital",
          lat: 51.2976,
          lon: -0.7359,
          phone: "+44 1276 604604",
        },
      ],
      pharmacies: [
        {
          name: "Boots Pharmacy Haslemere",
          lat: 51.0888,
          lon: -0.7123,
          phone: "+44 1428 642511",
        },
        {
          name: "Lloyds Pharmacy Haslemere",
          lat: 51.089,
          lon: -0.7115,
          phone: "+44 1428 643322",
        },
        {
          name: "Haslemere Pharmacy",
          lat: 51.0885,
          lon: -0.712,
          phone: "+44 1428 642100",
        },
      ],
    },
    milan: {
      hospitals: [
        {
          name: "Ospedale Maggiore Policlinico",
          lat: 45.4789,
          lon: 9.1817,
          phone: "+39 02 5503 1",
        },
        {
          name: "Istituto Clinico Humanitas",
          lat: 45.5071,
          lon: 9.2677,
          phone: "+39 02 8224 1",
        },
        {
          name: "San Raffaele Hospital",
          lat: 45.4945,
          lon: 9.2408,
          phone: "+39 02 2643 1",
        },
      ],
      pharmacies: [
        {
          name: "Farmacia Centrale Milano",
          lat: 45.4654,
          lon: 9.1859,
          phone: "+39 02 8646 1234",
        },
        {
          name: "Farmacia Duomo",
          lat: 45.4642,
          lon: 9.19,
          phone: "+39 02 8646 5678",
        },
        {
          name: "Farmacia Brera",
          lat: 45.4719,
          lon: 9.1878,
          phone: "+39 02 8646 9012",
        },
      ],
    },
  };

  // Find matching city data
  for (const [cityKey, data] of Object.entries(staticData)) {
    if (city.includes(cityKey) || cityKey.includes(city)) {
      // Add hospitals
      data.hospitals.forEach((hospital) => {
        facilities.push({
          id: `static_hospital_${hospital.name.replace(/\s+/g, "_")}`,
          name: hospital.name,
          type: "hospital",
          address: `${cityName}, UK`,
          distance: calculateDistance(
            latitude,
            longitude,
            hospital.lat,
            hospital.lon,
          ),
          coordinates: { latitude: hospital.lat, longitude: hospital.lon },
          phone: hospital.phone,
          rating: 4.2,
          isEmergency: true,
        });
      });

      // Add pharmacies
      data.pharmacies.forEach((pharmacy) => {
        facilities.push({
          id: `static_pharmacy_${pharmacy.name.replace(/\s+/g, "_")}`,
          name: pharmacy.name,
          type: "pharmacy",
          address: `${cityName}, UK`,
          distance: calculateDistance(
            latitude,
            longitude,
            pharmacy.lat,
            pharmacy.lon,
          ),
          coordinates: { latitude: pharmacy.lat, longitude: pharmacy.lon },
          phone: pharmacy.phone,
          rating: 4.0,
          isEmergency: false,
        });
      });

      break;
    }
  }

  return facilities.sort((a, b) => a.distance - b.distance);
};

/**
 * Get the two closest medical facilities (hospital and pharmacy)
 */
