export { calcium } from './calcium/calciumData';
export { chloride } from './chloride/chlorideData';
export { magnesium } from './magnesium/magnesiumData';
export { phosphorus } from './phosphorus/phosphorusData';
export { potassium } from './potassium/potassiumData';
export { sodium } from './sodium/sodiumData';
export { sulfur } from './sulfur/sulfurData';

import { calcium } from './calcium/calciumData';
import { chloride } from './chloride/chlorideData';
import { magnesium } from './magnesium/magnesiumData';
import { phosphorus } from './phosphorus/phosphorusData';
import { potassium } from './potassium/potassiumData';
import { sodium } from './sodium/sodiumData';
import { sulfur } from './sulfur/sulfurData';
import { NutritionItem } from '../types';

export const majorMinerals: NutritionItem[] = [
  calcium,
  chloride,
  magnesium,
  phosphorus,
  potassium,
  sodium,
  sulfur,
];
