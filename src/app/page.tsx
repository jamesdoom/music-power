import { ScaleExplorer } from "@/components/scale-explorer";

export default function Home() {
  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Guitar practice tool</p>
        <h1>Scale Atlas</h1>
        <p className="lede">
          Choose a key and trace its shape across every string.
        </p>
      </header>
      <ScaleExplorer />
    </main>
  );
}
