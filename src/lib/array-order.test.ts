import assert from "node:assert/strict";
import test from "node:test";

import { moveItem } from "./array-order";

test("moves an item earlier or later without mutating the source", () => {
  const source = ["C", "G", "Am", "F"];
  assert.deepEqual(moveItem(source, 2, 0), ["Am", "C", "G", "F"]);
  assert.deepEqual(moveItem(source, 0, 3), ["G", "Am", "F", "C"]);
  assert.deepEqual(source, ["C", "G", "Am", "F"]);
});

test("invalid and unchanged moves return an equivalent copy", () => {
  const source = ["C", "G"];
  assert.deepEqual(moveItem(source, 0, 0), source);
  assert.deepEqual(moveItem(source, -1, 1), source);
  assert.deepEqual(moveItem(source, 0, 2), source);
  assert.notEqual(moveItem(source, 0, 0), source);
});
