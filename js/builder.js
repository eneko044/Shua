// Crea tu taco: tamaño, proteínas, salsa, extras y precio en directo
import { sizes, proteinas, salsas, extras, salsaExtra, menuPrice, eur } from './menu-data.js';

const hotIcon = '<svg class="chip__hot" aria-label="picante"><use href="#chili"/></svg>';
const leafIcon = '<svg class="chip__hot" style="color:#9be07a" aria-label="vegetariano"><use href="#leaf"/></svg>';

function chip(type, name, item, extra = '') {
  return `<label class="chip" data-id="${item.id}">
    <input type="${type}" name="${name}" value="${item.id}">
    <span class="chip__ui" style="--c:${item.color}">
      <span class="chip__dot"></span>${item.name}${item.hot ? hotIcon : ''}${item.veggie ? leafIcon : ''}
      ${item.note ? `<span class="chip__note">${item.note}</span>` : ''}${extra}
    </span>
  </label>`;
}

export function initBuilder(root = document) {
  const form = root.querySelector('[data-builder]');
  if (!form) return;
  const $ = (s) => root.querySelector(s);
  const gsap = window.gsap;

  // ---- pintar opciones
  $('[data-sizes]').innerHTML = sizes.map((s, i) => `
    <label class="size">
      <input type="radio" name="size" value="${s.id}" ${i === 0 ? 'checked' : ''}>
      <span class="size__ui">
        <span class="size__id">${s.id}</span>
        <span class="size__price">${eur(s.price)}</span>
        <span class="size__p">${s.proteins} ${s.proteins > 1 ? 'proteínas' : 'proteína'}</span>
      </span>
    </label>`).join('');
  form.querySelector('[data-group="proteinas"]').innerHTML = proteinas.map((p) => chip('checkbox', 'proteina', p)).join('');
  form.querySelector('[data-group="salsas"]').innerHTML = salsas.map((p) => chip('radio', 'salsa', p)).join('');
  form.querySelector('[data-group="extras"]').innerHTML = extras.map((p) => chip('checkbox', 'extra', p, `<span class="chip__price">+${eur(p.price)}</span>`)).join('');
  form.querySelector('[data-group="salsaExtra"]').innerHTML = salsaExtra.map((p) => chip('checkbox', 'salsaExtra', p, `<span class="chip__price">+${eur(p.price)}</span>`)).join('');

  const byId = {};
  [...proteinas, ...salsas, ...extras, ...salsaExtra].forEach((x) => { byId[x.id] = x; });

  const state = { size: sizes[0], proteins: [], salsa: null, extras: [], salsaExtra: [], menu: false };
  const totalEl = $('[data-total]');
  const msgEl = $('[data-t-msg]');
  const hintEl = $('[data-prot-hint]');
  const stackEl = $('[data-stack]');
  const shown = { total: state.size.price };

  const total = () =>
    state.size.price
    + state.extras.reduce((a, id) => a + byId[id].price, 0)
    + state.salsaExtra.reduce((a, id) => a + byId[id].price, 0)
    + (state.menu ? menuPrice : 0);

  const lines = () => {
    const out = [[`Taco ${state.size.id}`, eur(state.size.price)]];
    state.proteins.forEach((id) => out.push([byId[id].name, 'incluido', true]));
    if (state.salsa) out.push([`Salsa ${byId[state.salsa].name}`, 'incluida', true]);
    out.push(['Patatas y salsa de queso', 'incluido', true]);
    state.extras.forEach((id) => out.push([byId[id].name, '+' + eur(byId[id].price)]));
    state.salsaExtra.forEach((id) => out.push([`Salsa extra ${byId[id].name}`, '+' + eur(byId[id].price)]));
    if (state.menu) out.push(['Menú (patatas + bebida)', '+' + eur(menuPrice)]);
    return out;
  };

  // ---- dibujo del taco por capas
  const layerKeys = () => {
    const keys = [{ k: 'base', c: '#F2C230', cls: 'layer--base' }];
    state.proteins.forEach((id) => keys.push({ k: id, c: byId[id].color }));
    state.extras.forEach((id) => keys.push({ k: id, c: byId[id].color }));
    if (state.salsa) keys.push({ k: state.salsa, c: byId[state.salsa].color, cls: 'layer--sauce' });
    state.salsaExtra.forEach((id) => keys.push({ k: id, c: byId[id].color, cls: 'layer--sauce' }));
    keys.push({ k: 'queso', c: '#FFB627', cls: 'layer--sauce' });
    return keys;
  };
  const renderStack = () => {
    const keys = layerKeys();
    const want = new Set(keys.map((x) => x.k));
    [...stackEl.children].forEach((el) => {
      if (!want.has(el.dataset.k)) {
        if (gsap) gsap.to(el, { x: 60, opacity: 0, height: 0, marginTop: -3, duration: 0.3, ease: 'power2.in', onComplete: () => el.remove() });
        else el.remove();
        el.dataset.k = '__gone';
      }
    });
    keys.forEach((x, i) => {
      let el = stackEl.querySelector(`[data-k="${x.k}"]`);
      const fresh = !el;
      if (fresh) {
        el = document.createElement('div');
        el.className = 'layer ' + (x.cls || '');
        el.dataset.k = x.k;
        el.style.setProperty('--c', x.c);
      }
      // column-reverse: el orden del DOM es de abajo arriba
      const ref = stackEl.children[i];
      if (ref !== el) stackEl.insertBefore(el, ref || null);
      if (fresh && gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(el, { y: -140, opacity: 0, scaleX: 0.6, rotate: gsap.utils.random(-8, 8) },
          { y: 0, opacity: 1, scaleX: 1, rotate: 0, duration: 0.7, ease: 'bounce.out' });
      }
    });
  };

  const render = () => {
    const max = state.size.proteins;
    hintEl.textContent = `${state.proteins.length} de ${max}`;
    form.querySelectorAll('input[name="proteina"]').forEach((i) => {
      i.checked = state.proteins.includes(i.value);
    });

    $('[data-t-size]').textContent = `Taco ${state.size.id}`;
    $('[data-t-lines]').innerHTML = lines().map(([a, b, muted]) =>
      `<li class="${muted ? 'is-muted' : ''}"><span>${a}</span><span>${b}</span></li>`).join('');

    const t = total();
    if (gsap) {
      gsap.to(shown, {
        total: t, duration: 0.6, ease: 'power3.out', overwrite: true,
        onUpdate: () => { totalEl.textContent = eur(Math.round(shown.total * 100) / 100); },
      });
      gsap.fromTo(totalEl, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
    } else totalEl.textContent = eur(t);

    if (!state.proteins.length) msgEl.textContent = `Elige ${max === 1 ? 'tu proteína' : `hasta ${max} proteínas`}.`;
    else if (!state.salsa) msgEl.textContent = 'Falta la salsa.';
    else msgEl.textContent = '¡Listo! Enséñaselo al equipo en barra.';
    renderStack();
  };

  form.addEventListener('change', (e) => {
    const i = e.target;
    if (i.name === 'size') {
      state.size = sizes.find((s) => s.id === i.value);
      if (state.proteins.length > state.size.proteins) state.proteins = state.proteins.slice(0, state.size.proteins);
    }
    if (i.name === 'proteina') {
      if (i.checked) {
        if (state.proteins.length >= state.size.proteins) {
          if (state.size.proteins === 1) state.proteins = [i.value]; // en M, cambia directamente
          else {
            i.checked = false;
            const c = i.closest('.chip');
            c.classList.remove('is-shake'); void c.offsetWidth; c.classList.add('is-shake');
            const next = sizes.find((s) => s.proteins > state.size.proteins);
            msgEl.textContent = next
              ? `El taco ${state.size.id} lleva ${state.size.proteins} proteínas. Pásate al ${next.id} para añadir otra.`
              : 'El XL ya lleva el máximo: 3 proteínas.';
            return;
          }
        } else state.proteins.push(i.value);
      } else state.proteins = state.proteins.filter((x) => x !== i.value);
    }
    if (i.name === 'salsa') state.salsa = i.value;
    if (i.name === 'extra') state.extras = [...form.querySelectorAll('input[name="extra"]:checked')].map((x) => x.value);
    if (i.name === 'salsaExtra') state.salsaExtra = [...form.querySelectorAll('input[name="salsaExtra"]:checked')].map((x) => x.value);
    render();
  });

  $('[data-menu]').addEventListener('change', (e) => { state.menu = e.target.checked; render(); });

  // Ticket a pantalla completa para enseñar en barra
  const dlg = $('[data-fullticket]');
  $('[data-show-ticket]').addEventListener('click', () => {
    if (!state.proteins.length || !state.salsa) {
      render();
      gsap && gsap.fromTo(msgEl, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    $('[data-ft-title]').textContent = `Taco ${state.size.id}`;
    $('[data-ft-lines]').innerHTML = lines().slice(1).map(([a]) => `<li>${a}</li>`).join('');
    $('[data-ft-total]').textContent = eur(total());
    dlg.showModal();
    gsap && gsap.from(dlg.querySelector('.fullticket__inner'), { y: 80, rotate: -4, scale: 0.9, opacity: 0, duration: 0.6, ease: 'back.out(1.6)' });
  });
  $('[data-close-ticket]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  render();
}
