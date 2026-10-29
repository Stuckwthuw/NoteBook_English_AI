'use client';

import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  flip: number;
  flipSpeed: number;
}

export function SakuraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Tôn trọng prefers-reduced-motion
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Tạo 22 cánh hoa anh đào nhẹ nhàng
    const petalCount = Math.min(22, Math.floor(width / 50));
    const petals: Petal[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 7,
        speedX: Math.random() * 0.8 - 0.2,
        speedY: Math.random() * 0.9 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.02 - 0.01,
        opacity: Math.random() * 0.4 + 0.35,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // Vẽ 1 cánh hoa anh đào hình giọt nước cong
    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), 1);
      ctx.beginPath();

      // Hình dáng cánh hoa anh đào truyền thống Nhật Bản
      const s = p.size;
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.6, -s * 0.8, s * 0.8, s * 0.2, 0, s);
      ctx.bezierCurveTo(-s * 0.8, s * 0.2, -s * 0.6, -s * 0.8, 0, -s);

      // Gradient màu hồng phấn pha ánh vàng nhẹ
      const grad = ctx.createLinearGradient(-s / 2, -s, s / 2, s);
      grad.addColorStop(0, `rgba(255, 225, 235, ${p.opacity * 0.9})`);
      grad.addColorStop(0.5, `rgba(244, 114, 182, ${p.opacity})`);
      grad.addColorStop(1, `rgba(244, 63, 94, ${p.opacity * 0.7})`);

      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(244, 114, 182, 0.4)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    };

    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (isTabVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          p.x += p.speedX + Math.sin(p.y * 0.005) * 0.4;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;
          p.flip += p.flipSpeed;

          // Vòng lặp khi rơi qua đáy màn hình
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          drawPetal(p);
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1, // Nằm trên background nhưng dưới content (z-index 2+)
        opacity: 0.75,
      }}
    />
  );
}
