import {
  validateDraft,
  reviveCommitments,
  newCommitmentId,
  isHHMM,
  type CommitmentDraftValue,
} from "../commitmentDraft";

const draft = (
  over: Partial<CommitmentDraftValue> = {},
): CommitmentDraftValue => ({
  title: "Board meeting",
  dayIdx: 0,
  start: "09:00",
  end: "10:00",
  openPicker: null,
  ...over,
});

describe("validateDraft", () => {
  it("accepts a well-formed draft", () => {
    expect(validateDraft(draft(), 3)).toBeNull();
  });

  it("rejects an empty or whitespace-only title", () => {
    expect(validateDraft(draft({ title: "" }), 3)).toMatch(/name/i);
    expect(validateDraft(draft({ title: "   " }), 3)).toMatch(/name/i);
  });

  /**
   * The regression that motivated commitment ids and this hook: editing a
   * commitment whose day is not in the leg on screen produced dayIdx -1, and
   * the old screen silently fell back to index 0 — rewriting the commitment's
   * date to the first day of whichever leg happened to be showing.
   */
  it("refuses to save when no day is selected", () => {
    expect(validateDraft(draft({ dayIdx: -1 }), 3)).toMatch(/day/i);
  });

  it("refuses to save when the day index is past the end of the plan", () => {
    expect(validateDraft(draft({ dayIdx: 5 }), 3)).toMatch(/day/i);
    expect(validateDraft(draft({ dayIdx: 0 }), 0)).toMatch(/day/i);
  });

  it("rejects malformed times", () => {
    expect(validateDraft(draft({ start: "9:00" }), 3)).toMatch(/09:00/);
    expect(validateDraft(draft({ end: "25:00" }), 3)).toMatch(/09:00/);
  });

  it("rejects an end time at or before the start", () => {
    expect(validateDraft(draft({ start: "14:00", end: "09:00" }), 3)).toMatch(
      /after/i,
    );
    expect(validateDraft(draft({ start: "09:00", end: "09:00" }), 3)).toMatch(
      /after/i,
    );
  });
});

describe("isHHMM", () => {
  it("accepts valid 24h times and rejects the rest", () => {
    expect(isHHMM("00:00")).toBe(true);
    expect(isHHMM("23:59")).toBe(true);
    expect(isHHMM("24:00")).toBe(false);
    expect(isHHMM("9:00")).toBe(false);
    expect(isHHMM("09:60")).toBe(false);
    expect(isHHMM("")).toBe(false);
  });
});

describe("newCommitmentId", () => {
  it("does not collide within the same millisecond", () => {
    const ids = Array.from({ length: 50 }, newCommitmentId);
    expect(new Set(ids).size).toBe(50);
  });
});

describe("reviveCommitments", () => {
  const valid = {
    id: "c1",
    title: "Board meeting",
    date_local: "2026-09-02",
    start_local: "09:00",
    end_local: "10:00",
  };

  it("passes through commitments that already have an id", () => {
    expect(reviveCommitments([valid])).toEqual([valid]);
  });

  it("backfills an id on entries stored before ids existed", () => {
    const { id: _omitted, ...legacy } = valid;
    const [revived] = reviveCommitments([legacy]);
    expect(revived.id).toEqual(expect.any(String));
    expect(revived.id.length).toBeGreaterThan(0);
    expect(revived.title).toBe("Board meeting");
  });

  it("gives two identical legacy entries distinct ids", () => {
    const { id: _omitted, ...legacy } = valid;
    const [a, b] = reviveCommitments([legacy, { ...legacy }]);
    expect(a.id).not.toBe(b.id);
  });

  it("drops entries missing required fields rather than half-building them", () => {
    expect(
      reviveCommitments([valid, { title: "No times" }, null, "nonsense", 7]),
    ).toEqual([valid]);
  });

  it("returns an empty list for anything that is not an array", () => {
    expect(reviveCommitments(null)).toEqual([]);
    expect(reviveCommitments(undefined)).toEqual([]);
    expect(reviveCommitments({ nope: true })).toEqual([]);
  });
});
