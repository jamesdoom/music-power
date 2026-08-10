export type MarkerPosition = {
  row: number;
  column: number;
};

export type NavigationKey =
  "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

export function findNextMarkerIndex(
  markers: readonly MarkerPosition[],
  currentIndex: number,
  key: NavigationKey,
): number {
  const current = markers[currentIndex];

  if (!current) return currentIndex;

  if (key === "Home" || key === "End") {
    const rowMarkers = markers
      .map((marker, index) => ({ marker, index }))
      .filter(({ marker }) => marker.row === current.row);

    return key === "Home" ? rowMarkers[0].index : rowMarkers.at(-1)!.index;
  }

  if (key === "ArrowLeft" || key === "ArrowRight") {
    const direction = key === "ArrowLeft" ? -1 : 1;
    const candidates = markers
      .map((marker, index) => ({ marker, index }))
      .filter(
        ({ marker }) =>
          marker.row === current.row &&
          Math.sign(marker.column - current.column) === direction,
      )
      .sort(
        (a, b) =>
          Math.abs(a.marker.column - current.column) -
          Math.abs(b.marker.column - current.column),
      );

    return candidates[0]?.index ?? currentIndex;
  }

  const direction = key === "ArrowUp" ? -1 : 1;
  const targetRows = [...new Set(markers.map(({ row }) => row))]
    .filter((row) => Math.sign(row - current.row) === direction)
    .sort((a, b) => Math.abs(a - current.row) - Math.abs(b - current.row));

  for (const row of targetRows) {
    const candidates = markers
      .map((marker, index) => ({ marker, index }))
      .filter(({ marker }) => marker.row === row)
      .sort(
        (a, b) =>
          Math.abs(a.marker.column - current.column) -
          Math.abs(b.marker.column - current.column),
      );

    if (candidates[0]) return candidates[0].index;
  }

  return currentIndex;
}
