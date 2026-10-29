import confetti from 'canvas-confetti';

/**
 * Hiệu ứng Bùng nổ Pháo hoa & Cánh hoa Hồ Ly (Kitsune Celebration Explosion)
 * Dành cho khi người dùng thuộc từ vựng, đạt điểm cao khi nói hoặc hoàn thành bài ôn tập.
 */
export function triggerConfettiCelebration() {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Bùng nổ đa tầng với các tông màu Anime Cyber-Shrine: Hồng Sakura, Vàng Thần đạo, Xanh Ngọc Cyber, Trắng Hồ Ly
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#f43f5e', '#fbbf24', '#ffffff', '#2dd4bf'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#e11d48', '#f59e0b', '#38bdf8', '#fb7185'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 1.2,
    shapes: ['star', 'circle'],
    colors: ['#fbbf24', '#f43f5e', '#2dd4bf', '#a78bfa'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#ffffff', '#fb7185', '#2dd4bf'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#f43f5e', '#fbbf24'],
  });
}

/**
 * Hiệu ứng Bùng nổ tại vị trí click (Thẻ từ vựng hoặc Nút Đã thuộc)
 */
export function triggerWordMasteredBurst(e?: React.MouseEvent) {
  if (typeof window === 'undefined') return;

  let x = 0.5;
  let y = 0.5;

  if (e && typeof window !== 'undefined') {
    x = e.clientX / window.innerWidth;
    y = e.clientY / window.innerHeight;
  }

  confetti({
    particleCount: 50,
    spread: 70,
    origin: { x, y },
    colors: ['#4ade80', '#2dd4bf', '#fbbf24', '#f43f5e'],
    shapes: ['star', 'circle'],
    zIndex: 9999,
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });
}

/**
 * Mưa cánh hoa Sakura & Bụi sao Thần Kính
 */
export function triggerSakuraShower() {
  if (typeof window === 'undefined') return;

  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2', '#fbbf24'];

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 25 * (timeLeft / duration);

    confetti({
      particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      zIndex: 9999,
      scalar: 1.2,
    });
    confetti({
      particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      zIndex: 9999,
      scalar: 1.2,
    });
  }, 250);
}
