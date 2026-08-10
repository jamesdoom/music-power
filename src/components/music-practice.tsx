"use client";

import Image from "next/image";
import { useState } from "react";

import { PracticePulse } from "./practice-pulse";
import { ScaleExplorer } from "./scale-explorer";

export function MusicPractice() {
  const [root, setRoot] = useState(0);

  return (
    <main>
      <div className="hero-layout">
        <header className="hero">
          <p className="eyebrow">Guitar practice tool</p>
          <h1 className="brand-heading">
            <Image
              className="brand-logo"
              src="/brand/music-power-logo.png"
              alt="Music Power"
              width={1539}
              height={593}
              priority
            />
          </h1>
          <p className="lede">
            Choose a key and trace its shape across every string.
          </p>
        </header>
        <PracticePulse root={root} />
      </div>
      <ScaleExplorer root={root} onRootChange={setRoot} />
    </main>
  );
}
