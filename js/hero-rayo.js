// Portada B: el rayo de SHUA en 3D, con trozos de papel de aluminio y descargas
import { THREE, makeRenderer, studioEnvironment, renderLoop, makeEmbers, damp } from './three-utils.js';

function boltShape() {
  // Mismo rayo que el del logo (viewBox 24x32), centrado y con la Y hacia arriba
  const raw = [[15.5, 0], [2, 18.5], [10.2, 18.5], [7.6, 32], [22, 12.2], [13.7, 12.2]];
  const s = new THREE.Shape();
  raw.forEach(([x, y], i) => {
    const px = (x - 12) * 0.1, py = (16 - y) * 0.1;
    i ? s.lineTo(px, py) : s.moveTo(px, py);
  });
  s.closePath();
  return s;
}

function foilShard() {
  const geo = new THREE.PlaneGeometry(0.36, 0.3, 5, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setZ(i, (Math.random() - 0.5) * 0.12);
    p.setX(i, p.getX(i) + (Math.random() - 0.5) * 0.06);
    p.setY(i, p.getY(i) + (Math.random() - 0.5) * 0.06);
  }
  geo.computeVertexNormals();
  return geo;
}

// Descarga eléctrica: línea quebrada por desplazamiento de punto medio
function zigzag(a, b, depth, spread) {
  let pts = [a, b];
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      const m = p.clone().lerp(q, 0.5);
      m.x += (Math.random() - 0.5) * spread;
      m.z += (Math.random() - 0.5) * spread * 0.4;
      next.push(p, m);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    spread *= 0.55;
  }
  return pts;
}

export async function initRayo(canvas, { onReady } = {}) {
  const hero = canvas.closest('.hero');
  const flashEl = hero.querySelector('.hero__flash');
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer, { top: '#ff6fa8', mid: '#2b1c63', bottom: '#07081f', strips: ['#ffffff', '#ffd31a', '#ff3d8b'] });

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 0, 9);

  const bolt = new THREE.Mesh(
    new THREE.ExtrudeGeometry(boltShape(), { depth: 0.55, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.11, bevelSegments: 8, curveSegments: 4 }),
    new THREE.MeshPhysicalMaterial({
      color: '#FFD31A', roughness: 0.18, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08,
      emissive: '#ff9d00', emissiveIntensity: 0.12, envMapIntensity: 1.3,
    })
  );
  bolt.geometry.center();
  bolt.scale.setScalar(1.15);

  const rig = new THREE.Group();
  rig.add(bolt);
  scene.add(rig);

  // Papel de aluminio flotando
  const foilMat = new THREE.MeshStandardMaterial({ color: '#f6f3fa', metalness: 0.75, roughness: 0.32, envMapIntensity: 2.2, flatShading: true, side: THREE.DoubleSide });
  const pinkMat = new THREE.MeshStandardMaterial({ color: '#E8196F', metalness: 0.3, roughness: 0.35, flatShading: true, side: THREE.DoubleSide });
  const shards = [];
  for (let i = 0; i < 34; i++) {
    const m = new THREE.Mesh(foilShard(), i % 6 === 0 ? pinkMat : foilMat);
    const a = Math.random() * Math.PI * 2;
    const r = 1.9 + Math.random() * 2.2;
    m.userData = {
      a, r, y: (Math.random() - 0.5) * 5, speed: 0.06 + Math.random() * 0.14,
      spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(1.2),
      s: 0.5 + Math.random() * 0.9,
    };
    m.scale.setScalar(m.userData.s);
    shards.push(m);
    rig.add(m);
  }

  const sparks = makeEmbers(160, { radius: [0.4, 3.5], height: [-3, 3.5], colors: ['#ffd31a', '#fff6c2', '#ff3d8b'], size: 0.8 });
  rig.add(sparks);

  scene.add(new THREE.HemisphereLight('#ffd6ec', '#110a2e', 0.9));
  const key = new THREE.DirectionalLight('#ffffff', 2.6);
  key.position.set(3, 4, 6);
  scene.add(key);
  const pinkRim = new THREE.DirectionalLight('#ff3d8b', 6);
  pinkRim.position.set(-5, 1, -3);
  scene.add(pinkRim);
  const strikeLight = new THREE.PointLight('#fff4b0', 0, 14, 1.4);
  strikeLight.position.set(0, 2, 2);
  scene.add(strikeLight);

  // Descargas
  const arcCore = new THREE.MeshBasicMaterial({ color: '#fffbe0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const arcGlow = new THREE.MeshBasicMaterial({ color: '#ffd31a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  let arcs = [];
  let flash = 0, nextStrike = 1.4;
  const strike = () => {
    arcs.forEach((m) => { rig.remove(m); m.geometry.dispose(); });
    arcs = [];
    const n = 2 + Math.floor(Math.random() * 2);
    for (let k = 0; k < n; k++) {
      const from = new THREE.Vector3((Math.random() - 0.5) * 6, 6.5, -1 - Math.random() * 2);
      const to = new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.2, 0.2);
      const pts = zigzag(from, to, 6, 2.2);
      const path = new THREE.CurvePath();
      for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
      const core = new THREE.Mesh(new THREE.TubeGeometry(path, pts.length * 2, 0.018, 5, false), arcCore);
      const glow = new THREE.Mesh(new THREE.TubeGeometry(path, pts.length * 2, 0.09, 6, false), arcGlow);
      arcs.push(core, glow);
      rig.add(core, glow);
    }
    flash = 1;
    spin += 2.4;
  };

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let progress = 0, spin = 0, layout = { x: 1.8, y: 0.2, s: 1 };

  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layout = w < 760 ? { x: 0, y: 1.25, s: 0.78 } : { x: Math.min(2.1, 0.8 + (w / h) * 0.6), y: 0.35, s: 1 };
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(hero);

  const onMove = (e) => {
    const r = hero.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  const onLeave = () => { pointer.tx = 0; pointer.ty = 0; };
  const onDown = () => { strike(); nextStrike = 3 + Math.random() * 3; };
  hero.addEventListener('pointermove', onMove);
  hero.addEventListener('pointerleave', onLeave);
  hero.addEventListener('pointerdown', onDown);

  let first = true, t0 = null;
  const stop = renderLoop(hero, (dt, time) => {
    if (t0 === null) t0 = time;
    const elapsed = time - t0;
    if (elapsed > nextStrike) { strike(); nextStrike = elapsed + 3.2 + Math.random() * 3.5; }

    pointer.x = damp(pointer.x, pointer.tx, 3.5, dt);
    pointer.y = damp(pointer.y, pointer.ty, 3.5, dt);
    spin = damp(spin, 0, 2.2, dt);
    flash = Math.max(0, flash - dt * 3.2);

    const flicker = flash > 0 ? (Math.random() > 0.35 ? 1 : 0.25) : 0;
    arcCore.opacity = flash * flicker;
    arcGlow.opacity = flash * flicker * 0.45;
    strikeLight.intensity = flash * flicker * 60;
    bolt.material.emissiveIntensity = 0.12 + flash * flicker * 1.2;
    if (flashEl) flashEl.style.opacity = (flash * flicker * 0.55).toFixed(3);

    bolt.rotation.y = Math.sin(time * 0.6) * 0.55 + pointer.x * 0.6 + spin * Math.PI + progress * Math.PI * 2;
    bolt.rotation.x = pointer.y * 0.35;
    bolt.rotation.z = -0.12 + Math.sin(time * 0.9) * 0.05;
    bolt.position.y = Math.sin(time * 1.1) * 0.12 - progress * 2.5;

    rig.position.set(layout.x + pointer.x * 0.15, layout.y, 0);
    rig.scale.setScalar(layout.s * (1 + progress * 0.4));

    shards.forEach((m) => {
      const u = m.userData;
      u.a += dt * u.speed;
      m.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(time * 0.7 + u.a * 3) * 0.25 - progress * 3, Math.sin(u.a) * u.r * 0.6 - 0.5);
      m.rotation.x += dt * u.spin.x; m.rotation.y += dt * u.spin.y; m.rotation.z += dt * u.spin.z;
    });
    sparks.material.uniforms.uTime.value = time;

    camera.position.x = pointer.x * 0.4;
    camera.position.y = -pointer.y * 0.25;
    camera.lookAt(layout.x * 0.5, layout.y * 0.5, 0);
    renderer.render(scene, camera);
    if (first) { first = false; onReady && onReady(); }
  });

  return {
    setProgress(p) { progress = p; },
    destroy() {
      stop(); ro.disconnect();
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      hero.removeEventListener('pointerdown', onDown);
      renderer.dispose();
    },
  };
}
