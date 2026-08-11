import { CHORDS, type ChordId } from "./chord-data";

export const CHORD_GROUP_STORAGE_KEY = "music-power:chord-group:v1";
export const MAX_SAVED_CHORDS = 32;
export const SERVER_CHORD_GROUP_SNAPSHOT = "server";

export type SavedChord = {
  root: number;
  chordId: ChordId;
  voicingKey?: string;
};
export type ChordGroupItem = SavedChord & { id: number };

function isChordId(value: string): value is ChordId {
  return value in CHORDS;
}

function isVoicingKey(value: string | undefined, chordId: ChordId): boolean {
  if (value === undefined) return true;
  if (["open", "low-a", "low-e"].includes(value)) return true;
  const match = /^inversion-(\d+)$/.exec(value);
  return Boolean(
    match &&
    Number(match[1]) > 0 &&
    Number(match[1]) < CHORDS[chordId].intervals.length,
  );
}

export function parseChordGroup(value: string | null): SavedChord[] {
  if (!value) return [];

  return value
    .split(",")
    .slice(0, MAX_SAVED_CHORDS)
    .flatMap((entry) => {
      const [rootValue, chordId, voicingKey, ...extra] = entry.split(".");
      const root = Number(rootValue);
      return extra.length === 0 &&
        Number.isInteger(root) &&
        root >= 0 &&
        root < 12 &&
        chordId &&
        isChordId(chordId) &&
        isVoicingKey(voicingKey, chordId)
        ? [{ root, chordId, ...(voicingKey ? { voicingKey } : {}) }]
        : [];
    });
}

export function serializeChordGroup(items: readonly SavedChord[]): string {
  return items
    .slice(0, MAX_SAVED_CHORDS)
    .map(({ root, chordId, voicingKey }) =>
      [root, chordId, voicingKey]
        .filter((value) => value !== undefined)
        .join("."),
    )
    .join(",");
}

export function assignChordGroupIds(
  items: readonly SavedChord[],
  startingId = 1,
): ChordGroupItem[] {
  return items.map((item, index) => ({ ...item, id: startingId + index }));
}

export function getChordGroupSnapshot(): string {
  const params = new URLSearchParams(window.location.search);
  const sharedValue = params.get("chords");
  if (sharedValue !== null) return `url:${sharedValue}`;

  let savedValue: string | null = null;
  try {
    savedValue = window.localStorage.getItem(CHORD_GROUP_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy-focused browser contexts.
  }
  if (savedValue) return `local:${savedValue}`;
  return params.get("tool") === "chords" ? "tool:" : "none:";
}

export function getServerChordGroupSnapshot(): string {
  return SERVER_CHORD_GROUP_SNAPSHOT;
}

export function subscribeToChordGroupSnapshot(): () => void {
  return () => undefined;
}

export function chordGroupValueFromSnapshot(snapshot: string): string | null {
  if (snapshot === SERVER_CHORD_GROUP_SNAPSHOT || snapshot === "none:") {
    return null;
  }
  return snapshot.slice(snapshot.indexOf(":") + 1);
}

export function snapshotOpensChordExplorer(snapshot: string): boolean {
  return snapshot !== SERVER_CHORD_GROUP_SNAPSHOT && snapshot !== "none:";
}
