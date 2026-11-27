/* AK Advisors: 3D brushed-steel compass for the home page hero.
   Loads only on wide screens with WebGL. The flat PNG stays as the fallback. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const box = document.querySelector(".hero-art");
const img = box && box.querySelector("img");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wide = window.matchMedia("(min-width: 821px)").matches;

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch (e) { return false; }
}

if (box && wide && webglOK()) init();

function init() {
  const W = () => box.clientWidth, H = () => box.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  box.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, W() / H(), 1, 2000);
  camera.position.set(0, 0, 560);

  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-200, 260, 300); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb4c6, 1.2); rim.position.set(300, -120, -200); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  // Compass star: exact polygon from the brand SVG, centred and flipped to 3D coordinates
  const pts = [[133,20],[133,220],[122,142],[72,181],[107,130],[36,124],[42,131],[19,120],[42,109],[36,116],[107,110],[72,59],[122,98]];
  const cx = 90, cy = 120;
  const star = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x - cx, -(y - cy))));
  const starGeo = new THREE.ExtrudeGeometry(star, { depth: 8, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 1.2, bevelSegments: 3 });
  starGeo.translate(0, 0, -4);
  const steel = new THREE.MeshPhysicalMaterial({ color: 0x93a3b0, metalness: 1, roughness: 0.26, clearcoat: 0.5, clearcoatRoughness: 0.25 });
  const starMesh = new THREE.Mesh(starGeo, steel);

  // Half ring: left semicircle, centre (132,120), radius 61 in the SVG
  const rcx = 132 - cx, R1 = 64, R0 = 58;
  const ring = new THREE.Shape();
  ring.absarc(rcx, 0, R1, Math.PI / 2, Math.PI * 1.5, false);
  ring.absarc(rcx, 0, R0, Math.PI * 1.5, Math.PI / 2, true);
  const ringGeo = new THREE.ExtrudeGeometry(ring, { depth: 4, bevelEnabled: true, bevelThickness: 1, bevelSize: 0.8, bevelSegments: 2, curveSegments: 64 });
  ringGeo.translate(0, 0, -2);
  const ringMat = new THREE.MeshPhysicalMaterial({ color: 0xc2a374, metalness: 1, roughness: 0.25, clearcoat: 0.6 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);

  const compass = new THREE.Group();
  compass.add(ringMesh, starMesh);
  compass.position.x = 14; // visual centre (arrow tip -71 to flat edge +43)
  const wrap = new THREE.Group();
  wrap.add(compass);
  scene.add(wrap);

  function fit() {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    const s = Math.min(H() / 250, W() / 175) * 0.88;
    wrap.scale.setScalar(Math.max(s, 0.6));
  }
  fit();
  window.addEventListener("resize", fit);

  // Input: pointer tilt and scroll turn, eased
  let px = 0, py = 0, tx = 0, ty = 0, scrollT = 0;
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  const heroEl = document.querySelector(".hero");
  function onScroll() {
    const r = heroEl.getBoundingClientRect();
    scrollT = Math.min(Math.max(-r.top / r.height, 0), 1);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(box);

  const clock = new THREE.Clock();
  let shown = false;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible && shown) return;
    const t = clock.getElapsedTime();
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    if (reduce) {
      wrap.rotation.set(0.05, -0.35, 0);
    } else {
      wrap.rotation.y = -0.35 + Math.sin(t * 0.45) * 0.28 + px * 0.35 + scrollT * 1.1;
      wrap.rotation.x = 0.04 + Math.sin(t * 0.3) * 0.04 + py * 0.18;
      wrap.position.y = Math.sin(t * 0.8) * 4 + scrollT * 40;
      compass.rotation.z = Math.sin(t * 0.25) * 0.02;
    }
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      box.classList.add("is-3d");
      if (img) img.setAttribute("aria-hidden", "true");
    }
  }
  frame();
}
