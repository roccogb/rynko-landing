// js/app.js — glow dots minimal (fix backticks)

/* Año */
document.getElementById("year").textContent = new Date().getFullYear();

/* Parallax + glow dots */
const grid = document.getElementById("grid");
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d", { alpha: true });

let W, H, DPR;
const dots = [];
let mx = 0, my = 0, px = 0, py = 0;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = (canvas.width = Math.floor(innerWidth * DPR));
  H = (canvas.height = Math.floor(innerHeight * DPR));
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  dots.length = 0;
  const count = Math.floor((innerWidth * innerHeight) / 7000); // densidad
  for (let i = 0; i < count; i++) {
    const baseA = Math.random() * 0.4 + 0.45; // 0.45–0.85
    dots.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: (Math.random() * 1.6 + 1.0) * DPR,   // 1–2.6 visibilidad
      baseA,
      phase: Math.random() * Math.PI * 2,     // fase pulso
      speedX: (Math.random() * 0.15 + 0.05) * DPR,
      speedY: (Math.random() * 0.10 - 0.05) * DPR,
      tw: Math.random() * 0.5 + 0.2            // velocidad pulso
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
    const gx = px * 40, gy = py * 40, rot = px * 1.2, sc = 1 + py * 0.01;
    grid.style.transform = `translate3d(${gx}px, ${gy}px, 0) rotate(${rot}deg) scale(${sc})`;
  }

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (!reduce) ctx.translate(-px * 40 * DPR, -py * 40 * DPR);

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 10 * DPR;

  for (const d of dots) {
    d.x += d.speedX;
    d.y += d.speedY;
    if (d.x > W + 20) d.x = -20;
    if (d.x < -20)    d.x = W + 20;
    if (d.y > H + 20) d.y = -20;
    if (d.y < -20)    d.y = H + 20;

    d.phase += d.tw * 0.02;
    const pulse = 0.85 + 0.15 * Math.sin(d.phase); // 0.85–1.0
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
