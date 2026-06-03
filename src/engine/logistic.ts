export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function lrPredict(weights: number[], rho: number): number {
  const [bias, coef] = weights;
  return sigmoid(bias + coef * rho);
}

/** Gradient ascent on log-likelihood for P(y=1|x)=sigmoid(w·[1,rho]). */
export function fitPsychometric(
  rhos: number[],
  labels: number[],
  iterations = 200,
  lr = 0.15
): [number, number] {
  let weights: [number, number] = [0, 0];
  if (rhos.length === 0) return weights;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < rhos.length; i++) {
      const pred = lrPredict(weights, rhos[i]);
      const error = labels[i] - pred;
      weights = [
        weights[0] + lr * error,
        weights[1] + lr * error * rhos[i],
      ];
    }
  }
  return weights;
}

export function psychometricCurve(
  weights: [number, number],
  rhoMin = 0,
  rhoMax = 1,
  steps = 40
): { rho: number; pPattern: number }[] {
  const points: { rho: number; pPattern: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const rho = rhoMin + (i / steps) * (rhoMax - rhoMin);
    points.push({ rho, pPattern: lrPredict(weights, rho) });
  }
  return points;
}

/** Smallest rho > 0 where fitted P(say pattern) >= target (write-up uses 0.5). */
export function detectionThreshold(
  weights: [number, number],
  target = 0.5
): number | null {
  const [bias, coef] = weights;
  if (Math.abs(coef) < 1e-6) return null;
  const logit = Math.log(target / (1 - target));
  const rho = (logit - bias) / coef;
  if (rho <= 0 || rho > 1) {
    for (let r = 0.05; r <= 0.95; r += 0.01) {
      if (lrPredict(weights, r) >= target) return r;
    }
    return null;
  }
  return Math.min(1, Math.max(0, rho));
}
