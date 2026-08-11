export const CHROMATIC_SHARPS = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
] as const;

export const CHROMATIC_FLATS = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
] as const;

export type AccidentalPreference = "sharps" | "flats";

export const SCALE_GROUP_LABELS = {
  majorModes: "Major scale modes",
  melodicMinorModes: "Melodic minor modes",
  symmetric: "Symmetric scales",
  pentatonic: "Pentatonic scales",
  blues: "Blues scales",
  bebop: "Bebop scales",
  harmonic: "Harmonic scales",
} as const;

export type ScaleGroupId = keyof typeof SCALE_GROUP_LABELS;

export type ScaleDefinition = {
  name: string;
  slug: string;
  group: ScaleGroupId;
  intervals: readonly number[];
  degrees: readonly string[];
};

export const SCALES = {
  major: {
    name: "Major",
    slug: "major",
    group: "majorModes",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
  },
  dorian: {
    name: "Dorian",
    slug: "dorian",
    group: "majorModes",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ["1", "2", "♭3", "4", "5", "6", "♭7"],
  },
  phrygian: {
    name: "Phrygian",
    slug: "phrygian",
    group: "majorModes",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degrees: ["1", "♭2", "♭3", "4", "5", "♭6", "♭7"],
  },
  lydian: {
    name: "Lydian",
    slug: "lydian",
    group: "majorModes",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ["1", "2", "3", "♯4", "5", "6", "7"],
  },
  mixolydian: {
    name: "Mixolydian",
    slug: "mixolydian",
    group: "majorModes",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ["1", "2", "3", "4", "5", "6", "♭7"],
  },
  naturalMinor: {
    name: "Aeolian (Natural minor)",
    slug: "natural-minor",
    group: "majorModes",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"],
  },
  locrian: {
    name: "Locrian",
    slug: "locrian",
    group: "majorModes",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ["1", "♭2", "♭3", "4", "♭5", "♭6", "♭7"],
  },
  melodicMinor: {
    name: "Melodic minor",
    slug: "melodic-minor",
    group: "melodicMinorModes",
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: ["1", "2", "♭3", "4", "5", "6", "7"],
  },
  dorianFlat2: {
    name: "Dorian ♭2 (Phrygian ♯6)",
    slug: "dorian-flat-2",
    group: "melodicMinorModes",
    intervals: [0, 1, 3, 5, 7, 9, 10],
    degrees: ["1", "♭2", "♭3", "4", "5", "6", "♭7"],
  },
  lydianAugmented: {
    name: "Lydian augmented",
    slug: "lydian-augmented",
    group: "melodicMinorModes",
    intervals: [0, 2, 4, 6, 8, 9, 11],
    degrees: ["1", "2", "3", "♯4", "♯5", "6", "7"],
  },
  lydianDominant: {
    name: "Lydian dominant (Mixolydian ♯4)",
    slug: "lydian-dominant",
    group: "melodicMinorModes",
    intervals: [0, 2, 4, 6, 7, 9, 10],
    degrees: ["1", "2", "3", "♯4", "5", "6", "♭7"],
  },
  mixolydianFlat6: {
    name: "Mixolydian ♭6 (fifth mode)",
    slug: "mixolydian-flat-6",
    group: "melodicMinorModes",
    intervals: [0, 2, 4, 5, 7, 8, 10],
    degrees: ["1", "2", "3", "4", "5", "♭6", "♭7"],
  },
  locrianSharp2: {
    name: "Locrian ♯2 (Aeolian ♭5)",
    slug: "locrian-sharp-2",
    group: "melodicMinorModes",
    intervals: [0, 2, 3, 5, 6, 8, 10],
    degrees: ["1", "2", "♭3", "4", "♭5", "♭6", "♭7"],
  },
  altered: {
    name: "Altered (diminished whole-tone)",
    slug: "altered",
    group: "melodicMinorModes",
    intervals: [0, 1, 3, 4, 6, 8, 10],
    degrees: ["1", "♭2", "♯2", "3", "♭5", "♯5", "♭7"],
  },
  wholeTone: {
    name: "Whole tone",
    slug: "whole-tone",
    group: "symmetric",
    intervals: [0, 2, 4, 6, 8, 10],
    degrees: ["1", "2", "3", "♯4", "♯5", "♭7"],
  },
  diminishedWholeHalf: {
    name: "Diminished whole-half",
    slug: "diminished-whole-half",
    group: "symmetric",
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    degrees: ["1", "2", "♭3", "4", "♭5", "♭6", "6", "7"],
  },
  diminishedHalfWhole: {
    name: "Diminished half-whole",
    slug: "diminished-half-whole",
    group: "symmetric",
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    degrees: ["1", "♭2", "♯2", "3", "♯4", "5", "6", "♭7"],
  },
  majorPentatonic: {
    name: "Major pentatonic",
    slug: "major-pentatonic",
    group: "pentatonic",
    intervals: [0, 2, 4, 7, 9],
    degrees: ["1", "2", "3", "5", "6"],
  },
  minorPentatonic: {
    name: "Minor pentatonic",
    slug: "minor-pentatonic",
    group: "pentatonic",
    intervals: [0, 3, 5, 7, 10],
    degrees: ["1", "♭3", "4", "5", "♭7"],
  },
  suspendedPentatonic: {
    name: "Suspended pentatonic",
    slug: "suspended-pentatonic",
    group: "pentatonic",
    intervals: [0, 2, 5, 7, 10],
    degrees: ["1", "2", "4", "5", "♭7"],
  },
  dominantPentatonic: {
    name: "Dominant pentatonic (Mixolydian pentatonic)",
    slug: "dominant-pentatonic",
    group: "pentatonic",
    intervals: [0, 2, 4, 7, 10],
    degrees: ["1", "2", "3", "5", "♭7"],
  },
  inSen: {
    name: 'Traditional Japanese "in-sen"',
    slug: "in-sen",
    group: "pentatonic",
    intervals: [0, 1, 5, 7, 10],
    degrees: ["1", "♭2", "4", "5", "♭7"],
  },
  blues: {
    name: "Blues",
    slug: "blues",
    group: "blues",
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ["1", "♭3", "4", "♭5", "5", "♭7"],
  },
  bebopMajor: {
    name: "Bebop major",
    slug: "bebop-major",
    group: "bebop",
    intervals: [0, 2, 4, 5, 7, 8, 9, 11],
    degrees: ["1", "2", "3", "4", "5", "♭6", "6", "7"],
  },
  bebopMinor: {
    name: "Bebop minor (bebop Dorian)",
    slug: "bebop-minor",
    group: "bebop",
    intervals: [0, 2, 3, 4, 5, 7, 9, 10],
    degrees: ["1", "2", "♭3", "3", "4", "5", "6", "♭7"],
  },
  bebopDominant: {
    name: "Bebop dominant",
    slug: "bebop-dominant",
    group: "bebop",
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
    degrees: ["1", "2", "3", "4", "5", "6", "♭7", "7"],
  },
  bebopMelodicMinor: {
    name: "Bebop melodic minor",
    slug: "bebop-melodic-minor",
    group: "bebop",
    intervals: [0, 2, 3, 5, 7, 8, 9, 11],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "6", "7"],
  },
  harmonicMajor: {
    name: "Harmonic major",
    slug: "harmonic-major",
    group: "harmonic",
    intervals: [0, 2, 4, 5, 7, 8, 11],
    degrees: ["1", "2", "3", "4", "5", "♭6", "7"],
  },
  harmonicMinor: {
    name: "Harmonic minor",
    slug: "harmonic-minor",
    group: "harmonic",
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "7"],
  },
  doubleHarmonicMajor: {
    name: "Double harmonic major (Arabic/Byzantine)",
    slug: "double-harmonic-major",
    group: "harmonic",
    intervals: [0, 1, 4, 5, 7, 8, 11],
    degrees: ["1", "♭2", "3", "4", "5", "♭6", "7"],
  },
} as const satisfies Record<string, ScaleDefinition>;

export type ScaleId = keyof typeof SCALES;

export type GuitarString = {
  name: string;
  pitchClass: number;
  gauge: number;
};

// Ordered as displayed on a standard fretboard diagram: high E to low E.
export const STANDARD_TUNING: readonly GuitarString[] = [
  { name: "E", pitchClass: 4, gauge: 1 },
  { name: "B", pitchClass: 11, gauge: 2 },
  { name: "G", pitchClass: 7, gauge: 3 },
  { name: "D", pitchClass: 2, gauge: 4 },
  { name: "A", pitchClass: 9, gauge: 5 },
  { name: "E", pitchClass: 4, gauge: 6 },
];

export const FRET_COUNT = 22;
