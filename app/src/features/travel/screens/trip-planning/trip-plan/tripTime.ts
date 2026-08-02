/**
 * Date/time helpers shared by the trip plan screen and its extracted sheets.
 *
 * Kept together because they are two halves of one contract: hhmmToDate and
 * dateToHHMM must round-trip, and they used to sit inside the component where
 * nothing could check that.
 */
export function formatChipDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

export const hhmmToDate = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
};

export const dateToHHMM = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
