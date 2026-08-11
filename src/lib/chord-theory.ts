import {
  type ChordId,
  CHORDS,
  getOpenVoicing,
  LOW_E_VOICINGS,
  type PreferredChordVoicing,
} from "./chord-data";
import { STANDARD_TUNING } from "./music-data";
import { getFrettedPitchClass, normalizePitchClass } from "./music-theory";

export function getLowERootFret(rootPitchClass: number): number {
  return normalizePitchClass(rootPitchClass - STANDARD_TUNING[5].pitchClass);
}

export function getChordPitchClasses(root: number, chordId: ChordId): number[] {
  return CHORDS[chordId].intervals.map((interval) =>
    normalizePitchClass(root + interval),
  );
}

function getMovableVoicing(
  root: number,
  chordId: ChordId,
): PreferredChordVoicing {
  const rootFret = getLowERootFret(root);
  const voicing = LOW_E_VOICINGS[chordId];
  return {
    kind: "movable",
    name: "Low-E root shape",
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

export function getPreferredVoicing(
  root: number,
  chordId: ChordId,
): PreferredChordVoicing {
  return getOpenVoicing(root, chordId) ?? getMovableVoicing(root, chordId);
}

export function getVoicingFrets(root: number, chordId: ChordId) {
  return getPreferredVoicing(root, chordId).strings.map(
    (string) => string.fret,
  );
}

export function getVoicingPitchClasses(root: number, chordId: ChordId) {
  return getVoicingFrets(root, chordId).map((fret, index) =>
    fret === null
      ? null
      : getFrettedPitchClass(
          [...STANDARD_TUNING].reverse()[index].pitchClass,
          fret,
        ),
  );
}
