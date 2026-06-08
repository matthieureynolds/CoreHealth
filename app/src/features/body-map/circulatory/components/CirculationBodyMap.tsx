import React from 'react';
import { circulationZones } from '../../circulatory';
import { CirculationZone, VascularBiomarker } from '../../circulatory/types';
import { PanelPayload } from '../../types';
import ZoneBodyMap, { ZoneDotPosition } from '../../shared/components/ZoneBodyMap';
import { heartBiomarkers } from '../heart';
import { oxygenationBiomarkers } from '../oxygenation';
import { arteriesVesselsBiomarkers } from '../arteries-vessels';

const DOT_POSITIONS: readonly ZoneDotPosition[] = [
  { id: 'heart',                  x: 52,   y: 31, label: 'Heart circulatory health' },
  { id: 'arteries_vessels_blood', x: 31.5, y: 30, label: 'Arteries and vessels health' },
  { id: 'oxygenation',            x: 50,   y: 22, label: 'Blood oxygenation health' },
] as const;

// Build a lookup from biomarker name → real data so we don't hardcode fake values
const allCirculatoryBiomarkers: VascularBiomarker[] = [
  ...heartBiomarkers,
  ...oxygenationBiomarkers,
  ...arteriesVesselsBiomarkers,
];

const biomarkerByName = new Map(allCirculatoryBiomarkers.map(b => [b.name, b]));

interface CirculationBodyMapProps {
  onZoneSelect?: (zone: PanelPayload) => void;
}

const mapZoneToPanelPayload = (zone: CirculationZone): PanelPayload => ({
  data: {
    name: zone.name,
    description: zone.description,
    biomarkers: zone.biomarkers.map(name => {
      const real = biomarkerByName.get(name);
      return real
        ? { name, value: real.value, unit: real.unit, range: real.range, status: real.status }
        : { name, value: 0, unit: '', range: '', status: 'normal' };
    }),
  },
});

const CirculationBodyMap: React.FC<CirculationBodyMapProps> = ({ onZoneSelect }) => (
  <ZoneBodyMap
    imageSource={require('../../../../../assets/images/body-map/circulation.png')}
    zones={circulationZones}
    dotPositions={DOT_POSITIONS}
    findZone={(zones, id) => zones.find(z => z.id === id)}
    mapZoneToPanelPayload={mapZoneToPanelPayload}
    onZoneSelect={onZoneSelect}
  />
);

export default CirculationBodyMap;
