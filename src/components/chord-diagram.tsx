import type { CSSProperties } from "react";

import type { ChordId } from "@/lib/chord-data";
import { createChordDiagramModel } from "@/lib/chord-diagram";
import { getChordVoicingOptions } from "@/lib/chord-theory";
import type { MarkerLabel } from "@/lib/selection-state";

type ChordDiagramProps = {
  root: number;
  chordId: ChordId;
  labels: MarkerLabel;
  noteNames: readonly string[];
  voicingKey?: string;
  onVoicingChange: (key: string) => void;
};

export function ChordDiagram({
  root,
  chordId,
  labels,
  noteNames,
  voicingKey,
  onVoicingChange,
}: ChordDiagramProps) {
  const options = getChordVoicingOptions(root, chordId);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.key === voicingKey),
  );
  const model = createChordDiagramModel(
    root,
    chordId,
    options[selectedIndex].key,
  );
  const chordName = `${noteNames[root]}${model.chord.symbol}`;
  return (
    <div className="chord-diagram-region">
      <div className="mini-neck-heading">
        <div>
          <p className="summary-label">
            {selectedIndex === 0 ? "Preferred voicing" : model.option.category}
          </p>
          <h3>{model.voicing.name}</h3>
          <p className="voicing-position">
            {model.voicing.kind === "open" ? (
              "Open position"
            ) : model.voicing.kind === "inversion" ? (
              "Upper-string voicing"
            ) : (
              <>
                Root at fret <strong>{model.rootFret}</strong>
              </>
            )}
          </p>
        </div>
        <div className="voicing-controls" aria-label="Chord voicing">
          <button
            type="button"
            onClick={() =>
              onVoicingChange(
                options[(selectedIndex - 1 + options.length) % options.length]
                  .key,
              )
            }
            aria-label="Previous chord voicing"
          >
            &larr;
          </button>
          <span aria-live="polite">
            {selectedIndex + 1} of {options.length}
          </span>
          <button
            type="button"
            onClick={() =>
              onVoicingChange(options[(selectedIndex + 1) % options.length].key)
            }
            aria-label="Next chord voicing"
          >
            &rarr;
          </button>
        </div>
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
