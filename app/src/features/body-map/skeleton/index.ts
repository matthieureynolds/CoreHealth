export { generalSystemicZone } from "./general-systemic/generalSystemicData";
export { spineZone } from "./spine/spineData";
export { leftHipZone } from "./left-hip/leftHipData";
export { rightHipZone } from "./right-hip/rightHipData";
export * from "./types";

import { generalSystemicZone } from "./general-systemic/generalSystemicData";
import { spineZone } from "./spine/spineData";
import { leftHipZone } from "./left-hip/leftHipData";
import { rightHipZone } from "./right-hip/rightHipData";
import { BoneHealthZone } from "./types";

export const boneHealthZones: BoneHealthZone[] = [
  generalSystemicZone,
  spineZone,
  leftHipZone,
  rightHipZone,
];
