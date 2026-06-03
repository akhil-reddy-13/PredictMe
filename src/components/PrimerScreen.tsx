import { nullDistributionThreshold } from '../engine/correlation';
import { POINT_COUNT } from '../engine/scatter';

interface PrimerScreenProps {
  onStart: () => void;
  onBack: () => void;
}

export function PrimerScreen({ onStart, onBack }: PrimerScreenProps) {
  const rCrit = nullDistributionThreshold(POINT_COUNT);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-4 text-left">
          <h2 className="text-xl font-medium text-neutral-900">
            how we tell pattern from noise
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Each round shows {POINT_COUNT} dots from a bivariate normal. This
            session has 8 <strong className="text-neutral-800">noise</strong>{' '}
            rounds (ρ = 0) and 12{' '}
            <strong className="text-neutral-800">pattern</strong> rounds (real
            correlation), shuffled.
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            <strong className="text-neutral-800">You</strong> judge by eye:
            pattern or noise. That&apos;s the game.
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            <strong className="text-neutral-800">Behind the scenes,</strong> we
            also measure how diagonal each cloud looks (a tilt score from −1 to
            +1). On noise, that score usually stays near zero — but small random
            tilts happen all the time — that is the sampling distribution of r̂
            under noise. We draw many random noise plots (bootstrap-style) to
            learn that distribution (5,000 null draws, like the write-up), and
            only call
            &quot;pattern&quot; if the tilt is at least about{' '}
            <span className="font-mono text-neutral-900">
              ±{rCrit.toFixed(2)}
            </span>{' '}
            (so we don&apos;t chase phantom lines).
          </p>
          <p className="text-sm leading-relaxed text-neutral-500">
            After 20 rounds, we&apos;ll show how your eyes compared to that
            rule — including plots where you called pattern on pure noise.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:border-neutral-500"
          >
            back
          </button>
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white hover:bg-neutral-700"
          >
            start — 20 rounds
          </button>
        </div>
      </div>
    </div>
  );
}
