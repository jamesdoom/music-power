import assert from "node:assert/strict";
import test from "node:test";

import { CHORDS, type ChordId } from "./chord-data";
import {
  getChordPitchClasses,
  getChordVoicingOptions,
  getLowARootFret,
  getLowERootFret,
  getPreferredVoicing,
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

test("A-string root positions transpose and wrap chromatically", () => {
  assert.equal(getLowARootFret(9), 0);
  assert.equal(getLowARootFret(11), 2);
  assert.equal(getLowARootFret(8), 11);
});

test("familiar open shapes are preferred before movable fallbacks", () => {
  assert.equal(getPreferredVoicing(0, "major").name, "Open C");
  assert.equal(getPreferredVoicing(9, "minor").name, "Open A minor");
  assert.equal(getPreferredVoicing(1, "major").kind, "barre");
  assert.equal(getPreferredVoicing(11, "major").name, "Low-A root shape");
  assert.deepEqual(
    getPreferredVoicing(11, "major").strings.map((string) => string.fret),
    [null, 2, 4, 4, 4, 2],
  );
});

test("alternate voicings retain only chord tones and keep preferred first", () => {
  for (const chordId of Object.keys(CHORDS) as ChordId[]) {
    for (let root = 0; root < 12; root += 1) {
      const options = getChordVoicingOptions(root, chordId);
      assert.equal(
        options[0].voicing.name,
        getPreferredVoicing(root, chordId).name,
      );
      assert.ok(options.some((option) => option.category === "Inversion"));
      for (const option of options) {
        const chordTones = new Set(getChordPitchClasses(root, chordId));
        const sounding = getVoicingPitchClasses(
          root,
          chordId,
          option.voicing,
        ).filter((pitchClass): pitchClass is number => pitchClass !== null);
        assert.ok(
          sounding.every((pitchClass) => chordTones.has(pitchClass)),
          `${root} ${chordId} ${option.key} contains a non-chord tone`,
        );
      }
    }
  }
});

test("every preferred voicing contains only chord tones and all defining tones", () => {
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
      const requiredTones = getChordPitchClasses(root, chordId).filter(
        (_, index) => CHORDS[chordId].degrees[index] !== "5",
      );
      assert.ok(
        requiredTones.every((pitchClass) => soundingTones.includes(pitchClass)),
        `${root} ${chordId} omits a required chord tone`,
      );
    }
  }
});
