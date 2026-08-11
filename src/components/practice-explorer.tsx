"use client";

import { Suspense, useState } from "react";

import { ChordExplorer } from "./chord-explorer";
import { ScaleExplorer } from "./scale-explorer";

export function PracticeExplorer() {
  const [mode, setMode] = useState<"scales" | "chords">("scales");

  return (
    <>
      <nav className="explorer-mode" aria-label="Practice tool">
        <button
          type="button"
          aria-pressed={mode === "scales"}
          onClick={() => setMode("scales")}
        >
          Scale explorer
        </button>
        <button
          type="button"
          aria-pressed={mode === "chords"}
          onClick={() => setMode("chords")}
        >
          Chord explorer
        </button>
      </nav>
      {mode === "scales" ? (
        <Suspense
          fallback={
            <section
              className="explorer explorer-loading"
              aria-label="Loading scale explorer"
            >
              Loading fretboard…
            </section>
          }
        >
          <ScaleExplorer />
        </Suspense>
      ) : (
        <ChordExplorer />
      )}
    </>
  );
}
