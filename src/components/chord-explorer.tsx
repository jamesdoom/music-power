"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import type { ChordId } from "@/lib/chord-data";
import {
  assignChordGroupIds,
  CHORD_GROUP_STORAGE_KEY,
  chordGroupValueFromSnapshot,
  getChordGroupSnapshot,
  getServerChordGroupSnapshot,
  parseChordGroup,
  SERVER_CHORD_GROUP_SNAPSHOT,
  serializeChordGroup,
  subscribeToChordGroupSnapshot,
  type ChordGroupItem,
} from "@/lib/chord-group-state";
import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  type AccidentalPreference,
} from "@/lib/music-data";
import type { MarkerLabel } from "@/lib/selection-state";
import { ChordDiagram } from "./chord-diagram";
import { ChordGroup } from "./chord-group";
import { ChordSummary } from "./chord-summary";
import { ChordToolbar } from "./chord-toolbar";

export function ChordExplorer() {
  const [root, setRoot] = useState(0);
  const [chordId, setChordId] = useState<ChordId>("major");
  const [voicingKey, setVoicingKey] = useState<string | undefined>();
  const [labels, setLabels] = useState<MarkerLabel>("notes");
  const [accidentals, setAccidentals] =
    useState<AccidentalPreference>("sharps");
  const savedGroupSnapshot = useSyncExternalStore(
    subscribeToChordGroupSnapshot,
    getChordGroupSnapshot,
    getServerChordGroupSnapshot,
  );
  const restoredGroup = useMemo(
    () =>
      assignChordGroupIds(
        parseChordGroup(chordGroupValueFromSnapshot(savedGroupSnapshot)),
      ),
    [savedGroupSnapshot],
  );
  const [editedGroup, setEditedGroup] = useState<ChordGroupItem[] | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const chordGroup = editedGroup ?? restoredGroup;
  const noteNames =
    accidentals === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

  useEffect(() => {
    if (savedGroupSnapshot === SERVER_CHORD_GROUP_SNAPSHOT) return;

    const value = serializeChordGroup(chordGroup);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("chords", value);
      url.searchParams.set("tool", "chords");
    } else {
      url.searchParams.delete("chords");
    }
    window.history.replaceState(null, "", url);

    try {
      if (value) {
        window.localStorage.setItem(CHORD_GROUP_STORAGE_KEY, value);
      } else {
        window.localStorage.removeItem(CHORD_GROUP_STORAGE_KEY);
      }
    } catch {
      // The URL remains a durable fallback when storage is unavailable.
    }
  }, [chordGroup, savedGroupSnapshot]);

  function addCurrentChord() {
    const nextId = chordGroup.reduce(
      (highest, item) => Math.max(highest, item.id + 1),
      1,
    );
    setEditedGroup([
      ...chordGroup,
      { id: nextId, root, chordId, ...(voicingKey ? { voicingKey } : {}) },
    ]);
  }

  function viewChord(item: ChordGroupItem) {
    setRoot(item.root);
    setChordId(item.chordId);
    setVoicingKey(item.voicingKey);
  }

  async function copyShareLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("chords", serializeChordGroup(chordGroup));
    url.searchParams.set("tool", "chords");
    window.history.replaceState(null, "", url);

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Chord group link copied.");
    } catch {
      setShareStatus("Could not copy automatically. Copy the current address.");
    }
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
        onRootChange={(value) => {
          setRoot(value);
          setVoicingKey(undefined);
        }}
        onChordChange={(value) => {
          setChordId(value);
          setVoicingKey(undefined);
        }}
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
        voicingKey={voicingKey}
        onVoicingChange={setVoicingKey}
      />
      <ChordGroup
        items={chordGroup}
        noteNames={noteNames}
        onItemsChange={setEditedGroup}
        onView={viewChord}
        onCopyLink={copyShareLink}
        shareStatus={shareStatus}
      />
    </section>
  );
}
