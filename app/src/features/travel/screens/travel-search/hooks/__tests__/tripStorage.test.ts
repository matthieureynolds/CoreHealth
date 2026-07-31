import { parseStoredDate, deserializeStoredTrips } from "../tripStorage";

/**
 * `new Date(x)` returns Invalid Date rather than throwing, so a corrupt stored
 * value used to flow straight into trip maths and only show up much later as a
 * NaN duration or a nonsense jet-lag plan. These pin the guard.
 */

describe("parseStoredDate", () => {
  it("parses a valid ISO string", () => {
    const d = parseStoredDate("2026-08-01T09:00:00.000Z");
    expect(d).toBeInstanceOf(Date);
    expect(d?.toISOString()).toBe("2026-08-01T09:00:00.000Z");
  });

  it("returns null for an unparseable string instead of Invalid Date", () => {
    expect(parseStoredDate("garbage")).toBeNull();
  });

  it.each([null, undefined, "", {}, [], true, NaN])(
    "returns null for %p",
    (value) => {
      expect(parseStoredDate(value as unknown)).toBeNull();
    },
  );

  it("rejects an already-Invalid Date object", () => {
    expect(parseStoredDate(new Date("nonsense"))).toBeNull();
  });

  it("accepts a valid Date object unchanged", () => {
    const d = new Date("2026-01-02T03:04:05.000Z");
    expect(parseStoredDate(d)).toBe(d);
  });
});

describe("deserializeStoredTrips", () => {
  const valid = {
    id: "1",
    departureLocation: "London",
    destination: "Tokyo",
    departureDate: "2026-08-01T09:00:00.000Z",
    returnDate: "2026-08-10T09:00:00.000Z",
    timezone: "Asia/Tokyo",
  };

  it("revives valid trips into real Dates", () => {
    const { trips, dropped } = deserializeStoredTrips([valid]);
    expect(dropped).toBe(0);
    expect(trips).toHaveLength(1);
    expect(trips[0].departureDate).toBeInstanceOf(Date);
    expect(trips[0].returnDate).toBeInstanceOf(Date);
  });

  it("drops a trip whose departure date cannot be parsed", () => {
    const { trips, dropped } = deserializeStoredTrips([
      { ...valid, departureDate: "garbage" },
    ]);
    expect(trips).toHaveLength(0);
    expect(dropped).toBe(1);
  });

  it("keeps the trip but clears an unparseable return date", () => {
    const { trips, dropped } = deserializeStoredTrips([
      { ...valid, returnDate: "garbage" },
    ]);
    expect(dropped).toBe(0);
    expect(trips).toHaveLength(1);
    expect(trips[0].returnDate).toBeUndefined();
  });

  it("never yields an Invalid Date", () => {
    const { trips } = deserializeStoredTrips([
      valid,
      { ...valid, id: "2", departureDate: "nope" },
      { ...valid, id: "3", returnDate: 12345678901234567890 },
    ]);
    for (const t of trips) {
      expect(Number.isNaN(t.departureDate.getTime())).toBe(false);
      if (t.returnDate) {
        expect(Number.isNaN(t.returnDate.getTime())).toBe(false);
      }
    }
  });

  it("survives non-array and non-object input", () => {
    expect(deserializeStoredTrips(null)).toEqual({ trips: [], dropped: 0 });
    expect(deserializeStoredTrips("nope")).toEqual({ trips: [], dropped: 0 });
    const { trips, dropped } = deserializeStoredTrips([null, 5, "x"]);
    expect(trips).toHaveLength(0);
    expect(dropped).toBe(3);
  });

  it("keeps good trips alongside bad ones", () => {
    const { trips, dropped } = deserializeStoredTrips([
      valid,
      { ...valid, id: "bad", departureDate: undefined },
      { ...valid, id: "3" },
    ]);
    expect(trips.map((t) => t.id)).toEqual(["1", "3"]);
    expect(dropped).toBe(1);
  });
});
