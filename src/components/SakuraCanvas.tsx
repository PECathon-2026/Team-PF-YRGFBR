import React, { useEffect, useRef, useState } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angleSpeed: number;
  opacity: number;
  flipSpeed: number;
  flip: number;
  color: string;
}

export const SakuraCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (!isActive) return;
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

    const petalColors = [
      'rgba(244, 180, 196, 0.55)', // Soft cherry blossom pink
      'rgba(235, 140, 160, 0.45)', // Richer sakura
      'rgba(255, 220, 225, 0.5)',  // Pale petal
      'rgba(212, 175, 55, 0.35)',  // Faint gold leaf speck
    ];

    const petalCount = Math.min(32, Math.floor(width / 45));
    const petals: Petal[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 7 + 6,
        speedY: Math.random() * 0.9 + 0.4,
        speedX: Math.random() * 0.7 - 0.2,
        angle: Math.random() * 360,
        angleSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.4 + 0.3,
        flipSpeed: Math.random() * 0.03 + 0.01,
        flip: Math.random() * Math.PI,
        color: petalColors[Math.floor(Math.random() * petalColors.length)]
      });
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(Math.cos(p.flip), 1);

      ctx.beginPath();
      // Draw organic sakura petal shape
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, -p.size / 4, p.size, p.size / 2);
      ctx.bezierCurveTo(p.size, p.size, p.size / 3, p.size * 1.2, 0, p.size * 1.4);
      ctx.bezierCurveTo(-p.size / 3, p.size * 1.2, -p.size, p.size, -p.size, p.size / 2);
      ctx.bezierCurveTo(-p.size, -p.size / 4, -p.size / 2, -p.size / 2, 0, 0);

      ctx.fillStyle = p.color;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.15)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.005) * 0.3;
        p.angle += p.angleSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        drawPetal(p);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isActive]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 opacity-70"
      />
      {/* Discreet toggle for users who prefer static background */}
      <button
        onClick={() => setIsActive((prev) => !prev)}
        title={isActive ? "Pause Sakura Drift" : "Resume Sakura Drift"}
        className="fixed bottom-3 right-3 z-30 text-[11px] font-mono-tech px-2 py-1 rounded bg-black/60 hover:bg-black/90 text-slate-400 hover:text-amber-300 border border-amber-900/40 backdrop-blur transition-colors"
      >
        🌸 {isActive ? 'Sakura: Active' : 'Sakura: Paused'}
      </button>
    </>
  );
};
