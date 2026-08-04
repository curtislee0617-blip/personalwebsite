# Interaction toolkit

The site keeps heavy animation runtimes behind direct, client-only component imports. Nothing in this folder is mounted globally, so adding the foundations does not change an existing page or add these libraries to a route until that route imports one.

## Ready components

| Tool | Direct import | Intended job |
| --- | --- | --- |
| Rive | `@/components/interaction/rive-animation` | Interactive vector art and state machines |
| GSAP + ScrollTrigger | `@/components/interaction/gsap-scroll-scene` | Pinned, scrubbed or staged scroll chapters |
| React Three Fiber | `@/components/interaction/three-canvas` | Declarative Three.js scenes loaded without SSR |
| use-gesture | `@/components/interaction/gesture-surface` | Drag interactions composed with Motion springs |
| dotLottie | `@/components/interaction/dotlottie-animation` | Compact `.lottie` or Lottie JSON playback |
| View Transitions API | `@/lib/view-transitions` | Native continuity across same-document state changes |
| MapLibre GL JS + deck.gl | `@/components/interaction/maplibre-deck-map` | Styled vector maps with synchronized GPU data layers |
| Observable Plot | `@/components/interaction/observable-plot` | Small scientific plots generated from tidy data |
| Cytoscape.js | `@/components/interaction/cytoscape-network` | Directed networks, family trees, and pathway graphs |
| PixiJS | `@/components/interaction/pixi-particle-field` | Dense GPU-accelerated 2D particle scenes |
| Matter.js | `@/components/interaction/matter-coffee-beans` | Rigid-body physics, collisions, and pointer constraints |
| Lenis | `@/components/interaction/lenis-scroll-region` | Local smooth-scroll regions that preserve a native fallback |
| Theatre.js | `@/lib/theatre` | Development-only visual authoring and production state playback |
| XState | SCWG process-scroller machine | Explicit reading/inspection modes and stage events |

Motion and Anime.js remain the lighter default choices for ordinary interface motion and SVG timelines.

## Usage contracts

`GsapScrollScene` animates descendants carrying `data-gsap-reveal`. It automatically scopes and removes its ScrollTriggers:

```tsx
<GsapScrollScene>
  <h2 data-gsap-reveal>Process design</h2>
  <figure data-gsap-reveal>...</figure>
</GsapScrollScene>
```

`GestureSurface` is deliberately bounded and springs back to its origin:

```tsx
<GestureSurface ariaLabel="Drag the molecule" maxDistance={72}>
  <MoleculeCard />
</GestureSurface>
```

`runViewTransition` falls back to the same update when the API is unavailable or reduced motion is requested:

```tsx
await runViewTransition(() => setSelectedProject(projectId));
```

All visual runtimes pause, idle or skip animation for `prefers-reduced-motion`. Supply meaningful surrounding text or an `ariaLabel`; animation should clarify an idea rather than carry essential information by itself.

## How XState works here

XState models an interaction as a finite set of named states, the events that may occur, and the transitions those events are allowed to cause. State-machine `context` holds data that changes without becoming a mode of its own. In the SCWG reader, `reading` and `inspecting` are modes; the selected B1–B8 unit is context. `INSPECTION.TOGGLE` can only move between those two modes, while `STAGE.ACTIVATE` updates the selected unit from either one.

That distinction becomes especially useful for future tools. A draggable flowsheet could have `selecting`, `draggingEquipment`, `connectingStream`, and `validating` states. The machine can prohibit deleting a unit while a stream is being connected, invoke a validation service when the layout is submitted, and expose exactly which controls are legal at each moment. It prevents a growing set of booleans from creating impossible combinations.

## How Lenis works here

Lenis still uses the browser's scroll position; it interpolates the animated position toward the requested position on each animation frame. That consistent frame loop makes DOM, WebGL, parallax, and ScrollTrigger scenes easier to synchronize. `lerp` controls how quickly the displayed position catches up: a low value feels heavier, while a higher value feels more immediate.

The site does not enable Lenis globally. `LenisScrollRegion` is opt-in, keeps anchors enabled, and returns to ordinary native scrolling for `prefers-reduced-motion`. This avoids changing the feel of the existing site and makes it possible to test Lenis only on a future immersive chapter. Nested scroll areas, sticky elements, keyboard navigation, anchor offsets, and touch behaviour still need route-level QA before expanding its use.

## Visualization roles

- MapLibre owns cartography: basemap style, vector tiles, camera, terrain, labels, and geographic interaction. deck.gl sits above or within it for large data layers such as origins, journeys, arcs, heatmaps, terrain meshes, and animated point clouds.
- Observable Plot turns tidy rows into publication-like charts with concise marks and scales. It is the first choice for roast curves, extraction comparisons, temperatures, and distributions where a bespoke D3 scene would be unnecessary.
- Cytoscape.js treats data as nodes and edges, then applies a layout and graph interaction model. It is appropriate for coffee genetics, aroma pathways, citation networks, and equipment dependencies.
- PixiJS manages a retained 2D scene on a GPU canvas. It suits thousands of sprites, particles, labels, or animated flavour compounds better than creating thousands of DOM nodes.
- Matter.js calculates rigid-body motion and constraints. The coffee guide uses it for live falling and draggable beans; a future design sandbox can use the same foundation for equipment collision and snapping.
- Theatre.js is an animation editor and timeline. Studio is loaded only during development; an authored state file can then drive the lightweight production runtime without shipping the editor.

## Live implementation: SCWG process chapter

The gasification process chapter now gives each runtime one bounded responsibility:

- GSAP + ScrollTrigger selects B1–B8 as the report column crosses the reading line and feeds a Motion progress value.
- Motion animates the active-stage marker, readout, progress rail, and diagram inspection transform.
- Anime.js moves the dashed material streams in their PFD direction.
- use-gesture enables opt-in drag and pinch inspection; keyboard-accessible zoom and reset buttons provide the same essential controls.
- dotLottie renders the small material-flow activity signal from `/public/animations/scwg-material-flow.json`.
- `runViewTransition` moves the stage marker and viewport when a reader deliberately jumps with the B1–B8 index, while unsupported browsers perform the same update immediately.
- XState owns the reader's explicit `reading` and `inspecting` modes and the current-stage event, so future process-tool states can grow without contradictory booleans.

The Rive runtime remains ready for a purpose-built equipment-state artboard. A generic stock `.riv` file is intentionally not substituted for a chemically meaningful unit-operation animation.
