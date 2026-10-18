import Link from "next/link";
import { Logo } from "./Logo";

/** Split layout: illustrated survey panel + form card. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-art" aria-hidden="true">
        <Link href="/" className="auth-logo"><Logo /></Link>
        <svg viewBox="0 0 300 300" className="auth-survey">
          {[40, 80, 120, 160, 200, 240].map((r, i) => (
            <circle key={r} cx="150" cy="150" r={r / 2 + 20} className="ring" style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
          <path d="M150 20 V280 M20 150 H280" className="axis" />
          <path d="M150 40 L162 150 L150 260 L138 150Z" className="needle" />
          <text x="150" y="16" textAnchor="middle">N</text>
        </svg>
        <blockquote>
          “Every home begins<br />with a piece of land.”
        </blockquote>
      </aside>
      <main className="auth-main">
        <Link href="/projects" className="browse-link">← Keep browsing projects</Link>
        {children}
      </main>
    </div>
  );
}
