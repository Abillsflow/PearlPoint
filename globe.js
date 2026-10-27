import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';

const canvas = document.querySelector('#pearlGlobe');
const stage = document.querySelector('.hero-visual');
if (!canvas || !stage) throw new Error('PearlPoint globe canvas was not found.');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(canvas.clientWidth || 270, canvas.clientHeight || 270, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.z = 5.2;

scene.add(new THREE.AmbientLight(0xfff5e4, 1.45));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.3);
keyLight.position.set(-3.2, 4.2, 5);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xd9bb83, 2.4);
rimLight.position.set(4, -1.5, -3);
scene.add(rimLight);
const softLight = new THREE.PointLight(0xffffff, 1.1, 10);
softLight.position.set(1.8, 2.5, 4);
scene.add(softLight);

// A softly illustrated equirectangular map gives the pearl a globe-like surface.
// The map is intentionally restrained: champagne landmasses and fine meridians.
function makePearlMap() {
  const w = 2048, h = 1024;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = w; mapCanvas.height = h;
  const ctx = mapCanvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#f8f1e4');
  bg.addColorStop(0.48, '#e8dac1');
  bg.addColorStop(1, '#c9b48e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft latitude and longitude lines.
  ctx.strokeStyle = 'rgba(139,111,68,0.25)';
  ctx.lineWidth = 1.6;
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = h * (0.5 - lat / 180);
    ctx.beginPath();
    const rx = w * Math.cos(lat * Math.PI / 180) * 0.5;
    ctx.ellipse(w / 2, y, rx, Math.max(1, h * 0.006), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let lon = 0; lon < 360; lon += 15) {
    const x = w * lon / 360;
    ctx.beginPath();
    ctx.ellipse(x, h / 2, Math.max(1, w * 0.004), h * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Simplified continent silhouettes, drawn in map coordinates.
  const land = [
    [[0.055,0.20],[0.085,0.12],[0.12,0.10],[0.15,0.14],[0.17,0.20],[0.16,0.27],[0.14,0.31],[0.135,0.39],[0.115,0.48],[0.095,0.43],[0.08,0.34],[0.06,0.29]],
    [[0.16,0.48],[0.19,0.51],[0.205,0.59],[0.19,0.68],[0.175,0.78],[0.15,0.72],[0.145,0.62]],
    [[0.37,0.20],[0.40,0.15],[0.45,0.16],[0.48,0.22],[0.52,0.22],[0.55,0.27],[0.60,0.25],[0.64,0.30],[0.66,0.38],[0.63,0.44],[0.60,0.45],[0.58,0.53],[0.55,0.59],[0.52,0.55],[0.50,0.47],[0.47,0.43],[0.44,0.37],[0.40,0.35],[0.38,0.28]],
    [[0.49,0.53],[0.53,0.54],[0.55,0.62],[0.54,0.72],[0.52,0.82],[0.50,0.77],[0.48,0.67]],
    [[0.68,0.23],[0.72,0.17],[0.78,0.18],[0.83,0.22],[0.88,0.28],[0.90,0.34],[0.86,0.39],[0.82,0.37],[0.79,0.43],[0.75,0.40],[0.72,0.34],[0.69,0.31]],
    [[0.75,0.48],[0.79,0.46],[0.82,0.51],[0.81,0.58],[0.78,0.63],[0.75,0.58]],
    [[0.31,0.12],[0.34,0.10],[0.36,0.14],[0.35,0.19],[0.32,0.18]],
    [[0.91,0.61],[0.94,0.58],[0.96,0.63],[0.94,0.69],[0.92,0.67]]
  ];
  land.forEach((points, i) => {
    ctx.beginPath();
    points.forEach(([x,y], idx) => idx ? ctx.lineTo(x*w,y*h) : ctx.moveTo(x*w,y*h));
    ctx.closePath();
    const lg = ctx.createLinearGradient(0, h*0.15, 0, h*0.85);
    lg.addColorStop(0, 'rgba(255,250,235,0.92)');
    lg.addColorStop(1, 'rgba(172,139,87,0.88)');
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // A fine highlight gives the land a ceramic inlay finish.
    ctx.strokeStyle = 'rgba(143,111,62,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Gentle glossy highlight across the surface texture.
  const shine = ctx.createRadialGradient(w*0.28,h*0.25,10,w*0.28,h*0.25,w*0.48);
  shine.addColorStop(0, 'rgba(255,255,255,0.28)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(0,0,w,h);

  const texture = new THREE.CanvasTexture(mapCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const globe = new THREE.Group();
scene.add(globe);
const geometry = new THREE.SphereGeometry(1.24, 96, 96);
const material = new THREE.MeshPhysicalMaterial({
  map: makePearlMap(),
  color: 0xffffff,
  metalness: 0.12,
  roughness: 0.29,
  clearcoat: 0.9,
  clearcoatRoughness: 0.2,
  sheen: 0.65,
  sheenColor: new THREE.Color('#e9d4ad'),
  sheenRoughness: 0.38
});
const sphere = new THREE.Mesh(geometry, material);
globe.add(sphere);

// A fine champagne outline catches the light at the silhouette.
const edge = new THREE.Mesh(
  new THREE.SphereGeometry(1.255, 96, 96),
  new THREE.MeshBasicMaterial({ color: 0xd5b982, transparent: true, opacity: 0.12, side: THREE.BackSide })
);
globe.add(edge);

// The initial orientation presents a recognizable map, then rotates slowly like a globe.
globe.rotation.y = -0.45;
globe.rotation.x = 0.08;

let dragging = false;
let previousX = 0;
let previousY = 0;
let velocityX = 0;
let velocityY = 0;
let lastTime = performance.now();
let frameId = 0;

canvas.style.cursor = 'grab';
canvas.style.touchAction = 'none';
canvas.addEventListener('pointerdown', event => {
  dragging = true;
  previousX = event.clientX;
  previousY = event.clientY;
  velocityX = velocityY = 0;
  canvas.style.cursor = 'grabbing';
  canvas.setPointerCapture(event.pointerId);
  event.preventDefault();
});
canvas.addEventListener('pointermove', event => {
  if (!dragging) return;
  const dx = event.clientX - previousX;
  const dy = event.clientY - previousY;
  previousX = event.clientX;
  previousY = event.clientY;
  globe.rotation.y += dx * 0.006;
  globe.rotation.x += dy * 0.0045;
  globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x, -Math.PI * 0.48, Math.PI * 0.48);
  velocityY = dx * 0.00045;
  velocityX = dy * 0.0003;
});
function release() {
  dragging = false;
  canvas.style.cursor = 'grab';
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('lostpointercapture', release);

function resize() {
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(canvas);
resize();

function render(now) {
  frameId = requestAnimationFrame(render);
  const delta = Math.min((now - lastTime) / 1000, 0.04);
  lastTime = now;

  if (!dragging) {
    if (!reducedMotion) globe.rotation.y += 0.075 * delta; // gentle full turn over ~84 seconds
    globe.rotation.y += velocityY;
    globe.rotation.x += velocityX;
    velocityX *= Math.pow(0.92, delta * 60);
    velocityY *= Math.pow(0.92, delta * 60);
    globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x, -Math.PI * 0.48, Math.PI * 0.48);
  }
  renderer.render(scene, camera);
}
frameId = requestAnimationFrame(render);

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(frameId);
  resizeObserver.disconnect();
  geometry.dispose();
  material.map?.dispose();
  material.dispose();
  edge.geometry.dispose();
  edge.material.dispose();
  renderer.dispose();
});
