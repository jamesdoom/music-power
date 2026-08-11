import assert from "node:assert/strict";
import test from "node:test";

import { SCALE_GROUP_LABELS, SCALES, type ScaleId } from "./music-data";

const EXPECTED_INTERVALS: Record<ScaleId, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorianFlat2: [0, 1, 3, 5, 7, 9, 10],
  lydianAugmented: [0, 2, 4, 6, 8, 9, 11],
  lydianDominant: [0, 2, 4, 6, 7, 9, 10],
  mixolydianFlat6: [0, 2, 4, 5, 7, 8, 10],
  locrianSharp2: [0, 2, 3, 5, 6, 8, 10],
  altered: [0, 1, 3, 4, 6, 8, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  diminishedWholeHalf: [0, 2, 3, 5, 6, 8, 9, 11],
  diminishedHalfWhole: [0, 1, 3, 4, 6, 7, 9, 10],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  suspendedPentatonic: [0, 2, 5, 7, 10],
  dominantPentatonic: [0, 2, 4, 7, 10],
  inSen: [0, 1, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  bebopMajor: [0, 2, 4, 5, 7, 8, 9, 11],
  bebopMinor: [0, 2, 3, 4, 5, 7, 9, 10],
  bebopDominant: [0, 2, 4, 5, 7, 9, 10, 11],
  bebopMelodicMinor: [0, 2, 3, 5, 7, 8, 9, 11],
  harmonicMajor: [0, 2, 4, 5, 7, 8, 11],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  doubleHarmonicMajor: [0, 1, 4, 5, 7, 8, 11],
};

test("the scale catalog contains every requested interval formula", () => {
  for (const [id, expected] of Object.entries(EXPECTED_INTERVALS)) {
    assert.deepEqual(SCALES[id as ScaleId].intervals, expected, id);
  }
  assert.equal(
    Object.keys(SCALES).length,
    Object.keys(EXPECTED_INTERVALS).length,
  );
});

test("every scale has aligned degrees, a unique slug, and a known group", () => {
  const slugs = new Set<string>();

  for (const scale of Object.values(SCALES)) {
    assert.equal(scale.degrees.length, scale.intervals.length, scale.name);
    assert.ok(scale.group in SCALE_GROUP_LABELS, scale.name);
    assert.ok(!slugs.has(scale.slug), scale.slug);
    slugs.add(scale.slug);
  }
});
