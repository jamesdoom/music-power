import Image from "next/image";

import { PracticePulse } from "./practice-pulse";
import { PracticeExplorer } from "./practice-explorer";

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
            Explore the notes, shapes, and fingerings that power your playing.
          </p>
        </header>
        <PracticePulse />
      </div>
      <PracticeExplorer />
    </main>
  );
}
