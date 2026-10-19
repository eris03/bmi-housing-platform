import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { HeroLandscape } from "@/components/HeroLandscape";
import { PlotThumb } from "@/components/PlotThumb";
import { SAMPLE_PROJECTS, availability } from "@/lib/projects";

const JOURNEY = [
  { n: "01", t: "Discover", d: "Browse projects, layouts and amenities. No sign-up needed." },
  { n: "02", t: "Enquire", d: "Share your name and mobile. Our team gets back to you." },
  { n: "03", t: "Visit", d: "Pick a day to walk the land with a BMI representative." },
  { n: "04", t: "Request", d: "Choose a plot and send a booking request for review." },
];

export default function Welcome() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="peg-dot" /> Welcome to BMI Housing Society
            </p>
            <h1>
              Your plot of land,
              <br />
              <em>your story</em> to build.
            </h1>
            <p className="lede">
              Walk through our layouts, see which plots are open, and talk to our team when you're ready. Start
              exploring now and register only when you need to.
            </p>
            <div className="hero-ctas">
              <Link href="/projects" className="btn btn-lg">
                Explore projects <span aria-hidden>→</span>
              </Link>
              <Link href="/register" className="btn btn-ghost btn-lg">
                Create account
              </Link>
            </div>
            <ul className="hero-facts">
              <li>
                <b>{SAMPLE_PROJECTS.length}</b> projects
              </li>
              <li>
                <b>{SAMPLE_PROJECTS.reduce((a, p) => a + availability(p).available, 0)}</b> plots open
              </li>
              <li>
                <b>0</b> sign-ups needed to browse
              </li>
            </ul>
          </div>
          <div className="hero-art">
            <HeroLandscape />
            <div className="coord-tag" aria-hidden="true">
              PLOT SURVEY · N ↑
            </div>
          </div>
        </section>

        <section className="journey" aria-labelledby="journey-h">
          <h2 id="journey-h" className="section-title">
            From first look to your own plot
          </h2>
          <ol className="journey-path">
            {JOURNEY.map((s) => (
              <li key={s.n}>
                <span className="journey-peg">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="featured" aria-labelledby="featured-h">
          <div className="section-head">
            <h2 id="featured-h" className="section-title">
              Our projects
            </h2>
            <Link href="/projects" className="link-arrow">
              See all →
            </Link>
          </div>
          <div className="card-grid">
            {SAMPLE_PROJECTS.map((p) => {
              const a = availability(p);
              return (
                <Link key={p.slug} href={`/p/${p.slug}`} className="project-card">
                  <PlotThumb project={p} />
                  <div className="project-card-body">
                    <span className="sample-tag">Sample</span>
                    <h3>{p.name}</h3>
                    <p>{p.tagline}</p>
                    <div className="meter" aria-label={`${a.available} of ${a.total} plots available`}>
                      <span style={{ width: `${(a.available / a.total) * 100}%` }} />
                    </div>
                    <small>
                      {a.available} of {a.total} plots open · {p.location}
                    </small>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="qr-banner">
          <div>
            <h2>Saw a BMI QR code?</h2>
            <p>
              Scanning it opens that project's page right here, with no app to install. You can enquire straight away.
            </p>
          </div>
          <svg viewBox="0 0 80 80" className="qr-glyph" aria-hidden="true">
            <rect x="4" y="4" width="24" height="24" rx="4" />
            <rect x="52" y="4" width="24" height="24" rx="4" />
            <rect x="4" y="52" width="24" height="24" rx="4" />
            <rect x="12" y="12" width="8" height="8" className="f" />
            <rect x="60" y="12" width="8" height="8" className="f" />
            <rect x="12" y="60" width="8" height="8" className="f" />
            <path d="M40 8v8M40 24v16H56M64 40h8M40 52v6h12v14M60 56h12M66 66v8" />
          </svg>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
