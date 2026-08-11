"use client";

import { Suspense, useState, useSyncExternalStore } from "react";

import {
  getChordGroupSnapshot,
  getServerChordGroupSnapshot,
  snapshotOpensChordExplorer,
  subscribeToChordGroupSnapshot,
} from "@/lib/chord-group-state";

import { ChordExplorer } from "./chord-explorer";
import { ScaleExplorer } from "./scale-explorer";

export function PracticeExplorer() {
  const savedGroupSnapshot = useSyncExternalStore(
    subscribeToChordGroupSnapshot,
    getChordGroupSnapshot,
    getServerChordGroupSnapshot,
  );
  const [selectedMode, setSelectedMode] = useState<"scales" | "chords" | null>(
    null,
  );
  const mode =
    selectedMode ??
    (snapshotOpensChordExplorer(savedGroupSnapshot) ? "chords" : "scales");

  return (
    <>
      <nav className="explorer-mode" aria-label="Practice tool">
        <button
          type="button"
          aria-pressed={mode === "scales"}
          onClick={() => setSelectedMode("scales")}
        >
          Scale explorer
        </button>
        <button
          type="button"
          aria-pressed={mode === "chords"}
          onClick={() => setSelectedMode("chords")}
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
