import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Guitar,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Compass,
  Info,
  Play,
  NotebookPen,
  Eye,
} from 'lucide-react';
import {
  ALL_MAJOR_KEYS,
  MAJOR_SCALE_INTERVALS,
  CLASSIC_PROGRESSIONS,
  GUITAR_STRINGS_STANDARD,
  MajorKeyData,
  HarmonicFieldDegree,
  HarmonicFunction,
} from '../data/theoryData';
import { ExerciseCategory, TheoryStudyNote } from '../types/music';
import { soundEngine } from '../utils/audioEngine';

interface TheoryViewProps {
  studyNotes: TheoryStudyNote[];
  onAddStudyNote: (note: Omit<TheoryStudyNote, 'id' | 'createdAt'>) => void;
  onDeleteStudyNote: (id: string) => void;
  onCreateExerciseFromTheory: (exercise: {
    name: string;
    category: ExerciseCategory;
    description: string;
    durationMinutes: number;
    currentBpm: number;
    targetBpm: number;
  }) => void;
}

type TheorySubTab =
  | 'major-scales'
  | 'harmonic-field'
  | 'all-keys-matrix'
  | 'study-notebook';

type FretboardFilterMode =
  | 'full'
  | 'root-6th-box'
  | 'root-5th-box'
  | 'triad-only';

const FUNCTION_BADGE_STYLES: Record<HarmonicFunction, string> = {
  Tônica: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  Subdominante: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  Dominante: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
};

export const TheoryView: React.FC<TheoryViewProps> = ({
  studyNotes,
  onAddStudyNote,
  onDeleteStudyNote,
  onCreateExerciseFromTheory,
}) => {
  const [subTab, setSubTab] = useState<TheorySubTab>('major-scales');
  const [selectedKeyId, setSelectedKeyId] = useState<string>('C');

  // Fretboard visualization states
  const [fretboardMode, setFretboardMode] =
    useState<FretboardFilterMode>('full');
  const [showIntervalsOnFretboard, setShowIntervalsOnFretboard] =
    useState<boolean>(false);

  // Harmonic Field states
  const [chordTypeView, setChordTypeView] = useState<'triads' | 'tetrads'>(
    'tetrads'
  );
  const [functionFilter, setFunctionFilter] = useState<
    'Todas' | HarmonicFunction
  >('Todas');
  const [highlightedDegree, setHighlightedDegree] =
    useState<HarmonicFieldDegree | null>(null);

  // Study Notebook Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTopic, setNoteTopic] =
    useState<TheoryStudyNote['topic']>('Escalas Maiores');
  const [noteContent, setNoteContent] = useState('');

  const currentKey: MajorKeyData =
    ALL_MAJOR_KEYS.find((k) => k.id === selectedKeyId) || ALL_MAJOR_KEYS[0];

  // Play the full Major Scale (1st to 8th degree)
  const handlePlayScale = (keyData: MajorKeyData) => {
    const semitones = [0, 2, 4, 5, 7, 9, 11, 12];
    const midiSequence = semitones.map((s) => keyData.baseMidi + s);
    soundEngine.playScaleSequence(midiSequence, 0.22);
  };

  // Play a specific chord from the Harmonic Field
  const handlePlayChord = (deg: HarmonicFieldDegree) => {
    const midi =
      chordTypeView === 'tetrads' ? deg.tetradMidi : deg.triadMidi;
    soundEngine.playChordVoicing(midi, 0.05);
  };

  // Play a chord progression in the active key
  const handlePlayProgression = (degrees: number[]) => {
    degrees.forEach((degNum, idx) => {
      const degObj = currentKey.harmonicField.find(
        (d) => d.degreeNumber === degNum
      );
      if (!degObj) return;
      const midi =
        chordTypeView === 'tetrads' ? degObj.tetradMidi : degObj.triadMidi;
      window.setTimeout(() => {
        soundEngine.playChordVoicing(midi, 0.045);
      }, idx * 950);
    });
  };

  // Create practice exercise from current scale or harmonic field
  const handleSendScaleToPractice = () => {
    onCreateExerciseFromTheory({
      name: `Escala de ${currentKey.ptName} (${currentKey.shortName}) — 3 Notas por Corda & CAGED`,
      category: 'Técnica',
      description: `Notas da Escala de ${currentKey.ptName}: ${currentKey.scaleNotes.join(
        ' - '
      )} (${currentKey.keySignatureText}). Praticar em todas as 5 regiões do braço (Tônica na 6ª corda casa ${
        currentKey.guitarRootFret6thString
      } e 5ª corda casa ${currentKey.guitarRootFret5thString}).`,
      durationMinutes: 10,
      currentBpm: 90,
      targetBpm: 140,
    });
  };

  const handleSendHarmonicFieldToPractice = () => {
    const chordsList = currentKey.harmonicField
      .map((d) => (chordTypeView === 'tetrads' ? d.tetradName : d.triadName))
      .join(' | ');
    onCreateExerciseFromTheory({
      name: `Campo Harmônico de ${currentKey.ptName} (${
        chordTypeView === 'tetrads' ? 'Tétrades' : 'Tríades'
      })`,
      category: 'Harmonia',
      description: `Acordes do Campo Harmônico de ${currentKey.ptName}: ${chordsList}. Praticar encadeamento dos 7 graus e cadências II-V-I pelo braço.`,
      durationMinutes: 15,
      currentBpm: 75,
      targetBpm: 110,
    });
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    onAddStudyNote({
      title: noteTitle.trim(),
      topic: noteTopic,
      keySignature: currentKey.shortName,
      content: noteContent.trim(),
    });
    setNoteTitle('');
    setNoteContent('');
  };

  // Helper to check if a fret is in the active region filter
  const isFretInRegion = (fret: number, degreeIndex: number): boolean => {
    if (fretboardMode === 'full') return true;
    if (fretboardMode === 'triad-only') {
      return degreeIndex === 0 || degreeIndex === 2 || degreeIndex === 4;
    }
    if (fretboardMode === 'root-6th-box') {
      const start = Math.max(0, currentKey.guitarRootFret6thString - 1);
      const end = start + 5;
      return fret >= start && fret <= end;
    }
    if (fretboardMode === 'root-5th-box') {
      const start = Math.max(0, currentKey.guitarRootFret5thString - 1);
      const end = start + 5;
      return fret >= start && fret <= end;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* HEADER & EXTENSIBLE MODULE NAVIGATION */}
      <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <BookOpen className="w-3.5 h-3.5" />
                Centro de Estudos de Teoria Musical
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Arquitetura Modular • Guitarra 6 Cordas
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-zinc-100">
              Biblioteca de Escalas Maiores & Campos Harmônicos
            </h2>
            <p className="text-xs text-zinc-400">
              Explore os 12 tons maiores, visualize as notas no braço da guitarra,
              ouça cada escala e acorde em tempo real e envie treinos direto para o
              seu cronômetro.
            </p>
          </div>

          {/* Sub-navigation for Theory Modules */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setSubTab('major-scales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                subTab === 'major-scales'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Guitar className="w-3.5 h-3.5" />
              Escalas Maiores
            </button>

            <button
              type="button"
              onClick={() => setSubTab('harmonic-field')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                subTab === 'harmonic-field'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Campos Harmônicos
            </button>

            <button
              type="button"
              onClick={() => setSubTab('all-keys-matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                subTab === 'all-keys-matrix'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Mapa dos 12 Tons
            </button>

            <button
              type="button"
              onClick={() => setSubTab('study-notebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                subTab === 'study-notebook'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <NotebookPen className="w-3.5 h-3.5" />
              Caderno ({studyNotes.length})
            </button>
          </div>
        </div>

        {/* GLOBAL KEY SELECTOR (12 MAJOR KEYS) */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-300">
              Selecione a Tonalidade Maior (Ciclo das Quintas / Quartas):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePlayScale(currentKey)}
                className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Ouvir Escala de {currentKey.shortName}
              </button>
              <button
                type="button"
                onClick={
                  subTab === 'harmonic-field'
                    ? handleSendHarmonicFieldToPractice
                    : handleSendScaleToPractice
                }
                className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Exercício deste Tom
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
            {ALL_MAJOR_KEYS.map((keyItem) => {
              const active = keyItem.id === currentKey.id;
              return (
                <button
                  key={keyItem.id}
                  type="button"
                  onClick={() => {
                    setSelectedKeyId(keyItem.id);
                    setHighlightedDegree(null);
                  }}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition ${
                    active
                      ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 font-extrabold scale-105'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-sm font-mono font-bold">
                    {keyItem.shortName}
                  </span>
                  <span
                    className={`text-[9px] font-mono ${
                      active ? 'text-zinc-900 font-semibold' : 'text-zinc-500'
                    }`}
                  >
                    {keyItem.accidentalsCount === 0
                      ? 'Natural'
                      : `${keyItem.accidentalsCount}${
                          keyItem.accidentalType === 'sharp' ? '#' : 'b'
                        }`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Key Summary Banner */}
        <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-extrabold text-base">
              {currentKey.name}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="flex flex-wrap items-center gap-3 text-zinc-300">
                <span>
                  Armadura: <strong className="text-amber-300">{currentKey.keySignatureText}</strong>
                </span>
                <span className="text-zinc-600">•</span>
                <span>
                  Relativa Menor (6º Grau):{' '}
                  <strong className="text-emerald-400">{currentKey.relativeMinor}</strong>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono">
                  Tônica na Guitarra: <strong>6ª corda (Casa {currentKey.guitarRootFret6thString})</strong> |{' '}
                  <strong>5ª corda (Casa {currentKey.guitarRootFret5thString})</strong>
                </span>
              </div>
              <p className="text-zinc-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{currentKey.characteristicTip}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          MODULE 1: ESCALAS MAIORES & BRAÇO INTERATIVO DA GUITARRA
      ===================================================================== */}
      {subTab === 'major-scales' && (
        <div className="space-y-6">
          {/* Scale Formula & 7 Notes Breakdown */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Estrutura da Escala de {currentKey.ptName} (Fórmula: T - T - S - T - T - T - S)
                </h3>
                <p className="text-xs text-zinc-400">
                  Clique em qualquer nota abaixo para ouvir seu som individual e ver sua função intervalar.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-950 border border-zinc-800 text-amber-400">
                Notas: {currentKey.scaleNotes.join(' – ')}
              </span>
            </div>

            {/* 7 Degrees Interactive Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {currentKey.scaleNotes.map((note, idx) => {
                const intervalInfo = MAJOR_SCALE_INTERVALS[idx];
                const noteMidi =
                  currentKey.baseMidi + intervalInfo.semitones;
                const isTriadNote = idx === 0 || idx === 2 || idx === 4;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => soundEngine.playMusicalNote(noteMidi, 0, 0.75, 0.32)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition hover:scale-[1.02] active:scale-95 ${
                      idx === 0
                        ? 'bg-amber-500/15 border-amber-500/50'
                        : isTriadNote
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                    title={`Clique para ouvir ${note} (${intervalInfo.interval})`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-mono font-bold text-zinc-400">
                        {intervalInfo.degree}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          intervalInfo.stepAfter.includes('Semitom')
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        +{intervalInfo.stepAfter}
                      </span>
                    </div>

                    <div className="my-1">
                      <div
                        className={`text-2xl font-mono font-extrabold ${
                          idx === 0
                            ? 'text-amber-400'
                            : isTriadNote
                            ? 'text-emerald-400'
                            : 'text-zinc-100'
                        }`}
                      >
                        {note}
                      </div>
                      <div className="text-[11px] font-semibold text-zinc-300">
                        {intervalInfo.interval}
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {intervalInfo.role}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* INTERACTIVE GUITAR FRETBOARD (0 TO 15 FRETS) */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Guitar className="w-4 h-4 text-amber-400" />
                  Mapeamento no Braço da Guitarra — {currentKey.ptName} (Afinação E Standard)
                </h3>
                <p className="text-xs text-zinc-400">
                  Clique em qualquer nota no braço para ouvir a altura exata daquela casa!
                </p>
              </div>

              {/* Fretboard View Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setFretboardMode('full')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      fretboardMode === 'full'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Braço Inteiro
                  </button>
                  <button
                    type="button"
                    onClick={() => setFretboardMode('root-6th-box')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      fretboardMode === 'root-6th-box'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Shape 6ª Corda (Casa {currentKey.guitarRootFret6thString})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFretboardMode('root-5th-box')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      fretboardMode === 'root-5th-box'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Shape 5ª Corda (Casa {currentKey.guitarRootFret5thString})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFretboardMode('triad-only')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      fretboardMode === 'triad-only'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Apenas Tríade (1-3-5)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowIntervalsOnFretboard((prev) => !prev)
                  }
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  {showIntervalsOnFretboard
                    ? 'Mostrando: Graus (1J, 3M...)'
                    : 'Mostrando: Notas (C, D, E...)'}
                </button>
              </div>
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs bg-zinc-950/60 px-3.5 py-2 rounded-xl border border-zinc-800/80">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#fbbf24]" />
                <strong className="text-amber-300">Tônica (1º Grau): {currentKey.scaleNotes[0]}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
                <strong className="text-emerald-300">Terça Maior (3M): {currentKey.scaleNotes[2]}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 inline-block" />
                <strong className="text-sky-300">Quinta Justa (5J): {currentKey.scaleNotes[4]}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-700 border border-zinc-500 inline-block" />
                <span className="text-zinc-300">Demais Graus (2M, 4J, 6M, 7M)</span>
              </span>
            </div>

            {/* Fretboard Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[880px] bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                {/* Fret Numbers Header */}
                <div
                  className="grid gap-1 mb-2 text-center items-center"
                  style={{
                    gridTemplateColumns: '64px repeat(16, minmax(0, 1fr))',
                  }}
                >
                  <div className="text-[11px] font-mono text-zinc-500 font-bold text-left">
                    Corda
                  </div>
                  {Array.from({ length: 16 }, (_, fret) => {
                    const isMarker = [3, 5, 7, 9, 12, 15].includes(fret);
                    return (
                      <div
                        key={fret}
                        className={`text-[11px] font-mono ${
                          fret === 0
                            ? 'text-amber-400 font-bold'
                            : isMarker
                            ? 'text-zinc-200 font-bold'
                            : 'text-zinc-500'
                        }`}
                      >
                        {fret === 0 ? 'Solta' : `${fret}ª`}
                      </div>
                    );
                  })}
                </div>

                {/* 6 Guitar Strings Rows */}
                <div className="space-y-2">
                  {GUITAR_STRINGS_STANDARD.map((str) => (
                    <div
                      key={str.stringNumber}
                      className="grid gap-1 items-center relative"
                      style={{
                        gridTemplateColumns: '64px repeat(16, minmax(0, 1fr))',
                      }}
                    >
                      {/* String Label */}
                      <div className="text-xs font-mono font-bold text-zinc-300 pr-2">
                        {str.label}
                      </div>

                      {/* Frets 0 to 15 */}
                      {Array.from({ length: 16 }, (_, fret) => {
                        const pitchClass = (str.openPitchClass + fret) % 12;
                        const degreeIdx =
                          currentKey.scalePitchClasses.indexOf(pitchClass);
                        const isInScale = degreeIdx !== -1;
                        const isVisible =
                          isInScale && isFretInRegion(fret, degreeIdx);
                        const noteName = isInScale
                          ? currentKey.scaleNotes[degreeIdx]
                          : '';
                        const intervalShort = [
                          '1J',
                          '2M',
                          '3M',
                          '4J',
                          '5J',
                          '6M',
                          '7M',
                        ][degreeIdx];
                        const midiNote = str.openMidi + fret;

                        return (
                          <div
                            key={fret}
                            className={`h-9 flex items-center justify-center relative border-r ${
                              fret === 0
                                ? 'border-r-4 border-r-zinc-500 bg-zinc-900/60'
                                : 'border-r-zinc-800/90'
                            }`}
                          >
                            {/* Horizontal guitar string wire */}
                            <div
                              className="absolute left-0 right-0 bg-zinc-700/60 pointer-events-none"
                              style={{
                                height: `${Math.max(1, Math.ceil(str.stringNumber * 0.45))}px`,
                              }}
                            />

                            {isVisible && (
                              <button
                                type="button"
                                onClick={() =>
                                  soundEngine.playMusicalNote(
                                    midiNote,
                                    0,
                                    0.7,
                                    0.3
                                  )
                                }
                                className={`relative z-10 w-7 h-7 rounded-full font-mono text-[11px] font-extrabold flex items-center justify-center transition transform hover:scale-125 active:scale-95 ${
                                  degreeIdx === 0
                                    ? 'bg-amber-400 text-zinc-950 shadow-[0_0_10px_rgba(251,191,36,0.7)] ring-2 ring-amber-200'
                                    : degreeIdx === 2
                                    ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : degreeIdx === 4
                                    ? 'bg-sky-500 text-zinc-950 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                                    : 'bg-zinc-800 text-zinc-100 border border-zinc-600 hover:border-amber-400'
                                }`}
                                title={`Corda ${str.label}, Casa ${fret}: ${noteName} (${intervalShort})`}
                              >
                                {showIntervalsOnFretboard
                                  ? intervalShort
                                  : noteName}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Fretboard Inlay Dots Footer */}
                <div
                  className="grid gap-1 mt-2 text-center"
                  style={{
                    gridTemplateColumns: '64px repeat(16, minmax(0, 1fr))',
                  }}
                >
                  <div />
                  {Array.from({ length: 16 }, (_, fret) => {
                    const isSingleDot = [3, 5, 7, 9, 15].includes(fret);
                    const isDoubleDot = fret === 12;
                    return (
                      <div
                        key={fret}
                        className="flex items-center justify-center gap-1 h-3"
                      >
                        {isSingleDot && (
                          <span className="w-2 h-2 rounded-full bg-zinc-700" />
                        )}
                        {isDoubleDot && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                            <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          MODULE 2: CAMPOS HARMÔNICOS MAIORES (TRÍADES, TÉTRADES & PROGRESSÕES)
      ===================================================================== */}
      {subTab === 'harmonic-field' && (
        <div className="space-y-6">
          {/* Controls for Triads vs Tetrads & Harmonic Function Filter */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">
                  Campo Harmônico Maior de {currentKey.ptName} ({currentKey.shortName})
                </h3>
                <p className="text-xs text-zinc-400">
                  Formado pelo empilhamento de terças (1-3-5 nas tríades e 1-3-5-7 nas tétrades) sobre cada nota da escala maior.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Triads vs Tetrads Switch */}
                <div className="inline-flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setChordTypeView('triads')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      chordTypeView === 'triads'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Tríades (3 notas: 1-3-5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChordTypeView('tetrads')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      chordTypeView === 'tetrads'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Tétrades (4 notas: 1-3-5-7)
                  </button>
                </div>

                {/* Harmonic Function Filter */}
                <div className="inline-flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  {(
                    ['Todas', 'Tônica', 'Subdominante', 'Dominante'] as const
                  ).map((fn) => (
                    <button
                      key={fn}
                      type="button"
                      onClick={() => setFunctionFilter(fn)}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                        functionFilter === fn
                          ? 'bg-zinc-800 text-amber-300'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {fn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 7 Harmonic Field Degrees Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {currentKey.harmonicField
                .filter(
                  (deg) =>
                    functionFilter === 'Todas' ||
                    deg.harmonicFunction === functionFilter
                )
                .map((deg) => {
                  const isHighlighted =
                    highlightedDegree?.degreeNumber === deg.degreeNumber;
                  const chordSymbol =
                    chordTypeView === 'tetrads'
                      ? deg.tetradName
                      : deg.triadName;
                  const romanSymbol =
                    chordTypeView === 'tetrads'
                      ? deg.romanTetrad
                      : deg.romanTriad;
                  const notesArray =
                    chordTypeView === 'tetrads'
                      ? deg.tetradNotes
                      : deg.triadNotes;

                  return (
                    <div
                      key={deg.degreeNumber}
                      onClick={() => {
                        setHighlightedDegree(deg);
                        handlePlayChord(deg);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all hover:scale-[1.02] ${
                        isHighlighted
                          ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                          : 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-extrabold text-zinc-400">
                            {deg.degreeNumber}º • {romanSymbol}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              FUNCTION_BADGE_STYLES[deg.harmonicFunction]
                            }`}
                          >
                            {deg.harmonicFunction}
                          </span>
                        </div>

                        <div className="py-1">
                          <div className="text-2xl font-mono font-extrabold text-amber-400">
                            {chordSymbol}
                          </div>
                          <div className="text-[11px] text-zinc-300 font-medium">
                            {chordTypeView === 'tetrads'
                              ? deg.qualityTetrad
                              : deg.qualityTriad}
                          </div>
                        </div>

                        {/* Chord Notes */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                          <span className="text-[10px] text-zinc-500 block uppercase">
                            Notas do Acorde:
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-100">
                            {notesArray.join(' – ')}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-400">
                          Modo: <strong className="text-zinc-200">{deg.modeName}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHighlightedDegree(deg);
                          handlePlayChord(deg);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-800 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Ouvir {chordSymbol}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Selected Chord Deep-Dive Box */}
            {highlightedDegree && (
              <div className="bg-zinc-950 border border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-amber-400">
                      Análise do {highlightedDegree.degreeNumber}º Grau ({highlightedDegree.tetradName})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                        FUNCTION_BADGE_STYLES[highlightedDegree.harmonicFunction]
                      }`}
                    >
                      Função {highlightedDegree.harmonicFunction}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {highlightedDegree.functionDescription}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono">
                    Tríade: <strong>{highlightedDegree.triadName}</strong> ({highlightedDegree.triadNotes.join(' - ')}) • Tétrade:{' '}
                    <strong>{highlightedDegree.tetradName}</strong> ({highlightedDegree.tetradNotes.join(' - ')}) • Escala/Modo p/ Solo:{' '}
                    <strong className="text-emerald-400">{highlightedDegree.modeName}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlayChord(highlightedDegree)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                >
                  <Volume2 className="w-4 h-4" />
                  Tocar Acorde Novamente
                </button>
              </div>
            )}
          </section>

          {/* CLASSIC CHORD PROGRESSIONS IN THIS KEY */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Progressões Harmônicas & Cadências em {currentKey.ptName}
              </h3>
              <p className="text-xs text-zinc-400">
                Veja como os acordes do campo harmônico de {currentKey.ptName} se conectam na prática e clique para ouvir ou transformar em exercício!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLASSIC_PROGRESSIONS.map((prog) => {
                const chordSequence = prog.degrees.map((degNum) => {
                  const found = currentKey.harmonicField.find(
                    (d) => d.degreeNumber === degNum
                  )!;
                  return chordTypeView === 'tetrads'
                    ? found.tetradName
                    : found.triadName;
                });

                return (
                  <div
                    key={prog.id}
                    className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-zinc-100">
                          {prog.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {prog.style}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-zinc-400">
                        Graus: <strong className="text-zinc-200">{prog.romanFormula}</strong>
                      </div>

                      {/* Transposed Chords Display */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {chordSequence.map((ch, idx) => (
                          <React.Fragment key={idx}>
                            <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 font-mono text-sm font-extrabold text-amber-300">
                              {ch}
                            </span>
                            {idx < chordSequence.length - 1 && (
                              <span className="text-zinc-600 font-mono">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <p className="text-xs text-zinc-400 pt-1">
                        {prog.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                      <button
                        type="button"
                        onClick={() => handlePlayProgression(prog.degrees)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Ouvir Progressão
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onCreateExerciseFromTheory({
                            name: `${prog.name} em ${currentKey.ptName} (${chordSequence.join(
                              ' - '
                            )})`,
                            category: 'Harmonia',
                            description: `Praticar base rítmica, condução de vozes (voice leading) e improvisação em ${
                              currentKey.ptName
                            } sobre a progressão ${chordSequence.join(
                              ' -> '
                            )} (${prog.romanFormula}).`,
                            durationMinutes: 10,
                            currentBpm: 85,
                            targetBpm: 120,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        Treinar no Cronômetro
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          MODULE 3: MAPA COMPLETO DOS 12 CAMPOS HARMÔNICOS MAIORES
      ===================================================================== */}
      {subTab === 'all-keys-matrix' && (
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Tabela Mestre dos 12 Campos Harmônicos Maiores
              </h3>
              <p className="text-xs text-zinc-400">
                Consulte e compare todos os 12 tons simultaneamente para tirar músicas de ouvido ou transpor tonalidades. Clique em qualquer linha para selecionar o tom.
              </p>
            </div>

            <div className="inline-flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setChordTypeView('triads')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  chordTypeView === 'triads'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Ver Tríades
              </button>
              <button
                type="button"
                onClick={() => setChordTypeView('tetrads')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  chordTypeView === 'tetrads'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Ver Tétrades
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/80">
                  <th className="py-3 px-3">Tom</th>
                  <th className="py-3 px-3">Acidentes</th>
                  <th className="py-3 px-3 text-emerald-400">I (Tônica)</th>
                  <th className="py-3 px-3 text-sky-400">IIm (Subdom.)</th>
                  <th className="py-3 px-3 text-emerald-400">IIIm (Tônica)</th>
                  <th className="py-3 px-3 text-sky-400">IV (Subdom.)</th>
                  <th className="py-3 px-3 text-rose-400">V (Dominante)</th>
                  <th className="py-3 px-3 text-emerald-400">VIm (Relativa)</th>
                  <th className="py-3 px-3 text-rose-400">VII° (Sensível)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {ALL_MAJOR_KEYS.map((k) => {
                  const isCurrent = k.id === currentKey.id;
                  return (
                    <tr
                      key={k.id}
                      onClick={() => setSelectedKeyId(k.id)}
                      className={`cursor-pointer transition ${
                        isCurrent
                          ? 'bg-amber-500/15 text-amber-200 font-bold'
                          : 'hover:bg-zinc-800/50 text-zinc-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-extrabold text-amber-400">
                        {k.shortName} ({k.ptName.split(' ')[0]})
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {k.accidentalsCount === 0
                          ? '0'
                          : `${k.accidentalsCount}${
                              k.accidentalType === 'sharp' ? '#' : 'b'
                            }`}
                      </td>
                      {k.harmonicField.map((d) => (
                        <td
                          key={d.degreeNumber}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKeyId(k.id);
                            handlePlayChord(d);
                          }}
                          className="py-2.5 px-3 hover:text-amber-300 hover:underline"
                          title="Clique para ouvir este acorde"
                        >
                          {chordTypeView === 'tetrads'
                            ? d.tetradName
                            : d.triadName}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =====================================================================
          MODULE 4: CADERNO DE ESTUDOS PESSOAL (PERSISTIDO NO LOCALSTORAGE)
      ===================================================================== */}
      {subTab === 'study-notebook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Form to add personal theory note */}
          <form
            onSubmit={handleAddNoteSubmit}
            className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4 h-fit"
          >
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <NotebookPen className="w-4 h-4 text-amber-400" />
                Nova Anotação de Estudo
              </h3>
              <p className="text-xs text-zinc-400">
                Salve resumos, dúvidas, descobertas ou padrões que você está estudando.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Título da Anotação *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Como usar o modo Lídio no IV grau de Sol Maior"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Tópico
              </label>
              <select
                value={noteTopic}
                onChange={(e) =>
                  setNoteTopic(e.target.value as TheoryStudyNote['topic'])
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Escalas Maiores">Escalas Maiores</option>
                <option value="Campo Harmônico">Campo Harmônico</option>
                <option value="Aplicação na Guitarra">
                  Aplicação na Guitarra
                </option>
                <option value="Outro">Outro Tópico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Conteúdo / Resumo *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Escreva suas observações, shapes preferidos, substituições de acordes..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar no Caderno (Tom: {currentKey.shortName})
            </button>
          </form>

          {/* Right: Saved Study Notes List */}
          <div className="lg:col-span-7 space-y-3">
            {studyNotes.length === 0 ? (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center space-y-2">
                <NotebookPen className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-200">
                  Seu Caderno de Estudos está vazio
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Registre aqui seus insights sobre escalas maiores, campos harmônicos, shapes CAGED e aplicações nas músicas do seu repertório.
                </p>
              </div>
            ) : (
              studyNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {note.topic}
                      </span>
                      {note.keySignature && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300">
                          Tom: {note.keySignature}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-zinc-500">
                        {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteStudyNote(note.id)}
                      className="text-zinc-500 hover:text-rose-400 transition"
                      title="Excluir anotação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-zinc-100">
                    {note.title}
                  </h4>
                  <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
