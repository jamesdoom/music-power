"use client";

import { useState } from "react";

import type { SongStructure } from "@/lib/song-structure-state";

type Props = {
  structure: SongStructure;
  activeSectionId: string;
  onTitleChange: (title: string) => void;
  onActiveSectionChange: (sectionId: string) => void;
  onRepeatChange: (sectionId: string, repeats: number) => void;
  onAddSection: (name: string) => void;
};

export function SongStructureControls({
  structure,
  activeSectionId,
  onTitleChange,
  onActiveSectionChange,
  onRepeatChange,
  onAddSection,
}: Props) {
  const [newSectionName, setNewSectionName] = useState("");
  const activeSection =
    structure.sections.find((section) => section.id === activeSectionId) ??
    structure.sections[0];

  function addSection() {
    const name = newSectionName.trim();
    if (!name) return;
    onAddSection(name);
    setNewSectionName("");
  }

  return (
    <div className="song-structure-controls" aria-label="Song structure">
      <div className="song-title-control">
        <label htmlFor="song-title">Song title</label>
        <input
          id="song-title"
          value={structure.title}
          maxLength={80}
          placeholder="Untitled song"
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="active-song-section">Add chords to</label>
        <select
          id="active-song-section"
          value={activeSection.id}
          onChange={(event) => onActiveSectionChange(event.target.value)}
        >
          {structure.sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="section-repeats">Section repeats</label>
        <select
          id="section-repeats"
          value={activeSection.repeats}
          onChange={(event) =>
            onRepeatChange(activeSection.id, Number(event.target.value))
          }
        >
          {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count}×
            </option>
          ))}
        </select>
      </div>
      <div className="new-section-control">
        <label htmlFor="new-section-name">New section</label>
        <div>
          <input
            id="new-section-name"
            value={newSectionName}
            maxLength={32}
            placeholder="Chorus"
            onChange={(event) => setNewSectionName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSection();
              }
            }}
          />
          <button
            type="button"
            disabled={!newSectionName.trim()}
            onClick={addSection}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
