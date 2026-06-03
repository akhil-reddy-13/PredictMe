import {
  correlationCriticalValue,
  machineDetectorCall,
  machineWouldBeCorrect,
  samplePearsonR,
} from './correlation';
import { createRoundSchedule } from './scatter';
import { POINT_COUNT } from './scatter';
import type { RoundRecord, SessionState, UserCall } from './types';

export function initialState(): SessionState {
  return {
    roundIndex: 0,
    schedule: createRoundSchedule(),
    records: [],
    lrWeights: [0, 0],
  };
}

export function currentRound(state: SessionState) {
  return state.schedule[state.roundIndex] ?? null;
}

export function isGameComplete(state: SessionState): boolean {
  return state.roundIndex >= state.schedule.length;
}

export interface RoundResult {
  call: UserCall;
  correct: boolean;
  hasPattern: boolean;
  rho: number;
  sampleR: number;
  rCritical: number;
  machineCall: UserCall;
  machineCorrect: boolean;
  spuriousSlope: boolean;
}

export function submitAnswer(
  state: SessionState,
  call: UserCall
): { state: SessionState; result: RoundResult } {
  const round = currentRound(state);
  if (!round) {
    throw new Error('No round available');
  }

  const correct = round.hasPattern ? call === 'pattern' : call === 'noise';
  const sampleR = samplePearsonR(round.points);
  const rCritical = correlationCriticalValue(POINT_COUNT);
  const machineCall = machineDetectorCall(sampleR, POINT_COUNT);
  const machineCorrect = machineWouldBeCorrect(
    sampleR,
    round.hasPattern,
    POINT_COUNT
  );
  const spuriousSlope =
    !round.hasPattern && Math.abs(sampleR) >= rCritical;

  const record: RoundRecord = {
    roundId: round.id,
    rho: round.rho,
    hasPattern: round.hasPattern,
    call,
    correct,
    sampleR,
    rCritical,
    machineCall,
    machineCorrect,
  };

  return {
    state: {
      ...state,
      roundIndex: state.roundIndex + 1,
      records: [...state.records, record],
    },
    result: {
      call,
      correct,
      hasPattern: round.hasPattern,
      rho: round.rho,
      sampleR,
      rCritical,
      machineCall,
      machineCorrect,
      spuriousSlope,
    },
  };
}
