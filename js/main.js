import { tacosCasa, layerColors, shawarma, completalo, pedrata, entrantes, eur } from './menu-data.js';
import { initBuilder } from './builder.js';

const html = document.documentElement;
const HERO = html.dataset.hero;
const MODE = html.dataset.scroll;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const SplitText = window.SplitText;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* =========================================================
   1. Contenido de la carta
   ========================================================= */
const leaf = '<svg aria-label="vegetariano"><use href="#leaf"/></svg>';

$('[data-taco-cards]').innerHTML = tacosCasa.map((t) => `
  <article class="tcard" data-color="${t.color}">
    <svg class="tcard__bolt" aria-hidden="true"><use href="#bolt"/></svg>
    <h3 class="tcard__name">${t.name}</h3>
    <p class="tcard__sauce">${t.sauce}</p>
    <div class="tcard__cut" aria-hidden="true">${t.items.map((i) => `<span style="--c:${layerColors[i] || '#E9B160'}"></span>`).join('')}</div>
    <ul class="tcard__items">${t.items.map((i) => `<li>${i}</li>`).join('')}</ul>
    <div class="tcard__foot">
      ${t.veggie ? `<span class="tcard__tag">${leaf} Veggie</span>` : ''}
      <p class="tcard__price" aria-label="Precio ${eur(t.price)}">${eur(t.price).replace(' €', '')}<small>€</small></p>
    </div>
  </article>`).join('');

$('[data-shawarma-list]').innerHTML = shawarma.map((s) => `
  <li><span class="pl__name">${s.name}${s.veggie ? leaf : ''}</span><span class="pl__price">${eur(s.price)}</span><span class="pl__desc">${s.desc}</span></li>`).join('');

// Entrantes con foto; la pedrata no lleva miniatura
const simpleList = (items) => items.map((s) => `
  <li>${s.img ? `<img class="pl__img" src="${s.img}" alt="${s.alt}" width="64" height="64" loading="lazy">` : '<span class="pl__img pl__img--none" aria-hidden="true"></span>'}<span class="pl__name">${s.name}</span><span class="pl__price">${eur(s.price)}</span></li>`).join('');
$('[data-list="pedrata"]').innerHTML = pedrata.map((s) => `
  <li><span class="pl__name">${s.name}</span><span class="pl__price">${eur(s.price)}</span></li>`).join('');
$('[data-list="entrantes"]').innerHTML = simpleList(entrantes);

// Complétalo: máximo 2
const completeEl = $('[data-complete]');
completeEl.innerHTML = completalo.map((c, i) => `
  <label class="chip"><input type="checkbox" name="completa" value="${i}"><span class="chip__ui"><span class="chip__dot"></span>${c}</span></label>`).join('');
completeEl.addEventListener('change', (e) => {
  const on = $$('input:checked', completeEl);
  if (on.length > 2) {
    e.target.checked = false;
    const c = e.target.closest('.chip');
    c.classList.remove('is-shake'); void c.offsetWidth; c.classList.add('is-shake');
  }
});

// Pan: shawarma o kebab
const bread = $('.bread');
bread.dataset.on = 'shawarma';
$$('[data-bread]').forEach((b) => b.addEventListener('click', () => {
  bread.dataset.on = b.dataset.bread;
  $$('[data-bread]').forEach((x) => {
    const on = x === b;
    x.classList.toggle('is-on', on);
    x.setAttribute('aria-checked', on);
  });
}));

// Barra de progreso del carril de tacos
const progress = document.createElement('div');
progress.className = 'tacos__progress';
progress.innerHTML = '<span></span>';
$('.tacos__pin').appendChild(progress);

initBuilder();

/* =========================================================
   2. Selector de opciones de diseño
   ========================================================= */
(function opts() {
  const box = $('[data-opts]');
  const panel = $('#opts-panel');
  const toggle = $('[data-opts-toggle]');
  const params = new URLSearchParams(location.search);
  if (params.get('opciones') === '0') { box.remove(); return; }

  $(`input[name="o-hero"][value="${HERO}"]`).checked = true;
  $(`input[name="o-scroll"][value="${MODE}"]`).checked = true;

  const open = (v) => {
    panel.hidden = !v;
    toggle.setAttribute('aria-expanded', v);
  };
  toggle.addEventListener('click', () => open(panel.hidden));
  $('[data-opts-close]').addEventListener('click', () => { open(false); toggle.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { open(false); toggle.focus(); } });

  panel.addEventListener('change', () => {
    const hero = $('input[name="o-hero"]:checked').value;
    const scroll = $('input[name="o-scroll"]:checked').value;
    try { localStorage.setItem('shua-opts', JSON.stringify({ hero, scroll })); } catch (e) { /* sin almacenamiento */ }
    try { sessionStorage.setItem('shua-skip-intro', '1'); } catch (e) { /* idem */ }
    const p = new URLSearchParams(location.search);
    p.set('hero', hero); p.set('scroll', scroll);
    history.scrollRestoration = 'manual';
    location.href = `${location.pathname}?${p}#top`;
  });

  // Recuerda abrir el panel tras recargar con una opción nueva
  try {
    if (sessionStorage.getItem('shua-skip-intro')) open(true);
  } catch (e) { /* idem */ }
})();

/* =========================================================
   3. Navegación
   ========================================================= */
const nav = $('.nav');
let lastY = 0;
const onScrollNav = (y) => {
  nav.classList.toggle('is-scrolled', y > 40);
  nav.classList.toggle('is-hidden', y > lastY && y > 500 && $('#opts-panel').hidden);
  lastY = y;
};
const sections = $$('.nav__links a').map((a) => [a, $(a.getAttribute('href'))]);
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    sections.forEach(([a, s]) => a.classList.toggle('is-active', s === e.target));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(([, s]) => s && spy.observe(s));

/* =========================================================
   4. Portada
   ========================================================= */
const heroEl = $(`.hero--${HERO}`);
let hero3d = null;

async function startHero() {
  if (HERO === 'foil') { foilHero(); return; }
  const canvas = $(`[data-hero-canvas="${HERO}"]`);
  const { webglAvailable } = await import('./three-utils.js');
  if (!webglAvailable()) { html.classList.add('no-webgl'); return; }
  try {
    const mod = HERO === 'trompo' ? await import('./hero-trompo.js') : await import('./hero-rayo.js');
    const init = HERO === 'trompo' ? mod.initTrompo : mod.initRayo;
    if (gsap) gsap.set(canvas, { opacity: 0 });
    hero3d = await init(canvas, {
      onReady: () => gsap && gsap.to(canvas, { opacity: 1, duration: 1.2, ease: 'power2.out' }),
    });
  } catch (err) {
    console.warn('3D no disponible', err);
    html.classList.add('no-webgl');
  }
}

function tilt(el, { max = 12, target = el } = {}) {
  if (!gsap || reduced || matchMedia('(pointer: coarse)').matches) return;
  const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
  const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
  target.addEventListener('pointermove', (e) => {
    const r = target.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    ry((x - 0.5) * max * 2);
    rx(-(y - 0.5) * max * 2);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  });
  target.addEventListener('pointerleave', () => { rx(0); ry(0); });
}

function foilHero() {
  const card = $('.foil__card');
  tilt(card, { max: 14, target: heroEl });
  if (!gsap || reduced) return;
  gsap.to('.sticker--1', { y: -14, rotate: -6, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.sticker--2', { y: 12, rotate: 10, duration: 2.9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.sticker--3', { x: 10, duration: 3.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

function heroEntrance(delay = 0) {
  if (!gsap || reduced) return;
  const lines = $$('.hero__title .line', heroEl);
  const tl = gsap.timeline({ delay });
  lines.forEach((l) => {
    const w = document.createElement('span');
    w.style.cssText = 'display:block;overflow:hidden;padding-bottom:.06em;margin-bottom:-.06em';
    l.parentNode.insertBefore(w, l); w.appendChild(l);
  });
  tl.from(lines, { yPercent: 110, rotate: 4, duration: 1, ease: 'expo.out', stagger: 0.09 })
    .from($$('.hero__lede, .hero__ctas, .hero__note', heroEl), { y: 24, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, '-=0.7');
  if (HERO === 'trompo') tl.from('.hero__bigword', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0);
  if (HERO === 'foil') {
    tl.from('.foil__type span', { xPercent: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0)
      .from('.foil__card', { y: 200, rotate: 18, scale: 0.8, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .from('.sticker', { scale: 0, rotate: -40, duration: 0.8, ease: 'back.out(2.2)', stagger: 0.12 }, 0.6);
  }
  tl.fromTo('.nav', { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', clearProps: 'transform' }, 0.2);
}

/* =========================================================
   5. Intro
   ========================================================= */
function intro() {
  const el = $('.intro');
  let skip = false;
  try { skip = !!sessionStorage.getItem('shua-skip-intro'); sessionStorage.removeItem('shua-skip-intro'); } catch (e) { /* */ }
  if (!gsap || reduced || MODE === 'suave' || skip) { el && el.remove(); return 0; }
  const badge = $('.intro__badge', el);
  const tl = gsap.timeline({ onComplete: () => el.remove() });
  tl.from(badge, { scale: 0, rotate: -120, duration: 0.6, ease: 'back.out(2)' })
    .to(badge, { boxShadow: 'inset 0 0 0 6px #fff, 0 0 0 26px rgba(255,211,26,0)', duration: 0.45, ease: 'power2.out' }, '-=0.15')
    .to(badge, { scale: 0.85, duration: 0.15, ease: 'power2.in' })
    .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: 0.75, ease: 'expo.inOut' })
    .to(badge, { scale: 0, rotate: 60, duration: 0.5, ease: 'expo.in' }, '<');
  gsap.set(el, { clipPath: 'circle(150% at 50% 50%)' });
  return 1.3;
}

/* =========================================================
   6. Modos de scroll
   ========================================================= */
let lenis = null;

function splitTitles() {
  if (!SplitText) return [];
  return $$('.split').map((el) => SplitText.create(el, { type: 'words,chars', mask: 'words', wordsClass: 'word', charsClass: 'char' }));
}

function anchors(scrollTo) {
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    scrollTo(t);
    history.replaceState(null, '', id);
  }));
}

function heroScrub() {
  ScrollTrigger.create({
    trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (st) => hero3d && hero3d.setProgress(st.progress),
  });
  gsap.to($('.hero__content', heroEl), {
    yPercent: -30, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom 20%', scrub: true },
  });
}

function shawarmaParallax() {
  $$('[data-parallax]').forEach((el) => {
    const f = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -f * 100 }, {
      yPercent: f * 100, ease: 'none',
      scrollTrigger: { trigger: '.shawarma', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  tilt($('.shawarma__photo--main'), { max: 10 });
}

function visitaTilt() { tilt($('.visita__photo'), { max: 6 }); }

function modeCine() {
  lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
  lenis.on('scroll', (e) => { ScrollTrigger.update(); onScrollNav(e.scroll); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  anchors((t) => lenis.scrollTo(t, { offset: 0, duration: 1.6 }));

  heroScrub();

  // Títulos: letras que suben desde su máscara
  splitTitles().forEach((s) => {
    gsap.from(s.chars, {
      yPercent: 120, rotate: 10, duration: 1, ease: 'expo.out', stagger: 0.022,
      scrollTrigger: { trigger: s.elements[0], start: 'top 85%', once: true },
    });
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    // Carril horizontal de French Tacos
    const track = $('.tacos__track');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.tacos', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true,
        onUpdate: (st) => gsap.set('.tacos__progress span', { scaleX: st.progress }),
      },
    });
    $$('.tcard').forEach((card) => {
      gsap.from(card, {
        rotate: 9, yPercent: 14, scale: 0.9, transformOrigin: '50% 100%', ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 55%', scrub: true },
      });
      gsap.from($('.tcard__price', card), {
        scale: 0, rotate: -90, ease: 'back.out(2)', duration: 0.7,
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' },
      });
    });
    gsap.from('.tacos__photo', { scale: 0.85, rotate: -8, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tacos', start: 'top 60%', once: true } });

    // Origen: la frase se ilumina palabra a palabra con la sección fijada
    const words = SplitText ? SplitText.create('[data-words]', { type: 'words' }).words : [];
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.origen', pin: true, start: 'top top', end: '+=120%', scrub: 0.6 } });
    tl.fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none' })
      .fromTo('.origen__bg', { scale: 1.25 }, { scale: 1, ease: 'none', duration: tl.duration() }, 0);
  });
  mm.add('(max-width: 899px)', () => {
    ScrollTrigger.batch('.tcard', {
      start: 'top 88%', once: true,
      onEnter: (els) => gsap.from(els, { y: 70, rotate: 4, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1 }),
    });
    gsap.from('[data-words]', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.origen', start: 'top 70%', once: true } });
  });

  // Crea tu taco
  gsap.from('.step', { y: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.builder', start: 'top 80%', once: true } });
  gsap.from('.ticket', { y: 80, rotate: 3, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.crea__grid', start: 'top 75%', once: true } });

  shawarmaParallax();
  gsap.from('.shawarma .pricelist li, .solo, .complete', { x: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.shawarma__menu', start: 'top 70%', once: true } });

  // Carta: los paneles se levantan con el scroll
  $$('.panel').forEach((p, i) => {
    gsap.fromTo(p, { yPercent: 18 + i * 10, rotate: (i - 1) * 3 }, {
      yPercent: 0, rotate: 0, ease: 'none',
      scrollTrigger: { trigger: '.carta', start: 'top bottom', end: 'top 25%', scrub: true },
    });
  });
  gsap.from('.panel__bolt', { rotate: -60, scale: 0, ease: 'back.out(2)', duration: 1, scrollTrigger: { trigger: '.panel--menu', start: 'top 75%', once: true } });

  // Visita: el logo rueda hasta su sitio
  gsap.fromTo('.visita__badge', { xPercent: -160, rotate: -540 }, {
    xPercent: 0, rotate: 0, ease: 'none',
    scrollTrigger: { trigger: '.visita', start: 'top bottom', end: 'top 30%', scrub: 1 },
  });

  // Botones magnéticos
  if (matchMedia('(pointer: fine)').matches) {
    $$('.btn').forEach((b) => {
      const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' });
      const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.25);
        y((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }
}

function modeComic() {
  window.addEventListener('scroll', () => onScrollNav(window.scrollY), { passive: true });
  anchors((t) => t.scrollIntoView({ behavior: 'smooth' }));
  heroScrub();

  // Cada sección entra como una viñeta: barrido en diagonal + sacudida
  $$('.tacos, .crea, .shawarma, .origen, .carta, .visita').forEach((sec) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 80%', once: true } });
    tl.fromTo(sec,
      { clipPath: 'polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)' },
      { clipPath: 'polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)', duration: 0.7, ease: 'power4.out', clearProps: 'clipPath' });
    const title = $('.title', sec);
    if (title) {
      // Sello + rayo que salta junto al título
      title.style.position = 'relative';
      title.style.width = 'fit-content';
      const zap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      zap.setAttribute('class', 'zap');
      zap.setAttribute('aria-hidden', 'true');
      zap.innerHTML = '<use href="#bolt"/>';
      title.appendChild(zap);
      tl.from(title, { scale: 2.4, rotate: -10, opacity: 0, duration: 0.55, ease: 'back.out(2.2)' }, 0.15)
        .fromTo(zap, { scale: 0, rotate: -60 }, { scale: 1, rotate: 12, duration: 0.5, ease: 'elastic.out(1, 0.4)' }, '>-0.15')
        .to(sec, { x: 8, duration: 0.05, repeat: 5, yoyo: true, ease: 'none', clearProps: 'x' }, '<');
    }
  });

  ScrollTrigger.batch('.tcard, .panel', {
    start: 'top 88%', once: true,
    onEnter: (els) => {
      gsap.from(els, { y: 160, rotate: () => gsap.utils.random(-14, 14), scale: 0.7, opacity: 0, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.09 });
      gsap.from(els.map((e) => $('.tcard__price', e)).filter(Boolean), { scale: 0, rotate: -200, duration: 0.8, ease: 'elastic.out(1, 0.45)', stagger: 0.09, delay: 0.35 });
    },
  });
  gsap.from('.tacos__photo', { x: -200, rotate: -25, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.tacos__photo', start: 'top 85%', once: true } });

  ScrollTrigger.batch('.step', { start: 'top 90%', once: true, onEnter: (els) => gsap.from(els, { x: -120, rotate: -4, opacity: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.08 }) });
  gsap.from('.ticket', { scale: 0.4, rotate: 20, opacity: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)', scrollTrigger: { trigger: '.crea__grid', start: 'top 75%', once: true } });

  gsap.from('.shawarma__photo', { scale: 0, rotate: () => gsap.utils.random(-40, 40), duration: 0.9, ease: 'back.out(1.8)', stagger: 0.12, scrollTrigger: { trigger: '.shawarma__media', start: 'top 75%', once: true } });
  tilt($('.shawarma__photo--main'), { max: 10 });
  gsap.from('.shawarma .pricelist li', { x: 80, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.08, scrollTrigger: { trigger: '.shawarma__menu', start: 'top 70%', once: true } });

  const words = SplitText ? SplitText.create('[data-words]', { type: 'words' }).words : $$('[data-words]');
  gsap.from(words, { scale: 0, rotate: () => gsap.utils.random(-30, 30), opacity: 0, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.05, scrollTrigger: { trigger: '.origen', start: 'top 60%', once: true } });

  gsap.from('.visita__badge', { scale: 0, rotate: -360, duration: 1.1, ease: 'elastic.out(1, 0.5)', scrollTrigger: { trigger: '.visita', start: 'top 70%', once: true } });
}

function modeSuave() {
  window.addEventListener('scroll', () => onScrollNav(window.scrollY), { passive: true });
  if (!gsap || reduced) return;
  ScrollTrigger.batch('.title, .tacos__intro p, .tacos__photo, .tcard, .step, .ticket, .shawarma__photo, .pricelist li, .panel, [data-words], .visita__info > *, .visita__media > *', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.from(els, { y: 26, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }),
  });
  tilt($('.shawarma__photo--main'), { max: 8 });
}

/* =========================================================
   7. Arranque
   ========================================================= */
startHero();
visitaTilt();

if (!gsap || !ScrollTrigger) {
  window.addEventListener('scroll', () => onScrollNav(window.scrollY), { passive: true });
} else {
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  const d = intro();
  heroEntrance(d ? d - 0.35 : 0.1);

  const go = () => {
    if (MODE === 'cine' && !reduced) modeCine();
    else if (MODE === 'comic' && !reduced) modeComic();
    else modeSuave();
    ScrollTrigger.refresh();
  };
  // Las fuentes cambian medidas: esperamos a que carguen antes de medir los pins
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
