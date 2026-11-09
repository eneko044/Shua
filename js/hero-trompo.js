// Portada A: trompo de kebab en 3D con las fotos reales de la carne
import { THREE, makeRenderer, studioEnvironment, loadImage, renderLoop, makeEmbers, damp } from './three-utils.js';

// Hace una foto "sin costura" en horizontal: mezcla los bordes con la misma foto
// desplazada media anchura, así al dar la vuelta al trompo no se ve el corte.
function seamless(img, w, h, inset) {
  const sx = img.width * inset, sw = img.width * (1 - inset * 2);
  const base = document.createElement('canvas');
  base.width = w; base.height = h;
  const b = base.getContext('2d');
  b.drawImage(img, sx, 0, sw, img.height, 0, 0, w, h);

  const shifted = document.createElement('canvas');
  shifted.width = w; shifted.height = h;
  const s = shifted.getContext('2d');
  s.drawImage(base, -w / 2, 0);
  s.drawImage(base, w / 2, 0);
  s.globalCompositeOperation = 'destination-in';
  const m = s.createLinearGradient(0, 0, w, 0);
  m.addColorStop(0, '#000'); m.addColorStop(0.2, 'rgba(0,0,0,0)');
  m.addColorStop(0.8, 'rgba(0,0,0,0)'); m.addColorStop(1, '#000');
  s.fillStyle = m; s.fillRect(0, 0, w, h);
  b.drawImage(shifted, 0, 0);
  return base;
}

// Textura: ternera arriba, pollo abajo (como en el asador del local)
function meatTexture(ternera, pollo) {
  const W = 1024, H = 1536;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const split = 0.56; // proporción de ternera

  const pY = H * (split - 0.08), pH = H - pY;
  g.drawImage(seamless(pollo, W, pH, 0.09), 0, pY);

  const tH = Math.round(H * split);
  const t = seamless(ternera, W, tH, 0.06);
  const tg = t.getContext('2d');
  tg.globalCompositeOperation = 'destination-in';
  const fade = tg.createLinearGradient(0, 0, 0, tH);
  fade.addColorStop(0, '#000'); fade.addColorStop(0.86, '#000'); fade.addColorStop(1, 'rgba(0,0,0,0)');
  tg.fillStyle = fade; tg.fillRect(0, 0, W, tH);
  g.drawImage(t, 0, 0);
  return c;
}

function trompoGeometry() {
  // Perfil de abajo arriba: estrecho en la base, ancho arriba, con "capas" de carne
  const pts = [];
  const N = 90, y0 = -1.85, y1 = 1.75;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = y0 + (y1 - y0) * t;
    let r = 0.74 + 0.22 * t;
    r += 0.022 * Math.sin(y * 9.0) + 0.014 * Math.sin(y * 21.0 + 1.3);
    // redondeo en los extremos
    const capB = Math.min(1, t / 0.05), capT = Math.min(1, (1 - t) / 0.035);
    r *= Math.sqrt(capB) * Math.sqrt(capT);
    pts.push(new THREE.Vector2(Math.max(r, 0.05), y));
  }
  const geo = new THREE.LatheGeometry(pts, 160);
  // Bultos irregulares alrededor
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1
      + 0.035 * Math.sin(3 * a + y * 4.0)
      + 0.022 * Math.sin(7 * a - y * 6.0 + 2.0)
      + 0.012 * Math.sin(13 * a + y * 11.0)
      + 0.016 * Math.sin(5 * a + y * 15.0 + 0.7);
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

export async function initTrompo(canvas, { onReady } = {}) {
  const hero = canvas.closest('.hero');
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer, { top: '#ff8fbf', mid: '#5a0a30', bottom: '#1a0610' });
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 0.3, 8.6);

  const [ternera, pollo] = await Promise.all([
    loadImage('img/trompo-ternera.jpg'),
    loadImage('img/trompo-pollo.jpg'),
  ]);
  const tex = new THREE.CanvasTexture(meatTexture(ternera, pollo));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = 2;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const meat = new THREE.Mesh(
    trompoGeometry(),
    new THREE.MeshStandardMaterial({
      map: tex, bumpMap: tex, bumpScale: 1.4,
      roughness: 0.72, envMapIntensity: 0.4, metalness: 0.0,
      emissive: new THREE.Color('#ff5a00'), emissiveMap: tex, emissiveIntensity: 0.05,
    })
  );

  const steel = new THREE.MeshStandardMaterial({ color: '#d9d4d8', metalness: 1, roughness: 0.22 });
  const spit = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 5.4, 24), steel);
  spit.position.y = 0.3;
  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 48), steel);
  topPlate.position.y = 1.8;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 24), steel);
  tip.position.y = 3.15;
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.9, 0.12, 64), steel);
  tray.position.y = -2.0;

  const spinner = new THREE.Group(); // gira sobre su eje
  spinner.add(meat, spit, topPlate, tip, tray);

  const rig = new THREE.Group(); // inclinación con el ratón y posición en pantalla
  rig.add(spinner);
  scene.add(rig);

  const embers = makeEmbers(220, { radius: [0.95, 2.1], height: [-2.3, 2.8], size: 1.1 });
  rig.add(embers);

  // Luces: el grill vertical da calor naranja por la derecha, rim rosa por detrás
  scene.add(new THREE.HemisphereLight('#fff0e4', '#3b0420', 0.9));
  const heat = new THREE.PointLight('#ff8a2a', 16, 12, 1.6);
  heat.position.set(2.6, 0.4, 1.6);
  scene.add(heat);
  const key = new THREE.DirectionalLight('#fff1e2', 1.8);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#ff3d8b', 4);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight('#ffd31a', 2.2);
  rim2.position.set(4, -1, -4);
  scene.add(rim2);

  // Estado
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let progress = 0, spinBoost = 0, layout = { x: 1.55, y: 0, s: 1 };

  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const narrow = w < 760;
    layout = narrow ? { x: 0, y: 1.25, s: 0.6 } : { x: Math.min(1.75, 0.9 + (w / h) * 0.45), y: 0.05, s: 1 };
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(hero);

  const onMove = (e) => {
    const r = hero.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  hero.addEventListener('pointermove', onMove);
  const onLeave = () => { pointer.tx = 0; pointer.ty = 0; };
  hero.addEventListener('pointerleave', onLeave);
  // Un toque o clic hace girar el trompo más rápido un momento
  const onDown = () => { spinBoost = 5; };
  hero.addEventListener('pointerdown', onDown);

  let first = true;
  const stop = renderLoop(hero, (dt, time) => {
    pointer.x = damp(pointer.x, pointer.tx, 4, dt);
    pointer.y = damp(pointer.y, pointer.ty, 4, dt);
    spinBoost = damp(spinBoost, 0, 1.6, dt);

    spinner.rotation.y += dt * (0.45 + spinBoost + progress * 3.2);
    rig.rotation.x = pointer.y * 0.12 + 0.06;
    rig.rotation.z = -pointer.x * 0.06;
    rig.position.x = layout.x + pointer.x * 0.12;
    rig.position.y = layout.y + Math.sin(time * 0.8) * 0.04 + progress * 1.6;
    rig.scale.setScalar(layout.s * (1 + progress * 0.35));
    camera.position.x = pointer.x * 0.35;
    camera.position.z = 8.6 - progress * 2.2;
    camera.lookAt(layout.x * 0.4, 0.1 + progress * 0.6, 0);

    heat.intensity = 15 + Math.sin(time * 7.3) * 1.6 + Math.sin(time * 13.1) * 1.1;
    embers.material.uniforms.uTime.value = time;
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
