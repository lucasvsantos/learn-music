import React from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Timer,
  Gauge,
  Plus,
  Minus,
  HandMetal,
} from 'lucide-react';
import { Exercise, MetronomeSettings } from '../types/music';
import { formatSeconds } from '../hooks/usePracticeTimer';
import { SUBDIVISIONS } from '../data/initialData';

interface MiniPlayerBarProps {
  // Metronome
  metronomeSettings: MetronomeSettings;
  isMetronomePlaying: boolean;
  currentBeat: number;
  onToggleMetronome: () => void;
  onChangeBpm: (bpm: number | ((prev: number) => number)) => void;
  onTapTempo: () => void;
  // Timer & Exercise
  activeExercise: Exercise | null;
  displaySeconds: number;
  isTimerRunning: boolean;
  isTimerFinished: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onGoToExercisesTab: () => void;
  // Layout: o menu lateral tem prioridade, a barra começa após ele no desktop
  sidebarCollapsed: boolean;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  metronomeSettings,
  isMetronomePlaying,
  currentBeat,
  onToggleMetronome,
  onChangeBpm,
  onTapTempo,
  activeExercise,
  displaySeconds,
  isTimerRunning,
  isTimerFinished,
  onToggleTimer,
  onResetTimer,
  onGoToExercisesTab,
  sidebarCollapsed,
}) => {
  const subSymbol =
    SUBDIVISIONS.find((s) => s.value === metronomeSettings.subdivision)
      ?.symbol || '♩ (1x)';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 ${
        sidebarCollapsed ? 'lg:left-[76px]' : 'lg:left-64'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Exercise & Timer Mini Controls */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleTimer}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isTimerRunning
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
              }`}
              title={isTimerRunning ? 'Pausar Cronômetro' : 'Iniciar Cronômetro'}
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={onResetTimer}
              className="w-8 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition"
              title="Resetar Cronômetro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={onGoToExercisesTab}
              className="cursor-pointer group"
              title="Ir para o Cronômetro na aba de Exercícios"
            >
              <div className="flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span
                  className={`font-mono text-lg font-extrabold leading-none ${
                    isTimerFinished
                      ? 'text-emerald-400 animate-pulse'
                      : isTimerRunning
                      ? 'text-amber-400'
                      : 'text-zinc-100'
                  }`}
                >
                  {formatSeconds(displaySeconds)}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 group-hover:text-amber-300 truncate max-w-[180px] sm:max-w-[260px] transition">
                {activeExercise
                  ? `Treino: ${activeExercise.name}`
                  : 'Cronômetro Livre (Sem exercício)'}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Visual Beat Pulse Dots */}
        <div className="hidden md:flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
          {metronomeSettings.beatAccents.map((accent, idx) => {
            const active = isMetronomePlaying && currentBeat === idx;
            return (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                  active
                    ? accent === 'accent'
                      ? 'bg-amber-400 scale-125 shadow-[0_0_8px_#fbbf24]'
                      : 'bg-emerald-400 scale-110 shadow-[0_0_8px_#34d399]'
                    : accent === 'mute'
                    ? 'bg-zinc-800'
                    : 'bg-zinc-700'
                }`}
              />
            );
          })}
          <span className="ml-2 text-[11px] font-mono text-zinc-400">
            {metronomeSettings.timeSignature} • {subSymbol}
          </span>
        </div>

        {/* Right: Metronome Mini Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => onChangeBpm((b) => b - 1)}
              className="w-7 h-7 rounded-lg bg-zinc-950 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 transition"
              title="-1 BPM"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="px-2 text-center min-w-[68px]">
              <span className="font-mono text-base font-extrabold text-amber-400">
                {metronomeSettings.bpm}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 ml-1">
                BPM
              </span>
            </div>

            <button
              type="button"
              onClick={() => onChangeBpm((b) => b + 1)}
              className="w-7 h-7 rounded-lg bg-zinc-950 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 transition"
              title="+1 BPM"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onTapTempo}
            className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-amber-300 flex items-center gap-1 transition active:scale-95"
            title="Tap Tempo"
          >
            <HandMetal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TAP</span>
          </button>

          <button
            type="button"
            onClick={onToggleMetronome}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
              isMetronomePlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
            }`}
          >
            {isMetronomePlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Parar</span>
              </>
            ) : (
              <>
                <Gauge className="w-3.5 h-3.5" />
                <span>Metrônomo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
