import { CHORDS, type ChordId } from "@/lib/chord-data";
import type { AccidentalPreference } from "@/lib/music-data";
import type { MarkerLabel } from "@/lib/selection-state";

type ChordToolbarProps = {
  root: number;
  chordId: ChordId;
  labels: MarkerLabel;
  accidentals: AccidentalPreference;
  noteNames: readonly string[];
  onRootChange: (root: number) => void;
  onChordChange: (chordId: ChordId) => void;
  onLabelsChange: (labels: MarkerLabel) => void;
  onAccidentalsChange: (preference: AccidentalPreference) => void;
};

export function ChordToolbar(props: ChordToolbarProps) {
  return (
    <div className="controls chord-controls">
      <div className="select-control">
        <label htmlFor="chord-root">Root note</label>
        <select
          id="chord-root"
          value={props.root}
          onChange={(event) => props.onRootChange(Number(event.target.value))}
        >
          {props.noteNames.map((note, pitchClass) => (
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
          value={props.chordId}
          onChange={(event) =>
            props.onChordChange(event.target.value as ChordId)
          }
        >
          {Object.entries(CHORDS).map(([id, chord]) => (
            <option key={id} value={id}>
              {chord.name}
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
              checked={props.labels === value}
              onChange={() => props.onLabelsChange(value)}
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
              checked={props.accidentals === value}
              onChange={() => props.onAccidentalsChange(value)}
            />
            <span>{value === "sharps" ? "Sharps" : "Flats"}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
