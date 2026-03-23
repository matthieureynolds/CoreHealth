import { StyleSheet } from 'react-native';

/**
 * Shared styles for travel health metric info screens
 * (AirQuality, Altitude, DiseaseOutbreak, FoodSafety, Pollen, UVIndex, WaterSafety).
 * Each screen imports this and adds only its accent-specific heroCard / heroIcon overrides.
 */
export const metricScreenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 32.2,
    paddingBottom: 8,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  heroDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 12 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  rowText: { flex: 1, fontSize: 14, color: '#E5E5EA', marginLeft: 10, lineHeight: 20 },
});
