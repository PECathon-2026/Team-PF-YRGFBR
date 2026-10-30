import React from 'react';

export const MoonEmblem: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg';
  phase?: 'new' | 'crescent' | 'quarter' | 'gibbous' | 'full' | 'waning';
  className?: string;
  glow?: boolean;
}> = ({ size = 'sm', phase = 'crescent', className = '', glow = true }) => {
  const sizeMap = {
    xs: 'w-3 h-3 text-[10px]',
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-7 h-7 text-lg',
  };

  const getGlyph = () => {
    switch (phase) {
      case 'new': return '🌑';
      case 'crescent': return '🌙';
      case 'quarter': return '🌓';
      case 'gibbous': return '🌔';
      case 'full': return '🌕';
      case 'waning': return '🌘';
      default: return '🌙';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center select-none pointer-events-none transition-transform ${sizeMap[size]} ${
        glow ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] text-[#d4af37]' : 'text-slate-300'
      } ${className}`}
      aria-hidden="true"
    >
      {getGlyph()}
    </span>
  );
};

export const MoonDivider: React.FC<{ label?: string; className?: string }> = ({ label, className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 my-4 ${className}`}>
      <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
      <div className="flex items-center gap-1.5 text-xs text-[#d4af37]/75">
        <span className="text-[10px]">🌘</span>
        <span className="text-xs">🌓</span>
        <span className="text-sm">🌕</span>
        <span className="text-xs">🌗</span>
        <span className="text-[10px]">🌒</span>
      </div>
      {label && (
        <span className="text-[11px] font-mono-tech uppercase tracking-widest text-slate-300 px-1">
          {label}
        </span>
      )}
      <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
    </div>
  );
};

export const FloatingMoonDust: React.FC = () => {
  // Pre-configured subtle ambient moon motifs in the background
  const ambientMoons = [
    { top: '8%', left: '4%', phase: '🌒', size: 'text-sm', opacity: 'opacity-20', delay: '0s' },
    { top: '15%', right: '6%', phase: '🌔', size: 'text-base', opacity: 'opacity-25', delay: '2s' },
    { top: '32%', left: '7%', phase: '🌙', size: 'text-xs', opacity: 'opacity-20', delay: '4s' },
    { top: '48%', right: '5%', phase: '🌕', size: 'text-sm', opacity: 'opacity-30', delay: '1s' },
    { top: '65%', left: '3%', phase: '🌓', size: 'text-xs', opacity: 'opacity-20', delay: '3s' },
    { top: '78%', right: '8%', phase: '🌗', size: 'text-sm', opacity: 'opacity-25', delay: '5s' },
    { top: '92%', left: '8%', phase: '🌘', size: 'text-xs', opacity: 'opacity-20', delay: '2.5s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {ambientMoons.map((m, idx) => (
        <div
          key={idx}
          style={{ top: m.top, left: m.left, right: m.right, animationDelay: m.delay }}
          className={`absolute ${m.size} ${m.opacity} text-amber-200/60 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-pulse transition-opacity duration-1000 hidden md:block`}
        >
          {m.phase}
        </div>
      ))}
    </div>
  );
};
