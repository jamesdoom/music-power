import { type ChordId, CHORDS, LOW_E_VOICINGS } from "./chord-data";
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

export function getVoicingFrets(root: number, chordId: ChordId) {
  const rootFret = getLowERootFret(root);
  return LOW_E_VOICINGS[chordId].strings.map((string) =>
    string.offset === null ? null : rootFret + string.offset,
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
