import * as THREE from '../vendor/three.module.min.js';

export { THREE };

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

export function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}

// Entorno de estudio pintado en un canvas: da reflejos rosas y amarillos a los metales
export function studioEnvironment(renderer, { top = '#ff6fa8', mid = '#3b0420', bottom = '#120610', strips = ['#ffffff', '#ffd31a', '#ff3d8b'] } = {}) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, top); grad.addColorStop(0.5, mid); grad.addColorStop(1, bottom);
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 512);
  // "softboxes" de luz
  strips.forEach((col, i) => {
    const x = 120 + i * 300;
    const sg = g.createLinearGradient(x, 0, x + 140, 0);
    sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(0.5, col); sg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sg; g.globalAlpha = 0.9; g.fillRect(x, 80, 140, 220);
  });
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose(); pmrem.dispose();
  return env;
}

export function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// Bucle de render que se pausa fuera de pantalla y cuando la pestaña no está visible
export function renderLoop(el, tick) {
  let visible = true, raf = 0, last = performance.now();
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (visible && !document.hidden) tick(dt, now / 1000);
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }, { threshold: 0 });
  io.observe(el);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); io.disconnect(); };
}

// Partículas tipo brasa (shader de puntos con brillo)
export function makeEmbers(count, { radius = [0.9, 1.8], height = [-2.2, 2.4], colors = ['#ff7a1a', '#ffd31a', '#ff3d6e'], size = 1 } = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4); // velocidad, fase, tamaño, color
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = radius[0] + Math.random() * (radius[1] - radius[0]);
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = height[0] + Math.random() * (height[1] - height[0]);
    pos[i * 3 + 2] = Math.sin(a) * r;
    seed[i * 4] = 0.25 + Math.random() * 0.6;
    seed[i * 4 + 1] = Math.random() * 100;
    seed[i * 4 + 2] = 0.5 + Math.random() * 1.3;
    seed[i * 4 + 3] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPR: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uSize: { value: 26 * size },
      uH: { value: new THREE.Vector2(height[0], height[1]) },
      uC1: { value: new THREE.Color(colors[0]) },
      uC2: { value: new THREE.Color(colors[1]) },
      uC3: { value: new THREE.Color(colors[2]) },
    },
    vertexShader: /* glsl */`
      attribute vec4 seed;
      uniform float uTime, uPR, uSize;
      uniform vec2 uH;
      varying float vLife;
      varying float vCol;
      void main() {
        vec3 p = position;
        float span = uH.y - uH.x;
        float t = uTime * seed.x + seed.y;
        p.y = uH.x + mod(p.y - uH.x + t, span);
        p.x += sin(t * 1.7 + seed.y) * 0.18;
        p.z += cos(t * 1.3 + seed.y) * 0.18;
        vLife = (p.y - uH.x) / span;
        vCol = seed.w;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float flicker = 0.75 + 0.25 * sin(uTime * 12.0 + seed.y * 7.0);
        gl_PointSize = uSize * seed.z * flicker * uPR / -mv.z * (1.0 - vLife * 0.7);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uC1, uC2, uC3;
      varying float vLife;
      varying float vCol;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= a;
        vec3 c = vCol < 0.5 ? mix(uC1, uC2, vCol * 2.0) : mix(uC2, uC3, (vCol - 0.5) * 2.0);
        float fade = smoothstep(0.0, 0.12, vLife) * smoothstep(1.0, 0.55, vLife);
        gl_FragColor = vec4(c * 1.6, a * fade);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

// Curva de lerp independiente del framerate
export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
