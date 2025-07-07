import { heartOrgan } from './heart/heartData';
import { liverOrgan } from './liver/liverData';
import { kidneysOrgan } from './kidneys/kidneysData';
import { pancreasOrgan } from './pancreas/pancreasData';
import { thyroidOrgan } from './thyroid/thyroidData';
import { Organ } from './types';

export const organs: Record<string, Organ> = {
  [heartOrgan.id]: heartOrgan,
  [liverOrgan.id]: liverOrgan,
  [kidneysOrgan.id]: kidneysOrgan,
  [pancreasOrgan.id]: pancreasOrgan,
  [thyroidOrgan.id]: thyroidOrgan,
};

export const organsList: Organ[] = Object.values(organs);

export * from './types';
export { heartOrgan, liverOrgan, kidneysOrgan, pancreasOrgan, thyroidOrgan };
