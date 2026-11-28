// Falling leaves behind every page. Skipped when the visitor prefers reduced motion.
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none';
  document.body.prepend(c);
  const x = c.getContext('2d');
  let W, H, L = [];
  function resize() {
    W = c.width = innerWidth; H = c.height = innerHeight;
    L = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: 4 + Math.random() * 6,
      s: 0.3 + Math.random() * 0.8, a: Math.random() * 6.28
    }));
  }
  function draw() {
    x.clearRect(0, 0, W, H);
    for (const l of L) {
      l.y += l.s; l.a += 0.01; l.x += Math.sin(l.a) * 0.6;
      if (l.y > H) { l.y = -10; l.x = Math.random() * W; }
      x.beginPath();
      x.ellipse(l.x, l.y, l.r, l.r / 2.2, l.a, 0, 6.283);
      x.fillStyle = '#7ee04a55';
      x.fill();
    }
    requestAnimationFrame(draw);
  }
  addEventListener('resize', resize);
  resize();
  draw();
})();
