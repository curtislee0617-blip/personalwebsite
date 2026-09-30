"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Coordinates } from "@/lib/astronomical-darkness";
import { earthLighting, earthVector } from "@/lib/earth-lighting";
import { CITY_LIGHTS_FADE, EARTH_PLAYBACK_RATE, globeDotPositions } from "@/lib/globe-effects";
import { sampleEarthTimeline, type EarthTimeline } from "@/lib/earth-timeline";
import { globeViewpoint } from "@/lib/sky-locations";

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 sunDirection;
  uniform vec3 moonDirection;
  uniform float moonFraction;
  uniform float moonDistance;
  uniform float moonEnabled;
  uniform float dotted;
  uniform vec2 cityLightFade;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 base = texture2D(dayMap, vUv).rgb;
    vec3 lights = texture2D(nightMap, vUv).rgb;
    float solar = dot(n, sunDirection);
    // Solar disc crossing the geometric horizon. Twilight extends below it.
    // Adapted from flutter_earth_globe's textureSwap shader (MIT).
    // dot(normal, sunDirection) equals its latitude/longitude cosine formula.
    float day = smoothstep(0.0, 1.0, clamp(solar / 0.12 + 0.5, 0.0, 1.0));
    float twilight = smoothstep(-0.1045, 0.0, solar) * (1.0 - day);
    float night = 1.0 - day;
    // Lights start before sunset and stay visible through dawn. Their emission
    // is separate from surface illumination and the -18° astronomy threshold.
    float cityLights = 1.0 - smoothstep(cityLightFade.x, cityLightFade.y, solar);
    vec3 localMoon = normalize(moonDirection * moonDistance - n * 6378.14);
    float lunar = max(0.0, dot(n, localMoon));
    float moonlight = moonEnabled * moonFraction * moonFraction * lunar * night;
    vec3 daytime = mix(base, vec3(0.006, 0.025, 0.04), dotted);
    vec3 nightSurface = base * 0.009;
    vec3 color = mix(nightSurface, daytime * (0.75 + 0.7 * pow(max(solar, 0.0), 0.35)), day);
    color += lights * cityLights * 2.3;
    color += base * twilight * vec3(0.08, 0.10, 0.17);
    color += base * moonlight * vec3(0.025, 0.035, 0.06);
    float rim = pow(1.0 - max(0.0, dot(n, normalize(cameraPosition - vPosition))), 4.0);
    color += rim * vec3(0.035, 0.19, 0.4) * smoothstep(-0.15, 0.35, solar);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

type EarthHandle = { redraw: () => void; focus: (spot: Coordinates) => void; rotate: (degrees: number) => void };
type Props = { instant: Date; location: Coordinates; showMoon?: boolean; showClouds?: boolean; playing?: boolean; compact?: boolean; dotted?: boolean; timeline?: RefObject<EarthTimeline | null> };

export function EarthCanvas({ instant, location, showMoon = false, showClouds = true, playing = false, compact = false, dotted = false, timeline }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<EarthHandle | null>(null);
  const latest = useRef({ instant, location, showMoon, showClouds, playing, dotted, timeline, updated: 0 });
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    latest.current = { instant, location, showMoon, showClouds, playing, dotted, timeline, updated: performance.now() };
    handle.current?.redraw();
  }, [instant, location, showMoon, showClouds, playing, dotted, timeline]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch {
      const failure = requestAnimationFrame(() => setUnavailable(true));
      return () => cancelAnimationFrame(failure);
    }
    // Match Retina pixels instead of stretching the thumbnail's 1.5× buffer.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const detailedSky = !compact && container.clientWidth * renderer.getPixelRatio() > 1000
      && renderer.capabilities.maxTextureSize >= 8192;
    renderer.domElement.setAttribute("aria-label", "Earth with geographically aligned sunlight and city lights. Drag to look around.");
    renderer.domElement.setAttribute("role", "img");
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
    let frame = 0;
    let alive = true;
    let visible = true;
    let previousFrame = 0;
    let computedTime = Number.NaN;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const render = () => {
      if (alive && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    };
    const loader = new THREE.TextureLoader();
    const textures = ["day", "night"].map(name => {
      const texture = loader.load(`/astronomy/earth-${name}${compact ? "-2k" : "-4k"}.webp`, loaded => {
        if (!alive) { loaded.dispose(); return; }
        render();
      }, undefined, () => { if (alive) setUnavailable(true); });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return texture;
    });
    const geometry = new THREE.SphereGeometry(1, 96, 64);
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: {
      dayMap: { value: textures[0] }, nightMap: { value: textures[1] },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) }, moonDirection: { value: new THREE.Vector3(1, 0, 0) },
      moonFraction: { value: 0 }, moonDistance: { value: 384400 }, moonEnabled: { value: 0 }, dotted: { value: 0 },
      cityLightFade: { value: new THREE.Vector2(Math.sin(CITY_LIGHTS_FADE.fullAltitude * Math.PI / 180), Math.sin(CITY_LIGHTS_FADE.offAltitude * Math.PI / 180)) },
    } });
    scene.add(new THREE.Mesh(geometry, material));
    const landTexture = loader.load("/astronomy/earth-land-mask.webp", () => { if (alive) render(); });
    // A single transparent shell extends the flutter_earth_globe-inspired
    // sunlight blend. NASA's historical cloud pattern is illustrative, not live.
    const cloudTexture = loader.load("/astronomy/earth-clouds-2k.webp", loaded => {
      if (!alive) { loaded.dispose(); return; }
      render();
    });
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const cloudMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: `
        uniform sampler2D cloudMap;
        uniform sampler2D landMap;
        uniform vec3 sunDirection;
        uniform float drift;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          float density = texture2D(cloudMap, vec2(fract(vUv.x + drift), vUv.y)).r;
          float land = smoothstep(0.25, 0.75, texture2D(landMap, vUv).r);
          // Thin wisps stay transparent; even dense clouds reveal the land below.
          float alpha = pow(smoothstep(0.18, 0.95, density), 1.4) * mix(0.46, 0.24, land);
          float solar = dot(normalize(vNormal), sunDirection);
          float day = smoothstep(-0.10, 0.16, solar);
          float sunset = exp(-pow(solar / 0.13, 2.0));
          vec3 color = mix(vec3(0.035, 0.065, 0.11), vec3(0.88, 0.94, 1.0), day);
          color = mix(color, vec3(0.7, 0.38, 0.24), sunset * 0.25);
          gl_FragColor = vec4(color, alpha * mix(0.5, 1.0, day));
          #include <colorspace_fragment>
        }
      `,
      uniforms: { cloudMap: { value: cloudTexture }, landMap: { value: landTexture }, sunDirection: material.uniforms.sunDirection, drift: { value: 0 } },
      transparent: true, depthWrite: false,
    });
    const clouds = new THREE.Mesh(geometry, cloudMaterial);
    clouds.scale.setScalar(1.004);
    scene.add(clouds);
    // One point-cloud draw replaces the source's individual dot meshes.
    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(globeDotPositions(), 3));
    const dotMaterial = new THREE.ShaderMaterial({
      uniforms: { landMap: { value: landTexture }, sunDirection: material.uniforms.sunDirection, pixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        uniform sampler2D landMap;
        uniform vec3 sunDirection;
        uniform float pixelRatio;
        varying float vLight;
        varying float vLand;
        void main() {
          vec3 n = normalize(position);
          vec2 uv = vec2(atan(-n.z, n.x) / 6.28318530718 + 0.5, asin(n.y) / 3.14159265359 + 0.5);
          vLand = step(0.5, texture2D(landMap, uv).r);
          vLight = smoothstep(-0.08, 0.12, dot(n, sunDirection));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.0 * pixelRatio;
        }
      `,
      fragmentShader: `
        varying float vLight;
        varying float vLand;
        void main() {
          if (vLand < 0.5) discard;
          float radius = length(gl_PointCoord - 0.5);
          float alpha = (1.0 - smoothstep(0.25, 0.5, radius)) * (0.055 + 0.9 * vLight);
          gl_FragColor = vec4(mix(vec3(0.17, 0.35, 0.5), vec3(0.48, 0.8, 0.83), vLight), alpha);
          #include <colorspace_fragment>
        }
      `, transparent: true, depthWrite: false,
    });
    const dots = new THREE.Points(dotGeometry, dotMaterial);
    dots.visible = false;
    scene.add(dots);
    // NASA's real J2000 star map replaces randomly positioned particles.
    // Center the sky on the camera so it has no artificial near-field parallax.
    const starTexture = loader.load(`/astronomy/stars-2020-${detailedSky ? "8k" : "4k"}.webp`, loaded => {
      if (!alive) { loaded.dispose(); return; }
      render();
    });
    starTexture.colorSpace = THREE.SRGBColorSpace;
    starTexture.wrapS = THREE.RepeatWrapping;
    starTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const starGeometry = new THREE.SphereGeometry(8, 48, 32);
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: { starMap: { value: starTexture }, earthToEquatorial: { value: new THREE.Matrix3() } },
      vertexShader: `
        varying vec3 vDirection;
        void main() {
          vDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D starMap;
        uniform mat3 earthToEquatorial;
        varying vec3 vDirection;
        void main() {
          vec3 equatorial = normalize(earthToEquatorial * normalize(vDirection));
          vec2 uv = vec2(0.5 - atan(equatorial.y, equatorial.x) / 6.28318530718,
                         0.5 + asin(clamp(equatorial.z, -1.0, 1.0)) / 3.14159265359);
          gl_FragColor = vec4(texture2D(starMap, uv).rgb, 1.0);
          #include <colorspace_fragment>
        }
      `, side: THREE.BackSide, depthWrite: false,
    });
    const stars = new THREE.Mesh(starGeometry, starMaterial);
    stars.renderOrder = -1;
    scene.add(stars);
    const pinGeometry = new THREE.SphereGeometry(0.008, 12, 8);
    const pinMaterial = new THREE.MeshBasicMaterial({ color: "#b7e5ff" });
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    scene.add(pin);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = !compact;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5;
    controls.autoRotateSpeed = 0.6;
    const focus = (spot: Coordinates) => {
      const view = globeViewpoint(spot);
      camera.position.set(...earthVector(view.latitude, view.longitude)).multiplyScalar(compact ? 4.1 : 3.65);
      controls.update(); render();
    };
    const resize = new ResizeObserver(() => {
      const width = container.clientWidth, height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      // No off-axis crop: Earth's projected center is the thumbnail center.
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
      render();
    });
    const visibility = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; }
      else { previousFrame = 0; render(); }
    });
    const resume = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { previousFrame = 0; render(); }
    };
    function draw(timestamp: number) {
      frame = 0;
      const elapsed = previousFrame ? Math.min((timestamp - previousFrame) / 1000, 0.05) : 0;
      previousFrame = timestamp;
      const state = latest.current;
      const movingTime = state.playing && !reduced.matches;
      const time = state.timeline?.current
        ? sampleEarthTimeline(state.timeline.current, timestamp)
        : state.instant.getTime() + (movingTime ? Math.min(timestamp - state.updated, 500) * EARTH_PLAYBACK_RATE : 0);
      // At most one ephemeris computation per rendered instant; React clocks update separately.
      if (time !== computedTime) {
        const light = earthLighting(new Date(time));
        material.uniforms.sunDirection.value.set(...light.sun);
        material.uniforms.moonDirection.value.set(...light.moon);
        material.uniforms.moonFraction.value = light.moonFraction;
        material.uniforms.moonDistance.value = light.moonDistance;
        starMaterial.uniforms.earthToEquatorial.value.fromArray(light.earthToEquatorial).transpose();
        computedTime = time;
      }
      dots.visible = state.dotted;
      clouds.visible = state.showClouds;
      // Gentle visual drift over one simulated day, with no extra animation loop.
      cloudMaterial.uniforms.drift.value = reduced.matches ? 0 : ((time / 86400000) * 0.008) % 1;
      material.uniforms.dotted.value = state.dotted ? 1 : 0;
      material.uniforms.moonEnabled.value = state.showMoon ? 1 : 0;
      pin.position.set(...earthVector(state.location.latitude, state.location.longitude)).multiplyScalar(1.002);
      // Hold geography still: the time-driven night boundary visibly travels
      // across continents, rather than hiding the effect behind a camera orbit.
      controls.autoRotate = false;
      controls.update(elapsed);
      stars.position.copy(camera.position);
      renderer.render(scene, camera);
      if (movingTime || controls.autoRotate) render();
    }
    handle.current = { redraw: render, focus, rotate: degrees => {
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), degrees * Math.PI / 180);
      controls.update(); render();
    } };
    const contextLost = (event: Event) => { event.preventDefault(); setUnavailable(true); cancelAnimationFrame(frame); frame = 0; };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    controls.addEventListener("change", render);
    reduced.addEventListener("change", render);
    document.addEventListener("visibilitychange", resume);
    resize.observe(container); visibility.observe(container);
    focus(latest.current.location);
    return () => {
      alive = false; cancelAnimationFrame(frame);
      resize.disconnect(); visibility.disconnect(); controls.dispose();
      document.removeEventListener("visibilitychange", resume);
      reduced.removeEventListener("change", render);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      landTexture.dispose(); dotGeometry.dispose(); dotMaterial.dispose(); starGeometry.dispose(); starMaterial.dispose(); starTexture.dispose();
      cloudTexture.dispose(); cloudMaterial.dispose();
      textures.forEach(texture => texture.dispose()); geometry.dispose(); material.dispose(); pinGeometry.dispose(); pinMaterial.dispose();
      renderer.dispose(); renderer.domElement.remove(); handle.current = null;
    };
  }, [compact]);
  useEffect(() => { handle.current?.focus(location); }, [location]);
  return <div className={compact ? "earth-preview-visual" : "astro-globe-visual"}>
    <div className={compact ? "earth-preview-canvas" : "astro-globe-canvas"} ref={host} />
    {unavailable ? <p className="astro-globe-fallback" role="status">Earth imagery unavailable. Local sky conditions remain available.</p> : !compact && <>
      <span className="astro-globe-drag">Drag to explore · blue pin marks your location</span>
      <div className="astro-globe-camera"><button aria-label="Rotate Earth west" onClick={() => handle.current?.rotate(-30)} type="button">←</button><button onClick={() => handle.current?.focus(location)} type="button">Center my spot</button><button aria-label="Rotate Earth east" onClick={() => handle.current?.rotate(30)} type="button">→</button></div>
    </>}
  </div>;
}
