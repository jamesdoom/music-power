"use client";

import { useRef, useState, type CSSProperties } from "react";

import { CHORDS, type ChordId } from "@/lib/chord-data";
import { moveItem } from "@/lib/array-order";
import {
  getChordPitchClasses,
  getPreferredVoicing,
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
import { CompactChordDiagram } from "./compact-chord-diagram";

type ChordGroupItem = {
  id: number;
  root: number;
  chordId: ChordId;
};

export function ChordExplorer() {
  const [root, setRoot] = useState(0);
  const [chordId, setChordId] = useState<ChordId>("major");
  const [labels, setLabels] = useState<MarkerLabel>("notes");
  const [accidentals, setAccidentals] =
    useState<AccidentalPreference>("sharps");
  const [chordGroup, setChordGroup] = useState<ChordGroupItem[]>([]);
  const [draggedChordId, setDraggedChordId] = useState<number | null>(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState("");
  const nextGroupId = useRef(1);

  const chord = CHORDS[chordId];
  const voicing = getPreferredVoicing(root, chordId);
  const names = accidentals === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  const chordPitchClasses = getChordPitchClasses(root, chordId);
  const voicingFrets = getVoicingFrets(root, chordId);
  const voicingPitchClasses = getVoicingPitchClasses(root, chordId);
  const rootFret = voicing.rootFret ?? 0;
  const firstVisibleFret = voicing.kind === "open" ? 0 : rootFret;
  const visibleFrets = Array.from(
    { length: 5 },
    (_, index) => firstVisibleFret + index,
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

  function addCurrentChord() {
    const item = { id: nextGroupId.current, root, chordId };
    nextGroupId.current += 1;
    setChordGroup((current) => [...current, item]);
  }

  function moveChord(fromIndex: number, toIndex: number, chordName: string) {
    setChordGroup((current) => moveItem(current, fromIndex, toIndex));
    setReorderAnnouncement(`${chordName} moved to position ${toIndex + 1}.`);
  }

  function dropChord(targetIndex: number) {
    if (draggedChordId === null) return;
    const fromIndex = chordGroup.findIndex(
      (item) => item.id === draggedChordId,
    );
    if (fromIndex === -1 || fromIndex === targetIndex) return;
    const item = chordGroup[fromIndex];
    const chordName = `${names[item.root]}${CHORDS[item.chordId].symbol}`;
    moveChord(fromIndex, targetIndex, chordName);
    setDraggedChordId(null);
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
        <div className="chord-summary-actions">
          <button
            type="button"
            className="add-chord-button"
            onClick={addCurrentChord}
          >
            Add {names[root]}
            {chord.symbol} to group
          </button>
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
      </div>

      <div className="chord-diagram-region">
        <div className="mini-neck-heading">
          <div>
            <p className="summary-label">Preferred voicing</p>
            <h3>{voicing.name}</h3>
          </div>
          <p>
            {voicing.kind === "open" ? (
              "Open position"
            ) : (
              <>
                Root at fret <strong>{rootFret}</strong>
              </>
            )}
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
                        voicing.barre &&
                        fret === voicing.barre.fret &&
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

      <section className="chord-group" aria-labelledby="chord-group-title">
        <p className="sr-only" role="status" aria-live="polite">
          {reorderAnnouncement}
        </p>
        <div className="chord-group-heading">
          <div>
            <p className="summary-label">Play-along workspace</p>
            <h3 id="chord-group-title">Your chord group</h3>
          </div>
          {chordGroup.length > 0 && (
            <button
              type="button"
              className="clear-chord-group"
              onClick={() => setChordGroup([])}
            >
              Clear group
            </button>
          )}
        </div>
        {chordGroup.length === 0 ? (
          <p className="empty-chord-group">
            Add chords above to keep their fingerings together in song order.
          </p>
        ) : (
          <ol
            className="chord-group-list"
            aria-label="Selected chord progression"
          >
            {chordGroup.map((item, index) => {
              const itemChord = CHORDS[item.chordId];
              const chordName = `${names[item.root]}${itemChord.symbol}`;
              return (
                <li
                  key={item.id}
                  className={
                    draggedChordId === item.id ? "dragging" : undefined
                  }
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropChord(index)}
                >
                  <article className="chord-group-card">
                    <header>
                      <span
                        className="chord-order"
                        aria-label={`Chord ${index + 1}`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h4>{chordName}</h4>
                        <p>{itemChord.name}</p>
                      </div>
                      <button
                        type="button"
                        className="chord-drag-handle"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData(
                            "text/plain",
                            String(item.id),
                          );
                          setDraggedChordId(item.id);
                        }}
                        onDragEnd={() => setDraggedChordId(null)}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowLeft" && index > 0) {
                            event.preventDefault();
                            moveChord(index, index - 1, chordName);
                          }
                          if (
                            event.key === "ArrowRight" &&
                            index < chordGroup.length - 1
                          ) {
                            event.preventDefault();
                            moveChord(index, index + 1, chordName);
                          }
                        }}
                        aria-label={`Reorder ${chordName} at position ${index + 1}. Use left and right arrow keys.`}
                        title="Drag to reorder"
                      >
                        <span aria-hidden="true">⠿</span>
                      </button>
                      <div className="chord-card-actions">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveChord(index, index - 1, chordName)}
                          aria-label={`Move ${chordName} earlier`}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={index === chordGroup.length - 1}
                          onClick={() => moveChord(index, index + 1, chordName)}
                          aria-label={`Move ${chordName} later`}
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRoot(item.root);
                            setChordId(item.chordId);
                          }}
                          aria-label={`View ${chordName}`}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChordGroup((current) =>
                              current.filter(
                                (candidate) => candidate.id !== item.id,
                              ),
                            )
                          }
                          aria-label={`Remove ${chordName} at position ${index + 1}`}
                        >
                          Remove
                        </button>
                      </div>
                    </header>
                    <CompactChordDiagram
                      root={item.root}
                      chordId={item.chordId}
                      noteNames={names}
                    />
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </section>
  );
}
