import type { CSSProperties } from "react";

import { CHORDS, type ChordId } from "@/lib/chord-data";
import {
  getPreferredVoicing,
  getVoicingPitchClasses,
} from "@/lib/chord-theory";
import { STANDARD_TUNING } from "@/lib/music-data";

type CompactChordDiagramProps = {
  root: number;
  chordId: ChordId;
  noteNames: readonly string[];
};

export function CompactChordDiagram({
  root,
  chordId,
  noteNames,
}: CompactChordDiagramProps) {
  const chord = CHORDS[chordId];
  const voicing = getPreferredVoicing(root, chordId);
  const pitches = [...getVoicingPitchClasses(root, chordId)].reverse();
  const strings = [...voicing.strings].reverse();
  const rootFret = voicing.rootFret ?? 0;
  const firstFret = voicing.kind === "open" ? 0 : rootFret;
  const frets = Array.from({ length: 5 }, (_, index) => firstFret + index);

  return (
    <div
      className="compact-neck"
      style={{ "--compact-frets": frets.length } as CSSProperties}
      role="img"
      aria-label={`${noteNames[root]}${chord.symbol}, ${voicing.name}, fingering ${voicing.strings.map((string) => string.fret ?? "x").join(" ")}`}
    >
      <div className="compact-corner" aria-hidden="true" />
      {frets.map((fret) => (
        <span className="compact-fret-number" key={fret} aria-hidden="true">
          {fret}
        </span>
      ))}
      {STANDARD_TUNING.map((string, displayIndex) => {
        const chordString = strings[displayIndex];
        const pitchClass = pitches[displayIndex];
        const stringNumber = displayIndex + 1;
        return (
          <div
            className="compact-string"
            key={`${string.name}-${displayIndex}`}
          >
            <span className="compact-string-status" aria-hidden="true">
              {chordString.fret === null
                ? "×"
                : chordString.fret === 0
                  ? "○"
                  : string.name}
            </span>
            {frets.map((fret) => (
              <span
                className={`compact-fret ${fret === 0 ? "compact-open-fret" : ""}`}
                key={fret}
                aria-hidden="true"
              >
                <i style={{ height: `${1 + string.gauge * 0.35}px` }} />
                {chordString.fret === fret && pitchClass !== null && (
                  <b className={pitchClass === root ? "root" : undefined}>
                    {fret === 0 ? "○" : chordString.finger}
                  </b>
                )}
              </span>
            ))}
            <span className="sr-only">
              String {stringNumber},{" "}
              {chordString.fret === null
                ? "muted"
                : chordString.fret === 0
                  ? "open"
                  : `fret ${chordString.fret}, finger ${chordString.finger}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
