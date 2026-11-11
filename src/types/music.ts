export type ExerciseCategory =
  | 'Técnica'
  | 'Velocidade'
  | 'Sweep Picking'
  | 'Alternate Picking'
  | 'Legato'
  | 'Harmonia'
  | 'Improvisação'
  | 'Rítmica / Riff'
  | 'Aquecimento'
  | 'Outro';

export interface BpmRecord {
  id: string;
  bpm: number;
  date: string; // ISO date string
  note?: string;
  durationMinutes?: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  durationMinutes: number; // Tempo planejado do exercício em minutos
  targetBpm: number; // Meta de BPM
  currentBpm: number; // Último/Maior BPM registrado
  bpmHistory: BpmRecord[]; // Histórico para medir progressão
  totalSessionsCompleted: number;
  totalMinutesPracticed: number;
  createdAt: string;
}

export type SongStatus =
  | 'Quero Aprender'
  | 'Em Andamento'
  | 'Aperfeiçoando / Solo'
  | 'Concluído';

export interface RepertoireSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  status: SongStatus;
  tuning: string;
  originalBpm: number;
  currentBpm: number;
  tabUrl?: string;
  backingTrackUrl?: string;
  videoUrl?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type TimeSignature =
  | '4/4'
  | '3/4'
  | '2/4'
  | '6/8'
  | '5/4'
  | '7/8'
  | '9/8'
  | '12/8';

export type Subdivision = 1 | 2 | 3 | 4 | 6;

export type SoundPreset = 'digital' | 'woodblock' | 'beep' | 'drums';

export type BeatAccent = 'accent' | 'normal' | 'mute';

export interface MetronomeSettings {
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
  soundPreset: SoundPreset;
  volume: number; // 0 to 1
  beatAccents: BeatAccent[];
  speedTrainerEnabled: boolean;
  speedTrainerStepBpm: number;
  speedTrainerBarsInterval: number;
  speedTrainerTargetBpm: number;
}

export interface TheoryStudyNote {
  id: string;
  title: string;
  topic: 'Escalas Maiores' | 'Campo Harmônico' | 'Aplicação na Guitarra' | 'Outro';
  keySignature?: string;
  content: string;
  createdAt: string;
}
