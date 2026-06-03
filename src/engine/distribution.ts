import { clearCorrelationCache, samplePearsonR } from './correlation';
import { generateScatter, POINT_COUNT } from './scatter';
import type { RoundRecord } from './types';

export interface DensityPoint {
  x: number;
  y: number;
}

/** Histogram → smooth density curve (normalized to max 1). */
export function densityFromSamples(
  samples: number[],
  xMin: number,
  xMax: number,
  bins = 36
): DensityPoint[] {
  if (samples.length === 0) return [];
  const counts = new Array(bins).fill(0);
  const width = (xMax - xMin) / bins;
  for (const s of samples) {
    const v = Math.max(xMin, Math.min(xMax - 1e-9, s));
    const idx = Math.min(bins - 1, Math.floor((v - xMin) / width));
    counts[idx]++;
  }
  const max = Math.max(...counts, 1);
  return counts.map((c, i) => ({
    x: xMin + (i + 0.5) * width,
    y: c / max,
  }));
}

let cachedNull: number[] | null = null;
let cachedAlt: number[] | null = null;

export function sampleCorrelationUnderNull(
  n = POINT_COUNT,
  iterations = 5000
): number[] {
  if (cachedNull && cachedNull.length === iterations) return cachedNull;
  const out: number[] = [];
  for (let i = 0; i < iterations; i++) {
    out.push(samplePearsonR(generateScatter(0, n)));
  }
  cachedNull = out;
  return out;
}

export function sampleCorrelationUnderAlt(
  rho = 0.55,
  n = POINT_COUNT,
  iterations = 2500
): number[] {
  if (cachedAlt && cachedAlt.length === iterations) return cachedAlt;
  const out: number[] = [];
  for (let i = 0; i < iterations; i++) {
    out.push(samplePearsonR(generateScatter(rho, n)));
  }
  cachedAlt = out;
  return out;
}

export function clearDistributionCache(): void {
  cachedNull = null;
  cachedAlt = null;
}

export function clearAllSimulationCaches(): void {
  clearDistributionCache();
  clearCorrelationCache();
}

/**
 * Empirical |r̂| boundary: midpoint between the strongest noise you still
 * called "noise" and the weakest slope you called "pattern".
 */
export function empiricalUserBoundary(
  records: RoundRecord[]
): number | null {
  const pattern = records.filter((r) => r.call === 'pattern');
  const noise = records.filter((r) => r.call === 'noise');
  if (pattern.length === 0) return null;

  const minPatternAbs = Math.min(...pattern.map((r) => Math.abs(r.sampleR)));
  const maxNoiseAbs =
    noise.length > 0
      ? Math.max(...noise.map((r) => Math.abs(r.sampleR)))
      : 0;

  if (pattern.length > 0 && noise.length === 0) return minPatternAbs;
  return (minPatternAbs + maxNoiseAbs) / 2;
}
