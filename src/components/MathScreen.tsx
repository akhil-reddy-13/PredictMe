import { nullDistributionThreshold } from '../engine/correlation';
import { POINT_COUNT } from '../engine/scatter';
import { sessionAnalysis } from '../engine/stats';
import type { SessionState } from '../engine/types';

interface MathScreenProps {
  state: SessionState | null;
  onBack: () => void;
}

export function MathScreen({ state, onBack }: MathScreenProps) {
  const analysis = state ? sessionAnalysis(state) : null;
  const rCrit = nullDistributionThreshold(POINT_COUNT);

  return (
    <div className="mx-auto min-h-svh max-w-2xl px-5 py-12 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 text-sm text-neutral-500 transition hover:text-neutral-800"
      >
        ← back
      </button>

      <h1 className="mb-8 text-2xl font-medium text-neutral-900">
        the statistics
      </h1>

      <div className="space-y-8 text-neutral-700">
        <Section title="How each plot is generated">
          <p>
            Each round draws {POINT_COUNT} points from a bivariate normal with
            correlation ρ. When ρ = 0, X and Y are independent. When ρ &gt; 0,
            there is a real linear relationship.
          </p>
          <Formula>(X, Y) ~ N(0, Σ), Σ = [[1, ρ], [ρ, 1]]</Formula>
        </Section>

        <Section title="Tilt score (sample correlation r̂)">
          <p>
            We summarize each plot with Pearson r̂ — how diagonal the cloud
            looks. This is what the red line in ghost plots approximates.
          </p>
        </Section>

        <Section title={`Cutoff from the null distribution (±${rCrit.toFixed(2)})`}>
          <p>
            Under H₀: ρ = 0, r̂ has a sampling distribution. We approximate it
            by drawing many random noise plots (bootstrap-style: resample the
            null over and over) and take the 95th percentile of |r̂| as r*.
            Call pattern only past that line — about 5% false alarms on noise.
          </p>
        </Section>

        <Section title="False-positive rate">
          <p>
            On noise trials: (# times you said pattern) / (# noise trials). The
            test targets ~5%; humans often land around 30–40%.
          </p>
        </Section>

        <Section title="Psychometric curve">
          <p>
            Logistic regression on your 20 responses: P(pattern | ρ) = σ(w₀ +
            w₁ρ), fit by gradient ascent on log-likelihood.
          </p>
          {analysis && (
            <p className="mt-2 font-mono text-sm">
              Your fit: w₀ = {analysis.weights[0].toFixed(2)}, w₁ ={' '}
              {analysis.weights[1].toFixed(2)}
            </p>
          )}
        </Section>

        <Section title="CS109 concepts">
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Bivariate normal / correlation ρ</li>
            <li>Sampling distribution of r̂ under H₀</li>
            <li>Null sampling distribution, p-values, Type I error (FPR)</li>
            <li>Logistic regression / psychometric function</li>
            <li>Human vs. optimal decision boundary</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-medium text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="my-3 rounded-lg bg-neutral-100 px-4 py-3 font-mono text-sm text-neutral-800">
      {children}
    </p>
  );
}
