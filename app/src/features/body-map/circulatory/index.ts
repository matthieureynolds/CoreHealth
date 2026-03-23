export { heartCirculatoryZone } from './heart/heartCirculatoryData';
export { oxygenationZone } from './oxygenation/oxygenationData';
export { arteriesVesselsZone } from './arteries-vessels/arteriesVesselsData';
export * from './types';

import { heartCirculatoryZone } from './heart/heartCirculatoryData';
import { oxygenationZone } from './oxygenation/oxygenationData';
import { arteriesVesselsZone } from './arteries-vessels/arteriesVesselsData';
import { CirculationZone } from './types';

export const circulationZones: CirculationZone[] = [
  heartCirculatoryZone,
  oxygenationZone,
  arteriesVesselsZone,
];
