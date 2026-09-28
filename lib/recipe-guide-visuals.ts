export const guideVisuals: Record<string, { src?: string; srcs?: string[]; alt: string; mark: string; tone: string }> = {
  "sourdough-guide": {
    srcs: [
      "/recipes/home-guides/sourdough-step-1.webp",
      "/recipes/home-guides/sourdough-step-2.webp",
      "/recipes/home-guides/sourdough-step-3.webp",
    ],
    alt: "Three sourdough loaves and crumb views",
    mark: "SD",
    tone: "grain",
  },
  "coffee-guide": {
    srcs: [
      "/recipes/coffee-guide/coffee-cherry-harvest.webp",
      "/recipes/coffee-guide/coffee-flavour-wheel.webp",
      "/recipes/coffee-guide/moka-pot-diagram.webp",
    ],
    alt: "Coffee cherries, a coffee flavour wheel, and a moka pot",
    mark: "COFFEE",
    tone: "coffee",
  },
  "wine-guide": {
    alt: "Abstract wine map and grape graphic",
    mark: "WINE",
    tone: "wine",
  },
  "core-basics": { alt: "Core cooking fundamentals graphic", mark: "CORE", tone: "core" },
  "viennoiserie-guide": {
    srcs: [
      "/recipes/home-guides/Croissants1.webp",
      "/recipes/home-guides/Croissant4.webp",
      "/recipes/home-guides/Croissants2.webp",
    ],
    alt: "Croissants and laminated pastries",
    mark: "LAM",
    tone: "pastry",
  },
  "pasta-guide": {
    srcs: ["/recipes/home-guides/Capelliti.webp", "/recipes/home-guides/Stuffedpasta.webp", "/recipes/home-guides/DSC_6482.webp"],
    alt: "Fresh cappelletti, stuffed pasta, and handmade noodles",
    mark: "PASTA",
    tone: "pasta",
  },
  "sushi-guide": {
    srcs: ["/recipes/home-guides/IMG_2842.webp", "/recipes/home-guides/IMG_1653.webp"],
    alt: "Sushi chefs and nigiri",
    mark: "SUSHI",
    tone: "sushi",
  },
  "cookbook-guide": { src: "/project-documents/cook-enterprise/book2.jpeg", alt: "Cookbook spread preview", mark: "BOOK", tone: "book" },
};

// The index displays tiny photo tiles; keep the originals for the full guides.
export function guidePreviewSrc(src: string) {
  const filename = src.slice(src.lastIndexOf("/") + 1).replace(/\.[^.]+$/, ".webp");
  return `/recipes/guide-previews/${filename}`;
}
