import assert from "node:assert/strict";
import test from "node:test";

import { findNextMarkerIndex } from "./fretboard-navigation";

const markers = [
  { row: 0, column: 1 },
  { row: 0, column: 4 },
  { row: 0, column: 8 },
  { row: 1, column: 0 },
  { row: 1, column: 5 },
  { row: 2, column: 3 },
];

test("horizontal navigation follows markers in the current string", () => {
  assert.equal(findNextMarkerIndex(markers, 1, "ArrowLeft"), 0);
  assert.equal(findNextMarkerIndex(markers, 1, "ArrowRight"), 2);
  assert.equal(findNextMarkerIndex(markers, 0, "ArrowLeft"), 0);
});

test("vertical navigation chooses the closest fret on the next string", () => {
  assert.equal(findNextMarkerIndex(markers, 1, "ArrowDown"), 4);
  assert.equal(findNextMarkerIndex(markers, 4, "ArrowDown"), 5);
  assert.equal(findNextMarkerIndex(markers, 0, "ArrowUp"), 0);
});

test("home and end move to the first and last marker on a string", () => {
  assert.equal(findNextMarkerIndex(markers, 1, "Home"), 0);
  assert.equal(findNextMarkerIndex(markers, 1, "End"), 2);
});
