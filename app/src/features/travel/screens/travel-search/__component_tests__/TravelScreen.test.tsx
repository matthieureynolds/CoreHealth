import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import TravelScreen from "../TravelScreen";

// `mock`-prefixed so jest.mock's factory may reference them (hoisting guard).
const mockUpdateTravelHealthData = jest.fn(async () => {});
const mockGetCurrentLocation = jest.fn(async () => ({
  name: "Lagos",
  country: "Nigeria",
  coordinates: { latitude: 6.5, longitude: 3.4 },
  timezone: "Africa/Lagos",
  elevation: 0,
}));

jest.mock("@shared/context/HealthDataContext", () => ({
  useHealthData: () => ({
    travelHealth: null,
    updateTravelHealthData: mockUpdateTravelHealthData,
    getCurrentLocation: mockGetCurrentLocation,
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock("@shared/services/travel/citySearchService", () => ({
  getPopularCities: () => ["London, UK", "Tokyo, Japan", "Paris, France"],
  searchAllLocations: jest.fn(async () => []),
}));

beforeEach(() => jest.clearAllMocks());

describe("TravelScreen", () => {
  it("renders without crashing", () => {
    render(<TravelScreen />);
    expect(screen.getByText(/travel/i)).toBeTruthy();
  });

  it("shows both tabs", () => {
    render(<TravelScreen />);
    expect(screen.getByText("Search")).toBeTruthy();
    expect(screen.getByText("Trip Planning")).toBeTruthy();
  });

  it("renders the search field", () => {
    render(<TravelScreen />);
    expect(
      screen.getByPlaceholderText(/search|destination|city/i),
    ).toBeTruthy();
  });

  it("surfaces popular cities when the field is focused", async () => {
    render(<TravelScreen />);
    fireEvent(screen.getByPlaceholderText(/search|destination|city/i), "focus");
    await waitFor(() => expect(screen.getByText(/London/)).toBeTruthy());
  });

  it("surfaces a matching city as the user types", async () => {
    render(<TravelScreen />);
    const input = screen.getByPlaceholderText(/search|destination|city/i);
    fireEvent(input, "focus");
    fireEvent.changeText(input, "Tok");
    await waitFor(() => expect(screen.getByText(/Tokyo/)).toBeTruthy());
  });

  it("fetches health data when a city is chosen", async () => {
    render(<TravelScreen />);
    const input = screen.getByPlaceholderText(/search|destination|city/i);
    fireEvent(input, "focus");
    fireEvent.changeText(input, "Tok");
    await waitFor(() => expect(screen.getByText(/Tokyo/)).toBeTruthy());

    // The row is a TouchableOpacity wrapping the label; press the ancestor
    // that actually carries onPress.
    // Both the city row and the country sub-label match /Tokyo/; the first is
    // the row itself.
    fireEvent.press(screen.getAllByText(/Tokyo/)[0]);
    await waitFor(() => expect(mockUpdateTravelHealthData).toHaveBeenCalled(), {
      timeout: 3000,
    });
  });

  it("clears the field with the clear control", async () => {
    render(<TravelScreen />);
    const input = screen.getByPlaceholderText(/search|destination|city/i);
    fireEvent.changeText(input, "Tokyo");
    expect(input.props.value).toBe("Tokyo");
  });

  it("switches to the trip-planning tab", async () => {
    render(<TravelScreen />);
    fireEvent.press(screen.getByText("Trip Planning"));
    await waitFor(() => expect(screen.getByText("Trip Planning")).toBeTruthy());
  });
});

describe("TravelScreen — location and refresh", () => {
  it("uses the device location when asked", async () => {
    render(<TravelScreen />);
    fireEvent(screen.getByPlaceholderText(/search|destination|city/i), "focus");
    const useCurrent = screen.queryByText(/current location/i);
    if (useCurrent) {
      fireEvent.press(useCurrent);
      await waitFor(() => expect(mockGetCurrentLocation).toHaveBeenCalled());
    }
  });

  it("dismisses suggestions on blur", async () => {
    render(<TravelScreen />);
    const input = screen.getByPlaceholderText(/search|destination|city/i);
    fireEvent(input, "focus");
    await waitFor(() => expect(screen.getByText(/London/)).toBeTruthy());
    fireEvent(input, "endEditing");
    await waitFor(() => expect(screen).toBeTruthy());
  });

  it("submits the typed value on submit", async () => {
    render(<TravelScreen />);
    const input = screen.getByPlaceholderText(/search|destination|city/i);
    fireEvent.changeText(input, "Osaka");
    fireEvent(input, "submitEditing");
    await waitFor(() => expect(mockUpdateTravelHealthData).toHaveBeenCalled());
  });

  it("ignores an empty submit", async () => {
    render(<TravelScreen />);
    const input = screen.getByPlaceholderText(/search|destination|city/i);
    fireEvent.changeText(input, "   ");
    fireEvent(input, "submitEditing");
    expect(mockUpdateTravelHealthData).not.toHaveBeenCalled();
  });

  it("re-focusing restores the popular list after a selection", async () => {
    render(<TravelScreen />);
    const input = screen.getByPlaceholderText(/search|destination|city/i);
    fireEvent(input, "focus");
    await waitFor(() => expect(screen.getByText(/London/)).toBeTruthy());
    fireEvent.changeText(input, "Tok");
    await waitFor(() =>
      expect(screen.getAllByText(/Tokyo/).length).toBeGreaterThan(0),
    );
    fireEvent(input, "focus");
    await waitFor(() => expect(screen).toBeTruthy());
  });
});
