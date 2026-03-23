import React from 'react';
import { Svg, G, Circle } from 'react-native-svg';

type RadialProps = {
  size?: number;
  stroke?: number;
  gapDeg?: number;
  segments: { segs: number; color: string; key: string }[];
  filter?: string | 'all';
  animate?: boolean;
};

export default function RadialSegments({
  size = 220,
  stroke = 14,
  gapDeg = 2.4,
  segments,
  filter = 'all',
  animate = true, // kept for API compatibility, no-op now
}: RadialProps) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const totalSegs = segments.reduce((s, p) => s + p.segs, 0);
  const step = (360 - totalSegs * gapDeg) / totalSegs;

  let startAngle = -90; // start at top
  const items = segments.flatMap(s => Array.from({ length: s.segs }).map(() => s));

  return (
    <Svg width={size} height={size}>
      {/* track */}
      <Circle 
        cx={cx} 
        cy={cy} 
        r={r} 
        stroke="rgba(255,255,255,0.08)" 
        strokeWidth={stroke} 
        fill="none" 
      />
      <G originX={cx} originY={cy}>
        {items.map((seg, i) => {
          const angle = startAngle;
          const sweep = step;
          startAngle += step + gapDeg;

          const dash = (Math.PI * 2 * r) * (sweep / 360);
          const gap = (Math.PI * 2 * r) * (gapDeg / 360);

          const highlight = filter === 'all' || filter === seg.key ? 1 : 0.25;

          return (
            <G key={i} rotation={angle} originX={cx} originY={cy}>
              <Circle
                cx={cx}
                cy={cy}
                r={r}
                stroke={seg.color}
                strokeOpacity={highlight}
                strokeWidth={stroke}
                strokeDasharray={`${dash},${gap}`}
                fill="none"
              />
            </G>
          );
        })}
      </G>
    </Svg>
  );
}
