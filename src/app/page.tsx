import Image from "next/image";

import { ScaleExplorer } from "@/components/scale-explorer";

export default function Home() {
  return (
    <main>
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
      <ScaleExplorer />
    </main>
  );
}
