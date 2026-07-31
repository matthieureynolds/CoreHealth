import React from "react";
import MetricDetailScreen from "../MetricDetailScreen";
import { FOOD_SAFETY_CONFIG } from "../metricScreens.config";

const FoodSafetyScreen: React.FC = () => (
  <MetricDetailScreen config={FOOD_SAFETY_CONFIG} />
);

export default FoodSafetyScreen;
