import React from 'react';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Gauge,
  Zap,
  HandMetal,
  Plus,
  Minus,
  BookmarkCheck,
  Music2,
} from 'lucide-react';
import {
  MetronomeSettings,
  TimeSignature,
  Subdivision,
  SoundPreset,
  Exercise,
} from '../types/music';
import { TIME_SIGNATURES, SUBDIVISIONS } from '../data/initialData';
import { getTempoLabel } from '../hooks/useMetronome';

interface MetronomePanelProps {
  settings: MetronomeSettings;
  isPlaying: boolean;
  currentBeat: number;
  currentSubBeat: number;
  barsPlayed: number;
  togglePlay: () => void;
  setBpm: (bpm: number | ((prev: number) => number)) => void;
  setTimeSignature: (ts: TimeSignature) => void;
  setSubdivision: (sub: Subdivision) => void;
  setSoundPreset: (preset: SoundPreset) => void;
  setVolume: (vol: number) => void;
  toggleBeatAccent: (beatIdx: number) => void;
  updateSpeedTrainer: (
    partial: Partial<
      Pick<
        MetronomeSettings,
        | 'speedTrainerEnabled'
        | 'speedTrainerStepBpm'
        | 'speedTrainerBarsInterval'
        | 'speedTrainerTargetBpm'
      >
    >
  ) => void;
  tapTempo: () => void;
  activeExercise: Exercise | null;
  onSaveBpmToActiveExercise: (bpm: number) => void;
}

export const MetronomePanel: React.FC<MetronomePanelProps> = ({
  settings,
  isPlaying,
  currentBeat,
  currentSubBeat,
  barsPlayed,
  togglePlay,
  setBpm,
  setTimeSignature,
  setSubdivision,
  setSoundPreset,
  setVolume,
  toggleBeatAccent,
  updateSpeedTrainer,
  tapTempo,
  activeExercise,
  onSaveBpmToActiveExercise,
}) => {
  const tempoLabel = getTempoLabel(settings.bpm);

  return (
    <aside className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-75 ${
              isPlaying
                ? currentBeat === 0
                  ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] scale-125'
                  : 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                : 'bg-zinc-600'
            }`}
          />
          <div>
            <h2 className="text-base font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              Metrônomo Studio
            </h2>
            <p className="text-[11px] text-zinc-400">
              Web Audio Precision • Sempre Visível
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-zinc-800 text-amber-400 border border-zinc-700/80">
          {tempoLabel}
        </span>
      </div>

      {/* Big BPM Display & Controls */}
      <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 flex flex-col items-center gap-3 relative overflow-hidden">
        <div className="flex items-baseline gap-2">
          <input
            type="number"
            min={20}
            max={300}
            value={settings.bpm}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) setBpm(val);
            }}
            className="w-28 bg-transparent text-center font-mono text-5xl font-extrabold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-lg"
            title="Clique para digitar o BPM"
          />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            BPM
          </span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={20}
          max={300}
          value={settings.bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
        />

        {/* Quick Fine-Tune BPM Buttons */}
        <div className="grid grid-cols-5 gap-1.5 w-full">
          <button
            type="button"
            onClick={() => setBpm((b) => b - 5)}
            className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-semibold text-zinc-300 transition"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => setBpm((b) => b - 1)}
            className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-semibold text-zinc-300 flex items-center justify-center gap-0.5 transition"
          >
            <Minus className="w-3 h-3" />1
          </button>
          <button
            type="button"
            onClick={tapTempo}
            className="py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center justify-center gap-1 transition"
            title="Clique repetidamente no ritmo desejado para descobrir o BPM"
          >
            <HandMetal className="w-3.5 h-3.5" />
            TAP
          </button>
          <button
            type="button"
            onClick={() => setBpm((b) => b + 1)}
            className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-semibold text-zinc-300 flex items-center justify-center gap-0.5 transition"
          >
            <Plus className="w-3 h-3" />1
          </button>
          <button
            type="button"
            onClick={() => setBpm((b) => b + 5)}
            className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-semibold text-zinc-300 transition"
          >
            +5
          </button>
        </div>

        {/* Play / Stop Main Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/40'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              Parar Metrônomo
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Iniciar Metrônomo
            </>
          )}
        </button>

        {/* Save current BPM to Active Exercise */}
        {activeExercise && (
          <button
            type="button"
            onClick={() => onSaveBpmToActiveExercise(settings.bpm)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            title={`Registrar ${settings.bpm} BPM no histórico de "${activeExercise.name}"`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Salvar <strong>{settings.bpm} BPM</strong> em "{activeExercise.name}"
            </span>
          </button>
        )}
      </div>

      {/* Visual Interactive Beat Pads */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">
            Pulso do Compasso (Clique p/ Acento)
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {isPlaying ? `Compasso #${barsPlayed + 1}` : 'Forte • Normal • Mudo'}
          </span>
        </div>

        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              6,
              settings.beatAccents.length
            )}, minmax(0, 1fr))`,
          }}
        >
          {settings.beatAccents.map((accent, idx) => {
            const isCurrent = isPlaying && currentBeat === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleBeatAccent(idx)}
                className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all select-none ${
                  isCurrent
                    ? accent === 'accent'
                      ? 'bg-amber-400 border-amber-300 text-zinc-950 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.6)] font-extrabold'
                      : accent === 'mute'
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-400 scale-102'
                      : 'bg-emerald-400 border-emerald-300 text-zinc-950 scale-105 shadow-[0_0_12px_rgba(52,211,153,0.5)] font-bold'
                    : accent === 'accent'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : accent === 'mute'
                    ? 'bg-zinc-950 border-zinc-800/80 text-zinc-600 hover:border-zinc-700'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
                title={`Tempo ${idx + 1}: ${
                  accent === 'accent'
                    ? 'Acentuado (Forte)'
                    : accent === 'normal'
                    ? 'Normal'
                    : 'Silenciado (Mudo)'
                }`}
              >
                <span className="text-xs font-mono font-bold">{idx + 1}</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-80">
                  {accent === 'accent'
                    ? 'FORTE'
                    : accent === 'normal'
                    ? 'NORM'
                    : 'MUDO'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subdivision Indicator Dots */}
        {settings.subdivision > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1">
            {Array.from({ length: settings.subdivision }).map((_, subIdx) => {
              const activeSub = isPlaying && currentSubBeat === subIdx;
              return (
                <div
                  key={subIdx}
                  className={`h-1.5 rounded-full transition-all ${
                    activeSub
                      ? 'w-5 bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                      : 'w-2 bg-zinc-800'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Time Signatures (Fórmulas de Compasso) */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
          <span>Fórmula de Compasso</span>
          <span className="text-[11px] text-amber-400/90 font-mono">
            {
              TIME_SIGNATURES.find((t) => t.value === settings.timeSignature)
                ?.description
            }
          </span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {TIME_SIGNATURES.map((ts) => (
            <button
              key={ts.value}
              type="button"
              onClick={() => setTimeSignature(ts.value)}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border transition ${
                settings.timeSignature === ts.value
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rhythmic Subdivisions (Subdivisões Rítmicas) */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
          <span>Subdivisão Rítmica</span>
          <span className="text-[11px] text-zinc-500">
            {
              SUBDIVISIONS.find((s) => s.value === settings.subdivision)
                ?.shortDesc
            }
          </span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {SUBDIVISIONS.map((sub) => (
            <button
              key={sub.value}
              type="button"
              onClick={() => setSubdivision(sub.value)}
              className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition ${
                settings.subdivision === sub.value
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title={`${sub.label} (${sub.shortDesc})`}
            >
              <span className="text-xs font-mono font-bold">{sub.symbol}</span>
              <span className="text-[10px] truncate max-w-full">
                {sub.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sound Preset & Volume */}
      <div className="space-y-2 pt-1 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
            <Music2 className="w-3.5 h-3.5 text-zinc-500" />
            Timbre do Click
          </span>
          <div className="flex items-center gap-2 w-28">
            <button
              type="button"
              onClick={() => setVolume(settings.volume > 0 ? 0 : 0.8)}
              className="text-zinc-400 hover:text-zinc-200"
              title="Mutar/Desmutar som"
            >
              {settings.volume <= 0.01 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: 'woodblock', label: 'Woodblock' },
              { id: 'digital', label: 'Digital' },
              { id: 'beep', label: 'Quartz' },
              { id: 'drums', label: 'Bateria' },
            ] as { id: SoundPreset; label: string }[]
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSoundPreset(preset.id)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition ${
                settings.soundPreset === preset.id
                  ? 'bg-zinc-800 border-amber-500/60 text-amber-300'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Trainer (Acelerador Progressivo Automático) */}
      <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap
              className={`w-4 h-4 ${
                settings.speedTrainerEnabled
                  ? 'text-amber-400 fill-amber-400/20'
                  : 'text-zinc-500'
              }`}
            />
            <span className="text-xs font-semibold text-zinc-200">
              Speed Trainer (Auto +BPM)
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              updateSpeedTrainer({
                speedTrainerEnabled: !settings.speedTrainerEnabled,
              })
            }
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition ${
              settings.speedTrainerEnabled
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {settings.speedTrainerEnabled ? 'ATIVO' : 'OFF'}
          </button>
        </div>

        {settings.speedTrainerEnabled && (
          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                Subir (+BPM)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.speedTrainerStepBpm}
                onChange={(e) =>
                  updateSpeedTrainer({
                    speedTrainerStepBpm: Math.max(1, Number(e.target.value)),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 font-mono text-zinc-100 text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                A cada (Comp.)
              </label>
              <input
                type="number"
                min={1}
                max={64}
                value={settings.speedTrainerBarsInterval}
                onChange={(e) =>
                  updateSpeedTrainer({
                    speedTrainerBarsInterval: Math.max(
                      1,
                      Number(e.target.value)
                    ),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 font-mono text-zinc-100 text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                BPM Alvo
              </label>
              <input
                type="number"
                min={30}
                max={300}
                value={settings.speedTrainerTargetBpm}
                onChange={(e) =>
                  updateSpeedTrainer({
                    speedTrainerTargetBpm: Math.max(
                      20,
                      Math.min(300, Number(e.target.value))
                    ),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 font-mono text-amber-400 font-bold text-center"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
