export type InteractionToolStatus = "In use" | "Ready" | "Native";

export type InteractionTool = {
  name: string;
  capability: string;
  status: InteractionToolStatus;
};

export const websiteInteractionTools = [
  { name: "Motion", capability: "React motion and layout", status: "In use" },
  { name: "Anime.js", capability: "SVG and timeline animation", status: "In use" },
  { name: "Rive", capability: "Interactive vector state machines", status: "Ready" },
  { name: "GSAP + ScrollTrigger", capability: "Cinematic scroll choreography", status: "In use" },
  { name: "React Three Fiber", capability: "Declarative 3D and WebGL", status: "Ready" },
  { name: "use-gesture", capability: "Drag, pinch and pointer gestures", status: "In use" },
  { name: "dotLottie", capability: "Compact portable animations", status: "In use" },
  { name: "View Transitions API", capability: "Native state and page continuity", status: "Native" },
  { name: "D3.js", capability: "Custom scientific maps and SVG data views", status: "In use" },
  { name: "MapLibre GL JS", capability: "Custom vector-tile maps and globe views", status: "Ready" },
  { name: "deck.gl", capability: "GPU data layers synchronized with maps", status: "Ready" },
  { name: "Observable Plot", capability: "Concise exploratory scientific charts", status: "Ready" },
  { name: "Cytoscape.js", capability: "Interactive networks and relationship graphs", status: "Ready" },
  { name: "PixiJS", capability: "High-volume 2D WebGL scenes and particles", status: "Ready" },
  { name: "Matter.js", capability: "Rigid-body physics and draggable equipment", status: "In use" },
  { name: "Theatre.js", capability: "Keyframed visual animation sequencing", status: "Ready" },
  { name: "XState", capability: "Explicit interaction states and legal transitions", status: "In use" },
  { name: "Lenis", capability: "Opt-in smooth scroll and animation synchronization", status: "Ready" },
] as const satisfies readonly InteractionTool[];
