"use client";

import { useMemo, useState } from "react";

import { moveItem } from "@/lib/array-order";
import { CHORDS } from "@/lib/chord-data";
import type { ChordGroupItem } from "@/lib/chord-group-state";
import { compareChordVoicings } from "@/lib/voice-leading";
import { CompactChordDiagram } from "./compact-chord-diagram";

export type { ChordGroupItem } from "@/lib/chord-group-state";

type Props = {
  items: ChordGroupItem[];
  noteNames: readonly string[];
  onItemsChange: (items: ChordGroupItem[]) => void;
  onView: (item: ChordGroupItem) => void;
  onCopyLink: () => void;
  shareStatus: string;
};

export function ChordGroup({
  items,
  noteNames,
  onItemsChange,
  onView,
  onCopyLink,
  shareStatus,
}: Props) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [settledId, setSettledId] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [showVoiceLeading, setShowVoiceLeading] = useState(false);
  const transitions = useMemo(
    () =>
      items.map((item, index) =>
        index === 0 ? null : compareChordVoicings(items[index - 1], item),
      ),
    [items],
  );

  function move(fromIndex: number, toIndex: number, chordName: string) {
    onItemsChange(moveItem(items, fromIndex, toIndex));
    setAnnouncement(`${chordName} moved to position ${toIndex + 1}.`);
  }

  function drop(targetIndex: number) {
    const fromIndex = items.findIndex((item) => item.id === draggedId);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    const item = items[fromIndex];
    move(fromIndex, targetIndex, chordName(item, noteNames));
    setSettledId(item.id);
    setDraggedId(null);
    setDropTargetId(null);
  }

  return (
    <section className="chord-group" aria-labelledby="chord-group-title">
      <p className="sr-only" role="status" aria-live="polite">
        {shareStatus || announcement}
      </p>
      <div className="chord-group-heading">
        <div>
          <p className="summary-label">Play-along workspace</p>
          <h3 id="chord-group-title">Your chord group</h3>
        </div>
        {items.length > 0 && (
          <div className="chord-group-heading-actions">
            {items.length > 1 && (
              <button
                type="button"
                className="voice-leading-toggle"
                aria-pressed={showVoiceLeading}
                onClick={() => setShowVoiceLeading((current) => !current)}
              >
                Voice leading
              </button>
            )}
            <button
              type="button"
              className="share-chord-group"
              onClick={onCopyLink}
            >
              Copy link
            </button>
            <button
              type="button"
              className="clear-chord-group"
              onClick={() => onItemsChange([])}
            >
              Clear group
            </button>
          </div>
        )}
      </div>
      {items.length > 0 && (
        <p className="chord-reorder-help" id="chord-reorder-instructions">
          Drag a card header to reorder. Keyboard users can focus a header and
          use the left or right arrow key.
        </p>
      )}
      {items.length > 1 && showVoiceLeading && (
        <div className="voice-leading-legend" aria-label="Voice-leading legend">
          <span>
            <b aria-hidden="true">=</b> Held pitch
          </span>
          <span>
            <b aria-hidden="true">â†•</b> Smallest move
          </span>
        </div>
      )}
      {items.length === 0 ? (
        <p className="empty-chord-group">
          Add chords above to keep their fingerings together in song order.
        </p>
      ) : (
        <ol
          className="chord-group-list"
          aria-label="Selected chord progression"
        >
          {items.map((item, index) => {
            const name = chordName(item, noteNames);
            const transition = transitions[index];
            const previousName =
              index > 0 ? chordName(items[index - 1], noteNames) : "";
            const transitionLabel = transition
              ? `${previousName} to ${name}: ${transition.heldCount} held ${transition.heldCount === 1 ? "pitch" : "pitches"}${transition.smallestMove === null ? "" : `, smallest move ${transition.smallestMove} ${transition.smallestMove === 1 ? "semitone" : "semitones"}`}`
              : undefined;
            return (
              <li
                key={item.id}
                aria-posinset={index + 1}
                aria-setsize={items.length}
                className={[
                  draggedId === item.id ? "dragging" : "",
                  dropTargetId === item.id ? "drop-target" : "",
                  settledId === item.id ? "drop-settled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={() => {
                  if (draggedId !== null && draggedId !== item.id) {
                    setDropTargetId(item.id);
                  }
                }}
                onDrop={() => drop(index)}
              >
                <article
                  className="chord-group-card"
                  onAnimationEnd={() => setSettledId(null)}
                >
                  <header
                    draggable
                    tabIndex={0}
                    aria-describedby="chord-reorder-instructions"
                    aria-keyshortcuts="ArrowLeft ArrowRight"
                    aria-label={`Drag ${name} at position ${index + 1} to reorder. Use left and right arrow keys.`}
                    title="Drag card to reorder"
                    onDragStart={(event) => {
                      if ((event.target as HTMLElement).closest("button")) {
                        event.preventDefault();
                        return;
                      }
                      const card = event.currentTarget.closest("article");
                      if (card) event.dataTransfer.setDragImage(card, 24, 24);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(item.id));
                      setDraggedId(item.id);
                    }}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDropTargetId(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "ArrowLeft" && index > 0) {
                        event.preventDefault();
                        move(index, index - 1, name);
                      }
                      if (
                        event.key === "ArrowRight" &&
                        index < items.length - 1
                      ) {
                        event.preventDefault();
                        move(index, index + 1, name);
                      }
                    }}
                  >
                    <span
                      className="chord-order"
                      aria-label={`Chord ${index + 1}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4>{name}</h4>
                      <p>{CHORDS[item.chordId].name}</p>
                    </div>
                    <div className="chord-card-actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1, name)}
                        aria-label={`Move ${name} earlier`}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => move(index, index + 1, name)}
                        aria-label={`Move ${name} later`}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => onView(item)}
                        aria-label={`View ${name}`}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onItemsChange(
                            items.filter(
                              (candidate) => candidate.id !== item.id,
                            ),
                          )
                        }
                        aria-label={`Remove ${name} at position ${index + 1}`}
                      >
                        Remove
                      </button>
                    </div>
                  </header>
                  {showVoiceLeading && transition && (
                    <p className="voice-leading-summary">
                      <strong>
                        {previousName} â†’ {name}
                      </strong>
                      <span>
                        {transition.heldCount} held Â·{" "}
                        {transition.smallestMove ?? 0} semitone minimum
                      </span>
                    </p>
                  )}
                  <CompactChordDiagram
                    root={item.root}
                    chordId={item.chordId}
                    voicingKey={item.voicingKey}
                    noteNames={noteNames}
                    movements={
                      showVoiceLeading ? transition?.movements : undefined
                    }
                    transitionLabel={
                      showVoiceLeading ? transitionLabel : undefined
                    }
                  />
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function chordName(item: ChordGroupItem, noteNames: readonly string[]) {
  return `${noteNames[item.root]}${CHORDS[item.chordId].symbol}`;
}
