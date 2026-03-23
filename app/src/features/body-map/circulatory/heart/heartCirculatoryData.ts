import { CirculationZone } from '../types';
import { heartBiomarkers } from './index';

export const heartCirculatoryZone: CirculationZone = {
  id: 'heart',
  name: 'Heart',
  position: { x: 50, y: 30 },
  size: { width: 120, height: 100 },
  biomarkers: heartBiomarkers.map(b => b.name),
  healthScore: 92,
  description: 'Core cardiac function, rhythm, and cardiovascular fitness',
  icon: 'heart',
};
