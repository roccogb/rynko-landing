// js/app.js — glow dots (ultra minimal, with config)

/*** CONFIG ***/
const CFG = {
  DENSITY_DIV: 30000,   // MÁS grande => MENOS puntos (ej.: 30000, 40000)
  R_MIN: 0.4,           // radio mínimo (px * DPR)
  R_ADD: 0.6,           // aleatorio añadido: tamaño final = R_MIN + rand()*R_ADD
  ALPHA_MIN: 0.35,      // brillo base mínimo (0..1)
  ALPHA_ADD: 0.25,      // aleatorio añadido al brillo base
  SHADOW_BLUR: 4,       // glow (px * DPR) — 0..6 muy sutil
  PARALLAX: 18,         // cuánto se mueve con el mouse (px)
  TRANSLATE: 18,        // parallax de los puntos (px)
  TW_SPEED_MIN: 0.2,    // velocidad mínima del pulso
  TW_SPEED_ADD: 0.2,    // variación del pulso
  DRIFT_X: 0.08,        // velocidad horizontal base
  DRIFT_Y: 0.04         // velocidad vertical base
};
/*** END CONFIG ***/

/* Año */
document.getElementById("year").textContent = new Date().getFullYear();

/* Parallax + glow dots */
const grid = document.getElementById("grid");
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d", { alpha: true });

let W, H, DPR;
const dots = [];
let mx = 0, my = 0, px = 0, py = 0;

function densityDiv() {
  // menos puntos aún en pantallas chicas
  const area = innerWidth * innerHeight;
  if (area < 700000) return CFG.DENSITY_DIV * 1.5;  // móviles: más sparsos
  return CFG.DENSITY_DIV;
}

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = (canvas.width = Math.floor(innerWidth * DPR));
  H = (canvas.height = Math.floor(innerHeight * DPR));
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  dots.length = 0;
  const count = Math.max(30, Math.floor((innerWidth * innerHeight) / densityDiv()));
  for (let i = 0; i < count; i++) {
    const baseA = Math.random() * CFG.ALPHA_ADD + CFG.ALPHA_MIN;
    dots.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: (Math.random() * CFG.R_ADD + CFG.R_MIN) * DPR,
      baseA,
      phase: Math.random() * Math.PI * 2,
      tw: Math.random() * CFG.TW_SPEED_ADD + CFG.TW_SPEED_MIN,
      speedX: (Math.random() * CFG.DRIFT_X) * DPR,
      speedY: (Math.random() * CFG.DRIFT_Y - CFG.DRIFT_Y / 2) * DPR
    });
  }
}
resize();
addEventListener("resize", resize, { passive: true });

addEventListener("pointermove", (e) => {
  mx = e.clientX / innerWidth - 0.5;
  my = e.clientY / innerHeight - 0.5;
}, { passive: true });

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function tick() {
  px += (mx - px) * 0.08;
  py += (my - py) * 0.08;

  if (!reduce) {
    const gx = px * CFG.PARALLAX, gy = py * CFG.PARALLAX;
    grid.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
  }

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (!reduce) ctx.translate(-px * CFG.TRANSLATE * DPR, -py * CFG.TRANSLATE * DPR);

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = CFG.SHADOW_BLUR * DPR;

  for (const d of dots) {
    d.x += d.speedX;
    d.y += d.speedY;
    if (d.x > W + 20) d.x = -20;
    if (d.x < -20)    d.x = W + 20;
    if (d.y > H + 20) d.y = -20;
    if (d.y < -20)    d.y = H + 20;

    d.phase += d.tw * 0.02;
    const pulse = 0.9 + 0.1 * Math.sin(d.phase); // 0.9–1.0 muy sutil
    ctx.globalAlpha = d.baseA * pulse;

    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  requestAnimationFrame(tick);
}
tick();

// document.documentElement.style.setProperty("--accent", "#ffffff"); // título full B/N
// ===== Scroll reveal =====
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = Array.from(document.querySelectorAll('.reveal'));

  if (prefersReduced) {
    // sin animaciones: mostrar todo
    items.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target); // revelar una vez
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

  items.forEach(el => io.observe(el));
})();


// Count-up para .kpis .num (idempotente)
(function(){
  if (window.__rynko_kpi_init) return; window.__rynko_kpi_init = true;
  const nums = Array.from(document.querySelectorAll('.kpis .num'));
  if (!nums.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target; const to = parseInt(el.dataset.to||'0',10);
      let cur = 0; const dur = 1100; const t0 = performance.now();
      function step(t){ const k=Math.min(1,(t-t0)/dur); cur=Math.round(to*(0.5-0.5*Math.cos(Math.PI*k))); el.textContent=cur; if(k<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n=>io.observe(n));
})();
// Reveal on scroll (idempotente)
(function(){
  if (window.__rynko_reveal_init) return; window.__rynko_reveal_init = true;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (prefersReduced){ items.forEach(el=>el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
  }, { rootMargin:'0px 0px -10% 0px', threshold:0.2 });
  items.forEach(el=>io.observe(el));
})();

// Count-up para .kpis .num (idempotente)
(function(){
  if (window.__rynko_kpi_init) return; window.__rynko_kpi_init = true;
  const nums = Array.from(document.querySelectorAll('.kpis .num'));
  if (!nums.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target; const to = parseInt(el.dataset.to||'0',10);
      let cur = 0; const dur = 1100; const t0 = performance.now();
      function step(t){ const k=Math.min(1,(t-t0)/dur); cur=Math.round(to*(0.5-0.5*Math.cos(Math.PI*k))); el.textContent=cur; if(k<1) requestAnimationFrame(step); }
      requestAnimationFrame(step); io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n=>io.observe(n));
})();
// FAQ accordion (idempotente)
(function(){
  if (window.__rynko_faq) return; window.__rynko_faq = true;
  const rows = Array.from(document.querySelectorAll('.faq .qa'));
  function setOpen(row, open){
    const btn = row.querySelector('.q');
    const panel = row.querySelector('.a');
    row.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
  }
  rows.forEach(row=>{
    const btn = row.querySelector('.q');
    setOpen(row, false);
    btn.addEventListener('click', ()=>{
      const willOpen = !row.classList.contains('open');
      rows.forEach(r => r!==row && setOpen(r, false));
      setOpen(row, willOpen);
    });
    btn.addEventListener('keydown', (e)=>{
      if(e.key==='ArrowDown'){ e.preventDefault(); rows[(rows.indexOf(row)+1)%rows.length].querySelector('.q').focus(); }
      if(e.key==='ArrowUp'){ e.preventDefault(); rows[(rows.indexOf(row)-1+rows.length)%rows.length].querySelector('.q').focus(); }
    });
  });
})();
// FAQ: open first item and smooth height (idempotent)
(function(){
  if(window.__faq_init) return; window.__faq_init = true;
  const items = Array.from(document.querySelectorAll('.faq .fqi'));
  if(items[0]) items[0].setAttribute('open','');
  // smooth toggle
  items.forEach(d=>{
    const ans = d.querySelector('.ans');
    d.addEventListener('toggle', ()=>{
      if(d.open){ ans.style.maxHeight = ans.scrollHeight+'px'; setTimeout(()=> ans.style.maxHeight='', 300); }
      else { ans.style.maxHeight = ans.scrollHeight+'px'; requestAnimationFrame(()=> ans.style.maxHeight='0px'); }
    });
  });
})();


// Word rotator (About) — idempotente
(function(){
  if(window.__rynko_wordrot) return; window.__rynko_wordrot = true;
  const el = document.querySelector('.rotowords');
  if(!el) return;
  const list = (el.getAttribute('data-words')||'Rynko').split(/[;,\|]/).map(s=>s.trim()).filter(Boolean);
  if(list.length < 2) return;
  let i = 0; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(){
    i = (i+1) % list.length;
    el.classList.remove('fade-in'); el.classList.add('fade-out');
    setTimeout(()=>{ el.textContent = list[i]; el.classList.remove('fade-out'); el.classList.add('fade-in'); }, 220);
    setTimeout(tick, reduce ? 3500 : 2200);
  }
  el.classList.add('fade-in');
  setTimeout(tick, 2200);
})();
// i18n ES/EN (idempotente)
(function(){
  if(window.__rynko_i18n) return; window.__rynko_i18n = true;

  const DICT = {
    en: {
      'nav.contacto':'Contact',
      'cta.reservar':'Book meeting',
      'faq.title':'Answer your questions',
      'faq.sub':'You’ve got questions. We’ve got answers',
      'about.title.prefix':'We are ',
      'resultados.title':'Results in numbers',
      'resultados.intro':'Typical impact in the first 30 days with Rynko.',
      'cambios.title':'What changes in your day-to-day',
      'cambios.intro':'Simple before/after comparison of your operation.',
      'kpi.1':'% fewer manual tasks',
      'kpi.2':'% faster response time',
      'kpi.3':'% processes monitored',
      'kpi.4':'/7 alerts and reports'
    },
    es: {
      'nav.contacto':'Contacto',
      'cta.reservar':'Reservar reunión',
      'faq.title':'Answer your questions', // si tu FAQ está en inglés lo dejamos
      'faq.sub':'You’ve got questions. We’ve got answers',
      'about.title.prefix':'We are ',
      'resultados.title':'Resultados en números',
      'resultados.intro':'Impacto típico en los primeros 30 días con Rynko.',
      'cambios.title':'Qué cambia en tu día a día',
      'cambios.intro':'Comparativo simple de tu operación antes y después.',
      'kpi.1':'% menos tareas manuales',
      'kpi.2':'% más velocidad de respuesta',
      'kpi.3':'% procesos monitoreados',
      'kpi.4':'/7 alertas y reportes'
    }
  };

  function setText(el, txt){ if(el) el.textContent = txt; }
  function q(sel){ return document.querySelector(sel); }

  function apply(lang){
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('lang', lang);

    // Navbar: Contacto (si existe)
    const navContact = Array.from(document.querySelectorAll('nav a, header a, .nav a'))
      .find(a => /contacto|contact/gi.test(a.textContent));
    if(navContact) setText(navContact, DICT[lang]['nav.contacto']);

    // CTAs principales
    Array.from(document.querySelectorAll('a,button')).forEach(b=>{
      if(/reservar reunión|book meeting/gi.test(b.textContent.trim()))
        setText(b, DICT[lang]['cta.reservar']);
    });

    // Resultados (si están)
    const rTitle = Array.from(document.querySelectorAll('h2')).find(h=>/resultados|results in numbers/gi.test(h.textContent));
    if(rTitle) setText(rTitle, DICT[lang]['resultados.title']);
    const rIntro = Array.from(document.querySelectorAll('p'))
      .find(p=>/Impacto típico|Typical impact/gi.test(p.textContent));
    if(rIntro) setText(rIntro, DICT[lang]['resultados.intro']);

    // Cambios
    const dTitle = Array.from(document.querySelectorAll('h2')).find(h=>/Qué cambia|What changes/gi.test(h.textContent));
    if(dTitle) setText(dTitle, DICT[lang]['cambios.title']);
    const dIntro = Array.from(document.querySelectorAll('p'))
      .find(p=>/Comparativo simple|Simple before\/after/gi.test(p.textContent));
    if(dIntro) setText(dIntro, DICT[lang]['cambios.intro']);

    // KPIs labels (si tus <small> existen en el bloque de resultados)
    const labels = Array.from(document.querySelectorAll('#resultados .kpis small, .about .kpis small'));
    if(labels.length>=4){
      labels[0].textContent = DICT[lang]['kpi.1'];
      labels[1].textContent = DICT[lang]['kpi.2'];
      labels[2].textContent = DICT[lang]['kpi.3'];
      if(labels[3]) labels[3].textContent = DICT[lang]['kpi.4'];
    }

    // Toggle activo en UI
    document.querySelectorAll('.lang-btn').forEach(b=>{
      b.classList.toggle('active', b.dataset.lang===lang);
    });
  }

  // eventos UI
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.lang-btn');
    if(!btn) return;
    apply(btn.dataset.lang==='en'?'en':'es');
  });

  // init
  apply(localStorage.getItem('lang')||'es');
})();
// FAQ: smooth + accordion (idempotente)
(function(){
  if(window.__faq_fix) return; window.__faq_fix = true;
  const items = Array.from(document.querySelectorAll('.faq .fqi'));
  if(!items.length) return;

  // abre el primero si ninguno está abierto
  if(!items.some(d=>d.open)) items[0].open = true;

  // acordeón
  items.forEach(d=>{
    d.addEventListener('toggle', ()=>{
      if(d.open){
        items.filter(x=>x!==d).forEach(x=>x.open=false);
        const ans = d.querySelector('.ans');
        if(ans){ ans.style.maxHeight = ans.scrollHeight+'px'; setTimeout(()=> ans.style.maxHeight='', 300); }
      }
    });
  });
})();
// Count-up para KPIs (idempotente)
(function(){
  if(window.__rynko_countup) return; window.__rynko_countup = true;

  const els = Array.from(document.querySelectorAll('.kpis .num'));
  if(!els.length) return;

  const IO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target; IO.unobserve(el);
      const to = parseFloat(el.getAttribute('data-to')||'0');
      const dur = 1100; const start = performance.now();
      function step(t){
        const p = Math.min(1, (t - start)/dur);
        const val = Math.round(to * (0.2 + 0.8*p)); // easing suave
        el.textContent = val;
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  },{ threshold:.3 });

  els.forEach(el=> IO.observe(el));
})();
// i18n ES/EN (navbar + hero + sections) — idempotente
(function(){
  if(window.__rynko_i18n_v2) return; window.__rynko_i18n_v2 = true;

  const STR = {
    es:{
      nav:{ solutions:'Soluciones', usecases:'Casos de uso', how:'Cómo trabajamos', pricing:'Precios', faq:'FAQ', about:'Nosotros', contact:'Contacto', book:'Reservar reunión' },
      hero:{ sub:'Automatizamos procesos con n8n + IA para ahorrar tiempo, reducir errores y escalar tu operación. Integraciones limpias, resultados medibles y mantenimiento sencillo.' },
      res:{ title:'Resultados en números', intro:'Impacto típico en los primeros 30 días con Rynko.' },
      deltas:{ title:'Qué cambia en tu día a día', intro:'Comparativo simple de tu operación antes y después.' },
      kpi:['% menos tareas manuales','% más velocidad de respuesta','% procesos monitoreados','/7 alertas y reportes']
    },
    en:{
      nav:{ solutions:'Solutions', usecases:'Use cases', how:'How we work', pricing:'Pricing', faq:'FAQ', about:'About', contact:'Contact', book:'Book meeting' },
      hero:{ sub:'We automate processes with n8n + AI to save time, reduce errors, and scale your operations. Clean integrations, measurable results, simple maintenance.' },
      res:{ title:'Results in numbers', intro:'Typical impact in the first 30 days with Rynko.' },
      deltas:{ title:'What changes in your day-to-day', intro:'Simple before/after comparison of your operation.' },
      kpi:['% fewer manual tasks','% faster response time','% processes monitored','/7 alerts and reports']
    }
  };

  function setText(el, txt){ if(el) el.textContent = txt; }
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  function translateNavbar(lang){
    const map = STR[lang].nav;

    // intentamos por texto o por href a secciones
    qsa('nav a, header nav a').forEach(a=>{
      const href = (a.getAttribute('href')||'').toLowerCase();
      const t = a.textContent.trim().toLowerCase();

      if(/soluciones|solutions/.test(t) || /#soluciones|#solutions/.test(href)) setText(a, map.solutions);
      else if(/casos de uso|use cases/.test(t) || /#casos|#usecases/.test(href)) setText(a, map.usecases);
      else if(/c[oó]mo trabajamos|how we work/.test(t) || /#como|#how/.test(href)) setText(a, map.how);
      else if(/precios|pricing/.test(t) || /#precios|#pricing/.test(href)) setText(a, map.pricing);
      else if(/faq/.test(t) || /#faq/.test(href)) setText(a, map.faq);
      else if(/nosotros|about/.test(t) || /#about|#nosotros/.test(href)) setText(a, map.about);
      else if(/contacto|contact/.test(t) || /#contacto|#contact/.test(href)) setText(a, map.contact);
      // botones de reservar
      if(/reservar|book/.test(t) && a.tagName==='A') setText(a, map.book);
    });

    qsa('button,a').forEach(b=>{
      const t = b.textContent.trim().toLowerCase();
      if(/reservar reuni|book meeting/.test(t)) setText(b, map.book);
    });
  }

  function translateHero(lang){
    // subtítulo del hero: es el <p> debajo del H1 triple
    const heroSub = qsa('section, .hero, .intro, .wrap p').find(p =>
      /automatizamos procesos con n8n|we automate processes with n8n/i.test(p.textContent)
    );
    if(heroSub) setText(heroSub, STR[lang].hero.sub);
  }

  function translateSections(lang){
    // Resultados
    const rTitle = qsa('h2').find(h=>/resultados en n[uú]meros|results in numbers/i.test(h.textContent));
    if(rTitle) setText(rTitle, STR[lang].res.title);
    const rIntro = qsa('p').find(p=>/Impacto t[ií]pico|Typical impact/i.test(p.textContent));
    if(rIntro) setText(rIntro, STR[lang].res.intro);

    // Cambios
    const dTitle = qsa('h2').find(h=>/qu[eé] cambia|what changes/i.test(h.textContent));
    if(dTitle) setText(dTitle, STR[lang].deltas.title);
    const dIntro = qsa('p').find(p=>/Comparativo simple|Simple before\/after/i.test(p.textContent));
    if(dIntro) setText(dIntro, STR[lang].deltas.intro);

    // Labels KPIs (primer bloque que aparezca)
    const labels = qsa('#resultados .kpis small, .about .kpis small, .about .kpis.mini small');
    labels.slice(0,4).forEach((sm,i)=> sm.textContent = STR[lang].kpi[i] || sm.textContent);
  }

  function apply(lang){
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('lang', lang);
    translateNavbar(lang);
    translateHero(lang);
    translateSections(lang);
    document.querySelectorAll('.lang-btn').forEach(b=> b.classList.toggle('active', b.dataset.lang===lang));
  }

  // eventos
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.lang-btn'); if(!btn) return;
    apply(btn.dataset.lang==='en'?'en':'es');
  });

  // init
  apply(localStorage.getItem('lang') || 'es');
})();
