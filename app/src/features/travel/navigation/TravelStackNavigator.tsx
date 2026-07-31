import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TravelStackParamList } from "@shared/types";

// Main travel screen
import TravelScreen from "../screens/travel-search/TravelScreen";

// Travel Search — health metrics
import HealthMetricsScreen from "../screens/travel-search/health-metrics/HealthMetricsScreen";
import AirQualityScreen from "../screens/travel-search/health-metrics/air-quality/AirQualityScreen";
import WaterSafetyScreen from "../screens/travel-search/health-metrics/water-safety/WaterSafetyScreen";
import UVIndexScreen from "../screens/travel-search/health-metrics/uv-index/UVIndexScreen";
import FoodSafetyScreen from "../screens/travel-search/health-metrics/food-safety/FoodSafetyScreen";
import PollenScreen from "../screens/travel-search/health-metrics/pollen/PollenScreen";
import AltitudeScreen from "../screens/travel-search/health-metrics/altitude/AltitudeScreen";
import DiseaseOutbreakScreen from "../screens/travel-search/health-metrics/disease-outbreak/DiseaseOutbreakScreen";

// Travel Search — nearby hospitals, vaccinations, medications
import NearbyHospitalsScreen from "../screens/travel-search/nearby-hospitals/NearbyHospitalsScreen";
import VaccinationsScreen from "../screens/travel-search/vaccinations/VaccinationsScreen";
import TravelMedicationsScreen from "../screens/travel-search/medications/TravelMedicationsScreen";

// Trip Planning — add new trip
import AddNewTripScreen from "../screens/trip-planning/add-new-trip/AddNewTripScreen";

// Trip Planning — trip plan (detail screens)
import TripDetailScreen from "../screens/trip-planning/trip-plan/TripDetailScreen";

const Stack = createStackNavigator<TravelStackParamList>();

const TravelStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main */}
      <Stack.Screen name="TravelList" component={TravelScreen} />

      {/* Health Metrics hub + 7 sub-screens */}
      <Stack.Screen name="HealthMetrics" component={HealthMetricsScreen} />
      <Stack.Screen name="AirQuality" component={AirQualityScreen} />
      <Stack.Screen name="WaterSafety" component={WaterSafetyScreen} />
      <Stack.Screen name="UVIndex" component={UVIndexScreen} />
      <Stack.Screen name="FoodSafety" component={FoodSafetyScreen} />
      <Stack.Screen name="PollenMetric" component={PollenScreen} />
      <Stack.Screen name="Altitude" component={AltitudeScreen} />
      <Stack.Screen name="DiseaseOutbreak" component={DiseaseOutbreakScreen} />

      {/* Nearby hospitals, vaccinations, medications */}
      <Stack.Screen name="NearbyHospitals" component={NearbyHospitalsScreen} />
      <Stack.Screen name="TravelVaccinations" component={VaccinationsScreen} />
      <Stack.Screen
        name="TravelMedications"
        component={TravelMedicationsScreen}
      />

      {/* Trip planning */}
      <Stack.Screen name="AddNewTrip" component={AddNewTripScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
};

export default TravelStackNavigator;
