import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  type AccidentalPreference,
  type ScaleDefinition,
} from "./music-data";

export const CHROMATIC_LENGTH = 12;

export function normalizePitchClass(value: number): number {
  return ((value % CHROMATIC_LENGTH) + CHROMATIC_LENGTH) % CHROMATIC_LENGTH;
}

export function getFrettedPitchClass(
  openPitchClass: number,
  fret: number,
): number {
  return normalizePitchClass(openPitchClass + fret);
}

export function getScalePitchClasses(
  rootPitchClass: number,
  intervals: readonly number[],
): number[] {
  return intervals.map((interval) =>
    normalizePitchClass(rootPitchClass + interval),
  );
}

export function getPitchClassName(
  pitchClass: number,
  preference: AccidentalPreference,
): string {
  const chromatic = preference === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  return chromatic[normalizePitchClass(pitchClass)];
}

export function getScaleDegree(
  pitchClass: number,
  rootPitchClass: number,
  scale: ScaleDefinition,
): string | undefined {
  const interval = normalizePitchClass(pitchClass - rootPitchClass);
  const index = scale.intervals.indexOf(interval);
  return index === -1 ? undefined : scale.degrees[index];
}
