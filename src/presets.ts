export type Phase = "inhale" | "holdIn" | "exhale" | "holdOut";

export type Pattern = {
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
};

export type Preset = {
  id: string;
  name: string;
  blurb: string;
  pattern: Pattern;
};

export const PRESETS: Preset[] = [
  {
    id: "coherent-6",
    name: "Coherent 6·6",
    blurb: "5 br/min · resonance & HRV",
    pattern: { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0 },
  },
  {
    id: "coherent-5",
    name: "Coherent 5·5",
    blurb: "6 br/min · calm focus",
    pattern: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 },
  },
  {
    id: "hrv-6",
    name: "HRV 6·6·6",
    blurb: "Inhale · hold · exhale",
    pattern: { inhale: 6, holdIn: 6, exhale: 6, holdOut: 0 },
  },
  {
    id: "box-4",
    name: "Box 4·4·4·4",
    blurb: "Focus & composure",
    pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  },
  {
    id: "relax-478",
    name: "4·7·8 Relax",
    blurb: "Sleep & unwind",
    pattern: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  },
  {
    id: "energize",
    name: "Energize 4·2·4",
    blurb: "Wake up · alert",
    pattern: { inhale: 4, holdIn: 2, exhale: 4, holdOut: 0 },
  },
];

export const phaseLabel = (p: Phase) =>
  p === "inhale" ? "Inhale" : p === "exhale" ? "Exhale" : p === "holdIn" ? "Hold" : "Hold";
