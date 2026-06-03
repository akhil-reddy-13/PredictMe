import { useCallback, useEffect, useState } from 'react';
import { currentRound, submitAnswer } from '../engine/game';
import type { SessionState, UserCall } from '../engine/types';
import { TOTAL_ROUNDS } from '../engine/types';
import { BoundaryComparison } from './BoundaryComparison';
import { ScatterPlot } from './ScatterPlot';

interface GameScreenProps {
  state: SessionState;
  onAnswer: (call: UserCall) => ReturnType<typeof submitAnswer>['result'];
  onComplete: () => void;
}

export function GameScreen({ state, onAnswer, onComplete }: GameScreenProps) {
  const [flash, setFlash] = useState<ReturnType<typeof submitAnswer>['result'] | null>(null);
  const [locked, setLocked] = useState(false);

  const round = currentRound(state);
  const completed = state.records.length;

  const dismissFlash = useCallback(() => {
    setFlash(null);
    setLocked(false);
  }, []);

  useEffect(() => {
    if (!flash) return;

    const onKey = () => dismissFlash();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flash, dismissFlash]);

  useEffect(() => {
    if (flash) return;
    if (completed >= TOTAL_ROUNDS) {
      onComplete();
    }
  }, [completed, flash, onComplete]);

  const handleCall = useCallback(
    (call: UserCall) => {
      if (locked || !round) return;
      setLocked(true);
      const result = onAnswer(call);
      setFlash(result);
    },
    [locked, onAnswer, round]
  );

  const handleOverlayDismiss = useCallback(() => {
    dismissFlash();
  }, [dismissFlash]);

  if (!round && !flash) return null;

  return (
    <div className="relative mx-auto flex min-h-svh max-w-lg flex-col px-5 py-10 sm:px-6">
      {!flash && (
        <>
          <header className="mb-6 flex items-baseline justify-between font-mono text-sm text-neutral-500">
            <span>
              {completed + 1} / {TOTAL_ROUNDS}
            </span>
            <span>
              score: {state.records.filter((r) => r.correct).length}/{completed || 0}
            </span>
          </header>

          <p className="mb-6 text-center text-neutral-600">
            is there a real correlation here?
          </p>

          {round && <ScatterPlot points={round.points} />}

          <div className="mt-8 flex w-full max-w-xs mx-auto gap-4">
            <button
              type="button"
              disabled={locked}
              onClick={() => handleCall('pattern')}
              className="flex-1 rounded-xl border-2 border-neutral-900 bg-white py-4 font-mono text-sm font-medium tracking-wide transition hover:bg-neutral-900 hover:text-white disabled:opacity-40"
            >
              pattern
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={() => handleCall('noise')}
              className="flex-1 rounded-xl border-2 border-neutral-300 bg-white py-4 font-mono text-sm font-medium tracking-wide text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-40"
            >
              noise
            </button>
          </div>

          <div className="mt-10">
            <BoundaryComparison records={state.records} compact />
          </div>
        </>
      )}

      {flash && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex cursor-default flex-col items-center justify-center bg-white/90 px-6 backdrop-blur-sm focus:outline-none"
          onClick={handleOverlayDismiss}
          aria-label="Continue to next round"
        >
          <div className="max-w-sm space-y-3 text-center font-mono pointer-events-none">
            <p className="text-lg text-neutral-800">you said {flash.call}.</p>
            <p className="text-2xl font-medium text-neutral-900">
              {flash.correct ? 'correct ✓' : 'wrong ✗'}
            </p>
            <p className="text-sm text-neutral-500">
              {flash.hasPattern
                ? `real signal (ρ = ${flash.rho.toFixed(2)}).`
                : 'pure noise (ρ = 0).'}
            </p>
            {!flash.correct && (
              <p className="text-xs leading-relaxed text-neutral-500">
                tilt score = {flash.sampleR >= 0 ? '+' : ''}
                {flash.sampleR.toFixed(2)} (how diagonal it looked). Null cutoff
                is ±{flash.rCritical.toFixed(2)} → rule would say{' '}
                {flash.machineCall}.
              </p>
            )}
            {flash.spuriousSlope && (
              <p className="text-xs text-neutral-500">
                the tilt crossed the null cutoff, but ρ was still 0.
              </p>
            )}
          </div>
          <p className="pointer-events-none mt-10 text-sm text-neutral-400">
            click or press any key to continue
          </p>
        </button>
      )}
    </div>
  );
}
