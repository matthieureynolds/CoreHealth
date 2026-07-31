import React from "react";
import MetricDetailScreen from "../MetricDetailScreen";
import { DISEASE_OUTBREAK_CONFIG } from "../metricScreens.config";

const DiseaseOutbreakScreen: React.FC = () => (
  <MetricDetailScreen config={DISEASE_OUTBREAK_CONFIG} />
);

export default DiseaseOutbreakScreen;
