import { psychometricCurve } from '../engine/logistic';

interface PsychometricChartProps {
  weights: [number, number];
  empirical?: { rho: number; rate: number; n: number }[];
  threshold?: number | null;
}

export function PsychometricChart({
  weights,
  empirical = [],
  threshold,
}: PsychometricChartProps) {
  const width = 400;
  const height = 160;
  const pad = { top: 12, right: 16, bottom: 28, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const curve = psychometricCurve(weights, 0, 1, 50);

  const toX = (rho: number) => pad.left + rho * innerW;
  const toY = (p: number) => pad.top + innerH - p * innerH;

  const pathD = curve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(pt.rho)} ${toY(pt.pPattern)}`)
    .join(' ');

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md text-neutral-800"
        role="img"
        aria-label="Psychometric curve"
      >
        <line
          x1={pad.left}
          y1={toY(0)}
          x2={pad.left + innerW}
          y2={toY(0)}
          stroke="#e5e5e5"
        />
        <line
          x1={pad.left}
          y1={toY(1)}
          x2={pad.left + innerW}
          y2={toY(1)}
          stroke="#e5e5e5"
          strokeDasharray="4 4"
        />
        <line
          x1={pad.left}
          y1={toY(0.75)}
          x2={pad.left + innerW}
          y2={toY(0.75)}
          stroke="#d4d4d4"
          strokeDasharray="2 3"
        />
        <text
          x={pad.left}
          y={height - 6}
          className="fill-neutral-400 text-[9px]"
        >
          ρ = 0 (noise)
        </text>
        <text
          x={pad.left + innerW}
          y={height - 6}
          textAnchor="end"
          className="fill-neutral-400 text-[9px]"
        >
          ρ = 1 (strong)
        </text>
        <text
          x={pad.left - 4}
          y={pad.top + innerH + 4}
          textAnchor="end"
          className="fill-neutral-400 text-[9px]"
        >
          % said pattern
        </text>
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {empirical.map((e) => (
          <circle
            key={e.rho}
            cx={toX(e.rho)}
            cy={toY(e.rho === 0 ? 1 - e.rate : e.rate)}
            r="4"
            className="fill-neutral-400 stroke-white stroke-[1.5]"
          />
        ))}
        {threshold != null && threshold > 0 && threshold <= 1 && (
          <>
            <line
              x1={toX(threshold)}
              y1={pad.top}
              x2={toX(threshold)}
              y2={pad.top + innerH}
              stroke="#a3a3a3"
              strokeDasharray="3 3"
            />
            <circle
              cx={toX(threshold)}
              cy={toY(0.75)}
              r="4"
              className="fill-neutral-900"
            />
          </>
        )}
      </svg>
      {threshold != null && (
        <p className="font-mono text-sm text-neutral-600">
          ~75% accurate at ρ ≈ {threshold.toFixed(2)}
        </p>
      )}
    </div>
  );
}
