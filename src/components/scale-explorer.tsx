"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  SCALE_GROUP_LABELS,
  SCALES,
  type ScaleId,
} from "@/lib/music-data";
import { getScalePitchClasses } from "@/lib/music-theory";
import {
  parseSelection,
  serializeSelection,
  type ScaleSelection,
} from "@/lib/selection-state";
import { Fretboard } from "./fretboard";

export function ScaleExplorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selection, setSelection] = useState(() =>
    parseSelection(searchParams),
  );
  const selectionRef = useRef(selection);
  const [selectedPitchClass, setSelectedPitchClass] = useState<number | null>(
    null,
  );
  const [previewPitchClass, setPreviewPitchClass] = useState<number | null>(
    null,
  );
  const { root, scaleId, markerLabel, accidentals, handedness, stringOrder } =
    selection;

  function updateSelection(patch: Partial<ScaleSelection>) {
    if (patch.root !== undefined || patch.scaleId !== undefined) {
      setSelectedPitchClass(null);
      setPreviewPitchClass(null);
    }

    const nextSelection = { ...selectionRef.current, ...patch };
    selectionRef.current = nextSelection;
    setSelection(nextSelection);
    const params = serializeSelection(
      nextSelection,
      new URLSearchParams(window.location.search),
    );
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}?${params.toString()}${window.location.hash}`,
    );
  }

  const scale = SCALES[scaleId];
  const rootNames =
    accidentals === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  const scalePitchClassList = getScalePitchClasses(root, scale.intervals);
  const scalePitchClasses = new Set(scalePitchClassList);
  const scaleNoteNames = scalePitchClassList.map((pitchClass) =>
    accidentals === "flats"
      ? CHROMATIC_FLATS[pitchClass]
      : CHROMATIC_SHARPS[pitchClass],
  );
  const activePitchClass = previewPitchClass ?? selectedPitchClass;

  function togglePitchClass(pitchClass: number) {
    setSelectedPitchClass((current) =>
      current === pitchClass ? null : pitchClass,
    );
  }

  function clearPitchClass() {
    setSelectedPitchClass(null);
    setPreviewPitchClass(null);
  }

  return (
    <section className="explorer" aria-labelledby="current-scale">
      <div className="controls">
        <div className="select-control">
          <label htmlFor="root-note">Root note</label>
          <select
            id="root-note"
            value={root}
            onChange={(event) =>
              updateSelection({ root: Number(event.target.value) })
            }
          >
            {rootNames.map((note, pitchClass) => (
              <option key={pitchClass} value={pitchClass}>
                {note}
              </option>
            ))}
          </select>
        </div>

        <div className="select-control scale-control">
          <label htmlFor="scale-type">Scale</label>
          <select
            id="scale-type"
            value={scaleId}
            onChange={(event) =>
              updateSelection({ scaleId: event.target.value as ScaleId })
            }
          >
            {Object.entries(SCALE_GROUP_LABELS).map(([groupId, label]) => (
              <optgroup key={groupId} label={label}>
                {Object.entries(SCALES)
                  .filter(([, definition]) => definition.group === groupId)
                  .map(([id, definition]) => (
                    <option key={id} value={id}>
                      {definition.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <fieldset className="segmented-control">
          <legend>Marker labels</legend>
          <label>
            <input
              type="radio"
              name="marker-label"
              value="notes"
              checked={markerLabel === "notes"}
              onChange={() => updateSelection({ markerLabel: "notes" })}
            />
            <span>Notes</span>
          </label>
          <label>
            <input
              type="radio"
              name="marker-label"
              value="degrees"
              checked={markerLabel === "degrees"}
              onChange={() => updateSelection({ markerLabel: "degrees" })}
            />
            <span>Degrees</span>
          </label>
        </fieldset>

        <fieldset className="segmented-control accidental-control">
          <legend>Accidentals</legend>
          <label>
            <input
              type="radio"
              name="accidentals"
              value="sharps"
              checked={accidentals === "sharps"}
              onChange={() => updateSelection({ accidentals: "sharps" })}
            />
            <span>Sharps</span>
          </label>
          <label>
            <input
              type="radio"
              name="accidentals"
              value="flats"
              checked={accidentals === "flats"}
              onChange={() => updateSelection({ accidentals: "flats" })}
            />
            <span>Flats</span>
          </label>
        </fieldset>

        <fieldset className="segmented-control">
          <legend>Handedness</legend>
          <label>
            <input
              type="radio"
              name="handedness"
              value="right"
              checked={handedness === "right"}
              onChange={() => updateSelection({ handedness: "right" })}
            />
            <span>Right</span>
          </label>
          <label>
            <input
              type="radio"
              name="handedness"
              value="left"
              checked={handedness === "left"}
              onChange={() => updateSelection({ handedness: "left" })}
            />
            <span>Left</span>
          </label>
        </fieldset>

        <fieldset className="segmented-control string-order-control">
          <legend>String order</legend>
          <label>
            <input
              type="radio"
              name="string-order"
              value="high-to-low"
              checked={stringOrder === "high-to-low"}
              onChange={() => updateSelection({ stringOrder: "high-to-low" })}
            />
            <span>High → low</span>
          </label>
          <label>
            <input
              type="radio"
              name="string-order"
              value="low-to-high"
              checked={stringOrder === "low-to-high"}
              onChange={() => updateSelection({ stringOrder: "low-to-high" })}
            />
            <span>Low → high</span>
          </label>
        </fieldset>
      </div>

      <div className="scale-summary">
        <div className="scale-identity">
          <p className="summary-label">Now viewing</p>
          <h2 id="current-scale">
            {rootNames[root]} {scale.name}
          </h2>
          <ol
            className="scale-sequence scale-note-sequence"
            aria-label="Scale notes"
          >
            {scaleNoteNames.map((note, index) => (
              <li key={`${note}-${scale.intervals[index]}`}>
                <button
                  type="button"
                  className={
                    activePitchClass === scalePitchClassList[index]
                      ? "active"
                      : undefined
                  }
                  aria-pressed={
                    selectedPitchClass === scalePitchClassList[index]
                  }
                  onClick={() => togglePitchClass(scalePitchClassList[index])}
                  onPointerEnter={() =>
                    setPreviewPitchClass(scalePitchClassList[index])
                  }
                  onPointerLeave={() => setPreviewPitchClass(null)}
                  onFocus={() =>
                    setPreviewPitchClass(scalePitchClassList[index])
                  }
                  onBlur={() => setPreviewPitchClass(null)}
                >
                  {note}
                </button>
              </li>
            ))}
          </ol>
          <ol
            className="scale-sequence scale-degree-sequence"
            aria-label="Scale degrees"
          >
            {scale.degrees.map((degree, index) => (
              <li key={degree}>
                <button
                  type="button"
                  className={
                    activePitchClass === scalePitchClassList[index]
                      ? "active"
                      : undefined
                  }
                  aria-pressed={
                    selectedPitchClass === scalePitchClassList[index]
                  }
                  onClick={() => togglePitchClass(scalePitchClassList[index])}
                  onPointerEnter={() =>
                    setPreviewPitchClass(scalePitchClassList[index])
                  }
                  onPointerLeave={() => setPreviewPitchClass(null)}
                  onFocus={() =>
                    setPreviewPitchClass(scalePitchClassList[index])
                  }
                  onBlur={() => setPreviewPitchClass(null)}
                >
                  {degree}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="legend" aria-label="Fretboard legend">
          <span>
            <i className="legend-root" />
            Root
          </span>
          <span>
            <i className="legend-note" />
            Scale note
          </span>
        </div>
      </div>

      <Fretboard
        root={root}
        scale={scale}
        scalePitchClasses={scalePitchClasses}
        markerLabel={markerLabel}
        accidentals={accidentals}
        handedness={handedness}
        stringOrder={stringOrder}
        activePitchClass={activePitchClass}
        selectedPitchClass={selectedPitchClass}
        onPreviewPitchClass={setPreviewPitchClass}
        onTogglePitchClass={togglePitchClass}
        onClearPitchClass={clearPitchClass}
      />
    </section>
  );
}
