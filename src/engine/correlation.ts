import { generateScatter, POINT_COUNT } from './scatter';
import type { Point, UserCall } from './types';

export { POINT_COUNT };

/** Sample Pearson correlation r̂ from observed points. */
export function samplePearsonR(points: Point[]): number {
  const n = points.length;
  if (n < 2) return 0;

  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  const mx = sx / n;
  const my = sy / n;

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - mx;
    const dy = p.y - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }

  if (sxx === 0 || syy === 0) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

let cachedThreshold: { n: number; alpha: number; value: number } | null = null;

/**
 * Simulate r̂ under H₀: ρ = 0 (pure noise plots).
 * This is the sampling distribution we use throughout the app.
 */
export function simulateNullCorrelations(
  n = POINT_COUNT,
  iterations = 5000
): number[] {
  const out: number[] = [];
  for (let i = 0; i < iterations; i++) {
    out.push(samplePearsonR(generateScatter(0, n)));
  }
  return out;
}

/**
 * Cutoff from the null sampling distribution: (1−α) quantile of |r̂|.
 * Calling "pattern" when |r̂| exceeds this ≈ α false-alarm rate on noise.
 */
export function nullDistributionThreshold(
  n = POINT_COUNT,
  alpha = 0.05,
  iterations = 5000
): number {
  if (
    cachedThreshold &&
    cachedThreshold.n === n &&
    cachedThreshold.alpha === alpha
  ) {
    return cachedThreshold.value;
  }

  const absSamples = simulateNullCorrelations(n, iterations).map(Math.abs);
  absSamples.sort((a, b) => a - b);
  const idx = Math.ceil((1 - alpha) * absSamples.length) - 1;
  const value = absSamples[Math.max(0, Math.min(idx, absSamples.length - 1))];
  cachedThreshold = { n, alpha, value };
  return value;
}

/** Alias used in records/UI — same as simulated null threshold. */
export function correlationCriticalValue(
  n: number,
  alpha = 0.05
): number {
  return nullDistributionThreshold(n, alpha);
}

/**
 * Simulation-based p-value: under H₀, what fraction of |r̂| is at least as
 * extreme as the observed tilt? (bootstrap-style null check.)
 */
export function simulationPValue(
  observedR: number,
  n = POINT_COUNT,
  iterations = 5000
): number {
  const absObs = Math.abs(observedR);
  let extreme = 0;
  for (let i = 0; i < iterations; i++) {
    if (Math.abs(samplePearsonR(generateScatter(0, n))) >= absObs) {
      extreme++;
    }
  }
  return extreme / iterations;
}

export function correlationPValue(r: number, n: number): number {
  return simulationPValue(r, n);
}

export function machineDetectorCall(
  sampleR: number,
  n = POINT_COUNT
): UserCall {
  const threshold = nullDistributionThreshold(n);
  return Math.abs(sampleR) >= threshold ? 'pattern' : 'noise';
}

export function machineWouldBeCorrect(
  sampleR: number,
  hasPattern: boolean,
  n = POINT_COUNT
): boolean {
  const call = machineDetectorCall(sampleR, n);
  return hasPattern ? call === 'pattern' : call === 'noise';
}

export function clearCorrelationCache(): void {
  cachedThreshold = null;
}

/** OLS regression through points for ghost plot overlay. */
export function fitRegressionLine(points: Point[]): {
  slope: number;
  intercept: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  let mx = 0;
  let my = 0;
  for (const p of points) {
    mx += p.x;
    my += p.y;
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - mx;
    sxx += dx * dx;
    sxy += dx * (p.y - my);
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  return { slope, intercept: my - slope * mx };
}
