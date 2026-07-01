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
    slug: "biodiesel-from-used-cooking-oil",
    eyebrow: "Chemical engineering coursework",
    title: "Biodiesel from used cooking oil",
    shortTitle: "Biodiesel project",
    year: "June 2026",
    description:
      "A two-part biodiesel project combining a plant-scale process design report with a synthesis presentation comparing greener alcohol routes.",
    detail: [
      "This project brings together two related pieces of work around biodiesel production from used cooking oil.",
      "The first part is a process-design report for biodiesel production using pretreatment, esterification, transesterification, separation, and methanol recovery.",
      "The second part is a presentation focused on the actual synthesis route, looking at biodiesel production from used cooking oil and ethanol and discussing the tradeoff between greener feedstocks and more difficult separations.",
    ],
    tags: ["Chemical engineering", "Process design", "Biodiesel", "Used cooking oil"],
    previews: [
      {
        src: "/project-previews/biodiesel-from-used-cooking-oil/process-flow-screenshot.png",
        alt: "Process flow diagram from the biodiesel design project",
      },
      {
        src: "/project-previews/biodiesel-from-used-cooking-oil/lab-synthesis-screenshot.png",
        alt: "Lab synthesis setup from the biodiesel project",
      },
    ],
    documents: [
      {
        href: "/ChE62 Project (2).pdf",
        label: "Process design report",
        description: "Plant design report for biodiesel production from used cooking oil.",
        viewer: "external",
      },
      {
        href: "/Curtis’s Ch9 final project.pdf",
        label: "Synthesis presentation",
        description: "Presentation on biodiesel synthesis from used cooking oil and ethanol.",
        viewer: "external",
      },
    ],
  },
  {
    slug: "bem-114-report",
    eyebrow: "BEM 114 final project",
    title: "Earnings Call NLP-Based Long-Short Strategy",
    shortTitle: "Hedge Fund Strategy",
    year: "June 2026",
    description:
      "A full report on an NLP-based long-short equity strategy using earnings call language, with the web version preserving the report wording and order.",
    detail: [
      "This project page mirrors the report in a more readable web layout while keeping the original wording and structure intact.",
      "Use the viewer for the original pages, or download the PDF directly.",
    ],
    tags: ["NLP", "Finance", "Long-short equity", "Earnings calls"],
    previews: [
      {
        src: "/project-previews/bem-114-report/abstract-preview.png",
        alt: "Title and abstract preview from the BEM 114 report",
      },
    ],
    documents: [
      {
        href: "/BEM 114 Report - Varun, Will, Curtis.pdf",
        label: "Open report",
        description: "Original BEM 114 report PDF",
        viewer: "external",
      },
    ],
  },
  {
    slug: "tonbridge-food-science",
    eyebrow: "Conference project · Tonbridge Science Conference",
    title: "The science of flavour",
    shortTitle: "Flavour poster",
    year: "February 2023",
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
    shortTitle: "Cookbook",
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
