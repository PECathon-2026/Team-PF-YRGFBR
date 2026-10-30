import React from 'react';
import { useHonorGame } from '../context/HonorGameContext';
import { Shield, Sparkles, Trophy, X, ChevronRight } from 'lucide-react';

export const HonorGameToast: React.FC = () => {
  const { recentToast, dismissToast, currentLevel, honorPoints } = useHonorGame();

  if (!recentToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-in pointer-events-auto">
      <div
        className={`rounded-xl border p-4 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all ${
          recentToast.isLevelUp
            ? 'bg-gradient-to-r from-[#1f1638] via-[#2c1d45] to-[#1a1230] border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.4)]'
            : 'bg-[#0f1131]/95 border-[#d4af37]/60 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
        }`}
      >
        {/* Background shimmer */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent animate-pulse" />

        <div className="flex items-start gap-3">
          {/* Badge icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              recentToast.isLevelUp
                ? 'bg-[#d4af37] text-black border-amber-200 shadow-md text-lg'
                : 'bg-[#181a44] border-[#d4af37]/50 text-[#d4af37]'
            }`}
          >
            {recentToast.isLevelUp ? (
              <Trophy className="w-5 h-5 text-black" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#d4af37] animate-spin" />
            )}
          </div>

          {/* Toast Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4af37] font-bold">
                {recentToast.isLevelUp ? '⚔️ SAMURAI RANK PROMOTION!' : `+${recentToast.points} HONOR POINTS`}
              </span>
            </div>

            {recentToast.isLevelUp ? (
              <div className="mt-0.5">
                <h4 className="text-sm font-cinzel font-bold text-amber-200">
                  {recentToast.newTitle} ({currentLevel.titleKanji})
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 font-japanese">
                  {currentLevel.perk}
                </p>
              </div>
            ) : (
              <div className="mt-0.5">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {recentToast.reason}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono-tech text-slate-400">
                  <span>Level {currentLevel.level}: {currentLevel.title}</span>
                  <span>·</span>
                  <span className="text-[#d4af37] font-bold">{honorPoints} pts</span>
                </div>
              </div>
            )}

            {recentToast.badgeEarned && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1b193f] border border-[#d4af37]/40 text-[10px] font-mono-tech text-amber-300">
                <span>🏆</span>
                <span>Badge: {recentToast.badgeEarned}</span>
              </div>
            )}
          </div>

          {/* Dismiss X */}
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
