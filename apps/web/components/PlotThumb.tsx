import type { Project } from "@/lib/projects";

/** Miniature layout map used on project cards. */
export function PlotThumb({ project }: { project: Project }) {
  const rows = Math.max(...project.plots.map((p) => p.row)) + 1;
  const cols = Math.max(...project.plots.map((p) => p.col)) + 1;
  const cw = 200 / cols;
  const ch = 110 / rows;
  return (
    <svg viewBox="0 0 220 130" className={`plot-thumb hue-${project.hue}`} aria-hidden="true">
      <rect x="4" y="4" width="212" height="122" rx="14" className="thumb-bg" />
      {project.plots.map((p) => (
        <rect
          key={p.id}
          x={10 + p.col * cw + 1.5}
          y={10 + p.row * ch + 1.5}
          width={cw - 3}
          height={ch - 3}
          rx="2.5"
          className={`thumb-plot s-${p.status.toLowerCase()}`}
        />
      ))}
    </svg>
  );
}
