import { toPlotCoords } from '../engine/scatter';
import type { Point } from '../engine/types';

interface ScatterPlotProps {
  points: Point[];
  size?: number;
}

export function ScatterPlot({ points, size = 320 }: ScatterPlotProps) {
  const plot = toPlotCoords(points);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="mx-auto rounded-xl border border-neutral-200 bg-white shadow-sm"
      role="img"
      aria-label="Scatterplot of two variables"
    >
      <rect x="0" y="0" width="100" height="100" fill="#fafafa" />
      {plot.map((p, i) => (
        <circle
          key={i}
          cx={p.px}
          cy={p.py}
          r="1.8"
          className="fill-neutral-700/75"
        />
      ))}
    </svg>
  );
}
