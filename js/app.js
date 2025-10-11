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

// ===== i18n (navbar + hero + secciones) (idempotente) ==========================
(function(){
  if(window.__i18n_v1) return; window.__i18n_v1 = true;

  const STR = {
    es:{
      nav:{ faq:'FAQ', about:'Nosotros', contact:'Contacto', book:'Reservar reunión' },
      hero:{ sub:'Automatizamos procesos con n8n + IA para ahorrar tiempo, reducir errores y escalar tu operación. Integraciones limpias, resultados medibles y mantenimiento sencillo.' },
      deltas:{ title:'Qué cambia en tu día a día', intro:'Comparativo simple de tu operación antes y después.' },
      kpi:['% menos tareas manuales','% más velocidad de respuesta','% procesos monitoreados','/7 alertas y reportes']
    },
    en:{
      nav:{ faq:'FAQ', about:'About', contact:'Contact', book:'Book meeting' },
      hero:{ sub:'We automate processes with n8n + AI to save time, reduce errors, and scale your operations. Clean integrations, measurable results, simple maintenance.' },
      deltas:{ title:'What changes in your day-to-day', intro:'Simple before/after comparison of your operation.' },
      kpi:['% fewer manual tasks','% faster response time','% processes monitored','/7 alerts and reports']
    }
  };

  function setText(el,txt){ if(el) el.textContent=txt; }
  function qsa(s){ return [...document.querySelectorAll(s)]; }

  function apply(lang){
    document.documentElement.setAttribute('lang',lang);
    localStorage.setItem('lang',lang);

    // Navbar
    qsa('nav a').forEach(a=>{
      const t=a.textContent.trim().toLowerCase();
      if(/faq/.test(t)) setText(a, STR[lang].nav.faq);
      else if(/nosotros|about/.test(t)) setText(a, STR[lang].nav.about);
      else if(/contacto|contact/.test(t)) setText(a, STR[lang].nav.contact);
      else if(/reservar|book/.test(t)) setText(a, STR[lang].nav.book);
    });

    // Hero sub
    const sub = document.querySelector('.hero-sub'); if(sub) setText(sub, STR[lang].hero.sub);
    // Botones "reservar"
    qsa('a.btn,button').forEach(b=>{
      const t=b.textContent.trim().toLowerCase();
      if(/reservar reuni|book meeting/.test(t)) setText(b, STR[lang].nav.book);
    });

    // Deltas título + intro
    const dTitle = qsa('h2.section-title').find(h=>/qué cambia|what changes/i.test(h.textContent));
    const dIntro = qsa('.section-intro').find(p=>/comparativo simple|before\/after/i.test(p.textContent));
    if(dTitle) setText(dTitle, STR[lang].deltas.title);
    if(dIntro) setText(dIntro, STR[lang].deltas.intro);

    // Etiquetas KPIs (About)
    const labels = qsa('.about .kpis.small small, .about .kpis.mini small');
    labels.slice(0,4).forEach((sm,i)=> sm.textContent = STR[lang].kpi[i] || sm.textContent);

    // UI estado
    qsa('.lang-btn').forEach(b=> b.classList.toggle('active', b.dataset.lang===lang));
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest('.lang-btn'); if(!btn) return;
    apply(btn.dataset.lang==='en'?'en':'es');
  });

  apply(localStorage.getItem('lang')||'es');
})();
/* === i18n: Solutions (EN) + FAQ (ES) � non-invasive addon === */
(function(){
  if (window.__rynko_i18n_solutions_faq) return; window.__rynko_i18n_solutions_faq = true;

  const MAP = {
    en: {
      solutions: {
        title: "Solutions",
        sub: "Discover how we connect your tools with n8n + AI to gain speed and control.",
        cards: [
          {h:"Operational automation", p:"n8n flows across CRM, email, WhatsApp, Sheets, ERP. Reports & alerts."},
          {h:"Applied AI", p:"Assistants and chatbots with private context; classification and generated replies."},
          {h:"Custom integrations", p:"APIs, webhooks and custom connectors with monitoring and versioning."},
          {h:"Data & reporting", p:"Dashboards and automatic summaries with key metrics sent to your team."},
          {h:"Onboarding & training", p:"Documentation, handoff and training for sales and operations teams."},
          {h:"Support & maintenance", p:"Monitoring, alerts and continuous improvements to ensure availability and quality."}
        ]
      }
    },
    es: {
      faq: {
        title: "Resuelve tus preguntas",
        sub: "Ten�s preguntas. Tenemos respuestas.",
        qa: [
          {
            q: "�Por qu� usar Rynko?",
            a: "Conectamos tu stack con n8n + IA para automatizar trabajo repetitivo, reducir errores y escalar la operaci�n."
          },
          {
            q: "�Qu� sistemas soportan?",
            a: "HubSpot, Pipedrive, Gmail, Slack, WhatsApp API/Cloud, Google Sheets, Notion, Shopify, Stripe, webhooks y m�s."
          },
          {
            q: "�En cu�nto tiempo veo resultados?",
            a: "Primer flujo en 7�10 d�as. Impacto medible para el d�a 30."
          },
          {
            q: "�Seguridad y datos?",
            a: "Credenciales de m�nimo privilegio, cofres de secretos, flujos versionados, monitoreo y alertas. Tus datos quedan en tus sistemas."
          },
          {
            q: "�Modelo de trabajo y precios?",
            a: "Proyecto, retainer o h�brido. Reserv� una llamada y armamos una propuesta a tu medida."
          },
          {
            q: "�Qui�n es due�o de los flujos y prompts?",
            a: "Vos. Entregamos repo, documentaci�n y accesos."
          }
        ]
      }
    }
  };

  function translateSolutions(lang){
    // S�lo si existe la secci�n
    const sec = document.querySelector('.strip.solutions');
    if(!sec) return;
    if(lang!=='en') return; // las copias en ES ya est�n en tu HTML

    const h2 = sec.querySelector('h2');
    const sub = sec.querySelector('.sub');
    const cards = Array.from(sec.querySelectorAll('.cards.six article'));

    const data = MAP.en.solutions;
    if(h2) h2.textContent = data.title;
    if(sub) sub.textContent = data.sub;

    cards.forEach((card, i)=>{
      const h = card.querySelector('h3');
      const p = card.querySelector('p');
      const item = data.cards[i];
      if(!item) return;
      if(h) h.textContent = item.h;
      if(p) p.textContent = item.p;
    });
  }

  function translateFAQ(lang){
    const root = document.querySelector('#faq') || document.querySelector('.strip.faq');
    if(!root) return;

    // T�tulos
    const title = root.querySelector('.section-title') || root.querySelector('h2');
    const sub = root.querySelector('.section-sub') || root.querySelector('.faq .section-sub');

    if(lang === 'es'){
      const d = MAP.es.faq;
      if(title) title.textContent = d.title;
      if(sub)   sub.textContent = d.sub;

      // Q/A -> detalles en el orden actual
      const details = Array.from(root.querySelectorAll('.fqi'));
      d.qa.forEach((qa, i)=>{
        const di = details[i];
        if(!di) return;
        const sum = di.querySelector('summary');
        const chev = sum ? sum.querySelector('.chev') : null;
        if(sum){
          // reconstruimos el contenido del summary preservando la flecha
          sum.innerHTML = qa.q + (chev ? ' <span class="chev"></span>' : '');
        }
        const ans = di.querySelector('.ans');
        if(ans) ans.textContent = qa.a;
      });
    } else {
      // si cambi�s a EN, restauramos texto original del HTML (lo ten�s en ingl�s),
      // por eso no traducimos FAQ a EN aqu�.
    }
  }

  function apply(lang){
    translateSolutions(lang);
    translateFAQ(lang);
  }

  document.addEventListener('rynko:setlang', e => apply(e.detail || 'es'));
  document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem('lang') || document.documentElement.lang || 'es';
    apply(lang);
  });
})();
