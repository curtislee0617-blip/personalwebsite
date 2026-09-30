export type ToolkitEntry = {
  id: string;
  name: string;
  summary: string;
  explanation: string;
  possibilities: string;
  idea: string;
  consideration: string;
  source: { label: string; href: string };
};

export type ToolkitChapter = {
  id: string;
  title: string;
  introduction: string;
  entries: ToolkitEntry[];
};

export const toolkitChapters: ToolkitChapter[] = [
  {
    id: "movement", title: "Giving an interface movement",
    introduction: "A button reacting to a press, a menu unfolding, and an entire page changing are different animation problems. These tools overlap, but each has a useful centre of gravity.",
    entries: [
      {
        id: "motion", name: "Motion", summary: "Make changes in a React interface feel connected.",
        explanation: "Motion is an animation library built around React components. Describe how an element should look when it appears, changes, or leaves, and Motion animates between those states. It can also follow changes in position and size, so a rearranged list can flow into its new layout.",
        possibilities: "It supports hover, tap and drag feedback, entrance and exit sequences, shared-element transitions, SVG drawing, and effects tied to scrolling. A selected thumbnail can appear to grow into a detail view, or a filtered grid can close its gaps smoothly.",
        idea: "Let recipe results settle into their new positions after filtering, with the selected recipe expanding into its detail view.",
        consideration: "A strong starting point for everyday React UI animation. Simple colour changes can still use CSS; a second animation engine should not control the same element’s transform.",
        source: { label: "Motion · React guide", href: "https://motion.dev/docs/react" },
      },
      {
        id: "react-spring", name: "React Spring", summary: "Give movement weight, resistance, and a natural settling point.",
        explanation: "React Spring animates values using a spring model. Mass, tension and friction shape how quickly something moves and how it settles. This is useful when the destination changes while an animation is still running, such as a card following a finger.",
        possibilities: "It can animate positions, scales and other values, coordinate trails of elements, and transition items in and out. A spring can feel firm and precise or soft and elastic; it does not have to bounce visibly.",
        idea: "Give contact buttons a restrained press-and-release response, and let a dragged course settle into a term. A theme icon could rotate and settle as its state changes.",
        consideration: "Use it for responsive, physical-feeling feedback. It does not fix expensive page rendering by itself, and the full-page theme reveal still needs its own transition design.",
        source: { label: "React Spring · spring configuration", href: "https://www.react-spring.dev/docs/advanced/config" },
      },
      {
        id: "gsap", name: "GSAP & ScrollTrigger", summary: "Direct a sequence, then decide what drives its progress.",
        explanation: "GSAP is an animation engine with timelines: several movements can start together, overlap, pause, or reverse. ScrollTrigger is its scroll plugin. It can start a sequence when a section enters view, pin a scene in place, or link animation progress directly to scroll position, called scrubbing.",
        possibilities: "Use it for carefully timed navigation, staggered entrances, diagrams assembled in stages, and long-form visual stories. A pinned illustration can stay beside the text while its labels and layers change with each passage.",
        idea: "Choreograph dashboard bubbles returning from the taskbar with one coordinated timeline. For a project report, reveal an experimental apparatus step by step as the reader scrolls.",
        consideration: "Choose it when timing across many elements matters. Reserve pinned scenes for places where they help explain something, especially on small screens.",
        source: { label: "GSAP · ScrollTrigger guide and demos", href: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" },
      },
      {
        id: "anime", name: "Anime.js", summary: "Build expressive sequences from shapes, text, and numbers.",
        explanation: "Anime.js is a JavaScript animation engine for visual elements and values. Its toolkit includes timelines, staggered timing, SVG and text animation, dragging, and layout animation. It can be used beyond React, which makes it useful for self-contained visual experiments.",
        possibilities: "Draw a line across an SVG diagram, introduce letters in a pattern, move labels in sequence, or coordinate a set of small illustrations. Timelines let those parts become one readable animation rather than unrelated effects.",
        idea: "Animate a spectroscopy trace being drawn, followed by its peak labels. A chemistry thumbnail could reveal a molecular diagram in a short sequence.",
        consideration: "It overlaps with GSAP and Motion. Give it a specific illustration or experiment to own, rather than layering three libraries onto every button.",
        source: { label: "Anime.js · animation toolkit", href: "https://animejs.com/documentation/" },
      },
      {
        id: "use-gesture", name: "use-gesture", summary: "Translate a hand movement into useful input.",
        explanation: "use-gesture recognises interactions such as dragging and pinching and provides movement data to your code. It tells you what the user is doing; a renderer or animation library decides how the object responds. The official guide pairs it with React Spring for dragging and returning to a resting position.",
        possibilities: "Build pinch-to-zoom figures, draggable controls, swipeable galleries, or a panel that follows a finger. Gesture data can also drive rotation, scale, or a value in an interactive tool.",
        idea: "Let readers zoom into Bi1x figures, or drag course blocks across the planner with a spring-powered landing.",
        consideration: "Keep buttons and keyboard alternatives alongside gestures. Recognising a drag does not automatically make a drag-only interface accessible.",
        source: { label: "use-gesture · introduction and example", href: "https://use-gesture.netlify.app/docs/" },
      },
      {
        id: "view-transitions", name: "View Transitions API", summary: "Let the browser connect the old view to the new one.",
        explanation: "This is a browser API rather than an installed animation library. It captures representations of the old and new views and lets CSS animate between them. Named elements can have their own transitions instead of being included only in a whole-page fade.",
        possibilities: "Connect a project thumbnail to its full image, preserve visual continuity when changing layouts, or reveal a new colour theme across the page. It supports same-document updates and supported same-origin page navigations, with different setup requirements.",
        idea: "Build the light/dark reveal around the exact sun or moon icon position, so the change visibly travels from the control the user pressed.",
        consideration: "Feature-detect support and keep a working fallback. The API provides the transition mechanism; the origin, timing, and treatment of moving content still need to be designed.",
        source: { label: "MDN · View Transition API", href: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API" },
      },
    ],
  },
  {
    id: "illustration", title: "Drawing an experience before coding it",
    introduction: "Some motion is easier to author visually. These tools connect a designed animation to the website, from a small loading illustration to an interactive character or a carefully directed scene.",
    entries: [
      {
        id: "rive", name: "Rive", summary: "Design an illustration that reacts to the person using it.",
        explanation: "Rive combines a visual design and animation editor with runtimes that play the result inside an application. Its state machines and data binding connect artwork to inputs and application state, so a graphic can react instead of simply replaying a loop.",
        possibilities: "Create an illustrated control, a character that responds to a pointer, or a progress indicator whose appearance follows real data. Timelines handle motion while interactive logic selects which behaviour to show.",
        idea: "Create a small lab assistant that reacts when a calculation finishes, or an illustrated day/night switch whose artwork follows the chosen theme.",
        consideration: "It needs an authored Rive asset and a runtime. Choose it when the illustration itself is interactive; ordinary text buttons rarely need that extra production step.",
        source: { label: "Rive · introduction", href: "https://rive.app/docs/getting-started/introduction" },
      },
      {
        id: "dotlottie", name: "dotLottie", summary: "Bring a prepared animation into the page.",
        explanation: "The dotLottie web player renders .lottie files and Lottie JSON animations in the browser. It provides playback control, layout, theming, multi-animation support and interactive state machines, with wrappers for frameworks including React.",
        possibilities: "Play a loading illustration, a success checkmark, an explanatory loop, or a short branded sequence. Playback can be paused or controlled by the surrounding interface instead of running continuously.",
        idea: "Give each tools category a small loading illustration, then stop it when the tool is ready. A successful calendar export could play a brief confirmation animation.",
        consideration: "A player does not create the artwork. Asset complexity affects rendering cost, so test the actual animation on mobile and provide a still state for reduced motion.",
        source: { label: "LottieFiles · JavaScript player", href: "https://docs.lottiefiles.com/en/runtimes/distributions/js" },
      },
      {
        id: "theatre", name: "Theatre.js", summary: "Edit animation timing on a visual timeline.",
        explanation: "Theatre.js provides tools for authoring keyframed sequences visually, then playing them through code. Its guides cover HTML and SVG as well as Three.js and React Three Fiber, so a sequence can control both page graphics and 3D scenes.",
        possibilities: "Direct a camera move, adjust an object’s position across a sequence, or coordinate visual properties with audio. Keyframes are especially useful when the exact composition at particular moments matters.",
        idea: "Create a short guided introduction to the Earth view: approach the globe, turn toward the selected city, then settle into the live conditions display.",
        consideration: "Best for art-directed sequences with repeatable timing. It is less necessary for small state changes that a spring or CSS transition already handles well.",
        source: { label: "Theatre.js · overview and guides", href: "https://www.theatrejs.com/docs/latest" },
      },
    ],
  },
  {
    id: "worlds", title: "Building scenes you can explore",
    introduction: "Rendering decides what appears on screen. Physics decides how objects respond to forces. Keeping those jobs distinct makes it easier to choose a tool for a globe, a pixel-art scene, or a playful simulation.",
    entries: [
      {
        id: "react-three-fiber", name: "React Three Fiber", summary: "Build a Three.js scene using React components.",
        explanation: "React Three Fiber is a React renderer for Three.js. It lets you describe 3D objects, cameras, lights and materials in a component structure and connect them to application state. Three.js still supplies the underlying graphics capabilities.",
        possibilities: "Create a globe with textured surfaces, a rotatable molecular model, or an interactive piece of equipment. Materials and lighting can convey shape, while camera controls let the visitor inspect the scene.",
        idea: "Use one scene for the astronomical Earth, with separate surface, cloud and night-light layers driven by the time slider. A molecular viewer would also suit the chemistry tools.",
        consideration: "It renders the scene; it does not supply astronomical calculations, weather observations, or molecular data. Those inputs and their accuracy remain separate responsibilities.",
        source: { label: "React Three Fiber · official repository and introduction", href: "https://github.com/pmndrs/react-three-fiber" },
      },
      {
        id: "pixi", name: "PixiJS", summary: "Draw rich 2D scenes with the graphics processor.",
        explanation: "PixiJS is a 2D rendering engine with WebGL and WebGPU support. It is built for interactive graphics such as games and visual applications, where many sprites and graphical elements need to be drawn together.",
        possibilities: "Build animated landscapes, dense particle scenes, illustrated interfaces, or a small browser game. It is a useful option when a scene has enough moving parts that managing each one as a normal page element becomes awkward.",
        idea: "Explore a richer pixel-art landscape with rain, drifting clouds and small environmental details, or a dedicated star-field experiment with interactive depth.",
        consideration: "Use it for the visual scene while keeping meaningful text and controls in accessible HTML. A canvas renderer alone does not provide a complete game or physics system.",
        source: { label: "PixiJS · rendering engine", href: "https://pixijs.com/" },
      },
      {
        id: "matter", name: "Matter.js", summary: "Make 2D objects collide, fall, and push each other.",
        explanation: "Matter.js is a two-dimensional rigid-body physics engine. It simulates objects, collisions and constraints, letting movement emerge from forces and contact rather than a predetermined animation path.",
        possibilities: "Build a pile of draggable objects, a pendulum, a seesaw, or a small mechanical playground. Objects can tumble into a container or respond to being picked up and released.",
        idea: "Make a separate lab-bench experiment where visitors move apparatus, or a playful project illustration in which small objects settle onto a shelf.",
        consideration: "Rigid-body physics is useful for interaction and intuition. It is not a fluid, chemistry, or molecular simulation, and decorative collisions should not obstruct navigation.",
        source: { label: "Matter.js · physics engine and examples", href: "https://brm.io/matter-js/" },
      },
    ],
  },
  {
    id: "data", title: "Making data visible",
    introduction: "A scientific plot, a street map and a network diagram communicate different kinds of information. Here, the choice starts with the data and the question a reader wants to answer.",
    entries: [
      {
        id: "d3", name: "D3.js", summary: "Design a custom visual language for data.",
        explanation: "D3 is a collection of tools for data visualisation. Scales turn numbers into positions or colours; shapes produce lines and areas; geographic projections turn spherical coordinates into maps. Its interaction tools include zooming, dragging and brushing a range of data.",
        possibilities: "Create a bespoke spectrum plot, a geographic projection, an interactive timeline, or an unusual scientific diagram. It offers fine control over how data becomes graphics rather than limiting you to a fixed set of charts.",
        idea: "Let a reader select a region of an IR spectrum and inspect its peaks, or scrub through a Bi1x result while linked plots highlight the same measurements.",
        consideration: "Choose D3 for a view that needs custom geometry or interaction. For conventional exploratory plots, Observable Plot can save substantial setup work.",
        source: { label: "D3 · capabilities and examples", href: "https://d3js.org/" },
      },
      {
        id: "plot", name: "Observable Plot", summary: "Turn a dataset into a readable chart with less setup.",
        explanation: "Observable Plot is a higher-level visualisation library built on D3. You compose marks such as dots, lines and bars; scales arrange them, transforms can derive values such as bins, and facets repeat plots for comparisons between groups.",
        possibilities: "Create histograms, scatter plots, time series, distributions, or small multiples. Layering marks makes it possible to compare raw observations with a summary in the same figure.",
        idea: "Rebuild selected Bi1x results as interactive browser figures, with a control for the experimental group and a consistent scale across comparisons.",
        consideration: "Start here for standard data graphics, then use D3 if the design needs finer control. Neither library validates the experiment or chooses the correct statistical method for you.",
        source: { label: "Observable Plot · marks, transforms and facets", href: "https://observablehq.github.io/plot/" },
      },
      {
        id: "maplibre", name: "MapLibre GL JS", summary: "Create a navigable map with your own visual style.",
        explanation: "MapLibre GL JS is an open-source library for interactive maps. It can render map sources with configurable styles, provide navigation and location controls, and display markers, popups and geographic layers. Its API also includes globe and terrain capabilities.",
        possibilities: "Build a restaurant explorer, a travel map, or a geographic planning tool with selectable layers. Colours and labels can be designed to match the website while retaining the familiar ability to pan and zoom.",
        idea: "Give the darkness tool a clear map of the selected location, nearby photography sites, and a switchable light-pollution overlay.",
        consideration: "The map engine does not include every dataset or a free tile service. Light pollution, terrain, weather and map tiles need their own sources, licences and attribution.",
        source: { label: "MapLibre · introduction and API", href: "https://maplibre.org/maplibre-gl-js/docs/" },
      },
      {
        id: "deck", name: "deck.gl", summary: "Put large datasets into interactive visual layers.",
        explanation: "deck.gl uses the graphics processor to render data as layers, such as points, polygons, paths and text. It supports picking, highlighting and filtering, and can work alongside basemap libraries including MapLibre.",
        possibilities: "Visualise many geographic observations, compare spatial patterns, or animate routes through time. A basemap supplies context while the data layers communicate measurements on top of it.",
        idea: "Explore regional night-light measurements or a large collection of photography locations without turning every observation into a separate HTML marker.",
        consideration: "Useful when the data volume or layering warrants it. For a few pins, MapLibre alone is simpler. GPU rendering does not make inaccurate or low-resolution source data more precise.",
        source: { label: "deck.gl · layers and map integration", href: "https://deck.gl/docs" },
      },
      {
        id: "cytoscape", name: "Cytoscape.js", summary: "Show how things connect to one another.",
        explanation: "Cytoscape.js is a graph visualisation and analysis library. Here, a graph means nodes and the connections between them, rather than a conventional x–y plot. It provides layouts, styling and interactive exploration for those networks.",
        possibilities: "Draw course prerequisites, biological pathways, linked concepts, or a process network. Visitors can inspect a node and follow its relationships instead of reading a long list of dependencies.",
        idea: "Add an optional prerequisite map to the course planner: selecting a class would highlight what comes before it and which later courses it unlocks.",
        consideration: "The relationships must come from a reliable dataset. A network layout cannot infer valid prerequisites or biological causality from course names or visual proximity.",
        source: { label: "Cytoscape.js · documentation and network demos", href: "https://js.cytoscape.org/" },
      },
    ],
  },
  {
    id: "behaviour", title: "Keeping the experience coherent",
    introduction: "Some tools work behind the visible effect. They help decide which state is allowed, or keep scrolling and animation in step. Their value is in how predictable the interface feels.",
    entries: [
      {
        id: "xstate", name: "XState", summary: "Describe what can happen next in an interface.",
        explanation: "XState manages application logic through events, state machines and actors. A state machine defines states and the transitions between them. Actors provide a way to organise independent pieces of behaviour that communicate through events.",
        possibilities: "Model a file upload, a multi-step form, navigation, or a tool with loading, ready, error and retry states. It helps make the rules explicit when a growing set of booleans becomes hard to reason about.",
        idea: "Structure transcript import as choose → read → review → save, with clear recovery from errors. Navigation could reject a second transition until the first is safely interrupted or complete.",
        consideration: "XState coordinates behaviour; it does not draw or animate the interface. Pair it with an animation tool only when the workflow is complex enough to benefit.",
        source: { label: "Stately · XState introduction", href: "https://stately.ai/docs/xstate" },
      },
      {
        id: "lenis", name: "Lenis", summary: "Coordinate smooth scrolling with a visual story.",
        explanation: "Lenis is a smooth-scrolling library. It provides control over scrolling and a frame loop that can be synchronised with an animation system. Its documentation shows how to connect that loop to GSAP and ScrollTrigger.",
        possibilities: "Create an editorial page where scrolling, scene changes and visual movement follow the same rhythm. It can also handle programmatic scrolling, while configuration determines how nested scrolling areas behave.",
        idea: "Try it on a dedicated visual project essay where a diagram evolves as the visitor reads. Keep the course catalogue and other practical scrolling lists straightforward.",
        consideration: "Smooth scrolling changes an important part of the browsing experience. Test trackpads, touch, anchors and reduced-motion preferences; it is an optional design choice, not a universal performance fix.",
        source: { label: "Lenis · official guide and integration notes", href: "https://github.com/darkroomengineering/lenis" },
      },
    ],
  },
];

export const toolkitChoices = [
  { goal: "Everyday layout and component changes", tools: "Motion", reason: "A direct fit for elements appearing, leaving, or changing position in React." },
  { goal: "Buttons and draggable objects with a physical feel", tools: "React Spring + use-gesture", reason: "Gesture input describes the movement; a spring shapes the response." },
  { goal: "A carefully timed or scroll-driven story", tools: "GSAP + ScrollTrigger", reason: "One timeline can coordinate many parts of a scene." },
  { goal: "A small authored illustration", tools: "dotLottie or Rive", reason: "Use a prepared animation, or build artwork that responds to state and input." },
  { goal: "A scientific chart or custom figure", tools: "Observable Plot, then D3", reason: "Start with concise marks; reach for custom geometry when needed." },
  { goal: "A geographic explorer", tools: "MapLibre, with deck.gl if needed", reason: "Separate the navigable map from large or specialised data layers." },
  { goal: "A 3D model or scene", tools: "React Three Fiber", reason: "Connect a Three.js scene to React state and controls." },
  { goal: "A workflow with several dependent steps", tools: "XState", reason: "Make valid states and recovery paths explicit." },
];
