export type ChordDefinition = {
  name: string;
  symbol: string;
  intervals: readonly number[];
  degrees: readonly string[];
};

export const CHORDS = {
  major: {
    name: "Major",
    symbol: "",
    intervals: [0, 4, 7],
    degrees: ["1", "3", "5"],
  },
  minor: {
    name: "Minor",
    symbol: "m",
    intervals: [0, 3, 7],
    degrees: ["1", "♭3", "5"],
  },
  dominant7: {
    name: "Dominant 7",
    symbol: "7",
    intervals: [0, 4, 7, 10],
    degrees: ["1", "3", "5", "♭7"],
  },
  major7: {
    name: "Major 7",
    symbol: "maj7",
    intervals: [0, 4, 7, 11],
    degrees: ["1", "3", "5", "7"],
  },
  minor7: {
    name: "Minor 7",
    symbol: "m7",
    intervals: [0, 3, 7, 10],
    degrees: ["1", "♭3", "5", "♭7"],
  },
  diminished: {
    name: "Diminished",
    symbol: "dim",
    intervals: [0, 3, 6],
    degrees: ["1", "♭3", "♭5"],
  },
  augmented: {
    name: "Augmented",
    symbol: "aug",
    intervals: [0, 4, 8],
    degrees: ["1", "3", "♯5"],
  },
  suspended2: {
    name: "Suspended 2",
    symbol: "sus2",
    intervals: [0, 2, 7],
    degrees: ["1", "2", "5"],
  },
  suspended4: {
    name: "Suspended 4",
    symbol: "sus4",
    intervals: [0, 5, 7],
    degrees: ["1", "4", "5"],
  },
} as const satisfies Record<string, ChordDefinition>;

export type ChordId = keyof typeof CHORDS;
export type ChordString = {
  offset: number | null;
  finger: 1 | 2 | 3 | 4 | null;
};

export type ChordVoicing = {
  strings: readonly ChordString[];
  barre?: { offset: number; fromString: number; toString: number };
};

// Low E to high E. Offsets are relative to the low-E root fret, making each
// shape transposable while keeping its fingering relationships intact.
export const LOW_E_VOICINGS: Record<ChordId, ChordVoicing> = {
  major: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 2, finger: 3 },
      { offset: 2, finger: 4 },
      { offset: 1, finger: 2 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
    ],
    barre: { offset: 0, fromString: 6, toString: 1 },
  },
  minor: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 2, finger: 3 },
      { offset: 2, finger: 4 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
    ],
    barre: { offset: 0, fromString: 6, toString: 1 },
  },
  dominant7: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 2, finger: 3 },
      { offset: 0, finger: 1 },
      { offset: 1, finger: 2 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
    ],
    barre: { offset: 0, fromString: 6, toString: 1 },
  },
  major7: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 2, finger: 4 },
      { offset: 1, finger: 2 },
      { offset: 1, finger: 3 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
    ],
    barre: { offset: 0, fromString: 6, toString: 1 },
  },
  minor7: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 2, finger: 3 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
    ],
    barre: { offset: 0, fromString: 6, toString: 1 },
  },
  diminished: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 1, finger: 2 },
      { offset: 2, finger: 3 },
      { offset: 3, finger: 4 },
      { offset: null, finger: null },
      { offset: 3, finger: 4 },
    ],
  },
  augmented: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 3, finger: 4 },
      { offset: 2, finger: 3 },
      { offset: 1, finger: 2 },
      { offset: 1, finger: 2 },
      { offset: 0, finger: 1 },
    ],
  },
  suspended2: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 2, finger: 2 },
      { offset: 4, finger: 4 },
      { offset: 4, finger: 4 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
    ],
    barre: { offset: 0, fromString: 6, toString: 1 },
  },
  suspended4: {
    strings: [
      { offset: 0, finger: 1 },
      { offset: 2, finger: 3 },
      { offset: 2, finger: 3 },
      { offset: 2, finger: 3 },
      { offset: 0, finger: 1 },
      { offset: 0, finger: 1 },
    ],
    barre: { offset: 0, fromString: 6, toString: 1 },
  },
};
