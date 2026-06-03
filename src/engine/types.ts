export type UserCall = 'pattern' | 'noise';

export interface Point {
  x: number;
  y: number;
}

export interface Round {
  id: number;
  rho: number;
  points: Point[];
  hasPattern: boolean;
}

export interface RoundRecord {
  roundId: number;
  rho: number;
  hasPattern: boolean;
  call: UserCall;
  correct: boolean;
  sampleR: number;
  rCritical: number;
  machineCall: UserCall;
  machineCorrect: boolean;
}

export interface SessionState {
  roundIndex: number;
  schedule: Round[];
  records: RoundRecord[];
  lrWeights: [number, number]; // [bias, rhoCoef] for P(say pattern | rho)
}

export type GamePhase = 'intro' | 'primer' | 'playing' | 'result' | 'math';

export const TOTAL_ROUNDS = 20;
