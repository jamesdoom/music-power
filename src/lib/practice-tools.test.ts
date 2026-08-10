import assert from "node:assert/strict";
import test from "node:test";

import { formatDuration, getTonicFrequency } from "./practice-tools";

test("tonic frequency maps A to A3", () => {
  assert.equal(getTonicFrequency(9), 220);
});

test("tonic frequency wraps pitch classes", () => {
  assert.equal(getTonicFrequency(21), 220);
});

test("practice durations use a stable minute clock", () => {
  assert.equal(formatDuration(300), "5:00");
  assert.equal(formatDuration(61), "1:01");
  assert.equal(formatDuration(-1), "0:00");
});
