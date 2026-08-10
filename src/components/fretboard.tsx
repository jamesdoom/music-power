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
import type { MarkerLabel } from "./scale-explorer";

type FretboardProps = {
  root: number;
  scale: ScaleDefinition;
  scalePitchClasses: ReadonlySet<number>;
  markerLabel: MarkerLabel;
  accidentals: AccidentalPreference;
};

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret);
const SINGLE_MARKERS = new Set([3, 5, 7, 9, 15]);

export function Fretboard({
  root,
  scale,
  scalePitchClasses,
  markerLabel,
  accidentals,
}: FretboardProps) {
  return (
    <div className="fretboard-region">
      <p className="scroll-hint">Scroll sideways to see higher frets</p>
      <div
        className="fretboard-scroll"
        tabIndex={0}
        aria-label="Scrollable guitar fretboard"
      >
        <div
          className="fretboard"
          role="table"
          aria-label="Guitar scale notes from fret 0 through 15"
        >
          <div className="fret-row fret-numbers" role="row">
            <span className="string-heading" role="columnheader">
              String
            </span>
            {FRETS.map((fret) => (
              <span key={fret} role="columnheader">
                {fret}
              </span>
            ))}
          </div>

          {STANDARD_TUNING.map((string, stringIndex) => (
            <div
              className="fret-row string-row"
              role="row"
              key={`${string.name}-${string.gauge}`}
            >
              <span className="string-label" role="rowheader">
                <strong>{string.name}</strong>
                <small>{string.gauge}</small>
              </span>
              {FRETS.map((fret) => {
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
                        height: `${1 + stringIndex * 0.32}px`,
                      }}
                    />
                    {isScaleNote ? (
                      <strong
                        className={`note-marker ${isRoot ? "root-note" : ""}`}
                      >
                        {displayedLabel}
                        <span className="sr-only">{isRoot ? " root" : ""}</span>
                      </strong>
                    ) : null}
                  </span>
                );
              })}
            </div>
          ))}

          <div className="fret-row position-markers" aria-hidden="true">
            <span />
            {FRETS.map((fret) => (
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
        Standard tuning · high E to low E · frets 0–15
      </p>
    </div>
  );
}
