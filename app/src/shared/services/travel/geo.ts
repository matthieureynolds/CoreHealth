/**
 * Great-circle distance helpers.
 *
 * The haversine formula was implemented five separate times across the travel
 * service layer — healthcarePlaces, healthcarePlacesEnhanced, locationService,
 * pharmacyHelpers and waterStationService — all mathematically identical but
 * each with its own variable names and radius literal. Every "how far is this
 * facility" figure in the app came from one of those copies.
 */

const EARTH_RADIUS_M = 6371e3;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

/** Distance between two coordinates, in metres. */
export function distanceInMetres(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
