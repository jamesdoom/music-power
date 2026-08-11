import assert from "node:assert/strict";
import test from "node:test";

import { createChordDiagramModel } from "./chord-diagram";
import { CHORDS, type ChordId } from "./chord-data";
import { getChordVoicingOptions } from "./chord-theory";

test("diagram model presents strings high-to-low from one voicing source", () => {
  const cMajor = createChordDiagramModel(0, "major");
  assert.deepEqual(
    cMajor.strings.map((string) => string.fret),
    [0, 1, 0, 2, 3, null],
  );
  assert.deepEqual(
    cMajor.strings.map((string) => string.stringNumber),
    [1, 2, 3, 4, 5, 6],
  );
  assert.equal(cMajor.voicing.name, "Open C");
});

test("every alternate voicing fits inside its displayed fret window", () => {
  for (const chordId of Object.keys(CHORDS) as ChordId[]) {
    for (let root = 0; root < 12; root += 1) {
      for (const option of getChordVoicingOptions(root, chordId)) {
        const model = createChordDiagramModel(root, chordId, option.key);
        assert.ok(
          model.strings.every(
            (string) =>
              string.fret === null || model.frets.includes(string.fret),
          ),
          `${root} ${chordId} ${option.key} exceeds the diagram`,
        );
      }
    }
  }
});

test("diagram model retains the nearest-position B major shape", () => {
  const bMajor = createChordDiagramModel(11, "major");
  assert.deepEqual(
    bMajor.strings.map((string) => string.fret),
    [2, 4, 4, 4, 2, null],
  );
  assert.equal(bMajor.rootFret, 2);
  assert.equal(bMajor.voicing.name, "Low-A root shape");
  assert.ok(
    bMajor.strings.every((string) => string.fret === null || string.degree),
  );
});

test("diagram model renders a requested inversion without losing chord tones", () => {
  const inversion = createChordDiagramModel(0, "major", "inversion-1");
  assert.equal(inversion.voicing.name, "First inversion");
  assert.equal(inversion.option.category, "Inversion");
  assert.deepEqual(
    [
      ...new Set(
        inversion.strings.flatMap((string) =>
          string.pitchClass === null ? [] : [string.pitchClass],
        ),
      ),
    ].sort((first, second) => first - second),
    [0, 4, 7],
  );
  assert.ok(
    inversion.strings.every(
      (string) => string.fret === null || inversion.frets.includes(string.fret),
    ),
  );
});
