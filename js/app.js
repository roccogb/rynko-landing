// js/app.js — glow dots minimal

/* Año */
document.getElementById('year').textContent = new Date().getFullYear();

/* Parallax + glow dots */
const grid = document.getElementById('grid');
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d', { alpha: true });

let W, H, DPR;
const dots = [];
let mx=0,my=0, px=0, py=0;

function resize(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = canvas.width  = Math.floor(innerWidth  * DPR);
  H = canvas.height = Math.floor(innerHeight * DPR);
  canvas.style.width  = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';

  dots.length = 0;
  // cantidad proporcional al área; puntos más grandes y visibles
  const count = Math.floor((innerWidth * innerHeight) / 7000);
  for(let i=0;i<count;i++){
    const baseA = Math.random()*0.4 + 0.45;       // 0.45–0.85
    dots.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: (Math.random()*1.6 + 1.0) * DPR,        // radio 1–2.6 (visibles)
      baseA,
      phase: Math.random()*Math.PI*2,            // fase para pulso
      speedX: (Math.random()*0.15 + 0.05) * DPR, // deriva lenta
      speedY: (Math.random()*0.10 - 0.05) * DPR, // leve vertical
      tw: Math.random()*0.5 + 0.2                // velocidad de pulso
    });
  }
}
resize();
addEventListener('resize', resize, { passive:true });

// mouse
addEventListener('pointermove', e=>{
  mx = e.clientX/innerWidth - .5;
  my = e.clientY/innerHeight - .5;
},{ passive:true });

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick(){
  px += (mx - px)*0.08;
  py += (my - py)*0.08;

  if(!reduce){
    const gx = px*40, gy = py*40, rot = px*1.2, sc = 1 + py*0.01;
    grid.style.transform = 	ranslate3d(px,px,0) rotate(deg) scale();
  }

  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(!reduce) ctx.translate(-px*40*DPR, -py*40*DPR);

  // glow global
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10 * DPR;

  for(const d of dots){
    // drift con wrap
    d.x += d.speedX;
    d.y += d.speedY;
    if(d.x > W + 20) d.x = -20;
    if(d.x < -20)    d.x = W + 20;
    if(d.y > H + 20) d.y = -20;
    if(d.y < -20)    d.y = H + 20;

    // pulso suave (no parpadeo fuerte)
    d.phase += d.tw * 0.02;
    const pulse = 0.85 + 0.15*Math.sin(d.phase); // 0.85–1.0
    ctx.globalAlpha = d.baseA * pulse;

    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();
  requestAnimationFrame(tick);
}
tick();

// // Para full B/N en el título (sin azul):
// document.documentElement.style.setProperty('--accent', '#ffffff');
