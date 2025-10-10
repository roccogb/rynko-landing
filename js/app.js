// js/app.js (enhanced)

/* Año */
document.getElementById('year').textContent = new Date().getFullYear();

/* Parallax + estrellas */
const grid = document.getElementById('grid');
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d', { alpha: true });

let W, H, DPR;
const stars = [];
let mx=0,my=0, px=0, py=0;

function resize(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = canvas.width  = Math.floor(innerWidth  * DPR);
  H = canvas.height = Math.floor(innerHeight * DPR);
  canvas.style.width  = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';

  stars.length = 0;
  const count = Math.floor((innerWidth * innerHeight) / 5000); // MAS estrellas
  for(let i=0;i<count;i++){
    const baseA = Math.random()*0.5 + 0.35;   // MAS brillo base
    stars.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: (Math.random()*1.6 + 0.6) * DPR,    // MAS tamaño
      baseA,
      phase: Math.random() * Math.PI * 2,
      twSpeed: Math.random()*0.8 + 0.2,      // vel titileo
      drift: Math.random()*0.4 + 0.08        // desplazamiento lateral
    });
  }
}
resize();
addEventListener('resize', resize, { passive:true });

// mouse
addEventListener('pointermove', e=>{
  mx = e.clientX/innerWidth - .5;
  my = e.clientY/innerHeight - .5;
}, { passive:true });

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick(){
  px += (mx - px)*0.08;
  py += (my - py)*0.08;

  if(!reduce){
    const gx = px*40, gy = py*40, rot = px*1.5, sc = 1 + py*0.01;
    grid.style.transform = 	ranslate3d(px,px,0) rotate(deg) scale();
  }

  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(!reduce) ctx.translate(-px*50*DPR, -py*50*DPR);

  for(const s of stars){
    // drift horizontal
    s.x += s.drift;
    if(s.x > W + 10) s.x = -10;

    // twinkle
    s.phase += s.twSpeed * 0.03;
    const tw = 0.5 + 0.5 * Math.sin(s.phase);     // 0..1
    const alpha = s.baseA * (0.65 + 0.35*tw);     // oscila 65%..100%
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
  ctx.restore();

  requestAnimationFrame(tick);
}
tick();

// // Full B/N sin azul del título:
// document.documentElement.style.setProperty('--accent', '#ffffff');
