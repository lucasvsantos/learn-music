import React, { useState, useEffect, useRef } from 'react';
import { Database, CheckCircle2, Menu } from 'lucide-react';
import {
  Exercise,
  RepertoireSong,
  SongStatus,
  TheoryStudyNote,
} from './types/music';
import {
  STORAGE_KEYS,
  SAMPLE_EXERCISES,
  SAMPLE_REPERTOIRE,
} from './data/initialData';
import { useMetronome } from './hooks/useMetronome';
import { usePracticeTimer } from './hooks/usePracticeTimer';
import { MetronomePanel } from './components/MetronomePanel';
import { ExercisesView } from './components/ExercisesView';
import { RepertoireView } from './components/RepertoireView';
import { TheoryView } from './components/TheoryView';
import { MiniPlayerBar } from './components/MiniPlayerBar';
import { Sidebar, ActiveTab } from './components/Sidebar';

const SIDEBAR_COLLAPSED_KEY = 'guitarlab_sidebar_collapsed_v1';

const TAB_META: Record<ActiveTab, { title: string; subtitle: string }> = {
  exercises: {
    title: 'Exercícios & Cronômetro',
    subtitle: 'Treino cronometrado e evolução de BPM',
  },
  repertoire: {
    title: 'Repertório',
    subtitle: 'Músicas organizadas por artista, gênero, álbum e status',
  },
  theory: {
    title: 'Teoria & Harmonia',
    subtitle: 'Biblioteca de escalas maiores e campos harmônicos',
  },
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('exercises');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Menu lateral: gaveta no mobile e modo compacto (apenas ícones) no desktop
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      // ignore quota error
    }
  }, [sidebarCollapsed]);

  // Load exercises from LocalStorage (empty if storage was cleared)
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore error
    }
    return [];
  });

  // Load repertoire songs from LocalStorage (empty if storage was cleared)
  const [songs, setSongs] = useState<RepertoireSong[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REPERTOIRE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore error
    }
    return [];
  });

  // Load personal theory study notes from LocalStorage
  const [studyNotes, setStudyNotes] = useState<TheoryStudyNote[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.THEORY_NOTES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore error
    }
    return [];
  });

  // Active exercise selected for the timer & metronome
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const activeExercise =
    exercises.find((e) => e.id === activeExerciseId) || null;

  // Persist exercises to LocalStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    } catch {
      // ignore quota error
    }
  }, [exercises]);

  // Persist repertoire to LocalStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPERTOIRE, JSON.stringify(songs));
    } catch {
      // ignore quota error
    }
  }, [songs]);

  // Persist theory study notes to LocalStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.THEORY_NOTES,
        JSON.stringify(studyNotes)
      );
    } catch {
      // ignore quota error
    }
  }, [studyNotes]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Metronome Hook
  const metronome = useMetronome();

  // Practice Timer Hook
  const timer = usePracticeTimer(activeExercise?.durationMinutes || 10);

  // Select an exercise for practice
  const handleSelectExercise = (ex: Exercise) => {
    setActiveExerciseId(ex.id);
    timer.loadDurationMinutes(ex.durationMinutes);
    metronome.setBpm(ex.currentBpm);
    showToast(
      `Exercício "${ex.name}" carregado (${ex.durationMinutes} min • ${ex.currentBpm} BPM)`
    );
  };

  // Exercise CRUD
  const handleAddExercise = (
    newEx: Omit<
      Exercise,
      | 'id'
      | 'createdAt'
      | 'bpmHistory'
      | 'totalSessionsCompleted'
      | 'totalMinutesPracticed'
    >
  ) => {
    const now = new Date().toISOString();
    const created: Exercise = {
      ...newEx,
      id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      bpmHistory: [
        {
          id: `bh-${Date.now()}`,
          bpm: newEx.currentBpm,
          date: now,
          note: 'BPM inicial cadastrado',
        },
      ],
      totalSessionsCompleted: 0,
      totalMinutesPracticed: 0,
    };
    setExercises((prev) => [created, ...prev]);
    setActiveExerciseId(created.id);
    timer.loadDurationMinutes(created.durationMinutes);
    showToast(`Exercício "${created.name}" salvo no LocalStorage!`);
    return created;
  };

  const handleUpdateExercise = (updated: Exercise) => {
    setExercises((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    showToast(`Exercício "${updated.name}" atualizado!`);
  };

  const handleDeleteExercise = (id: string) => {
    const target = exercises.find((e) => e.id === id);
    setExercises((prev) => prev.filter((item) => item.id !== id));
    if (activeExerciseId === id) {
      setActiveExerciseId(null);
    }
    if (target) {
      showToast(`Exercício "${target.name}" removido.`);
    }
  };

  const handleRecordBpm = (
    exerciseId: string,
    bpm: number,
    note?: string,
    durationMinutes?: number
  ) => {
    const now = new Date().toISOString();
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newRecord = {
          id: `bh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          bpm,
          date: now,
          note,
          durationMinutes,
        };
        return {
          ...ex,
          currentBpm: bpm,
          bpmHistory: [...ex.bpmHistory, newRecord],
          totalSessionsCompleted:
            ex.totalSessionsCompleted + (durationMinutes ? 1 : 0),
          totalMinutesPracticed:
            ex.totalMinutesPracticed + (durationMinutes || 0),
        };
      })
    );
    showToast(`Novo registro de ${bpm} BPM salvo no histórico!`);
  };

  const handleDeleteBpmRecord = (exerciseId: string, recordId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const nextHistory = ex.bpmHistory.filter((r) => r.id !== recordId);
        const latestBpm =
          nextHistory.length > 0
            ? nextHistory[nextHistory.length - 1].bpm
            : ex.currentBpm;
        return {
          ...ex,
          currentBpm: latestBpm,
          bpmHistory: nextHistory,
        };
      })
    );
  };

  // Repertoire CRUD
  const handleAddSong = (
    newSong: Omit<RepertoireSong, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const created: RepertoireSong = {
      ...newSong,
      id: `song-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setSongs((prev) => [created, ...prev]);
    showToast(`"${created.artist} - ${created.title}" adicionada ao Repertório!`);
  };

  const handleUpdateSong = (updated: RepertoireSong) => {
    setSongs((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    showToast(`Música "${updated.title}" atualizada!`);
  };

  const handleDeleteSong = (id: string) => {
    const target = songs.find((s) => s.id === id);
    setSongs((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      showToast(`Música "${target.title}" removida do repertório.`);
    }
  };

  const handleUpdateSongStatus = (id: string, status: SongStatus) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === id
          ? {
              ...song,
              status,
              currentBpm:
                status === 'Concluído'
                  ? Math.max(song.currentBpm, song.originalBpm)
                  : song.currentBpm,
              updatedAt: new Date().toISOString(),
            }
          : song
      )
    );
    showToast(`Status atualizado para "${status}"!`);
  };

  // Theory Study Notes CRUD
  const handleAddStudyNote = (
    newNote: Omit<TheoryStudyNote, 'id' | 'createdAt'>
  ) => {
    const created: TheoryStudyNote = {
      ...newNote,
      id: `tn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setStudyNotes((prev) => [created, ...prev]);
    showToast('Anotação salva no Caderno de Estudos (LocalStorage)!');
  };

  const handleDeleteStudyNote = (id: string) => {
    setStudyNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Anotação removida do Caderno.');
  };

  // Load Sample Data for quick testing
  const handleLoadSamples = () => {
    const nextExercises =
      exercises.length === 0 ? SAMPLE_EXERCISES : exercises;
    const nextSongs = songs.length === 0 ? SAMPLE_REPERTOIRE : songs;

    setExercises(nextExercises);
    setSongs(nextSongs);
    if (!activeExerciseId && nextExercises.length > 0) {
      setActiveExerciseId(nextExercises[0].id);
      timer.loadDurationMinutes(nextExercises[0].durationMinutes);
    }
    showToast('Dados de exemplo de guitarra carregados no LocalStorage!');
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      exercises,
      repertoire: songs,
      theoryNotes: studyNotes,
      metronome: metronome.settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guitarlab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exportado com sucesso!');
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result));
        if (Array.isArray(parsed.exercises)) {
          setExercises(parsed.exercises);
        }
        if (Array.isArray(parsed.repertoire)) {
          setSongs(parsed.repertoire);
        }
        if (Array.isArray(parsed.theoryNotes)) {
          setStudyNotes(parsed.theoryNotes);
        }
        if (parsed.metronome) {
          metronome.setSettings(parsed.metronome);
        }
        showToast('Backup JSON importado e salvo no LocalStorage!');
      } catch {
        showToast('Erro ao ler arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear LocalStorage completely
  const handleClearStorage = () => {
    if (
      !window.confirm(
        'Deseja realmente apagar todos os Exercícios, Repertório e Anotações do LocalStorage?'
      )
    ) {
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.REPERTOIRE);
    localStorage.removeItem(STORAGE_KEYS.METRONOME);
    localStorage.removeItem(STORAGE_KEYS.THEORY_NOTES);
    setExercises([]);
    setSongs([]);
    setStudyNotes([]);
    setActiveExerciseId(null);
    showToast('LocalStorage limpo! Todas as informações foram apagadas.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 border border-amber-500/60 text-zinc-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR MENU (HAMBÚRGUER) */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        exercisesCount={exercises.length}
        songsCount={songs.length}
        studyNotesCount={studyNotes.length}
        showLoadSamples={exercises.length === 0 || songs.length === 0}
        showClearStorage={
          exercises.length > 0 || songs.length > 0 || studyNotes.length > 0
        }
        onLoadSamples={handleLoadSamples}
        onExportBackup={handleExportBackup}
        onImportBackup={() => fileInputRef.current?.click()}
        onClearStorage={handleClearStorage}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportBackup}
        className="hidden"
      />

      {/* CONTENT AREA (deslocada pela largura do menu lateral no desktop) */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        }`}
      >
        {/* SLIM TOP BAR */}
        <header className="sticky top-0 z-20 h-16 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md">
          <div className="max-w-7xl h-full mx-auto px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (window.matchMedia('(min-width: 1024px)').matches) {
                    setSidebarCollapsed((prev) => !prev);
                  } else {
                    setMobileMenuOpen(true);
                  }
                }}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 transition shrink-0"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold tracking-tight text-zinc-100 truncate">
                  {TAB_META[activeTab].title}
                </h2>
                <p className="text-xs text-zinc-400 truncate">
                  {TAB_META[activeTab].subtitle}
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
              <Database className="w-3 h-3 text-emerald-400" />
              LocalStorage ({exercises.length} ex • {songs.length} mús)
            </span>
          </div>
        </header>

      {/* MAIN WORKSPACE: PERSISTENT METRONOME + ACTIVE TAB */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column (8 cols on desktop): Exercises+Timer, Repertoire OR Theory */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            {activeTab === 'exercises' && (
              <ExercisesView
                exercises={exercises}
                activeExercise={activeExercise}
                onSelectExercise={handleSelectExercise}
                onAddExercise={handleAddExercise}
                onUpdateExercise={handleUpdateExercise}
                onDeleteExercise={handleDeleteExercise}
                onRecordBpm={handleRecordBpm}
                onDeleteBpmRecord={handleDeleteBpmRecord}
                onLoadSamples={handleLoadSamples}
                timerMode={timer.mode}
                displaySeconds={timer.displaySeconds}
                elapsedSeconds={timer.elapsedSeconds}
                progressPercent={timer.progressPercent}
                isTimerRunning={timer.isRunning}
                isTimerFinished={timer.isFinished}
                onToggleTimer={timer.toggleTimer}
                onResetTimer={timer.resetTimer}
                onAddTimeSeconds={timer.addTimeSeconds}
                onSwitchTimerMode={timer.switchMode}
                currentMetronomeBpm={metronome.settings.bpm}
                onSyncMetronomeBpm={(bpm) => {
                  metronome.setBpm(bpm);
                  showToast(`Metrônomo ajustado para ${bpm} BPM`);
                }}
              />
            )}

            {activeTab === 'repertoire' && (
              <RepertoireView
                songs={songs}
                onAddSong={handleAddSong}
                onUpdateSong={handleUpdateSong}
                onDeleteSong={handleDeleteSong}
                onUpdateStatus={handleUpdateSongStatus}
                onSyncMetronomeBpm={(bpm) => {
                  metronome.setBpm(bpm);
                  showToast(`Metrônomo ajustado para ${bpm} BPM`);
                }}
                onLoadSamples={handleLoadSamples}
              />
            )}

            {activeTab === 'theory' && (
              <TheoryView
                studyNotes={studyNotes}
                onAddStudyNote={handleAddStudyNote}
                onDeleteStudyNote={handleDeleteStudyNote}
                onCreateExerciseFromTheory={(exPayload) => {
                  const created = handleAddExercise(exPayload);
                  metronome.setBpm(created.currentBpm);
                  setActiveTab('exercises');
                }}
              />
            )}
          </div>

          {/* Right Column (4 cols on desktop): Persistent Metronome Studio */}
          <div className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-20">
            <MetronomePanel
              settings={metronome.settings}
              isPlaying={metronome.isPlaying}
              currentBeat={metronome.currentBeat}
              currentSubBeat={metronome.currentSubBeat}
              barsPlayed={metronome.barsPlayed}
              togglePlay={metronome.togglePlay}
              setBpm={metronome.setBpm}
              setTimeSignature={metronome.setTimeSignature}
              setSubdivision={metronome.setSubdivision}
              setSoundPreset={metronome.setSoundPreset}
              setVolume={metronome.setVolume}
              toggleBeatAccent={metronome.toggleBeatAccent}
              updateSpeedTrainer={metronome.updateSpeedTrainer}
              tapTempo={metronome.tapTempo}
              activeExercise={activeExercise}
              onSaveBpmToActiveExercise={(bpm) => {
                if (activeExercise) {
                  handleRecordBpm(
                    activeExercise.id,
                    bpm,
                    'Salvo direto pelo Metrônomo'
                  );
                }
              }}
            />
          </div>
        </div>
      </main>
      </div>

      {/* FIXED BOTTOM MINI-PLAYER BAR */}
      <MiniPlayerBar
        metronomeSettings={metronome.settings}
        isMetronomePlaying={metronome.isPlaying}
        currentBeat={metronome.currentBeat}
        onToggleMetronome={metronome.togglePlay}
        onChangeBpm={metronome.setBpm}
        onTapTempo={metronome.tapTempo}
        activeExercise={activeExercise}
        displaySeconds={timer.displaySeconds}
        isTimerRunning={timer.isRunning}
        isTimerFinished={timer.isFinished}
        onToggleTimer={timer.toggleTimer}
        onResetTimer={() => timer.resetTimer(activeExercise?.durationMinutes)}
        onGoToExercisesTab={() => setActiveTab('exercises')}
      />
    </div>
  );
}

export default App;
