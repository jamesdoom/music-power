import assert from "node:assert/strict";
import test from "node:test";

import { createChordDiagramModel } from "./chord-diagram";

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
