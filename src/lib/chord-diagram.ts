import { CHORDS, type ChordId } from "./chord-data";
import { getChordVoicingOption, getVoicingPitchClasses } from "./chord-theory";
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

export function createChordDiagramModel(
  root: number,
  chordId: ChordId,
  voicingKey?: string,
) {
  const chord = CHORDS[chordId];
  const option = getChordVoicingOption(root, chordId, voicingKey);
  const voicing = option.voicing;
  const rootFret = voicing.rootFret ?? 0;
  const soundingFrets = voicing.strings.flatMap((string) =>
    string.fret === null ? [] : [string.fret],
  );
  const firstFret = soundingFrets.includes(0)
    ? 0
    : Math.max(1, Math.min(...soundingFrets));
  const lastFret = Math.max(...soundingFrets);
  const fretCount = Math.max(5, lastFret - firstFret + 1);
  const frets = Array.from(
    { length: fretCount },
    (_, index) => firstFret + index,
  );
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

  return { chord, option, voicing, rootFret, frets, strings };
}

export type ChordDiagramModel = ReturnType<typeof createChordDiagramModel>;
