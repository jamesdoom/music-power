import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SONG_STRUCTURE,
  isDefaultSongStructure,
  parseSongStructure,
  serializeSongStructure,
} from "./song-structure-state";

test("song structure round-trips titles, sections, and repeats", () => {
  const structure = {
    title: "Midnight Drive",
    sections: [
      { id: "verse", name: "Verse", repeats: 2 },
      { id: "chorus", name: "Chorus", repeats: 3 },
    ],
  };
  assert.deepEqual(
    parseSongStructure(serializeSongStructure(structure)),
    structure,
  );
});

test("invalid song structure falls back safely", () => {
  assert.deepEqual(parseSongStructure("not-json"), DEFAULT_SONG_STRUCTURE);
  assert.deepEqual(
    parseSongStructure(JSON.stringify({ title: "Test", sections: [] })),
    { title: "Test", sections: DEFAULT_SONG_STRUCTURE.sections },
  );
});

test("only untouched metadata is considered the default", () => {
  assert.equal(isDefaultSongStructure(DEFAULT_SONG_STRUCTURE), true);
  assert.equal(
    isDefaultSongStructure({
      ...DEFAULT_SONG_STRUCTURE,
      title: "Practice song",
    }),
    false,
  );
});
