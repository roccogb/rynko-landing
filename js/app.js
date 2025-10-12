// ===== Minimal stars + parallax =================================================
const CFG = { DENSITY_DIV: 30000, R_MIN: .4, R_ADD: .6, ALPHA_MIN: .35, ALPHA_ADD: .25,
  SHADOW_BLUR: 4, PARALLAX: 18, TRANSLATE: 18, TW_SPEED_MIN: .2, TW_SPEED_ADD: .2,
  DRIFT_X: .08, DRIFT_Y: .04 };

// Año (seguro si no existe el #year)
{ const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); }

const grid = document.getElementById('grid');
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d', { alpha:true });

let W,H,DPR, mx=0,my=0, px=0,py=0; const dots=[];
function densityDiv(){ const a=innerWidth*innerHeight; return a<700000? CFG.DENSITY_DIV*1.5:CFG.DENSITY_DIV; }
function resize(){
  DPR = Math.min(2, window.devicePixelRatio||1);
  W = canvas.width  = Math.floor(innerWidth * DPR);
  H = canvas.height = Math.floor(innerHeight* DPR);
  canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
  dots.length=0; const count=Math.max(30, Math.floor((innerWidth*innerHeight)/densityDiv()));
  for (let i=0;i<count;i++){
    const baseA=Math.random()*CFG.ALPHA_ADD+CFG.ALPHA_MIN;
    dots.push({ x:Math.random()*W, y:Math.random()*H, r:(Math.random()*CFG.R_ADD+CFG.R_MIN)*DPR,
      baseA, phase:Math.random()*Math.PI*2, tw:Math.random()*CFG.TW_SPEED_ADD+CFG.TW_SPEED_MIN,
      speedX:(Math.random()*CFG.DRIFT_X)*DPR, speedY:(Math.random()*CFG.DRIFT_Y-CFG.DRIFT_Y/2)*DPR });
  }
}
resize(); addEventListener('resize',resize,{passive:true});
addEventListener('pointermove',e=>{ mx=e.clientX/innerWidth-.5; my=e.clientY/innerHeight-.5; },{passive:true});

const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function tick(){
  px+=(mx-px)*.08; py+=(my-py)*.08;
  if(!prefersReduce){ grid.style.transform=`translate3d(${px*CFG.PARALLAX}px,${py*CFG.PARALLAX}px,0)`; }
  ctx.clearRect(0,0,W,H); ctx.save(); if(!prefersReduce) ctx.translate(-px*CFG.TRANSLATE*DPR, -py*CFG.TRANSLATE*DPR);
  ctx.fillStyle='#fff'; ctx.shadowColor='#fff'; ctx.shadowBlur=CFG.SHADOW_BLUR*DPR;
  for (const d of dots){
    d.x+=d.speedX; d.y+=d.speedY;
    if(d.x>W+20)d.x=-20; if(d.x<-20)d.x=W+20; if(d.y>H+20)d.y=-20; if(d.y<-20)d.y=H+20;
    d.phase+=d.tw*.02; const pulse=.9+.1*Math.sin(d.phase); ctx.globalAlpha=d.baseA*pulse;
    ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
  }
  ctx.restore(); requestAnimationFrame(tick);
}
tick();

// ===== Reveal on scroll (idempotente) ==========================================
(function(){
  if(window.__reveal_init) return; window.__reveal_init = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...document.querySelectorAll('.reveal')];
  if(reduce){ items.forEach(el=>el.classList.add('in')); return; }
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
  },{rootMargin:'0px 0px -10% 0px', threshold:.2});
  items.forEach(el=>io.observe(el));
})();

// ===== KPIs count-up (idempotente) =============================================
(function(){
  if(window.__kpi_up) return; window.__kpi_up = true;
  const nums=[...document.querySelectorAll('.kpis .num')];
  if(!nums.length) return;
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return; io.unobserve(e.target);
      const el=e.target, to=parseFloat(el.dataset.to||'0'), dur=1100, t0=performance.now();
      function step(t){ const k=Math.min(1,(t-t0)/dur); el.textContent=Math.round(to*(0.5-0.5*Math.cos(Math.PI*k))); if(k<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  },{threshold:.4});
  nums.forEach(n=>io.observe(n));
})();

// ===== FAQ smoother + acordeón (idempotente) ===================================
(function(){
  if(window.__faq) return; window.__faq = true;
  const items=[...document.querySelectorAll('.fqi')];
  if(items.length && !items.some(d=>d.open)) items[0].open=true;
  items.forEach(d=>{
    const ans=d.querySelector('.ans');
    d.addEventListener('toggle',()=>{
      if(d.open){
        items.filter(x=>x!==d).forEach(x=>x.open=false);
        if(ans){ ans.style.maxHeight=ans.scrollHeight+'px'; setTimeout(()=>ans.style.maxHeight='',300); }
      }
    });
  });
})();

// ===== Word rotator (About) (idempotente) ======================================
(function(){
  if(window.__rotowords) return; window.__rotowords = true;
  const el=document.querySelector('.rotowords'); if(!el) return;
  const list=(el.dataset.words||'Rynko').split(/[;,\|]/).map(s=>s.trim()).filter(Boolean);
  if(list.length<2) return;
  let i=0; const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cycle(){
    i=(i+1)%list.length;
    el.classList.remove('fade-in'); el.classList.add('fade-out');
    setTimeout(()=>{ el.textContent=list[i]; el.classList.remove('fade-out'); el.classList.add('fade-in'); },220);
    setTimeout(cycle, reduce?3500:2200);
  }
  el.classList.add('fade-in'); setTimeout(cycle,2200);
})();

/* =========================================================
   Rynko i18n — navbar flags, hero, solutions, about, changes,
   FAQ, KPIs, footer (único bloque, sin duplicados)
   ========================================================= */
(function () {
  if (window.__rynko_i18n_full) return;
  window.__rynko_i18n_full = true;

  const TEXT = {
    es: {
      meta: {
        title: "Rynko — Ritmo. Pensar. Automatizar.",
        desc: "Automatización + IA con n8n para empresas. Rynko: Ritmo. Pensar. Automatizar.",
      },
      nav: { solutions: "Soluciones", about: "Nosotros", faq: "FAQ", contact: "Contacto", book: "Reservar reunión" },
      hero: {
        sub: "Automatizamos procesos con n8n + IA para ahorrar tiempo, reducir errores y escalar tu operación. Integraciones limpias, resultados medibles y mantenimiento sencillo.",
        cta: "Reservar reunión",
      },
      about: {
        titlePrefix: "Somos",
        rotowords: "Rynko;constructores;automatizadores;diseñadores;ingenieros;makers",
        lead: "Un estudio boutique de automatización + IA. Combinamos ingeniería y diseño para construir sistemas que piensan y fluyen.",
        pills: ["Expertos en n8n", "Asistentes IA & retrieval", "Dashboards & alertas", "Flujos versionados", "Security by design"],
      },
      solutions: {
        title: "Soluciones",
        sub: "Descubrí cómo conectamos tus herramientas con n8n + IA para ganar velocidad y control.",
        cards: [
          { h: "Automatización operativa", p: "Flujos n8n entre CRM, correo, WhatsApp, Sheets, ERP. Reportes y alertas." },
          { h: "IA aplicada", p: "Asistentes y chatbots con contexto propio; clasificación y generación de respuestas." },
          { h: "Integraciones a medida", p: "APIs, webhooks y conectores custom con monitoreo y versionado." },
          { h: "Data & reporting", p: "Dashboards y resúmenes automáticos con métricas clave enviadas a tu equipo." },
          { h: "Onboarding & training", p: "Documentación, handoff y capacitaciones para equipos comerciales y operaciones." },
          { h: "Soporte y mantenimiento", p: "Monitoreo, alertas y mejoras continuas para asegurar disponibilidad y calidad." },
        ],
      },
      changes: {
        title: "Qué cambia en tu día a día",
        intro: "Pasamos de procesos manuales y dispersos a flujos automatizados, medibles y monitoreados:",
        items: [
          "Asignación de tickets: de manual a automática (reglas + IA).",
          "Reportes: de semanales a diarios 08:00 con insights.",
          "Captura y seguimiento: unificados en CRM con follow-up.",
          "Respuestas: de copiar/pegar a draft con IA + validación.",
          "Errores: de descubiertos tarde a alertas en tiempo real.",
          "Integraciones: de ad-hoc a flujos versionados y monitoreados.",
        ],
      },
      faq: {
        kicker: "Preguntas frecuentes",
        title: "Resuelve tus preguntas",
        sub: "Tenés preguntas. Tenemos respuestas",
        qa: [
          { q: "¿Por qué usar Rynko?", a: "Conectamos tu stack con n8n + IA para automatizar trabajo repetitivo, reducir errores y escalar la operación." },
          { q: "¿Qué sistemas soportan?", a: "HubSpot, Pipedrive, Gmail, Slack, WhatsApp API/Cloud, Google Sheets, Notion, Shopify, Stripe, webhooks y más." },
          { q: "¿En cuánto tiempo veo resultados?", a: "Primer flujo en 7–10 días. Impacto medible hacia el día 30." },
          { q: "¿Seguridad y datos?", a: "Credenciales de mínimo privilegio, vaults, flujos versionados, monitoreo y alertas. Tus datos quedan en tus sistemas." },
          { q: "¿Modelo de trabajo y precios?", a: "Proyecto, retainer o híbrido. Reservá una llamada y cotizamos para tu caso." },
          { q: "¿Quién es dueño de los flows y prompts?", a: "Vos. Entregamos repo, documentación y accesos." },
        ],
      },
      kpis: ["% menos tareas manuales", "% más velocidad de respuesta", "% procesos monitoreados", "/7 alertas y reportes"],
      footer: "© {year} Rynko — Automatización & IA",
      footerCols: {
        titles: { services: "Servicios", resources: "Recursos", legal: "Legal" },
        links: {
          "svc-ops": "Automatización operativa",
          "svc-ai": "Asistentes IA",
          "svc-int": "Integraciones & APIs",
          "svc-dash": "Dashboards & reportes",
          "res-faq": "Preguntas frecuentes",
          "res-call": "Agenda una llamada",
          "res-cases": "Casos (próximamente)",
          "res-n8n": "Docs de n8n",
          "leg-terms": "Términos",
          "leg-privacy": "Privacidad"
        },
        tagline: "Ritmo. Pensar. Automatizar.",
        bottom: "© {year} Rynko — Automatización & IA"
      }
    },
    en: {
      meta: {
        title: "Rynko — Rhythm. Think. Automate.",
        desc: "Automation + AI with n8n for companies. Rynko: Rhythm. Think. Automate.",
      },
      nav: { solutions: "Solutions", about: "About", faq: "FAQ", contact: "Contact", book: "Book a call" },
      hero: {
        sub: "We automate processes with n8n + AI to save time, reduce errors and scale your operation. Clean integrations, measurable results and simple maintenance.",
        cta: "Book a call",
      },
      about: {
        titlePrefix: "We are",
        rotowords: "Rynko;builders;automators;designers;engineers;makers",
        lead: "A boutique Automation + AI studio. We combine engineering and design to build systems that think and flow.",
        pills: ["n8n experts", "AI assistants & retrieval", "Dashboards & alerts", "Versioned flows", "Security by design"],
      },
      solutions: {
        title: "Solutions",
        sub: "See how we connect your tools with n8n + AI to gain speed and control.",
        cards: [
          { h: "Operational automation", p: "n8n flows across CRM, email, WhatsApp, Sheets, ERP. Reports and alerts." },
          { h: "Applied AI", p: "Assistants & chatbots with your context; classification and answer generation." },
          { h: "Custom integrations", p: "APIs, webhooks & custom connectors with monitoring and versioning." },
          { h: "Data & reporting", p: "Dashboards and summaries with key metrics sent to your team." },
          { h: "Onboarding & training", p: "Docs, handoff and training for sales and operations teams." },
          { h: "Support & maintenance", p: "Monitoring, alerts and continuous improvements for availability and quality." },
        ],
      },
      changes: {
        title: "What changes in your day-to-day",
        intro: "We move from manual, scattered work to automated, measurable, monitored flows:",
        items: [
          "Ticket assignment: manual → automatic (rules + AI).",
          "Reporting: weekly → daily 08:00 with insights.",
          "Capture & follow-up: unified in CRM.",
          "Replies: copy/paste → AI draft + validation.",
          "Errors: found late → real-time alerts.",
          "Integrations: ad-hoc → versioned & monitored flows.",
        ],
      },
      faq: {
        kicker: "Frequently Asked Questions",
        title: "Answer your questions",
        sub: "You’ve got questions. We’ve got answers",
        qa: [
          { q: "Why you should use Rynko?", a: "We connect your stack with n8n + AI to automate repetitive work, reduce errors and scale ops." },
          { q: "Which systems do you support?", a: "HubSpot, Pipedrive, Gmail, Slack, WhatsApp API/Cloud, Google Sheets, Notion, Shopify, Stripe, webhooks & more." },
          { q: "How long until results?", a: "First flow in 7–10 days. Measurable impact by day 30." },
          { q: "Security & data?", a: "Least-privilege creds, secret vaults, versioned flows, monitoring & alerts. Your data stays in your systems." },
          { q: "Engagement model & pricing?", a: "Project, retainer or hybrid. Book a call and we’ll tailor a quote to your case." },
          { q: "Who owns flows and prompts?", a: "You do. We hand over repo, docs and access." },
        ],
      },
      kpis: ["% fewer manual tasks", "% faster response", "% processes monitored", "/7 alerts & reports"],
      footer: "© {year} Rynko — Automation & AI",
      footerCols: {
        titles: { services: "Services", resources: "Resources", legal: "Legal" },
        links: {
          "svc-ops": "Operational automation",
          "svc-ai": "AI assistants",
          "svc-int": "Integrations & APIs",
          "svc-dash": "Dashboards & reporting",
          "res-faq": "Frequently Asked Questions",
          "res-call": "Book a call",
          "res-cases": "Case studies (soon)",
          "res-n8n": "n8n docs",
          "leg-terms": "Terms",
          "leg-privacy": "Privacy"
        },
        tagline: "Rhythm. Think. Automate.",
        bottom: "© {year} Rynko — Automation & AI"
      }
    }
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const T = (el, t) => el && (el.textContent = t);

  function getLang() {
    const l = (localStorage.getItem("lang") || document.documentElement.lang || "es").toLowerCase();
    return l === "en" ? "en" : "es";
  }
  function setLang(l) {
    const lang = l === "en" ? "en" : "es";
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("lang", lang);
    document.dispatchEvent(new CustomEvent("rynko:setlang", { detail: lang }));
  }

  // --- NAV ---
  function trNav(lang) {
    const d = TEXT[lang].nav;
    $$('nav .menu a[href="#solutions"]').forEach((a) => T(a, d.solutions));
    $$('nav .menu a[href="#about"]').forEach((a) => T(a, d.about));
    $$('nav .menu a[href="#faq"]').forEach((a) => T(a, d.faq));
    $$('nav .actions .btn.ghost').forEach((a) => T(a, d.contact));
    $$('nav .actions .btn.primary').forEach((a) => T(a, d.book));
  }

  // --- HERO ---
  function trHero(lang) {
    const d = TEXT[lang].hero;
    T($(".hero-sub"), d.sub);
    $$("header.hero .btn.primary").forEach((b) => T(b, d.cta));
  }

  // --- ABOUT (title prefix + rotowords + lead + pills) ---
  function trAbout(lang) {
    const d = TEXT[lang].about;
    const wrap = $("#about .wrap");
    if (!wrap) return;
    const title = $(".about-title", wrap);
    if (title) {
      const span = $(".rotowords", title);
      if (span) {
        span.dataset.words = d.rotowords;
        const first = d.rotowords.split(/[;,\|]/)[0].trim();
        span.textContent = first;
      }
      const prefixNode = title.childNodes[0];
      if (prefixNode && prefixNode.nodeType === 3) {
        title.firstChild.nodeValue = (lang === "es" ? "Somos " : "We are ");
      }
    }
    T($(".lead", wrap), d.lead);

    const pills = $(".pill-list", wrap);
    if (pills) {
      const lis = $$("li", pills);
      d.pills.forEach((txt, i) => {
        if (lis[i]) lis[i].textContent = txt;
        else {
          const li = document.createElement("li");
          li.textContent = txt;
          pills.appendChild(li);
        }
      });
      if (lis.length > d.pills.length) {
        lis.slice(d.pills.length).forEach((x) => x.remove());
      }
    }
  }

  // --- SOLUTIONS ---
  function trSolutions(lang) {
    const d = TEXT[lang].solutions;
    const sec = $(".strip.solutions");
    if (!sec) return;
    T($("h2", sec), d.title);
    T($(".sub", sec), d.sub);
    $$(".cards.six article", sec).forEach((card, i) => {
      const meta = d.cards[i];
      if (!meta) return;
      T($("h3", card), meta.h);
      T($("p", card), meta.p);
    });
  }

  // --- CHANGES (único bloque, sin duplicados) ---
  function renderChanges(lang) {
    const d = TEXT[lang].changes;
    const about = $("#about .wrap");
    if (!about) return;

    // eliminar variantes previas/duplicadas fuera de #about
    document.querySelectorAll('#cambios, .deltas.section, .deltas-grid, .deltas-list')
      .forEach((n) => n.remove());

    let blk = about.querySelector(".changes-text");
    if (!blk) {
      blk = document.createElement("div");
      blk.className = "changes-text";
      const anchor = $(".pill-list", about) || about.lastElementChild;
      (anchor && anchor.parentNode)
        ? anchor.parentNode.insertBefore(blk, anchor.nextSibling)
        : about.appendChild(blk);
    }
    blk.innerHTML = "";

    const h = document.createElement("h3");
    h.className = "changes-title";
    h.textContent = d.title;

    const p = document.createElement("p");
    p.className = "changes-intro";
    p.textContent = d.intro;

    const ul = document.createElement("ul");
    ul.className = "changes-points";
    d.items.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });

    blk.append(h, p, ul);
  }

  // --- FAQ ---
  function trFAQ(lang) {
    const d = TEXT[lang].faq;
    const root = $("#faq");
    if (!root) return;
    const kicker = $(".section-kicker", root);
    if (kicker) kicker.innerHTML = `<span class="dot"></span> ${d.kicker}`;
    T($(".section-title", root), d.title);
    T($(".section-sub", root), d.sub);
    const items = $$(".fqi", root);
    d.qa.forEach((qa, i) => {
      const di = items[i];
      if (!di) return;
      const sum = $("summary", di);
      const chev = sum ? $(".chev", sum) : null;
      if (sum) {
        sum.innerHTML = "";
        sum.append(document.createTextNode(qa.q));
        if (chev) sum.appendChild(chev);
      }
      const ans = $(".ans", di) || $("div", di);
      if (ans) T(ans, qa.a);
    });
  }

  // --- KPIs ---
  function trKPIs(lang) {
    const labels = TEXT[lang].kpis;
    const items = $$(".kpis.mini li");
    items.forEach((li, i) => {
      const small = $("small", li);
      if (small && labels[i]) small.textContent = labels[i];
    });
  }

  // --- FOOTER NUEVO (i18n) ---
  function renderFooterI18N(lang){
    const root = document.getElementById('footer');
    if(!root) return;
    const d = TEXT[lang].footerCols;

    // títulos de columnas
    const mapTitles = {
      services: root.querySelector('.ft-col[data-col="services"] .ft-title'),
      resources: root.querySelector('.ft-col[data-col="resources"] .ft-title'),
      legal: root.querySelector('.ft-col[data-col="legal"] .ft-title')
    };
    Object.entries(mapTitles).forEach(([key, el])=>{ if(el) el.textContent = d.titles[key]; });

    // tagline
    const tag = root.querySelector('.ft-brand .ft-tag');
    if(tag) tag.textContent = d.tagline;

    // links
    root.querySelectorAll('[data-k]').forEach(a=>{
      const k=a.getAttribute('data-k');
      const txt=d.links[k]; if(txt) a.textContent=txt;
    });

    // línea inferior
    const copy = root.querySelector('.ft-copy');
    if(copy){
      copy.textContent = d.bottom.replace('{year}', new Date().getFullYear());
    }
  }

  function highlightFlag(lang) {
    $$(".lang-switch .lang-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );
  }

  function applyAll() {
    const lang = getLang();
    document.documentElement.setAttribute("lang", lang);
    trMeta(lang);
    trNav(lang);
    trHero(lang);
    trAbout(lang);
    trSolutions(lang);
    renderChanges(lang);
    trFAQ(lang);
    trKPIs(lang);
    renderFooterI18N(lang);
    highlightFlag(lang);
  }

  // === Flags click (bind directo, sin delegado global) ===
  function bindFlagClicks() {
    document.querySelectorAll(".lang-switch .lang-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLang(btn.dataset.lang);
      });
    });
  }

  // Init
  document.addEventListener("rynko:setlang", applyAll);
  document.addEventListener("DOMContentLoaded", () => {
    bindFlagClicks();
    applyAll();
  });
