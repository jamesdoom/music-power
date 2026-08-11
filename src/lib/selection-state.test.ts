import assert from "node:assert/strict";
import test from "node:test";

import { SCALES, type ScaleId } from "./music-data";
import {
  DEFAULT_SELECTION,
  parseSelection,
  serializeSelection,
  type ScaleSelection,
} from "./selection-state";

test("empty and invalid parameters use safe defaults", () => {
  assert.deepEqual(parseSelection(new URLSearchParams()), DEFAULT_SELECTION);
  assert.deepEqual(
    parseSelection(
      new URLSearchParams(
        "root=H&scale=nope&labels=x&accidentals=x&handedness=x&strings=x",
      ),
    ),
    DEFAULT_SELECTION,
  );
});

test("shareable parameters parse the requested scale", () => {
  assert.deepEqual(
    parseSelection(
      new URLSearchParams(
        "root=D&scale=blues&labels=notes&accidentals=flats&handedness=left&strings=low-to-high",
      ),
    ),
    {
      root: 2,
      scaleId: "blues",
      markerLabel: "notes",
      accidentals: "flats",
      handedness: "left",
      stringOrder: "low-to-high",
    },
  );
});

test("enharmonic root names parse to the same pitch class", () => {
  assert.equal(parseSelection(new URLSearchParams("root=C%23")).root, 1);
  assert.equal(parseSelection(new URLSearchParams("root=Db")).root, 1);
  assert.equal(parseSelection(new URLSearchParams("root=D♭")).root, 1);
});

test("serialization is canonical and preserves unrelated parameters", () => {
  const selection: ScaleSelection = {
    root: 1,
    scaleId: "minorPentatonic",
    markerLabel: "degrees",
    accidentals: "flats",
    handedness: "right",
    stringOrder: "high-to-low",
  };
  const params = serializeSelection(
    selection,
    new URLSearchParams("ref=teacher"),
  );
  assert.equal(params.get("root"), "Db");
  assert.equal(params.get("scale"), "minor-pentatonic");
  assert.equal(params.get("labels"), "degrees");
  assert.equal(params.get("ref"), "teacher");
  assert.deepEqual(parseSelection(params), selection);
});

test("every catalog scale round-trips through its shareable URL slug", () => {
  for (const scaleId of Object.keys(SCALES) as ScaleId[]) {
    const selection = { ...DEFAULT_SELECTION, scaleId };
    assert.deepEqual(parseSelection(serializeSelection(selection)), selection);
  }
});
