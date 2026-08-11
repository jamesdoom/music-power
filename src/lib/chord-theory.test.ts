import assert from "node:assert/strict";
import test from "node:test";

import { CHORDS, type ChordId } from "./chord-data";
import {
  getChordPitchClasses,
  getLowERootFret,
  getVoicingPitchClasses,
} from "./chord-theory";

test("common chord formulas produce the expected pitch classes", () => {
  assert.deepEqual(getChordPitchClasses(0, "major"), [0, 4, 7]);
  assert.deepEqual(getChordPitchClasses(9, "minor7"), [9, 0, 4, 7]);
  assert.deepEqual(getChordPitchClasses(7, "dominant7"), [7, 11, 2, 5]);
});

test("the low-E root position transposes and wraps chromatically", () => {
  assert.equal(getLowERootFret(4), 0);
  assert.equal(getLowERootFret(5), 1);
  assert.equal(getLowERootFret(3), 11);
});

test("every curated voicing contains only tones from its chord formula", () => {
  for (const chordId of Object.keys(CHORDS) as ChordId[]) {
    for (let root = 0; root < 12; root += 1) {
      const chordTones = new Set(getChordPitchClasses(root, chordId));
      const soundingTones = getVoicingPitchClasses(root, chordId).filter(
        (pitchClass): pitchClass is number => pitchClass !== null,
      );
      assert.ok(soundingTones.length > 0);
      assert.ok(
        soundingTones.every((pitchClass) => chordTones.has(pitchClass)),
        `${root} ${chordId} contains a non-chord tone`,
      );
      assert.ok(
        [...chordTones].every((pitchClass) =>
          soundingTones.includes(pitchClass),
        ),
        `${root} ${chordId} omits a required chord tone`,
      );
    }
  }
});
