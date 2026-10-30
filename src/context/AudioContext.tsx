import React, { createContext, useContext, useState, useEffect } from 'react';
import { celestialAudio } from '../utils/audio';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSlash: () => void;
  playKoto: (noteIndex?: number) => void;
  playZenChime: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    celestialAudio.setMuted(nextState);
  };

  const playSlash = () => {
    celestialAudio.playKatanaSlash();
  };

  const playKoto = (noteIndex?: number) => {
    celestialAudio.playKoto(noteIndex);
  };

  const playZenChime = () => {
    celestialAudio.playZenChime();
  };

  // Sound of katana slash on any press (pointerdown & interactive keydown)
  useEffect(() => {
    let lastPlayTime = 0;

    const handlePointerDown = () => {
      const now = performance.now();
      // Throttle slightly (65ms) so quick multi-touch doesn't stutter, but every press feels instant
      if (now - lastPlayTime < 65) return;
      lastPlayTime = now;
      celestialAudio.playKatanaSlash();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const now = performance.now();
        if (now - lastPlayTime < 65) return;
        lastPlayTime = now;
        celestialAudio.playKatanaSlash();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playSlash, playKoto, playZenChime }}>
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
