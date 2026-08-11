import { memo, type CSSProperties } from "react";

import type { ChordId } from "@/lib/chord-data";
import { createChordDiagramModel } from "@/lib/chord-diagram";
import type { VoiceMovement } from "@/lib/voice-leading";

type Props = {
  root: number;
  chordId: ChordId;
  voicingKey?: string;
  noteNames: readonly string[];
  movements?: readonly (VoiceMovement | null)[];
  transitionLabel?: string;
};

function CompactChordDiagramView({
  root,
  chordId,
  voicingKey,
  noteNames,
  movements,
  transitionLabel,
}: Props) {
  const model = createChordDiagramModel(root, chordId, voicingKey);
  return (
    <div
      className="compact-neck"
      style={{ "--compact-frets": model.frets.length } as CSSProperties}
      role="img"
      aria-label={`${noteNames[root]}${model.chord.symbol}, ${model.voicing.name}, fingering ${model.voicing.strings.map((string) => string.fret ?? "x").join(" ")}${transitionLabel ? `. ${transitionLabel}` : ""}`}
    >
      <div className="compact-corner" aria-hidden="true" />
      {model.frets.map((fret) => (
        <span className="compact-fret-number" key={fret} aria-hidden="true">
          {fret}
        </span>
      ))}
      {model.strings.map((entry, stringIndex) => (
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
                <b
                  className={[
                    entry.isRoot ? "root" : "",
                    movements?.[stringIndex]?.status === "held"
                      ? "voice-held"
                      : "",
                    movements?.[stringIndex]?.status === "closest"
                      ? "voice-closest"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
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
