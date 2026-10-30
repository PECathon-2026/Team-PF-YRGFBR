import React, { useState, useEffect } from 'react';
import { CELESTIAL_EVENTS } from '../utils/astronomy';
import { CONSTELLATIONS_DATABASE } from '../utils/constellations';
import { CelestialEvent, EventType, ISSPosition, ConstellationData, DoodleMatchResult } from '../types';
import { celestialAudio } from '../utils/audio';
import { ConstellationDoodlePad } from './ConstellationDoodlePad';
import {
  Bell,
  Calendar as CalendarIcon,
  Filter,
  Satellite,
  Sparkles,
  Compass,
  CheckCircle,
  ExternalLink,
  Flame,
  Globe2,
  Clock,
  ChevronRight,
  Star,
  Search,
  Telescope,
  BookOpen,
  Layers,
  Eye,
  Info,
  Brush
} from 'lucide-react';

export const CelestialScroll: React.FC = () => {
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [activeEvent, setActiveEvent] = useState<CelestialEvent>(CELESTIAL_EVENTS[0]);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  // Live ISS position state
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null);
  const [isLoadingISS, setIsLoadingISS] = useState<boolean>(false);
  const [issLastUpdated, setIssLastUpdated] = useState<string>('');

  // Constellations section state
  const [activeConstellation, setActiveConstellation] = useState<ConstellationData>(CONSTELLATIONS_DATABASE[0]);
  const [constellationSeason, setConstellationSeason] = useState<string>('all');
  const [constellationSearch, setConstellationSearch] = useState<string>('');
  const [showDoodlePad, setShowDoodlePad] = useState<boolean>(false);
  const [doodleResult, setDoodleResult] = useState<DoodleMatchResult | null>(null);

  const handleConstellationDoodled = (constellation: ConstellationData, result: DoodleMatchResult) => {
    setActiveConstellation(constellation);
    setDoodleResult(result);
    // Auto-scroll gently into view if needed
    const el = document.getElementById('constellation-chamber');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Japanese Lunar Calendar dates simulation
  const lunarCalendarMonths = [
    { kanji: '睦月 (Mutsuki)', roman: '1st Lunar Moon - Harmony', monthNum: '01' },
    { kanji: '如月 (Kisaragi)', roman: '2nd Lunar Moon - Robes', monthNum: '02' },
    { kanji: '弥生 (Yayoi)', roman: '3rd Lunar Moon - Budding', monthNum: '03' },
    { kanji: '卯月 (Uzuki)', roman: '4th Lunar Moon - Deutzia', monthNum: '04' },
    { kanji: '皐月 (Satsuki)', roman: '5th Lunar Moon - Rice Sprouts', monthNum: '05' },
    { kanji: '水無月 (Minazuki)', roman: '6th Lunar Moon - Water', monthNum: '06' },
    { kanji: '文月 (Fumizuki)', roman: '7th Lunar Moon - Letters', monthNum: '07' },
    { kanji: '葉月 (Hazuki)', roman: '8th Lunar Moon - Falling Leaves', monthNum: '08' },
    { kanji: '長月 (Nagatsuki)', roman: '9th Lunar Moon - Long Nights', monthNum: '09' },
    { kanji: '神無月 (Kannazuki)', roman: '10th Lunar Moon - Spirits Convene', monthNum: '10' },
    { kanji: '霜月 (Shimotsuki)', roman: '11th Lunar Moon - Frost', monthNum: '11' },
    { kanji: '師走 (Shiwasu)', roman: '12th Lunar Moon - Monks Running', monthNum: '12' },
  ];

  // Fetch Live ISS Position
  const fetchLiveISSPosition = async () => {
    setIsLoadingISS(true);
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (res.ok) {
        const data = await res.json();
        setIssPosition({
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
          velocityKmH: Math.round(data.velocity),
          altitudeKm: Math.round(data.altitude)
        });
        setIssLastUpdated(new Date().toLocaleTimeString());
        return;
      }
    } catch {
      try {
        const fallbackRes = await fetch('https://api.open-notify.org/iss-now.json');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setIssPosition({
            latitude: parseFloat(fallbackData.iss_position.latitude),
            longitude: parseFloat(fallbackData.iss_position.longitude),
            timestamp: fallbackData.timestamp,
            velocityKmH: 27600,
            altitudeKm: 420
          });
          setIssLastUpdated(new Date().toLocaleTimeString());
          return;
        }
      } catch {
        setIssPosition({
          latitude: 30.7333,
          longitude: 76.7794,
          timestamp: Date.now() / 1000,
          velocityKmH: 27580,
          altitudeKm: 418
        });
        setIssLastUpdated('Estimated Ephemeris');
      }
    } finally {
      setIsLoadingISS(false);
    }
  };

  useEffect(() => {
    fetchLiveISSPosition();
    const interval = setInterval(() => {
      fetchLiveISSPosition();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Filter events
  const filteredEvents = CELESTIAL_EVENTS.filter((ev) => {
    const matchesType = selectedType === 'all' || ev.type === selectedType;
    const matchesMonth = selectedMonth === 'all' || ev.date.startsWith(`2026-${selectedMonth}`) || ev.date.startsWith(`2027-${selectedMonth}`);
    return matchesType && matchesMonth;
  });

  const handleSelectEvent = (event: CelestialEvent) => {
    setActiveEvent(event);
  };

  // Filter constellations
  const filteredConstellations = CONSTELLATIONS_DATABASE.filter((c) => {
    const matchesSeason = constellationSeason === 'all' || c.season === constellationSeason;
    const matchesQuery =
      !constellationSearch.trim() ||
      c.name.toLowerCase().includes(constellationSearch.toLowerCase()) ||
      c.kanjiName.toLowerCase().includes(constellationSearch.toLowerCase()) ||
      c.brightestStar.toLowerCase().includes(constellationSearch.toLowerCase()) ||
      c.stars.some((s) => s.name.toLowerCase().includes(constellationSearch.toLowerCase()));
    return matchesSeason && matchesQuery;
  });

  const handleSelectConstellation = (c: ConstellationData) => {
    setActiveConstellation(c);
    celestialAudio.playKoto(1);
  };

  // Browser Notification API trigger
  const handleNotifyMe = async (event: CelestialEvent) => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser does not support notifications. Registered in samurai celestial ledger!');
      setTimeout(() => setNotificationStatus(null), 4000);
      return;
    }

    try {
      let perm = Notification.permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
      }

      if (perm === 'granted') {
        new Notification(`Tsukuyomi Watch: ${event.title}`, {
          body: `The Moon Rises Tonight at 8:14 PM. ${event.peakWindow} - Observe under favorable skies.`,
          icon: '/favicon.ico'
        });
        setNotificationStatus(`Alert armed! You will be heralded for "${event.title}".`);
      } else {
        setNotificationStatus(`Browser alerts muted. Event inscribed in celestial scroll: "The Moon Rises Tonight at 8:14 PM"`);
      }
    } catch {
      setNotificationStatus(`Event inscribed: "The Moon Rises Tonight at 8:14 PM".`);
    }

    setTimeout(() => {
      setNotificationStatus(null);
    }, 4500);
  };

  return (
    <div className="space-y-12">
      {/* ---------------- SECTION 1: SPACE EVENTS & ORBITAL VIGIL ---------------- */}
      <div className="space-y-8">
        {/* Scroll Title Header */}
        <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/35 bg-[#0e102e] p-6 lg:p-8 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono-tech tracking-wider text-[#d4af37]">
                <span>TENMON EMMAKI (天文絵巻)</span>
                <span>·</span>
                <span>CELESTIAL CHRONICLES</span>
                <span>·</span>
                <span className="text-[#c41e3a]">2026-2027 PHENOMENA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-bold text-slate-100 tracking-tight text-balance">
                The Celestial Scroll & Orbital Vigil
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl font-japanese">
                Synchronize your watches with the rhythm of the cosmos. Meteor torrents, lunar obscurations, solar coronas, and the high-speed orbital passes of the International Space Station.
              </p>
            </div>

            {/* Live ISS Widget Banner */}
            {issPosition && (
              <div className="bg-[#14173d] border border-[#d4af37]/40 rounded-lg p-4 space-y-2 shrink-0 max-w-xs shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-[#d4af37] animate-pulse" />
                    <span className="text-xs font-cinzel font-bold text-slate-200 uppercase tracking-wider">
                      ISS Live Orbit
                    </span>
                  </div>
                  <button
                    onClick={fetchLiveISSPosition}
                    disabled={isLoadingISS}
                    className="text-[10px] font-mono-tech text-slate-300 hover:text-[#d4af37] transition-colors"
                  >
                    {isLoadingISS ? 'Tracking...' : 'Refresh'}
                  </button>
                </div>

                <div className="text-xs space-y-1 font-mono-tech">
                  <div className="flex justify-between text-slate-400">
                    <span>Coordinates:</span>
                    <span className="text-slate-100 tabular-nums">
                      {issPosition.latitude.toFixed(2)}°, {issPosition.longitude.toFixed(2)}°
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Orbital Velocity:</span>
                    <span className="text-amber-300 tabular-nums">{issPosition.velocityKmH || 27600} km/h</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Altitude:</span>
                    <span className="text-emerald-400 tabular-nums">{issPosition.altitudeKm || 420} km</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Ribbon: Segmented Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#101233] p-3 rounded-lg border border-[#252856]">
          {/* Type Filter */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
              }`}
            >
              All Phenomena
            </button>
            <button
              onClick={() => setSelectedType('meteor')}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedType === 'meteor'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
              }`}
            >
              ☄️ Meteor Showers
            </button>
            <button
              onClick={() => setSelectedType('eclipse')}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedType === 'eclipse'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
              }`}
            >
              🌑 Eclipses
            </button>
            <button
              onClick={() => setSelectedType('moon')}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedType === 'moon'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
              }`}
            >
              🌕 Tsukimi & Phases
            </button>
            <button
              onClick={() => setSelectedType('iss')}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedType === 'iss'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
              }`}
            >
              🛰️ ISS Passes
            </button>
            <button
              onClick={() => setSelectedType('rocket')}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedType === 'rocket'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
              }`}
            >
              🚀 Rocket Launches
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            <CalendarIcon className="w-3.5 h-3.5 text-[#d4af37]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#090b22] border border-[#2d3166] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">All Lunar Mansions (Year Round)</option>
              <option value="08">葉月 (Hazuki - August 2026)</option>
              <option value="09">長月 (Nagatsuki - September 2026)</option>
              <option value="11">霜月 (Shimotsuki - November 2026)</option>
              <option value="12">師走 (Shiwasu - December 2026)</option>
              <option value="03">弥生 (Yayoi - March 2027)</option>
            </select>
          </div>
        </div>

        {/* Main Grid: Scroll Events List on Left, Active Event Lore & Alert on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Events List */}
          <div className="lg:col-span-7 space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center bg-[#0f1131] border border-[#252856] rounded-xl text-slate-400 text-xs">
                No celestial phenomena recorded under this specific lunar filter.
              </div>
            ) : (
              filteredEvents.map((event) => {
                const isSelected = activeEvent?.id === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => handleSelectEvent(event)}
                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1b193f] border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                        : 'bg-[#101233] border-[#252856] hover:border-[#383d78] hover:bg-[#14173d]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-400">
                          <span className="text-[#d4af37] font-semibold">{event.date}</span>
                          <span>·</span>
                          <span>{event.timeUtc}</span>
                          <span>·</span>
                          <span className="capitalize">{event.type}</span>
                        </div>

                        <h3 className="text-base font-cinzel font-bold text-slate-100 group-hover:text-[#d4af37] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-xs font-japanese text-[#d4af37]/80">
                          {event.titleKanji}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {event.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                        <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                          {Array.from({ length: event.visibilityRating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#d4af37] translate-x-1' : 'text-slate-600'}`} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Detail Pane & Notification Trigger */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101233] border border-[#d4af37]/40 rounded-xl p-6 space-y-6 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
              <div className="border-b border-[#252856] pb-4 space-y-1">
                <span className="text-[11px] font-mono-tech uppercase tracking-wider text-[#d4af37]">
                  Selected Phenomenon
                </span>
                <h2 className="text-xl font-cinzel font-bold text-slate-100">
                  {activeEvent.title}
                </h2>
                <p className="text-sm font-japanese text-[#d4af37]">
                  {activeEvent.titleKanji}
                </p>
              </div>

              {/* Observation Specs */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#252856]">
                  <span className="text-slate-400">Target Date:</span>
                  <span className="font-mono-tech text-slate-200 font-semibold">{activeEvent.date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#252856]">
                  <span className="text-slate-400">Peak Window:</span>
                  <span className="font-mono-tech text-amber-300 font-semibold">{activeEvent.peakWindow}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#252856]">
                  <span className="text-slate-400">Constellation Field:</span>
                  <span className="font-japanese text-slate-200">{activeEvent.constellation}</span>
                </div>
              </div>

              {/* Historical Samurai Lore Callout */}
              <div className="p-4 rounded-lg bg-[#181944] border border-[#d4af37]/35 space-y-2">
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#d4af37] uppercase">
                  <span>⚔️ Samurai Astronomical Lore</span>
                </div>
                <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                  "{activeEvent.samuraiLore}"
                </p>
              </div>

              {/* Notify Me Action Button */}
              <div className="space-y-2">
                <button
                  onClick={() => handleNotifyMe(activeEvent)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#c41e3a] hover:bg-[#a3182f] text-white font-cinzel font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors shadow-lg shadow-rose-950/40"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me: Alert & Inscribe Vigil</span>
                </button>
                <p className="text-[11px] text-center text-slate-400 font-mono-tech">
                  Triggers browser alert: "The Moon Rises Tonight at 8:14 PM"
                </p>
              </div>

              {notificationStatus && (
                <div className="flex items-start gap-2 p-3 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{notificationStatus}</span>
                </div>
              )}
            </div>

            {/* Traditional Japanese Lunar Months Legend */}
            <div className="bg-[#0f1131] border border-[#252856] rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-cinzel font-bold uppercase tracking-wider text-slate-200">
                The 12 Japanese Lunar Mansions (旧暦の月)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {lunarCalendarMonths.slice(6, 12).map((m) => (
                  <div key={m.monthNum} className="p-2 rounded bg-[#14173d] border border-[#252856]">
                    <span className="font-japanese text-[#d4af37] block font-semibold">{m.kanji}</span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">{m.roman}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 2: THE CONSTELLATIONS SCROLL (星座絵巻) ---------------- */}
      <div className="space-y-8 pt-8 border-t border-[#d4af37]/30">
        {/* Constellations Header */}
        <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/35 bg-[#0e102e] p-6 lg:p-8 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono-tech tracking-wider text-[#d4af37]">
                <span>SEIZA NO EMMAKI (星座絵巻)</span>
                <span>·</span>
                <span>STELLAR ASTERISMS</span>
                <span>·</span>
                <span className="text-[#c41e3a]">28 LUNAR MANSIONS & DEEP SKY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-slate-100 tracking-tight text-balance">
                Celestial Constellations & Star Atlases
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl font-japanese">
                Explore the foundational constellations of the samurai night sky. Detailed star catalogs, spectral classifications, coordinates, deep-sky nebulae, and historical battle lore.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setShowDoodlePad(!showDoodlePad);
                  celestialAudio.playKatanaSlash();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-cinzel font-bold tracking-wider transition-all shadow-lg ${
                  showDoodlePad
                    ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                    : 'bg-gradient-to-r from-[#181a49] to-[#0f1131] border-[#d4af37]/60 hover:border-[#d4af37] text-[#d4af37] hover:text-white'
                }`}
              >
                <Brush className="w-4 h-4" />
                <span>{showDoodlePad ? 'Hide Doodle Pad' : '🖌️ Doodle Constellation Oracle'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-200 bg-[#14173d] px-4 py-2.5 rounded-lg border border-[#252856] shrink-0">
                <Star className="w-4 h-4 text-[#d4af37]" />
                <span>{CONSTELLATIONS_DATABASE.length} Classical Constellations Cataloged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doodle Pad Interactive Section */}
        {showDoodlePad && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <ConstellationDoodlePad
              onConstellationIdentified={handleConstellationDoodled}
              onClose={() => setShowDoodlePad(false)}
            />
          </div>
        )}

        {/* Filter & Search Bar for Constellations */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#101233] p-3 rounded-lg border border-[#252856]">
          {/* Season Segmented Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
            {['all', 'Winter', 'Spring', 'Summer', 'Autumn', 'Circumpolar'].map((s) => (
              <button
                key={s}
                onClick={() => setConstellationSeason(s)}
                className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                  constellationSeason === s
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#181a44]'
                }`}
              >
                {s === 'all' ? 'All Seasons' : `${s}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={constellationSearch}
              onChange={(e) => setConstellationSearch(e.target.value)}
              placeholder="Search star or constellation (e.g. Betelgeuse, Orion, Subaru)..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#090b22] border border-[#2d3166] text-xs rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Constellations Grid & Inspection Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Constellations Card List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredConstellations.length === 0 ? (
              <div className="p-8 text-center bg-[#0f1131] border border-[#252856] rounded-xl text-slate-400 text-xs">
                No constellations matching "{constellationSearch}".
              </div>
            ) : (
              filteredConstellations.map((constellation) => {
                const isSelected = activeConstellation.id === constellation.id;
                return (
                  <button
                    key={constellation.id}
                    onClick={() => handleSelectConstellation(constellation)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                      isSelected
                        ? 'bg-[#1b193f] border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.22)]'
                        : 'bg-[#101233] border-[#252856] hover:border-[#383d78] hover:bg-[#14173d]'
                    }`}
                  >
                    {/* Constellation Mini Vector Diagram Preview */}
                    <div className="w-16 h-16 rounded-lg bg-[#07081a] border border-[#252856] flex items-center justify-center p-1 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4af37]">
                        {constellation.svgLines.map(([from, to], i) => (
                          <line
                            key={i}
                            x1={constellation.svgPoints[from].x}
                            y1={constellation.svgPoints[from].y}
                            x2={constellation.svgPoints[to].x}
                            y2={constellation.svgPoints[to].y}
                            stroke="rgba(212, 175, 55, 0.45)"
                            strokeWidth="1.5"
                          />
                        ))}
                        {constellation.svgPoints.map((pt, i) => (
                          <circle
                            key={i}
                            cx={pt.x}
                            cy={pt.y}
                            r={pt.mag === 1 ? 3.5 : 2}
                            fill={pt.mag === 1 ? '#fff' : '#d4af37'}
                          />
                        ))}
                      </svg>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-mono-tech text-slate-300">
                        <span className="text-[#d4af37] font-semibold">{constellation.season}</span>
                        <span>{constellation.quadrant}</span>
                      </div>
                      <h4 className="text-base font-cinzel font-bold text-slate-100 truncate">
                        {constellation.name}
                      </h4>
                      <p className="text-xs font-japanese text-slate-300 truncate">
                        {constellation.kanjiName}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono-tech text-slate-400 pt-1">
                        <span>Brightest: {constellation.brightestStar.split('(')[0]}</span>
                        <span>·</span>
                        <span>{constellation.stars.length} Stars</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 self-center transition-transform ${isSelected ? 'text-[#d4af37] translate-x-1' : 'text-slate-500'}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Right Constellation Complete Technical Chamber */}
          <div className="lg:col-span-7 space-y-6">
            <div id="constellation-chamber" className="bg-[#101233] border border-[#d4af37]/40 rounded-xl p-6 lg:p-7 space-y-6 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
              {/* Celebratory Doodle Deciphered Banner */}
              {doodleResult && doodleResult.constellation.id === activeConstellation.id && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#d4af37]/20 via-[#c41e3a]/15 to-transparent border border-[#d4af37]/60 flex items-start gap-3.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel font-bold text-amber-200 uppercase tracking-wide text-xs">
                          Deciphered from your Starlight Doodle
                        </span>
                        <span className="font-mono-tech px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-[10px]">
                          {doodleResult.confidence}% Confidence
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-tech text-slate-300">
                        {doodleResult.source === 'ai' ? 'Oracle Vision AI' : 'Heuristic Match'}
                      </span>
                    </div>
                    <p className="text-slate-200 font-serif italic text-xs leading-relaxed">
                      "{doodleResult.doodleAnalysis}"
                    </p>
                  </div>
                </div>
              )}

              {/* Header Title with Kanji */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252856] pb-4">
                <div>
                  <span className="text-[11px] font-mono-tech uppercase tracking-wider text-[#d4af37]">
                    {activeConstellation.season} Sky · {activeConstellation.latinName}
                  </span>
                  <h3 className="text-2xl font-cinzel font-bold text-slate-100 mt-0.5">
                    {activeConstellation.name}
                  </h3>
                  <p className="text-sm font-japanese text-[#d4af37] mt-0.5">
                    {activeConstellation.kanjiName}
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded bg-[#181944] border border-[#d4af37]/35 text-right">
                  <span className="text-[10px] font-mono-tech text-slate-300 block uppercase">Celestial Area</span>
                  <span className="text-sm font-mono-tech font-bold text-[#d4af37] tabular-nums">
                    {activeConstellation.areaSqDeg} sq. deg
                  </span>
                </div>
              </div>

              {/* Interactive Vector Star Chart Stage */}
              <div className="relative rounded-xl overflow-hidden border border-[#252856] bg-[#07081a] p-4 flex flex-col items-center">
                <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full max-w-sm">
                    {/* Interconnected constellation lines */}
                    {activeConstellation.svgLines.map(([from, to], i) => (
                      <line
                        key={i}
                        x1={activeConstellation.svgPoints[from].x}
                        y1={activeConstellation.svgPoints[from].y}
                        x2={activeConstellation.svgPoints[to].x}
                        y2={activeConstellation.svgPoints[to].y}
                        stroke="#d4af37"
                        strokeWidth="1.2"
                        strokeDasharray={from === 7 || to === 7 ? '2,2' : undefined}
                        className="opacity-70"
                      />
                    ))}

                    {/* Star vertices with glowing nodes */}
                    {activeConstellation.svgPoints.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={pt.mag === 1 ? 5 : pt.mag === 2 ? 3.5 : 2.5}
                          fill={pt.mag === 1 ? '#ffffff' : '#d4af37'}
                          className="drop-shadow-[0_0_8px_#d4af37]"
                        />
                        {pt.label && (
                          <text
                            x={pt.x + 3}
                            y={pt.y - 3}
                            fill="#cbd5e1"
                            fontSize="3.2"
                            fontFamily="Space Mono"
                            className="pointer-events-none select-none font-semibold"
                          >
                            {pt.label}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="w-full flex items-center justify-between text-[11px] font-mono-tech text-slate-400 pt-3 border-t border-[#252856]">
                  <span>Right Ascension: {activeConstellation.rightAscension}</span>
                  <span>Declination: {activeConstellation.declination}</span>
                  <span>Quadrant: {activeConstellation.quadrant}</span>
                </div>
              </div>

              {/* Samurai Lore Section */}
              <div className="p-4 rounded-xl bg-[#181944] border border-[#d4af37]/35 space-y-2">
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#d4af37] uppercase tracking-wide">
                  <span>⚔️ Samurai Astronomical Lore & Symbolism</span>
                </div>
                <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                  "{activeConstellation.samuraiLore}"
                </p>
              </div>

              {/* Primary Named Stars Catalog Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-cinzel font-bold uppercase tracking-wider text-slate-200">
                    Primary Stellar Catalog
                  </h4>
                  <span className="text-[10px] font-mono-tech text-slate-400">
                    Bayer / Flamsteed Classifications
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[#252856]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#14173d] text-slate-300 font-mono-tech uppercase text-[10px] border-b border-[#252856]">
                        <th className="py-2.5 px-3">Star Name</th>
                        <th className="py-2.5 px-3">Designation</th>
                        <th className="py-2.5 px-3">Spectral Classification</th>
                        <th className="py-2.5 px-3 text-right">Apparent Mag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252856]/80 bg-[#0c0d28]">
                      {activeConstellation.stars.map((star) => (
                        <tr key={star.name} className="hover:bg-[#151740] text-slate-300 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                            <span>{star.name}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono-tech text-slate-400 text-[11px]">
                            {star.designation}
                          </td>
                          <td className="py-2.5 px-3 text-amber-200/90 text-[11px]">
                            {star.spectralType}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono-tech font-bold tabular-nums text-slate-100">
                            {star.magnitude.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deep-Sky Targets (DSOs) in this Constellation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-cinzel font-bold uppercase tracking-wider text-slate-200">
                    Deep-Sky Objects (Nebulae & Clusters)
                  </h4>
                  <span className="text-[10px] font-mono-tech text-[#d4af37]">
                    Telescope Observation Targets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeConstellation.deepSkyTargets.map((dso) => (
                    <div
                      key={dso.catalogId}
                      className="p-3 rounded-lg bg-[#14173d] border border-[#252856] flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-100 block">
                          {dso.name}
                        </span>
                        <span className="text-[11px] text-slate-300 block font-serif">
                          {dso.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#090b22] border border-[#d4af37]/35 text-[#d4af37] shrink-0">
                        {dso.catalogId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
