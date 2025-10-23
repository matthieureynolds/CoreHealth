export type BiomarkerBuckets = {
  optimal: number;
  sufficient: number;
  out: number;
};

export type BiomarkerSummaryProps = {
  total: number;              // e.g., 65
  buckets: BiomarkerBuckets;  // { optimal:52, sufficient:10, out:3 }
  onUpload?: () => void;
  onFilterChange?: (key: keyof BiomarkerBuckets | 'all') => void;
  initialFilter?: keyof BiomarkerBuckets | 'all';
  // accessibility labels
  a11yLabel?: string;
};

export type SegmentSpec = { value: number; color: string; key: string };
