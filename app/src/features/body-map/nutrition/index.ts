export { vitamins } from './vitamins';
export { majorMinerals } from './major-minerals';
export { traceMinerals } from './trace-minerals';
export * from './types';

import { vitamins } from './vitamins';
import { majorMinerals } from './major-minerals';
import { traceMinerals } from './trace-minerals';
import { NutritionItem } from './types';

export const allNutritionData: NutritionItem[] = [
  ...vitamins,
  ...majorMinerals,
  ...traceMinerals,
];
