import { readFile } from "node:fs/promises";
import path from "node:path";

export type Bi1xBlock =
  | { type: "markdown"; text: string }
  | { type: "code"; code: string }
  | { type: "image"; src: string; alt: string; width?: number; height?: number; code?: string; displayCode?: string; sourceCell?: number }
  | { type: "output"; text: string };

export type Bi1xSection = { title: string; blocks: Bi1xBlock[] };
export const bi1xClass = { title: "Bi1x Laboratory class", dates: "April–June 2025" };
export type Bi1xProject = {
  slug: string;
  title: string;
  year: string;
  eyebrow: string;
  topic: string;
  description: string;
  sourceName: string;
  sections: Bi1xSection[];
};

export const bi1xProjects = [
  { slug: "lab-1", title: "Restriction Digest", topic: "Restriction enzymes · DNA analysis", description: "DNA digestion, fragment lengths, and absorbance measurements." },
  { slug: "lab-2", title: "Microscopy & Biological Scales", topic: "Microscopy · Image analysis", description: "Microscope calibration, biological scale, and observations of the termite gut community." },
  { slug: "lab-3", title: "Luria–Delbrück Experiment", topic: "Mutation · Statistical analysis", description: "Testing random versus adaptive mutation with fluctuation analysis, colony counts, and sequence comparisons." },
  { slug: "lab-4", title: "Bacterial Growth", topic: "Microbial growth · Regression", description: "Calibrating OD₆₀₀ and comparing E. coli growth across sugars and mixtures." },
  { slug: "lab-5", title: "Antibiotic Resistance", topic: "Antibiotic resistance · 16S sequencing", description: "Identifying resistant isolates and analyzing soil microbial communities with QIIME 2." },
  { slug: "lab-6", title: "Efflux Pump Experiment", topic: "Efflux pumps · Modeling", description: "Estimating strain-specific tetracycline efflux from growth rates and exploring promoter binding." },
] as const;

export async function getBi1xProject(slug: string): Promise<Bi1xProject | null> {
  if (!bi1xProjects.some((project) => project.slug === slug)) return null;
  const file = path.join(process.cwd(), "public", "bi1x", "data", `${slug}.json`);
  try {
    return JSON.parse(await readFile(file, "utf8")) as Bi1xProject;
  } catch {
    return null;
  }
}
