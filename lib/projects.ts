export type ProjectPreview = {
  src: string;
  alt: string;
};

export type ProjectDocument = {
  href: string;
  label: string;
  description: string;
  viewer?: "embed" | "external";
};

export type ProjectEntry = {
  slug: string;
  eyebrow: string;
  title: string;
  shortTitle?: string;
  year: string;
  description: string;
  detail: string[];
  tags: string[];
  previews: ProjectPreview[];
  documents?: ProjectDocument[];
};

export const projects: ProjectEntry[] = [
  {
    slug: "tonbridge-food-science",
    eyebrow: "Conference project · Tonbridge Science Conference",
    title: "The science of flavour",
    year: "2023",
    description:
      "Researched flavour compounds, retronasal olfaction, and the chemistry behind why meat tastes good, including how plant-derived molecules might reproduce those sensory qualities.",
    detail: [
      "This project is ideal for a conference-poster presentation page with a strong visual preview and a clean full-size poster viewer.",
      "Place the final poster PDF in the document path below and add 2 to 3 preview images so the main projects page can show a visual snapshot before people click through.",
    ],
    tags: ["Flavour chemistry", "Retronasal olfaction", "Plant-based food"],
    previews: [
      {
        src: "/project-previews/tonbridge-food-science/poster-preview-1.png",
        alt: "Preview image from the Tonbridge science conference poster",
      },
    ],
    documents: [
      {
        href: "/project-documents/tonbridge-food-science/poster.pdf",
        label: "Open conference poster",
        description: "Full poster PDF",
        viewer: "embed",
      },
    ],
  },
  {
    slug: "cook-enterprise",
    eyebrow: "Young Enterprise · 2022 - 2023",
    title: "cook.enterprise",
    year: "2022 - 2023",
    description:
      "Led a team of 17 students to create a student-focused cookbook. The project won the Best Company Award at the Young Enterprise Kent Finals.",
    detail: [
      "The work combined product development, cookbook writing, visual presentation, marketing, and team leadership.",
      "Because the final book is likely much larger than a poster, the best experience is a dedicated project page with preview images plus separate open and download actions for the full PDF.",
    ],
    tags: ["Publishing", "Food", "Entrepreneurship"],
    previews: [
      {
        src: "/project-documents/cook-enterprise/book1.jpeg",
        alt: "Team image from the cook.enterprise project",
      },
      {
        src: "/project-documents/cook-enterprise/book2.jpeg",
        alt: "Cookbook image from the cook.enterprise project",
      },
    ],
    documents: [
      {
        href: "/project-documents/cook-enterprise/cookbook.pdf",
        label: "Open cookbook",
        description: "Full cookbook PDF",
        viewer: "external",
      },
    ],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
