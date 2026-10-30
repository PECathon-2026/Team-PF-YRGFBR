import React from 'react';
import { ActiveTab } from './Header';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="mt-20 border-t border-[#181a42] bg-[#070817]/95 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#c41e3a] flex items-center justify-center font-cinzel text-xs text-amber-100 font-bold border border-[#d4af37]/40">
            月
          </div>
          <div>
            <span className="font-cinzel font-semibold text-slate-300 tracking-wider">
              TSUKUYOMI WATCH
            </span>
            <span className="text-slate-600 block text-[11px] font-japanese">
              The Samurai's Celestial Guide · 天文月読之書
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-400 font-medium">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveTab('watchtower');
            }}
            className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
          >
            <span>🌘</span>
            <span>Watchtower</span>
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveTab('scroll');
            }}
            className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
          >
            <span>🌓</span>
            <span>Celestial Scroll</span>
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveTab('lens');
            }}
            className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
          >
            <span>🌔</span>
            <span>Spirit Lens</span>
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveTab('dojo');
            }}
            className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
          >
            <span>🌕</span>
            <span>Dojo</span>
          </button>
        </div>

        <div className="text-right text-[11px] text-slate-500 font-mono-tech">
          <span>Atmospheric tables via Open-Meteo & NASA API</span>
          <span className="block mt-0.5 text-[#d4af37]/80">🌙 Under the eternal patronage of Tsukuyomi-no-Mikoto</span>
        </div>
      </div>

      {/* Decorative 8-Phase Moon Progression Bar */}
      <div className="mt-8 pt-6 border-t border-[#131535] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono-tech text-slate-400 select-none">
        {[
          { glyph: '🌑', name: 'Shingetsu (New)' },
          { glyph: '🌒', name: 'Mikazuki (Crescent)' },
          { glyph: '🌓', name: 'Jogen (1st Qtr)' },
          { glyph: '🌔', name: 'Jusanya (Gibbous)' },
          { glyph: '🌕', name: 'Mangetsu (Full)' },
          { glyph: '🌖', name: 'Izayoi (Waning)' },
          { glyph: '🌗', name: 'Kagen (Last Qtr)' },
          { glyph: '🌘', name: 'Ariake (Dawn)' },
        ].map((phase, idx) => (
          <div key={idx} className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors cursor-default">
            <span className="text-base drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">{phase.glyph}</span>
            <span className="text-[10px] hidden sm:inline">{phase.name}</span>
          </div>
        ))}
      </div>
    </footer>
  );
};
