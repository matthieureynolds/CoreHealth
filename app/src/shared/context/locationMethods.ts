import * as Location from "expo-location";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  geocodeAddress,
  reverseGeocode,
} from "../services/travel/geocodingService";
import { LocationData } from "../types";

const LOCATION_CONSENT_KEY = "@corehealth_location_consent";

async function ensureLocationConsent(): Promise<boolean> {
  const existing = await AsyncStorage.getItem(LOCATION_CONSENT_KEY);
  if (existing === "true") return true;
  if (existing === "false") return false;
  // First time — ask
  return new Promise((resolve) => {
    Alert.alert(
      "Location Health Insights",
      "CoreHealth can use your location to provide travel health insights — air quality, UV index, disease risk, and pollen levels for where you are.\n\nYour location data will be stored on our servers to personalise your health context. You can withdraw this consent at any time in Profile → Settings → Data & Privacy.",
      [
        {
          text: "No Thanks",
          style: "cancel",
          onPress: () => {
            AsyncStorage.setItem(LOCATION_CONSENT_KEY, "false").catch(() => {});
            resolve(false);
          },
        },
        {
          text: "Allow",
          onPress: () => {
            AsyncStorage.setItem(LOCATION_CONSENT_KEY, "true").catch(() => {});
            resolve(true);
          },
        },
      ],
    );
  });
}

export const updateLocation = async (
  location: string,
  updateTravelHealthData: (locationData: LocationData) => Promise<void>,
): Promise<void> => {
  try {
    const locationData = await geocodeAddress(location);

    if (!locationData) {
      const mockLocationData: LocationData = {
        name: location,
        country: "Unknown",
        coordinates: { latitude: 0, longitude: 0 },
        timezone: "UTC",
        elevation: Math.floor(Math.random() * 2000),
      };
      await updateTravelHealthData(mockLocationData);
      return;
    }

    locationData.elevation = Math.floor(Math.random() * 2000);
    await updateTravelHealthData(locationData);
  } catch (error) {
    console.error("Failed to update location:", error);
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const consented = await ensureLocationConsent();
    if (!consented) return null;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const location = await Location.getCurrentPositionAsync({});

    const locationData = await reverseGeocode(
      location.coords.latitude,
      location.coords.longitude,
    );

    if (!locationData) {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const geo = geocode[0];
      let locationName =
        geo?.city ||
        geo?.district ||
        geo?.subregion ||
        geo?.region ||
        "Unknown Location";

      if (!locationName || locationName === geo?.country) {
        locationName =
          geo?.district || geo?.subregion || geo?.region || "Unknown Location";
      }

      return {
        name: locationName,
        country: geo?.country || "Unknown",
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        timezone: geo?.timezone || "UTC",
        elevation: location.coords.altitude || 0,
      };
    }

    if (location.coords.altitude) {
      locationData.elevation = location.coords.altitude;
    }

    return locationData;
  } catch (error) {
    console.error("Failed to get current location:", error);
    return null;
  }
};
