import { useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../utils/audioEngine';

export type TimerMode = 'countdown' | 'stopwatch';

export function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function usePracticeTimer(initialMinutes = 10) {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [targetSeconds, setTargetSeconds] = useState<number>(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialMinutes * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (mode === 'countdown') {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            soundEngine.playTimerFinishedSound();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, mode]);

  const toggleTimer = useCallback(() => {
    if (isFinished && mode === 'countdown' && remainingSeconds === 0) {
      setRemainingSeconds(targetSeconds);
      setElapsedSeconds(0);
      setIsFinished(false);
      setIsRunning(true);
      return;
    }
    setIsFinished(false);
    setIsRunning((prev) => !prev);
  }, [isFinished, mode, remainingSeconds, targetSeconds]);

  const resetTimer = useCallback(
    (customMinutes?: number) => {
      setIsRunning(false);
      setIsFinished(false);
      setElapsedSeconds(0);
      const mins = customMinutes !== undefined ? customMinutes : Math.round(targetSeconds / 60);
      const secs = Math.max(60, mins * 60);
      if (customMinutes !== undefined) {
        setTargetSeconds(secs);
      }
      setRemainingSeconds(customMinutes !== undefined ? secs : targetSeconds);
    },
    [targetSeconds]
  );

  const loadDurationMinutes = useCallback((minutes: number) => {
    const secs = Math.max(1, minutes) * 60;
    setIsRunning(false);
    setIsFinished(false);
    setTargetSeconds(secs);
    setRemainingSeconds(secs);
    setElapsedSeconds(0);
    setMode('countdown');
  }, []);

  const addTimeSeconds = useCallback((secondsToAdd: number) => {
    setIsFinished(false);
    setTargetSeconds((prev) => Math.max(60, prev + secondsToAdd));
    setRemainingSeconds((prev) => Math.max(0, prev + secondsToAdd));
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setIsFinished(false);
    setMode(newMode);
  }, []);

  const displaySeconds = mode === 'countdown' ? remainingSeconds : elapsedSeconds;
  const progressPercent =
    mode === 'countdown' && targetSeconds > 0
      ? Math.min(100, Math.max(0, ((targetSeconds - remainingSeconds) / targetSeconds) * 100))
      : 0;

  return {
    mode,
    targetSeconds,
    remainingSeconds,
    elapsedSeconds,
    displaySeconds,
    progressPercent,
    isRunning,
    isFinished,
    toggleTimer,
    setIsRunning,
    resetTimer,
    loadDurationMinutes,
    addTimeSeconds,
    switchMode,
  };
}
