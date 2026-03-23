// Head
import { brainOrgan } from './head/brain/brainData';
import { eyesOrgan } from './head/eyes/eyesData';
import { earsOrgan } from './head/ears/earsData';
import { mouthOrgan } from './head/mouth/mouthData';
import { thyroidOrgan } from './head/thyroid/thyroidData';

// Lungs
import { lungsOrgan } from './lungs/lungsData';

// Heart
import { heartOrgan } from './heart/heartData';

// Liver
import { liverOrgan } from './liver/liverData';

// Stomach & Pancreas
import { stomachOrgan } from './stomach/stomachData';
import { pancreasOrgan } from './stomach/pancreas/pancreasData';

// Kidney
import { kidneysOrgan } from './kidneys/kidneysData';

// Intestines
import { smallIntestineOrgan } from './small-intestine/smallIntestineData';
import { largeIntestineOrgan } from './large-intestine/largeIntestineData';

import { Organ } from './types';

export const organs: Record<string, Organ> = {
  [brainOrgan.id]: brainOrgan,
  [eyesOrgan.id]: eyesOrgan,
  [earsOrgan.id]: earsOrgan,
  [mouthOrgan.id]: mouthOrgan,
  [thyroidOrgan.id]: thyroidOrgan,
  [lungsOrgan.id]: lungsOrgan,
  [heartOrgan.id]: heartOrgan,
  [liverOrgan.id]: liverOrgan,
  [stomachOrgan.id]: stomachOrgan,
  [pancreasOrgan.id]: pancreasOrgan,
  [kidneysOrgan.id]: kidneysOrgan,
  [smallIntestineOrgan.id]: smallIntestineOrgan,
  [largeIntestineOrgan.id]: largeIntestineOrgan,
};

export const organsList: Organ[] = Object.values(organs);

export * from './types';
export {
  brainOrgan, eyesOrgan, earsOrgan, mouthOrgan, thyroidOrgan,
  lungsOrgan,
  heartOrgan,
  liverOrgan,
  stomachOrgan, pancreasOrgan,
  kidneysOrgan,
  smallIntestineOrgan,
  largeIntestineOrgan,
};
