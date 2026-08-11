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
    kind: "movable",
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
