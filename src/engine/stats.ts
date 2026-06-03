import { correlationCriticalValue, correlationPValue } from './correlation';
import { empiricalUserBoundary } from './distribution';
import { detectionThreshold, fitPsychometric, lrPredict } from './logistic';
import { POINT_COUNT } from './scatter';
import type { Point, RoundRecord, SessionState } from './types';

export function isCorrect(hasPattern: boolean, call: 'pattern' | 'noise'): boolean {
  return hasPattern ? call === 'pattern' : call === 'noise';
}

export function falsePositiveRate(records: RoundRecord[]): number {
  const noise = records.filter((r) => !r.hasPattern);
  if (noise.length === 0) return 0;
  const fp = noise.filter((r) => r.call === 'pattern').length;
  return fp / noise.length;
}

export function overallAccuracy(records: RoundRecord[]): number {
  if (records.length === 0) return 0;
  return records.filter((r) => r.correct).length / records.length;
}

export function hitRateByRho(records: RoundRecord[]): { rho: number; rate: number; n: number }[] {
  const byRho = new Map<number, { correct: number; n: number }>();
  for (const r of records) {
    const key = Math.round(r.rho * 100) / 100;
    const cur = byRho.get(key) ?? { correct: 0, n: 0 };
    cur.n += 1;
    if (r.correct) cur.correct += 1;
    byRho.set(key, cur);
  }
  return [...byRho.entries()]
    .map(([rho, { correct, n }]) => ({ rho, rate: correct / n, n }))
    .sort((a, b) => a.rho - b.rho);
}

export function fitSessionPsychometric(state: SessionState): [number, number] {
  const rhos = state.records.map((r) => r.rho);
  const labels = state.records.map((r) => (r.call === 'pattern' ? 1 : 0));
  return fitPsychometric(rhos, labels);
}

export function cumulativeErrorRate(
  records: RoundRecord[],
  key: 'human' | 'machine'
): number {
  if (records.length === 0) return 0;
  const wrong =
    key === 'human'
      ? records.filter((r) => !r.correct).length
      : records.filter((r) => !r.machineCorrect).length;
  return wrong / records.length;
}

/** Human wrong − machine wrong (excess overfitting cost). */
export function overfitGap(records: RoundRecord[]): number {
  return cumulativeErrorRate(records, 'human') - cumulativeErrorRate(records, 'machine');
}

/** Noise trials where |r̂| crossed threshold — phantom pattern in data. */
export function spuriousSlopeCount(records: RoundRecord[]): number {
  return records.filter((r) => !r.hasPattern && Math.abs(r.sampleR) >= r.rCritical)
    .length;
}

/** You said pattern on a spurious-slope noise trial. */
export function humanOverfitOnSpurious(records: RoundRecord[]): number {
  return records.filter(
    (r) =>
      !r.hasPattern &&
      Math.abs(r.sampleR) >= r.rCritical &&
      r.call === 'pattern'
  ).length;
}

export interface GhostRound {
  roundId: number;
  points: Point[];
  sampleR: number;
  rCritical: number;
  pValue: number;
}

export function getGhostRounds(state: SessionState): GhostRound[] {
  return state.records
    .filter((r) => !r.hasPattern && r.call === 'pattern')
    .map((r) => {
      const round = state.schedule.find((s) => s.id === r.roundId);
      return {
        roundId: r.roundId,
        points: round?.points ?? [],
        sampleR: r.sampleR,
        rCritical: r.rCritical,
        pValue: correlationPValue(r.sampleR, POINT_COUNT),
      };
    })
    .filter((g) => g.points.length > 0);
}

export function sessionAnalysis(state: SessionState) {
  const weights =
    state.records.length >= 3
      ? fitSessionPsychometric(state)
      : state.lrWeights;
  const fpRate = falsePositiveRate(state.records);
  const accuracy = overallAccuracy(state.records);
  const byRho = hitRateByRho(state.records);
  const threshold = detectionThreshold(weights, 0.5);
  const noiseTrials = state.records.filter((r) => !r.hasPattern).length;
  const patternSaidOnNoise = Math.round(fpRate * noiseTrials);
  const expectedFp = 0.05 * noiseTrials;

  const humanError = cumulativeErrorRate(state.records, 'human');
  const machineError = cumulativeErrorRate(state.records, 'machine');
  const gap = overfitGap(state.records);
  const rCrit = correlationCriticalValue(POINT_COUNT);
  const userBoundary = empiricalUserBoundary(state.records);
  const ghosts = getGhostRounds(state);

  return {
    weights,
    fpRate,
    accuracy,
    byRho,
    threshold,
    noiseTrials,
    patternSaidOnNoise,
    expectedFp,
    pPatternAtZero: lrPredict(weights, 0),
    humanError,
    machineError,
    gap,
    spuriousCount: spuriousSlopeCount(state.records),
    humanOverfitSpurious: humanOverfitOnSpurious(state.records),
    rCrit,
    userBoundary,
    ghosts,
  };
}
