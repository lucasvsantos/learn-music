import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MetronomeSettings,
  TimeSignature,
  Subdivision,
  SoundPreset,
  BeatAccent,
} from '../types/music';
import {
  DEFAULT_METRONOME_SETTINGS,
  STORAGE_KEYS,
  TIME_SIGNATURES,
} from '../data/initialData';
import { soundEngine } from '../utils/audioEngine';

export function getBeatsCount(ts: TimeSignature): number {
  const found = TIME_SIGNATURES.find((t) => t.value === ts);
  return found ? found.beats : 4;
}

export function getTempoLabel(bpm: number): string {
  if (bpm < 45) return 'Grave';
  if (bpm < 60) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 156) return 'Allegro';
  if (bpm < 176) return 'Vivace';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo / Shred';
}

export function useMetronome() {
  const [settings, setSettings] = useState<MetronomeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.METRONOME);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_METRONOME_SETTINGS, ...parsed };
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_METRONOME_SETTINGS;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number>(-1);
  const [currentSubBeat, setCurrentSubBeat] = useState<number>(0);
  const [barsPlayed, setBarsPlayed] = useState<number>(0);

  // Persist settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.METRONOME, JSON.stringify(settings));
    } catch {
      // ignore storage quota errors
    }
  }, [settings]);

  // Refs for Web Audio lookahead scheduler
  const settingsRef = useRef<MetronomeSettings>(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const currentSubRef = useRef<number>(0);
  const barsCountRef = useRef<number>(0);
  const timerIdRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  const setBpm = useCallback((newBpm: number | ((prev: number) => number)) => {
    setSettings((prev) => {
      const resolved = typeof newBpm === 'function' ? newBpm(prev.bpm) : newBpm;
      const clamped = Math.max(20, Math.min(300, Math.round(resolved)));
      return { ...prev, bpm: clamped };
    });
  }, []);

  const setTimeSignature = useCallback((ts: TimeSignature) => {
    const numBeats = getBeatsCount(ts);
    setSettings((prev) => {
      const newAccents: BeatAccent[] = Array.from({ length: numBeats }, (_, i) => {
        if (i === 0) return 'accent';
        if ((ts === '6/8' || ts === '12/8') && i % 3 === 0) return 'accent';
        if (ts === '9/8' && i % 3 === 0) return 'accent';
        return 'normal';
      });
      return {
        ...prev,
        timeSignature: ts,
        beatAccents: newAccents,
      };
    });
    currentBeatRef.current = 0;
    currentSubRef.current = 0;
  }, []);

  const setSubdivision = useCallback((sub: Subdivision) => {
    setSettings((prev) => ({ ...prev, subdivision: sub }));
    currentSubRef.current = 0;
  }, []);

  const setSoundPreset = useCallback((preset: SoundPreset) => {
    setSettings((prev) => ({ ...prev, soundPreset: preset }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const toggleBeatAccent = useCallback((beatIndex: number) => {
    setSettings((prev) => {
      const nextAccents = [...prev.beatAccents];
      const current = nextAccents[beatIndex] || 'normal';
      const order: BeatAccent[] = ['accent', 'normal', 'mute'];
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      nextAccents[beatIndex] = order[nextIdx];
      return { ...prev, beatAccents: nextAccents };
    });
  }, []);

  const updateSpeedTrainer = useCallback(
    (partial: Partial<Pick<MetronomeSettings, 'speedTrainerEnabled' | 'speedTrainerStepBpm' | 'speedTrainerBarsInterval' | 'speedTrainerTargetBpm'>>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
      barsCountRef.current = 0;
      setBarsPlayed(0);
    },
    []
  );

  // Lookahead scheduler
  useEffect(() => {
    if (!isPlaying) {
      if (timerIdRef.current !== null) {
        window.clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      setCurrentBeat(-1);
      setCurrentSubBeat(0);
      return;
    }

    const ctx = soundEngine.getContext();
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    currentBeatRef.current = 0;
    currentSubRef.current = 0;
    barsCountRef.current = 0;
    setBarsPlayed(0);

    const scheduleAheadTime = 0.1; // 100ms lookahead
    const lookaheadMs = 25;

    const scheduler = () => {
      const now = ctx.currentTime;
      while (nextNoteTimeRef.current < now + scheduleAheadTime) {
        const s = settingsRef.current;
        const totalBeats = getBeatsCount(s.timeSignature);
        const beatIdx = currentBeatRef.current % totalBeats;
        const subIdx = currentSubRef.current;
        const beatAccent = s.beatAccents[beatIdx] || 'normal';

        // Schedule audio click if not muted
        if (beatAccent !== 'mute') {
          if (subIdx === 0) {
            soundEngine.scheduleClick(
              nextNoteTimeRef.current,
              beatAccent === 'accent' ? 'accent' : 'normal',
              s.soundPreset,
              s.volume
            );
          } else {
            soundEngine.scheduleClick(
              nextNoteTimeRef.current,
              'subdivision',
              s.soundPreset,
              s.volume
            );
          }
        }

        // Schedule UI beat update close to actual note time
        const delayMs = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000);
        const capturedBeat = beatIdx;
        const capturedSub = subIdx;
        window.setTimeout(() => {
          setCurrentBeat(capturedBeat);
          setCurrentSubBeat(capturedSub);
        }, delayMs);

        // Advance note time
        const secondsPerBeat = 60.0 / s.bpm;
        const secondsPerSubdivision = secondsPerBeat / s.subdivision;
        nextNoteTimeRef.current += secondsPerSubdivision;

        // Advance subdivision & beat counters
        currentSubRef.current += 1;
        if (currentSubRef.current >= s.subdivision) {
          currentSubRef.current = 0;
          currentBeatRef.current += 1;

          if (currentBeatRef.current >= totalBeats) {
            currentBeatRef.current = 0;
            barsCountRef.current += 1;
            const currentBars = barsCountRef.current;
            window.setTimeout(() => {
              setBarsPlayed(currentBars);
            }, delayMs);

            // Speed Trainer check
            if (
              s.speedTrainerEnabled &&
              s.speedTrainerBarsInterval > 0 &&
              currentBars % s.speedTrainerBarsInterval === 0
            ) {
              if (s.bpm < s.speedTrainerTargetBpm) {
                const nextBpm = Math.min(
                  s.speedTrainerTargetBpm,
                  s.bpm + s.speedTrainerStepBpm
                );
                setBpm(nextBpm);
              }
            }
          }
        }
      }
    };

    timerIdRef.current = window.setInterval(scheduler, lookaheadMs);

    return () => {
      if (timerIdRef.current !== null) {
        window.clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [isPlaying, setBpm]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    // Reset if more than 2.5 seconds since last tap
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);
    if (taps.length > 6) {
      taps.shift();
    }

    if (taps.length >= 2) {
      let totalIntervals = 0;
      for (let i = 1; i < taps.length; i++) {
        totalIntervals += taps[i] - taps[i - 1];
      }
      const avgIntervalMs = totalIntervals / (taps.length - 1);
      const calculatedBpm = Math.round(60000 / avgIntervalMs);
      if (calculatedBpm >= 20 && calculatedBpm <= 300) {
        setBpm(calculatedBpm);
      }
    }
  }, [setBpm]);

  return {
    settings,
    isPlaying,
    currentBeat,
    currentSubBeat,
    barsPlayed,
    togglePlay,
    setIsPlaying,
    setBpm,
    setTimeSignature,
    setSubdivision,
    setSoundPreset,
    setVolume,
    toggleBeatAccent,
    updateSpeedTrainer,
    tapTempo,
    setSettings,
  };
}
