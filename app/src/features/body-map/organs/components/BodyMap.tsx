import React, { useState } from 'react';
import { Dimensions, ImageBackground } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { organsList } from '../../organs';
import { Organ } from '../../organs/types';

interface BodyMapProps {
  onOrganPress: (organId: string) => void;
  onOrganSelect?: (organ: Organ) => void;
  onHeadPress?: () => void;
}

const BODY_IMAGE = require('../../../../../assets/images/body-map/body-map.png');
const { width } = Dimensions.get('window');
// Figma body is 471×706 on a 390px iPhone frame — slightly wider than screen,
// arms clip at edges, giving the full-bleed look.
const IMG_W = width * (471 / 390);
const IMG_H = IMG_W * (706 / 471); // preserves exact Figma aspect ratio

// Each organ: center in 100×150 coordinate space, target rendered size
// in same space, original SVG viewBox dims, and the traced path data.
type OrganShape = {
  id: string;
  organDataId?: string;
  isHeadZone?: boolean;
  color: string;
  cx: number;      // center x in 100×150 space
  cy: number;      // center y in 100×150 space
  targetW: number; // rendered width  in 100×150 space
  targetH: number; // rendered height in 100×150 space
  svgW: number;    // Figma viewBox width
  svgH: number;    // Figma viewBox height
  path: string;
};

const ORGAN_SHAPES: OrganShape[] = [
  {
    id: 'head', isHeadZone: true,
    color: '#E8D5C4',
    cx: 50, cy: 13.5, targetW: 20, targetH: 22,
    svgW: 95, svgH: 114,
    path: 'M17 12.5C26.0452 3.2976 32.7243 0.739531 47 0C61.2922 0.646969 67.728 3.60122 77 12.5C86.2625 21.2665 88.1504 31.0033 88 53.5C89.6639 51.8761 90.6461 51.442 92.5 51.5C94.5015 53.0336 94.9007 54.6048 94.5 58.5V68C93.047 75.2347 90.9261 77.6762 85.5 80C83.6503 88.6858 81.5616 93.126 76.5 100.5C68.7675 108.425 64.1476 111.018 55.5 113C48.8609 113.978 45.1391 113.951 38.5 113C28.4941 109.866 24.3546 106.939 18.5 100.5C13.9203 93.1187 12.0962 88.6111 10 80C3.41165 77.2111 1.51481 74.3765 0 68V58.5C0.653724 54.8982 1.24656 53.2582 3 51.5C4.53552 51.7034 5.31341 52.1017 6.5 53.5C6.38206 33.1632 8.49837 23.999 17 12.5Z',
  },
  {
    id: 'heart', organDataId: 'heart',
    color: '#FF453A',
    cx: 51, cy: 43, targetW: 10, targetH: 12,
    svgW: 49, svgH: 62,
    path: 'M17.0167 4.11362C18.6543 -0.675255 20.9965 -0.965815 27.0167 1.61362V10.6136C33.85 12.4373 36.7165 14.2642 40.5167 18.6136C45.0198 26.6849 46.6037 31.8717 48.0167 42.1136C48.9116 55.9515 44.2641 59.9141 28.0167 61.1136C10.4013 56.5824 3.93002 50.4788 0.0166836 31.6136C-0.147283 26.002 0.864445 23.5006 4.51668 20.1136C5.18542 10.8952 6.67526 6.98669 12.5167 3.61362C14.0266 3.21566 14.9706 3.22616 17.0167 4.11362Z',
  },
  // left_lung.svg = patient's left lung, appears on viewer's RIGHT side of screen
  {
    id: 'lung_left', organDataId: 'lungs',
    color: '#3AABF0',
    cx: 58, cy: 43, targetW: 13, targetH: 19,
    svgW: 53, svgH: 89,
    path: 'M0.5 8L0 25.5C10.8248 27.2616 15.0014 32.814 20 48.5C21.7188 56.8086 21.7847 61.3078 20 69C19.0488 71.3869 18.0491 72.6141 15 74.5C11.3774 76.138 9.18011 76.6672 5 77C9.47598 81.1277 13.1373 82.9703 21.5 85.5C26.7177 87.2705 30.1308 87.9163 37 88.5H45.5C49.9869 87.0105 51.6861 85.5051 52.5 81V70.5C51.4732 58.4277 50.7297 52.1988 48.5 44C46.4813 35.6592 44.8637 31.2637 41 24C37.3749 17.1341 34.1811 13.7199 27.5 8C22.1881 3.44368 18.459 1.70262 10.5 0H6.5C2.89224 0.832352 1.63917 2.69399 0.5 8Z',
  },
  // right_lung.svg = patient's right lung, appears on viewer's LEFT side of screen
  {
    id: 'lung_right', organDataId: 'lungs',
    color: '#3AABF0',
    cx: 42, cy: 43, targetW: 13, targetH: 19,
    svgW: 54, svgH: 88,
    path: 'M23 8.52729C30.1035 2.98257 34.6351 0.986521 44 0.0272917C46.6765 -0.106455 47.7639 0.229277 49 1.52729C50.7436 2.70808 51.2018 4.28941 51.5 8.02729V21.0273C50.3283 22.7817 49.7488 23.8438 49 26.0273C48.396 29.0877 48.1642 30.7387 48 33.5273C45.9414 36.4053 43.7071 39.3079 43.5 42.0273C43.2929 44.7466 43.3096 46.3404 44 49.5273C44.761 53.6031 45.4781 55.8064 47.5 59.5273C49.3995 63.0004 50.685 64.8708 53.5 68.0273C53.3982 70.1168 53.2407 71.2409 52.5 73.0273C50.8774 76.262 49.5999 77.5881 47 79.5273C43.156 81.7318 40.703 82.6729 36 84.0273H23C18.3037 85.7997 15.6756 86.4631 11 87.0273H5.5C1.85135 85.425 0.782332 83.6636 0 79.5273C0.127816 69.2438 0.610295 63.6831 2 54.0273C3.63187 44.0425 4.98203 39.058 8 31.0273C12.2871 20.6662 15.5045 15.6727 23 8.52729Z',
  },
  {
    id: 'liver', organDataId: 'liver',
    color: '#FF9F0A',
    cx: 48, cy: 59, targetW: 22, targetH: 12,
    svgW: 103, svgH: 60,
    path: 'M0 38C0.645792 11.5318 8.63607 2.77429 39 0L48 0.5C51.2403 1.02493 52.9019 1.45749 55 3C56.1128 2.23899 56.7832 2.10548 58 2C61.1243 1.85123 62.8757 1.82428 66 2C79.6908 2.78465 87.1944 3.87526 100 8C102.041 9.18613 102.966 10.0928 103 13.5C97.9784 23.9792 92.8274 28.3955 80 34C67.5978 39.1302 60.4993 41.1016 47.5 42.5C39.3181 46.3081 33.5474 48.0332 21.5 50.5C16.0714 54.9236 12.9762 57.2943 6.5 59.5C4.20775 59.1641 3.08241 58.2131 1.5 54.5C0.273055 48.214 0.0434119 44.5772 0 38Z',
  },
  {
    id: 'stomach', organDataId: 'stomach',
    color: '#30D158',
    cx: 54, cy: 63, targetW: 13, targetH: 12,
    svgW: 59, svgH: 49,
    path: 'M19.0049 14C18.0195 12.9931 34.5429 6.39665 40.5049 0C46.6811 1.36272 49.4879 2.94402 53.5049 7C57.4918 12.114 58.8003 15.0606 59.0049 20.5C56.0003 16.7369 53.7993 15.8921 49.0049 16.5C42.4003 18.2902 39.6787 21.1544 36.0049 28.5V34.5C36.7491 36.6617 37.5737 37.737 39.5049 39.5C36.8668 42.4112 35.5931 44.4635 33.5049 48.5H18.5049C9.93162 47.8357 -0.255895 41.0292 0.0049059 40.5C0.265707 39.9708 3.67305 35.2766 7.00491 32.5C14.1023 29.8828 17.2332 27.3387 21.0049 20.5V17C20.5867 15.536 19.9903 15.0069 19.0049 14Z',
  },
  {
    id: 'kidney_left', organDataId: 'kidneys',
    color: '#BF5AF2',
    cx: 64, cy: 68, targetW: 7, targetH: 12,
    svgW: 39, svgH: 112,
    path: 'M23.5 0C15.7911 2.56326 12.7199 5.09016 10 12C9.47903 17.2315 10.576 19.4743 14.5 22.5C8.64279 28.5423 6.63903 33.0897 4.5 42.5L5.5 91.5C5.28562 99.5453 4.37542 103.96 0 111.5C5.03667 109.386 6.88126 103.979 8.5 87L7 41.5C9.38692 35.3205 10.7129 32.3282 13 30V31.5L8.5 40.5V44C9.9668 47.5912 11.1245 49.4707 16.5 51.5H21C25.2487 50.6259 27.4321 49.2891 31 45.5C34.9919 40.1513 36.5383 36.5557 38 29C38.4865 24.7652 38.3728 22.6529 38 19C35.5022 5.86266 32.314 1.72666 23.5 0Z',
  },
  {
    id: 'kidney_right', organDataId: 'kidneys',
    color: '#BF5AF2',
    cx: 36, cy: 68, targetW: 7, targetH: 12,
    svgW: 42, svgH: 98,
    path: 'M30 10.5C29.872 14.5788 29.3473 16.6204 27 19.5C30.8474 24.6004 32.1549 28.4392 33 37L32.5 78.5C33.5844 86.9714 35.5994 91.2253 41.5 98C32.9917 93.1739 30.2679 88.132 29 75L29.5 40L27 32.5C28.1995 42.9051 26.0231 45.9867 17.5 47C4.38156 43.4331 0.838136 38.1494 0 24C2.0024 9.82584 5.9163 4.26725 19.5 0C26.9914 0.567984 29.0816 3.08486 30 10.5Z',
  },
  {
    id: 'small_intestine', organDataId: 'smallIntestine',
    color: '#FF9F0A',
    cx: 50, cy: 77, targetW: 16, targetH: 12,
    svgW: 73, svgH: 57,
    path: 'M1 49C7.27634 55.0877 12.1629 56.8037 24 56C28.7171 48.6696 31.4738 45.2509 37.5 46C39.347 44.2697 40.8734 43.8346 44 43.5C47.1784 43.8763 49.041 44.5324 52.5 46.5C56.7179 42.2252 59.652 41.3999 66 43C68.0354 41.4176 69.1367 40.3519 71 38C67.9063 33.2594 67.8453 30.5313 71.5 25.5C68.0219 20.2485 68.2447 17.1895 73 11.5C71.1885 7.60843 71.0941 5.03817 72 0C66.6795 2.52138 63.3454 2.82031 56.5 0.5C47.1941 7.31087 43.6238 6.76595 38.5 2.5C32.5008 6.00769 28.8718 5.76044 22 2C16.8655 3.55078 14.2802 3.44503 10.5 0.5C8.58517 5.17036 6.92823 7.06546 2 8C2.85255 11.1898 2.15794 12.7907 0 15.5C4.44933 20.1793 4.66748 23.413 2 30C6.25446 37.0178 6.331 41.1515 1 49Z',
  },
  {
    id: 'large_intestine', organDataId: 'largeIntestine',
    color: '#FF6B35',
    cx: 50, cy: 84, targetW: 26, targetH: 18,
    svgW: 119, svgH: 122,
    path: 'M16.0844 75.5227C17.4754 80.8143 19.3212 82.9289 24.0844 85.5227C21.7831 81.577 20.8507 79.2534 21.0844 74.5227L24.0844 72.5227C28.7711 65.8696 28.7705 61.9192 24.5844 54.5227C27.3927 48.1336 27.0393 44.8221 22.0844 39.5227C24.5756 38.4649 25.2667 36.9088 24.5844 31.5227C29.6819 30.9638 31.7003 29.2898 33.5844 23.5227C37.8551 26.8671 40.5963 27.2774 46.0844 25.5227C52.2078 29.128 55.7079 29.2955 62.0844 26.0227C64.361 27.9869 65.8511 28.7171 69.0844 29.0227C74.1115 28.0815 76.4624 26.7824 80.0844 23.5227C86.7828 26.1871 90.3911 26.0279 96.5844 23.0227C95.652 28.6422 95.7851 31.5227 97.5844 36.0227C93.2304 41.4394 92.9399 44.507 96.0844 50.0227C92.8299 54.421 92.8592 57.1795 95.5844 62.5227C93.6525 65.9064 92.21 67.1871 89.0844 68.5227C83.34 67.0407 80.5682 68.1252 76.0844 72.0227C69.6001 68.5215 66.263 67.7591 61.5844 71.5227H57.0844C50.4618 76.6773 47.9194 80.2794 45.5844 88.0227C45.1973 91.5099 45.1649 93.2912 45.5844 96.0227C46.5529 100.6 47.6508 103.655 50.0844 109.523C50.4555 113.384 50.7918 115.107 51.5844 117.523C52.7028 120.172 53.8085 121.061 57.0844 121.023C59.3508 121.093 60.2997 120.595 61.5844 119.023C62.5997 116.336 63.0846 114.25 63.5844 108.023C66.9098 101.991 68.2755 97.9769 70.0844 90.0227C74.1849 92.3505 76.4839 92.2992 80.5844 90.0227C86.472 92.8342 89.4012 92.4774 94.0844 89.0227C103.872 90.2676 106.925 88.3874 108.584 81.0227C115.061 77.7122 116.64 74.6481 114.084 66.0227C117.409 60.2211 117.571 56.9357 115.084 51.0227C119.491 44.9728 118.704 41.7294 115.584 36.0227C118.845 31.3498 118.73 28.7214 116.084 24.0227C118.774 22.8864 118.268 10.8833 113.584 8.52267C108.901 6.16199 111.537 2.221 107.084 1.02267C101.412 -0.656026 98.3673 -0.230399 93.0844 2.02267C85.7471 2.19505 82.7868 3.51782 78.5844 7.02267C71.8912 3.75038 68.4971 4.0906 63.0844 8.52267C55.7696 4.71147 52.3534 4.45816 48.0844 9.02267C46.9719 9.19456 46.538 9.09158 46.0844 8.52267C45.601 7.97879 45.5797 7.63754 45.5844 7.02267C41.2385 3.97902 38.7212 3.73367 34.0844 6.02267C26.7342 2.81817 17.0335 7.15047 17.0844 7.52267C17.1353 7.89487 7.97453 8.24553 4.5844 12.5227C0.517381 17.6867 0.216178 20.7523 3.0844 26.5227C-1.36886 32.4835 -0.823302 35.7583 3.5844 41.5227C2.13595 43.517 1.46762 44.714 0.584395 47.0227C0.223818 49.3658 0.267775 50.6795 0.584395 53.0227C1.24429 55.4254 1.91515 56.6219 3.5844 58.5227C1.43428 60.9959 1.09635 62.8637 1.08439 66.5227C1.21407 71.0068 2.4723 72.8904 6.0844 75.5227C10.0256 77.4558 12.2114 77.4552 16.0844 75.5227Z',
  },
];

const LUNGS_PLACEHOLDER: Organ = {
  id: 'lungs', label: 'Lungs', position: { x: 0.5, y: 0.28 },
  data: {
    name: 'Lungs', description: 'Oxygenate blood and remove CO₂.',
    biomarkers: [
      { name: 'SpO₂', value: 98, unit: '%', range: '95-100', status: 'normal' },
      { name: 'FEV1', value: 3.8, unit: 'L', range: '>3.0', status: 'normal' },
      { name: 'FVC', value: 4.8, unit: 'L', range: '>3.5', status: 'normal' },
    ],
  },
};

const BodyMap: React.FC<BodyMapProps> = ({ onOrganPress, onOrganSelect, onHeadPress }) => {
  const [selectedDataId, setSelectedDataId] = useState<string | null>(null);

  const handleShapePress = (shape: OrganShape) => {
    if (shape.isHeadZone) {
      onHeadPress?.();
      return;
    }
    if (!shape.organDataId) return;
    setSelectedDataId(shape.organDataId);
    onOrganPress(shape.organDataId);
    const organ =
      shape.organDataId === 'lungs'
        ? LUNGS_PLACEHOLDER
        : organsList.find(o => o.id === shape.organDataId);
    if (organ) onOrganSelect?.(organ);
  };

  // Build an SVG transform string that scales the path from its own
  // viewBox coords and centers it at (cx,cy) in screen pixels.
  const getTransform = (shape: OrganShape, scaleMult = 1) => {
    const targetPxW = (shape.targetW / 100) * IMG_W * scaleMult;
    const targetPxH = (shape.targetH / 150) * IMG_H * scaleMult;
    const sx = targetPxW / shape.svgW;
    const sy = targetPxH / shape.svgH;
    const centerX = (shape.cx / 100) * IMG_W;
    const centerY = (shape.cy / 150) * IMG_H;
    const tx = centerX - (shape.svgW * sx) / 2;
    const ty = centerY - (shape.svgH * sy) / 2;
    return `translate(${tx}, ${ty}) scale(${sx}, ${sy})`;
  };

  return (
    <ImageBackground
      source={BODY_IMAGE}
      style={{ width: IMG_W, height: IMG_H }}
      imageStyle={{ resizeMode: 'contain' }}
    >
      <Svg width={IMG_W} height={IMG_H}>
        {ORGAN_SHAPES.map(shape => {
          const selected = selectedDataId === shape.organDataId && !shape.isHeadZone;
          return (
            <G key={shape.id} onPress={() => handleShapePress(shape)}>
              {/* Glow ring — slightly larger, low opacity */}
              {selected && (
                <Path
                  d={shape.path}
                  transform={getTransform(shape, 1.4)}
                  fill={shape.color}
                  fillOpacity={0.15}
                />
              )}
              {/* Main organ shape */}
              <Path
                d={shape.path}
                transform={getTransform(shape)}
                fill={shape.color}
                fillOpacity={selected ? 1.0 : 0.9}
              />
            </G>
          );
        })}
      </Svg>
    </ImageBackground>
  );
};

export default BodyMap;
