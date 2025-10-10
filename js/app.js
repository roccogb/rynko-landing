// js/app.js (enhanced)

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Parallax background (grid + twinkling stars) */
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

  // rebuild stars
  stars.length = 0;
  const count = Math.floor((innerWidth * innerHeight) / 8000);
  for (let i = 0; i < count; i++) {
    const baseA = Math.random() * 0.6 + 0.2;
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: (Math.random() * 1.2 + 0.4) * DPR, // radius
      a: baseA,                              // base alpha
      baseA,
      s: Math.random() * 0.3 + 0.05,         // drift speed
      t: Math.random() * Math.PI * 2,        // twinkle phase
      tw: Math.random() * 0.5 + 0.15         // twinkle speed
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
  // ease cursor for smoothness (inercia)
  px += (mx - px) * 0.08;
  py += (my - py) * 0.08;

  if (!prefersReduced) {
    const gx = px * 40, gy = py * 40;
    const rot = px * 1.5;           // rotación mínima
    const sc  = 1 + py * 0.01;      // scale sutil
    grid.style.transform = \	ranslate3d(\px,\px,0) rotate(\deg) scale(\)\;
  }

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (!prefersReduced) ctx.translate(-px * 50 * DPR, -py * 50 * DPR);

  for (const s of stars) {
    // gentle drift + wrap
    s.x += s.s;
    if (s.x > W + 10) s.x = -10;

    // twinkle (alpha oscilante)
    s.t += s.tw * 0.02;
    const twinkle = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(s.t));
    const alpha = s.baseA * twinkle;

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
  ctx.restore();

  requestAnimationFrame(tick);
}
tick();

// Optional: 100% B/N (sin azul)
// document.documentElement.style.setProperty('--accent', '#ffffff');
