"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Plot, PlotStatus, Project } from "@/lib/projects";

const LABEL: Record<PlotStatus, string> = {
  AVAILABLE: "Available",
  ON_HOLD: "On hold",
  RESERVED: "Reserved",
  SOLD: "Sold",
  INACTIVE: "Not offered",
};

export function PlotMap({ project, enquireHref }: { project: Project; enquireHref: string }) {
  const [selected, setSelected] = useState<Plot | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const rows = Math.max(...project.plots.map((p) => p.row)) + 1;
  const cols = Math.max(...project.plots.map((p) => p.col)) + 1;
  const counts = useMemo(() => {
    const c: Partial<Record<PlotStatus, number>> = {};
    project.plots.forEach((p) => (c[p.status] = (c[p.status] ?? 0) + 1));
    return c;
  }, [project]);

  const cell = 56;
  const road = 18;
  const midRow = Math.floor(rows / 2);
  const W = cols * cell + 76;
  const H = rows * cell + road + 40;

  return (
    <div className="plot-map">
      <div className="plot-map-toolbar">
        <div className="legend">
          {(["AVAILABLE", "ON_HOLD", "RESERVED", "SOLD"] as PlotStatus[]).map((s) => (
            <span key={s} className="legend-item">
              <i className={`swatch s-${s.toLowerCase()}`} /> {LABEL[s]} <b>{counts[s] ?? 0}</b>
            </span>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          <span>Only available</span>
        </label>
      </div>

      <div className="plot-map-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Layout map of ${project.name}`}>
          <rect x="6" y="6" width={W - 50} height={H - 12} rx="20" className="map-ground" />
          {/* internal road */}
          <rect x="20" y={20 + midRow * cell} width={cols * cell} height={road} className="map-road" />
          <path d={`M20 ${20 + midRow * cell + road / 2} H${20 + cols * cell}`} className="map-road-line" />
          {project.plots.map((p) => {
            const x = 20 + p.col * cell;
            const y = 20 + p.row * cell + (p.row >= midRow ? road : 0);
            const dim = onlyAvailable && p.status !== "AVAILABLE";
            const isSel = selected?.id === p.id;
            return (
              <g
                key={p.id}
                className={`map-plot s-${p.status.toLowerCase()} ${dim ? "dim" : ""} ${isSel ? "sel" : ""}`}
                tabIndex={0}
                role="button"
                aria-label={`Plot ${p.number}, ${LABEL[p.status]}, ${p.areaSqft} square feet`}
                onClick={() => setSelected(p)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(p))}
              >
                <rect x={x + 3} y={y + 3} width={cell - 6} height={cell - 6} rx="6" />
                <text x={x + cell / 2} y={y + cell / 2 + 4} textAnchor="middle">
                  {p.number.split("-")[1]}
                </text>
              </g>
            );
          })}
          {/* compass */}
          <g transform={`translate(${W - 26} 40)`} className="map-compass">
            <circle r="13" />
            <path d="M0 -10 L4 0 L0 10 L-4 0Z" />
            <text y="-16" textAnchor="middle">
              N
            </text>
          </g>
        </svg>
      </div>

      <aside className={`plot-detail ${selected ? "open" : ""}`} aria-live="polite">
        {selected ? (
          <>
            <div className="plot-detail-head">
              <span className={`chip s-${selected.status.toLowerCase()}`}>{LABEL[selected.status]}</span>
              <h3>Plot {selected.number}</h3>
            </div>
            <dl>
              <div>
                <dt>Area</dt>
                <dd>{selected.areaSqft.toLocaleString("en-IN")} sq ft</dd>
              </div>
              <div>
                <dt>Dimensions</dt>
                <dd>{selected.dimensions}</dd>
              </div>
              <div>
                <dt>Facing</dt>
                <dd>{selected.facing}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{project.pricePublic ? project.pricePerSqftLabel : "On request"}</dd>
              </div>
            </dl>
            {selected.status === "AVAILABLE" ? (
              <Link className="btn" href={`${enquireHref}&plot=${encodeURIComponent(selected.number)}`}>
                Enquire about this plot
              </Link>
            ) : (
              <p className="muted">This plot isn't open for requests. Pick a green plot on the map.</p>
            )}
          </>
        ) : (
          <p className="muted">Tap any plot on the map to see its size, facing and status.</p>
        )}
      </aside>
    </div>
  );
}
