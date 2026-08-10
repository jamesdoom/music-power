import assert from "node:assert/strict";
import test from "node:test";

import { SCALES } from "./music-data";
import {
  getFrettedPitchClass,
  getPitchClassName,
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
