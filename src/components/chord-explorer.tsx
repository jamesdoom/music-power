"use client";

import { useState, type CSSProperties } from "react";

import { CHORDS, LOW_E_VOICINGS, type ChordId } from "@/lib/chord-data";
import {
  getChordPitchClasses,
  getLowERootFret,
  getVoicingFrets,
  getVoicingPitchClasses,
} from "@/lib/chord-theory";
import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  STANDARD_TUNING,
  type AccidentalPreference,
} from "@/lib/music-data";
import { normalizePitchClass } from "@/lib/music-theory";
import type { MarkerLabel } from "@/lib/selection-state";

export function ChordExplorer() {
  const [root, setRoot] = useState(0);
  const [chordId, setChordId] = useState<ChordId>("major");
  const [labels, setLabels] = useState<MarkerLabel>("notes");
  const [accidentals, setAccidentals] =
    useState<AccidentalPreference>("sharps");

  const chord = CHORDS[chordId];
  const voicing = LOW_E_VOICINGS[chordId];
  const names = accidentals === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  const chordPitchClasses = getChordPitchClasses(root, chordId);
  const voicingFrets = getVoicingFrets(root, chordId);
  const voicingPitchClasses = getVoicingPitchClasses(root, chordId);
  const rootFret = getLowERootFret(root);
  const visibleFrets = Array.from(
    { length: 5 },
    (_, index) => rootFret + index,
  );
  const displayStrings = [...STANDARD_TUNING];
  const displayFrets = [...voicingFrets].reverse();
  const displayPitches = [...voicingPitchClasses].reverse();
  const displayFingerings = [...voicing.strings].reverse();

  function markerText(pitchClass: number) {
    if (labels === "notes") return names[pitchClass];
    return chord.degrees[
      (chord.intervals as readonly number[]).indexOf(
        normalizePitchClass(pitchClass - root),
      )
    ];
  }

  return (
    <section
      className="explorer chord-explorer"
      aria-labelledby="current-chord"
    >
      <div className="controls chord-controls">
        <div className="select-control">
          <label htmlFor="chord-root">Root note</label>
          <select
            id="chord-root"
            value={root}
            onChange={(event) => setRoot(Number(event.target.value))}
          >
            {names.map((note, pitchClass) => (
              <option key={pitchClass} value={pitchClass}>
                {note}
              </option>
            ))}
          </select>
        </div>
        <div className="select-control">
          <label htmlFor="chord-quality">Chord quality</label>
          <select
            id="chord-quality"
            value={chordId}
            onChange={(event) => setChordId(event.target.value as ChordId)}
          >
            {Object.entries(CHORDS).map(([id, definition]) => (
              <option key={id} value={id}>
                {definition.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="segmented-control">
          <legend>Marker labels</legend>
          {(["notes", "degrees"] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="chord-labels"
                checked={labels === value}
                onChange={() => setLabels(value)}
              />
              <span>{value === "notes" ? "Notes" : "Degrees"}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="segmented-control">
          <legend>Accidentals</legend>
          {(["sharps", "flats"] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="chord-accidentals"
                checked={accidentals === value}
                onChange={() => setAccidentals(value)}
              />
              <span>{value === "sharps" ? "Sharps" : "Flats"}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className="scale-summary chord-summary">
        <div className="scale-identity">
          <p className="summary-label">Now viewing</p>
          <h2 id="current-chord">
            {names[root]}
            {chord.symbol}
          </h2>
          <p className="chord-quality-name">{chord.name}</p>
          <ol className="scale-sequence" aria-label="Chord notes">
            {chordPitchClasses.map((pitchClass) => (
              <li key={pitchClass}>
                <span>{names[pitchClass]}</span>
              </li>
            ))}
          </ol>
          <ol
            className="scale-sequence scale-degree-sequence"
            aria-label="Chord formula"
          >
            {chord.degrees.map((degree) => (
              <li key={degree}>
                <span>{degree}</span>
              </li>
            ))}
          </ol>
        </div>
        <div
          className="chord-notation-legend"
          aria-label="Chord diagram legend"
        >
          <span>
            <b>○</b> Open
          </span>
          <span>
            <b>×</b> Muted
          </span>
          <span>
            <b>1–4</b> Fingers
          </span>
        </div>
      </div>

      <div className="chord-diagram-region">
        <div className="mini-neck-heading">
          <div>
            <p className="summary-label">Movable voicing</p>
            <h3>Low-E root shape</h3>
          </div>
          <p>
            Root at fret <strong>{rootFret}</strong>
          </p>
        </div>
        <div
          className="mini-neck-scroll"
          tabIndex={0}
          aria-label={`${names[root]}${chord.symbol} chord diagram`}
        >
          <div
            className="mini-neck"
            style={{ "--mini-frets": visibleFrets.length } as CSSProperties}
          >
            <div className="mini-neck-corner">String</div>
            {visibleFrets.map((fret) => (
              <div className="mini-fret-number" key={fret}>
                {fret}
              </div>
            ))}
            {displayStrings.map((string, stringIndex) => {
              const playedFret = displayFrets[stringIndex];
              const pitchClass = displayPitches[stringIndex];
              const fingering = displayFingerings[stringIndex];
              const stringNumber = stringIndex + 1;
              return (
                <div
                  className="mini-string-contents"
                  key={`${string.name}-${stringIndex}`}
                >
                  <div className="mini-string-label">
                    <strong>{string.name}</strong>
                    <span>
                      {playedFret === null
                        ? "×"
                        : playedFret === 0
                          ? "○"
                          : stringIndex + 1}
                    </span>
                  </div>
                  {visibleFrets.map((fret) => (
                    <div
                      className={`mini-fret-cell gauge-${string.gauge} ${fret === 0 ? "open-mini-fret" : ""} ${
                        rootFret > 0 &&
                        voicing.barre &&
                        fret === rootFret + voicing.barre.offset &&
                        stringNumber >= voicing.barre.toString &&
                        stringNumber <= voicing.barre.fromString
                          ? "barre-cell"
                          : ""
                      }`}
                      key={fret}
                    >
                      <i className="mini-string-line" />
                      {playedFret === fret && pitchClass !== null && (
                        <span
                          className={`chord-note-marker ${pitchClass === root ? "root-note" : ""}`}
                          aria-label={`${names[pitchClass]}, ${chord.degrees[(chord.intervals as readonly number[]).indexOf(normalizePitchClass(pitchClass - root))]}, string ${stringNumber}, fret ${fret}, finger ${fret === 0 ? "open" : (fingering.finger ?? "unspecified")}`}
                        >
                          <em>{markerText(pitchClass)}</em>
                          {fret > 0 && fingering.finger && (
                            <small>{fingering.finger}</small>
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <p className="tuning-note">
          Standard tuning · strings shown high E to low E · × means mute
        </p>
      </div>
    </section>
  );
}
