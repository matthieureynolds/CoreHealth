/**
 * Public surface of the travel feature.
 *
 * Everything else under `features/travel/` is internal. Other features and the
 * navigators import from here, not from a deep path — that is what lets a
 * dependency rule distinguish "the dashboard renders the travel summary"
 * (fine) from "the dashboard reaches into travel's component tree" (how the
 * two metric-detail implementations grew apart in the first place).
 */
export { default as TravelStackNavigator } from "./navigation/TravelStackNavigator";
export { default as TravelHealthSummary } from "./health/TravelHealthSummary";
export { default as EnvironmentalMetricScreen } from "./health/current-location/EnvironmentalMetricScreen";
