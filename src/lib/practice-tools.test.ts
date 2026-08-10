import assert from "node:assert/strict";
import test from "node:test";

import { formatDuration } from "./practice-tools";

test("practice durations use a stable minute clock", () => {
  assert.equal(formatDuration(300), "5:00");
  assert.equal(formatDuration(61), "1:01");
  assert.equal(formatDuration(-1), "0:00");
});
