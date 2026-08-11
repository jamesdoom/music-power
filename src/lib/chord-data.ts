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

export type PreferredChordVoicing = {
  kind: "open" | "movable";
  name: string;
  rootFret?: number;
  strings: readonly { fret: number | null; finger: 1 | 2 | 3 | 4 | null }[];
  barre?: { fret: number; fromString: number; toString: number };
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

// Low A to high E, with the low E muted. These compact A-string-root shapes
// let the selector choose a position nearer the nut than an E-shape barre.
export const LOW_A_VOICINGS: Record<ChordId, ChordVoicing> = {
  major: aShape([0, 2, 2, 2, 0], [1, 2, 3, 4, 1]),
  minor: aShape([0, 2, 2, 1, 0], [1, 3, 4, 2, 1]),
  dominant7: aShape([0, 2, 0, 2, 0], [1, 3, 1, 4, 1]),
  major7: aShape([0, 2, 1, 2, 0], [1, 4, 2, 3, 1]),
  minor7: aShape([0, 2, 0, 1, 0], [1, 3, 1, 2, 1]),
  diminished: {
    strings: [
      { offset: null, finger: null },
      { offset: 0, finger: 1 },
      { offset: 1, finger: 2 },
      { offset: 2, finger: 4 },
      { offset: 1, finger: 3 },
      { offset: null, finger: null },
    ],
  },
  augmented: aShape([0, 3, 2, 2, 1], [1, 4, 2, 3, 1]),
  suspended2: aShape([0, 2, 2, 0, 0], [1, 3, 4, 1, 1]),
  suspended4: aShape([0, 2, 2, 3, 0], [1, 2, 3, 4, 1]),
};

function aShape(
  offsets: readonly number[],
  fingers: readonly (1 | 2 | 3 | 4)[],
): ChordVoicing {
  return {
    strings: [
      { offset: null, finger: null },
      ...offsets.map((offset, index) => ({
        offset,
        finger: fingers[index],
      })),
    ],
    barre: { offset: 0, fromString: 5, toString: 1 },
  };
}

const OPEN_VOICINGS: Record<string, PreferredChordVoicing> = {
  "0:major": open("Open C", [null, 3, 2, 0, 1, 0], [null, 3, 2, null, 1, null]),
  "2:major": open(
    "Open D",
    [null, null, 0, 2, 3, 2],
    [null, null, null, 1, 3, 2],
  ),
  "4:major": open("Open E", [0, 2, 2, 1, 0, 0], [null, 2, 3, 1, null, null]),
  "7:major": open("Open G", [3, 2, 0, 0, 0, 3], [2, 1, null, null, null, 3]),
  "9:major": open("Open A", [null, 0, 2, 2, 2, 0], [null, null, 1, 2, 3, null]),

  "2:minor": open(
    "Open D minor",
    [null, null, 0, 2, 3, 1],
    [null, null, null, 2, 3, 1],
  ),
  "4:minor": open(
    "Open E minor",
    [0, 2, 2, 0, 0, 0],
    [null, 2, 3, null, null, null],
  ),
  "9:minor": open(
    "Open A minor",
    [null, 0, 2, 2, 1, 0],
    [null, null, 2, 3, 1, null],
  ),

  "0:dominant7": open(
    "Open C7",
    [null, 3, 2, 3, 1, 0],
    [null, 3, 2, 4, 1, null],
  ),
  "2:dominant7": open(
    "Open D7",
    [null, null, 0, 2, 1, 2],
    [null, null, null, 2, 1, 3],
  ),
  "4:dominant7": open(
    "Open E7",
    [0, 2, 0, 1, 0, 0],
    [null, 2, null, 1, null, null],
  ),
  "7:dominant7": open(
    "Open G7",
    [3, 2, 0, 0, 0, 1],
    [3, 2, null, null, null, 1],
  ),
  "9:dominant7": open(
    "Open A7",
    [null, 0, 2, 0, 2, 0],
    [null, null, 1, null, 2, null],
  ),
  "11:dominant7": open(
    "Open B7",
    [null, 2, 1, 2, 0, 2],
    [null, 2, 1, 3, null, 4],
  ),

  "0:major7": open(
    "Open Cmaj7",
    [null, 3, 2, 0, 0, 0],
    [null, 3, 2, null, null, null],
  ),
  "2:major7": open(
    "Open Dmaj7",
    [null, null, 0, 2, 2, 2],
    [null, null, null, 1, 1, 1],
  ),
  "4:major7": open(
    "Open Emaj7",
    [0, 2, 1, 1, 0, 0],
    [null, 3, 1, 2, null, null],
  ),
  "5:major7": open(
    "Open Fmaj7",
    [null, null, 3, 2, 1, 0],
    [null, null, 3, 2, 1, null],
  ),
  "7:major7": open(
    "Open Gmaj7",
    [3, 2, 0, 0, 0, 2],
    [3, 2, null, null, null, 1],
  ),
  "9:major7": open(
    "Open Amaj7",
    [null, 0, 2, 1, 2, 0],
    [null, null, 2, 1, 3, null],
  ),

  "2:minor7": open(
    "Open Dm7",
    [null, null, 0, 2, 1, 1],
    [null, null, null, 2, 1, 1],
  ),
  "4:minor7": open(
    "Open Em7",
    [0, 2, 0, 0, 0, 0],
    [null, 2, null, null, null, null],
  ),
  "9:minor7": open(
    "Open Am7",
    [null, 0, 2, 0, 1, 0],
    [null, null, 2, null, 1, null],
  ),

  "0:augmented": open(
    "Open C augmented",
    [null, 3, 2, 1, 1, 0],
    [null, 4, 3, 1, 2, null],
  ),
  "4:augmented": open(
    "Open E augmented",
    [0, 3, 2, 1, 1, 0],
    [null, 4, 3, 1, 2, null],
  ),

  "2:suspended2": open(
    "Open Dsus2",
    [null, null, 0, 2, 3, 0],
    [null, null, null, 1, 3, null],
  ),
  "4:suspended2": open(
    "Open Esus2",
    [0, 2, 4, 4, 0, 0],
    [null, 1, 3, 4, null, null],
  ),
  "9:suspended2": open(
    "Open Asus2",
    [null, 0, 2, 2, 0, 0],
    [null, null, 1, 2, null, null],
  ),

  "2:suspended4": open(
    "Open Dsus4",
    [null, null, 0, 2, 3, 3],
    [null, null, null, 1, 3, 4],
  ),
  "4:suspended4": open(
    "Open Esus4",
    [0, 2, 2, 2, 0, 0],
    [null, 2, 3, 4, null, null],
  ),
  "9:suspended4": open(
    "Open Asus4",
    [null, 0, 2, 2, 3, 0],
    [null, null, 1, 2, 3, null],
  ),
};

function open(
  name: string,
  frets: readonly (number | null)[],
  fingers: readonly (1 | 2 | 3 | 4 | null)[],
): PreferredChordVoicing {
  return {
    kind: "open",
    name,
    strings: frets.map((fret, index) => ({ fret, finger: fingers[index] })),
  };
}

export function getOpenVoicing(
  root: number,
  chordId: ChordId,
): PreferredChordVoicing | undefined {
  return OPEN_VOICINGS[`${root}:${chordId}`];
}
