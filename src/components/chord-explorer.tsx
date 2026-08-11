"use client";

import { useRef, useState } from "react";

import type { ChordId } from "@/lib/chord-data";
import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  type AccidentalPreference,
} from "@/lib/music-data";
import type { MarkerLabel } from "@/lib/selection-state";
import { ChordDiagram } from "./chord-diagram";
import { ChordGroup, type ChordGroupItem } from "./chord-group";
import { ChordSummary } from "./chord-summary";
import { ChordToolbar } from "./chord-toolbar";

export function ChordExplorer() {
  const [root, setRoot] = useState(0);
  const [chordId, setChordId] = useState<ChordId>("major");
  const [labels, setLabels] = useState<MarkerLabel>("notes");
  const [accidentals, setAccidentals] =
    useState<AccidentalPreference>("sharps");
  const [chordGroup, setChordGroup] = useState<ChordGroupItem[]>([]);
  const nextGroupId = useRef(1);
  const noteNames =
    accidentals === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

  function addCurrentChord() {
    setChordGroup((current) => [
      ...current,
      { id: nextGroupId.current, root, chordId },
    ]);
    nextGroupId.current += 1;
  }

  function viewChord(item: ChordGroupItem) {
    setRoot(item.root);
    setChordId(item.chordId);
  }

  return (
    <section
      className="explorer chord-explorer"
      aria-labelledby="current-chord"
    >
      <ChordToolbar
        root={root}
        chordId={chordId}
        labels={labels}
        accidentals={accidentals}
        noteNames={noteNames}
        onRootChange={setRoot}
        onChordChange={setChordId}
        onLabelsChange={setLabels}
        onAccidentalsChange={setAccidentals}
      />
      <ChordSummary
        root={root}
        chordId={chordId}
        noteNames={noteNames}
        onAdd={addCurrentChord}
      />
      <ChordDiagram
        root={root}
        chordId={chordId}
        labels={labels}
        noteNames={noteNames}
      />
      <ChordGroup
        items={chordGroup}
        noteNames={noteNames}
        onItemsChange={setChordGroup}
        onView={viewChord}
      />
    </section>
  );
}
