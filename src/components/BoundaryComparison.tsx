import type { RoundRecord } from '../engine/types';
import { cumulativeErrorRate } from '../engine/stats';

interface BoundaryComparisonProps {
  records: RoundRecord[];
  compact?: boolean;
}

export function BoundaryComparison({ records, compact }: BoundaryComparisonProps) {
  const humanErr = cumulativeErrorRate(records, 'human');
  const machineErr = cumulativeErrorRate(records, 'machine');
  const gap = humanErr - machineErr;
  const n = records.length;

  return (
    <div className="space-y-3 border-t border-neutral-200 pt-6">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          error rate
        </p>
        {n > 0 && (
          <p className="font-mono text-xs text-neutral-500">
            gap +{Math.round(gap * 100)}%
          </p>
        )}
      </div>

      <BarRow
        label="You"
        value={humanErr}
        empty={n === 0}
        barClass="bg-neutral-800"
      />
      <BarRow
        label="Null rule (5% false alarms on noise)"
        value={machineErr}
        empty={n === 0}
        barClass="bg-neutral-400"
      />

      {!compact && n > 0 && (
        <p className="text-xs leading-relaxed text-neutral-500">
          The null cutoff ignores weak tilts; you often react to slopes in
          the visual middle — that gap is small-sample overfitting.
        </p>
      )}
    </div>
  );
}

function BarRow({
  label,
  value,
  empty,
  barClass,
}: {
  label: string;
  value: number;
  empty: boolean;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="font-mono tabular-nums text-neutral-900">
          {empty ? '—' : `${Math.round(value * 100)}% wrong`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        {!empty && (
          <div
            className={`h-full rounded-full transition-all duration-500 ${barClass}`}
            style={{ width: `${value * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
