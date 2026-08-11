import type { SavedChord } from "./chord-group-state";
import { getChordVoicingOption } from "./chord-theory";

const LOW_TO_HIGH_OPEN_MIDI = [40, 45, 50, 55, 59, 64] as const;

export type VoiceMovement = {
  semitones: number;
  status: "held" | "closest" | "other";
};

export type VoiceLeadingTransition = {
  movements: readonly (VoiceMovement | null)[];
  heldCount: number;
  smallestMove: number | null;
};

function voicingMidiPitches(chord: SavedChord): (number | null)[] {
  const voicing = getChordVoicingOption(
    chord.root,
    chord.chordId,
    chord.voicingKey,
  ).voicing;
  return voicing.strings.map((string, index) =>
    string.fret === null ? null : LOW_TO_HIGH_OPEN_MIDI[index] + string.fret,
  );
}

export function compareChordVoicings(
  previous: SavedChord,
  current: SavedChord,
): VoiceLeadingTransition {
  const sources = voicingMidiPitches(previous).filter(
    (pitch): pitch is number => pitch !== null,
  );
  const destinationPitches = voicingMidiPitches(current);
  const rawMovements = destinationPitches.map((destination) => {
    if (destination === null || sources.length === 0) return null;
    return sources.reduce((best, source) => {
      const movement = destination - source;
      return Math.abs(movement) < Math.abs(best) ? movement : best;
    }, destination - sources[0]);
  });
  const nonZeroDistances = rawMovements.flatMap((movement) =>
    movement === null || movement === 0 ? [] : [Math.abs(movement)],
  );
  const smallestMove =
    nonZeroDistances.length > 0 ? Math.min(...nonZeroDistances) : null;
  const movements = rawMovements.map((semitones) =>
    semitones === null
      ? null
      : {
          semitones,
          status:
            semitones === 0
              ? ("held" as const)
              : Math.abs(semitones) === smallestMove
                ? ("closest" as const)
                : ("other" as const),
        },
  );

  return {
    movements: [...movements].reverse(),
    heldCount: movements.filter((movement) => movement?.status === "held")
      .length,
    smallestMove,
  };
}
