import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createParts, CATEGORY_ORDER } from "./parts.js";

// ---------- Scene ----------
const viewport = document.getElementById("viewport");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1116);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const CAM_HOME = new THREE.Vector3(5.4, 3.4, 6.6);
camera.position.copy(CAM_HOME);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.7, 0);
controls.minDistance = 3;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI / 2 + 0.05;

// ---------- Lighting ----------
scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2f38, 0.55));
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const key = new THREE.DirectionalLight(0xffffff, 2.0);
key.position.set(6, 9, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 40;
key.shadow.camera.left = -8;
key.shadow.camera.right = 8;
key.shadow.camera.top = 8;
key.shadow.camera.bottom = -8;
key.shadow.bias = -0.0004;
scene.add(key);
const fill = new THREE.DirectionalLight(0xeef2ff, 0.45);
fill.position.set(-6, 4, -4);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.5);
rim.position.set(0, 3, -8);
scene.add(rim);

// ---------- Ground ----------
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(14, 64),
  new THREE.MeshStandardMaterial({ color: 0x12161c, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(28, 56, 0x2a3140, 0x1c222c);
grid.position.y = 0.001;
scene.add(grid);

// ---------- Build the car ----------
const carRoot = new THREE.Group();
scene.add(carRoot);

const parts = createParts();
const partRecords = []; // { def, group, explodeVec, meshes[] }

for (const def of parts) {
  const g = def.build();
  g.userData.partId = def.id;
  // tag every descendant mesh so raycasting can resolve back to the part.
  // Clone the material per mesh so the emissive highlight only affects this
  // part — materials are shared from the palette and would otherwise leak.
  g.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.partId = def.id;
    o.material = o.material.clone();
  });
  carRoot.add(g);
  partRecords.push({
    def,
    group: g,
    explodeVec: new THREE.Vector3(...def.explode),
    baseEmissive: new Map(),
  });
}
const recordById = new Map(partRecords.map((r) => [r.def.id, r]));

// ---------- Explode state ----------
let explodeTarget = 0; // 0..1 desired
let explodeCurrent = 0; // 0..1 animated

function applyExplode(t) {
  for (const r of partRecords) {
    r.group.position.copy(r.explodeVec).multiplyScalar(t);
  }
}

// ---------- Highlight / selection ----------
let hovered = null;
let selected = null;

function setEmissive(record, hex, intensity) {
  record.group.traverse((o) => {
    if (!o.isMesh) return;
    if (!record.baseEmissive.has(o)) {
      record.baseEmissive.set(o, {
        color: o.material.emissive ? o.material.emissive.getHex() : 0x000000,
        intensity: o.material.emissiveIntensity ?? 1,
      });
    }
    if (o.material.emissive) {
      o.material.emissive.setHex(hex);
      o.material.emissiveIntensity = intensity;
    }
  });
}
function clearEmissive(record) {
  if (!record) return;
  record.group.traverse((o) => {
    if (!o.isMesh || !record.baseEmissive.has(o)) return;
    const base = record.baseEmissive.get(o);
    if (o.material.emissive) {
      o.material.emissive.setHex(base.color);
      o.material.emissiveIntensity = base.intensity;
    }
  });
}

function refreshHighlights() {
  // re-apply so selection beats hover
  for (const r of partRecords) clearEmissive(r);
  if (hovered && hovered !== selected) setEmissive(hovered, 0x3a6df0, 0.5);
  if (selected) setEmissive(selected, 0xe23b3b, 0.65);
}

// ---------- Raycasting ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downXY = null;

function pickAt(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(carRoot.children, true);
  for (const h of hits) {
    let o = h.object;
    while (o && !o.userData.partId) o = o.parent;
    if (o && o.userData.partId) return recordById.get(o.userData.partId);
  }
  return null;
}

renderer.domElement.addEventListener("pointermove", (e) => {
  const rec = pickAt(e.clientX, e.clientY);
  if (rec !== hovered) {
    hovered = rec;
    refreshHighlights();
    renderer.domElement.style.cursor = rec ? "pointer" : "default";
  }
});
renderer.domElement.addEventListener("pointerdown", (e) => {
  downXY = { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!downXY) return;
  const moved = Math.hypot(e.clientX - downXY.x, e.clientY - downXY.y);
  downXY = null;
  if (moved > 6) return; // it was a drag, not a click
  const rec = pickAt(e.clientX, e.clientY);
  if (rec) selectPart(rec.def.id);
  else deselect();
});

// ---------- UI: part list ----------
const partListEl = document.getElementById("part-list");
const itemEls = new Map();

function colorOf(record) {
  let hex = "#888";
  record.group.traverse((o) => {
    if (o.isMesh && o.material.color && hex === "#888") {
      hex = "#" + o.material.color.getHexString();
    }
  });
  return hex;
}

for (const category of CATEGORY_ORDER) {
  const inCat = partRecords.filter((r) => r.def.category === category);
  if (!inCat.length) continue;
  const groupEl = document.createElement("div");
  groupEl.className = "cat-group";
  const title = document.createElement("div");
  title.className = "cat-title";
  title.textContent = category;
  groupEl.appendChild(title);
  for (const r of inCat) {
    const item = document.createElement("div");
    item.className = "part-item";
    item.dataset.id = r.def.id;
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = colorOf(r);
    const label = document.createElement("span");
    label.textContent = r.def.name;
    item.append(sw, label);
    item.addEventListener("click", () => selectPart(r.def.id));
    item.addEventListener("mouseenter", () => {
      hovered = r;
      refreshHighlights();
    });
    item.addEventListener("mouseleave", () => {
      hovered = null;
      refreshHighlights();
    });
    groupEl.appendChild(item);
    itemEls.set(r.def.id, item);
  }
  partListEl.appendChild(groupEl);
}

// ---------- UI: details panel ----------
const detailsEl = document.getElementById("details");
const dContent = document.getElementById("details-content");
const dEmpty = document.getElementById("details-empty");

function selectPart(id) {
  const rec = recordById.get(id);
  if (!rec) return;
  selected = rec;
  refreshHighlights();

  // list active state
  itemEls.forEach((el, key) => el.classList.toggle("active", key === id));
  const activeItem = itemEls.get(id);
  if (activeItem) activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });

  // details
  document.getElementById("d-category").textContent = rec.def.category;
  document.getElementById("d-name").textContent = rec.def.name;
  document.getElementById("d-desc").textContent = rec.def.info.desc;
  const specs = document.getElementById("d-specs");
  specs.innerHTML = "";
  for (const [k, v] of rec.def.info.specs) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = k;
    const dd = document.createElement("dd");
    dd.textContent = v;
    row.append(dt, dd);
    specs.appendChild(row);
  }
  detailsEl.classList.remove("empty");
  detailsEl.classList.add("open");
  dContent.hidden = false;
  dEmpty.hidden = true;

  focusCameraOn(rec);
}

function deselect() {
  selected = null;
  refreshHighlights();
  itemEls.forEach((el) => el.classList.remove("active"));
  detailsEl.classList.add("empty");
  detailsEl.classList.remove("open");
  dContent.hidden = true;
  dEmpty.hidden = false;
}

// ---------- Camera focus ----------
let camTween = null;
function focusCameraOn(rec) {
  const box = new THREE.Box3().setFromObject(rec.group);
  if (!box.isEmpty()) {
    const center = box.getCenter(new THREE.Vector3());
    camTween = { target: center.clone(), t: 0 };
  }
}

// ---------- Controls wiring ----------
const slider = document.getElementById("explode-slider");
const explodeValue = document.getElementById("explode-value");
slider.addEventListener("input", () => {
  explodeTarget = slider.value / 100;
  explodeValue.textContent = `${slider.value}%`;
});
function setExplode(pct) {
  slider.value = pct;
  explodeTarget = pct / 100;
  explodeValue.textContent = `${pct}%`;
}
document.getElementById("btn-collapse").addEventListener("click", () => setExplode(0));
document.getElementById("btn-expand").addEventListener("click", () => setExplode(100));
document.getElementById("btn-reset").addEventListener("click", () => {
  camTween = { target: new THREE.Vector3(0, 0.7, 0), t: 0, home: true };
});

let autoRotate = false;
const rotateBtn = document.getElementById("btn-rotate");
rotateBtn.addEventListener("click", () => {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 1.2;
  rotateBtn.classList.toggle("on", autoRotate);
});

// keyboard: Esc to deselect
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") deselect();
});

// ---------- Resize ----------
function resize() {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// ---------- Animation loop ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  // ease explode toward target
  if (Math.abs(explodeCurrent - explodeTarget) > 0.0005) {
    explodeCurrent += (explodeTarget - explodeCurrent) * Math.min(1, dt * 6);
    applyExplode(explodeCurrent);
  }

  // ease camera target (and optionally pull camera home)
  if (camTween) {
    camTween.t = Math.min(1, camTween.t + dt * 2.2);
    controls.target.lerp(camTween.target, 0.12);
    if (camTween.home) camera.position.lerp(CAM_HOME, 0.12);
    if (camTween.t >= 1) camTween = null;
  }

  controls.update();
  renderer.render(scene, camera);
}

applyExplode(0);
animate();

// hide loader
const loading = document.getElementById("loading");
requestAnimationFrame(() => loading.classList.add("hidden"));
