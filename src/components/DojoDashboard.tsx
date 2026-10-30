import React, { useState, useEffect } from 'react';
import { getMoonPhaseData, CELESTIAL_SCHOLARS } from '../utils/astronomy';
import { MoonPhaseData } from '../types';
import {
  Moon,
  Telescope,
  Search,
  ExternalLink,
  BookOpen,
  Calendar,
  Compass,
  Sparkles,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

interface NasaImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dateCreated: string;
  photographer?: string;
}

export const DojoDashboard: React.FC = () => {
  // Moon phase calculation state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [moonData, setMoonData] = useState<MoonPhaseData>(() =>
    getMoonPhaseData(new Date())
  );

  // NASA SkyView state
  const [nasaQuery, setNasaQuery] = useState<string>('moon');
  const [nasaImages, setNasaImages] = useState<NasaImage[]>([]);
  const [isLoadingNasa, setIsLoadingNasa] = useState<boolean>(false);
  const [nasaError, setNasaError] = useState<string | null>(null);
  const [activeNasaImage, setActiveNasaImage] = useState<NasaImage | null>(null);

  // Scholars filtering state
  const [scholarRegion, setScholarRegion] = useState<string>('all');
  const [scholarSearch, setScholarSearch] = useState<string>('');

  // Recalculate moon data when date changes
  useEffect(() => {
    const d = new Date(selectedDate);
    if (!isNaN(d.getTime())) {
      setMoonData(getMoonPhaseData(d));
    }
  }, [selectedDate]);

  // Fetch from NASA SkyView API
  const fetchNasaImages = async (query: string = 'moon') => {
    setIsLoadingNasa(true);
    setNasaError(null);
    try {
      const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('NASA archive transmission interrupted');

      const json = await res.json();
      const items = json?.collection?.items || [];

      const parsed: NasaImage[] = items.slice(0, 8).map((item: any, idx: number) => {
        const link = item?.links?.[0]?.href || '';
        const meta = item?.data?.[0] || {};
        return {
          id: meta.nasa_id || `nasa-${idx}`,
          title: meta.title || 'Celestial Body',
          description: meta.description || 'Deep space observatory capture.',
          imageUrl: link,
          dateCreated: meta.date_created?.substring(0, 10) || 'Archived',
          photographer: meta.photographer || 'Hubble / NASA Science'
        };
      }).filter((img: NasaImage) => Boolean(img.imageUrl));

      if (parsed.length > 0) {
        setNasaImages(parsed);
        setActiveNasaImage(parsed[0]);
      } else {
        setNasaError(`No celestial exposures cataloged under "${query}".`);
      }
    } catch {
      setNasaError('NASA image gateway unreachable. Showing imperial archive snapshot.');
      const fallback: NasaImage[] = [
        {
          id: 'sample-moon',
          title: 'Apollo & Lunar Reconnaissance Orbiter High-Resolution Mosaic',
          description: 'Craters Tycho and Copernicus illuminated during terminator sunset.',
          imageUrl: '/src/assets/images/nebula_celestial_lens_1793301542654.jpg',
          dateCreated: '2024-06-18',
          photographer: 'NASA / Goddard Space Flight Center'
        }
      ];
      setNasaImages(fallback);
      setActiveNasaImage(fallback[0]);
    } finally {
      setIsLoadingNasa(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNasaImages('moon');
  }, []);

  return (
    <div className="space-y-8">
      {/* Dojo Header */}
      <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/35 bg-[#0e102e] p-6 lg:p-8 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-tech tracking-wider text-[#d4af37]">
              <span>DŌJŌ SANCTUM (天文道場)</span>
              <span>·</span>
              <span>LUNAR CHRONOMETER</span>
              <span>·</span>
              <span className="text-[#c41e3a]">NASA HUBBLE ARCHIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-bold text-slate-100 tracking-tight text-balance">
              The Celestial Dojo & Lunar Chronometer
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-japanese">
              The warrior who does not comprehend the moon walks into ambush. Calculate exact lunar phases, inspect the heavens through NASA's Hubble & Webb telescopes, and study Japan's historical astronomy masters.
            </p>
          </div>

          {/* Quick Lunar Status Pill */}
          <div className="bg-[#14173d] border border-[#d4af37]/40 rounded-xl p-5 shrink-0 max-w-xs space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-tech uppercase text-slate-400">Current Phase</span>
              <span className="text-xs font-japanese font-semibold text-[#d4af37]">{moonData.phaseKanji}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono-tech text-3xl font-bold text-slate-100 tabular-nums">
                {moonData.illuminationPct}%
              </span>
              <span className="text-xs font-mono-tech text-slate-400">ILLUMINATION</span>
            </div>

            <div className="text-[11px] font-mono-tech text-slate-400 pt-1 border-t border-[#252856]">
              Synodic Day {moonData.daysIntoCycle} of 29.53d cycle
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Moon Phase Tracker Widget & NASA SkyView Hubble Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Moon Phase Tracker Widget */}
        <div className="lg:col-span-5 bg-[#101233] border border-[#d4af37]/40 rounded-xl p-6 space-y-6 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
          <div className="flex items-center justify-between border-b border-[#252856] pb-3">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-cinzel font-bold text-sm text-slate-200 uppercase tracking-wide">
                Tsukuyomi Moon Phase
              </h3>
            </div>
            <span className="text-[10px] font-mono-tech text-[#d4af37]">SYNODIC 29.53d</span>
          </div>

          {/* Interactive Date Selector */}
          <div className="flex items-center justify-between gap-3 bg-[#0a0b22] p-3 rounded-lg border border-[#252856]">
            <span className="text-xs text-slate-300 font-mono-tech">Observation Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#14173d] border border-[#2d3166] text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Graphic Moon Phase Visualizer */}
          <div className="relative py-6 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-36 h-36 rounded-full bg-[#0a0c26] border-2 border-[#d4af37]/60 shadow-[0_0_35px_rgba(212,175,55,0.25)] flex items-center justify-center overflow-hidden">
              {/* Moon texture glow */}
              <div
                className="absolute inset-0 rounded-full transition-all duration-500"
                style={{
                  background: `radial-gradient(circle at ${
                    moonData.phaseValue < 0.5 ? '75% 50%' : '25% 50%'
                  }, #fef08a 0%, #d4af37 40%, #1e1e1e 80%)`,
                  opacity: Math.max(0.2, moonData.illuminationPct / 100)
                }}
              />
              {/* Shadow disc */}
              <div
                className="absolute w-full h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: '#07081a',
                  transform: `translateX(${(0.5 - moonData.phaseValue) * 80}%)`,
                  opacity: 1 - moonData.illuminationPct / 100
                }}
              />
              <div className="relative z-10 text-center pointer-events-none">
                <span className="font-cinzel font-bold text-xs text-black/80 drop-shadow">
                  {moonData.illuminationPct}%
                </span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="text-xl font-cinzel font-bold text-slate-100 block">
                {moonData.phaseName}
              </span>
              <span className="text-sm font-japanese font-semibold text-[#d4af37] block">
                {moonData.phaseKanji}
              </span>
              <span className="text-xs font-mono-tech text-slate-300 block">
                Day {moonData.daysIntoCycle} of Lunar Cycle · {moonData.illuminationPct}% Illumination
              </span>
            </div>
          </div>

          {/* Traditional Samurai Lore Interpretation */}
          <div className="p-4 rounded-lg bg-[#181944] border border-[#d4af37]/35 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-[#d4af37] uppercase">
              <span>⚔️ Samurai Tactical Lore</span>
            </div>
            <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
              "{moonData.samuraiMeaning}"
            </p>
          </div>

          {/* Ephemeris timings */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
            <div className="p-2.5 rounded bg-[#14173d] border border-[#252856] flex justify-between">
              <span className="text-slate-400">Moonrise:</span>
              <span className="text-amber-300 font-semibold">{moonData.moonrise}</span>
            </div>
            <div className="p-2.5 rounded bg-[#14173d] border border-[#252856] flex justify-between">
              <span className="text-slate-400">Moonset:</span>
              <span className="text-slate-300 font-semibold">{moonData.moonset}</span>
            </div>
          </div>
        </div>

        {/* NASA SkyView Hubble Explorer */}
        <div className="lg:col-span-7 bg-[#101233] border border-[#d4af37]/40 rounded-xl p-6 space-y-5 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252856] pb-3">
            <div className="flex items-center gap-2">
              <Telescope className="w-5 h-5 text-[#c41e3a]" />
              <h3 className="font-cinzel font-bold text-sm text-slate-200 uppercase tracking-wide">
                NASA SkyView · Hubble & Webb Archive
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {['Moon', 'Hubble Nebula', 'Saturn', 'Galaxy'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setNasaQuery(term.toLowerCase());
                    fetchNasaImages(term.toLowerCase());
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono-tech bg-[#14173d] hover:bg-[#1a1f4e] text-slate-300 hover:text-[#d4af37] border border-[#252856] rounded transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar & View Through Hubble Trigger */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={nasaQuery}
                onChange={(e) => setNasaQuery(e.target.value)}
                placeholder="Search NASA image catalog (e.g. Orion, Crab Nebula, Moon)..."
                className="w-full pl-9 pr-3 py-2 bg-[#0a0b22] border border-[#2d3166] rounded text-xs text-slate-200 focus:outline-none focus:border-[#d4af37]"
                onKeyDown={(e) => e.key === 'Enter' && fetchNasaImages(nasaQuery)}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => fetchNasaImages(nasaQuery)}
              disabled={isLoadingNasa}
              className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded transition-colors whitespace-nowrap shadow-md"
            >
              <Telescope className="w-3.5 h-3.5" />
              <span>{isLoadingNasa ? 'Focusing...' : 'View Through Hubble'}</span>
            </button>
          </div>

          {/* Active Hubble Image Feature Display */}
          {activeNasaImage && (
            <div className="relative rounded-lg overflow-hidden border border-[#d4af37]/35 bg-[#07081a] space-y-3 p-4">
              <div className="relative h-64 sm:h-72 w-full rounded overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={activeNasaImage.imageUrl}
                  alt={activeNasaImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur rounded border border-[#252856] text-[10px] font-mono-tech text-slate-300">
                  {activeNasaImage.dateCreated}
                </div>
              </div>

              <div>
                <h4 className="font-cinzel font-bold text-base text-slate-100">
                  {activeNasaImage.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {activeNasaImage.description}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-500 mt-2 pt-2 border-t border-slate-800">
                  <span>Instrument: {activeNasaImage.photographer}</span>
                  <a
                    href={activeNasaImage.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#d4af37] hover:underline"
                  >
                    <span>Full High-Res</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnails Row */}
          {nasaImages.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {nasaImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveNasaImage(img)}
                  className={`relative rounded overflow-hidden h-14 border transition-all ${
                    activeNasaImage?.id === img.id
                      ? 'border-[#d4af37] ring-1 ring-[#d4af37]'
                      : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {nasaError && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded text-amber-200 text-xs">
              {nasaError}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Imperial Celestial Scholars & Astronomers From Around the World */}
      <div className="bg-[#101233] border border-[#d4af37]/35 rounded-xl p-6 lg:p-8 space-y-6 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252856] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#d4af37]" />
              <h2 className="font-cinzel font-bold text-lg text-slate-100 uppercase tracking-wide">
                Imperial & World Celestial Scholars
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Legendary astronomers, polymaths, and cosmologists from around the world—India, Europe, Persia, China, Egypt, Japan, and the Americas—who unraveled the mechanics of the heavens.
            </p>
          </div>

          <div className="text-xs font-mono-tech text-slate-400 bg-[#14173d] px-3 py-1.5 rounded border border-[#252856] shrink-0">
            <span>{CELESTIAL_SCHOLARS.length} Global Scholars Cataloged</span>
          </div>
        </div>

        {/* Region Tabs & Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0c0d28] p-3 rounded-lg border border-[#252856]">
          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
            {[
              { id: 'all', label: 'All Regions' },
              { id: 'India & South Asia', label: '🇮🇳 India & South Asia' },
              { id: 'Europe & Mediterranean', label: '🏛️ Europe & Mediterranean' },
              { id: 'Middle East & Persia', label: '🕌 Middle East & Persia' },
              { id: 'Japan & East Asia', label: '⛩️ Japan & East Asia' },
              { id: 'Americas & Modern Era', label: '🔭 Americas & Modern' }
            ].map((reg) => (
              <button
                key={reg.id}
                onClick={() => setScholarRegion(reg.id)}
                className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                  scholarRegion === reg.id
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={scholarSearch}
              onChange={(e) => setScholarSearch(e.target.value)}
              placeholder="Search scholar or treatise (e.g. Aryabhata, Galileo, Kepler)..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#14173d] border border-[#2d3166] text-xs rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Scholars Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CELESTIAL_SCHOLARS.filter((s) => {
            const matchesRegion = scholarRegion === 'all' || s.region === scholarRegion;
            const matchesSearch =
              !scholarSearch.trim() ||
              s.name.toLowerCase().includes(scholarSearch.toLowerCase()) ||
              s.title.toLowerCase().includes(scholarSearch.toLowerCase()) ||
              s.astronomicalWork.toLowerCase().includes(scholarSearch.toLowerCase()) ||
              s.achievement.toLowerCase().includes(scholarSearch.toLowerCase()) ||
              s.region.toLowerCase().includes(scholarSearch.toLowerCase());
            return matchesRegion && matchesSearch;
          }).map((scholar) => (
            <div
              key={scholar.name}
              className="p-5 rounded-xl bg-[#14173d] border border-[#252856] hover:border-[#d4af37]/45 transition-colors space-y-3.5 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-cinzel font-bold text-sm text-[#d4af37]">
                      {scholar.name}
                    </h3>
                    <span className="text-[10px] font-mono-tech text-cyan-400 block mt-0.5">
                      {scholar.region}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#0a0b22] border border-[#2d3166] text-amber-200/90 shrink-0">
                    {scholar.crest}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-200 font-serif">
                  {scholar.title}
                </p>
                <span className="text-[11px] font-mono-tech text-[#c41e3a] block">
                  {scholar.era}
                </span>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {scholar.achievement}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#252856]/80 text-[11px] font-mono-tech text-slate-400">
                <span className="text-slate-400">Principal Treatise: </span>
                <span className="text-slate-100 font-semibold italic">{scholar.astronomicalWork}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
