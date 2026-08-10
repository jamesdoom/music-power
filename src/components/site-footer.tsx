import Image from "next/image";

import { FRET_COUNT } from "@/lib/music-data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Image src="/icon.png" alt="" width={48} height={48} />
          <div>
            <strong>Music Power</strong>
            <p>Tools for focused guitar practice.</p>
          </div>
        </div>
        <div className="footer-details">
          <p>Standard tuning · Frets 0–{FRET_COUNT} · No account required</p>
          <small>© {new Date().getFullYear()} Music Power</small>
        </div>
      </div>
    </footer>
  );
}
