import { type ChordId, CHORDS } from "@/lib/chord-data";
import { getChordPitchClasses } from "@/lib/chord-theory";

type ChordSummaryProps = {
  root: number;
  chordId: ChordId;
  noteNames: readonly string[];
  onAdd: () => void;
};

export function ChordSummary({
  root,
  chordId,
  noteNames,
  onAdd,
}: ChordSummaryProps) {
  const chord = CHORDS[chordId];
  const chordName = `${noteNames[root]}${chord.symbol}`;
  return (
    <div className="scale-summary chord-summary">
      <div className="scale-identity">
        <p className="summary-label">Now viewing</p>
        <h2 id="current-chord">{chordName}</h2>
        <p className="chord-quality-name">{chord.name}</p>
        <ol className="scale-sequence" aria-label="Chord notes">
          {getChordPitchClasses(root, chordId).map((pitchClass) => (
            <li key={pitchClass}>
              <span>{noteNames[pitchClass]}</span>
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
        <button type="button" className="add-chord-button" onClick={onAdd}>
          Add {chordName} to group
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
  );
}
