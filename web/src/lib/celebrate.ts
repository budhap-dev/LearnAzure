/**
 * A tiny confetti burst for passing a quiz or test. Pure canvas, no dependency, and it
 * respects prefers-reduced-motion by doing nothing.
 */
export function celebrate(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const colours = ['#0f6cbd', '#3ccbf4', '#ffb900', '#7fba00', '#f25022', '#b4a0ff', '#ff6bcb'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 16 - 6,
    size: 6 + Math.random() * 6,
    colour: colours[Math.floor(Math.random() * colours.length)],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
  }));

  const start = performance.now();
  function frame(now: number) {
    const t = (now - start) / 1000;
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.fillStyle = p.colour;
      ctx!.globalAlpha = Math.max(0, 1 - t / 2.4);
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }
    if (t < 2.5) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
