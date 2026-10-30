import React, { createContext, useContext, useState, useEffect } from 'react';
import { SamuraiLevelInfo, HonorActivityLog, HonorBadge } from '../types';
import { celestialAudio } from '../utils/audio';

export const SAMURAI_LEVELS: SamuraiLevelInfo[] = [
  {
    level: 1,
    title: 'Rōnin Wanderer',
    titleKanji: '浪人',
    minPoints: 0,
    maxPoints: 100,
    badgeIcon: '🎋',
    description: 'An unaligned wanderer observing the first constellations beneath the night sky.',
    perk: 'Unlocks Watchtower & Celestial Sky Alignment'
  },
  {
    level: 2,
    title: 'Ashigaru Vanguard',
    titleKanji: '足軽',
    minPoints: 100,
    maxPoints: 250,
    badgeIcon: '🏹',
    description: 'Frontline celestial night watchman scanning orbital satellite trajectories.',
    perk: 'Unlocks ISS Live Radar & Trans-injection Tracking'
  },
  {
    level: 3,
    title: 'Bushi Stargazer',
    titleKanji: '武士',
    minPoints: 250,
    maxPoints: 500,
    badgeIcon: '⚔️',
    description: 'Disciplined swordsman of the stars, adept in stellar photometry.',
    perk: 'Unlocks Time-Domain Transient Event Detection'
  },
  {
    level: 4,
    title: 'Hatamoto Sky Guardian',
    titleKanji: '旗本',
    minPoints: 500,
    maxPoints: 900,
    badgeIcon: '🛡️',
    description: 'Sworn high-ranking samurai guarding the imperial observatory dome.',
    perk: 'Unlocks Optical De-blur Super-Resolution Multipliers'
  },
  {
    level: 5,
    title: 'Daimyo Commander',
    titleKanji: '大名',
    minPoints: 900,
    maxPoints: 1500,
    badgeIcon: '🏯',
    description: 'Lord of the observatory provinces with mastery over deep-sky nebulae and galaxies.',
    perk: 'Unlocks Deep Cosmic Astrophotography Dossiers'
  },
  {
    level: 6,
    title: 'Shogun of the Heavens',
    titleKanji: '将軍',
    minPoints: 1500,
    maxPoints: 2500,
    badgeIcon: '👑',
    description: 'Supreme military strategist commanding all celestial watches across the realm.',
    perk: 'Unlocks Ancient Star Scroll Master Brush Archives'
  },
  {
    level: 7,
    title: 'Tenkū Cosmic Master',
    titleKanji: '天空衆',
    minPoints: 2500,
    maxPoints: 4000,
    badgeIcon: '🌌',
    description: 'Transcendent celestial sage whose vision penetrates the cosmic void.',
    perk: 'All Celestial Oracles & Astrometry Multipliers Active'
  },
  {
    level: 8,
    title: 'Tsukuyomi Divine Legend',
    titleKanji: '月読神',
    minPoints: 4000,
    maxPoints: 999999,
    badgeIcon: '🌙',
    description: 'Living embodiment of the Moon Kami Tsukuyomi, master of light and darkness.',
    perk: 'Ultimate Stargazer Master Achievement Crest'
  }
];

export const ALL_BADGES: HonorBadge[] = [
  {
    id: 'b-initiation',
    name: 'Oath of the Stargazer',
    nameKanji: '星見の誓い',
    icon: '🎋',
    description: 'Initiated into Tsukuyomi Watch by taking your first vigil.'
  },
  {
    id: 'b-constellation-scholar',
    name: 'Constellation Master',
    nameKanji: '星座の達人',
    icon: '⭐',
    description: 'Studied deep star coordinates in the Celestial Scroll.'
  },
  {
    id: 'b-transient-hunter',
    name: 'Transient Novice',
    nameKanji: '過渡天体探知',
    icon: '⚡',
    description: 'Detected a time-domain transient event (Supernova / GRB / Transit).'
  },
  {
    id: 'b-optical-restorer',
    name: 'Blade of Clarity',
    nameKanji: '明鏡止水',
    icon: '⚔️',
    description: 'Restored and de-blurred a raw astronomical exposure.'
  },
  {
    id: 'b-vedic-sage',
    name: 'Vedic & Global Scholar',
    nameKanji: '世界天文伝承',
    icon: '📜',
    description: 'Explored historical treatises of Aryabhata, Bhaskara, and Galileo.'
  },
  {
    id: 'b-shogun-crown',
    name: 'Crown of the Shogun',
    nameKanji: '将軍の栄冠',
    icon: '👑',
    description: 'Amassed over 1,500 Honor Points and commanded the night skies.'
  }
];

interface HonorToast {
  id: string;
  points: number;
  reason: string;
  isLevelUp?: boolean;
  newTitle?: string;
  badgeEarned?: string;
}

interface HonorGameContextType {
  honorPoints: number;
  currentLevel: SamuraiLevelInfo;
  nextLevel: SamuraiLevelInfo | null;
  progressPercent: number;
  history: HonorActivityLog[];
  unlockedBadges: string[];
  recentToast: HonorToast | null;
  dismissToast: () => void;
  addHonorPoints: (points: number, reason: string, category?: 'watchtower' | 'scroll' | 'lens' | 'dojo' | 'bonus') => void;
  resetProgress: () => void;
}

const STORAGE_KEY = 'tsukuyomi_honor_points_v2';
const BADGES_KEY = 'tsukuyomi_unlocked_badges_v2';
const HISTORY_KEY = 'tsukuyomi_honor_history_v2';

const HonorGameContext = createContext<HonorGameContextType | undefined>(undefined);

export const HonorGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [honorPoints, setHonorPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 120; // 120 bonus on initiation
    } catch {
      return 120;
    }
  });

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BADGES_KEY);
      return saved ? JSON.parse(saved) : ['b-initiation'];
    } catch {
      return ['b-initiation'];
    }
  });

  const [history, setHistory] = useState<HonorActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [
        {
          id: 'init-1',
          timestamp: Date.now() - 3600000,
          points: 120,
          reason: 'Initiation Oath of the Stargazer',
          category: 'bonus'
        }
      ];
    } catch {
      return [];
    }
  });

  const [recentToast, setRecentToast] = useState<HonorToast | null>(null);

  // Compute current samurai level
  const getCurrentLevel = (pts: number): SamuraiLevelInfo => {
    for (let i = SAMURAI_LEVELS.length - 1; i >= 0; i--) {
      if (pts >= SAMURAI_LEVELS[i].minPoints) {
        return SAMURAI_LEVELS[i];
      }
    }
    return SAMURAI_LEVELS[0];
  };

  const currentLevel = getCurrentLevel(honorPoints);
  const nextLevel = currentLevel.level < SAMURAI_LEVELS.length
    ? SAMURAI_LEVELS[currentLevel.level] // next level index is level (since 1-indexed)
    : null;

  const progressPercent = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          ((honorPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
        )
      )
    : 100;

  // Add Honor points and trigger game feedback
  const addHonorPoints = (
    points: number,
    reason: string,
    category: 'watchtower' | 'scroll' | 'lens' | 'dojo' | 'bonus' = 'scroll'
  ) => {
    setHonorPoints((prev) => {
      const newTotal = prev + points;
      const oldLvl = getCurrentLevel(prev);
      const newLvl = getCurrentLevel(newTotal);
      const isLevelUp = newLvl.level > oldLvl.level;

      try {
        localStorage.setItem(STORAGE_KEY, newTotal.toString());
      } catch (err) {
        console.warn('Storage save error:', err);
      }

      // Check badges
      const newBadges = [...unlockedBadges];
      let newlyEarnedBadgeName: string | undefined;

      if (newTotal >= 250 && !newBadges.includes('b-transient-hunter') && category === 'lens') {
        newBadges.push('b-transient-hunter');
        newlyEarnedBadgeName = 'Transient Novice';
      }
      if (newTotal >= 350 && !newBadges.includes('b-optical-restorer') && category === 'lens') {
        newBadges.push('b-optical-restorer');
        newlyEarnedBadgeName = 'Blade of Clarity';
      }
      if (newTotal >= 500 && !newBadges.includes('b-constellation-scholar')) {
        newBadges.push('b-constellation-scholar');
        newlyEarnedBadgeName = 'Constellation Master';
      }
      if (newTotal >= 900 && !newBadges.includes('b-vedic-sage')) {
        newBadges.push('b-vedic-sage');
        newlyEarnedBadgeName = 'Vedic & Global Scholar';
      }
      if (newTotal >= 1500 && !newBadges.includes('b-shogun-crown')) {
        newBadges.push('b-shogun-crown');
        newlyEarnedBadgeName = 'Crown of the Shogun';
      }

      if (newBadges.length > unlockedBadges.length) {
        setUnlockedBadges(newBadges);
        try {
          localStorage.setItem(BADGES_KEY, JSON.stringify(newBadges));
        } catch {}
      }

      // Audio feedback
      if (isLevelUp) {
        celestialAudio.playLevelUp();
      } else {
        celestialAudio.playKatanaSlash();
      }

      // Trigger toast
      setRecentToast({
        id: `toast-${Date.now()}`,
        points,
        reason,
        isLevelUp,
        newTitle: isLevelUp ? newLvl.title : undefined,
        badgeEarned: newlyEarnedBadgeName
      });

      // Update history log
      const newEntry: HonorActivityLog = {
        id: `act-${Date.now()}`,
        timestamp: Date.now(),
        points,
        reason,
        category
      };
      setHistory((prevHist) => {
        const updated = [newEntry, ...prevHist].slice(0, 30);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      return newTotal;
    });
  };

  const dismissToast = () => setRecentToast(null);

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!recentToast) return;
    const timer = setTimeout(() => {
      setRecentToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [recentToast]);

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BADGES_KEY);
    localStorage.removeItem(HISTORY_KEY);
    setHonorPoints(120);
    setUnlockedBadges(['b-initiation']);
    setHistory([]);
  };

  return (
    <HonorGameContext.Provider
      value={{
        honorPoints,
        currentLevel,
        nextLevel,
        progressPercent,
        history,
        unlockedBadges,
        recentToast,
        dismissToast,
        addHonorPoints,
        resetProgress
      }}
    >
      {children}
    </HonorGameContext.Provider>
  );
};

export const useHonorGame = (): HonorGameContextType => {
  const context = useContext(HonorGameContext);
  if (!context) {
    throw new Error('useHonorGame must be used within an HonorGameProvider');
  }
  return context;
};
