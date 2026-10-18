// Content for the manager-briefing flow (/scan).
// PLACEHOLDER details — to be replaced with the official project information
// supplied by BMI. Do not treat any figure here as real.

export interface BriefProject {
  id: string;
  name: string;
  tagline: string;
  location: string;
  highlights: string[];
  hue: "sage" | "ochre" | "terracotta";
}

export const BMI_PROJECTS: BriefProject[] = [
  {
    id: "metro-greens",
    name: "Metro Greens",
    tagline: "Details to be provided",
    location: "Location to be provided",
    highlights: ["Plot sizes: 30×40, 30×50, 40×60, 50×80 ft", "Amenities: TBD", "Pricing: on request"],
    hue: "sage",
  },
  {
    id: "north-metro-greens",
    name: "North Metro Greens",
    tagline: "Details to be provided",
    location: "Location to be provided",
    highlights: ["Plot sizes: 30×40, 30×50, 40×60, 50×80 ft", "Amenities: TBD", "Pricing: on request"],
    hue: "ochre",
  },
];

export const IK_PROJECTS: BriefProject[] = [
  {
    id: "ik-project-1",
    name: "IK Developers — Project 1",
    tagline: "Details to be provided",
    location: "Location to be provided",
    highlights: ["Details: TBD"],
    hue: "terracotta",
  },
  {
    id: "ik-project-2",
    name: "IK Developers — Project 2",
    tagline: "Details to be provided",
    location: "Location to be provided",
    highlights: ["Details: TBD"],
    hue: "sage",
  },
];
