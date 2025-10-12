// ===== Minimal stars + parallax =================================================
const CFG = { DENSITY_DIV: 30000, R_MIN: .4, R_ADD: .6, ALPHA_MIN: .35, ALPHA_ADD: .25,
  SHADOW_BLUR: 4, PARALLAX: 18, TRANSLATE: 18, TW_SPEED_MIN: .2, TW_SPEED_ADD: .2,
  DRIFT_X: .08, DRIFT_Y: .04 };

document.getElementById('year').textContent = new Date().getFullYear();

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
   Rynko i18n + Flags + “Changes” (único módulo, idempotente)
   ========================================================= */
(function(){
  if (window.__rynko_i18n_unico) return; window.__rynko_i18n_unico = true;

  // ---- Diccionario ----
  const TEXT = {
    es:{
      solutions:{ title:'Soluciones',
        sub:'Descubrí cómo conectamos tus herramientas con n8n + IA para ganar velocidad y control.',
        cards:[
          {h:'Automatización operativa', p:'Flujos n8n entre CRM, correo, WhatsApp, Sheets, ERP. Reportes y alertas.'},
          {h:'IA aplicada', p:'Asistentes y chatbots con contexto propio; clasificación y generación de respuestas.'},
          {h:'Integraciones a medida', p:'APIs, webhooks y conectores custom con monitoreo y versionado.'},
          {h:'Data & reporting', p:'Dashboards y resúmenes automáticos con métricas clave enviadas a tu equipo.'},
          {h:'Onboarding & training', p:'Documentación, handoff y capacitaciones para equipos comerciales y operaciones.'},
          {h:'Soporte y mantenimiento', p:'Monitoreo, alertas y mejoras continuas para asegurar disponibilidad y calidad.'}
        ]},
      faq:{ title:'Resuelve tus preguntas', sub:'Tenés preguntas. Tenemos respuestas.',
        qa:[
          {q:'¿Por qué usar Rynko?', a:'Conectamos tu stack con n8n + IA para automatizar trabajo repetitivo, reducir errores y escalar la operación.'},
          {q:'¿Qué sistemas soportan?', a:'HubSpot, Pipedrive, Gmail, Slack, WhatsApp API/Cloud, Google Sheets, Notion, Shopify, Stripe, webhooks y más.'},
          {q:'¿En cuánto tiempo veo resultados?', a:'Primer flujo en 7–10 días. Impacto medible hacia el día 30.'},
          {q:'¿Seguridad y datos?', a:'Credenciales de mínimo privilegio, vaults, flujos versionados, monitoreo y alertas. Tus datos quedan en tus sistemas.'},
          {q:'¿Modelo de trabajo y precios?', a:'Proyecto, retainer o híbrido. Reservá una llamada y cotizamos para tu caso.'},
          {q:'¿Quién es dueño de los flows y prompts?', a:'Vos. Entregamos repo, documentación y accesos.'}
        ]},
      changes:{
        title:'Qué cambia en tu día a día',
        intro:'Pasamos de procesos manuales y dispersos a flujos automatizados, medibles y monitoreados:',
        items:[
          'Asignación de tickets: de manual a automática (reglas + IA).',
          'Reportes: de semanales a diarios 08:00 con insights.',
          'Captura y seguimiento: unificados en CRM con follow-up.',
          'Respuestas: de copiar/pegar a draft con IA + validación.',
          'Errores: de descubiertos tarde a alertas en tiempo real.',
          'Integraciones: de ad-hoc a flujos versionados y monitoreados.'
        ]
      }
    },
    en:{
      solutions:{ title:'Solutions',
        sub:'See how we connect your tools with n8n + AI to gain speed and control.',
        cards:[
          {h:'Operational automation', p:'n8n flows across CRM, email, WhatsApp, Sheets, ERP. Reports and alerts.'},
          {h:'Applied AI', p:'Assistants & chatbots with your context; classification and answer generation.'},
          {h:'Custom integrations', p:'APIs, webhooks & custom connectors with monitoring and versioning.'},
          {h:'Data & reporting', p:'Dashboards and summaries with key metrics sent to your team.'},
          {h:'Onboarding & training', p:'Docs, handoff and training for sales and operations teams.'},
          {h:'Support & maintenance', p:'Monitoring, alerts and continuous improvements for availability and quality.'}
        ]},
      faq:{ title:'Answer your questions', sub:'You’ve got questions. We’ve got answers',
        qa:[
          {q:'Why you should use Rynko?', a:'We connect your stack with n8n + AI to automate repetitive work, reduce errors and scale ops.'},
          {q:'Which systems do you support?', a:'HubSpot, Pipedrive, Gmail, Slack, WhatsApp API/Cloud, Google Sheets, Notion, Shopify, Stripe, webhooks & more.'},
          {q:'How long until results?', a:'First flow in 7–10 days. Measurable impact by day 30.'},
          {q:'Security & data?', a:'Least-privilege creds, secret vaults, versioned flows, monitoring & alerts. Your data stays in your systems.'},
          {q:'Engagement model & pricing?', a:'Project, retainer or hybrid. Book a call and we’ll tailor a quote to your case.'},
          {q:'Who owns flows and prompts?', a:'You do. We hand over repo, docs and access.'}
        ]},
      changes:{
        title:'What changes in your day-to-day',
        intro:'We move from manual, scattered work to automated, measurable, monitored flows:',
        items:[
          'Ticket assignment: manual → automatic (rules + AI).',
          'Reporting: weekly → daily 08:00 with insights.',
          'Capture & follow-up: unified in CRM.',
          'Replies: copy/paste → AI draft + validation.',
          'Errors: found late → real-time alerts.',
          'Integrations: ad-hoc → versioned & monitored flows.'
        ]
      }
    }
  };

  // ---- Helpers ----
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const setText = (el, t)=>{ if(el) el.textContent = t; };

  function getLang(){
    const l = (localStorage.getItem('lang') || document.documentElement.lang || 'es').toLowerCase();
    return (l==='en' || l==='es') ? l : 'es';
  }
  function setLang(l){
    const lang = (l==='en'?'en':'es');
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.dispatchEvent(new CustomEvent('rynko:setlang', { detail: lang }));
  }

  // ---- Traducciones ----
  function trSolutions(lang){
    const d = TEXT[lang].solutions;
    const sec = $('.strip.solutions'); if(!sec) return;
    setText($('h2', sec), d.title);
    setText($('.sub', sec), d.sub);
    $$('.cards.six article', sec).forEach((card,i)=>{
      const meta = d.cards[i]; if(!meta) return;
      setText($('h3', card), meta.h);
      setText($('p', card),  meta.p);
    });
  }
  function trFAQ(lang){
    const d = TEXT[lang].faq;
    const root = $('#faq, .strip.faq'); if(!root) return;
    const title = $('.section-title, .faq-title', root);
    const sub   = $('.section-sub, .faq-sub', root);
    setText(title, d.title);
    setText(sub,   d.sub);
    const items = $$('.fqi', root);
    d.qa.forEach((qa,i)=>{
      const di = items[i]; if(!di) return;
      const sum = $('summary', di);
      const chev = sum ? $('.chev', sum) : null;
      if(sum){ sum.innerHTML = ''; sum.append(document.createTextNode(qa.q)); if(chev) sum.appendChild(chev); }
      const ans = $('.ans', di) || $('div', di);
      if(ans) setText(ans, qa.a);
    });
  }
  function renderChanges(lang){
    const d = TEXT[lang].changes;
    const about = $('#about .wrap, section.about .wrap'); if(!about) return;

    // 1) Eliminar TODAS las variantes viejas globales
    document.querySelectorAll('#cambios, .deltas.section, .deltas-grid, .deltas-list')
      .forEach(n => n.remove());

    // 2) Crear / actualizar bloque minimal único
    let blk = about.querySelector('.changes-text');
    if(!blk){
      blk = document.createElement('div'); blk.className = 'changes-text';
      const anchor = about.querySelector('.pill-list') || about.lastElementChild;
      (anchor && anchor.parentNode) ? anchor.parentNode.insertBefore(blk, anchor.nextSibling)
                                    : about.appendChild(blk);
    }
    blk.innerHTML = '';

    const h = document.createElement('h3'); h.className = 'changes-title'; h.textContent = d.title;
    const p = document.createElement('p'); p.className = 'changes-intro'; p.textContent = d.intro;
    const ul = document.createElement('ul'); ul.className = 'changes-points';
    d.items.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });

    blk.append(h,p,ul);
  }

  function applyAll(){
    const lang = getLang();
    trSolutions(lang);
    trFAQ(lang);
    renderChanges(lang);
    // activar visualmente la bandera
    $$('.lang-switch .lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang===lang));
  }

  // ---- Flags en navbar ----
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('nav .lang-switch .lang-btn'); if(!btn) return;
    e.preventDefault(); e.stopPropagation();
    setLang(btn.dataset.lang);
  });

  // Reaccionar a cambios
  document.addEventListener('rynko:setlang', applyAll);

  // Init
  document.addEventListener('DOMContentLoaded', applyAll);
  applyAll();
})();
