import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PlotMap } from "@/components/PlotMap";
import { SAMPLE_PROJECTS, availability, getProject } from "@/lib/projects";
import { attributionQuery, parseAttribution } from "@/lib/attribution";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string; cmp?: string }>;
};

export function generateStaticParams() {
  return SAMPLE_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.name, description: p.tagline } : {};
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const attribution = parseAttribution(await searchParams);
  const enquireHref = `/register?${attributionQuery(project.slug, attribution)}`;
  const a = availability(project);

  return (
    <>
      <SiteHeader />
      <main className={`page project hue-${project.hue}`}>
        {attribution.source === "QR_CODE" && (
          <div className="qr-welcome" role="status">
            <span aria-hidden>📍</span> Welcome! You scanned the QR code for <strong>{project.name}</strong>.
          </div>
        )}
        <header className="project-hero">
          <div>
            <span className="sample-tag">Sample content</span>
            <h1>{project.name}</h1>
            <p className="tagline">{project.tagline}</p>
            <p className="location">⌖ {project.location}</p>
          </div>
          <div className="project-stats">
            <div>
              <b>{a.available}</b>
              <span>plots open</span>
            </div>
            <div>
              <b>{a.total}</b>
              <span>total plots</span>
            </div>
            <div>
              <b>{project.pricePublic ? "Listed" : "On request"}</b>
              <span>pricing</span>
            </div>
          </div>
        </header>

        <section className="project-body">
          <div className="project-about">
            <h2 className="section-title">About the layout</h2>
            <p>{project.description}</p>
            <h3 className="mini-title">Amenities</h3>
            <ul className="amenities">
              {project.amenities.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="project-map">
            <h2 className="section-title">Layout map</h2>
            <PlotMap project={project} enquireHref={enquireHref} />
          </div>
        </section>
      </main>

      <div className="sticky-cta">
        <div>
          <strong>Interested in {project.name}?</strong>
          <span>Leave your number and our team will call you.</span>
        </div>
        <Link className="btn" href={enquireHref}>
          Enquire now
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
