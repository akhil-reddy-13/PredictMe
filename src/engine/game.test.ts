import { describe, expect, it } from 'vitest';
import { detectionThreshold, fitPsychometric, lrPredict } from './logistic';
import { generateScatter } from './scatter';
import {
  falsePositiveRate,
  isCorrect,
  overallAccuracy,
} from './stats';
import { initialState, submitAnswer } from './game';

describe('generateScatter', () => {
  it('returns the requested number of points', () => {
    expect(generateScatter(0, 30)).toHaveLength(30);
  });

  it('produces higher sample correlation when rho is large', () => {
    const pts = generateScatter(0.8, 200);
    const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    let num = 0;
    let dx = 0;
    let dy = 0;
    for (const p of pts) {
      const vx = p.x - mx;
      const vy = p.y - my;
      num += vx * vy;
      dx += vx * vx;
      dy += vy * vy;
    }
    const r = num / Math.sqrt(dx * dy);
    expect(r).toBeGreaterThan(0.5);
  });
});

describe('isCorrect', () => {
  it('pattern call correct when signal exists', () => {
    expect(isCorrect(true, 'pattern')).toBe(true);
    expect(isCorrect(false, 'noise')).toBe(true);
    expect(isCorrect(false, 'pattern')).toBe(false);
  });
});

describe('psychometric fit', () => {
  it('increases P(pattern) with rho for synthetic yes-bias', () => {
    const rhos = [0, 0, 0.3, 0.5, 0.7, 0.8];
    const labels = [0, 1, 1, 1, 1, 1];
    const w = fitPsychometric(rhos, labels);
    expect(lrPredict(w, 0.7)).toBeGreaterThan(lrPredict(w, 0));
  });

  it('finds a detection threshold when slope is positive', () => {
    const w: [number, number] = [-2, 4];
    const t = detectionThreshold(w, 0.75);
    expect(t).not.toBeNull();
    expect(lrPredict(w, t!)).toBeCloseTo(0.75, 1);
  });
});

describe('full session', () => {
  it('completes 20 rounds', () => {
    let state = initialState();
    expect(state.schedule).toHaveLength(20);
    for (let i = 0; i < 20; i++) {
      const call = i % 3 === 0 ? 'pattern' : 'noise';
      ({ state } = submitAnswer(state, call as 'pattern' | 'noise'));
    }
    expect(state.records).toHaveLength(20);
    expect(overallAccuracy(state.records)).toBeGreaterThanOrEqual(0);
    expect(falsePositiveRate(state.records)).toBeGreaterThanOrEqual(0);
  });
});
