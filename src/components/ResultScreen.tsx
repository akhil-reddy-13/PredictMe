import { useEffect, useState } from 'react';
import { sessionAnalysis } from '../engine/stats';
import type { SessionState } from '../engine/types';
import { TOTAL_ROUNDS } from '../engine/types';
import { BoundaryComparison } from './BoundaryComparison';
import { GhostsGallery } from './GhostsGallery';
import { PsychometricChart } from './PsychometricChart';
import { SamplingDistributionChart } from './SamplingDistributionChart';
import { WriteupLink } from './WriteupLink';

interface ResultScreenProps {
  state: SessionState;
  onPlayAgain: () => void;
  onSeeMath: () => void;
}

type RevealStep = 0 | 1 | 2 | 3 | 4;

export function ResultScreen({
  state,
  onPlayAgain,
  onSeeMath,
}: ResultScreenProps) {
  const [step, setStep] = useState<RevealStep>(0);
  const analysis = sessionAnalysis(state);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const fpPct = Math.round(analysis.fpRate * 100);
  const accPct = Math.round(analysis.accuracy * 100);
  const noiseTilts = state.records
    .filter((r) => !r.hasPattern)
    .map((r) => r.sampleR);

  return (
    <div className="mx-auto min-h-svh max-w-lg px-5 py-12 sm:px-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
          your eyes see patterns in noise.
        </h1>
        <p className="text-neutral-600">
          Not because you&apos;re careless — because human vision is built to
          find structure, even when there isn&apos;t any.
        </p>
      </div>

      {step >= 1 && (
        <section className="mt-10 space-y-4 border-t border-neutral-200 pt-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
            the embarrassing number
          </h2>
          <p className="font-mono text-3xl font-medium text-neutral-900">
            {fpPct}%
          </p>
          <p className="text-neutral-700">
            false-positive rate (Type I): you called{' '}
            <span className="font-medium text-neutral-900">pattern</span> on pure
            noise {analysis.patternSaidOnNoise} out of {analysis.noiseTrials}{' '}
            times.
          </p>
          <p className="text-sm leading-relaxed text-neutral-500">
            On random plots, the null-distribution rule only makes that mistake
            about 5% of the time (cutoff ±{analysis.rCrit.toFixed(2)} from many
            draws under ρ = 0). You said pattern {fpPct}% of the time on noise
            — your bar is lower than that line.
          </p>

          <div className="pt-6">
            <h3 className="mb-1 text-sm font-medium text-neutral-900">
              the ghosts you saw
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-neutral-500">
              Thumbnails below are the actual random plots where you clicked
              pattern. Open one to see the slope your eyes picked up — and how
              weak the tilt score really was.
            </p>
            <GhostsGallery ghosts={analysis.ghosts} />
          </div>
        </section>
      )}

      {step >= 2 && (
        <section className="mt-10 space-y-6 border-t border-neutral-200 pt-10">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              you vs. the null rule
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Same 20 rounds — your error rate compared to a cutoff
              (±{analysis.rCrit.toFixed(2)}) from the null sampling distribution.
            </p>
          </div>
          <BoundaryComparison records={state.records} />

          <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-900">
              where tilts usually land
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-neutral-500">
              The gray curve is the sampling distribution of r̂ under ρ = 0.
              Green lines = null cutoff. Red lines = your approximate
              cutoff this session. Orange dots = noise plots where you said
              pattern.
            </p>
            <SamplingDistributionChart
              rCrit={analysis.rCrit}
              userBoundary={analysis.userBoundary}
              sessionTilts={state.records.map((r) => r.sampleR)}
              noiseTilts={noiseTilts}
            />
          </div>
        </section>
      )}

      {step >= 3 && (
        <section className="mt-10 space-y-2 border-t border-neutral-200 pt-10 font-mono text-sm text-neutral-700">
          <h2 className="mb-2 font-sans text-sm font-medium uppercase tracking-wider text-neutral-400">
            overall score
          </h2>
          <p>
            accuracy:{' '}
            <span className="text-neutral-900">{accPct}%</span> (
            {state.records.filter((r) => r.correct).length}/{TOTAL_ROUNDS})
          </p>
          {analysis.threshold != null && (
            <p className="font-sans text-sm leading-relaxed text-neutral-600">
              Your fitted curve crosses P(pattern) = 0.5 near ρ ≈{' '}
              {analysis.threshold.toFixed(2)} — weaker real patterns were easier
              to miss.
            </p>
          )}
        </section>
      )}

      {step >= 4 && (
        <section className="mt-10 space-y-4 border-t border-neutral-200 pt-10">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              your detection curve
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              How often you said &quot;pattern&quot; as real correlation (ρ)
              increases. A steep rise on the right is good; staying high on the
              left means you call pattern even on noise.
            </p>
          </div>
          <PsychometricChart
            weights={analysis.weights}
            empirical={analysis.byRho.map((b) => ({
              ...b,
              rate: b.rho === 0 ? 1 - analysis.fpRate : b.rate,
            }))}
            threshold={analysis.threshold}
          />
          <p className="text-sm text-neutral-600">
            At ρ = 0 (noise), the model estimates you still say pattern{' '}
            <span className="font-mono text-neutral-900">
              {(analysis.pPatternAtZero * 100).toFixed(0)}%
            </span>{' '}
            of the time.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              play again
            </button>
            <button
              type="button"
              onClick={onSeeMath}
              className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-500"
            >
              see the math
            </button>
          </div>
          <WriteupLink variant="footer" className="mt-8" />
        </section>
      )}
    </div>
  );
}
