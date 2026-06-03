import { useEffect, useState } from 'react';
import type { GhostRound } from '../engine/stats';
import { toPlotCoords } from '../engine/scatter';
import { ScatterPlotDetailed } from './ScatterPlotDetailed';

interface GhostsGalleryProps {
  ghosts: GhostRound[];
}

export function GhostsGallery({ ghosts }: GhostsGalleryProps) {
  const [selected, setSelected] = useState<GhostRound | null>(null);

  if (ghosts.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        No ghosts this run — you never called &quot;pattern&quot; on pure noise.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {ghosts.map((ghost) => (
          <button
            key={ghost.roundId}
            type="button"
            onClick={() => setSelected(ghost)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-neutral-900 hover:shadow-sm"
          >
            <MiniThumb points={ghost.points} />
          </button>
        ))}
      </div>

      {selected && (
        <GhostModal ghost={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function MiniThumb({ points }: { points: GhostRound['points'] }) {
  const plot = toPlotCoords(points, 8);
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect width="100" height="100" fill="#f5f5f5" />
      {plot.map((p: { px: number; py: number }, i: number) => (
        <circle key={i} cx={p.px} cy={p.py} r="2.5" fill="#525252" opacity="0.7" />
      ))}
    </svg>
  );
}

function GhostModal({
  ghost,
  onClose,
}: {
  ghost: GhostRound;
  onClose: () => void;
}) {
  const notSignificant = ghost.pValue > 0.05;
  const absR = Math.abs(ghost.sampleR);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] max-w-sm w-full overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium text-neutral-900">
          a ghost you saw
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          Pure noise — but you called pattern.
        </p>

        <div className="my-4">
          <ScatterPlotDetailed points={ghost.points} />
        </div>
        <p className="text-center text-xs text-neutral-500">
          red line = the slope your eyes reacted to
        </p>

        <div className="mt-4 space-y-3 text-sm text-neutral-600">
          <p>
            <strong className="text-neutral-800">Tilt score:</strong>{' '}
            {ghost.sampleR >= 0 ? '+' : ''}
            {ghost.sampleR.toFixed(2)} (how diagonal the cloud looked; 0 =
            blob).
          </p>
          <p>
            <strong className="text-neutral-800">Null cutoff:</strong> ±
            {ghost.rCritical.toFixed(2)} (95th percentile of |r̂| from many null
            draws). Yours was {absR.toFixed(2)}.
          </p>
          <p
            className={
              notSignificant
                ? 'rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950'
                : ''
            }
          >
            <strong className="text-neutral-800">Simulation p-value:</strong>{' '}
            {ghost.pValue.toFixed(2)}
            {notSignificant
              ? ' — share of null draws at least this extreme; typical for noise.'
              : ' — rare under H₀, but ρ was still 0.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          close
        </button>
      </div>
    </div>
  );
}
