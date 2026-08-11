import {
  type ChordId,
  CHORDS,
  getOpenVoicing,
  LOW_A_VOICINGS,
  LOW_E_VOICINGS,
  type PreferredChordVoicing,
} from "./chord-data";
import { STANDARD_TUNING } from "./music-data";
import { getFrettedPitchClass, normalizePitchClass } from "./music-theory";

export function getLowERootFret(rootPitchClass: number): number {
  return normalizePitchClass(rootPitchClass - STANDARD_TUNING[5].pitchClass);
}

export function getLowARootFret(rootPitchClass: number): number {
  return normalizePitchClass(rootPitchClass - 9);
}

export function getChordPitchClasses(root: number, chordId: ChordId): number[] {
  return CHORDS[chordId].intervals.map((interval) =>
    normalizePitchClass(root + interval),
  );
}

function transposeVoicing(
  rootFret: number,
  name: string,
  voicing: (typeof LOW_E_VOICINGS)[ChordId],
): PreferredChordVoicing {
  return {
    kind: voicing.barre ? "barre" : "movable",
    name,
    rootFret,
    strings: voicing.strings.map((string) => ({
      fret: string.offset === null ? null : rootFret + string.offset,
      finger: string.finger,
    })),
    barre: voicing.barre
      ? {
          fret: rootFret + voicing.barre.offset,
          fromString: voicing.barre.fromString,
          toString: voicing.barre.toString,
        }
      : undefined,
  };
}

export type ChordVoicingOption = {
  key: string;
  category: "Open" | "Barre" | "Movable" | "Inversion";
  voicing: PreferredChordVoicing;
};

function movableVoicingOptions(
  root: number,
  chordId: ChordId,
): ChordVoicingOption[] {
  const shapes = [
    {
      key: "low-a",
      name: "Low-A root shape",
      rootFret: getLowARootFret(root),
      source: LOW_A_VOICINGS[chordId],
    },
    {
      key: "low-e",
      name: "Low-E root shape",
      rootFret: getLowERootFret(root),
      source: LOW_E_VOICINGS[chordId],
    },
  ];

  return shapes
    .sort((first, second) => first.rootFret - second.rootFret)
    .map(({ key, name, rootFret, source }) => {
      const voicing = transposeVoicing(rootFret, name, source);
      return {
        key,
        category: voicing.kind === "barre" ? "Barre" : "Movable",
        voicing,
      };
    });
}

const LOW_TO_HIGH_OPEN_MIDI = [40, 45, 50, 55, 59, 64] as const;

function inversionVoicing(
  root: number,
  chordId: ChordId,
  inversionIndex: number,
): PreferredChordVoicing {
  const chord = CHORDS[chordId];
  const rotatedIntervals = Array.from({ length: 4 }, (_, voiceIndex) => {
    const position = inversionIndex + voiceIndex;
    const interval = chord.intervals[position % chord.intervals.length];
    return interval + 12 * Math.floor(position / chord.intervals.length);
  });
  let previousPitch = Number.NEGATIVE_INFINITY;
  const frets = LOW_TO_HIGH_OPEN_MIDI.slice(2).map((openPitch, index) => {
    const targetClass = normalizePitchClass(root + rotatedIntervals[index]);
    let pitch = openPitch + normalizePitchClass(targetClass - openPitch);
    while (pitch <= previousPitch) pitch += 12;
    previousPitch = pitch;
    return pitch - openPitch;
  });
  const distinctFrets = [...new Set(frets.filter((fret) => fret > 0))].sort(
    (first, second) => first - second,
  );
  const fingers = frets.map((fret) =>
    fret === 0
      ? null
      : ((Math.min(distinctFrets.indexOf(fret) + 1, 4) || 1) as 1 | 2 | 3 | 4),
  );
  const ordinal = [
    "Root position",
    "First inversion",
    "Second inversion",
    "Third inversion",
  ];

  return {
    kind: "inversion",
    name: ordinal[inversionIndex] ?? `Inversion ${inversionIndex}`,
    strings: [
      { fret: null, finger: null },
      { fret: null, finger: null },
      ...frets.map((fret, index) => ({ fret, finger: fingers[index] })),
    ],
  };
}

export function getChordVoicingOptions(
  root: number,
  chordId: ChordId,
): ChordVoicingOption[] {
  const openVoicing = getOpenVoicing(root, chordId);
  const movable = movableVoicingOptions(root, chordId);
  const inversions = CHORDS[chordId].intervals.slice(1).map((_, index) => ({
    key: `inversion-${index + 1}`,
    category: "Inversion" as const,
    voicing: inversionVoicing(root, chordId, index + 1),
  }));
  const options = [
    ...(openVoicing
      ? [{ key: "open", category: "Open" as const, voicing: openVoicing }]
      : []),
    ...movable,
    ...inversions,
  ];
  const preferred = getPreferredVoicing(root, chordId);
  const preferredIndex = options.findIndex(
    (option) =>
      option.voicing.name === preferred.name &&
      option.voicing.rootFret === preferred.rootFret,
  );
  return preferredIndex <= 0
    ? options
    : [options[preferredIndex], ...options.toSpliced(preferredIndex, 1)];
}

export function getChordVoicingOption(
  root: number,
  chordId: ChordId,
  key?: string,
): ChordVoicingOption {
  const options = getChordVoicingOptions(root, chordId);
  return options.find((option) => option.key === key) ?? options[0];
}

function getLowestMovableVoicing(
  root: number,
  chordId: ChordId,
): PreferredChordVoicing {
  const lowERootFret = getLowERootFret(root);
  const lowARootFret = getLowARootFret(root);
  return lowARootFret < lowERootFret
    ? transposeVoicing(
        lowARootFret,
        "Low-A root shape",
        LOW_A_VOICINGS[chordId],
      )
    : transposeVoicing(
        lowERootFret,
        "Low-E root shape",
        LOW_E_VOICINGS[chordId],
      );
}

export function getPreferredVoicing(
  root: number,
  chordId: ChordId,
): PreferredChordVoicing {
  return (
    getOpenVoicing(root, chordId) ?? getLowestMovableVoicing(root, chordId)
  );
}

export function getVoicingPitchClasses(
  root: number,
  chordId: ChordId,
  voicing = getPreferredVoicing(root, chordId),
) {
  const lowToHighTuning = [...STANDARD_TUNING].reverse();
  return voicing.strings.map((string, index) =>
    string.fret === null
      ? null
      : getFrettedPitchClass(lowToHighTuning[index].pitchClass, string.fret),
  );
}
