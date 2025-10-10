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
