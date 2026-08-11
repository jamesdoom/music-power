import {
  CHROMATIC_FLATS,
  CHROMATIC_SHARPS,
  SCALES,
  type AccidentalPreference,
  type ScaleId,
} from "./music-data";

export type MarkerLabel = "notes" | "degrees";
export type Handedness = "right" | "left";
export type StringOrder = "high-to-low" | "low-to-high";

export type ScaleSelection = {
  root: number;
  scaleId: ScaleId;
  markerLabel: MarkerLabel;
  accidentals: AccidentalPreference;
  handedness: Handedness;
  stringOrder: StringOrder;
};

export const DEFAULT_SELECTION: ScaleSelection = {
  root: 0,
  scaleId: "major",
  markerLabel: "notes",
  accidentals: "sharps",
  handedness: "right",
  stringOrder: "high-to-low",
};

const SCALE_IDS_BY_SLUG = new Map<string, ScaleId>(
  Object.entries(SCALES).map(([id, scale]) => [scale.slug, id as ScaleId]),
);

const ROOTS_BY_NAME = new Map<string, number>();
for (let pitchClass = 0; pitchClass < 12; pitchClass += 1) {
  for (const name of [
    CHROMATIC_SHARPS[pitchClass],
    CHROMATIC_FLATS[pitchClass],
  ]) {
    ROOTS_BY_NAME.set(normalizeRootName(name), pitchClass);
  }
}

function normalizeRootName(value: string): string {
  return value.trim().toLowerCase().replaceAll("♯", "#").replaceAll("♭", "b");
}

function queryRootName(
  pitchClass: number,
  preference: AccidentalPreference,
): string {
  const names = preference === "flats" ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  return names[pitchClass].replace("♯", "#").replace("♭", "b");
}

function isOneOf<T extends string>(
  value: string | null,
  choices: readonly T[],
): value is T {
  return value !== null && choices.includes(value as T);
}

export function parseSelection(
  params: Pick<URLSearchParams, "get">,
): ScaleSelection {
  const rootParam = params.get("root");
  const parsedRoot = rootParam
    ? ROOTS_BY_NAME.get(normalizeRootName(rootParam))
    : undefined;
  const scaleId = SCALE_IDS_BY_SLUG.get(params.get("scale") ?? "");
  const labels = params.get("labels");
  const accidentals = params.get("accidentals");
  const handedness = params.get("handedness");
  const stringOrder = params.get("strings");

  return {
    root: parsedRoot ?? DEFAULT_SELECTION.root,
    scaleId: scaleId ?? DEFAULT_SELECTION.scaleId,
    markerLabel: isOneOf(labels, ["notes", "degrees"])
      ? labels
      : DEFAULT_SELECTION.markerLabel,
    accidentals: isOneOf(accidentals, ["sharps", "flats"])
      ? accidentals
      : DEFAULT_SELECTION.accidentals,
    handedness: isOneOf(handedness, ["right", "left"])
      ? handedness
      : DEFAULT_SELECTION.handedness,
    stringOrder: isOneOf(stringOrder, ["high-to-low", "low-to-high"])
      ? stringOrder
      : DEFAULT_SELECTION.stringOrder,
  };
}

export function serializeSelection(
  selection: ScaleSelection,
  params = new URLSearchParams(),
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set("root", queryRootName(selection.root, selection.accidentals));
  next.set("scale", SCALES[selection.scaleId].slug);
  next.set("labels", selection.markerLabel);
  next.set("accidentals", selection.accidentals);
  next.set("handedness", selection.handedness);
  next.set("strings", selection.stringOrder);
  return next;
}
