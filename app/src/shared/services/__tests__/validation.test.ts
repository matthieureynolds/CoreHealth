import { z } from "zod";
import { parseOrNull } from "../validation";
import { logger } from "../../utils/logger";

jest.mock("../../utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const warn = logger.warn as jest.Mock;
beforeEach(() => warn.mockClear());

const Schema = z.object({
  aqi: z.number(),
  label: z.string(),
  nested: z.object({ value: z.number() }).optional(),
});

describe("parseOrNull", () => {
  it("returns the parsed value for a valid payload", () => {
    const out = parseOrNull(Schema, { aqi: 42, label: "Good" }, "test");
    expect(out).toEqual({ aqi: 42, label: "Good" });
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns null instead of a wrongly-typed object", () => {
    // The old `as SomeResponse` cast would have let this straight through.
    expect(
      parseOrNull(Schema, { aqi: "not a number", label: "x" }, "aq"),
    ).toBeNull();
  });

  it("returns null for a missing required field", () => {
    expect(parseOrNull(Schema, { label: "x" }, "aq")).toBeNull();
  });

  it.each([null, undefined, "string", 42, []])(
    "returns null for non-object payload %p",
    (payload) => {
      expect(parseOrNull(Schema, payload, "aq")).toBeNull();
    },
  );

  it("logs the context and the offending path", () => {
    parseOrNull(Schema, { aqi: "bad", label: "x" }, "googleAirQuality");
    expect(warn).toHaveBeenCalledTimes(1);
    const msg = warn.mock.calls[0][0] as string;
    expect(msg).toContain("googleAirQuality");
    expect(msg).toContain("aqi");
  });

  it("caps the reported issues so a wholesale shape change stays readable", () => {
    const Wide = z.object({
      a: z.number(),
      b: z.number(),
      c: z.number(),
      d: z.number(),
      e: z.number(),
    });
    parseOrNull(Wide, {}, "wide");
    const msg = warn.mock.calls[0][0] as string;
    // three issues => two separators
    expect(msg.split(";").length).toBeLessThanOrEqual(3);
  });

  it("accepts optional nested data when present", () => {
    const out = parseOrNull(
      Schema,
      { aqi: 1, label: "x", nested: { value: 2 } },
      "test",
    );
    expect(out?.nested?.value).toBe(2);
  });
});
