:root{
  --bg:#0a0a0b; --panel:#111114; --text:#f2f2f3; --muted:#a8a8ad; --radius:14px;
  --accent:#b9c6ff; /* poné #ffffff si querés full B/N */
}
*{box-sizing:border-box} html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--text);font-family:Manrope,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;overflow-x:hidden}
.gridlayer{position:fixed;inset:0;z-index:-2;pointer-events:none;background:
  radial-gradient(transparent 0 70%, rgba(10,10,12,.65) 70%) center/200% 200% no-repeat,
  linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px) 0 0/80px 80px repeat,
  linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px) 0 0/80px 80px repeat;
transition:transform .08s linear;will-change:transform}
canvas.stars{position:fixed;inset:0;z-index:-1;pointer-events:none}
/* NAV */
.nav{width:min(1100px,92%);margin:20px auto 0;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);border-radius:var

@"
// js/app.js

// set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// ----- Parallax background (grid + stars) -----
const grid = document.getElementById('grid');
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d', { alpha: true });

let W, H, DPR;
const stars = [];
let mx = 0, my = 0;   // cursor target (-0.5..0.5)
let px = 0, py = 0;   // eased position

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = canvas.width  = Math.floor(innerWidth  * DPR);
  H = canvas.height = Math.floor(innerHeight * DPR);
  canvas.style.width  = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';

  stars.length = 0;
  const count = Math.floor((innerWidth * innerHeight) / 8000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: (Math.random() * 1.2 + 0.4) * DPR,
      a: Math.random() * 0.6 + 0.2,
      s: Math.random() * 0.3 + 0.05
    });
  }
}
resize();
addEventListener('resize', resize, { passive: true });

addEventListener('pointermove', (e) => {
  mx = e.clientX / innerWidth  - 0.5;
  my = e.clientY / innerHeight - 0.5;
}, { passive: true });

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick() {
  px += (mx - px) * 0.08;
  py += (my - py) * 0.08;

  if (!prefersReduced) {
    const gx = px * 40, gy = py * 40;
    grid.style.transform = 	ranslate3d(px, px, 0);
  }

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (!prefersReduced) ctx.translate(-px * 50 * DPR, -py * 50 * DPR);
  for (const s of stars) {
    s.x += s.s;
    if (s.x > W + 10) s.x = -10;
    ctx.globalAlpha = s.a;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
  ctx.restore();

  requestAnimationFrame(tick);
}
tick();

// Optional toggles:
// document.documentElement.style.setProperty('--accent', '#ffffff'); // full B/N
