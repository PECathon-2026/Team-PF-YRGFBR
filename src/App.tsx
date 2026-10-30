import React, { useState } from 'react';
import { AudioProvider } from './context/AudioContext';
import { HonorGameProvider } from './context/HonorGameContext';
import { Header, ActiveTab } from './components/Header';
import { SakuraCanvas } from './components/SakuraCanvas';
import { WatchtowerMap } from './components/WatchtowerMap';
import { CelestialScroll } from './components/CelestialScroll';
import { SpiritLens } from './components/SpiritLens';
import { DojoDashboard } from './components/DojoDashboard';
import { Footer } from './components/Footer';
import { GalaxyPortal } from './components/GalaxyPortal';
import { FloatingMoonDust } from './components/MoonDecorations';
import { HonorGameToast } from './components/HonorGameToast';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('watchtower');
  const [hasEnteredPortal, setHasEnteredPortal] = useState<boolean>(false);

  const handleEnterPortal = () => {
    setHasEnteredPortal(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col relative selection:bg-[#c41e3a]/40 selection:text-white">
      {/* Floating Samurai Honor Points Toast & Level Up Celebration Banner */}
      <HonorGameToast />

      {/* Moon Gateway Entrance Screen before main site */}
      {!hasEnteredPortal && (
        <GalaxyPortal onEnter={handleEnterPortal} />
      )}

      {/* Falling Cherry Blossom Sakura Petals Canvas & Floating Moon Dust */}
      <SakuraCanvas />
      <FloatingMoonDust />

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGalaxyPortal={() => setHasEnteredPortal(false)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        {activeTab === 'watchtower' && <WatchtowerMap />}
        {activeTab === 'scroll' && <CelestialScroll />}
        {activeTab === 'lens' && <SpiritLens />}
        {activeTab === 'dojo' && <DojoDashboard />}
      </main>

      {/* Quiet Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <HonorGameProvider>
        <AppContent />
      </HonorGameProvider>
    </AudioProvider>
  );
}
