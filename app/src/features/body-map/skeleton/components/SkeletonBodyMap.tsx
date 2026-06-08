import React from 'react';
import { boneHealthZones } from '../../skeleton';
import { BoneHealthZone } from '../../skeleton/types';
import { PanelPayload } from '../../types';
import ZoneBodyMap, { ZoneDotPosition } from '../../shared/components/ZoneBodyMap';

const DOT_POSITIONS: readonly ZoneDotPosition[] = [
  { id: 'general_systemic', x: 50.2, y: 28,   label: 'General systemic bone health' },
  { id: 'spine',            x: 50.2, y: 39,   label: 'Spine bone health' },
  { id: 'left_hip',         x: 42,   y: 49.2, label: 'Left hip bone health' },
  { id: 'right_hip',        x: 58.7, y: 49.2, label: 'Right hip bone health' },
] as const;

interface SkeletonBodyMapProps {
  onZoneSelect?: (zone: PanelPayload) => void;
}

const mapZoneToPanelPayload = (zone: BoneHealthZone): PanelPayload => ({
  data: {
    name: zone.name,
    description: zone.anatomicalFocus,
    biomarkers: zone.biomarkers.map(b => ({
      name: b.name,
      value: typeof b.value === 'number' ? b.value : 0,
      unit: b.unit,
      range: b.referenceRange,
      status: b.status === 'optimal' ? 'normal' : b.status,
    })),
  },
});

const SkeletonBodyMap: React.FC<SkeletonBodyMapProps> = ({ onZoneSelect }) => (
  <ZoneBodyMap
    imageSource={require('../../../../../assets/images/body-map/skeleton.png')}
    zones={boneHealthZones}
    dotPositions={DOT_POSITIONS}
    findZone={(zones, id) => zones.find(z => z.id === id)}
    mapZoneToPanelPayload={mapZoneToPanelPayload}
    onZoneSelect={onZoneSelect}
  />
);

export default SkeletonBodyMap;
