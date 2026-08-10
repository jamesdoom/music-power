import type { CSSProperties } from "react";

import {
  FRET_COUNT,
  STANDARD_TUNING,
  type AccidentalPreference,
  type ScaleDefinition,
} from "@/lib/music-data";
import {
  getFrettedPitchClass,
  getPitchClassName,
  getScaleDegree,
} from "@/lib/music-theory";
import type {
  Handedness,
  MarkerLabel,
  StringOrder,
} from "@/lib/selection-state";

type FretboardProps = {
  root: number;
  scale: ScaleDefinition;
  scalePitchClasses: ReadonlySet<number>;
  markerLabel: MarkerLabel;
  accidentals: AccidentalPreference;
  handedness: Handedness;
  stringOrder: StringOrder;
  activePitchClass: number | null;
  selectedPitchClass: number | null;
  onPreviewPitchClass: (pitchClass: number | null) => void;
  onTogglePitchClass: (pitchClass: number) => void;
};

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret);
const SINGLE_MARKERS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const fretboardStyle = {
  "--fret-columns": FRET_COUNT + 1,
  "--fretboard-min-width": `${4.5 + (FRET_COUNT + 1) * 4.4}rem`,
} as CSSProperties;

export function Fretboard({
  root,
  scale,
  scalePitchClasses,
  markerLabel,
  accidentals,
  handedness,
  stringOrder,
  activePitchClass,
  selectedPitchClass,
  onPreviewPitchClass,
  onTogglePitchClass,
}: FretboardProps) {
  const displayedFrets = handedness === "left" ? [...FRETS].reverse() : FRETS;
  const displayedStrings =
    stringOrder === "low-to-high"
      ? [...STANDARD_TUNING].reverse()
      : STANDARD_TUNING;
  const stringOrderLabel =
    stringOrder === "low-to-high" ? "low E to high E" : "high E to low E";

  return (
    <div className="fretboard-region">
      <p className="scroll-hint">Scroll sideways to see all frets</p>
      <div
        className="fretboard-scroll"
        tabIndex={0}
        aria-label="Scrollable guitar fretboard"
      >
        <div
          className={`fretboard ${handedness}-handed`}
          role="table"
          aria-label={`Guitar scale notes from fret 0 through ${FRET_COUNT}, ${handedness}-handed, ${stringOrderLabel}`}
          style={fretboardStyle}
        >
          <div className="fret-row fret-numbers" role="row">
            <span className="string-heading" role="columnheader">
              String
            </span>
            {displayedFrets.map((fret) => (
              <span key={fret} role="columnheader">
                {fret}
              </span>
            ))}
          </div>

          {displayedStrings.map((string) => (
            <div
              className="fret-row string-row"
              role="row"
              key={`${string.name}-${string.gauge}`}
            >
              <span className="string-label" role="rowheader">
                <strong>{string.name}</strong>
                <small>{string.gauge}</small>
              </span>
              {displayedFrets.map((fret) => {
                const pitchClass = getFrettedPitchClass(
                  string.pitchClass,
                  fret,
                );
                const isScaleNote = scalePitchClasses.has(pitchClass);
                const isRoot = pitchClass === root;
                const noteName = getPitchClassName(pitchClass, accidentals);
                const degree = getScaleDegree(pitchClass, root, scale);
                const displayedLabel =
                  markerLabel === "notes" ? noteName : degree;
                const isHighlighted = activePitchClass === pitchClass;
                const isDimmed =
                  activePitchClass !== null && activePitchClass !== pitchClass;
                const detailLabel = `${noteName} · degree ${degree} · string ${string.gauge} · fret ${fret}`;

                return (
                  <span
                    className={`fret-cell ${fret === 0 ? "open-string" : ""}`}
                    role="cell"
                    key={fret}
                    aria-label={
                      isScaleNote
                        ? `String ${string.gauge}, fret ${fret}: ${noteName}, scale degree ${degree}${isRoot ? ", root note" : ""}`
                        : `String ${string.gauge}, fret ${fret}`
                    }
                  >
                    <i
                      className="string-line"
                      style={{
                        height: `${1 + (string.gauge - 1) * 0.32}px`,
                      }}
                    />
                    {isScaleNote ? (
                      <button
                        type="button"
                        className={`note-marker ${isRoot ? "root-note" : ""} ${isHighlighted ? "highlighted" : ""} ${isDimmed ? "dimmed" : ""}`}
                        aria-label={`${detailLabel}${isRoot ? ", root note" : ""}`}
                        aria-pressed={selectedPitchClass === pitchClass}
                        data-tooltip={detailLabel}
                        onClick={() => onTogglePitchClass(pitchClass)}
                        onPointerEnter={() => onPreviewPitchClass(pitchClass)}
                        onPointerLeave={() => onPreviewPitchClass(null)}
                        onFocus={() => onPreviewPitchClass(pitchClass)}
                        onBlur={() => onPreviewPitchClass(null)}
                      >
                        {displayedLabel}
                        <span className="sr-only">{isRoot ? " root" : ""}</span>
                      </button>
                    ) : null}
                  </span>
                );
              })}
            </div>
          ))}

          <div className="fret-row position-markers" aria-hidden="true">
            <span />
            {displayedFrets.map((fret) => (
              <span key={fret}>
                {SINGLE_MARKERS.has(fret) ? <i /> : null}
                {fret === 12 ? (
                  <>
                    <i />
                    <i />
                  </>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="tuning-note">
        Standard tuning · {stringOrderLabel} · frets 0–{FRET_COUNT} ·{" "}
        {handedness}-handed
      </p>
    </div>
  );
}
