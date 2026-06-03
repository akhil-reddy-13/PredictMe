import { nullDistributionThreshold } from '../engine/correlation';
import { POINT_COUNT } from '../engine/scatter';
import { NULL_BOOTSTRAP_B } from '../siteLinks';
import { sessionAnalysis } from '../engine/stats';
import type { SessionState } from '../engine/types';
import { WriteupLink } from './WriteupLink';

interface MathScreenProps {
  state: SessionState | null;
  onBack: () => void;
}

export function MathScreen({ state, onBack }: MathScreenProps) {
  const analysis = state ? sessionAnalysis(state) : null;
  const rStar = nullDistributionThreshold(POINT_COUNT);

  return (
    <div className="mx-auto min-h-svh max-w-lg px-5 py-12 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 text-sm text-neutral-500 transition hover:text-neutral-800"
      >
        ← back
      </button>

      <h1 className="mb-4 text-2xl font-medium text-neutral-900">
        the statistics
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-neutral-600">
        Short version of what the app does. Derivations and references are in
        the write-up.
      </p>

      <ul className="list-inside list-disc space-y-3 text-sm leading-relaxed text-neutral-700">
        <li>
          <strong className="text-neutral-900">Plots:</strong> {POINT_COUNT}{' '}
          points from a bivariate normal; 20 rounds (8 noise, 12 pattern ρ ∈
          [0.25, 0.85]), shuffled.
        </li>
        <li>
          <strong className="text-neutral-900">Tilt score:</strong> sample
          Pearson r̂ on each plot.
        </li>
        <li>
          <strong className="text-neutral-900">Machine rule:</strong> simulate{' '}
          {NULL_BOOTSTRAP_B.toLocaleString()} null draws (ρ = 0); call pattern
          only if |r̂| ≥ r* (95th percentile ≈ ±{rStar.toFixed(2)} this run).
        </li>
        <li>
          <strong className="text-neutral-900">Ghosts:</strong> simulation
          p-value = fraction of null draws at least as extreme as your tilt.
        </li>
        <li>
          <strong className="text-neutral-900">Your FPR:</strong> Type I rate —
          pattern calls on noise trials.
        </li>
        <li>
          <strong className="text-neutral-900">Psychometric curve:</strong>{' '}
          logistic regression on your 20 answers (gradient ascent, 200 epochs,
          η = 0.15); ρ where P(pattern) = 0.5 is your detection threshold.
        </li>
      </ul>

      {analysis && (
        <p className="mt-6 font-mono text-xs text-neutral-500">
          This session: r* = {analysis.rCrit.toFixed(2)}, FPR ={' '}
          {(analysis.fpRate * 100).toFixed(0)}%
          {analysis.threshold != null &&
            `, detection ρ ≈ ${analysis.threshold.toFixed(2)}`}
        </p>
      )}

      <div className="mt-10">
        <WriteupLink variant="footer" className="border-none pt-0" />
      </div>
    </div>
  );
}
