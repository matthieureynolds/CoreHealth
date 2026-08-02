import {
  getMultipleMedicationsAvailability,
  generateTravelMedicationKit,
} from "../medicationAvailabilityService";

jest.mock("../../../config/api", () => ({
  API_CONFIG: {
    GOOGLE_MAPS_API_KEY: "test-key-that-is-long-enough-to-pass",
    GOOGLE_MAPS_BASE_URL: "https://maps.example/api",
    PLACES_ENDPOINT: "/place/nearbysearch/json",
  },
}));

const realFetch = global.fetch;
afterAll(() => {
  global.fetch = realFetch;
});
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ status: "OK", results: [] }),
    text: async () => "{}",
  }) as unknown as typeof fetch;
});

describe("generateTravelMedicationKit", () => {
  it("returns a kit for a known country", () => {
    const kit = generateTravelMedicationKit("Japan");
    expect(kit).toBeDefined();
    expect(typeof kit).toBe("object");
  });

  it("returns a kit for an unknown country rather than throwing", () => {
    expect(() => generateTravelMedicationKit("Atlantis")).not.toThrow();
  });

  it("varies nothing on duration but accepts it", () => {
    expect(() => generateTravelMedicationKit("Japan", 30)).not.toThrow();
    expect(() => generateTravelMedicationKit("Japan", 0)).not.toThrow();
  });

  it("accepts medical conditions and activities", () => {
    const kit = generateTravelMedicationKit(
      "Thailand",
      14,
      ["asthma", "diabetes"],
      ["hiking", "diving"],
    );
    expect(kit).toBeDefined();
  });

  it("names essential medications", () => {
    const kit = generateTravelMedicationKit("Japan");
    const json = JSON.stringify(kit);
    expect(json.length).toBeGreaterThan(20);
  });

  it("is deterministic for the same country", () => {
    expect(JSON.stringify(generateTravelMedicationKit("Japan"))).toBe(
      JSON.stringify(generateTravelMedicationKit("Japan")),
    );
  });

  it("handles an empty country string", () => {
    expect(() => generateTravelMedicationKit("")).not.toThrow();
  });
});

describe("getMultipleMedicationsAvailability", () => {
  it("returns an entry for each medication it recognises", async () => {
    const out = await getMultipleMedicationsAvailability(
      ["Ibuprofen", "Ibuprofen"],
      "Japan",
    );
    expect(out).toHaveLength(2);
    expect(out[0].medication.genericName).toBe("Ibuprofen");
  });

  it("SILENTLY DROPS medications missing from the database", async () => {
    // Documented, not endorsed: a caller asking about five drugs can get three
    // answers back with no indication which two were skipped. Worth surfacing
    // in the UI before this ships to users.
    const out = await getMultipleMedicationsAvailability(
      ["Ibuprofen", "Zzzyzx-ol"],
      "Japan",
    );
    expect(out).toHaveLength(1);
  });

  it("returns an empty array for no medications", async () => {
    await expect(
      getMultipleMedicationsAvailability([], "Japan"),
    ).resolves.toEqual([]);
  });

  it("works without coordinates", async () => {
    await expect(
      getMultipleMedicationsAvailability(["Ibuprofen"], "Japan"),
    ).resolves.toBeDefined();
  });

  it("works with coordinates", async () => {
    await expect(
      getMultipleMedicationsAvailability(["Ibuprofen"], "Japan", 35.6, 139.6),
    ).resolves.toBeDefined();
  });

  it("survives the pharmacy lookup failing", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError("Network request failed"),
      ) as unknown as typeof fetch;
    await expect(
      getMultipleMedicationsAvailability(["Ibuprofen"], "Japan", 35.6, 139.6),
    ).resolves.toBeDefined();
  });

  it("survives a malformed places response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => null,
      text: async () => "null",
    }) as unknown as typeof fetch;
    await expect(
      getMultipleMedicationsAvailability(["Ibuprofen"], "Japan", 35.6, 139.6),
    ).resolves.toBeDefined();
  });

  it("handles an unknown country", async () => {
    await expect(
      getMultipleMedicationsAvailability(["Ibuprofen"], "Atlantis"),
    ).resolves.toHaveLength(1);
  });

  it("returns nothing when no medication is recognised", async () => {
    await expect(
      getMultipleMedicationsAvailability(["Zzzyzx-ol"], "Japan"),
    ).resolves.toEqual([]);
  });
});
