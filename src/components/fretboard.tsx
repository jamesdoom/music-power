import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

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
import {
  findNextMarkerIndex,
  type NavigationKey,
} from "@/lib/fretboard-navigation";
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
  onClearPitchClass: () => void;
};

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret);
const SINGLE_MARKERS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const NAVIGATION_KEYS = new Set<NavigationKey>([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);
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
  onClearPitchClass,
}: FretboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true,
    progress: 0,
  });
  const displayedFrets = handedness === "left" ? [...FRETS].reverse() : FRETS;
  const displayedStrings =
    stringOrder === "low-to-high"
      ? [...STANDARD_TUNING].reverse()
      : STANDARD_TUNING;
  const stringOrderLabel =
    stringOrder === "low-to-high" ? "low E to high E" : "high E to low E";

  const updateScrollState = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const maximum = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    const progress =
      maximum === 0 ? 100 : (scroller.scrollLeft / maximum) * 100;

    setScrollState({
      canScrollLeft: scroller.scrollLeft > 2,
      canScrollRight: scroller.scrollLeft < maximum - 2,
      progress,
    });
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(scroller);
    if (scroller.firstElementChild)
      observer.observe(scroller.firstElementChild);
    updateScrollState();
    setIsInteractive(true);

    return () => observer.disconnect();
  }, [updateScrollState]);

  function scrollNeck(direction: -1 | 1) {
    const scroller = scrollRef.current;
    if (!scroller) return;

    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.72 });
    requestAnimationFrame(updateScrollState);
  }

  function handleMarkerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!NAVIGATION_KEYS.has(event.key as NavigationKey)) return;

    const markers = Array.from(
      scrollRef.current?.querySelectorAll<HTMLButtonElement>(".note-marker") ??
        [],
    );
    const currentIndex = markers.indexOf(event.currentTarget);
    const positions = markers.map((marker) => ({
      row: Number(marker.dataset.row),
      column: Number(marker.dataset.column),
    }));
    const nextIndex = findNextMarkerIndex(
      positions,
      currentIndex,
      event.key as NavigationKey,
    );
    const nextMarker = markers[nextIndex];

    if (!nextMarker || nextMarker === event.currentTarget) return;

    event.preventDefault();
    nextMarker.focus({ preventScroll: true });
    nextMarker.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function handleFretboardClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest(".fret-cell") && !target.closest(".note-marker")) {
      onClearPitchClass();
    }
  }

  return (
    <div className="fretboard-region" data-interactive={isInteractive}>
      <div className="neck-navigation">
        <p id="fretboard-help" className="scroll-hint">
          Scroll sideways to see all frets. On a note, use arrow keys to move;
          Home and End jump across the string.
        </p>
        <div className="neck-progress">
          <button
            type="button"
            onClick={() => scrollNeck(-1)}
            disabled={!scrollState.canScrollLeft}
            aria-label="Scroll to the previous neck section"
          >
            ←
          </button>
          <progress
            max="100"
            value={scrollState.progress}
            aria-label="Fretboard horizontal position"
          />
          <button
            type="button"
            onClick={() => scrollNeck(1)}
            disabled={!scrollState.canScrollRight}
            aria-label="Scroll to the next neck section"
          >
            →
          </button>
        </div>
      </div>
      <div
        className={`fretboard-viewport ${scrollState.canScrollLeft ? "can-scroll-left" : ""} ${scrollState.canScrollRight ? "can-scroll-right" : ""}`}
      >
        <div
          ref={scrollRef}
          className="fretboard-scroll"
          tabIndex={0}
          aria-label="Scrollable guitar fretboard"
          aria-describedby="fretboard-help"
          onScroll={updateScrollState}
        >
          <div
            className={`fretboard ${handedness}-handed ${selectedPitchClass !== null ? "has-selection" : ""}`}
            role="table"
            aria-label={`Guitar scale notes from fret 0 through ${FRET_COUNT}, ${handedness}-handed, ${stringOrderLabel}`}
            style={fretboardStyle}
            onClick={handleFretboardClick}
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

            {displayedStrings.map((string, rowIndex) => (
              <div
                className="fret-row string-row"
                role="row"
                key={`${string.name}-${string.gauge}`}
              >
                <span className="string-label" role="rowheader">
                  <strong>{string.name}</strong>
                  <small>{string.gauge}</small>
                </span>
                {displayedFrets.map((fret, columnIndex) => {
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
                    activePitchClass !== null &&
                    activePitchClass !== pitchClass;
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
                          data-row={rowIndex}
                          data-column={columnIndex}
                          onClick={() => onTogglePitchClass(pitchClass)}
                          onPointerEnter={() => onPreviewPitchClass(pitchClass)}
                          onPointerLeave={() => onPreviewPitchClass(null)}
                          onFocus={() => onPreviewPitchClass(pitchClass)}
                          onBlur={() => onPreviewPitchClass(null)}
                          onKeyDown={handleMarkerKeyDown}
                        >
                          {displayedLabel}
                          <span className="sr-only">
                            {isRoot ? " root" : ""}
                          </span>
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
      </div>
      <p className="tuning-note">
        Standard tuning · {stringOrderLabel} · frets 0–{FRET_COUNT} ·{" "}
        {handedness}-handed
      </p>
    </div>
  );
}
