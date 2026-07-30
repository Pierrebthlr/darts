interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  decay: number;
  rot: number;
  vr: number;
}

let particles: Particle[] = [];
let running = false;
let canvasEl: HTMLCanvasElement | null = null;

export function setCanvas(el: HTMLCanvasElement) {
  canvasEl = el;
  resizeCanvas();
}

export function resizeCanvas() {
  if (!canvasEl) return;
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}

export function burstConfetti(x: number | undefined, y: number | undefined, power: number) {
  if (!canvasEl || x == null || y == null) return;
  const colors = ['#fbbf24', '#f59e0b', '#fde68a', '#f87171', '#fff'];
  const count = Math.round(18 * power);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5 * power;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 3 + Math.random() * 4,
      color: colors[(Math.random() * colors.length) | 0],
      life: 1,
      decay: 0.012 + Math.random() * 0.012,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 20
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}

function tick() {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d')!;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  particles = particles.filter((p) => {
    p.vy += 0.18;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    p.rot += p.vr;
    if (p.life <= 0) return false;
    ctx.save();
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
    return true;
  });
  if (particles.length) requestAnimationFrame(tick);
  else {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    running = false;
  }
}

export function screenShake(ms?: number) {
  document.body.classList.remove('shake');
  void document.body.offsetWidth;
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), ms || 400);
}
