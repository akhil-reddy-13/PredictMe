import { describe, expect, it } from 'vitest';
import {
  correlationPValue,
  nullDistributionThreshold,
  samplePearsonR,
  simulationPValue,
} from './correlation';
import { generateScatter } from './scatter';
import { empiricalUserBoundary } from './distribution';
import type { RoundRecord } from './types';

describe('simulationPValue', () => {
  it('gives smaller p for large |r| than for small |r|', () => {
    const small = simulationPValue(0.05, 48, 3000);
    const large = simulationPValue(0.55, 48, 3000);
    expect(large).toBeLessThan(small);
  });
});

describe('correlationPValue', () => {
  it('returns a probability in [0, 1]', () => {
    const p = correlationPValue(0.3, 48);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });
});

describe('empiricalUserBoundary', () => {
  it('lies between noise and pattern abs-r when both exist', () => {
    const records: RoundRecord[] = [
      {
        roundId: 0,
        rho: 0,
        hasPattern: false,
        call: 'noise',
        correct: true,
        sampleR: 0.1,
        rCritical: 0.28,
        machineCall: 'noise',
        machineCorrect: true,
      },
      {
        roundId: 1,
        rho: 0,
        hasPattern: false,
        call: 'pattern',
        correct: false,
        sampleR: 0.2,
        rCritical: 0.28,
        machineCall: 'noise',
        machineCorrect: true,
      },
    ];
    const b = empiricalUserBoundary(records);
    expect(b).not.toBeNull();
    expect(b!).toBeGreaterThan(0.1);
    expect(b!).toBeLessThanOrEqual(0.2);
  });
});

describe('nullDistributionThreshold', () => {
  it('targets ~5% false alarms on noise (null draws)', () => {
    const threshold = nullDistributionThreshold(48, 0.05, 4000);
    expect(threshold).toBeGreaterThan(0.2);
    expect(threshold).toBeLessThan(0.4);

    let falseAlarms = 0;
    const trials = 800;
    for (let i = 0; i < trials; i++) {
      const r = samplePearsonR(generateScatter(0, 48));
      if (Math.abs(r) >= threshold) falseAlarms++;
    }
    const rate = falseAlarms / trials;
    expect(rate).toBeGreaterThan(0.02);
    expect(rate).toBeLessThan(0.12);
  });
});
