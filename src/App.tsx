import { useCallback, useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { IntroScreen } from './components/IntroScreen';
import { MathScreen } from './components/MathScreen';
import { PrimerScreen } from './components/PrimerScreen';
import { ResultScreen } from './components/ResultScreen';
import { clearAllSimulationCaches } from './engine/distribution';
import { initialState, submitAnswer } from './engine/game';
import { fitSessionPsychometric } from './engine/stats';
import type { GamePhase, SessionState, UserCall } from './engine/types';
import { TOTAL_ROUNDS } from './engine/types';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [state, setState] = useState<SessionState>(initialState);
  const [finalState, setFinalState] = useState<SessionState | null>(null);

  const handleIntroContinue = useCallback(() => {
    setPhase('primer');
  }, []);

  const handleStartGame = useCallback(() => {
    clearAllSimulationCaches();
    setState(initialState());
    setFinalState(null);
    setPhase('playing');
  }, []);

  const handleAnswer = useCallback(
    (call: UserCall) => {
      const { state: next, result } = submitAnswer(state, call);
      const withFit =
        next.records.length >= TOTAL_ROUNDS
          ? { ...next, lrWeights: fitSessionPsychometric(next) }
          : next;
      setState(withFit);
      if (withFit.records.length >= TOTAL_ROUNDS) {
        setFinalState(withFit);
      }
      return result;
    },
    [state]
  );

  const handleComplete = useCallback(() => {
    setPhase('result');
  }, []);

  const handlePlayAgain = useCallback(() => {
    clearAllSimulationCaches();
    setState(initialState());
    setFinalState(null);
    setPhase('intro');
  }, []);

  const handleSeeMath = useCallback(() => {
    setFinalState((prev) => prev ?? state);
    setPhase('math');
  }, [state]);

  const handleMathBack = useCallback(() => {
    setPhase(finalState ? 'result' : 'intro');
  }, [finalState]);

  if (phase === 'intro') {
    return <IntroScreen onContinue={handleIntroContinue} />;
  }

  if (phase === 'primer') {
    return (
      <PrimerScreen onStart={handleStartGame} onBack={() => setPhase('intro')} />
    );
  }

  if (phase === 'playing') {
    return (
      <GameScreen
        state={state}
        onAnswer={handleAnswer}
        onComplete={handleComplete}
      />
    );
  }

  if (phase === 'result' && finalState) {
    return (
      <ResultScreen
        state={finalState}
        onPlayAgain={handlePlayAgain}
        onSeeMath={handleSeeMath}
      />
    );
  }

  if (phase === 'math') {
    return (
      <MathScreen state={finalState ?? state} onBack={handleMathBack} />
    );
  }

  return <IntroScreen onContinue={handleIntroContinue} />;
}
