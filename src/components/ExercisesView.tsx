import React, { useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  CheckCircle2,
  Flame,
  Clock,
  Target,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Gauge,
  Award,
} from 'lucide-react';
import { Exercise, ExerciseCategory, BpmRecord } from '../types/music';
import { EXERCISE_CATEGORIES } from '../data/initialData';
import { formatSeconds, TimerMode } from '../hooks/usePracticeTimer';

interface ExercisesViewProps {
  exercises: Exercise[];
  activeExercise: Exercise | null;
  onSelectExercise: (ex: Exercise) => void;
  onAddExercise: (
    ex: Omit<
      Exercise,
      'id' | 'createdAt' | 'bpmHistory' | 'totalSessionsCompleted' | 'totalMinutesPracticed'
    >
  ) => void;
  onUpdateExercise: (ex: Exercise) => void;
  onDeleteExercise: (id: string) => void;
  onRecordBpm: (
    exerciseId: string,
    bpm: number,
    note?: string,
    durationMinutes?: number
  ) => void;
  onDeleteBpmRecord: (exerciseId: string, recordId: string) => void;
  onLoadSamples: () => void;
  // Timer props
  timerMode: TimerMode;
  displaySeconds: number;
  elapsedSeconds: number;
  progressPercent: number;
  isTimerRunning: boolean;
  isTimerFinished: boolean;
  onToggleTimer: () => void;
  onResetTimer: (customMinutes?: number) => void;
  onAddTimeSeconds: (secs: number) => void;
  onSwitchTimerMode: (mode: TimerMode) => void;
  // Metronome sync
  currentMetronomeBpm: number;
  onSyncMetronomeBpm: (bpm: number) => void;
}

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  'Sweep Picking': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Alternate Picking': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Velocidade: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Técnica: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Legato: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Harmonia: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Improvisação: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'Rítmica / Riff': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Aquecimento: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  Outro: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40',
};

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  exercises,
  activeExercise,
  onSelectExercise,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onRecordBpm,
  onDeleteBpmRecord,
  onLoadSamples,
  timerMode,
  displaySeconds,
  elapsedSeconds,
  progressPercent,
  isTimerRunning,
  isTimerFinished,
  onToggleTimer,
  onResetTimer,
  onAddTimeSeconds,
  onSwitchTimerMode,
  currentMetronomeBpm,
  onSyncMetronomeBpm,
}) => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create / Edit Form modal/panel state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('Técnica');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [currentBpm, setCurrentBpm] = useState<number>(100);
  const [targetBpm, setTargetBpm] = useState<number>(140);

  // Expanded BPM History per card
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Record<string, boolean>>({});
  const [newBpmInputs, setNewBpmInputs] = useState<Record<string, { bpm: string; note: string }>>({});

  // Session completion log modal/banner
  const [showCompleteForm, setShowCompleteForm] = useState<boolean>(false);
  const [sessionBpm, setSessionBpm] = useState<number>(currentMetronomeBpm);
  const [sessionNote, setSessionNote] = useState<string>('');

  const openCreateForm = () => {
    setEditingExercise(null);
    setName('');
    setCategory('Técnica');
    setDescription('');
    setDurationMinutes(10);
    setCurrentBpm(currentMetronomeBpm);
    setTargetBpm(Math.min(300, currentMetronomeBpm + 30));
    setIsFormOpen(true);
  };

  const openEditForm = (ex: Exercise) => {
    setEditingExercise(ex);
    setName(ex.name);
    setCategory(ex.category);
    setDescription(ex.description);
    setDurationMinutes(ex.durationMinutes);
    setCurrentBpm(ex.currentBpm);
    setTargetBpm(ex.targetBpm);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingExercise) {
      onUpdateExercise({
        ...editingExercise,
        name: name.trim(),
        category,
        description: description.trim(),
        durationMinutes: Math.max(1, Number(durationMinutes) || 10),
        currentBpm: Math.max(20, Number(currentBpm) || 100),
        targetBpm: Math.max(20, Number(targetBpm) || 120),
      });
    } else {
      onAddExercise({
        name: name.trim(),
        category,
        description: description.trim(),
        durationMinutes: Math.max(1, Number(durationMinutes) || 10),
        currentBpm: Math.max(20, Number(currentBpm) || 100),
        targetBpm: Math.max(20, Number(targetBpm) || 120),
      });
    }
    setIsFormOpen(false);
    setEditingExercise(null);
  };

  const toggleHistoryExpand = (ex: Exercise) => {
    setExpandedHistoryIds((prev) => ({
      ...prev,
      [ex.id]: !prev[ex.id],
    }));
    if (!newBpmInputs[ex.id]) {
      setNewBpmInputs((prev) => ({
        ...prev,
        [ex.id]: { bpm: String(ex.currentBpm || currentMetronomeBpm), note: '' },
      }));
    }
  };

  const handleInlineAddBpm = (exId: string, e: React.FormEvent) => {
    e.preventDefault();
    const entry = newBpmInputs[exId];
    if (!entry) return;
    const parsedBpm = parseInt(entry.bpm, 10);
    if (isNaN(parsedBpm) || parsedBpm < 20 || parsedBpm > 350) return;

    onRecordBpm(exId, parsedBpm, entry.note.trim() || undefined);
    setNewBpmInputs((prev) => ({
      ...prev,
      [exId]: { bpm: String(parsedBpm), note: '' },
    }));
  };

  const handleOpenCompleteSession = () => {
    setSessionBpm(currentMetronomeBpm);
    setSessionNote('');
    setShowCompleteForm(true);
  };

  const handleConfirmCompleteSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExercise) return;
    const practicedMins = Math.max(
      1,
      Math.round(elapsedSeconds / 60) || activeExercise.durationMinutes
    );
    onRecordBpm(
      activeExercise.id,
      sessionBpm,
      sessionNote.trim() || `Sessão concluída (${practicedMins} min)`,
      practicedMins
    );
    setShowCompleteForm(false);
    onResetTimer(activeExercise.durationMinutes);
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory =
      selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate max BPM for an exercise
  const getMaxBpm = (ex: Exercise): number => {
    if (!ex.bpmHistory || ex.bpmHistory.length === 0) return ex.currentBpm;
    return Math.max(ex.currentBpm, ...ex.bpmHistory.map((h) => h.bpm));
  };

  return (
    <div className="space-y-6">
      {/* INTEGRATED PRACTICE TIMER & ACTIVE EXERCISE WORKSTATION */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        {/* Progress bar at top of timer card */}
        {timerMode === 'countdown' && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-800">
            <div
              className={`h-full transition-all duration-300 ${
                isTimerFinished
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          {/* Left: Active Exercise Details */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Timer className="w-3.5 h-3.5" />
                Cronômetro de Prática Integrado
              </span>

              <div className="inline-flex rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => onSwitchTimerMode('countdown')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    timerMode === 'countdown'
                      ? 'bg-zinc-800 text-amber-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Regressivo
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchTimerMode('stopwatch')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    timerMode === 'stopwatch'
                      ? 'bg-zinc-800 text-amber-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Cronômetro Livre
                </button>
              </div>
            </div>

            {activeExercise ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-zinc-100">
                    {activeExercise.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      CATEGORY_COLORS[activeExercise.category]
                    }`}
                  >
                    {activeExercise.category}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2">
                  {activeExercise.description ||
                    'Sem descrição adicional cadastrada.'}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Meta de Tempo: <strong>{activeExercise.durationMinutes} min</strong>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                    BPM Atual: <strong>{activeExercise.currentBpm}</strong> / Alvo:{' '}
                    <strong>{activeExercise.targetBpm} BPM</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSyncMetronomeBpm(activeExercise.currentBpm)}
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium flex items-center gap-1"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    Usar {activeExercise.currentBpm} BPM no Metrônomo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-200">
                  Treino Livre (Ou selecione um exercício abaixo)
                </h3>
                <p className="text-xs text-zinc-400">
                  Clique em <strong>"Treinar Agora"</strong> em qualquer exercício
                  da lista para carregar seu tempo planejado e BPM automaticamente.
                </p>
              </div>
            )}
          </div>

          {/* Right: Digital Clock & Timer Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-4 shrink-0">
            <div className="text-center sm:text-right px-2">
              <div
                className={`font-mono text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  isTimerFinished
                    ? 'text-emerald-400 animate-pulse'
                    : isTimerRunning
                    ? 'text-amber-400'
                    : 'text-zinc-100'
                }`}
              >
                {formatSeconds(displaySeconds)}
              </div>
              <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                {isTimerFinished
                  ? '🎉 Tempo Concluído!'
                  : elapsedSeconds > 0
                  ? `Praticado nesta sessão: ${formatSeconds(elapsedSeconds)}`
                  : timerMode === 'countdown'
                  ? 'Pronto para iniciar contagem'
                  : 'Cronômetro progressivo'}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleTimer}
                  className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                    isTimerRunning
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Iniciar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onResetTimer(activeExercise?.durationMinutes)
                  }
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
                  title="Resetar Cronômetro"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Time Adjustments & Finish Session */}
              <div className="flex items-center gap-1.5 justify-end">
                {timerMode === 'countdown' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onAddTimeSeconds(60)}
                      className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                    >
                      +1m
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddTimeSeconds(300)}
                      className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                    >
                      +5m
                    </button>
                  </>
                )}

                {activeExercise && (
                  <button
                    type="button"
                    onClick={handleOpenCompleteSession}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Concluir & Salvar BPM
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inline Session Completion BPM Log Prompt */}
        {showCompleteForm && activeExercise && (
          <form
            onSubmit={handleConfirmCompleteSession}
            className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-end gap-3 bg-zinc-950/60 p-3.5 rounded-xl"
          >
            <div className="flex-1">
              <label className="text-xs font-semibold text-emerald-400 block mb-1">
                Registrar BPM alcançado em "{activeExercise.name}"
              </label>
              <input
                type="text"
                placeholder="Observação (ex: Palhetada limpa em semicolcheia, sem tensão)"
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="text-xs text-zinc-400 block mb-1">
                BPM Alcançado
              </label>
              <input
                type="number"
                min={20}
                max={350}
                value={sessionBpm}
                onChange={(e) => setSessionBpm(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
              >
                Salvar Evolução
              </button>
              <button
                type="button"
                onClick={() => setShowCompleteForm(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>

      {/* TOOLBAR: FILTERS, SEARCH & NEW EXERCISE BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar exercício por nome, técnica, descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex items-center gap-2">
          {exercises.length === 0 && (
            <button
              type="button"
              onClick={onLoadSamples}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              Carregar Exercícios de Exemplo
            </button>
          )}
          <button
            type="button"
            onClick={openCreateForm}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Novo Exercício
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['Todos', ...EXERCISE_CATEGORIES].map((cat) => {
          const count =
            cat === 'Todos'
              ? exercises.length
              : exercises.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CREATE / EDIT EXERCISE FORM PANEL */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-zinc-100">
              {editingExercise ? 'Editar Exercício' : 'Cadastrar Novo Exercício de Guitarra'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nome do Exercício *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Arpejos Diminutos em Sweep 5 Cordas / Padrão Cromático 1-2-3-4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Categoria / Técnica *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                {EXERCISE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Descrição / Tablatura / Notas de Execução
            </label>
            <textarea
              rows={3}
              placeholder="Descreva os shapes, casas, subdivisão rítmica recomendada ou dicas de postura..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Tempo do Exercício (Minutos) *
              </label>
              <input
                type="number"
                min={1}
                max={180}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                BPM Inicial / Atual
              </label>
              <input
                type="number"
                min={20}
                max={320}
                value={currentBpm}
                onChange={(e) => setCurrentBpm(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Meta de BPM (Alvo)
              </label>
              <input
                type="number"
                min={20}
                max={320}
                value={targetBpm}
                onChange={(e) => setTargetBpm(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition"
            >
              {editingExercise ? 'Salvar Alterações' : 'Cadastrar Exercício'}
            </button>
          </div>
        </form>
      )}

      {/* EXERCISES LIST */}
      {filteredExercises.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-amber-400">
            <Timer className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-200">
            {exercises.length === 0
              ? 'Nenhum exercício cadastrado ainda'
              : 'Nenhum exercício encontrado para este filtro'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Cadastre seus treinos de técnica, harmonia, velocidade, sweep picking e
            acompanhe sua evolução de BPM e tempo de estudo.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={openCreateForm}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Exercício
            </button>
            {exercises.length === 0 && (
              <button
                type="button"
                onClick={onLoadSamples}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 border border-zinc-700 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Carregar Exemplos de Guitarra
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredExercises.map((ex) => {
            const isSelected = activeExercise?.id === ex.id;
            const maxBpm = getMaxBpm(ex);
            const bpmPercentage =
              ex.targetBpm > 0
                ? Math.min(100, Math.round((ex.currentBpm / ex.targetBpm) * 100))
                : 100;
            const isHistoryOpen = !!expandedHistoryIds[ex.id];
            const inlineInput = newBpmInputs[ex.id] || {
              bpm: String(ex.currentBpm),
              note: '',
            };

            return (
              <div
                key={ex.id}
                className={`bg-zinc-900/90 border rounded-2xl p-5 transition-all ${
                  isSelected
                    ? 'border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.1)]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Exercise Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          CATEGORY_COLORS[ex.category]
                        }`}
                      >
                        {ex.category}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {ex.durationMinutes} min
                      </span>

                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-zinc-950">
                          EM TREINO NO CRONÔMETRO
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-zinc-100">{ex.name}</h4>

                    {ex.description && (
                      <p className="text-sm text-zinc-400 whitespace-pre-line">
                        {ex.description}
                      </p>
                    )}

                    {/* BPM Progress Bar & Metrics */}
                    <div className="pt-2 max-w-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          Atual: <strong className="font-mono text-zinc-100">{ex.currentBpm} BPM</strong>
                          <span className="text-zinc-600">•</span>
                          Recorde Máx: <strong className="font-mono text-emerald-400">{maxBpm} BPM</strong>
                        </span>
                        <span className="text-zinc-400 flex items-center gap-1 font-mono">
                          <Target className="w-3.5 h-3.5 text-emerald-400" />
                          Meta: {ex.targetBpm} BPM ({bpmPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${bpmPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-stretch sm:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectExercise(ex)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                          isSelected
                            ? 'bg-emerald-500 text-zinc-950 shadow-md'
                            : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        {isSelected ? 'Selecionado no Timer' : 'Treinar Agora'}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleHistoryExpand(ex)}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>Evolução BPM ({ex.bpmHistory.length})</span>
                        {isHistoryOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end pt-1">
                      <span className="text-[11px] text-zinc-500 font-mono mr-2">
                        {ex.totalSessionsCompleted} sessões ({ex.totalMinutesPracticed} min)
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditForm(ex)}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                        title="Editar Exercício"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExercise(ex.id)}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 transition"
                        title="Excluir Exercício"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE BPM PROGRESSION HISTORY & CHART */}
                {isHistoryOpen && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/90 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          Histórico de Progressão de Velocidade (BPM)
                        </h5>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNewBpmInputs((prev) => ({
                            ...prev,
                            [ex.id]: {
                              ...inlineInput,
                              bpm: String(currentMetronomeBpm),
                            },
                          }))
                        }
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-mono"
                      >
                        Puxar BPM do Metrônomo ({currentMetronomeBpm} BPM)
                      </button>
                    </div>

                    {/* Visual Mini Bar Chart of Progression */}
                    {ex.bpmHistory.length > 0 && (
                      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4">
                        <div className="flex items-end gap-2 h-28 overflow-x-auto pb-1">
                          {ex.bpmHistory.map((rec: BpmRecord) => {
                            const maxScale = Math.max(ex.targetBpm, maxBpm, 120);
                            const barHeightPercent = Math.max(
                              15,
                              Math.min(100, Math.round((rec.bpm / maxScale) * 100))
                            );
                            const isRecord = rec.bpm === maxBpm;
                            const formattedDate = new Date(
                              rec.date
                            ).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            });

                            return (
                              <div
                                key={rec.id}
                                className="flex flex-col items-center gap-1 min-w-[44px] group relative"
                                title={
                                  rec.note
                                    ? `${rec.bpm} BPM - ${rec.note}`
                                    : `${rec.bpm} BPM`
                                }
                              >
                                <span
                                  className={`text-[10px] font-mono font-bold ${
                                    isRecord ? 'text-emerald-400' : 'text-amber-300'
                                  }`}
                                >
                                  {rec.bpm}
                                </span>
                                <div className="w-7 h-16 bg-zinc-900 rounded-t-md flex items-end overflow-hidden border border-zinc-800/80">
                                  <div
                                    className={`w-full rounded-t transition-all ${
                                      isRecord
                                        ? 'bg-emerald-400'
                                        : 'bg-amber-500/80 group-hover:bg-amber-400'
                                    }`}
                                    style={{ height: `${barHeightPercent}%` }}
                                  />
                                </div>
                                <span className="text-[9px] font-mono text-zinc-500">
                                  {formattedDate}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Form to Add New BPM Record */}
                    <form
                      onSubmit={(e) => handleInlineAddBpm(ex.id, e)}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={20}
                          max={350}
                          required
                          placeholder="BPM"
                          value={inlineInput.bpm}
                          onChange={(e) =>
                            setNewBpmInputs((prev) => ({
                              ...prev,
                              [ex.id]: { ...inlineInput, bpm: e.target.value },
                            }))
                          }
                          className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-xs font-mono text-zinc-500">BPM</span>
                      </div>

                      <input
                        type="text"
                        placeholder="Nota da sessão (ex: Semicolcheias limpas sem errar...)"
                        value={inlineInput.note}
                        onChange={(e) =>
                          setNewBpmInputs((prev) => ({
                            ...prev,
                            [ex.id]: { ...inlineInput, note: e.target.value },
                          }))
                        }
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />

                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shrink-0"
                      >
                        + Registrar BPM
                      </button>
                    </form>

                    {/* Detailed History Logs */}
                    {ex.bpmHistory.length > 0 && (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {[...ex.bpmHistory].reverse().map((rec) => (
                          <div
                            key={rec.id}
                            className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800/70 rounded-lg px-3 py-1.5 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-amber-400">
                                {rec.bpm} BPM
                              </span>
                              <span className="text-zinc-500 font-mono text-[11px]">
                                {new Date(rec.date).toLocaleDateString('pt-BR')}
                              </span>
                              {rec.note && (
                                <span className="text-zinc-300">{rec.note}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onDeleteBpmRecord(ex.id, rec.id)}
                              className="text-zinc-600 hover:text-rose-400 transition"
                              title="Remover registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
