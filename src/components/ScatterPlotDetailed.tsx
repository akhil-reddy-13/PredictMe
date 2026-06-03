import { fitRegressionLine } from '../engine/correlation';
import { toPlotCoords } from '../engine/scatter';
import type { Point } from '../engine/types';

interface ScatterPlotDetailedProps {
  points: Point[];
  size?: number;
  showRegression?: boolean;
}

export function ScatterPlotDetailed({
  points,
  size = 280,
  showRegression = true,
}: ScatterPlotDetailedProps) {
  const plot = toPlotCoords(points);
  const pad = 12;
  const inner = 100 - 2 * pad;

  let regLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (showRegression && points.length >= 2) {
    const { slope, intercept } = fitRegressionLine(points);
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const toPx = (x: number) => pad + ((x - minX) / rangeX) * inner;
    const toPy = (y: number) => pad + inner - ((y - minY) / rangeY) * inner;
    regLine = {
      x1: toPx(minX),
      y1: toPy(slope * minX + intercept),
      x2: toPx(maxX),
      y2: toPy(slope * maxX + intercept),
    };
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="mx-auto rounded-xl border border-neutral-200 bg-white"
      role="img"
      aria-label="Scatterplot with fitted regression line"
    >
      <rect width="100" height="100" fill="#fafafa" />
      {regLine && (
        <line
          x1={regLine.x1}
          y1={regLine.y1}
          x2={regLine.x2}
          y2={regLine.y2}
          stroke="#dc2626"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
      )}
      {plot.map((p, i) => (
        <circle
          key={i}
          cx={p.px}
          cy={p.py}
          r="2"
          className="fill-neutral-700/80"
        />
      ))}
    </svg>
  );
}
