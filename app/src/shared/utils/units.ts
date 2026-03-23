export type UnitSystem = 'metric' | 'imperial';

export const metersToDisplay = (meters: number, units: UnitSystem): string => {
  if (units === 'imperial') {
    const feet = meters * 3.28084;
    if (feet < 1000) return `${Math.round(feet)} ft`;
    const miles = meters / 1609.344;
    return `${miles.toFixed(1)} mi`;
  }
  // metric
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const temperatureToDisplay = (celsius: number, units: UnitSystem): string => {
  if (units === 'imperial') {
    const f = celsius * 9 / 5 + 32;
    return `${Math.round(f)} °F`;
  }
  return `${Math.round(celsius)} °C`;
};

export const weightToDisplay = (kg: number, units: UnitSystem): string => {
  if (units === 'imperial') {
    const lb = kg * 2.20462;
    return `${Math.round(lb)} lbs`;
  }
  return `${Math.round(kg)} kg`;
};

export const heightToDisplay = (cm: number, units: UnitSystem): string => {
  if (units === 'imperial') {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(cm)} cm`;
};

/**
 * Convert a human-readable distance like "0.4 mi" or "1.2 km" to the user's units.
 * Falls back to the original string if parsing fails.
 */
export const convertDistanceLabel = (label: string, units: UnitSystem): string => {
  try {
    const match = label.trim().match(/([0-9]+(?:\.[0-9]+)?)\s*(mi|km|m|ft)/i);
    if (!match) return label;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    let meters: number;
    switch (unit) {
      case 'mi': meters = value * 1609.344; break;
      case 'km': meters = value * 1000; break;
      case 'm': meters = value; break;
      case 'ft': meters = value / 3.28084; break;
      default: return label;
    }
    return metersToDisplay(meters, units);
  } catch {
    return label;
  }
};


