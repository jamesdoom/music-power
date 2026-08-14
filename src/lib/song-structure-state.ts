export const SONG_STRUCTURE_STORAGE_KEY = "music-power:song-structure:v1";
export const SERVER_SONG_STRUCTURE_SNAPSHOT = "server";
export const MAX_SONG_SECTIONS = 8;

export type SongSection = { id: string; name: string; repeats: number };
export type SongStructure = { title: string; sections: SongSection[] };

export const DEFAULT_SONG_STRUCTURE: SongStructure = {
  title: "",
  sections: [{ id: "main", name: "Main", repeats: 1 }],
};

function normalizeStructure(value: unknown): SongStructure {
  if (!value || typeof value !== "object") return DEFAULT_SONG_STRUCTURE;
  const candidate = value as Partial<SongStructure>;
  const sections = Array.isArray(candidate.sections)
    ? candidate.sections.slice(0, MAX_SONG_SECTIONS).flatMap((section) => {
        if (!section || typeof section !== "object") return [];
        const item = section as Partial<SongSection>;
        const id = typeof item.id === "string" ? item.id.trim() : "";
        const name = typeof item.name === "string" ? item.name.trim() : "";
        const repeats = Number(item.repeats);
        return id &&
          name &&
          Number.isInteger(repeats) &&
          repeats >= 1 &&
          repeats <= 8
          ? [{ id: id.slice(0, 24), name: name.slice(0, 32), repeats }]
          : [];
      })
    : [];
  return {
    title:
      typeof candidate.title === "string" ? candidate.title.slice(0, 80) : "",
    sections: sections.length > 0 ? sections : DEFAULT_SONG_STRUCTURE.sections,
  };
}

export function parseSongStructure(value: string | null): SongStructure {
  if (!value) return DEFAULT_SONG_STRUCTURE;
  try {
    return normalizeStructure(JSON.parse(value));
  } catch {
    return DEFAULT_SONG_STRUCTURE;
  }
}

export function serializeSongStructure(structure: SongStructure): string {
  return JSON.stringify(normalizeStructure(structure));
}

export function isDefaultSongStructure(structure: SongStructure): boolean {
  return (
    structure.title === "" &&
    structure.sections.length === 1 &&
    structure.sections[0].id === "main" &&
    structure.sections[0].name === "Main" &&
    structure.sections[0].repeats === 1
  );
}

export function getSongStructureSnapshot(): string {
  const params = new URLSearchParams(window.location.search);
  const shared = params.get("song");
  if (shared !== null) return `url:${shared}`;
  try {
    const saved = window.localStorage.getItem(SONG_STRUCTURE_STORAGE_KEY);
    if (saved) return `local:${saved}`;
  } catch {
    // URL state remains available when storage is blocked.
  }
  return "none:";
}

export function getServerSongStructureSnapshot(): string {
  return SERVER_SONG_STRUCTURE_SNAPSHOT;
}

export function subscribeToSongStructureSnapshot(): () => void {
  return () => undefined;
}

export function songStructureValueFromSnapshot(
  snapshot: string,
): string | null {
  if (snapshot === SERVER_SONG_STRUCTURE_SNAPSHOT || snapshot === "none:") {
    return null;
  }
  return snapshot.slice(snapshot.indexOf(":") + 1);
}
