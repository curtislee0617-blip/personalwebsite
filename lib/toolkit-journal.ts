export type ToolkitEntry = {
  id: string;
  name: string;
  summary: string;
  explanation: string;
  possibilities: string;
  idea: string;
  consideration: string;
  source: { label: string; href: string };
  format?: string;
  repository?: string;
};

export type ToolkitChapter = {
  id: string;
  title: string;
  shortTitle?: string;
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
        idea: "Build a recipe explorer where results settle into new positions after filtering and the selected dish expands into its detail view. A second project could connect each creative-project thumbnail to its full case study with a shared image transition. Start with one recipe category and check that search, keyboard focus and the back button remain predictable throughout the animation.",
        consideration: "A strong starting point for everyday React UI animation. Simple colour changes can still use CSS; a second animation engine should not control the same element’s transform.",
        source: { label: "Motion · React guide", href: "https://motion.dev/docs/react" },
      },
      {
        id: "react-spring", name: "React Spring", summary: "Give movement weight, resistance, and a natural settling point.",
        explanation: "React Spring animates values using a spring model. Mass, tension and friction shape how quickly something moves and how it settles. This is useful when the destination changes while an animation is still running, such as a card following a finger.",
        possibilities: "It can animate positions, scales and other values, coordinate trails of elements, and transition items in and out. A spring can feel firm and precise or soft and elastic; it does not have to bounce visibly.",
        idea: "Make a consistent family of responsive buttons for Contact, CV and Projects, with a gentle lift on hover and a short compression on press. Try a separate course-planner experiment where a moved class settles into its term, or a theme icon that rotates and settles after a change. Start with a single contact button and tune the response on touch as well as with a mouse before applying it across the site.",
        consideration: "Use it for responsive, physical-feeling feedback. It does not fix expensive page rendering by itself, and the full-page theme reveal still needs its own transition design.",
        source: { label: "React Spring · spring configuration", href: "https://www.react-spring.dev/docs/advanced/config" },
      },
      {
        id: "gsap", name: "GSAP & ScrollTrigger", summary: "Direct a sequence, then decide what drives its progress.",
        explanation: "GSAP is an animation engine with timelines: several movements can start together, overlap, pause, or reverse. ScrollTrigger is its scroll plugin. It can start a sequence when a section enters view, pin a scene in place, or link animation progress directly to scroll position, called scrubbing.",
        possibilities: "Use it for carefully timed navigation, staggered entrances, diagrams assembled in stages, and long-form visual stories. A pinned illustration can stay beside the text while its labels and layers change with each passage.",
        idea: "Choreograph dashboard bubbles shrinking toward the centre and returning in one coordinated sequence, so navigation and the visible handover happen together. For a longer project, make a gasification report whose apparatus, flow arrows and labels appear in stages as the reader scrolls. Prototype a single entrance and exit first, then check interrupted navigation and reduced-motion behaviour before adding more layers.",
        consideration: "Choose it when timing across many elements matters. Reserve pinned scenes for places where they help explain something, especially on small screens.",
        source: { label: "GSAP · ScrollTrigger guide and demos", href: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" },
      },
      {
        id: "anime", name: "Anime.js", summary: "Build expressive sequences from shapes, text, and numbers.",
        explanation: "Anime.js is a JavaScript animation engine for visual elements and values. Its toolkit includes timelines, staggered timing, SVG and text animation, dragging, and layout animation. It can be used beyond React, which makes it useful for self-contained visual experiments.",
        possibilities: "Draw a line across an SVG diagram, introduce letters in a pattern, move labels in sequence, or coordinate a set of small illustrations. Timelines let those parts become one readable animation rather than unrelated effects.",
        idea: "Create an IR spectroscopy explainer that draws a trace, then introduces the labels for selected peaks in a readable sequence. A smaller project could animate a molecular illustration on a chemistry-tool thumbnail when someone opens its preview. Begin with one SVG trace and three annotations, with a replay control and a complete still diagram available immediately.",
        consideration: "It overlaps with GSAP and Motion. Give it a specific illustration or experiment to own, rather than layering three libraries onto every button.",
        source: { label: "Anime.js · animation toolkit", href: "https://animejs.com/documentation/" },
      },
      {
        id: "use-gesture", name: "use-gesture", summary: "Translate a hand movement into useful input.",
        explanation: "use-gesture recognises interactions such as dragging and pinching and provides movement data to your code. It tells you what the user is doing; a renderer or animation library decides how the object responds. The official guide pairs it with React Spring for dragging and returning to a resting position.",
        possibilities: "Build pinch-to-zoom figures, draggable controls, swipeable galleries, or a panel that follows a finger. Gesture data can also drive rotation, scale, or a value in an interactive tool.",
        idea: "Build a touch-friendly laboratory figure inspector where readers drag a prepared diagram and pinch to inspect its details. Another experiment could let visitors tilt a lighting demonstration by dragging across it, with a spring easing the view back into place. Start with one bounded image and visible zoom/reset buttons so the same task remains possible without gestures.",
        consideration: "Keep buttons and keyboard alternatives alongside gestures. Recognising a drag does not automatically make a drag-only interface accessible.",
        source: { label: "use-gesture · introduction and example", href: "https://use-gesture.netlify.app/docs/" },
      },
      {
        id: "view-transitions", name: "View Transitions API", summary: "Let the browser connect the old view to the new one.",
        explanation: "This is a browser API rather than an installed animation library. It captures representations of the old and new views and lets CSS animate between them. Named elements can have their own transitions instead of being included only in a whole-page fade.",
        possibilities: "Connect a project thumbnail to its full image, preserve visual continuity when changing layouts, or reveal a new colour theme across the page. It supports same-document updates and supported same-origin page navigations, with different setup requirements.",
        idea: "Build the light/dark reveal around the exact sun or moon icon, so the new palette visibly travels from the control the visitor pressed. A separate project could preserve the selected project image while its card changes into a full report. Start with the theme switch, including a direct nonanimated update for reduced motion and browsers without the API.",
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
        idea: "Create a small illustrated lab assistant that changes from waiting to thinking to finished as a real calculation progresses. Alternatively, make a sun-and-moon control whose artwork responds to the selected theme and a deliberate press. Start with three clearly defined states and keep the calculation status in text beside the illustration.",
        consideration: "It needs an authored Rive asset and a runtime. Choose it when the illustration itself is interactive; ordinary text buttons rarely need that extra production step.",
        source: { label: "Rive · introduction", href: "https://rive.app/docs/getting-started/introduction" },
      },
      {
        id: "dotlottie", name: "dotLottie", summary: "Bring a prepared animation into the page.",
        explanation: "The dotLottie web player renders .lottie files and Lottie JSON animations in the browser. It provides playback control, layout, theming, multi-animation support and interactive state machines, with wrappers for frameworks including React.",
        possibilities: "Play a loading illustration, a success checkmark, an explanatory loop, or a short branded sequence. Playback can be paused or controlled by the surrounding interface instead of running continuously.",
        idea: "Give each tools category a short loading illustration, such as a filling flask or a plotting line, which stops as soon as the tool is ready. A second project could add a brief confirmation after a calendar file has actually been prepared. Begin with one lightweight animation and a still alternative, keeping the real loading or export status visible in text.",
        consideration: "A player does not create the artwork. Asset complexity affects rendering cost, so test the actual animation on mobile and provide a still state for reduced motion.",
        source: { label: "LottieFiles · JavaScript player", href: "https://docs.lottiefiles.com/en/runtimes/distributions/js" },
      },
      {
        id: "theatre", name: "Theatre.js", summary: "Edit animation timing on a visual timeline.",
        explanation: "Theatre.js provides tools for authoring keyframed sequences visually, then playing them through code. Its guides cover HTML and SVG as well as Three.js and React Three Fiber, so a sequence can control both page graphics and 3D scenes.",
        possibilities: "Direct a camera move, adjust an object’s position across a sequence, or coordinate visual properties with audio. Keyframes are especially useful when the exact composition at particular moments matters.",
        idea: "Direct a short introduction to the Earth view that approaches the globe, turns toward the selected city and settles into its conditions display. For an engineering report, author a camera sequence that moves from the outside of a reactor to its labelled internal parts. Start with a short, skippable sequence and return control to the reader as soon as it ends.",
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
        idea: "Build a React-based apparatus viewer whose selected part stays in sync with the explanation and controls elsewhere on the page. Another project could organise the Earth surface, clouds and night lights into scene components that respond to the same time slider. Start with one exported object and two selectable components, using verified data separately from the rendering layer.",
        consideration: "It renders the scene; it does not supply astronomical calculations, weather observations, or molecular data. Those inputs and their accuracy remain separate responsibilities.",
        source: { label: "React Three Fiber · official repository and introduction", href: "https://github.com/pmndrs/react-three-fiber" },
      },
      {
        id: "pixi", name: "PixiJS", summary: "Draw rich 2D scenes with the graphics processor.",
        explanation: "PixiJS is a 2D rendering engine with WebGL and WebGPU support. It is built for interactive graphics such as games and visual applications, where many sprites and graphical elements need to be drawn together.",
        possibilities: "Build animated landscapes, dense particle scenes, illustrated interfaces, or a small browser game. It is a useful option when a scene has enough moving parts that managing each one as a normal page element becomes awkward.",
        idea: "Make a richer pixel-art landscape with drifting clouds, light rain and small details that change with the selected city. A separate interactive illustration could show particles moving through a simplified lab process, with play, pause and speed controls. Start with one compact scene and a small number of sprites, pausing it when it leaves the screen.",
        consideration: "Use it for the visual scene while keeping meaningful text and controls in accessible HTML. A canvas renderer alone does not provide a complete game or physics system.",
        source: { label: "PixiJS · rendering engine", href: "https://pixijs.com/" },
      },
      {
        id: "matter", name: "Matter.js", summary: "Make 2D objects collide, fall, and push each other.",
        explanation: "Matter.js is a two-dimensional rigid-body physics engine. It simulates objects, collisions and constraints, letting movement emerge from forces and contact rather than a predetermined animation path.",
        possibilities: "Build a pile of draggable objects, a pendulum, a seesaw, or a small mechanical playground. Objects can tumble into a container or respond to being picked up and released.",
        idea: "Create a lab-bench playground where visitors pick up simple objects, balance them on a seesaw and watch collisions. A second project could compare pendulum motion under different settings, with the simplifications explained beside the scene. Begin with three objects and a reset button, treating the result as an illustrative rigid-body experiment rather than a validated scientific simulation.",
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
        idea: "Build a linked IR-spectrum explorer where selecting a wavelength range highlights its peaks and the corresponding interpretation notes. Another project could compare a night's Sun and Moon altitude curves against a highlighted photography window. Start with one verified dataset and a shared selection between two views, keeping units and the current range visible.",
        consideration: "Choose D3 for a view that needs custom geometry or interaction. For conventional exploratory plots, Observable Plot can save substantial setup work.",
        source: { label: "D3 · capabilities and examples", href: "https://d3js.org/" },
      },
      {
        id: "plot", name: "Observable Plot", summary: "Turn a dataset into a readable chart with less setup.",
        explanation: "Observable Plot is a higher-level visualisation library built on D3. You compose marks such as dots, lines and bars; scales arrange them, transforms can derive values such as bins, and facets repeat plots for comparisons between groups.",
        possibilities: "Create histograms, scatter plots, time series, distributions, or small multiples. Layering marks makes it possible to compare raw observations with a summary in the same figure.",
        idea: "Turn one laboratory result into a browser figure where readers switch experimental groups while the axes remain consistent. A second project could compare repeated measurements with distributions and small multiples, showing the raw observations alongside the summary. Start with a saved dataset from one report and reproduce the original figure before adding exploratory controls.",
        consideration: "Start here for standard data graphics, then use D3 if the design needs finer control. Neither library validates the experiment or chooses the correct statistical method for you.",
        source: { label: "Observable Plot · marks, transforms and facets", href: "https://observablehq.github.io/plot/" },
      },
      {
        id: "maplibre", name: "MapLibre GL JS", summary: "Create a navigable map with your own visual style.",
        explanation: "MapLibre GL JS is an open-source library for interactive maps. It can render map sources with configurable styles, provide navigation and location controls, and display markers, popups and geographic layers. Its API also includes globe and terrain capabilities.",
        possibilities: "Build a restaurant explorer, a travel map, or a geographic planning tool with selectable layers. Colours and labels can be designed to match the website while retaining the familiar ability to pan and zoom.",
        idea: "Give the darkness tool a map of the selected location, candidate photography sites and a switchable light-pollution layer from an appropriately licensed source. Another project could turn the food collection into a restaurant map with filters and links to personal notes. Begin with a few curated pins and clear attribution before adding larger datasets or location permissions.",
        consideration: "The map engine does not include every dataset or a free tile service. Light pollution, terrain, weather and map tiles need their own sources, licences and attribution.",
        source: { label: "MapLibre · introduction and API", href: "https://maplibre.org/maplibre-gl-js/docs/" },
      },
      {
        id: "deck", name: "deck.gl", summary: "Put large datasets into interactive visual layers.",
        explanation: "deck.gl uses the graphics processor to render data as layers, such as points, polygons, paths and text. It supports picking, highlighting and filtering, and can work alongside basemap libraries including MapLibre.",
        possibilities: "Visualise many geographic observations, compare spatial patterns, or animate routes through time. A basemap supplies context while the data layers communicate measurements on top of it.",
        idea: "Build a regional night-light explorer where visitors compare a large set of observations on top of a map. A second project could show a photography journey as dated points and paths, with a selected stop opening its images. Start with one documented dataset and one layer, making its measurement date and resolution clear instead of presenting it as live sky brightness.",
        consideration: "Useful when the data volume or layering warrants it. For a few pins, MapLibre alone is simpler. GPU rendering does not make inaccurate or low-resolution source data more precise.",
        source: { label: "deck.gl · layers and map integration", href: "https://deck.gl/docs" },
      },
      {
        id: "cytoscape", name: "Cytoscape.js", summary: "Show how things connect to one another.",
        explanation: "Cytoscape.js is a graph visualisation and analysis library. Here, a graph means nodes and the connections between them, rather than a conventional x–y plot. It provides layouts, styling and interactive exploration for those networks.",
        possibilities: "Draw course prerequisites, biological pathways, linked concepts, or a process network. Visitors can inspect a node and follow its relationships instead of reading a long list of dependencies.",
        idea: "Add a prerequisite explorer to the course planner that highlights the courses preceding a selection and the later options it opens. A separate laboratory explainer could map the relationships between experimental steps, measurements and conclusions. Begin with a small, manually checked network and make each connection's meaning explicit before expanding the dataset.",
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
        idea: "Build a transcript-import flow with distinct choose, read, review and save states, including cancellation and a useful retry path. A second project could coordinate dashboard navigation so rapid repeated clicks cannot leave the interface between two pages. Start by mapping one workflow's events and failure cases, then connect its states to existing controls and animations.",
        consideration: "XState coordinates behaviour; it does not draw or animate the interface. Pair it with an animation tool only when the workflow is complex enough to benefit.",
        source: { label: "Stately · XState introduction", href: "https://stately.ai/docs/xstate" },
      },
      {
        id: "lenis", name: "Lenis", summary: "Coordinate smooth scrolling with a visual story.",
        explanation: "Lenis is a smooth-scrolling library. It provides control over scrolling and a frame loop that can be synchronised with an animation system. Its documentation shows how to connect that loop to GSAP and ScrollTrigger.",
        possibilities: "Create an editorial page where scrolling, scene changes and visual movement follow the same rhythm. It can also handle programmatic scrolling, while configuration determines how nested scrolling areas behave.",
        idea: "Create an optional visual essay about the gasification project, with a diagram evolving beside the text as the reader scrolls. A photography story could similarly guide readers through a location, shooting conditions and the finished images. Try one short article first, checking touch input, anchor links and reduced motion while retaining normal scrolling where the smoother behaviour adds no value.",
        consideration: "Smooth scrolling changes an important part of the browsing experience. Test trackpads, touch, anchors and reduced-motion preferences; it is an optional design choice, not a universal performance fix.",
        source: { label: "Lenis · official guide and integration notes", href: "https://github.com/darkroomengineering/lenis" },
      },
    ],
  },
];

export const toolkitDiscoveries: ToolkitChapter[] = [
  {
    id: "everyday-ux", title: "Making everyday interactions easier", shortTitle: "UI/UX",
    introduction: "Useful interface work often happens in small details: a menu staying inside the screen, a course moving to the right term, or a long list keeping up with your finger. These open source tools give those interactions a reliable foundation.",
    entries: [
      {
        id: "react-aria", name: "React Aria", format: "React components",
        summary: "Build controls that work with a mouse, a finger, or a keyboard.",
        explanation: "React Aria is Adobe’s collection of accessible React components and hooks. It supplies behaviour for controls such as date pickers, searchable selection fields, dialogs and sliders, while leaving their appearance to your own CSS. It handles details such as keyboard navigation, focus management and localised dates and numbers.",
        possibilities: "Use it to build consistent forms, menus, calendars and selectable lists. Its collection components also support drag and drop with keyboard and screen-reader interactions. The same control can adapt its behaviour to touch and mouse input without requiring separate mobile markup.",
        idea: "Build a searchable course selector with keyboard navigation, clear selection feedback and a predictable way to add courses. Another project could give the darkness tool a date picker and location dialog styled to match the website. Start with one complete control and test its labels, focus order and touch targets before reusing the pattern in transcript import.",
        consideration: "A useful foundation when adding or replacing complex controls. It supplies interaction behaviour; clear labels, readable colours and sensible page structure still belong to the design.",
        source: { label: "React Aria · components and interaction examples", href: "https://react-aria.adobe.com/" },
        repository: "https://github.com/adobe/react-spectrum",
      },
      {
        id: "floating-ui", name: "Floating UI", format: "Browser library · React integration",
        summary: "Keep a tooltip or dropdown attached to its button and inside the screen.",
        explanation: "Floating UI calculates where a floating element should sit relative to another element. It can flip a popup to the other side, shift it away from a screen edge, or adjust its size when space runs out. Its React tools also help manage opening, dismissing and interacting with those elements.",
        possibilities: "Build course previews, chart tooltips, dropdowns and small information panels that follow their anchors as the page scrolls or resizes. A tooltip can also be anchored to a coordinate, such as a point on a plot, instead of a normal button.",
        idea: "Add a course preview beside each timetable block showing its units, meeting times and actions without pushing the calendar around. A second project could attach explanations to spectrum peaks or unfamiliar chemistry terms. Start with a preview that opens on focus or tap as well as hover, and check its position at every edge of a phone screen.",
        consideration: "Choose it for custom popup positioning. Many component libraries already handle this internally, so use their built-in behaviour where it is sufficient.",
        source: { label: "Floating UI · positioning and React interactions", href: "https://floating-ui.com/docs/react" },
        repository: "https://github.com/floating-ui/floating-ui",
      },
      {
        id: "dnd-kit", name: "dnd kit", format: "Drag-and-drop library · React integration",
        summary: "Let visitors move and rearrange things deliberately.",
        explanation: "dnd kit provides the machinery for draggable items, drop targets and sortable collections. It supports lists, grids and movement between containers, with pointer, touch and keyboard input. You decide which destinations are valid and how the application’s data changes after a drop.",
        possibilities: "Make a timetable, reorder a photo collection, arrange a cooking sequence, or move cards between columns. Customisable drag previews and collision detection let the visible item and the intended destination remain clear during movement.",
        idea: "Let visitors drag a course from the catalogue into a term, highlighting valid destinations before the drop is committed. A meal-planning project could use the same idea to arrange recipe cards across the week. Start with movement between two containers and retain explicit move buttons, keyboard support and a way to undo an accidental move.",
        consideration: "Use it for moving items between meaningful destinations. React Spring can animate the resulting placement, but the drag controller and spring should not both write the same transform. Follow the current React guide when choosing packages.",
        source: { label: "dnd kit · React quickstart", href: "https://dndkit.com/react/quickstart/" },
        repository: "https://github.com/clauderic/dnd-kit",
      },
      {
        id: "tanstack-virtual", name: "TanStack Virtual", format: "Browser library · React integration",
        summary: "Keep long lists responsive by rendering the part you can see.",
        explanation: "TanStack Virtual calculates which rows are visible in a scrolling window, plus a small surrounding buffer. The interface renders those rows while preserving the scrollable space for the full list. This reduces the number of page elements the browser has to manage at once.",
        possibilities: "Use it for large course catalogues, search results or tables. It supports vertical and horizontal lists, and the two axes can be combined for grids. It supplies the calculations while you retain control over the markup and styling.",
        idea: "Make the long course catalogue beside the weekly calendar responsive by drawing only the visible rows and a small buffer. Another project could display a large experimental-results table without filling the page with thousands of elements. Start with the course list, measuring actual scrolling and preserving selection, focus and jump-to-result behaviour when rows leave the screen.",
        consideration: "Use it when rendering many rows is the bottleneck. It does not speed up the underlying search or data download. Off-screen rows are absent from the page, so keyboard focus and jump-to-result behaviour need explicit handling.",
        source: { label: "TanStack Virtual · introduction and examples", href: "https://tanstack.com/virtual/latest/docs/introduction" },
        repository: "https://github.com/TanStack/virtual",
      },
    ],
  },
  {
    id: "scientific-tools", title: "Turning scientific notes into experiments", shortTitle: "Science",
    introduction: "A report becomes more useful when a reader can change an input and inspect the result. These tools cover calculation, molecular structures and scientific charts; the equations, assumptions and original measurements still need to be supplied.",
    entries: [
      {
        id: "pyodide", name: "Pyodide", format: "Python runtime in the browser",
        summary: "Run Python calculations directly inside a web page.",
        explanation: "Pyodide brings Python to the browser through WebAssembly, a format browsers can execute alongside JavaScript. Its available scientific packages include NumPy, pandas, SciPy and Matplotlib. Python results can be passed back to the surrounding interface without requiring a separate Python server for every calculation.",
        possibilities: "Build a small data-analysis workspace, rerun a fitted curve, change a simulation parameter, or let a student experiment with a prepared Python example. Files and data needed by the calculation must be made available to that browser session.",
        idea: "Add a rerunnable laboratory analysis where readers adjust the fitting range and compare the new curve with the saved report. A second project could offer a small Python worksheet for exploring measurement uncertainty using a prepared dataset. Begin with one compatible calculation, load the runtime only on request and run the work off the main interface thread.",
        consideration: "Load the runtime only when requested and run lengthy work in a background worker to keep scrolling responsive. Check package compatibility first: a desktop notebook does not automatically become browser-ready.",
        source: { label: "Pyodide · browser use and background workers", href: "https://pyodide.org/en/stable/usage/index.html" },
        repository: "https://github.com/pyodide/pyodide",
      },
      {
        id: "rdkit-js", name: "RDKit.js", format: "Chemistry library in the browser",
        summary: "Turn a molecular description into a structure you can inspect.",
        explanation: "RDKit.js exposes a subset of the RDKit chemistry toolkit to JavaScript. It can read molecular structures, draw them as SVG or canvas graphics, and find and highlight matching substructures. A SMILES string—a compact text description of a molecule—can become a clear two-dimensional diagram.",
        possibilities: "Display a set of compounds consistently, highlight a functional group, or search for a shared structural fragment. The official examples include React integration, so chemical drawings can respond to a selection elsewhere in a page.",
        idea: "Create a functional-group explorer where selecting a group highlights it in an example molecule beside the relevant IR notes. Another project could compare a small collection of compounds by searching for a shared structural fragment. Begin with curated structures and verified labels; present the drawings as structural context rather than automatically predicting an experimental spectrum.",
        consideration: "Useful for structural visualisation and searching. It does not provide an experimental spectrum or establish a compound’s measured thermodynamic properties; those require separate evidence or models.",
        source: { label: "RDKit.js · React molecular drawing examples", href: "https://react.rdkitjs.com/" },
        repository: "https://github.com/rdkit/rdkit-js",
      },
      {
        id: "mathjs", name: "math.js", format: "JavaScript calculation library",
        summary: "Calculate with units, matrices, fractions and expressions.",
        explanation: "math.js extends JavaScript’s numerical tools with an expression parser, units, complex numbers, fractions, matrices and higher-precision number types. It also supports symbolic operations such as simplifying expressions and taking derivatives. It works in both browser and server environments.",
        possibilities: "Create an equation workspace, convert compatible units, evaluate a matrix calculation, or show how an expression changes as its inputs move. Calculations can retain units instead of relying on a separate label beside every plain number.",
        idea: "Build an engineering scratchpad where pressures, temperatures and other quantities retain their units through a calculation. A second project could let readers vary an equation's inputs and inspect the intermediate values beside the result. Start with a small set of supported quantities and reference examples, handling temperature offsets and invalid unit combinations explicitly.",
        consideration: "It provides mathematical operations, not validated physical-property models. Define accepted expressions and units, and check numerical tolerances. A volume-to-mass conversion still needs the material’s density.",
        source: { label: "math.js · capabilities and documentation", href: "https://mathjs.org/docs/" },
        repository: "https://github.com/josdejong/mathjs",
      },
      {
        id: "plotly-js", name: "Plotly.js", format: "Browser charting library",
        summary: "Make scientific plots that readers can zoom, inspect and rotate.",
        explanation: "Plotly.js is an open source JavaScript charting library with scientific chart types, including contour plots, heatmaps, error bars and three-dimensional plots. Data traces and layout settings describe the figure, while the library supplies interactions such as hovering over points and zooming into a region.",
        possibilities: "Build interactive spectra, compare repeated measurements with uncertainty bars, rotate a response surface, or inspect a dense scatter plot. It is useful when a standard scientific chart needs several built-in interactions without designing each one separately.",
        idea: "Give laboratory figures inspectable values, selectable traces and a way to compare a recalculated fit with the original measurements. A thermodynamics project could add a rotatable response surface alongside a simpler two-dimensional view. Begin with one plot that reproduces the saved report accurately, then add controls that preserve axis labels, units and uncertainty information.",
        consideration: "The JavaScript library can run independently of Plotly’s hosted products. Load only the chart types needed and avoid putting a large plotting bundle on every page. Error bars must come from a defined uncertainty calculation.",
        source: { label: "Plotly.js · library, chart types and bundles", href: "https://github.com/plotly/plotly.js" },
        repository: "https://github.com/plotly/plotly.js",
      },
    ],
  },
  {
    id: "food-tools", title: "Making recipes useful in the kitchen", shortTitle: "Food",
    introduction: "A recipe can be more than a page to read. Structured ingredients can support adjustable portions, shopping lists and cooking steps. These projects range from small parsers to an entire recipe application and a shared food database.",
    entries: [
      {
        id: "cooklang", name: "Cooklang", format: "Recipe format · parser ecosystem",
        summary: "Write a readable recipe that software can also understand.",
        explanation: "Cooklang is a plain-text recipe format with markers for ingredients, quantities, cookware and timers. The instructions remain readable, while a parser can extract the information needed for an ingredient list or cooking interface. Recipes live in portable .cook files.",
        possibilities: "Turn marked ingredients into a checklist, make timers clickable, or collect ingredients across a menu. The ecosystem includes conventions for shopping lists, pantry information and scaling; support depends on the parser or application chosen.",
        idea: "Create a cooking view with explicitly marked ingredients, adjustable portions and a timer beside each timed step. A second project could combine a few chosen recipes into a reviewed shopping list, grouping compatible quantities. Start by hand-authoring three personal recipes and verifying ingredient scaling separately from cooking temperatures, equipment sizes and timings.",
        consideration: "Cooklang describes the recipe; it does not make arbitrary prose structured automatically. The linked TypeScript parser currently lists scaling as unfinished, so scaling would need a compatible implementation. Cooking times should not simply multiply with portions.",
        source: { label: "Cooklang · recipe format and conventions", href: "https://cooklang.org/docs/spec/" },
        repository: "https://github.com/cooklang/cooklang-ts",
      },
      {
        id: "ingredient-parser", name: "Ingredient Parser", format: "Python library · import workflow or service",
        summary: "Separate an ingredient sentence into usable pieces.",
        explanation: "Ingredient Parser extracts structured information from recipe ingredient text: the food name, amount, unit, preparation and other notes. It uses a trained language model to label parts of a sentence and includes confidence values in its results. Its examples cover fractions, packaged quantities and alternative ingredients.",
        possibilities: "Turn imported ingredient lines into editable fields, standardise the presentation of quantities, or prepare data for shopping lists and portion adjustments. The original text can remain visible beside the parsed result so mistakes are easy to correct.",
        idea: "Build a recipe-import assistant that proposes quantities, units and ingredient names beside the original lines for an editor to review. Another project could help clean an existing collection by flagging ambiguous or incomplete ingredient entries. Start with a small sample of English recipes and save corrected structured data only after review, preserving the original text for comparison.",
        consideration: "This is a Python tool, so use it during import or behind a service. Review ambiguous lines, especially alternatives with different amounts; the documentation identifies cases the parser cannot fully separate.",
        source: { label: "Ingredient Parser · examples and limitations", href: "https://ingredient-parser.readthedocs.io/en/latest/tutorials/examples.html" },
        repository: "https://github.com/strangetom/ingredient-parser",
      },
      {
        id: "open-food-facts", name: "Open Food Facts", format: "Open database · public API",
        summary: "Look up information about packaged food by product or barcode.",
        explanation: "Open Food Facts is a community-maintained food-product database with an API. Records can include product names, ingredients, nutrition information and packaging images. It supplies product data for an interface you build, rather than a ready-made recipe or meal-planning screen.",
        possibilities: "Create a pantry lookup, compare labels on packaged ingredients, or connect a selected product to a shopping list. A barcode scanner would be a separate part of the interface; the database supplies the matching product record.",
        idea: "Add a pantry lookup where a visitor enters a barcode and sees the available product image and recorded ingredient list. A second project could compare the recorded labels of packaged ingredients used in a recipe and link each result back to its source. Begin with manual barcode entry and handle missing or incomplete records clearly; product data should not be treated as a guarantee about allergens.",
        consideration: "Records can be missing, outdated or incomplete, so preserve the source and do not infer safety from absent allergen data. Respect API limits and attribution requirements: the database uses ODbL, while images have a separate attribution/share-alike licence.",
        source: { label: "Open Food Facts · API, data quality and reuse terms", href: "https://openfoodfacts.github.io/openfoodfacts-server/api/" },
        repository: "https://github.com/openfoodfacts/openfoodfacts-server",
      },
      {
        id: "mealie", name: "Mealie", format: "Complete application · separate hosting",
        summary: "Organise recipes, a weekly menu and a shopping list in one place.",
        explanation: "Mealie is an open source recipe manager with a web interface and an API for other applications. It supports importing a recipe from a URL, manual editing, organising recipes into cookbooks, planning meals and collecting ingredients into a shopping list.",
        possibilities: "Run a personal recipe collection with a weekly plan, or explore its approach to grouping shopping items and managing recipes. Its API makes a separate custom interface possible if maintaining a recipe service is part of the project.",
        idea: "Set up a personal meal-planning workspace where saved recipes become a weekly menu and a shared shopping list. If a separate recipe service is worth maintaining, a custom page on this website could read that collection through Mealie's API. Start with a small private instance and decide which service owns recipes and edits before connecting it to the existing collection.",
        consideration: "This is a whole application with its own storage and deployment, not a React component to drop into a page. Direct integration would need deliberate account and data synchronisation. Its source is licensed under AGPL-3.0.",
        source: { label: "Mealie · application and documentation", href: "https://mealie.io/" },
        repository: "https://github.com/mealie-recipes/mealie",
      },
    ],
  },
  {
    id: "photography-tools", title: "Showing photographs and details well", shortTitle: "Photography",
    introduction: "A photograph deserves a good viewing experience, and a scientific image may need closer inspection than a page thumbnail allows. These tools help with viewing, metadata and composition at different stages of the image workflow.",
    entries: [
      {
        id: "photoswipe", name: "PhotoSwipe", format: "Browser image gallery",
        summary: "Open a photograph into a focused, zoomable viewing experience.",
        explanation: "PhotoSwipe is a JavaScript gallery and lightbox for mobile and desktop. It opens images from thumbnails, supports touch gestures and zooming, and can choose larger responsive image sources as a reader zooms in. The viewer can be loaded only when someone opens a photograph.",
        possibilities: "Create a travel gallery, browse a set of plated dishes, or inspect project photographs without leaving the current page. Opening and closing can visually connect the full image to its thumbnail, including a thumbnail cropped to fit a card.",
        idea: "Create a photography gallery that opens uncropped originals from the creative-project thumbnails and supports swiping between related shots. A second project could show the stages of a recipe as a captioned sequence of preparation and finished-dish photographs. Begin with one carefully sized image set, preserving meaningful captions and returning focus to the thumbnail when the gallery closes.",
        consideration: "A strong fit for normal photo galleries. Captions need explicit implementation or its caption plugin. Supply appropriately sized images so a phone does not download every original photograph in advance.",
        source: { label: "PhotoSwipe · gallery features and examples", href: "https://photoswipe.com/" },
        repository: "https://github.com/dimsemenov/PhotoSwipe",
      },
      {
        id: "openseadragon", name: "OpenSeadragon", format: "Browser viewer · tiled images",
        summary: "Explore a very large image without loading every pixel at once.",
        explanation: "OpenSeadragon displays images that can be zoomed and panned on desktop or mobile. For large images, a prepared pyramid of image tiles supplies different detail levels as the viewer moves. It supports formats and services such as Deep Zoom and IIIF, as well as ordinary images.",
        possibilities: "Show microscopy images, stitched panoramas, scanned diagrams or detailed artwork. Overlays can mark a region of interest, and additional plugins can provide annotation tools that follow the image as it moves.",
        idea: "Make a microscopy explorer where readers start with the full image, then zoom into labelled regions without enlarging the entire report. Another project could let visitors inspect a stitched landscape panorama or a detailed scan of a research diagram. Start with one prepared tiled image and a few documented landmarks, checking that labels and any scale bar stay aligned during zooming.",
        consideration: "Most useful when the original image contains enough detail to justify deep zoom. Large originals need a tile-generation and hosting step; zooming cannot restore detail missing from a small screenshot.",
        source: { label: "OpenSeadragon · image formats, controls and overlays", href: "https://openseadragon.github.io/" },
        repository: "https://github.com/openseadragon/openseadragon",
      },
      {
        id: "exifr", name: "exifr", format: "JavaScript image-metadata reader",
        summary: "Read the camera settings stored inside a photograph.",
        explanation: "exifr reads image metadata in browser or server code. Depending on the file and selected options, it can extract camera information, exposure settings, orientation, dates and GPS coordinates. It can request only selected fields rather than processing every available metadata block.",
        possibilities: "Build a camera-settings panel for a gallery, organise photos using their recorded capture times, or show which exposure settings were used for a night photograph. A visitor-selected local file can be inspected in the browser before deciding what to upload.",
        idea: "Add a How this was shot panel beside night photographs with available focal length, aperture, shutter speed and ISO. A second project could help the photo uploader suggest capture dates and camera-setting captions for review. Start with a local preview and an explicit list of fields to publish, leaving GPS coordinates and other unwanted metadata out of the public result.",
        consideration: "Some exported images have no metadata, and recorded clocks or locations can be wrong. exifr reads metadata; hiding a field in the interface does not remove it from the downloadable original image.",
        source: { label: "exifr · supported metadata and usage", href: "https://github.com/MikeKovarik/exifr" },
        repository: "https://github.com/MikeKovarik/exifr",
      },
      {
        id: "cropper-js", name: "Cropper.js", format: "Browser image-editing component",
        summary: "Choose the crop yourself before an image becomes a thumbnail.",
        explanation: "Cropper.js supplies an interactive image-cropping interface. Its current design uses custom elements that can be composed into an editor, with controls for selecting an area and transforming the image. The selected region can be exported through a canvas for the surrounding application to save.",
        possibilities: "Let an editor position a crop, zoom into a subject, rotate an image, or prepare different aspect ratios for cards and banners. This gives the person choosing the image more control than an automatic centre crop.",
        idea: "Build an image-upload preview where an editor positions the subject for a desktop project card and a mobile thumbnail before saving. A second project could prepare consistent recipe-cover images while retaining the uncropped original for the gallery. Start with two target aspect ratios and show both resulting crops together so the choice is visible before publication.",
        consideration: "Use it as an editing step and retain the original image separately. Uploading, resizing, compression and permanent storage still need to be handled by the website’s image workflow.",
        source: { label: "Cropper.js · guide and editor examples", href: "https://fengyuanchen.github.io/cropperjs/guide.html" },
        repository: "https://github.com/fengyuanchen/cropperjs",
      },
    ],
  },
];

export const toolkitCreativeChapter: ToolkitChapter = {
  id: "design-and-3d", title: "From a design to an interactive world", shortTitle: "Design & 3D",
  introduction: "Designing an interface, making its artwork and running an interactive scene are different stages of the same project. These six tools connect those stages: sketch and prototype the experience, create the assets, then bring them into the website.",
  entries: [
    {
      id: "blender", name: "Blender", format: "Desktop app · 3D modelling, animation and rendering",
      summary: "Create the objects, lighting and animation that give a scene its character.",
      explanation: "Blender is an open source 3D creation suite for modelling, sculpting, rigging, animation, simulation and rendering. You can build an object, give it materials, place lights and cameras, and animate a sequence. The result can become a finished image or video, or a model exported for an interactive viewer.",
      possibilities: "Make an exploded equipment diagram, a looping scientific illustration, stylised food, or a scene that demonstrates photographic lighting. Blender supports glTF/GLB export, which can carry suitable models and animations into a browser renderer such as Three.js.",
      idea: "Model a simplified gasification reactor and animate its major parts separating into a labelled cutaway. Another project could compare lighting setups around a plated dish to explain how a photograph was made. Start with a small animated flask for a chemistry thumbnail, testing a compact web export before committing to a detailed scene.",
      consideration: "Install Blender to author the asset; visitors receive the export. Complex materials and simulations may need baking or simplification for the web. Use a rendered loop when the reader does not need to manipulate the scene.",
      source: { label: "Blender · creation tools and features", href: "https://www.blender.org/features/" },
      repository: "https://github.com/blender/blender",
    },
    {
      id: "penpot", name: "Penpot", format: "Browser design app · hosted or self-hosted",
      summary: "Design the layout and reusable pieces before building the page.",
      explanation: "Penpot is an open source interface-design platform with vector drawing, reusable components, shared libraries, design tokens and interactive prototypes. Its layout tools use concepts from CSS Grid and Flexbox, so spacing and resizing can be explored as rules rather than only as fixed pictures.",
      possibilities: "Create desktop and mobile layouts, define light and dark colour palettes, organise icons, or make a clickable page flow. Developers can inspect design properties and access SVG, CSS and HTML information to guide the implementation.",
      idea: "Design one consistent family of tool cards for desktop, tablet and mobile, including thumbnail proportions, spacing and the dark-green palette. A second project could prototype the weekly scheduler with its search list, calendar and export controls at each screen size. Start with a small component library containing one card, button, menu and form field, then try those pieces in two real page layouts.",
      consideration: "Use the hosted browser app or run your own instance. Design files and prototypes guide the website build; application logic, responsive behaviour and production animation still need implementation and checking in the actual page.",
      source: { label: "Penpot · design, prototypes and developer handoff", href: "https://penpot.app/" },
      repository: "https://github.com/penpot/penpot",
    },
    {
      id: "godot", name: "Godot Engine", format: "Game editor · export a browser experience",
      summary: "Build a small world with its own rules and interactions.",
      explanation: "Godot is an open source engine for 2D and 3D games and interactive experiences. Its editor organises objects into reusable scenes, with tools for animation, input, physics and scripting. A web export packages a project so it can run inside a compatible browser.",
      possibilities: "Create a walkable pixel-art environment, a small learning game, or an interactive lab with objects that respond to the visitor. The scene can have its own controls and progress while the surrounding website provides the introduction and explanation.",
      idea: "Make an optional Explore the lab page where visitors move a character between stations and discover short explanations of the laboratory experiments. A separate world could connect London, LA and Hong Kong through the existing pixel-art settings. Start with one room, one interaction and touch-friendly controls, then export and test that small scene in the browser before adding more areas.",
      consideration: "Author in the editor and load the exported experience on demand. Plan for the web renderer and mobile controls early. Godot 4 web exports currently require WebAssembly and WebGL 2; C# projects cannot currently use that export path.",
      source: { label: "Godot · web export capabilities and requirements", href: "https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html" },
      repository: "https://github.com/godotengine/godot",
    },
    {
      id: "three-js", name: "Three.js", format: "Browser 3D library · already used by this site",
      summary: "Put a 3D scene directly into the website and connect it to the controls.",
      explanation: "Three.js is a JavaScript library for rendering scenes made from geometry, materials, cameras and lights. Its loaders can bring in exported assets such as glTF models, and its animation tools can play their clips. It provides the underlying graphics layer used by React Three Fiber.",
      possibilities: "Build a rotatable object, animate a cutaway, change lighting with a slider, or connect a model’s state to a form. The site already uses Three.js for the Earth renderer, including surface textures and the lighting driven by the astronomical calculations.",
      idea: "Load a Blender-made apparatus into a project report so readers can rotate it, select a component and reveal its explanation. Another project could extend the existing Earth with clear location markers and a guided view of daylight moving over the selected city. Start with a single compact model and accessible controls, using the site's existing Three.js setup as the reference for loading and rendering.",
      consideration: "Three.js is already a website dependency. New scenes still need assets and interaction code. Keep explanatory labels and controls in accessible HTML, and load detailed models only when the scene is needed.",
      source: { label: "Three.js · rendering, loaders and animation documentation", href: "https://threejs.org/docs/" },
      repository: "https://github.com/mrdoob/three.js",
    },
    {
      id: "dust3d", name: "Dust3D", format: "Desktop app · low-poly models and character animation",
      summary: "Turn a simple connected sketch into a small 3D character.",
      explanation: "Dust3D creates low-poly models from nodes and edges drawn on a two-dimensional canvas. It generates the mesh and helps automate UV unwrapping and rigging, which prepare the surface for textures and the model for posing. Its character tools also support procedural animation and GLB/FBX export.",
      possibilities: "Sketch a stylised creature, make a small mascot, or create simple organic props to use in another scene. Exported assets can be refined in a larger modelling workflow or loaded into a compatible renderer or game engine.",
      idea: "Sketch a small lab companion with an idle motion and a brief reaction when a calculation completes. A second project could create a family of stylised creatures or organic props for a playable laboratory scene. Start with one simple model, check its geometry and animation in the target viewer, and export a still version for thumbnails and reduced-motion viewing.",
      consideration: "Use it when its sketch-based workflow suits the form you want. Check the exported geometry and animation in the target viewer. Detailed machinery or precise scientific geometry will generally need a different modelling approach.",
      source: { label: "Dust3D · sketching, rigging and export workflow", href: "https://dust3d.org/" },
      repository: "https://github.com/huxingyi/dust3d",
    },
    {
      id: "quant-ux", name: "Quant-UX", format: "Browser prototyping and usability-research app",
      summary: "Find out whether people understand a proposed interaction.",
      explanation: "Quant-UX is an open source tool for building interactive prototypes and studying how people use them. Its research features include click heatmaps and views of the paths people take through a prototype. Those observations help identify missed controls, confusing screens and unexpected routes.",
      possibilities: "Compare proposed navigation layouts, try a new form flow, or evaluate whether participants can complete a specific task. Use the observations alongside their feedback to decide what to revise before committing to a full implementation.",
      idea: "Prototype the weekly scheduler and ask participants to add two overlapping courses, move them to a term and find the Google Calendar export. Another study could compare two mobile tools-page layouts by asking people to find the darkness tracker and choose a date. Start with one task and a small round of feedback, using interaction paths and participant comments to guide the next revision.",
      consideration: "Use the hosted application or a self-hosted setup for prototype studies. Adding its name to the toolkit does not instrument the live website. A heatmap shows interaction patterns; it needs a clear task and user feedback to explain why those patterns occur.",
      source: { label: "Quant-UX · prototype analytics and user journeys", href: "https://www.quant-ux.com/features/analytics/" },
      repository: "https://github.com/KlausSchaefers/quant-ux",
    },
  ],
};

export const toolkitNewChapters = [...toolkitDiscoveries, toolkitCreativeChapter];
export const allToolkitChapters = [...toolkitChapters, ...toolkitNewChapters];
export const toolkitEntryCount = allToolkitChapters.reduce((total, chapter) => total + chapter.entries.length, 0);
export const toolkitDiscoveryCount = toolkitNewChapters.reduce((total, chapter) => total + chapter.entries.length, 0);

export const toolkitChoices = [
  { goal: "Everyday layout and component changes", tools: "Motion", reason: "A direct fit for elements appearing, leaving, or changing position in React." },
  { goal: "Buttons and draggable objects with a physical feel", tools: "React Spring + use-gesture", reason: "Gesture input describes the movement; a spring shapes the response." },
  { goal: "A carefully timed or scroll-driven story", tools: "GSAP + ScrollTrigger", reason: "One timeline can coordinate many parts of a scene." },
  { goal: "A small authored illustration", tools: "dotLottie or Rive", reason: "Use a prepared animation, or build artwork that responds to state and input." },
  { goal: "A scientific chart or custom figure", tools: "Observable Plot, then D3", reason: "Start with concise marks; reach for custom geometry when needed." },
  { goal: "A geographic explorer", tools: "MapLibre, with deck.gl if needed", reason: "Separate the navigable map from large or specialised data layers." },
  { goal: "A 3D model or scene", tools: "React Three Fiber", reason: "Connect a Three.js scene to React state and controls." },
  { goal: "A workflow with several dependent steps", tools: "XState", reason: "Make valid states and recovery paths explicit." },
  { goal: "Accessible menus, calendars and selection fields", tools: "React Aria; Floating UI for custom popups", reason: "Start with input and focus behaviour, then solve special positioning needs." },
  { goal: "Moving courses between terms", tools: "dnd kit", reason: "Handle drop targets and keyboard interaction, then update the saved plan." },
  { goal: "A smoother large course catalogue", tools: "TanStack Virtual", reason: "Render the visible rows rather than the entire catalogue." },
  { goal: "A lab analysis readers can rerun", tools: "Pyodide + Plotly.js", reason: "Run compatible Python calculations and present interactive scientific plots." },
  { goal: "Molecular structures or unit-aware calculations", tools: "RDKit.js / math.js", reason: "RDKit handles chemical structures; math.js handles mathematical expressions and units." },
  { goal: "Recipes with structured ingredients", tools: "Cooklang + Ingredient Parser", reason: "Use explicit markup for new recipes and reviewed parsing for imported text." },
  { goal: "A pantry or meal-planning companion", tools: "Open Food Facts / Mealie", reason: "Look up packaged products, or run a complete recipe and meal-planning service." },
  { goal: "A photo gallery or a detailed scientific image", tools: "PhotoSwipe / OpenSeadragon", reason: "Use a lightbox for photos and tiled zoom for very large originals." },
  { goal: "Better photo uploads and context", tools: "Cropper.js + exifr", reason: "Choose a thumbnail crop and read selected camera settings from the original." },
  { goal: "Designing a consistent responsive page", tools: "Penpot", reason: "Work out components, spacing and colour tokens before implementing the page." },
  { goal: "An animated model inside a project report", tools: "Blender + Three.js", reason: "Author the asset in Blender, then load it into a scene connected to the page controls." },
  { goal: "A stylised character or small organic model", tools: "Dust3D", reason: "Sketch a mesh, prepare its movement and export it for a viewer or game." },
  { goal: "A playable lab or pixel-art world", tools: "Godot Engine", reason: "Use a scene editor, game logic and a web export for a dedicated experience." },
  { goal: "Checking whether a proposed flow makes sense", tools: "Quant-UX", reason: "Test a prototype with concrete tasks and inspect the paths people take." },
];

type ToolkitProject = {
  id: string;
  title: string;
  category: string;
  scope: string;
  description: string;
  tools: { id: string; role: string }[];
  firstVersion: string;
};

export const toolkitProjects: ToolkitProject[] = [
  {
    id: "living-chemistry-card",
    title: "A chemistry thumbnail that comes to life",
    category: "Design & animation", scope: "Small first build",
    description: "Turn the chemistry card into a small scene: a flask fills or gently rotates when the visitor explores it, then settles back into a clear thumbnail. The title and action stay readable, with a still version for reduced motion and a deliberate tap interaction on touch screens.",
    tools: [
      { id: "penpot", role: "Design the card, text placement and still state at desktop, tablet and phone sizes." },
      { id: "blender", role: "Model a simple flask and export a compact model with a short animation clip." },
      { id: "three-js", role: "Load and play that asset inside the card, pausing it off screen and connecting it to the page controls." },
    ],
    firstVersion: "One flask, one animation and one tool card. Check the exported asset on a phone before creating a whole set of animated thumbnails.",
  },
  {
    id: "night-photography-field-guide",
    title: "A night-photography field guide",
    category: "Photography & astronomy", scope: "Build in stages",
    description: "Connect the Earth view, a local map and an evening timeline so visitors can compare candidate photography sites at a chosen date and time. Keep astronomical predictions, weather observations and historical light-pollution measurements separately labelled, including their sources and dates.",
    tools: [
      { id: "three-js", role: "Render the globe and its illumination using the site's astronomical calculations." },
      { id: "maplibre", role: "Show the chosen area, curated observation sites and appropriately licensed map layers." },
      { id: "d3", role: "Draw linked Sun and Moon altitude curves and highlight the selected photography window." },
      { id: "deck", role: "Add a regional measurement layer if the dataset becomes too large or specialised for simple map markers." },
    ],
    firstVersion: "Compare two sites near LA on one date using the existing astronomy calculations. Add pollution and weather layers only once their coverage, licensing and update frequency are understood.",
  },
  {
    id: "rerunnable-lab-report",
    title: "A laboratory report readers can rerun",
    category: "Science", scope: "Focused experiment",
    description: "Place a small analysis workspace beside a saved lab figure, letting readers adjust a fitting range or model parameter and compare the result with the original report. Show the code, inputs, units and saved reference result so the experiment remains understandable and reproducible.",
    tools: [
      { id: "pyodide", role: "Run the compatible Python analysis in a worker after the reader requests it." },
      { id: "plotly-js", role: "Plot the measurements and recalculated curve with inspectable values and selectable traces." },
      { id: "react-aria", role: "Provide labelled parameter controls, a clear run action and predictable keyboard navigation." },
    ],
    firstVersion: "Use one existing lab dataset and one adjustable parameter. Match the saved result before introducing more models or user-provided data.",
  },
  {
    id: "molecules-and-spectra",
    title: "A molecule-to-spectrum learning notebook",
    category: "Chemistry", scope: "Focused experiment",
    description: "Let readers choose a functional group, inspect a molecule containing it and explore an annotated reference spectrum beside the structure. A small calculation panel could explain a related conversion or equation; the spectral examples would be curated measurements or references, not automatic predictions from a drawing.",
    tools: [
      { id: "rdkit-js", role: "Render the molecular structures and highlight the selected functional group." },
      { id: "anime", role: "Introduce a prepared SVG spectrum and its annotations in a short, replayable sequence." },
      { id: "mathjs", role: "Evaluate the accompanying unit-aware examples and show intermediate quantities." },
    ],
    firstVersion: "Three curated molecules and their sourced examples, with a static annotated view available before any animation plays.",
  },
  {
    id: "course-planning-workspace",
    title: "A course workspace that feels direct",
    category: "Planning & UI/UX", scope: "Improve an existing tool",
    description: "Bring the catalogue, weekly timetable and four-year plan into one consistent interaction pattern. Visitors could inspect a course, move it to a term and see exactly what changed, while overlapping meetings remain visible and course colours stay consistent.",
    tools: [
      { id: "tanstack-virtual", role: "Keep the long catalogue responsive by rendering its visible rows." },
      { id: "dnd-kit", role: "Handle course movement and valid drop targets, alongside the existing move-to-term control." },
      { id: "react-spring", role: "Settle the final placement after a move, without competing with the drag controller's transform." },
      { id: "floating-ui", role: "Keep course previews and unit details beside the selected block and inside the screen." },
    ],
    firstVersion: "Move one course between two terms, with keyboard support and undo. Expand to the full plan only after selection, scrolling and saved data stay reliable.",
  },
  {
    id: "prerequisite-explorer",
    title: "A map of the courses that open doors",
    category: "Planning", scope: "Needs a checked dataset",
    description: "Give the course planner a visual companion showing which courses lead into a chosen subject. Selecting a node could reveal its prerequisites and later options, alongside a plain list that remains usable without navigating the graph.",
    tools: [
      { id: "cytoscape", role: "Lay out the prerequisite network and highlight the selected course's connections." },
      { id: "react-aria", role: "Provide an accessible course search and selection panel beside the network." },
      { id: "penpot", role: "Work out how the graph and details share space on a tablet or narrow screen." },
    ],
    firstVersion: "A small sequence of courses checked against the official catalogue, including any alternatives or conditions. Do not infer requirements from graph position or course numbering.",
  },
  {
    id: "transcript-review-flow",
    title: "A transcript import that explains every step",
    category: "Planning & UI/UX", scope: "Improve an existing tool",
    description: "Make transcript import feel clear from file selection to the final reviewed course list. Visitors would see what was recognised, correct ambiguous matches and confirm what will be added before the plan changes.",
    tools: [
      { id: "xstate", role: "Coordinate reading, review, cancellation, saving and recovery from errors." },
      { id: "react-aria", role: "Supply accessible dialogs, selection controls and focus handling through the review." },
      { id: "dotlottie", role: "Play a short progress or confirmation illustration tied to the actual operation state." },
    ],
    firstVersion: "Improve the review of one supported transcript format, showing duplicates and unmatched courses explicitly. Animation should reflect progress, never delay it.",
  },
  {
    id: "recipes-to-weekly-menu",
    title: "From a saved recipe to a week of meals",
    category: "Food", scope: "Build in stages",
    description: "Turn a small recipe collection into adjustable servings, a weekly menu and a reviewed shopping list. The main work is agreeing on reliable ingredient data and which system owns edits, so quantities do not silently diverge between a recipe and the plan.",
    tools: [
      { id: "cooklang", role: "Provide explicit ingredient and step markup for newly structured personal recipes." },
      { id: "ingredient-parser", role: "Suggest structured fields for imported ingredient lines, with human review before saving." },
      { id: "mealie", role: "Optionally host the recipe and meal-plan service; its API would need an explicit mapping from the site's recipe format." },
      { id: "motion", role: "Animate recipe filtering and menu rearrangement after the underlying data has changed." },
    ],
    firstVersion: "Three checked recipes, two serving sizes and one combined shopping list. Decide whether Mealie adds value before introducing a separate service.",
  },
  {
    id: "pantry-label-companion",
    title: "A pantry companion for packaged ingredients",
    category: "Food", scope: "Small first build",
    description: "Let visitors enter a product barcode, review its available label information and attach it to an ingredient in a planned meal. Missing fields and uncertain matches would remain visible rather than being filled with assumptions.",
    tools: [
      { id: "open-food-facts", role: "Supply available product images and recorded label information with source links." },
      { id: "react-aria", role: "Provide a labelled lookup form and a clear result-selection interaction." },
      { id: "xstate", role: "Coordinate loading, no-match, review and save states without losing the entered barcode." },
    ],
    firstVersion: "Manual lookup and review of one product at a time. Camera scanning can follow later as a separate feature; product records do not guarantee allergen safety.",
  },
  {
    id: "photographic-field-notes",
    title: "A photographic field-notes atlas",
    category: "Photography", scope: "Build in stages",
    description: "Combine a curated location map with uncropped photographs and a short explanation of how each shot was made. The upload workflow would prepare intentional thumbnail crops and let the editor choose which camera settings and location information become public.",
    tools: [
      { id: "photoswipe", role: "Open complete images from their thumbnails and let readers browse a related sequence." },
      { id: "exifr", role: "Read available exposure settings for editorial review before publication." },
      { id: "cropper-js", role: "Prepare consistent cover crops while preserving the original image." },
      { id: "maplibre", role: "Connect each story to a deliberately chosen public location or general area." },
    ],
    firstVersion: "One six-photo story with manually approved captions and metadata. Keep precise GPS information private unless the editor deliberately chooses to publish it.",
  },
  {
    id: "microscopy-observation-desk",
    title: "A microscopy observation desk",
    category: "Science & photography", scope: "Needs prepared images",
    description: "Pair a detailed laboratory image with plots describing its documented observations. Readers could select a labelled region, inspect it at higher resolution and see the corresponding measurement group without losing the overview.",
    tools: [
      { id: "openseadragon", role: "Display the prepared tiled image and keep documented region markers aligned while zooming." },
      { id: "plot", role: "Present the related measurements as consistent small multiples or distributions." },
      { id: "react-aria", role: "Offer a keyboard-accessible region selector and reset controls beside the image." },
    ],
    firstVersion: "One image, three regions and a verified table linking them to measurements. Include a calibrated scale only when the source provides enough information.",
  },
  {
    id: "inside-the-reactor",
    title: "A scroll-through journey inside the reactor",
    category: "Engineering & storytelling", scope: "Larger visual project",
    description: "Turn the gasification case study into an illustrated explanation of how material moves through the apparatus. The reader could progress from the whole system to individual components, then pause and inspect a selected part, with the original report still available as ordinary text and figures.",
    tools: [
      { id: "blender", role: "Author the simplified reactor, internal parts and exportable materials." },
      { id: "react-three-fiber", role: "Connect the Three.js scene, selected component and report controls through React." },
      { id: "theatre", role: "Author the camera and component sequence on a visual timeline." },
      { id: "gsap", role: "Use ScrollTrigger to drive that sequence's progress and coordinate the surrounding text, with one owner for each animated property." },
      { id: "lenis", role: "Optionally synchronise editorial scrolling after the story works with normal browser scrolling." },
    ],
    firstVersion: "A three-part cutaway with a manual progress slider. Add scroll control only once the exported model, explanations and mobile still view are clear.",
  },
  {
    id: "explore-the-lab",
    title: "A small laboratory you can walk around",
    category: "Games & science", scope: "Larger interactive project",
    description: "Build an optional playable lab where a small character visits experiment stations and opens brief experiment explanations. The website would introduce the experience and load it on demand, with normal report links available to anyone who prefers to read directly.",
    tools: [
      { id: "dust3d", role: "Sketch and export a simple companion character, checking the exported animation in the target scene." },
      { id: "blender", role: "Model a few lightweight props and refine assets that need a more detailed workflow." },
      { id: "godot", role: "Build the room, controls, interaction rules and compatible browser export." },
    ],
    firstVersion: "One room, one character and one experiment station. Test loading, keyboard and touch controls on the web before building a larger world.",
  },
  {
    id: "responsive-site-personality",
    title: "A shared language for buttons and themes",
    category: "Design & UI/UX", scope: "Improve existing interactions",
    description: "Give the site a coherent set of responses: buttons acknowledge presses, the theme changes from the sun or moon icon, and an illustrated helper reacts to meaningful events. Each effect would have a clear owner so repeated input can interrupt or complete it without overlapping renderings.",
    tools: [
      { id: "react-spring", role: "Handle restrained hover and press responses on the actual buttons." },
      { id: "view-transitions", role: "Coordinate the page-wide colour reveal around the icon's measured position, with a direct fallback." },
      { id: "rive", role: "Animate a separate illustration whose state follows the chosen theme or a completed calculation." },
      { id: "xstate", role: "Coordinate the interaction states if interruptions and dependent steps become complex enough to need it." },
    ],
    firstVersion: "One contact button and one theme switch, checked under repeated taps, keyboard input and reduced motion. Introduce the illustrated helper only after the controls feel reliable.",
  },
  {
    id: "physics-on-the-bench",
    title: "A pocket physics bench",
    category: "Science & playful interaction", scope: "Focused experiment",
    description: "Make a small 2D scene where visitors move weights, balance a beam and reset the experiment. Use it to invite exploration of a simplified model, with its assumptions explained and numerical results presented as illustrative until independently validated.",
    tools: [
      { id: "matter", role: "Calculate rigid-body motion, collisions and constraints." },
      { id: "pixi", role: "Draw the apparatus and sprites using positions supplied by the physics simulation." },
      { id: "use-gesture", role: "Translate deliberate pointer or touch gestures into input for the scene, alongside ordinary buttons." },
    ],
    firstVersion: "A beam, two weights and a reset control. Keep input handling separate from the physics update, and provide controls that do not require dragging.",
  },
  {
    id: "test-before-building",
    title: "A design study before the next redesign",
    category: "Design & research", scope: "Small first study",
    description: "Compare two proposed layouts for finding tools or exporting a weekly schedule before rebuilding those pages. Define a concrete task, observe where participants go and ask what they expected; treat the observations as guidance for the next iteration rather than proof that one layout works for everyone.",
    tools: [
      { id: "penpot", role: "Develop the visual layouts and reusable components at the intended screen sizes." },
      { id: "quant-ux", role: "Recreate the relevant flow as a testable prototype and inspect participant paths, clicks and feedback." },
    ],
    firstVersion: "Two mobile layouts and one task, such as selecting two courses and finding the calendar export. Test the resulting implementation separately for performance and accessibility.",
  },
];
