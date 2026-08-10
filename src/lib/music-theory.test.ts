import assert from "node:assert/strict";
import test from "node:test";

import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  FRET_COUNT,
  SCALES,
  STANDARD_TUNING,
} from "./music-data";
import {
  getFrettedPitchClass,
  getPitchClassName,
  getScaleDegree,
  getScalePitchClasses,
} from "./music-theory";

function scaleNames(root: number, intervals: readonly number[]): string[] {
  return getScalePitchClasses(root, intervals).map((pitchClass) =>
    getPitchClassName(pitchClass, "sharps"),
  );
}

test("C major contains C, D, E, F, G, A, and B", () => {
  assert.deepEqual(scaleNames(0, SCALES.major.intervals), [
    "C",
    "D",
    "E",
    "F",
    "G",
    "A",
    "B",
  ]);
});

test("A natural minor contains A, B, C, D, E, F, and G", () => {
  assert.deepEqual(scaleNames(9, SCALES.naturalMinor.intervals), [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
  ]);
});

test("E minor pentatonic contains E, G, A, B, and D", () => {
  assert.deepEqual(scaleNames(4, SCALES.minorPentatonic.intervals), [
    "E",
    "G",
    "A",
    "B",
    "D",
  ]);
});

test("a string advances chromatically and wraps after twelve frets", () => {
  assert.equal(getFrettedPitchClass(4, 0), 4);
  assert.equal(getFrettedPitchClass(4, 1), 5);
  assert.equal(getFrettedPitchClass(4, 11), 3);
  assert.equal(getFrettedPitchClass(4, 12), 4);
  assert.equal(getFrettedPitchClass(11, 1), 0);
});

test("the practice fretboard extends through fret twenty-two", () => {
  assert.equal(FRET_COUNT, 22);
});

test("fret twelve matches every open string", () => {
  for (const string of STANDARD_TUNING) {
    assert.equal(
      getFrettedPitchClass(string.pitchClass, 12),
      string.pitchClass,
    );
  }
});

test("every scale produces unique pitch classes and contains its root", () => {
  for (const scale of Object.values(SCALES)) {
    for (let root = 0; root < 12; root += 1) {
      const pitchClasses = getScalePitchClasses(root, scale.intervals);
      assert.equal(pitchClasses.length, scale.intervals.length);
      assert.equal(new Set(pitchClasses).size, pitchClasses.length);
      assert.ok(pitchClasses.includes(root));
    }
  }
});

test("enharmonic preferences preserve pitch classes", () => {
  assert.equal(getPitchClassName(1, "sharps"), "C♯");
  assert.equal(getPitchClassName(1, "flats"), "D♭");
  assert.equal(getPitchClassName(10, "sharps"), "A♯");
  assert.equal(getPitchClassName(10, "flats"), "B♭");
  assert.equal(CHROMATIC_SHARPS.length, CHROMATIC_FLATS.length);
});

test("blues scale degrees map to their pitch classes", () => {
  const dRoot = 2;
  const pitchClasses = getScalePitchClasses(dRoot, SCALES.blues.intervals);
  assert.deepEqual(
    pitchClasses.map((pitchClass) =>
      getScaleDegree(pitchClass, dRoot, SCALES.blues),
    ),
    ["1", "♭3", "4", "♭5", "5", "♭7"],
  );
});
