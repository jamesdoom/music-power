import { CHORDS, type ChordId } from "./chord-data";
import { getPreferredVoicing, getVoicingPitchClasses } from "./chord-theory";
import { STANDARD_TUNING } from "./music-data";
import { normalizePitchClass } from "./music-theory";

export type ChordDiagramString = {
  string: (typeof STANDARD_TUNING)[number];
  stringNumber: number;
  fret: number | null;
  finger: 1 | 2 | 3 | 4 | null;
  pitchClass: number | null;
  degree: string | undefined;
  isRoot: boolean;
};

export function createChordDiagramModel(root: number, chordId: ChordId) {
  const chord = CHORDS[chordId];
  const voicing = getPreferredVoicing(root, chordId);
  const rootFret = voicing.rootFret ?? 0;
  const firstFret = voicing.kind === "open" ? 0 : rootFret;
  const frets = Array.from({ length: 5 }, (_, index) => firstFret + index);
  const pitchClasses = [
    ...getVoicingPitchClasses(root, chordId, voicing),
  ].reverse();
  const voicingStrings = [...voicing.strings].reverse();
  const strings: ChordDiagramString[] = STANDARD_TUNING.map((string, index) => {
    const pitchClass = pitchClasses[index];
    const interval =
      pitchClass === null ? -1 : normalizePitchClass(pitchClass - root);
    const degreeIndex = (chord.intervals as readonly number[]).indexOf(
      interval,
    );
    return {
      string,
      stringNumber: index + 1,
      fret: voicingStrings[index].fret,
      finger: voicingStrings[index].finger,
      pitchClass,
      degree: degreeIndex === -1 ? undefined : chord.degrees[degreeIndex],
      isRoot: pitchClass === root,
    };
  });

  return { chord, voicing, rootFret, frets, strings };
}

export type ChordDiagramModel = ReturnType<typeof createChordDiagramModel>;
