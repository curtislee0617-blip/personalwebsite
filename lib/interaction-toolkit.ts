export type InteractionToolStatus = "In use" | "Ready" | "Native";

export type InteractionTool = {
  name: string;
  capability: string;
  description: string;
  href?: string;
  status: InteractionToolStatus;
};

export const websiteInteractionTools = [
  { name: "Motion", capability: "React motion and layout", description: "Component-level animations, gestures, and layout changes without re-rendering every frame.", href: "https://motion.dev/docs/react", status: "In use" },
  { name: "React Spring", capability: "Spring-driven navigation and button feedback", description: "Natural-feeling motion that responds to state: press feedback, expanding cards, draggable pieces, and smoothly updated data.", href: "https://www.react-spring.dev/docs", status: "In use" },
  { name: "Anime.js", capability: "SVG and timeline animation", description: "Timeline-based animation for text, SVG paths, DOM values, and small visual sequences.", href: "https://animejs.com/documentation", status: "In use" },
  { name: "Rive", capability: "Interactive vector state machines", description: "Interactive vector animation with editable state machines for richer controls and characters.", href: "https://rive.app/docs", status: "Ready" },
  { name: "GSAP + ScrollTrigger", capability: "Cinematic scroll choreography", description: "Sequenced motion and scroll-linked scenes, including pinning, scrubbing, and entering-section choreography.", href: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/", status: "In use" },
  { name: "React Three Fiber", capability: "Declarative 3D and WebGL", description: "A React renderer for Three.js scenes such as the Earth, molecular models, and spatial data.", href: "https://r3f.docs.pmnd.rs/", status: "Ready" },
  { name: "use-gesture", capability: "Drag, pinch and pointer gestures", description: "Accessible drag, pinch, wheel, and pointer input for maps, galleries, and interactive tools.", href: "https://use-gesture.netlify.app/", status: "In use" },
  { name: "dotLottie", capability: "Compact portable animations", description: "Compact packaged vector animations for lightweight decorative or explanatory movement.", href: "https://developers.lottiefiles.com/docs/dotlottie-player/dotlottie-web/", status: "In use" },
  { name: "View Transitions API", capability: "Native state and page continuity", description: "Browser-native visual continuity between interface states and page changes when supported.", href: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API", status: "Native" },
  { name: "D3.js", capability: "Custom scientific maps and SVG data views", description: "Flexible scales, projections, and low-level SVG or Canvas drawing for scientific and geographic data.", href: "https://d3js.org/", status: "In use" },
  { name: "MapLibre GL JS", capability: "Custom vector-tile maps and globe views", description: "Open-source, GPU-rendered maps for interactive location tools and custom map styling.", href: "https://maplibre.org/maplibre-gl-js/docs/", status: "Ready" },
  { name: "deck.gl", capability: "GPU data layers synchronized with maps", description: "High-performance map overlays for points, paths, heatmaps, terrain, and other large data layers.", href: "https://deck.gl/docs", status: "Ready" },
  { name: "Observable Plot", capability: "Concise exploratory scientific charts", description: "A concise charting library for readable statistical and exploratory graphics.", href: "https://observablehq.com/plot/", status: "Ready" },
  { name: "Cytoscape.js", capability: "Interactive networks and relationship graphs", description: "Network diagrams for pathways, dependencies, and connected data.", href: "https://js.cytoscape.org/", status: "Ready" },
  { name: "PixiJS", capability: "High-volume 2D WebGL scenes and particles", description: "Fast 2D graphics for particle fields, playful micro-interactions, and dense visual scenes.", href: "https://pixijs.com/", status: "Ready" },
  { name: "Matter.js", capability: "Rigid-body physics and draggable equipment", description: "2D physics for playful simulations, tossable objects, and experiment-style interactions.", href: "https://brm.io/matter-js/", status: "In use" },
  { name: "Theatre.js", capability: "Keyframed visual animation sequencing", description: "Editable keyframed sequences for art-directed scenes and more precise visual timing.", href: "https://www.theatrejs.com/", status: "Ready" },
  { name: "XState", capability: "Explicit interaction states and legal transitions", description: "State machines for interfaces with multiple modes, preventing impossible transitions and tangled UI logic.", href: "https://stately.ai/docs/xstate", status: "In use" },
  { name: "Lenis", capability: "Opt-in smooth scroll and animation synchronization", description: "Smooth-scroll coordination when a particular editorial or visual experience calls for it.", href: "https://lenis.darkroom.engineering/", status: "Ready" },
] as const satisfies readonly InteractionTool[];
