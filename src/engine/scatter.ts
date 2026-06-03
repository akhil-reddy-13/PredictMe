import type { Point, Round } from './types';
import { TOTAL_ROUNDS } from './types';

export const POINT_COUNT = 48;

export function gaussianRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Bivariate normal with correlation rho, margins standard normal. */
export function generateScatter(rho: number, n = POINT_COUNT): Point[] {
  const points: Point[] = [];
  const clamped = Math.max(-0.999, Math.min(0.999, rho));
  const scale = Math.sqrt(1 - clamped * clamped);

  for (let i = 0; i < n; i++) {
    const x = gaussianRandom();
    const z = gaussianRandom();
    const y = clamped * x + scale * z;
    points.push({ x, y });
  }
  return points;
}

const PATTERN_RHOS = [0.25, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function createRoundSchedule(): Round[] {
  const noiseCount = TOTAL_ROUNDS - PATTERN_RHOS.length;
  const noiseRounds: Round[] = Array.from({ length: noiseCount }, (_, i) => ({
    id: i,
    rho: 0,
    points: generateScatter(0),
    hasPattern: false,
  }));

  const patternRounds: Round[] = PATTERN_RHOS.map((rho, i) => ({
    id: noiseCount + i,
    rho,
    points: generateScatter(rho),
    hasPattern: true,
  }));

  return shuffle([...noiseRounds, ...patternRounds]).map((r, i) => ({
    ...r,
    id: i,
  }));
}

/** Map data coords to SVG viewBox 0..100 with padding. */
export function toPlotCoords(
  points: Point[],
  padding = 12
): { px: number; py: number }[] {
  if (points.length === 0) return [];

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const inner = 100 - 2 * padding;

  return points.map((p) => ({
    px: padding + ((p.x - minX) / rangeX) * inner,
    py: padding + inner - ((p.y - minY) / rangeY) * inner,
  }));
}
