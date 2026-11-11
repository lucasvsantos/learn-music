export type HarmonicFunction = 'Tônica' | 'Subdominante' | 'Dominante';

export interface HarmonicFieldDegree {
  degreeNumber: number; // 1 to 7
  romanTriad: string; // I, IIm, IIIm, IV, V, VIm, VIIm(b5)
  romanTetrad: string; // I7M, IIm7, IIIm7, IV7M, V7, VIm7, VIIm7(b5)
  triadName: string; // Ex: C, Dm, Em, F, G, Am, B°
  tetradName: string; // Ex: C7M, Dm7, Em7, F7M, G7, Am7, Bm7(b5)
  qualityTriad: 'Maior' | 'Menor' | 'Diminuto';
  qualityTetrad: 'Maior com 7ª Maior (7M)' | 'Menor com 7ª (m7)' | 'Dominante (7)' | 'Meio-Diminuto m7(b5)';
  harmonicFunction: HarmonicFunction;
  functionDescription: string;
  modeName: string; // Jônio, Dórico, Frígio, Lídio, Mixolídio, Eólio, Lócrio
  triadNotes: [string, string, string]; // 1 - 3 - 5
  tetradNotes: [string, string, string, string]; // 1 - 3 - 5 - 7
  triadMidi: number[]; // MIDI notes for audio playback
  tetradMidi: number[]; // MIDI notes for audio playback
}

export interface MajorKeyData {
  id: string; // 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'
  name: string; // 'Dó Maior (C)'
  shortName: string; // 'C'
  ptName: string; // 'Dó Maior'
  rootPitchClass: number; // 0 = C, 1 = C#/Db, ..., 11 = B
  baseMidi: number; // Root MIDI for scale playback (around C4 = 60 or E3 = 52)
  keySignatureText: string; // Ex: 'Natural (0 acidentes)', '1 Sustenido (#)', '1 Bemol (b)'
  accidentalsCount: number;
  accidentalType: 'none' | 'sharp' | 'flat';
  accidentalsList: string[];
  relativeMinor: string; // Ex: 'Am (Lá Menor)'
  scaleNotes: [string, string, string, string, string, string, string];
  scalePitchClasses: [number, number, number, number, number, number, number];
  guitarRootFret6thString: number; // Casa da tônica na 6ª corda (E)
  guitarRootFret5thString: number; // Casa da tônica na 5ª corda (A)
  characteristicTip: string;
  harmonicField: HarmonicFieldDegree[];
}

export const MAJOR_SCALE_INTERVALS = [
  { degree: '1º Grau', interval: 'Tônica (1J)', semitones: 0, stepAfter: 'Tom (T)', role: 'Nota Fundamental (Centro tonal)' },
  { degree: '2º Grau', interval: 'Segunda Maior (2M)', semitones: 2, stepAfter: 'Tom (T)', role: 'Nota de passagem / cor melódica (9ª)' },
  { degree: '3º Grau', interval: 'Terça Maior (3M)', semitones: 4, stepAfter: 'Semitom (S)', role: 'Define o caráter MAIOR e alegre da escala' },
  { degree: '4º Grau', interval: 'Quarta Justa (4J)', semitones: 5, stepAfter: 'Tom (T)', role: 'Tendência de resolução na 3ª maior' },
  { degree: '5º Grau', interval: 'Quinta Justa (5J)', semitones: 7, stepAfter: 'Tom (T)', role: 'Pilar de estabilidade harmônica (Power Chord)' },
  { degree: '6º Grau', interval: 'Sexta Maior (6M)', semitones: 9, stepAfter: 'Tom (T)', role: 'Gera a Relativa Menor (6º grau = Eólio)' },
  { degree: '7º Grau', interval: 'Sétima Maior (7M)', semitones: 11, stepAfter: 'Semitom (S)', role: 'Sensível (forte atração de meio-tom para a Tônica)' },
];

export const DEGREE_META: {
  degreeNumber: number;
  romanTriad: string;
  romanTetrad: string;
  triadSuffix: string;
  tetradSuffix: string;
  qualityTriad: 'Maior' | 'Menor' | 'Diminuto';
  qualityTetrad: 'Maior com 7ª Maior (7M)' | 'Menor com 7ª (m7)' | 'Dominante (7)' | 'Meio-Diminuto m7(b5)';
  harmonicFunction: HarmonicFunction;
  functionDescription: string;
  modeName: string;
  triadIntervals: [number, number, number];
  tetradIntervals: [number, number, number, number];
}[] = [
  {
    degreeNumber: 1,
    romanTriad: 'I',
    romanTetrad: 'I7M',
    triadSuffix: '',
    tetradSuffix: '7M',
    qualityTriad: 'Maior',
    qualityTetrad: 'Maior com 7ª Maior (7M)',
    harmonicFunction: 'Tônica',
    functionDescription: 'Centro tonal de repouso absoluto e resolução.',
    modeName: 'Jônio (Maior Natural)',
    triadIntervals: [0, 4, 7],
    tetradIntervals: [0, 4, 7, 11],
  },
  {
    degreeNumber: 2,
    romanTriad: 'IIm',
    romanTetrad: 'IIm7',
    triadSuffix: 'm',
    tetradSuffix: 'm7',
    qualityTriad: 'Menor',
    qualityTetrad: 'Menor com 7ª (m7)',
    harmonicFunction: 'Subdominante',
    functionDescription: 'Movimento suave; prepara perfeitamente o V7 na cadência II - V - I.',
    modeName: 'Dórico',
    triadIntervals: [0, 3, 7],
    tetradIntervals: [0, 3, 7, 10],
  },
  {
    degreeNumber: 3,
    romanTriad: 'IIIm',
    romanTetrad: 'IIIm7',
    triadSuffix: 'm',
    tetradSuffix: 'm7',
    qualityTriad: 'Menor',
    qualityTetrad: 'Menor com 7ª (m7)',
    harmonicFunction: 'Tônica',
    functionDescription: 'Tônica relativa/substituta; compartilha 3 notas com o acorde I7M.',
    modeName: 'Frígio',
    triadIntervals: [0, 3, 7],
    tetradIntervals: [0, 3, 7, 10],
  },
  {
    degreeNumber: 4,
    romanTriad: 'IV',
    romanTetrad: 'IV7M',
    triadSuffix: '',
    tetradSuffix: '7M',
    qualityTriad: 'Maior',
    qualityTetrad: 'Maior com 7ª Maior (7M)',
    harmonicFunction: 'Subdominante',
    functionDescription: 'Afastamento e abertura harmônica; base de refrões e cadências plagais (IV - I).',
    modeName: 'Lídio',
    triadIntervals: [0, 4, 7],
    tetradIntervals: [0, 4, 7, 11],
  },
  {
    degreeNumber: 5,
    romanTriad: 'V',
    romanTetrad: 'V7',
    triadSuffix: '',
    tetradSuffix: '7',
    qualityTriad: 'Maior',
    qualityTetrad: 'Dominante (7)',
    harmonicFunction: 'Dominante',
    functionDescription: 'Tensão máxima (possui o trítono entre a 3ª e a 7ª menor) que pede resolução no I.',
    modeName: 'Mixolídio',
    triadIntervals: [0, 4, 7],
    tetradIntervals: [0, 4, 7, 10],
  },
  {
    degreeNumber: 6,
    romanTriad: 'VIm',
    romanTetrad: 'VIm7',
    triadSuffix: 'm',
    tetradSuffix: 'm7',
    qualityTriad: 'Menor',
    qualityTetrad: 'Menor com 7ª (m7)',
    harmonicFunction: 'Tônica',
    functionDescription: 'Tônica Relativa Menor; sonoridade melancólica mantendo estabilidade.',
    modeName: 'Eólio (Menor Natural)',
    triadIntervals: [0, 3, 7],
    tetradIntervals: [0, 3, 7, 10],
  },
  {
    degreeNumber: 7,
    romanTriad: 'VII°',
    romanTetrad: 'VIIm7(b5)',
    triadSuffix: '°',
    tetradSuffix: 'm7(b5)',
    qualityTriad: 'Diminuto',
    qualityTetrad: 'Meio-Diminuto m7(b5)',
    harmonicFunction: 'Dominante',
    functionDescription: 'Acorde sensível instável (contém o trítono); funciona como V7 sem fundamental.',
    modeName: 'Lócrio',
    triadIntervals: [0, 3, 6],
    tetradIntervals: [0, 3, 6, 10],
  },
];

interface RawKeyConfig {
  id: string;
  shortName: string;
  ptName: string;
  rootPitchClass: number;
  baseMidi: number;
  keySignatureText: string;
  accidentalsCount: number;
  accidentalType: 'none' | 'sharp' | 'flat';
  accidentalsList: string[];
  relativeMinor: string;
  scaleNotes: [string, string, string, string, string, string, string];
  guitarRootFret6thString: number;
  guitarRootFret5thString: number;
  characteristicTip: string;
}

const RAW_KEYS: RawKeyConfig[] = [
  {
    id: 'C',
    shortName: 'C',
    ptName: 'Dó Maior',
    rootPitchClass: 0,
    baseMidi: 60,
    keySignatureText: 'Natural (0 acidentes)',
    accidentalsCount: 0,
    accidentalType: 'none',
    accidentalsList: [],
    relativeMinor: 'Am (Lá Menor)',
    scaleNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    guitarRootFret6thString: 8,
    guitarRootFret5thString: 3,
    characteristicTip:
      'Tom referência universal sem acidentes (# ou b). Na guitarra, a tônica fica na casa 3 da corda A (Shape de C/A) e na casa 8 da corda E (Shape de G/E).',
  },
  {
    id: 'G',
    shortName: 'G',
    ptName: 'Sol Maior',
    rootPitchClass: 7,
    baseMidi: 55,
    keySignatureText: '1 Sustenido (F#)',
    accidentalsCount: 1,
    accidentalType: 'sharp',
    accidentalsList: ['F#'],
    relativeMinor: 'Em (Mi Menor)',
    scaleNotes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    guitarRootFret6thString: 3,
    guitarRootFret5thString: 10,
    characteristicTip:
      'Um dos tons mais usados na guitarra Rock/Blues/Country porque aproveita todas as cordas soltas (E, A, D, G, B) e tem relativa menor em Mi Menor (Em).',
  },
  {
    id: 'D',
    shortName: 'D',
    ptName: 'Ré Maior',
    rootPitchClass: 2,
    baseMidi: 62,
    keySignatureText: '2 Sustenidos (F#, C#)',
    accidentalsCount: 2,
    accidentalType: 'sharp',
    accidentalsList: ['F#', 'C#'],
    relativeMinor: 'Bm (Si Menor)',
    scaleNotes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    guitarRootFret6thString: 10,
    guitarRootFret5thString: 5,
    characteristicTip:
      'Brilhante na guitarra acústica e elétrica; funciona perfeitamente com afinação Drop D (D A D G B E) para riffs pesados com bordão solto.',
  },
  {
    id: 'A',
    shortName: 'A',
    ptName: 'Lá Maior',
    rootPitchClass: 9,
    baseMidi: 57,
    keySignatureText: '3 Sustenidos (F#, C#, G#)',
    accidentalsCount: 3,
    accidentalType: 'sharp',
    accidentalsList: ['F#', 'C#', 'G#'],
    relativeMinor: 'F#m (Fá# Menor)',
    scaleNotes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    guitarRootFret6thString: 5,
    guitarRootFret5thString: 0,
    characteristicTip:
      'Clássico absoluto do Hard Rock (AC/DC, Van Halen). A tônica fica na casa 5 da 6ª corda ou na 5ª corda solta (A).',
  },
  {
    id: 'E',
    shortName: 'E',
    ptName: 'Mi Maior',
    rootPitchClass: 4,
    baseMidi: 52,
    keySignatureText: '4 Sustenidos (F#, C#, G#, D#)',
    accidentalsCount: 4,
    accidentalType: 'sharp',
    accidentalsList: ['F#', 'C#', 'G#', 'D#'],
    relativeMinor: 'C#m (Dó# Menor)',
    scaleNotes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    guitarRootFret6thString: 0,
    guitarRootFret5thString: 7,
    characteristicTip:
      'O tom nativo da guitarra em afinação padrão (6ª e 1ª cordas soltas são Mi). Dá o registro mais grave possível nos acordes abertos.',
  },
  {
    id: 'B',
    shortName: 'B',
    ptName: 'Si Maior',
    rootPitchClass: 11,
    baseMidi: 59,
    keySignatureText: '5 Sustenidos (F#, C#, G#, D#, A#)',
    accidentalsCount: 5,
    accidentalType: 'sharp',
    accidentalsList: ['F#', 'C#', 'G#', 'D#', 'A#'],
    relativeMinor: 'G#m (Sol# Menor)',
    scaleNotes: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
    guitarRootFret6thString: 7,
    guitarRootFret5thString: 2,
    characteristicTip:
      'Excelente para treinar pestanas e visualização no meio do braço (casa 7 da corda E) ou em guitarras de 7 cordas (bordão B solto).',
  },
  {
    id: 'F#',
    shortName: 'F#',
    ptName: 'Fá Sustenido Maior',
    rootPitchClass: 6,
    baseMidi: 54,
    keySignatureText: '6 Sustenidos (F#, C#, G#, D#, A#, E#)',
    accidentalsCount: 6,
    accidentalType: 'sharp',
    accidentalsList: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
    relativeMinor: 'D#m (Ré# Menor)',
    scaleNotes: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
    guitarRootFret6thString: 2,
    guitarRootFret5thString: 9,
    characteristicTip:
      'Enarmônico de Sol Bemol (Gb). Note que o 7º grau teórico é E# (enarmônico de F natural) para manter uma letra por grau.',
  },
  {
    id: 'Db',
    shortName: 'Db',
    ptName: 'Ré Bemol Maior',
    rootPitchClass: 1,
    baseMidi: 61,
    keySignatureText: '5 Bemóis (Bb, Eb, Ab, Db, Gb)',
    accidentalsCount: 5,
    accidentalType: 'flat',
    accidentalsList: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'],
    relativeMinor: 'Bbm (Si Bemol Menor)',
    scaleNotes: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
    guitarRootFret6thString: 9,
    guitarRootFret5thString: 4,
    characteristicTip:
      'Enarmônico de Dó# Maior (C#). Muito comum em músicas afinadas meio-tom abaixo (Eb) ou Drop C#.',
  },
  {
    id: 'Ab',
    shortName: 'Ab',
    ptName: 'Lá Bemol Maior',
    rootPitchClass: 8,
    baseMidi: 56,
    keySignatureText: '4 Bemóis (Bb, Eb, Ab, Db)',
    accidentalsCount: 4,
    accidentalType: 'flat',
    accidentalsList: ['Bb', 'Eb', 'Ab', 'Db'],
    relativeMinor: 'Fm (Fá Menor)',
    scaleNotes: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    guitarRootFret6thString: 4,
    guitarRootFret5thString: 11,
    characteristicTip:
      'Sua relativa menor é Fá Menor (Fm), muito usada em Metal Progressivo, Neo-Classical e Jazz/Fusion.',
  },
  {
    id: 'Eb',
    shortName: 'Eb',
    ptName: 'Mi Bemol Maior',
    rootPitchClass: 3,
    baseMidi: 63,
    keySignatureText: '3 Bemóis (Bb, Eb, Ab)',
    accidentalsCount: 3,
    accidentalType: 'flat',
    accidentalsList: ['Bb', 'Eb', 'Ab'],
    relativeMinor: 'Cm (Dó Menor)',
    scaleNotes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    guitarRootFret6thString: 11,
    guitarRootFret5thString: 6,
    characteristicTip:
      'Tom clássico de Jimi Hendrix, Stevie Ray Vaughan, Guns N’ Roses e Yngwie Malmsteen (quando afinado em Eb Standard).',
  },
  {
    id: 'Bb',
    shortName: 'Bb',
    ptName: 'Si Bemol Maior',
    rootPitchClass: 10,
    baseMidi: 58,
    keySignatureText: '2 Bemóis (Bb, Eb)',
    accidentalsCount: 2,
    accidentalType: 'flat',
    accidentalsList: ['Bb', 'Eb'],
    relativeMinor: 'Gm (Sol Menor)',
    scaleNotes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    guitarRootFret6thString: 6,
    guitarRootFret5thString: 1,
    characteristicTip:
      'Relativa menor em Sol Menor (Gm) — um dos tons favoritos de David Gilmour (Pink Floyd) e do Neoclássico.',
  },
  {
    id: 'F',
    shortName: 'F',
    ptName: 'Fá Maior',
    rootPitchClass: 5,
    baseMidi: 53,
    keySignatureText: '1 Bemol (Bb)',
    accidentalsCount: 1,
    accidentalType: 'flat',
    accidentalsList: ['Bb'],
    relativeMinor: 'Dm (Ré Menor)',
    scaleNotes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    guitarRootFret6thString: 1,
    guitarRootFret5thString: 8,
    characteristicTip:
      'Possui apenas 1 bemol (Bb). Sua relativa menor é Ré Menor (Dm), muito presente em Santana, Iron Maiden e Metallica.',
  },
];

const MAJOR_SEMITONE_STEPS = [0, 2, 4, 5, 7, 9, 11];

export const ALL_MAJOR_KEYS: MajorKeyData[] = RAW_KEYS.map((raw) => {
  const scalePitchClasses = MAJOR_SEMITONE_STEPS.map(
    (s) => (raw.rootPitchClass + s) % 12
  ) as [number, number, number, number, number, number, number];

  const harmonicField: HarmonicFieldDegree[] = DEGREE_META.map((meta, idx) => {
    const rootNote = raw.scaleNotes[idx];
    const thirdNote = raw.scaleNotes[(idx + 2) % 7];
    const fifthNote = raw.scaleNotes[(idx + 4) % 7];
    const seventhNote = raw.scaleNotes[(idx + 6) % 7];

    const degreeRootMidi = raw.baseMidi + MAJOR_SEMITONE_STEPS[idx];
    const triadMidi = meta.triadIntervals.map((intv) => degreeRootMidi + intv);
    const tetradMidi = meta.tetradIntervals.map((intv) => degreeRootMidi + intv);

    return {
      degreeNumber: meta.degreeNumber,
      romanTriad: meta.romanTriad,
      romanTetrad: meta.romanTetrad,
      triadName: `${rootNote}${meta.triadSuffix}`,
      tetradName: `${rootNote}${meta.tetradSuffix}`,
      qualityTriad: meta.qualityTriad,
      qualityTetrad: meta.qualityTetrad,
      harmonicFunction: meta.harmonicFunction,
      functionDescription: meta.functionDescription,
      modeName: meta.modeName,
      triadNotes: [rootNote, thirdNote, fifthNote],
      tetradNotes: [rootNote, thirdNote, fifthNote, seventhNote],
      triadMidi,
      tetradMidi,
    };
  });

  return {
    ...raw,
    name: `${raw.ptName} (${raw.shortName})`,
    scalePitchClasses,
    harmonicField,
  };
});

export interface ClassicProgression {
  id: string;
  name: string;
  style: string;
  degrees: number[]; // 1-indexed degrees, e.g. [1, 5, 6, 4]
  romanFormula: string;
  description: string;
}

export const CLASSIC_PROGRESSIONS: ClassicProgression[] = [
  {
    id: 'prog-1',
    name: 'Cadência Pop / Rock Universal',
    style: 'Rock / Pop / Ballads',
    degrees: [1, 5, 6, 4],
    romanFormula: 'I  →  V  →  VIm  →  IV',
    description:
      'Mistura estabilidade (I), tensão (V), emoção da relativa menor (VIm) e abertura (IV). Usada em centenas de clássicos.',
  },
  {
    id: 'prog-2',
    name: 'Cadência Jazz / Fusion (II - V - I)',
    style: 'Jazz / Bossa / Prog / Fusion',
    degrees: [2, 5, 1, 1],
    romanFormula: 'IIm7  →  V7  →  I7M',
    description:
      'O movimento harmônico mais importante da música ocidental: Subdominante (IIm7) preparando Dominante (V7) e resolvendo na Tônica (I7M).',
  },
  {
    id: 'prog-3',
    name: 'Turnaround Clássico (I - VIm - IIm - V)',
    style: 'Blues / Jazz / Classic Rock',
    degrees: [1, 6, 2, 5],
    romanFormula: 'I7M  →  VIm7  →  IIm7  →  V7',
    description:
      'Ciclo de quartas a partir do 6º grau que gera movimento contínuo perfeito para improvisação.',
  },
  {
    id: 'prog-4',
    name: 'Cadência Épica Começando na Relativa Menor',
    style: 'Hard Rock / Heavy Metal / Emocional',
    degrees: [6, 4, 1, 5],
    romanFormula: 'VIm  →  IV  →  I  →  V',
    description:
      'Inicia no 6º grau menor dando um clima mais sério/épico antes de abrir para os acordes maiores IV, I e V.',
  },
  {
    id: 'prog-5',
    name: 'Vamp Lídio / Modal (I - II)',
    style: 'Guitar Instrumental (Satriani / Vai)',
    degrees: [1, 4, 5, 4],
    romanFormula: 'I  →  IV  →  V  →  IV',
    description:
      'Clássica base de Três Acordes Maiores do Rock, Blues e Guitarra Instrumental.',
  },
];

// Standard 6-string guitar tuning from 1st string (high E) to 6th string (low E)
export const GUITAR_STRINGS_STANDARD = [
  { stringNumber: 1, label: '1ª (e)', openPitchClass: 4, openMidi: 64 }, // E4
  { stringNumber: 2, label: '2ª (B)', openPitchClass: 11, openMidi: 59 }, // B3
  { stringNumber: 3, label: '3ª (G)', openPitchClass: 7, openMidi: 55 }, // G3
  { stringNumber: 4, label: '4ª (D)', openPitchClass: 2, openMidi: 50 }, // D3
  { stringNumber: 5, label: '5ª (A)', openPitchClass: 9, openMidi: 45 }, // A2
  { stringNumber: 6, label: '6ª (E)', openPitchClass: 4, openMidi: 40 }, // E2
];
