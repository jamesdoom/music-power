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
import {
  getServerSongStructureSnapshot,
  getSongStructureSnapshot,
  isDefaultSongStructure,
  parseSongStructure,
  SERVER_SONG_STRUCTURE_SNAPSHOT,
  serializeSongStructure,
  SONG_STRUCTURE_STORAGE_KEY,
  songStructureValueFromSnapshot,
  subscribeToSongStructureSnapshot,
  type SongStructure,
} from "@/lib/song-structure-state";
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
  const savedStructureSnapshot = useSyncExternalStore(
    subscribeToSongStructureSnapshot,
    getSongStructureSnapshot,
    getServerSongStructureSnapshot,
  );
  const restoredStructure = useMemo(
    () =>
      parseSongStructure(
        songStructureValueFromSnapshot(savedStructureSnapshot),
      ),
    [savedStructureSnapshot],
  );
  const [editedStructure, setEditedStructure] = useState<SongStructure | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState("main");
  const structure = editedStructure ?? restoredStructure;
  const activeSectionId = structure.sections.some(
    (section) => section.id === selectedSectionId,
  )
    ? selectedSectionId
    : structure.sections[0].id;
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

  useEffect(() => {
    if (savedStructureSnapshot === SERVER_SONG_STRUCTURE_SNAPSHOT) return;
    const value = serializeSongStructure(structure);
    const url = new URL(window.location.href);
    if (isDefaultSongStructure(structure)) {
      url.searchParams.delete("song");
    } else {
      url.searchParams.set("song", value);
    }
    window.history.replaceState(null, "", url);
    try {
      if (isDefaultSongStructure(structure)) {
        window.localStorage.removeItem(SONG_STRUCTURE_STORAGE_KEY);
      } else {
        window.localStorage.setItem(SONG_STRUCTURE_STORAGE_KEY, value);
      }
    } catch {
      // Shared URL metadata remains available when storage is blocked.
    }
  }, [savedStructureSnapshot, structure]);

  function addCurrentChord() {
    const nextId = chordGroup.reduce(
      (highest, item) => Math.max(highest, item.id + 1),
      1,
    );
    setEditedGroup([
      ...chordGroup,
      {
        id: nextId,
        root,
        chordId,
        sectionId: activeSectionId,
        ...(voicingKey ? { voicingKey } : {}),
      },
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
    if (!isDefaultSongStructure(structure)) {
      url.searchParams.set("song", serializeSongStructure(structure));
    }
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
        structure={structure}
        activeSectionId={activeSectionId}
        onStructureChange={setEditedStructure}
        onActiveSectionChange={setSelectedSectionId}
      />
    </section>
  );
}
