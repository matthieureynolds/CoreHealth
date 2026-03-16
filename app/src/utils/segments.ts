import type { SegmentSpec } from '../types/biomarkers';

export function buildSegments(
  total: number,
  buckets: SegmentSpec[],
  segments = 60, // number of ticks around the ring
) {
  // map counts -> segment counts, preserving at least 1 seg for nonzero buckets
  const sum = buckets.reduce((s, b) => s + b.value, 0);
  const safeTotal = Math.max(total, sum);
  const base = segments * (sum / safeTotal);
  const parts = buckets.map(b => ({
    ...b,
    segs: b.value === 0 ? 0 : Math.max(1, Math.round((b.value / sum) * base)),
  }));
  
  // normalize to exactly `segments`
  let diff = segments - parts.reduce((s, p) => s + p.segs, 0);
  
  // distribute remainder to the largest buckets
  while (diff !== 0) {
    const idx = parts
      .slice()
      .sort((a, b) => b.value - a.value)[0];
    const i = parts.findIndex(p => p.key === idx.key);
    parts[i].segs += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
  }
  
  return parts;
}
