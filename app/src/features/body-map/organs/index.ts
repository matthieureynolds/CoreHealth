import { liverOrgan } from './liver/liverData';
import { kidneysOrgan } from './kidneys/kidneysData';
import { pancreasOrgan } from './pancreas/pancreasData';
import { thyroidOrgan } from './thyroid/thyroidData';
import { brainOrgan } from './brain/brainData';
import { earsOrgan } from './ears/earsData';
import { mouthOrgan } from './mouth/mouthData';
import { eyesOrgan } from './eyes/eyesData';
import { stomachOrgan } from './stomach/stomachData';
import { smallIntestineOrgan } from './smallIntestine/smallIntestineData';
import { largeIntestineOrgan } from './largeIntestine/largeIntestineData';
import { heartOrgan } from './heart/heartData';
import { Organ } from './types';

export const organs: Record<string, Organ> = {
  [liverOrgan.id]: liverOrgan,
  [kidneysOrgan.id]: kidneysOrgan,
  [pancreasOrgan.id]: pancreasOrgan,
  [thyroidOrgan.id]: thyroidOrgan,
  [brainOrgan.id]: brainOrgan,
  [earsOrgan.id]: earsOrgan,
  [mouthOrgan.id]: mouthOrgan,
  [eyesOrgan.id]: eyesOrgan,
  [stomachOrgan.id]: stomachOrgan,
  [smallIntestineOrgan.id]: smallIntestineOrgan,
  [largeIntestineOrgan.id]: largeIntestineOrgan,
  [heartOrgan.id]: heartOrgan,
};

export const organsList: Organ[] = Object.values(organs);

export * from './types';
export { liverOrgan, kidneysOrgan, pancreasOrgan, thyroidOrgan, brainOrgan, earsOrgan, mouthOrgan, eyesOrgan, stomachOrgan, smallIntestineOrgan, largeIntestineOrgan, heartOrgan };
