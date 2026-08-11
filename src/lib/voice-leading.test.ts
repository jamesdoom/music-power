import assert from "node:assert/strict";
import test from "node:test";

import { compareChordVoicings } from "./voice-leading";

test("voice leading identifies held pitches and the nearest moving voices", () => {
  const transition = compareChordVoicings(
    { root: 0, chordId: "major" },
    { root: 7, chordId: "major" },
  );

  assert.ok(transition.heldCount > 0);
  assert.equal(transition.smallestMove, 1);
  assert.ok(
    transition.movements.some((movement) => movement?.status === "closest"),
  );
});

test("voice leading respects selected inversion pitches", () => {
  const preferred = compareChordVoicings(
    { root: 0, chordId: "major" },
    { root: 9, chordId: "minor" },
  );
  const inverted = compareChordVoicings(
    { root: 0, chordId: "major" },
    { root: 9, chordId: "minor", voicingKey: "inversion-1" },
  );

  assert.notDeepEqual(inverted.movements, preferred.movements);
});
