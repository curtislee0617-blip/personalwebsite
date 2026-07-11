import { SectionRail } from "@/components/section-rail";

const sections = [
  { id: "about-education", label: "Education" },
  { id: "about-experience", label: "Experience" },
  { id: "about-awards", label: "Awards" },
  { id: "about-beyond", label: "Beyond the lab" },
  { id: "about-languages", label: "Languages" },
  { id: "about-skills", label: "Skills" },
  { id: "about-projects", label: "Projects" },
] as const;

export function AboutSectionRail() {
  return <SectionRail ariaLabel="About page sections" sections={sections} />;
}
