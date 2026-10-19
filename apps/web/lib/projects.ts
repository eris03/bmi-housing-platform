// SAMPLE CONTENT — synthetic placeholder data for UI development only.
// Not real BMI projects, prices or inventory. Replace with GET /api/v1/projects
// once the API lands (Milestone 03).

export type PlotStatus = "AVAILABLE" | "ON_HOLD" | "RESERVED" | "SOLD" | "INACTIVE";

export interface Plot {
  id: string;
  number: string;
  areaSqft: number;
  dimensions: string;
  facing: "North" | "South" | "East" | "West";
  status: PlotStatus;
  /** Grid placement on the layout map */
  row: number;
  col: number;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string;
  description: string;
  amenities: string[];
  /** Accent hue used for this project's illustrations */
  hue: "terracotta" | "sage" | "ochre";
  pricePublic: boolean;
  pricePerSqftLabel?: string;
  plots: Plot[];
}

function grid(prefix: string, rows: number, cols: number, seed: number): Plot[] {
  const statuses: PlotStatus[] = ["AVAILABLE", "AVAILABLE", "AVAILABLE", "ON_HOLD", "RESERVED", "SOLD"];
  const facings: Plot["facing"][] = ["North", "East", "South", "West"];
  const plots: Plot[] = [];
  let n = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = (r * 7 + c * 13 + seed) % statuses.length;
      const wide = (r + c + seed) % 3 === 0;
      plots.push({
        id: `${prefix}-${n}`,
        number: `${prefix}-${String(n).padStart(2, "0")}`,
        areaSqft: wide ? 1500 : 1200,
        dimensions: wide ? "30 × 50 ft" : "30 × 40 ft",
        facing: facings[(r + c) % 4],
        status: statuses[k],
        row: r,
        col: c,
      });
      n++;
    }
  }
  return plots;
}

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: "sample-1",
    slug: "sample-greenfield-enclave",
    name: "Greenfield Enclave",
    tagline: "Plotted living, framed by trees",
    location: "Sample location, Phase I",
    description:
      "A gated plotted layout with wide internal roads, a central park and space to build the home you imagine. This is placeholder copy for design review.",
    amenities: [
      "Gated entry",
      "Central park",
      "30 ft roads",
      "Underground drainage",
      "Street lighting",
      "Children's play area",
    ],
    hue: "sage",
    pricePublic: true,
    pricePerSqftLabel: "₹ — / sq ft (sample)",
    plots: grid("A", 4, 8, 1),
  },
  {
    id: "sample-2",
    slug: "sample-sunrise-meadows",
    name: "Sunrise Meadows",
    tagline: "East-facing plots, morning light",
    location: "Sample location, Phase II",
    description:
      "Orderly east-facing plots laid out around a walking loop and community hall. Placeholder description for design review only.",
    amenities: ["Walking loop", "Community hall", "Avenue plantation", "Water supply", "24×7 security"],
    hue: "ochre",
    pricePublic: false,
    plots: grid("B", 3, 9, 4),
  },
  {
    id: "sample-3",
    slug: "sample-riverside-greens",
    name: "Riverside Greens",
    tagline: "Quiet plots near open water",
    location: "Sample location, Phase III",
    description:
      "A compact layout beside a landscaped water edge, with jogging track and pavilion. Placeholder description for design review only.",
    amenities: ["Jogging track", "Pavilion", "Landscaped edge", "Rainwater harvesting"],
    hue: "terracotta",
    pricePublic: true,
    pricePerSqftLabel: "₹ — / sq ft (sample)",
    plots: grid("C", 4, 6, 2),
  },
];

export function getProject(slug: string): Project | undefined {
  return SAMPLE_PROJECTS.find((p) => p.slug === slug);
}

export function availability(p: Project) {
  const available = p.plots.filter((x) => x.status === "AVAILABLE").length;
  return { available, total: p.plots.length };
}
