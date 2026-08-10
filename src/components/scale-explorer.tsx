"use client";

import { useMemo, useState } from "react";

import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  SCALES,
  type AccidentalPreference,
  type ScaleId,
} from "@/lib/music-data";
import { getScalePitchClasses } from "@/lib/music-theory";
import { Fretboard } from "./fretboard";

export type MarkerLabel = "notes" | "degrees";

type ScaleExplorerProps = {
  root: number;
  onRootChange: (root: number) => void;
};

export function ScaleExplorer({ root, onRootChange }: ScaleExplorerProps) {
  const [scaleId, setScaleId] = useState<ScaleId>("major");
  const [markerLabel, setMarkerLabel] = useState<MarkerLabel>("notes");
  const [accidentals, setAccidentals] =
    useState<AccidentalPreference>("sharps");

  const scale = SCALES[scaleId];
  const rootNames =
    accidentals === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  const scalePitchClasses = useMemo(
    () => new Set(getScalePitchClasses(root, scale.intervals)),
    [root, scale],
  );

  return (
    <section className="explorer" aria-labelledby="current-scale">
      <div className="controls">
        <div className="select-control">
          <label htmlFor="root-note">Root note</label>
          <select
            id="root-note"
            value={root}
            onChange={(event) => onRootChange(Number(event.target.value))}
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
            onChange={(event) => setScaleId(event.target.value as ScaleId)}
          >
            {Object.entries(SCALES).map(([id, definition]) => (
              <option key={id} value={id}>
                {definition.name}
              </option>
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
              onChange={() => setMarkerLabel("notes")}
            />
            <span>Notes</span>
          </label>
          <label>
            <input
              type="radio"
              name="marker-label"
              value="degrees"
              checked={markerLabel === "degrees"}
              onChange={() => setMarkerLabel("degrees")}
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
              onChange={() => setAccidentals("sharps")}
            />
            <span>Sharps</span>
          </label>
          <label>
            <input
              type="radio"
              name="accidentals"
              value="flats"
              checked={accidentals === "flats"}
              onChange={() => setAccidentals("flats")}
            />
            <span>Flats</span>
          </label>
        </fieldset>
      </div>

      <div className="scale-summary">
        <div>
          <p className="summary-label">Now viewing</p>
          <h2 id="current-scale">
            {rootNames[root]} {scale.name}
          </h2>
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
      />
    </section>
  );
}
