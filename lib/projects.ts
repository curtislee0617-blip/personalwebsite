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
    slug: "supercritical-water-gasification",
    eyebrow: "Screening / pre-FEED process design",
    title: "Towngas SCWG–OXZEO Waste-to-Olefins Study",
    shortTitle: "Towngas SCWG–OXZEO",
    year: "August 2026",
    description:
      "An integrated screening/pre-FEED process design for a five-train, 1,500 t/d SCWG–OXZEO concept that co-processes wet soybean okara, straw, and fresh red mud into light olefins.",
    detail: [
      "The B1–B8 design basis runs from feed handling and salt management through supercritical water gasification, gas cleanup, reforming, OXZEO synthesis, and heat-and-water integration, supported by closed screening mass, carbon, and energy balances.",
      "The economics are reported without hiding the outcome: RMB 1.90 billion base-case CAPEX, RMB 5.2 million per year EBITDA, a 20-year pretax NPV at 10% of −RMB 1.856 billion, and no positive IRR; staged validation gates define what must be proven before FEED.",
    ],
    tags: ["Chemical engineering", "FEED-gate design", "SCWG", "OXZEO", "Techno-economics"],
    previews: [
      {
        src: "/photos/scwg-hero-card.webp",
        alt: "Aerial view of the green-methanol plant at Jungar Banner, Inner Mongolia",
      },
      // The carousel shows `previews[1]` in its large panel, so it needs a source
      // wide enough not to be upscaled — the card variant alone is only 760px.
      {
        src: "/photos/scwg-hero-wide.webp",
        alt: "Aerial view of the green-methanol plant at Jungar Banner, Inner Mongolia",
      },
    ],
    documents: [
      {
        href: "/downloads/Towngas_SCWG_OXZEO_Process_Design_FEED_Final_RMB_China.docx",
        label: "Download final engineering report",
        description: "Final RMB-denominated Towngas SCWG–OXZEO screening/pre-FEED report in DOCX format.",
        viewer: "external",
      },
      {
        href: "/downloads/Towngas_SCWG_OXZEO_Process_Design_FEED_Final_RMB_China.pdf",
        label: "Open report PDF",
        description: "PDF review copy of the final engineering report.",
        viewer: "external",
      },
    ],
  },
  {
    slug: "biodiesel-from-used-cooking-oil",
    eyebrow: "Chemical Engineering",
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
        src: "/project-previews/biodiesel-from-used-cooking-oil/lab-synthesis-screenshot.png",
        alt: "Biodiesel synthesis in the laboratory",
      },
      {
        src: "/project-previews/biodiesel-from-used-cooking-oil/process-flow-screenshot.png",
        alt: "Process flow diagram from the biodiesel design report",
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
        href: "/curtis-ch9-final-project.pdf",
        label: "Synthesis presentation",
        description: "Presentation on biodiesel synthesis from used cooking oil and ethanol.",
        viewer: "external",
      },
    ],
  },
  {
    slug: "bem-114-report",
    eyebrow: "Finance & NLP",
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
    eyebrow: "Tonbridge Science Conference",
    title: "The science of flavour",
    shortTitle: "Flavour poster",
    year: "February 2023",
    description:
      "Researched flavour compounds, retronasal olfaction, and the chemistry behind why meat tastes good, including how plant-derived molecules might reproduce those sensory qualities.",
    detail: [
      "This poster was prepared for the Tonbridge Science Conference in February 2023.",
      "It examines the compounds responsible for flavour and the role of retronasal olfaction—the movement of aroma from the mouth into the nasal cavity while eating.",
      "The project also considers the chemistry behind the savoury flavour of meat and whether plant-derived molecules could reproduce parts of that sensory experience.",
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
    eyebrow: "Young Enterprise",
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
