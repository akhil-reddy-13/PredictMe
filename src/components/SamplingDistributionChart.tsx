import { useMemo, useState } from 'react';
import {
  densityFromSamples,
  sampleCorrelationUnderAlt,
  sampleCorrelationUnderNull,
} from '../engine/distribution';
import { POINT_COUNT } from '../engine/scatter';

interface SamplingDistributionChartProps {
  rCrit: number;
  userBoundary: number | null;
  /** All tilt scores from this session (for tick marks). */
  sessionTilts?: number[];
  /** Tilt scores on noise trials only. */
  noiseTilts?: number[];
}

export function SamplingDistributionChart({
  rCrit,
  userBoundary,
  sessionTilts = [],
  noiseTilts = [],
}: SamplingDistributionChartProps) {
  const [showSignal, setShowSignal] = useState(false);

  const { nullDensity, altDensity, width, height, pad, innerW, innerH } =
    useMemo(() => {
      const xMin = -0.65;
      const xMax = 0.65;
      const nullS = sampleCorrelationUnderNull(POINT_COUNT);
      const nullDensity = densityFromSamples(nullS, xMin, xMax);
      const altS = sampleCorrelationUnderAlt(0.55, POINT_COUNT);
      const altDensity = densityFromSamples(altS, xMin, xMax);
      const width = 400;
      const height = 200;
      const pad = { top: 16, right: 12, bottom: 44, left: 36 };
      const innerW = width - pad.left - pad.right;
      const innerH = height - pad.top - pad.bottom;
      return {
        nullDensity,
        altDensity,
        width,
        height,
        pad,
        innerW,
        innerH,
      };
    }, []);

  const xMin = -0.65;
  const xMax = 0.65;
  const toX = (r: number) =>
    pad.left + ((Math.max(xMin, Math.min(xMax, r)) - xMin) / (xMax - xMin)) * innerW;
  const toY = (y: number) => pad.top + innerH - y * innerH;

  const pathFrom = (pts: { x: number; y: number }[], close = true) => {
    if (pts.length === 0) return '';
    const line = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x)} ${toY(p.y)}`)
      .join(' ');
    if (!close) return line;
    return `${line} L ${toX(pts[pts.length - 1].x)} ${toY(0)} L ${toX(pts[0].x)} ${toY(0)} Z`;
  };

  const userB = userBoundary ?? rCrit * 0.6;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowSignal(false)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            !showSignal
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          random plots only
        </button>
        <button
          type="button"
          onClick={() => setShowSignal(true)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            showSignal
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          + real patterns
        </button>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md text-neutral-800"
        role="img"
        aria-label="Distribution of tilt scores"
      >
        <line
          x1={pad.left}
          y1={toY(0)}
          x2={pad.left + innerW}
          y2={toY(0)}
          stroke="#e5e5e5"
        />
        <text
          x={pad.left + innerW / 2}
          y={height - 10}
          textAnchor="middle"
          className="fill-neutral-500 text-[10px]"
        >
          tilt score (how diagonal one plot looked)
        </text>

        <path
          d={pathFrom(nullDensity)}
          fill="#a3a3a3"
          fillOpacity="0.35"
          stroke="#737373"
          strokeWidth="1.5"
        />

        {showSignal && (
          <path
            d={pathFrom(altDensity)}
            fill="#171717"
            fillOpacity="0.12"
            stroke="#171717"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        )}

        {/* Session ticks on baseline */}
        {sessionTilts.map((r, i) => (
          <line
            key={`s-${i}`}
            x1={toX(r)}
            y1={pad.top + innerH}
            x2={toX(r)}
            y2={pad.top + innerH + 6}
            stroke="#a3a3a3"
            strokeWidth="1"
          />
        ))}
        {noiseTilts.map((r, i) => (
          <circle
            key={`n-${i}`}
            cx={toX(r)}
            cy={pad.top + innerH + 10}
            r="3"
            className="fill-amber-500"
          />
        ))}

        <line
          x1={toX(-rCrit)}
          y1={pad.top}
          x2={toX(-rCrit)}
          y2={pad.top + innerH}
          stroke="#16a34a"
          strokeWidth="2"
        />
        <line
          x1={toX(rCrit)}
          y1={pad.top}
          x2={toX(rCrit)}
          y2={pad.top + innerH}
          stroke="#16a34a"
          strokeWidth="2"
        />
        <text
          x={toX(rCrit) + 2}
          y={pad.top + 12}
          className="fill-green-700 text-[9px] font-medium"
        >
          null cutoff ±{rCrit.toFixed(2)}
        </text>

        <line
          x1={toX(-userB)}
          y1={pad.top}
          x2={toX(-userB)}
          y2={pad.top + innerH}
          stroke="#dc2626"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        <line
          x1={toX(userB)}
          y1={pad.top}
          x2={toX(userB)}
          y2={pad.top + innerH}
          stroke="#dc2626"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        <text
          x={toX(userB) + 2}
          y={pad.top + 24}
          className="fill-red-600 text-[9px] font-medium"
        >
          your line ±{userB.toFixed(2)}
        </text>

        {userB < rCrit && (
          <>
            <rect
              x={toX(-rCrit)}
              y={pad.top}
              width={toX(-userB) - toX(-rCrit)}
              height={innerH}
              fill="#dc2626"
              fillOpacity="0.06"
            />
            <rect
              x={toX(userB)}
              y={pad.top}
              width={toX(rCrit) - toX(userB)}
              height={innerH}
              fill="#dc2626"
              fillOpacity="0.06"
            />
          </>
        )}
      </svg>

    </div>
  );
}
