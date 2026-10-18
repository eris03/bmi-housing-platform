import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PlotThumb } from "@/components/PlotThumb";
import { SAMPLE_PROJECTS, availability } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

export default function Projects() {
  return (
    <>
      <SiteHeader />
      <main className="page">
        <header className="page-head">
          <p className="eyebrow"><span className="peg-dot" /> Browse freely</p>
          <h1>Projects</h1>
          <p className="lede">Every layout, every plot. Registration is only needed when you want us to contact you.</p>
        </header>
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
                  <div className="meter"><span style={{ width: `${(a.available / a.total) * 100}%` }} /></div>
                  <small>{a.available} of {a.total} plots open · {p.location}</small>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
