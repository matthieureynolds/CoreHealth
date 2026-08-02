import { validateTrip, buildJetLagPlanner } from "../tripRules";

const base = {
  departureLocation: "London",
  destination: "Tokyo",
  departureDate: new Date("2026-09-01T09:00:00Z"),
};

describe("validateTrip", () => {
  it("accepts a complete trip", () => {
    expect(validateTrip(base)).toBeNull();
  });

  it("accepts a trip with no return date (one-way)", () => {
    expect(validateTrip({ ...base, returnDate: undefined })).toBeNull();
  });

  it("rejects a missing departure location", () => {
    expect(validateTrip({ ...base, departureLocation: "" })).toBe(
      "Please enter a departure location",
    );
  });

  it("treats a whitespace-only departure location as missing", () => {
    expect(validateTrip({ ...base, departureLocation: "   " })).toBe(
      "Please enter a departure location",
    );
  });

  it("rejects a missing destination", () => {
    expect(validateTrip({ ...base, destination: "" })).toBe(
      "Please enter a destination",
    );
  });

  it("treats a whitespace-only destination as missing", () => {
    expect(validateTrip({ ...base, destination: "\t\n " })).toBe(
      "Please enter a destination",
    );
  });

  it("rejects a missing departure date", () => {
    expect(validateTrip({ ...base, departureDate: undefined })).toBe(
      "Please select a departure date",
    );
  });

  it("rejects a return date before departure", () => {
    expect(
      validateTrip({ ...base, returnDate: new Date("2026-08-30T09:00:00Z") }),
    ).toBe("Return date must be after departure date");
  });

  it("allows a return date equal to departure (same-day return)", () => {
    expect(
      validateTrip({ ...base, returnDate: new Date(base.departureDate) }),
    ).toBeNull();
  });

  it("checks fields in order — location before destination", () => {
    // Both are blank; the message names the first field so the user is not
    // sent to fix the second one while the first is still empty.
    expect(
      validateTrip({ ...base, departureLocation: "", destination: "" }),
    ).toBe("Please enter a departure location");
  });

  it("checks the date only once the text fields pass", () => {
    expect(
      validateTrip({
        departureLocation: "",
        destination: "",
        departureDate: undefined,
      }),
    ).toBe("Please enter a departure location");
  });
});

describe("buildJetLagPlanner", () => {
  it("always produces an outbound plan", () => {
    const p = buildJetLagPlanner();
    expect(p.outboundPlan.direction).toBe("outbound");
    expect(p.outboundPlan.circadianPlan.length).toBeGreaterThan(0);
  });

  it("omits the return plan for a one-way trip", () => {
    expect(buildJetLagPlanner(undefined).returnPlan).toBeUndefined();
  });

  it("adds a return plan when there is a return date", () => {
    const p = buildJetLagPlanner(new Date("2026-09-10T00:00:00Z"));
    expect(p.returnPlan?.direction).toBe("return");
    expect(p.returnPlan?.circadianPlan.length).toBeGreaterThan(0);
  });

  it("shifts the return leg in the opposite direction to the outbound", () => {
    const p = buildJetLagPlanner(new Date("2026-09-10T00:00:00Z"));
    expect(p.outboundPlan.timezoneAdjustment.startsWith("+")).toBe(true);
    expect(p.returnPlan?.timezoneAdjustment.startsWith("-")).toBe(true);
  });

  it("orders each plan from preparation days through arrival", () => {
    const days = buildJetLagPlanner().outboundPlan.circadianPlan.map(
      (d) => d.day,
    );
    expect(days).toEqual([...days].sort((a, b) => a - b));
    expect(days[0]).toBeLessThan(0);
    expect(days).toContain(0);
  });

  it("returns a fresh object each call", () => {
    // Shared mutable defaults would leak edits from one trip into the next.
    const a = buildJetLagPlanner();
    const b = buildJetLagPlanner();
    expect(a).not.toBe(b);
    expect(a.outboundPlan.circadianPlan).not.toBe(b.outboundPlan.circadianPlan);
  });
});
