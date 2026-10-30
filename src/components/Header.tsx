import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useHonorGame, SAMURAI_LEVELS, ALL_BADGES } from '../context/HonorGameContext';
import { Volume2, VolumeX, Shield, Trophy, ChevronRight, X, Sparkles, BookOpen } from 'lucide-react';
import { celestialAudio } from '../utils/audio';

export type ActiveTab = 'watchtower' | 'scroll' | 'lens' | 'dojo';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenGalaxyPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenGalaxyPortal }) => {
  const { isMuted, toggleMute } = useAudio();
  const { honorPoints, currentLevel, nextLevel, progressPercent, history, unlockedBadges } = useHonorGame();
  const [showHonorDrawer, setShowHonorDrawer] = useState<boolean>(false);

  const handleTabSwitch = (tab: ActiveTab, noteIdx: number) => {
    celestialAudio.playKoto(noteIdx);
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0c24]/90 backdrop-blur-md border-b border-[#d4af37]/25 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand title, single line */}
        <button
          onClick={() => handleTabSwitch('watchtower', 0)}
          className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
        >
          {/* Crimson Hanko Seal with Moon Crest */}
          <div className="w-8 h-8 rounded bg-[#c41e3a] flex items-center justify-center shadow-[0_0_12px_rgba(196,30,58,0.4)] border border-[#d4af37]/40 shrink-0 group-hover:scale-105 transition-transform relative">
            <span className="text-amber-100 font-cinzel font-bold text-sm tracking-tighter">月</span>
            <span className="absolute -top-1 -right-1 text-[9px] select-none">🌙</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-cinzel font-bold text-base md:text-lg tracking-wider text-slate-100 group-hover:text-[#d4af37] transition-colors flex items-center gap-1.5">
              <span>TSUKUYOMI WATCH</span>
              <span className="text-xs text-[#d4af37]/80 select-none">🌘</span>
            </span>
            <span className="hidden sm:inline text-xs font-japanese text-[#d4af37]/80 border-l border-[#d4af37]/30 pl-2">
              月読の観測台
            </span>
          </div>
        </button>

        {/* Zone 2: 4 nav links with delicate moon icons */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleTabSwitch('watchtower', 0)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'watchtower'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-[#d4af37]/80">🌘</span>
            <span>Watchtower</span>
          </button>
          <button
            onClick={() => handleTabSwitch('scroll', 1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'scroll'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-[#d4af37]/80">🌓</span>
            <span>Celestial Scroll</span>
          </button>
          <button
            onClick={() => handleTabSwitch('lens', 2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'lens'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-[#d4af37]/80">🌔</span>
            <span>Spirit Lens</span>
          </button>
          <button
            onClick={() => handleTabSwitch('dojo', 3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'dojo'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-[#d4af37]/80">🌕</span>
            <span>Dojo Dashboard</span>
          </button>
        </nav>

        {/* Zone 3: Gamified Samurai Honor Level Widget & actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Honor Points HUD Pill Button */}
          <button
            onClick={() => {
              celestialAudio.playKoto(1);
              setShowHonorDrawer(true);
            }}
            title="View your Samurai Rank, Honor Points & Achievements"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#121438] hover:bg-[#1b1e4f] border border-[#d4af37]/40 hover:border-[#d4af37] transition-all shadow-sm group"
          >
            <span className="text-base select-none">{currentLevel.badgeIcon}</span>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tech leading-none">
                <span className="text-[#d4af37] font-bold">Lv.{currentLevel.level}</span>
                <span className="text-slate-300 font-semibold">{currentLevel.title.split(' ')[0]}</span>
              </div>
              <div className="w-16 h-1 bg-[#090b20] rounded-full overflow-hidden mt-1 border border-[#252856]">
                <div
                  className="h-full bg-gradient-to-r from-[#d4af37] to-amber-200 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right pl-1 border-l border-[#252856]">
              <span className="text-xs font-mono-tech font-bold text-[#d4af37] tabular-nums">
                {honorPoints}
              </span>
              <span className="text-[9px] text-slate-400 font-mono-tech block -mt-0.5">pts</span>
            </div>
          </button>

          {onOpenGalaxyPortal && (
            <button
              onClick={onOpenGalaxyPortal}
              title="Return to the Moon Entrance Portal"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono-tech text-slate-300 hover:text-white border border-[#262854] hover:border-white/50 rounded transition-colors bg-[#121438]"
            >
              <span>🌕</span>
              <span>Portal</span>
            </button>
          )}

          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute traditional sound" : "Mute traditional sound"}
            title={isMuted ? "Unmute sound" : "Mute audio"}
            className="p-2 text-slate-400 hover:text-[#d4af37] transition-colors rounded hover:bg-[#181a44] border border-[#262854] hover:border-[#d4af37]/30"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>
        </div>
      </div>

      {/* Honor Points & Samurai Rank Popover Modal */}
      {showHonorDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0e102e] border border-[#d4af37]/50 rounded-2xl shadow-2xl overflow-hidden sumie-parchment-border max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#171946] via-[#21245b] to-[#171946] border-b border-[#d4af37]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#090b22] border border-[#d4af37]/60 flex items-center justify-center text-xl shadow-inner">
                  {currentLevel.badgeIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-tech uppercase text-[#d4af37] font-bold tracking-widest">
                      SAMURAI CELESTIAL HONOR RANK
                    </span>
                    <span className="text-xs font-japanese text-amber-200">{currentLevel.titleKanji}</span>
                  </div>
                  <h3 className="text-lg font-cinzel font-bold text-slate-100">
                    Level {currentLevel.level}: {currentLevel.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowHonorDrawer(false)}
                className="w-8 h-8 rounded-lg bg-[#090b22] border border-[#252856] hover:border-[#d4af37] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 overflow-y-auto">
              {/* Main Progress Bar & Next Level Target */}
              <div className="p-4 rounded-xl bg-[#14173d] border border-[#252856] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-tech">
                  <span className="text-slate-300">Total Honor Earned:</span>
                  <span className="text-xl font-bold text-[#d4af37]">{honorPoints} pts</span>
                </div>

                {nextLevel ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
                        <span>Progress to Lv.{nextLevel.level} ({nextLevel.title})</span>
                        <span>{honorPoints} / {nextLevel.minPoints} pts</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#0a0b20] rounded-full overflow-hidden border border-[#2d3166] p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4af37] via-amber-200 to-[#d4af37] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 font-japanese">
                      Next Rank Perk: <strong className="text-amber-200">{nextLevel.perk}</strong>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-amber-200 font-cinzel">
                    🌟 You have attained the legendary maximum rank of Tsukuyomi Divine Legend!
                  </p>
                )}
              </div>

              {/* How to Earn Honor Points Guide */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono-tech uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>How to Earn Honor Points</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-[#101235] border border-[#252856]">
                    <span className="text-[#d4af37] font-bold block">+25 pts</span>
                    <span className="text-slate-300 text-[11px]">Study any Constellation in Scroll</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#101235] border border-[#252856]">
                    <span className="text-[#d4af37] font-bold block">+20 pts</span>
                    <span className="text-slate-300 text-[11px]">Study Astronomical Events</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#101235] border border-[#252856]">
                    <span className="text-[#d4af37] font-bold block">+40 pts</span>
                    <span className="text-slate-300 text-[11px]">Identify Space Image with AI</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#101235] border border-[#252856]">
                    <span className="text-[#d4af37] font-bold block">+35 pts</span>
                    <span className="text-slate-300 text-[11px]">De-blur & Restore Image in Lens</span>
                  </div>
                </div>
              </div>

              {/* All Samurai Ranks Progression */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono-tech uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>All Samurai Ranks</span>
                </span>
                <div className="space-y-1.5">
                  {SAMURAI_LEVELS.map((lvl) => {
                    const isUnlocked = honorPoints >= lvl.minPoints;
                    const isCurrent = currentLevel.level === lvl.level;
                    return (
                      <div
                        key={lvl.level}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                          isCurrent
                            ? 'bg-[#1b1e4f] border-[#d4af37] text-white shadow-sm'
                            : isUnlocked
                            ? 'bg-[#121438] border-[#252856] text-slate-300'
                            : 'bg-[#0a0b20] border-[#1d2042] text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{lvl.badgeIcon}</span>
                          <div>
                            <span className="font-semibold block">
                              Lv.{lvl.level}: {lvl.title} ({lvl.titleKanji})
                            </span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">{lvl.perk}</span>
                          </div>
                        </div>
                        <span className="font-mono-tech text-[10px] text-[#d4af37] shrink-0 font-bold">
                          {lvl.minPoints} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unlocked Badges */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono-tech uppercase tracking-wider text-slate-400 font-semibold">
                  Honor Badges ({unlockedBadges.length} / {ALL_BADGES.length})
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {ALL_BADGES.map((b) => {
                    const hasBadge = unlockedBadges.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        className={`p-2 rounded border flex items-center gap-2 ${
                          hasBadge
                            ? 'bg-[#14173d] border-[#d4af37]/40 text-slate-200'
                            : 'bg-[#0a0b20] border-[#1d2042] text-slate-500 opacity-50'
                        }`}
                      >
                        <span className="text-lg">{b.icon}</span>
                        <div>
                          <span className="font-semibold text-[11px] block">{b.name}</span>
                          <span className="text-[9px] text-slate-400 block">{b.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0a0b22] border-t border-[#252856] flex items-center justify-between text-xs font-mono-tech text-slate-400">
              <span>Points automatically saved to your browser session</span>
              <button
                onClick={() => setShowHonorDrawer(false)}
                className="px-4 py-1.5 bg-[#d4af37] hover:bg-[#bfa030] text-black font-cinzel font-bold text-xs uppercase rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-[#1c1f46] bg-[#0c0e2a] overflow-x-auto text-[11px]">
        <button
          onClick={() => handleTabSwitch('watchtower', 0)}
          className={`px-2 py-1 whitespace-nowrap flex items-center gap-1 ${activeTab === 'watchtower' ? 'text-[#d4af37] font-semibold' : 'text-slate-400'}`}
        >
          <span>🌘</span>
          <span>Watchtower</span>
        </button>
        <button
          onClick={() => handleTabSwitch('scroll', 1)}
          className={`px-2 py-1 whitespace-nowrap flex items-center gap-1 ${activeTab === 'scroll' ? 'text-[#d4af37] font-semibold' : 'text-slate-400'}`}
        >
          <span>🌓</span>
          <span>Scroll</span>
        </button>
        <button
          onClick={() => handleTabSwitch('lens', 2)}
          className={`px-2 py-1 whitespace-nowrap flex items-center gap-1 ${activeTab === 'lens' ? 'text-[#d4af37] font-semibold' : 'text-slate-400'}`}
        >
          <span>🌔</span>
          <span>Spirit Lens</span>
        </button>
        <button
          onClick={() => handleTabSwitch('dojo', 3)}
          className={`px-2 py-1 whitespace-nowrap flex items-center gap-1 ${activeTab === 'dojo' ? 'text-[#d4af37] font-semibold' : 'text-slate-400'}`}
        >
          <span>🌕</span>
          <span>Dojo</span>
        </button>
      </div>
    </header>
  );
};

