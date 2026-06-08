import { LocationData } from '../../../../../shared/types';
import { useTravelState } from './useTravelState';
import { createTravelHandlers } from './useTravelHandlers';

interface UseTravelScreenParams {
  travelHealth: any;
  getCurrentLocation: () => Promise<any>;
  updateTravelHealthData: (locationData: LocationData) => Promise<void>;
}

export function useTravelScreen({
  travelHealth,
  getCurrentLocation,
  updateTravelHealthData,
}: UseTravelScreenParams) {
  const state = useTravelState();

  const handlers = createTravelHandlers({
    s: state,
    travelHealth,
    updateTravelHealthData,
    getCurrentLocation,
    contentMeasuredHeight: 0,
    setContentMeasuredHeight: () => {},
  });

  return { ...state, ...handlers };
}
