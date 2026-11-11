import {
  Exercise,
  ExerciseCategory,
  RepertoireSong,
  SongStatus,
  TimeSignature,
  Subdivision,
  MetronomeSettings,
} from '../types/music';

export const STORAGE_KEYS = {
  EXERCISES: 'guitarlab_exercises_v1',
  REPERTOIRE: 'guitarlab_repertoire_v1',
  METRONOME: 'guitarlab_metronome_v1',
  THEORY_NOTES: 'guitarlab_theory_notes_v1',
};

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'Técnica',
  'Velocidade',
  'Sweep Picking',
  'Alternate Picking',
  'Legato',
  'Harmonia',
  'Improvisação',
  'Rítmica / Riff',
  'Aquecimento',
  'Outro',
];

export const SONG_STATUSES: SongStatus[] = [
  'Quero Aprender',
  'Em Andamento',
  'Aperfeiçoando / Solo',
  'Concluído',
];

export const GUITAR_TUNINGS: string[] = [
  'E Standard (E A D G B E)',
  'Eb Standard (Eb Ab Db Gb Bb Eb)',
  'D Standard (D G C F A D)',
  'Drop D (D A D G B E)',
  'Drop C# (C# G# C# F# A# D#)',
  'Drop C (C G C F A D)',
  'Drop B (B F# B E G# C#)',
  '7 Cordas Standard (B E A D G B E)',
  '7 Cordas Drop A (A E A D G B E)',
  'Open G / Custom',
];

export const TIME_SIGNATURES: {
  value: TimeSignature;
  label: string;
  beats: number;
  noteValue: number;
  description: string;
}[] = [
  { value: '4/4', label: '4/4', beats: 4, noteValue: 4, description: 'Quaternário (Rock / Metal / Pop)' },
  { value: '3/4', label: '3/4', beats: 3, noteValue: 4, description: 'Ternário (Valsa / Ballad)' },
  { value: '2/4', label: '2/4', beats: 2, noteValue: 4, description: 'Binário (Polca / Marcha / Thrash)' },
  { value: '6/8', label: '6/8', beats: 6, noteValue: 8, description: 'Composto Binário (Blues / Ballad)' },
  { value: '5/4', label: '5/4', beats: 5, noteValue: 4, description: 'Compasso Ímpar (Prog / Fusion)' },
  { value: '7/8', label: '7/8', beats: 7, noteValue: 8, description: 'Compasso Ímpar (Prog Metal)' },
  { value: '9/8', label: '9/8', beats: 9, noteValue: 8, description: 'Composto Ternário (Prog / Jazz)' },
  { value: '12/8', label: '12/8', beats: 12, noteValue: 8, description: 'Slow Blues / Doom / Shuffle' },
];

export const SUBDIVISIONS: {
  value: Subdivision;
  label: string;
  symbol: string;
  shortDesc: string;
}[] = [
  { value: 1, label: 'Semínima', symbol: '♩ (1x)', shortDesc: '1 nota por tempo' },
  { value: 2, label: 'Colcheia', symbol: '♫ (2x)', shortDesc: '2 notas por tempo' },
  { value: 3, label: 'Tercina', symbol: '🎶³ (3x)', shortDesc: '3 notas por tempo' },
  { value: 4, label: 'Semicolcheia', symbol: '♬ (4x)', shortDesc: '4 notas por tempo' },
  { value: 6, label: 'Sextina', symbol: '♬⁶ (6x)', shortDesc: '6 notas por tempo' },
];

export const DEFAULT_METRONOME_SETTINGS: MetronomeSettings = {
  bpm: 120,
  timeSignature: '4/4',
  subdivision: 1,
  soundPreset: 'woodblock',
  volume: 0.8,
  beatAccents: ['accent', 'normal', 'normal', 'normal'],
  speedTrainerEnabled: false,
  speedTrainerStepBpm: 2,
  speedTrainerBarsInterval: 4,
  speedTrainerTargetBpm: 160,
};

export const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: 'ex-sample-1',
    name: 'Arpejos Tríades em 3 e 5 Cordas (Sweep Picking)',
    category: 'Sweep Picking',
    description:
      'Praticar formas de Am, Dm e E7 em 3 e 5 cordas utilizando movimento contínuo da palheta (economy/sweep) e abafamento com a palma da mão direita + rolamento de dedo na mão esquerda.',
    durationMinutes: 15,
    targetBpm: 160,
    currentBpm: 132,
    bpmHistory: [
      { id: 'bh-1', bpm: 100, date: '2026-10-01T18:00:00.000Z', note: 'Limpando sincronia das mãos', durationMinutes: 15 },
      { id: 'bh-2', bpm: 112, date: '2026-10-05T19:30:00.000Z', note: 'Subdivisão em tercinas', durationMinutes: 15 },
      { id: 'bh-3', bpm: 124, date: '2026-10-10T20:00:00.000Z', note: 'Forma de 5 cordas mais limpa', durationMinutes: 15 },
      { id: 'bh-4', bpm: 132, date: '2026-10-15T21:00:00.000Z', note: 'Execução consistente sem ruído', durationMinutes: 15 },
    ],
    totalSessionsCompleted: 4,
    totalMinutesPracticed: 60,
    createdAt: '2026-10-01T18:00:00.000Z',
  },
  {
    id: 'ex-sample-2',
    name: 'Padrão Paul Gilbert (Alternate Picking Intenso)',
    category: 'Alternate Picking',
    description:
      'Frase clássica de 4 notas em sextinas trocando entre as cordas B e E (ex: casas 12-13-15 na B e 12 na E). Foco em palhetada alternada estrita (outside/inside picking).',
    durationMinutes: 10,
    targetBpm: 145,
    currentBpm: 125,
    bpmHistory: [
      { id: 'bh-5', bpm: 105, date: '2026-10-02T18:00:00.000Z', note: 'Foco em relaxar o pulso', durationMinutes: 10 },
      { id: 'bh-6', bpm: 115, date: '2026-10-08T18:00:00.000Z', note: 'Sextinas cravadas no click', durationMinutes: 10 },
      { id: 'bh-7', bpm: 125, date: '2026-10-14T18:00:00.000Z', note: 'Boa articulação', durationMinutes: 10 },
    ],
    totalSessionsCompleted: 3,
    totalMinutesPracticed: 30,
    createdAt: '2026-10-02T18:00:00.000Z',
  },
  {
    id: 'ex-sample-3',
    name: 'Downpicking de Precisão & Gallop (Estilo Hetfield)',
    category: 'Rítmica / Riff',
    description:
      'Colcheias contínuas apenas com palhetada para baixo (downstroke) em Palm Mute na corda E6, intercalando com galopes em semicolcheia nos finais de compasso.',
    durationMinutes: 10,
    targetBpm: 212,
    currentBpm: 196,
    bpmHistory: [
      { id: 'bh-8', bpm: 175, date: '2026-10-03T18:00:00.000Z', note: 'Resistência de 2 minutos', durationMinutes: 10 },
      { id: 'bh-9', bpm: 186, date: '2026-10-09T18:00:00.000Z', note: 'Ataque firme', durationMinutes: 10 },
      { id: 'bh-10', bpm: 196, date: '2026-10-15T18:00:00.000Z', note: 'Quase no tempo de Master of Puppets', durationMinutes: 10 },
    ],
    totalSessionsCompleted: 3,
    totalMinutesPracticed: 30,
    createdAt: '2026-10-03T18:00:00.000Z',
  },
  {
    id: 'ex-sample-4',
    name: 'Campo Harmônico Menor Melódico & Drop 2 Voicings',
    category: 'Harmonia',
    description:
      'Executar acordes tétrades em Drop 2 nas 4 primeiras cordas (D, G, B, E) através das 7 inversões do Campo Harmônico de Lá Menor Melódico.',
    durationMinutes: 15,
    targetBpm: 90,
    currentBpm: 76,
    bpmHistory: [
      { id: 'bh-11', bpm: 60, date: '2026-10-04T18:00:00.000Z', note: 'Memorizando os shapes', durationMinutes: 15 },
      { id: 'bh-12', bpm: 76, date: '2026-10-12T18:00:00.000Z', note: 'Transições fluidas', durationMinutes: 15 },
    ],
    totalSessionsCompleted: 2,
    totalMinutesPracticed: 30,
    createdAt: '2026-10-04T18:00:00.000Z',
  },
];

export const SAMPLE_REPERTOIRE: RepertoireSong[] = [
  {
    id: 'song-sample-1',
    title: 'Master Of Puppets',
    artist: 'Metallica',
    album: 'Master of Puppets',
    genre: 'Thrash Metal',
    status: 'Em Andamento',
    tuning: 'E Standard (E A D G B E)',
    originalBpm: 212,
    currentBpm: 196,
    tabUrl: 'https://www.songsterr.com/a/wsa/metallica-master-of-puppets-tab-s455118',
    backingTrackUrl: 'https://www.youtube.com/results?search_query=master+of+puppets+guitar+backing+track',
    videoUrl: '',
    notes: 'Riffs principais todos em downpicking. Compassos 5/8 na transição do verso precisam de atenção. Solo do Kirk quase na velocidade original.',
    createdAt: '2026-10-01T15:00:00.000Z',
    updatedAt: '2026-10-15T20:00:00.000Z',
  },
  {
    id: 'song-sample-2',
    title: 'Tornado of Souls',
    artist: 'Megadeth',
    album: 'Rust in Peace',
    genre: 'Thrash Metal',
    status: 'Aperfeiçoando / Solo',
    tuning: 'E Standard (E A D G B E)',
    originalBpm: 194,
    currentBpm: 175,
    tabUrl: 'https://www.songsterr.com/a/wsa/megadeth-tornado-of-souls-tab-s12947',
    backingTrackUrl: '',
    videoUrl: '',
    notes: 'Base 100% dominada. No solo do Marty Friedman, trabalhar os arpejos abertos com stretch e o trecho final em sextinas.',
    createdAt: '2026-10-02T15:00:00.000Z',
    updatedAt: '2026-10-14T20:00:00.000Z',
  },
  {
    id: 'song-sample-3',
    title: 'The Trooper',
    artist: 'Iron Maiden',
    album: 'Piece of Mind',
    genre: 'Heavy Metal',
    status: 'Concluído',
    tuning: 'E Standard (E A D G B E)',
    originalBpm: 160,
    currentBpm: 160,
    tabUrl: '',
    backingTrackUrl: '',
    videoUrl: '',
    notes: 'Música completa dominada, tanto a linha do Adrian Smith quanto do Dave Murray.',
    createdAt: '2026-09-20T15:00:00.000Z',
    updatedAt: '2026-10-05T20:00:00.000Z',
  },
  {
    id: 'song-sample-4',
    title: 'Comfortably Numb',
    artist: 'Pink Floyd',
    album: 'The Wall',
    genre: 'Classic / Prog Rock',
    status: 'Concluído',
    tuning: 'E Standard (E A D G B E)',
    originalBpm: 126,
    currentBpm: 126,
    tabUrl: '',
    backingTrackUrl: '',
    videoUrl: '',
    notes: '1º e 2º solos completos. Foco na afinação perfeita dos bends de 1 tom e 1 tom e meio.',
    createdAt: '2026-09-15T15:00:00.000Z',
    updatedAt: '2026-09-28T20:00:00.000Z',
  },
  {
    id: 'song-sample-5',
    title: 'Pull Me Under',
    artist: 'Dream Theater',
    album: 'Images and Words',
    genre: 'Progressive Metal',
    status: 'Quero Aprender',
    tuning: 'E Standard (E A D G B E)',
    originalBpm: 103,
    currentBpm: 80,
    tabUrl: '',
    backingTrackUrl: '',
    videoUrl: '',
    notes: 'Começar pelo arpejo limpo da introdução e o riff sincopado do pré-refrão.',
    createdAt: '2026-10-10T15:00:00.000Z',
    updatedAt: '2026-10-10T15:00:00.000Z',
  },
];
