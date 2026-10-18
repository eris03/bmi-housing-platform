"use client";

// Staff tool: generate printable QR codes that open a project page with
// QR attribution. Moves under /admin behind auth once staff login exists.

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { SiteHeader } from "@/components/SiteHeader";
import { SAMPLE_PROJECTS } from "@/lib/projects";
import { buildProjectUrl } from "@/lib/attribution";

export default function QrPage() {
  const [slug, setSlug] = useState(SAMPLE_PROJECTS[0].slug);
  const [campaign, setCampaign] = useState("site-board-1");
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const [svg, setSvg] = useState("");
  const project = SAMPLE_PROJECTS.find((p) => p.slug === slug)!;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SITE_URL) setOrigin(window.location.origin);
  }, []);

  const url = buildProjectUrl(origin, slug, campaign);

  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "H", color: { dark: "#1f3b2d", light: "#0000" } })
      .then(setSvg);
  }, [url]);

  function download() {
    const blob = new Blob([posterSvg(svg, project.name)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bmi-qr-${slug}${campaign ? "-" + campaign : ""}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <SiteHeader />
      <main className="page qr-page">
        <header className="page-head">
          <p className="eyebrow"><span className="peg-dot" /> Staff tool · preview</p>
          <h1>QR codes for site boards</h1>
          <p className="lede">Each code opens the project page and tags enquiries as coming from that QR placement.</p>
        </header>
        <div className="qr-layout">
          <form className="qr-form" onSubmit={(e) => e.preventDefault()}>
            <label className="field">
              <span className="field-label">Project</span>
              <select value={slug} onChange={(e) => setSlug(e.target.value)}>
                {SAMPLE_PROJECTS.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Placement / campaign tag <em>letters, numbers, - or _</em></span>
              <input value={campaign} onChange={(e) => setCampaign(e.target.value.replace(/[^a-z0-9_-]/gi, "").slice(0, 64))} />
            </label>
            <label className="field">
              <span className="field-label">Link</span>
              <input value={url} readOnly onFocus={(e) => e.target.select()} />
            </label>
            <div className="qr-actions">
              <button type="button" className="btn" onClick={download} disabled={!svg}>Download poster (SVG)</button>
              <a className="btn btn-ghost" href={url} target="_blank" rel="noreferrer">Open link</a>
            </div>
          </form>

          <figure className="qr-poster">
            <div className="qr-poster-inner">
              <p className="qr-poster-eyebrow">BMI Housing Society</p>
              <h2>{project.name}</h2>
              <div className="qr-frame">
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div className="qr-code" dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
              <p className="qr-poster-cta">Scan to view plots &amp; enquire</p>
              <p className="qr-poster-note">No app needed</p>
            </div>
          </figure>
        </div>
      </main>
    </>
  );
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/** Printable A6-ish poster with the QR embedded. */
function posterSvg(qrSvg: string, name: string) {
  const inner = qrSvg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const vb = /viewBox="([^"]+)"/.exec(qrSvg)?.[1] ?? "0 0 33 33";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="1480" viewBox="0 0 1050 1480">
  <rect width="1050" height="1480" fill="#f6f0e4"/>
  <rect x="40" y="40" width="970" height="1400" rx="48" fill="none" stroke="#1f3b2d" stroke-width="6"/>
  <text x="525" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="44" fill="#b5532e" letter-spacing="6">BMI HOUSING SOCIETY</text>
  <text x="525" y="270" text-anchor="middle" font-family="Georgia,serif" font-size="84" fill="#1f3b2d">${esc(name)}</text>
  <svg x="225" y="360" width="600" height="600" viewBox="${vb}">${inner}</svg>
  <text x="525" y="1100" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="56" font-weight="700" fill="#1f3b2d">Scan to view plots &amp; enquire</text>
  <text x="525" y="1180" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="38" fill="#5b6b5f">No app needed</text>
</svg>`;
}
