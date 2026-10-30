import React, { useEffect, useRef, useState } from 'react';
import { celestialAudio } from '../utils/audio';

interface GalaxyPortalProps {
  onEnter: () => void;
}

interface WindStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  curve: number;
  opacity: number;
  width: number;
}

interface DriftingPetal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  angle: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
}

interface CloudLayer {
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  opacity: number;
  scale: number;
}

export const GalaxyPortal: React.FC<GalaxyPortalProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [isHoveringMoon, setIsHoveringMoon] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Cloud and wind simulation on canvas overlay
  useEffect(() => {
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

    // Wind gusts
    const windStreaks: WindStreak[] = [];
    for (let i = 0; i < 24; i++) {
      windStreaks.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.75),
        length: Math.random() * 120 + 80,
        speed: Math.random() * 4 + 3.5,
        curve: (Math.random() - 0.5) * 15,
        opacity: Math.random() * 0.35 + 0.15,
        width: Math.random() * 1.5 + 0.8
      });
    }

    // Drifting cherry blossom petals carried by the mountain wind
    const petals: DriftingPetal[] = [];
    for (let i = 0; i < 35; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 5,
        speedX: Math.random() * 2.8 + 2.0, // swept across to the right
        speedY: Math.random() * 0.8 + 0.2,
        angle: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.04 + 0.02,
        opacity: Math.random() * 0.5 + 0.4
      });
    }

    // Moving translucent clouds
    const clouds: CloudLayer[] = [
      { x: 0, y: height * 0.12, speed: 0.25, width: 600, height: 180, opacity: 0.18, scale: 1 },
      { x: width * 0.4, y: height * 0.08, speed: 0.18, width: 750, height: 210, opacity: 0.15, scale: 1.2 },
      { x: width * 0.75, y: height * 0.22, speed: 0.32, width: 500, height: 140, opacity: 0.22, scale: 0.9 },
      { x: -width * 0.3, y: height * 0.18, speed: 0.28, width: 680, height: 190, opacity: 0.16, scale: 1.1 },
    ];

    // Lake water shimmer sparkles
    const sparkles: { x: number; y: number; phase: number; speed: number }[] = [];
    for (let i = 0; i < 40; i++) {
      sparkles.push({
        x: width * 0.1 + Math.random() * (width * 0.8),
        y: height * 0.7 + Math.random() * (height * 0.25),
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.05 + 0.02
      });
    }

    const drawCloudPuff = (c: CloudLayer) => {
      ctx.save();
      ctx.fillStyle = `rgba(224, 242, 254, ${c.opacity})`;
      ctx.filter = 'blur(28px)';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, (c.width / 2) * c.scale, (c.height / 2) * c.scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Secondary puff
      ctx.fillStyle = `rgba(253, 242, 248, ${c.opacity * 0.8})`;
      ctx.beginPath();
      ctx.ellipse(c.x + 80, c.y - 20, (c.width * 0.35) * c.scale, (c.height * 0.4) * c.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render moving clouds across the mountain sky
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x - c.width / 2 > width + 100) {
          c.x = -c.width;
          c.y = Math.random() * (height * 0.35);
        }
        drawCloudPuff(c);
      });

      // 2. Render wind streaks (whispering mountain wind)
      ctx.save();
      windStreaks.forEach((w) => {
        w.x += w.speed;
        if (w.x > width + 100) {
          w.x = -w.length;
          w.y = Math.random() * (height * 0.75);
        }

        ctx.strokeStyle = `rgba(224, 231, 255, ${w.opacity})`;
        ctx.lineWidth = w.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(w.x, w.y);
        ctx.quadraticCurveTo(
          w.x + w.length * 0.5,
          w.y + w.curve,
          w.x + w.length,
          w.y
        );
        ctx.stroke();
      });
      ctx.restore();

      // 3. Render wind-blown cherry blossom sakura petals
      petals.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY + Math.sin(p.x * 0.01) * 0.5;
        p.angle += p.rotSpeed;
        p.flip += p.flipSpeed;

        if (p.x > width + 30) {
          p.x = -30;
          p.y = Math.random() * height;
        }
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(Math.cos(p.flip), 1);

        ctx.fillStyle = `rgba(254, 205, 211, ${p.opacity})`;
        ctx.shadowColor = 'rgba(244, 114, 182, 0.4)';
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, -p.size / 4, p.size, p.size / 2);
        ctx.bezierCurveTo(p.size, p.size, p.size / 3, p.size * 1.2, 0, p.size * 1.4);
        ctx.bezierCurveTo(-p.size / 3, p.size * 1.2, -p.size, p.size, -p.size, p.size / 2);
        ctx.bezierCurveTo(-p.size, -p.size / 4, -p.size / 2, -p.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();
      });

      // 4. Lake water moonlight sparkles
      ctx.save();
      sparkles.forEach((s) => {
        s.phase += s.speed;
        const sparkOpacity = (Math.sin(s.phase) + 1) * 0.5 * 0.7;
        if (sparkOpacity > 0.1) {
          ctx.fillStyle = `rgba(186, 230, 253, ${sparkOpacity})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 6;
          ctx.fill();
        }
      });
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleMoonClick = () => {
    if (isWarping) return;
    setIsWarping(true);
    setHasInteracted(true);
    celestialAudio.playKatanaSlash();
    celestialAudio.playZenChime();

    // Smooth cosmic flash transition into the main console
    setTimeout(() => {
      onEnter();
    }, 900);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#070b14] overflow-hidden select-none transition-all duration-1000 ${
        isWarping ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Container maintaining the scenic image aspect ratio and full screen presence */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* The Base Samurai & Mount Fuji Artwork */}
        <img
          src="/assets/aistudio/Screenshot_30-10-2026_11125_www.bing.com_5947cd77.jpeg"
          alt="Samurai gazing at the celestial full moon over Mount Fuji and serene lake"
          className="w-full h-full object-cover object-center filter brightness-105 contrast-105 pointer-events-none"
        />

        {/* Ambient Japanese dark vignette for enhanced depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Dynamic Canvas: Moving Clouds, Winds, and Drifting Sakura Petals */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* 
          The Moon Button (Precisely Positioned over the Moon in the Artwork)
          Coordinates calibrated from image:
          - Horizontal: 49.2% from left
          - Vertical: 20.6% from top
          - Diameter: scales with viewport (approx 14vw, clamped for mobile & desktop)
        */}
        <div
          style={{
            top: '20.6%',
            left: '49.2%',
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute z-30 flex items-center justify-center"
        >
          {/* Animated Pulsing Concentric White Outline Rings */}
          <div className="absolute w-[18vw] h-[18vw] min-w-[130px] min-h-[130px] max-w-[210px] max-h-[210px] rounded-full border-2 border-white/30 animate-ping opacity-40 pointer-events-none" />
          <div className="absolute w-[16vw] h-[16vw] min-w-[115px] min-h-[115px] max-w-[185px] max-h-[185px] rounded-full border border-white/60 animate-pulse pointer-events-none" />

          {/* White Outer Glow Aura */}
          <div
            className={`absolute w-[15vw] h-[15vw] min-w-[105px] min-h-[105px] max-w-[170px] max-h-[170px] rounded-full transition-all duration-500 pointer-events-none ${
              isHoveringMoon
                ? 'bg-white/25 shadow-[0_0_60px_rgba(255,255,255,0.95),0_0_100px_rgba(186,230,253,0.8)] scale-110'
                : 'shadow-[0_0_35px_rgba(255,255,255,0.8),0_0_70px_rgba(186,230,253,0.5)]'
            }`}
          />

          {/* 
            THE INTERACTIVE MOON BUTTON with Crisp White Outline
          */}
          <button
            type="button"
            onClick={handleMoonClick}
            onMouseEnter={() => setIsHoveringMoon(true)}
            onMouseLeave={() => setIsHoveringMoon(false)}
            aria-label="Click the full moon to enter Tsukuyomi Watch"
            title="Click the Moon to Enter Tsukuyomi Watch"
            className="group relative w-[13.5vw] h-[13.5vw] min-w-[95px] min-h-[95px] max-w-[155px] max-h-[155px] rounded-full cursor-pointer focus:outline-none transition-all duration-300 transform active:scale-95"
          >
            {/* Crisp 2.5px White Border Outline Requested */}
            <div
              className={`absolute inset-0 rounded-full border-[2.5px] border-white transition-all duration-300 ${
                isHoveringMoon
                  ? 'border-white ring-4 ring-white/70 shadow-[0_0_30px_#ffffff,inset_0_0_20px_#ffffff]'
                  : 'border-white/95 shadow-[0_0_20px_rgba(255,255,255,0.85)]'
              }`}
            />

            {/* Subtle inner iridescent sheen */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 opacity-60 group-hover:opacity-90 transition-opacity" />

            {/* Floating Invitation Callout appearing above/below moon */}
            <div
              className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 pointer-events-none ${
                isHoveringMoon ? 'opacity-100 translate-y-0 scale-100' : 'opacity-90 translate-y-1 scale-95'
              }`}
            >
              <div className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span className="font-cinzel text-xs font-bold text-white tracking-wider">
                  ENTER TSUKUYOMI WATCH
                </span>
                <span className="font-japanese text-[11px] text-[#d4af37] border-l border-slate-600 pl-2">
                  月読の観測台へ
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Top Brand Marker (Constitutional, clean quiet typography) */}
        <div className="absolute top-6 left-6 z-20 hidden sm:flex items-center gap-3 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#d4af37]/30">
          <div className="w-7 h-7 rounded bg-[#c41e3a] flex items-center justify-center border border-[#d4af37]/40 shadow-sm">
            <span className="font-cinzel text-white font-bold text-xs">月</span>
          </div>
          <div>
            <span className="font-cinzel font-bold text-xs text-white tracking-widest block">
              TSUKUYOMI WATCH
            </span>
            <span className="font-japanese text-[10px] text-[#d4af37] block">
              The Samurai's Celestial Guide · 天文月読
            </span>
          </div>
        </div>

        {/* Bottom Banner Instruction Prompt */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none max-w-md px-4">
          <p className="font-japanese text-sm sm:text-base text-white font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            「満月を仰ぎて、星の道を解く」
          </p>
          <p className="font-mono-tech text-[11px] text-amber-200/90 tracking-wider mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ✦ CLICK THE OUTLINED MOON TO ENTER ✦
          </p>
        </div>

        {/* Direct Access Skip Button on bottom right */}
        <div className="absolute bottom-6 right-6 z-30">
          <button
            onClick={handleMoonClick}
            className="text-[11px] font-mono-tech text-white/70 hover:text-white px-3 py-1.5 rounded bg-black/60 hover:bg-black/80 backdrop-blur border border-white/20 transition-all hover:border-white/50"
          >
            Direct Enter →
          </button>
        </div>
      </div>
    </div>
  );
};
