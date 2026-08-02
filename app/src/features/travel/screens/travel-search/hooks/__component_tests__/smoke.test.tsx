import { renderHook, waitFor } from "@testing-library/react-native";
import { useTripPersistence } from "../useTripPersistence";

describe("component project bootstraps", () => {
  it("can render a hook", async () => {
    const { result } = renderHook(() => useTripPersistence());
    await waitFor(() => expect(result.current.trips.length).toBeGreaterThan(0));
  });
});
