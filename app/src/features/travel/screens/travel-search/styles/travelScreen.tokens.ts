/**
 * Shared travel UI tokens — repeated literals from TravelScreen styles live here
 * so new code can reference one place. Existing style files can adopt gradually.
 */
export const travelUi = {
  colors: {
    bg: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    border: '#3A3A3C',
    borderHairline: '#2C2C2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textMuted: '#EBEBF5',
    accent: '#007AFF',
    accentSoft: '#007AFF20',
    overlay: 'rgba(0,0,0,0.7)',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    sheet: 24,
  },
} as const;
