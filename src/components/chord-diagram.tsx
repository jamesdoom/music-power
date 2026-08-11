import type { CSSProperties } from "react";

import type { ChordId } from "@/lib/chord-data";
import { createChordDiagramModel } from "@/lib/chord-diagram";
import type { MarkerLabel } from "@/lib/selection-state";

type ChordDiagramProps = {
  root: number;
  chordId: ChordId;
  labels: MarkerLabel;
  noteNames: readonly string[];
};

export function ChordDiagram({
  root,
  chordId,
  labels,
  noteNames,
}: ChordDiagramProps) {
  const model = createChordDiagramModel(root, chordId);
  const chordName = `${noteNames[root]}${model.chord.symbol}`;
  return (
    <div className="chord-diagram-region">
      <div className="mini-neck-heading">
        <div>
          <p className="summary-label">Preferred voicing</p>
          <h3>{model.voicing.name}</h3>
        </div>
        <p>
          {model.voicing.kind === "open" ? (
            "Open position"
          ) : (
            <>
              Root at fret <strong>{model.rootFret}</strong>
            </>
          )}
        </p>
      </div>
      <div
        className="mini-neck-scroll"
        tabIndex={0}
        aria-label={`${chordName} chord diagram`}
      >
        <div
          className="mini-neck"
          style={{ "--mini-frets": model.frets.length } as CSSProperties}
        >
          <div className="mini-neck-corner">String</div>
          {model.frets.map((fret) => (
            <div className="mini-fret-number" key={fret}>
              {fret}
            </div>
          ))}
          {model.strings.map((entry) => (
            <div className="mini-string-contents" key={entry.stringNumber}>
              <div className="mini-string-label">
                <strong>{entry.string.name}</strong>
                <span>
                  {entry.fret === null
                    ? "×"
                    : entry.fret === 0
                      ? "○"
                      : entry.stringNumber}
                </span>
              </div>
              {model.frets.map((fret) => (
                <div
                  className={`mini-fret-cell ${fret === 0 ? "open-mini-fret" : ""} ${model.voicing.barre && fret === model.voicing.barre.fret && entry.stringNumber >= model.voicing.barre.toString && entry.stringNumber <= model.voicing.barre.fromString ? "barre-cell" : ""}`}
                  style={
                    { "--string-gauge": entry.string.gauge } as CSSProperties
                  }
                  key={fret}
                >
                  <i className="mini-string-line" />
                  {entry.fret === fret && entry.pitchClass !== null && (
                    <span
                      className={`chord-note-marker ${entry.isRoot ? "root-note" : ""}`}
                      aria-label={`${noteNames[entry.pitchClass]}, ${entry.degree}, string ${entry.stringNumber}, fret ${fret}, finger ${fret === 0 ? "open" : (entry.finger ?? "unspecified")}`}
                    >
                      <em>
                        {labels === "notes"
                          ? noteNames[entry.pitchClass]
                          : entry.degree}
                      </em>
                      {fret > 0 && entry.finger && (
                        <small>{entry.finger}</small>
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="tuning-note">
        Standard tuning · strings shown high E to low E · × means mute
      </p>
    </div>
  );
}
