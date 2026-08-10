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

export type ScaleDefinition = {
  name: string;
  intervals: readonly number[];
  degrees: readonly string[];
};

export const SCALES = {
  major: {
    name: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
  },
  naturalMinor: {
    name: "Natural minor",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"],
  },
  majorPentatonic: {
    name: "Major pentatonic",
    intervals: [0, 2, 4, 7, 9],
    degrees: ["1", "2", "3", "5", "6"],
  },
  minorPentatonic: {
    name: "Minor pentatonic",
    intervals: [0, 3, 5, 7, 10],
    degrees: ["1", "♭3", "4", "5", "♭7"],
  },
  blues: {
    name: "Blues",
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ["1", "♭3", "4", "♭5", "5", "♭7"],
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

export const FRET_COUNT = 15;
