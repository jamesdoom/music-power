import assert from "node:assert/strict";
import test from "node:test";

import {
  assignChordGroupIds,
  MAX_SAVED_CHORDS,
  parseChordGroup,
  serializeChordGroup,
} from "./chord-group-state";

test("chord groups round-trip in song order", () => {
  const group = [
    { root: 0, chordId: "major" as const },
    { root: 7, chordId: "dominant7" as const },
    { root: 9, chordId: "minor" as const },
  ];

  assert.equal(serializeChordGroup(group), "0.major,7.dominant7,9.minor");
  assert.deepEqual(parseChordGroup(serializeChordGroup(group)), group);
});

test("alternate voicings remain backward compatible in shared groups", () => {
  assert.deepEqual(parseChordGroup("11.major.low-a,0.major.inversion-1"), [
    { root: 11, chordId: "major", voicingKey: "low-a" },
    { root: 0, chordId: "major", voicingKey: "inversion-1" },
  ]);
  assert.equal(
    serializeChordGroup([{ root: 11, chordId: "major", voicingKey: "low-a" }]),
    "11.major.low-a",
  );
});

test("invalid shared chord entries are ignored safely", () => {
  assert.deepEqual(
    parseChordGroup("0.major,12.minor,nope.major,7.unknown,4.minor.extra"),
    [{ root: 0, chordId: "major" }],
  );
});

test("saved chord groups are bounded and receive fresh local ids", () => {
  const oversized = Array.from(
    { length: MAX_SAVED_CHORDS + 3 },
    () => "0.major",
  ).join(",");
  const parsed = parseChordGroup(oversized);

  assert.equal(parsed.length, MAX_SAVED_CHORDS);
  assert.deepEqual(assignChordGroupIds(parsed.slice(0, 2), 10), [
    { id: 10, root: 0, chordId: "major" },
    { id: 11, root: 0, chordId: "major" },
  ]);
});
