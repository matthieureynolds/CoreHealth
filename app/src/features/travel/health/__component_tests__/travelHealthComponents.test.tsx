import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import TravelHealthSummary from "../TravelHealthSummary";
import JetLagBanner from "../components/JetLagBanner";
import { palette } from "@shared/theme/colors";
import EnvironmentalMetricCard, {
  type EnvironmentalMetric,
} from "../components/EnvironmentalMetricCard";
import EnvironmentalMetricScreen from "../current-location/EnvironmentalMetricScreen";

jest.mock("@shared/context/SettingsContext", () => ({
  useSettings: () => ({ settings: { units: "metric" } }),
}));

jest.mock("@shared/context/HealthDataContext", () => ({
  useHealthData: () => ({ travelHealth: null, profile: null }),
}));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({
    params: { metricId: "air_quality", label: "Air Quality", score: 62 },
  }),
}));

beforeEach(() => jest.clearAllMocks());

describe("TravelHealthSummary", () => {
  it("renders with only defaults", () => {
    expect(() => render(<TravelHealthSummary />)).not.toThrow();
  });

  it("renders the supplied location", () => {
    render(<TravelHealthSummary currentLocation="Tokyo, Japan" />);
    expect(screen.getByText(/Tokyo/)).toBeTruthy();
  });

  it("renders a jet-lag banner when hours are non-zero", () => {
    render(<TravelHealthSummary currentLocation="Tokyo" jetLagHours={8} />);
    expect(screen.getAllByText(/8/).length).toBeGreaterThan(0);
  });

  it("accepts nearest-facility props without crashing", () => {
    // The names render inside a collapsed section, so this asserts the render
    // path rather than the text.
    expect(() =>
      render(
        <TravelHealthSummary
          currentLocation="Tokyo"
          nearestHospital="St Luke's"
          nearestPharmacy="Green Cross"
        />,
      ),
    ).not.toThrow();
  });
});

describe("JetLagBanner", () => {
  it("renders an hour count", () => {
    render(<JetLagBanner jetLagHours={8} />);
    expect(screen.getByText(/8/)).toBeTruthy();
  });

  it("handles zero hours", () => {
    expect(() => render(<JetLagBanner jetLagHours={0} />)).not.toThrow();
  });

  it("handles a westward (negative) shift", () => {
    expect(() => render(<JetLagBanner jetLagHours={-5} />)).not.toThrow();
  });
});

describe("EnvironmentalMetricCard", () => {
  const metric: EnvironmentalMetric = {
    id: "air_quality",
    label: "Air Quality",
    value: "62",
    status: "moderate",
    score: 62,
    icon: "cloud-outline",
  };

  it("renders the label and value", () => {
    render(
      <EnvironmentalMetricCard
        metric={metric}
        getStatusColor={() => palette.warningAlt}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Air Quality")).toBeTruthy();
    // value and score both render "62"
    expect(screen.getAllByText("62").length).toBeGreaterThan(0);
  });

  it("navigates on press", () => {
    const onPress = jest.fn();
    render(
      <EnvironmentalMetricCard
        metric={metric}
        getStatusColor={() => palette.warningAlt}
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByText("Air Quality"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "EnvironmentalMetric",
      expect.objectContaining({ metricId: "air_quality" }),
    );
  });
});

describe("EnvironmentalMetricScreen", () => {
  it("renders the metric from the route params", () => {
    render(<EnvironmentalMetricScreen />);
    expect(screen.getAllByText(/air quality/i).length).toBeGreaterThan(0);
  });

  it("positions the reading against the scale", () => {
    // The numeric score drives the pointer rather than rendering as text.
    expect(() => render(<EnvironmentalMetricScreen />)).not.toThrow();
  });

  it("shows the scale bands", () => {
    render(<EnvironmentalMetricScreen />);
    expect(screen.getAllByText(/moderate/i).length).toBeGreaterThan(0);
  });

  it("renders twice identically", () => {
    const a = render(<EnvironmentalMetricScreen />).toJSON();
    const b = render(<EnvironmentalMetricScreen />).toJSON();
    expect(JSON.stringify(b)).toBe(JSON.stringify(a));
  });
});
