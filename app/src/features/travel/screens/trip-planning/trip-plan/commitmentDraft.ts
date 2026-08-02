import { useCallback, useState } from "react";
import type { Commitment, PlanDay } from "@shared/types";

/**
 * The add/edit-commitment form, as one piece of state that validates itself.
 *
 * This replaces ten separate `useState` calls in TripDetailScreen and the six
 * setters it had to drill into CommitmentSheet. The rules live here, in pure
 * functions, so they are testable without mounting a modal — the screen only
 * asks "can this be saved" and "what commitment does it describe".
 */

export interface CommitmentDraftValue {
  title: string;
  /** Index into the current leg's planDays. -1 means no day is selected. */
  dayIdx: number;
  /** 'HH:MM' local times. */
  start: string;
  end: string;
  openPicker: "start" | "end" | null;
}

const EMPTY_DRAFT: CommitmentDraftValue = {
  title: "",
  dayIdx: 0,
  start: "09:00",
  end: "10:00",
  openPicker: null,
};

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
export const isHHMM = (t: string): boolean => HHMM.test(t);
const toMinutes = (t: string): number =>
  Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

let idSeq = 0;
/** Unique within a session; the millisecond alone can collide on fast edits. */
export const newCommitmentId = (): string =>
  `c${Date.now().toString(36)}${(idSeq++).toString(36)}`;

/**
 * Why this draft cannot be saved, or null when it can.
 *
 * Returning the reason rather than a boolean is deliberate: the old form
 * disabled its save button with no explanation, so an end time before the
 * start looked like a broken button.
 */
export function validateDraft(
  draft: CommitmentDraftValue,
  dayCount: number,
): string | null {
  if (!draft.title.trim()) return "Give it a name.";
  if (draft.dayIdx < 0 || draft.dayIdx >= dayCount) return "Pick a day.";
  if (!isHHMM(draft.start) || !isHHMM(draft.end))
    return "Times must look like 09:00.";
  if (toMinutes(draft.end) <= toMinutes(draft.start))
    return "End time must be after the start time.";
  return null;
}

export function useCommitmentDraft(planDays: PlanDay[]) {
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState<CommitmentDraftValue>(EMPTY_DRAFT);

  const patch = useCallback(
    (fields: Partial<CommitmentDraftValue>) =>
      setValue((v) => ({ ...v, ...fields })),
    [],
  );

  const openAdd = useCallback(() => {
    setEditingId(null);
    setValue(EMPTY_DRAFT);
    setVisible(true);
  }, []);

  const openEdit = useCallback(
    (c: Commitment) => {
      // -1 when this commitment's day is not in the leg currently on screen.
      // Left as -1 on purpose. The previous code fell back to index 0, which
      // silently rewrote the commitment's date to the first day of whichever
      // leg happened to be showing; now validateDraft blocks the save until a
      // day is chosen deliberately.
      const dayIdx = planDays.findIndex((d) => d.date_local === c.date_local);
      setEditingId(c.id);
      setValue({
        title: c.title,
        dayIdx,
        start: c.start_local,
        end: c.end_local,
        openPicker: null,
      });
      setVisible(true);
    },
    [planDays],
  );

  const close = useCallback(() => {
    setVisible(false);
    setEditingId(null);
  }, []);

  const error = validateDraft(value, planDays.length);

  /** The commitment this draft describes, or null if it is not yet valid. */
  const commit = useCallback((): Commitment | null => {
    if (validateDraft(value, planDays.length)) return null;
    const day = planDays[value.dayIdx];
    return {
      id: editingId ?? newCommitmentId(),
      title: value.title.trim(),
      date_local: day.date_local,
      start_local: value.start,
      end_local: value.end,
    };
  }, [value, planDays, editingId]);

  return {
    visible,
    isEditing: editingId !== null,
    value,
    error,
    canSave: error === null,
    patch,
    openAdd,
    openEdit,
    close,
    commit,
  };
}

export type CommitmentDraft = ReturnType<typeof useCommitmentDraft>;

/**
 * Rebuilds a stored commitment list, assigning ids to entries saved before
 * commitments had them and dropping anything unreadable.
 */
export function reviveCommitments(parsed: unknown): Commitment[] {
  if (!Array.isArray(parsed)) return [];
  const out: Commitment[] = [];
  for (const raw of parsed) {
    if (!raw || typeof raw !== "object") continue;
    const c = raw as Record<string, unknown>;
    if (
      typeof c.title !== "string" ||
      typeof c.date_local !== "string" ||
      typeof c.start_local !== "string" ||
      typeof c.end_local !== "string"
    ) {
      continue;
    }
    out.push({
      id: typeof c.id === "string" && c.id ? c.id : newCommitmentId(),
      title: c.title,
      date_local: c.date_local,
      start_local: c.start_local,
      end_local: c.end_local,
    });
  }
  return out;
}
