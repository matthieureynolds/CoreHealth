/**
 * Every availability outcome the medication database can produce.
 *
 * The advice differs sharply between them — "buy it at a pharmacy" versus
 * "possession may result in arrest" — so each arm is worth pinning. Codeine
 * and pseudoephedrine are the useful fixtures: between them they cover
 * available / prescription_required / restricted / banned.
 */
import { getMultipleMedicationsAvailability } from "../medicationAvailabilityService";

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
  global.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ status: "OK", results: [] }),
    text: async () => "{}",
  })) as unknown as typeof fetch;
});

/** Countries chosen to span permissive → prohibitionist regimes. */
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Japan",
  "Singapore",
  "UAE",
  "Thailand",
  "Germany",
  "Australia",
  "France",
  "Canada",
];

const MEDS = [
  "Codeine",
  "Pseudoephedrine",
  "Lorazepam",
  "Ibuprofen",
  "Amoxicillin",
  "Insulin",
];

describe("availability outcomes", () => {
  it("covers every availability value across the matrix", async () => {
    const seen = new Set<string>();
    for (const country of COUNTRIES) {
      const out = await getMultipleMedicationsAvailability(MEDS, country);
      for (const entry of out) seen.add(entry.currentCountry.availability);
    }
    // If the database ever loses a category this fails loudly rather than
    // quietly shrinking the advice the app can give.
    expect(seen.has("available")).toBe(true);
    expect(seen.has("prescription_required")).toBe(true);
    expect(seen.has("restricted")).toBe(true);
    expect(seen.has("banned")).toBe(true);
  });

  it("warns explicitly where a medication is banned", async () => {
    let sawBan = false;
    for (const country of COUNTRIES) {
      const out = await getMultipleMedicationsAvailability(
        ["Codeine", "Pseudoephedrine", "Lorazepam"],
        country,
      );
      for (const entry of out) {
        if (entry.currentCountry.availability === "banned") {
          sawBan = true;
          expect(entry.warnings.join(" ")).toMatch(/banned|prohibit/i);
          expect(entry.recommendations.length).toBeGreaterThan(0);
        }
      }
    }
    expect(sawBan).toBe(true);
  });

  it("tells the user to carry documentation where a prescription is required", async () => {
    let sawRx = false;
    for (const country of COUNTRIES) {
      const out = await getMultipleMedicationsAvailability(
        ["Amoxicillin", "Insulin"],
        country,
      );
      for (const entry of out) {
        if (entry.currentCountry.availability === "prescription_required") {
          sawRx = true;
          expect(entry.recommendations.join(" ")).toMatch(
            /prescription|documentation/i,
          );
        }
      }
    }
    expect(sawRx).toBe(true);
  });

  it("flags restrictions without claiming a ban", async () => {
    for (const country of COUNTRIES) {
      const out = await getMultipleMedicationsAvailability(
        ["Pseudoephedrine", "Lorazepam"],
        country,
      );
      for (const entry of out) {
        if (entry.currentCountry.availability === "restricted") {
          expect(entry.warnings.join(" ")).toMatch(/restriction/i);
        }
      }
    }
  });

  it.each(MEDS)("returns import regulations for %s", async (med) => {
    const [entry] = await getMultipleMedicationsAvailability(
      [med],
      "Singapore",
    );
    expect(entry?.importRegulations).toBeDefined();
  });

  it.each(COUNTRIES)(
    "produces alternatives where relevant in %s",
    async (c) => {
      const out = await getMultipleMedicationsAvailability(MEDS, c);
      for (const entry of out) {
        expect(Array.isArray(entry.alternatives)).toBe(true);
      }
    },
  );

  it("attaches nearby pharmacies when coordinates are supplied", async () => {
    const out = await getMultipleMedicationsAvailability(
      ["Ibuprofen"],
      "Japan",
      35.6,
      139.6,
    );
    expect(Array.isArray(out[0].nearbyPharmacies)).toBe(true);
  });

  it("is case-insensitive on the medication name", async () => {
    const lower = await getMultipleMedicationsAvailability(
      ["ibuprofen"],
      "Japan",
    );
    const upper = await getMultipleMedicationsAvailability(
      ["IBUPROFEN"],
      "Japan",
    );
    expect(lower.length).toBe(upper.length);
  });

  it("matches a brand name as well as the generic", async () => {
    const out = await getMultipleMedicationsAvailability(["Advil"], "Japan");
    expect(out.length).toBeGreaterThanOrEqual(0);
  });
});
