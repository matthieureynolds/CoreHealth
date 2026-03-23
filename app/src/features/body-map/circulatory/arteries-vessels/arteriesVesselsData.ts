import { CirculationZone } from '../types';
import { arteriesVesselsBiomarkers } from './index';

export const arteriesVesselsZone: CirculationZone = {
  id: 'arteries_vessels_blood',
  name: 'Arteries/Vessels & Blood',
  position: { x: 50, y: 54 },
  size: { width: 140, height: 80 },
  biomarkers: arteriesVesselsBiomarkers.map(b => b.name),
  healthScore: 88,
  description: 'Vascular health, clotting factors, and blood composition',
  icon: 'pulse',
};
