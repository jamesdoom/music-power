import { memo, type CSSProperties } from "react";

import type { ChordId } from "@/lib/chord-data";
import { createChordDiagramModel } from "@/lib/chord-diagram";

type Props = { root: number; chordId: ChordId; noteNames: readonly string[] };

function CompactChordDiagramView({ root, chordId, noteNames }: Props) {
  const model = createChordDiagramModel(root, chordId);
  return (
    <div
      className="compact-neck"
      style={{ "--compact-frets": model.frets.length } as CSSProperties}
      role="img"
      aria-label={`${noteNames[root]}${model.chord.symbol}, ${model.voicing.name}, fingering ${model.voicing.strings.map((string) => string.fret ?? "x").join(" ")}`}
    >
      <div className="compact-corner" aria-hidden="true" />
      {model.frets.map((fret) => (
        <span className="compact-fret-number" key={fret} aria-hidden="true">
          {fret}
        </span>
      ))}
      {model.strings.map((entry) => (
        <div className="compact-string" key={entry.stringNumber}>
          <span className="compact-string-status" aria-hidden="true">
            {entry.fret === null
              ? "×"
              : entry.fret === 0
                ? "○"
                : entry.string.name}
          </span>
          {model.frets.map((fret) => (
            <span
              className={`compact-fret ${fret === 0 ? "compact-open-fret" : ""}`}
              key={fret}
              aria-hidden="true"
            >
              <i style={{ height: `${1 + entry.string.gauge * 0.35}px` }} />
              {entry.fret === fret && entry.pitchClass !== null && (
                <b className={entry.isRoot ? "root" : undefined}>
                  {fret === 0 ? "○" : entry.finger}
                </b>
              )}
            </span>
          ))}
          <span className="sr-only">
            String {entry.stringNumber},{" "}
            {entry.fret === null
              ? "muted"
              : entry.fret === 0
                ? "open"
                : `fret ${entry.fret}, finger ${entry.finger}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export const CompactChordDiagram = memo(CompactChordDiagramView);
