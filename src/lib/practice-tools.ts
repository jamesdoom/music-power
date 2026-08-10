import { normalizePitchClass } from "./music-theory";

export function getTonicFrequency(rootPitchClass: number): number {
  const midiNote = 48 + normalizePitchClass(rootPitchClass);
  return 440 * 2 ** ((midiNote - 69) / 12);
}

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
