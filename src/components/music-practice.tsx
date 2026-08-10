import Image from "next/image";
import { Suspense } from "react";

import { PracticePulse } from "./practice-pulse";
import { ScaleExplorer } from "./scale-explorer";

export function MusicPractice() {
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
        <PracticePulse />
      </div>
      <Suspense
        fallback={
          <section
            className="explorer explorer-loading"
            aria-label="Loading scale explorer"
          >
            Loading fretboard…
          </section>
        }
      >
        <ScaleExplorer />
      </Suspense>
    </main>
  );
}
