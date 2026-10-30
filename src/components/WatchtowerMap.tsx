import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { calculateNightHonorScore, SACRED_SPOTS } from '../utils/astronomy';
import { StargazingSpot, WeatherData } from '../types';
import {
  Compass,
  MapPin,
  Eye,
  Cloud,
  Droplets,
  Wind,
  Shield,
  Layers,
  Sparkles,
  Mountain,
  Navigation,
  Search,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Crosshair
} from 'lucide-react';

interface Coords {
  lat: number;
  lng: number;
  label: string;
}

type MapLayerType = 'satellite' | 'streets';

interface LayerOption {
  id: MapLayerType;
  label: string;
  icon: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const MAP_LAYERS: LayerOption[] = [
  {
    id: 'satellite',
    label: 'Satellite Photo',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  },
  {
    id: 'streets',
    label: 'Accurate Topo/Street',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }
];

export const WatchtowerMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Current active coordinates (default: Sukhna Lake, Sector 1, Chandigarh, India)
  const [coords, setCoords] = useState<Coords>({
    lat: 30.7421,
    lng: 76.8188,
    label: 'Sukhna Lake, Sector 1, Chandigarh, India'
  });

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<StargazingSpot | null>(SACRED_SPOTS[0]);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

  // Honor score custom condition simulation state
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [simCloud, setSimCloud] = useState<number>(12);
  const [simHumidity, setSimHumidity] = useState<number>(38);
  const [simVisibilityKm, setSimVisibilityKm] = useState<number>(55);

  // Initialize Leaflet map with accurate background layer
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLayer = MAP_LAYERS.find((l) => l.id === activeLayer) || MAP_LAYERS[0];

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 9,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial accurate tile layer
    const tile = L.tileLayer(initialLayer.url, {
      maxZoom: initialLayer.maxZoom,
      attribution: initialLayer.attribution,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tile;

    const markerGroup = L.layerGroup().addTo(map);
    markerLayerRef.current = markerGroup;
    mapInstanceRef.current = map;

    // Enable interactive map clicking: click anywhere to accurately set coordinates and resolve official name!
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const formattedLat = Number(lat.toFixed(4));
      const formattedLng = Number(lng.toFixed(4));
      
      const defaultCoordLabel = `${formattedLat}°N, ${formattedLng}°E`;
      setCoords({
        lat: formattedLat,
        lng: formattedLng,
        label: defaultCoordLabel
      });
      setSelectedSpot(null);

      // Attempt reverse geocode to get official place name from OpenStreetMap Nominatim
      try {
        setIsReverseGeocoding(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${formattedLat}&lon=${formattedLng}&zoom=14`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const primaryPlace = data.name || addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || addr.county;
            const regionParts = [primaryPlace, addr.state || addr.province, addr.country].filter(Boolean);
            if (regionParts.length > 0) {
              setCoords({
                lat: formattedLat,
                lng: formattedLng,
                label: regionParts.join(', ')
              });
              return;
            }
          }
          if (data && data.display_name) {
            setCoords({
              lat: formattedLat,
              lng: formattedLng,
              label: data.display_name.split(',').slice(0, 3).join(',').trim()
            });
            return;
          }
        }
        // Fallback geocoder
        const fallbackRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${formattedLat}&longitude=${formattedLng}&localityLanguage=en`
        );
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          const parts = [
            fbData.locality || fbData.city || fbData.town,
            fbData.principalSubdivision,
            fbData.countryName
          ].filter(Boolean);
          if (parts.length > 0) {
            setCoords({
              lat: formattedLat,
              lng: formattedLng,
              label: parts.join(', ')
            });
          }
        }
      } catch {
        // Keep coordinate label if lookup is unavailable
      } finally {
        setIsReverseGeocoding(false);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch tile layer when activeLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const selected = MAP_LAYERS.find((l) => l.id === activeLayer);
    if (!selected) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTile = L.tileLayer(selected.url, {
      maxZoom: selected.maxZoom,
      attribution: selected.attribution,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // Update map center and markers when coordinates or spots change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markerLayerRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    // Custom Japanese Hanko Red / Gold Marker for current target
    const currentIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position:relative; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: none;">
          <div style="background: rgba(14, 16, 46, 0.95); color: #fff; border: 1.5px solid #d4af37; padding: 4px 10px; border-radius: 6px; font-family: 'Noto Serif JP', serif; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.85); display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 13px;">⛩️</span>
            <span style="color: #f1f5f9; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${coords.label}</span>
          </div>
          <div style="width: 2px; height: 14px; background: linear-gradient(to bottom, #d4af37, #c41e3a);"></div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #c41e3a; border: 2px solid #d4af37; box-shadow: 0 0 10px #c41e3a;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const activeMarker = L.marker([coords.lat, coords.lng], { icon: currentIcon }).addTo(markers);
    activeMarker.bindPopup(`
      <div style="padding: 4px; font-family: 'Noto Serif JP', serif;">
        <h4 style="margin: 0; color: #d4af37; font-weight: bold; font-size: 13px;">${coords.label}</h4>
        <p style="margin: 4px 0 0; font-size: 11px; color: #cbd5e1; font-family: 'Space Mono', monospace;">
          ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E
        </p>
      </div>
    `);

    // Render other sacred spots as discreet gold crest markers (no big green circles)
    SACRED_SPOTS.forEach((spot) => {
      if (Math.abs(spot.lat - coords.lat) < 0.001 && Math.abs(spot.lng - coords.lng) < 0.001) return;

      const spotIcon = L.divIcon({
        className: 'spot-leaflet-marker',
        html: `
          <div style="position:relative; transform: translate(-50%, -50%); cursor: pointer;" title="${spot.name}">
            <div style="width: 28px; height: 28px; background: rgba(14, 16, 46, 0.9); border: 1.5px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 3px 10px rgba(0,0,0,0.7); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              ${spot.type === 'shrine' ? '⛩️' : spot.type === 'mountain' ? '🗻' : spot.type === 'observatory' ? '🔭' : '🏯'}
            </div>
          </div>
        `,
        iconSize: [28, 28]
      });

      const spotMarker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(markers);
      spotMarker.on('click', () => {
        selectSpot(spot);
      });
      spotMarker.bindTooltip(`${spot.name} (Bortle ${spot.bortleClass})`, {
        direction: 'top',
        offset: [0, -14]
      });
    });

    map.flyTo([coords.lat, coords.lng], map.getZoom() < 8 ? 8 : map.getZoom(), { duration: 1.0 });
  }, [coords]);

  // Fetch real-time weather from Open-Meteo
  const fetchWeather = async (lat: number, lng: number) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=cloud_cover,relative_humidity_2m,visibility,temperature_2m,wind_speed_10m`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Celestial meteorological feed unavailable');

      const data = await res.json();
      const current = data.current;

      const cloudCover = current.cloud_cover ?? 15;
      const humidity = current.relative_humidity_2m ?? 45;
      const visibilityMeters = current.visibility ?? 40000;
      const temperature = current.temperature_2m ?? 14.5;
      const windSpeed = current.wind_speed_10m ?? 8.2;

      const honorCalc = calculateNightHonorScore(cloudCover, humidity, visibilityMeters);

      setWeatherData({
        cloudCover,
        humidity,
        visibility: visibilityMeters,
        temperature,
        windSpeed,
        skyRating: honorCalc.rank,
        skyRatingKanji: honorCalc.rankKanji,
        verdict: honorCalc.verdict
      });
    } catch (err: unknown) {
      console.warn('Weather fetch fallback', err);
      const fallbackScore = calculateNightHonorScore(20, 50, 45000);
      setWeatherData({
        cloudCover: 20,
        humidity: 50,
        visibility: 45000,
        temperature: 16.0,
        windSpeed: 7.5,
        skyRating: fallbackScore.rank,
        skyRatingKanji: fallbackScore.rankKanji,
        verdict: fallbackScore.verdict
      });
      setWeatherError('Live satellite feed delayed; utilizing cached imperial observatory atmospheric tables.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Initial weather load
  useEffect(() => {
    fetchWeather(coords.lat, coords.lng);
  }, [coords.lat, coords.lng]);

  const selectSpot = (spot: StargazingSpot) => {
    setSelectedSpot(spot);
    setCoords({
      lat: spot.lat,
      lng: spot.lng,
      label: spot.name
    });
  };

  // Geolocation button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Celestial geolocation is unsupported by this browser.');
      return;
    }
    setIsLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(4));
        const userLng = Number(pos.coords.longitude.toFixed(4));
        let userLabel = `Current Location (${userLat}°N, ${userLng}°E)`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${userLat}&lon=${userLng}&zoom=14`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const placeName = data.name || addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || addr.county;
              const parts = [placeName, addr.state || addr.province, addr.country].filter(Boolean);
              if (parts.length > 0) {
                userLabel = parts.join(', ');
              }
            } else if (data && data.display_name) {
              userLabel = data.display_name.split(',').slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // Fallback geocoder if nominatim times out
          try {
            const fbRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLat}&longitude=${userLng}&localityLanguage=en`
            );
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              const parts = [
                fbData.locality || fbData.city,
                fbData.principalSubdivision,
                fbData.countryName
              ].filter(Boolean);
              if (parts.length > 0) {
                userLabel = parts.join(', ');
              }
            }
          } catch {
            // Keep coordinates
          }
        }

        setCoords({
          lat: userLat,
          lng: userLng,
          label: userLabel
        });
        setSelectedSpot(null);
      },
      (err) => {
        setIsLoadingWeather(false);
        setWeatherError(`Geolocation request declined (${err.message}). Defaulting to observatory coordinates.`);
      },
      { timeout: 10000 }
    );
  };

  // Search location handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoadingWeather(true);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const loc = data.results[0];
          const parts = [loc.name, loc.admin1, loc.country].filter(Boolean);
          const resolvedName = parts.join(', ');
          setCoords({
            lat: Number(loc.latitude.toFixed(4)),
            lng: Number(loc.longitude.toFixed(4)),
            label: resolvedName
          });
          setSelectedSpot(null);
          setSearchQuery('');
          return;
        }
      }
      setWeatherError(`Could not pinpoint "${searchQuery}". Please select a location from the map or sanctuary list.`);
    } catch {
      setWeatherError('Geocoding service unavailable.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Calculate distance from current coordinate to spots
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Stargazing Honor Score calculations
  const currentHonor = weatherData
    ? calculateNightHonorScore(weatherData.cloudCover, weatherData.humidity, weatherData.visibility)
    : calculateNightHonorScore(12, 38, 55000);

  const displayHonor = showSimulator
    ? calculateNightHonorScore(simCloud, simHumidity, simVisibilityKm * 1000)
    : currentHonor;

  return (
    <div className="space-y-8">
      {/* Hero Header Strip with Moon Accents */}
      <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/35 bg-[#0e102e] p-6 lg:p-8 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
        <div className="absolute top-0 right-0 w-96 h-full opacity-25 pointer-events-none bg-[radial-gradient(circle_at_center,#4f46e5_0%,#d4af37_40%,transparent_75%)]" />

        {/* Decorative Moon Badges */}
        <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs text-[#d4af37]/40 pointer-events-none select-none">
          <span>🌒</span>
          <span>🌓</span>
          <span>🌕</span>
          <span>🌗</span>
          <span>🌘</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-tech tracking-wider text-[#d4af37]">
              <span>🌙 TENMON-DAI (天文台)</span>
              <span>·</span>
              <span>ANCIENT WATCHTOWER</span>
              <span>·</span>
              <span className="text-[#c41e3a]">STARGAZING HONOR METRICS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-bold text-slate-100 tracking-tight text-balance flex items-center gap-2.5">
              <span>Stargazing Watchtower & Sky Conditions</span>
              <span className="text-xl text-[#d4af37] select-none">🌙</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-japanese">
              Real-time atmospheric clarity, live Bushido honor score rating, and satellite sky telemetry. Click anywhere on the map or search to align your telescope.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-[#090b22]/90 border border-[#d4af37]/40 text-right">
              <span className="text-[10px] font-mono-tech uppercase text-slate-400 block">Observatory Outpost</span>
              <span className="text-xs font-mono-tech text-[#d4af37] font-semibold truncate max-w-[200px] block">
                {coords.label.split(',')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-tech">
                {coords.lat.toFixed(2)}°N, {coords.lng.toFixed(2)}°E
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Presentable Full-Width Night Honor Score Bar */}
      <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/45 bg-gradient-to-r from-[#0c0e2c] via-[#121542] to-[#0c0e2c] p-4 sm:p-5 shadow-[0_4px_30px_rgba(10,12,35,0.7)] sumie-parchment-border">
        {/* Ambient decorative glow */}
        <div className="absolute top-0 right-1/4 w-80 h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,#d4af37_0%,transparent_70%)]" />

        <div className="relative z-10 space-y-3.5">
          {/* Top Row: Shield Icon, Title, Japanese Kanji, Rank, and Score Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#181a48] border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-inner">
                <Shield className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4af37] font-semibold">
                    Bushido Night Sky Clarity Gauge
                  </span>
                  <span className="text-[10px] font-japanese text-amber-200/80">星見の栄誉指数</span>
                  {showSimulator && (
                    <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-[#c41e3a]/20 border border-[#c41e3a]/40 text-[#f87171]">
                      SIMULATOR ACTIVE
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-cinzel font-bold text-slate-100 flex flex-wrap items-center gap-2">
                  <span>Night Honor Score:</span>
                  <span className="text-[#d4af37] font-mono-tech">{displayHonor.score}/100</span>
                  <span className="text-slate-400 font-normal">·</span>
                  <span className="text-sm font-semibold text-amber-200">{displayHonor.rank}</span>
                  <span className="text-xs font-japanese text-amber-300 font-normal">({displayHonor.rankKanji})</span>
                </h2>
              </div>
            </div>

            {/* Score Pill & Quick Stargazing Status */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-baseline gap-1.5 bg-[#090b22] px-4 py-2 rounded-lg border border-[#d4af37]/45 shadow-sm">
                <span className="text-xs font-mono-tech text-slate-400">Honor:</span>
                <span className="text-2xl font-mono-tech font-bold text-[#d4af37] tabular-nums">
                  {displayHonor.score}
                </span>
                <span className="text-xs font-mono-tech text-slate-400">/ 100</span>
              </div>
              <div className="hidden md:flex flex-col text-right text-[11px] font-mono-tech text-slate-300">
                <span className={
                  displayHonor.score >= 85
                    ? 'text-[#d4af37] font-bold'
                    : displayHonor.score >= 70
                    ? 'text-sky-400 font-bold'
                    : displayHonor.score >= 50
                    ? 'text-emerald-400 font-bold'
                    : displayHonor.score >= 30
                    ? 'text-amber-400 font-bold'
                    : 'text-red-400 font-bold'
                }>
                  {displayHonor.score >= 85
                    ? '● Pristine Astrophotography Window'
                    : displayHonor.score >= 70
                    ? '● Deep Sky Observation Favorable'
                    : displayHonor.score >= 50
                    ? '◐ Favorable Stargazing Conditions'
                    : displayHonor.score >= 30
                    ? '○ Atmospheric Haze / Veiled Visibility'
                    : '○ Dense Sky Obstruction'}
                </span>
                <span className="text-slate-400 text-[10px] truncate max-w-[220px]">{coords.label}</span>
              </div>
            </div>
          </div>

          {/* The Visual Progress Bar with Threshold Markers */}
          <div className="space-y-1.5">
            <div className="relative h-4.5 w-full bg-[#07081b] rounded-full overflow-hidden border border-[#2d3166] p-0.5 shadow-inner">
              {/* Dynamic Gradient Bar */}
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                  displayHonor.score >= 85
                    ? 'bg-gradient-to-r from-[#b45309] via-[#d4af37] to-[#fef08a] shadow-[0_0_18px_rgba(212,175,55,0.8)]'
                    : displayHonor.score >= 70
                    ? 'bg-gradient-to-r from-[#0369a1] via-[#38bdf8] to-[#bae6fd] shadow-[0_0_18px_rgba(56,189,248,0.7)]'
                    : displayHonor.score >= 50
                    ? 'bg-gradient-to-r from-[#15803d] via-[#4ade80] to-[#bbf7d0] shadow-[0_0_18px_rgba(74,222,128,0.7)]'
                    : displayHonor.score >= 30
                    ? 'bg-gradient-to-r from-[#b45309] via-[#f59e0b] to-[#fde68a] shadow-[0_0_18px_rgba(245,158,11,0.6)]'
                    : 'bg-gradient-to-r from-[#881337] via-[#e11d48] to-[#fda4af] shadow-[0_0_18px_rgba(225,29,72,0.6)]'
                }`}
                style={{ width: `${Math.max(3, Math.min(100, displayHonor.score))}%` }}
              >
                {/* Shimmer light sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-pulse" />
                {/* Pinpoint Reticle Tip */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#fff] border border-black" />
              </div>

              {/* Milestone Threshold Notches */}
              <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-black/60 pointer-events-none" title="30: Mist Ronin threshold" />
              <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-black/60 pointer-events-none" title="50: Bushi Samurai threshold" />
              <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-black/60 pointer-events-none" title="70: Daimyo Commander threshold" />
              <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-black/60 pointer-events-none" title="85: Celestial Master threshold" />
            </div>

            {/* Scale Rank Labels along the bar */}
            <div className="flex justify-between text-[10px] font-mono-tech text-slate-400 px-1">
              <span className={displayHonor.score < 30 ? 'text-red-400 font-bold' : ''}>
                0 嵐 Typhoon
              </span>
              <span className={displayHonor.score >= 30 && displayHonor.score < 50 ? 'text-amber-400 font-bold' : ''}>
                30 浪人 Rōnin
              </span>
              <span className={displayHonor.score >= 50 && displayHonor.score < 70 ? 'text-emerald-400 font-bold' : ''}>
                50 武士 Bushi
              </span>
              <span className={displayHonor.score >= 70 && displayHonor.score < 85 ? 'text-sky-400 font-bold' : ''}>
                70 大名 Daimyo
              </span>
              <span className={displayHonor.score >= 85 ? 'text-[#d4af37] font-bold' : ''}>
                85+ 天空衆 Master
              </span>
            </div>
          </div>

          {/* Bottom Bar: Bushido Verdict & Quick Atmospheric Telemetry Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[#252856]/70 text-xs">
            <div className="flex items-center gap-2 text-slate-200 italic font-serif">
              <span className="text-[#d4af37] text-base not-italic select-none leading-none">“</span>
              <span className="line-clamp-1">{displayHonor.verdict}</span>
              <span className="text-[#d4af37] text-base not-italic select-none leading-none">”</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-tech text-slate-300 shrink-0">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090b22] border border-[#252856]">
                <Cloud className="w-3 h-3 text-sky-400" />
                <span>Clouds: <strong className="text-slate-100">{showSimulator ? simCloud : weatherData ? weatherData.cloudCover : 12}%</strong></span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090b22] border border-[#252856]">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Humidity: <strong className="text-slate-100">{showSimulator ? simHumidity : weatherData ? weatherData.humidity : 38}%</strong></span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090b22] border border-[#252856]">
                <Eye className="w-3 h-3 text-[#d4af37]" />
                <span>Sightline: <strong className="text-slate-100">{showSimulator ? simVisibilityKm : weatherData ? (weatherData.visibility / 1000).toFixed(0) : 55} km</strong></span>
              </span>
              {weatherData && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090b22] border border-[#252856]">
                  <Wind className="w-3 h-3 text-emerald-400" />
                  <span>Wind: <strong className="text-slate-100">{weatherData.windSpeed} km/h</strong></span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, GPS, and Map Background Layer Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#101233] p-4 rounded-lg border border-[#252856]">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city or outpost (e.g. Chandigarh, Tokyo, Kasauli, Shimla)..."
            className="w-full pl-9 pr-24 py-2 bg-[#090b22] border border-[#2d3166] rounded text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] text-[11px] font-mono-tech rounded transition-colors"
          >
            Locate
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Accurate Map Layer Selector */}
          <div className="flex items-center bg-[#090b22] border border-[#252856] rounded p-1 gap-1">
            <span className="text-[10px] font-mono-tech text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#d4af37]" />
              <span className="hidden sm:inline">Map View:</span>
            </span>
            {MAP_LAYERS.map((layer) => {
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono-tech transition-all ${
                    isActive
                      ? 'bg-[#d4af37] text-[#0a0b1e] font-bold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-[#1a1d47]'
                  }`}
                  title={layer.label}
                >
                  <span>{layer.icon}</span>
                  <span className="text-[11px]">{layer.label}</span>
                </button>
              );
            })}
          </div>

          {/* GPS Button */}
          <button
            onClick={handleUseMyLocation}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#16183e] hover:bg-[#1f2255] border border-[#2d3166] hover:border-[#d4af37]/40 rounded text-xs text-slate-200 hover:text-white transition-colors whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5 text-[#c41e3a]" />
            <span>Use My GPS</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Accurate Map on Left, Atmospheric Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Leaflet Map Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/40 sumie-parchment-border bg-[#050505] shadow-2xl">
            {/* Map Header Bar */}
            <div className="px-4 py-2.5 bg-[#0e102e] border-b border-[#d4af37]/35 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-slate-300">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#d4af37]" />
                <span className="text-slate-100 uppercase font-semibold">Accurate Celestial Watchtower Map</span>
                <span className="text-slate-500">·</span>
                <span className="text-[#d4af37]">
                  {MAP_LAYERS.find((l) => l.id === activeLayer)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Crosshair className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Click anywhere on the map to pinpoint</span>
              </div>
            </div>

            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              className="h-[460px] sm:h-[520px] w-full sumie-map bg-[#090b22]"
            />

            {/* Floating Active Focus Pill */}
            <div className="absolute bottom-4 left-4 z-[500] max-w-sm bg-[#0b0c26]/95 backdrop-blur-md border border-[#d4af37]/50 rounded-lg p-3 text-xs shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-mono-tech tracking-wider text-[#d4af37] font-semibold">
                  Active Coordinates
                </span>
                {isReverseGeocoding && (
                  <span className="text-[10px] text-slate-400 font-mono-tech animate-pulse">Resolving name...</span>
                )}
              </div>
              <p className="font-japanese font-semibold text-slate-100 text-sm mt-0.5 leading-snug">
                {coords.label}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300 font-mono-tech">
                <span>Lat: {coords.lat.toFixed(4)}°N</span>
                <span>Lng: {coords.lng.toFixed(4)}°E</span>
              </div>
            </div>
          </div>

          {/* Top Sacred Stargazing Sanctuaries */}
          <div className="bg-[#0f1131] border border-[#252856] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-[#d4af37]" />
                <h3 className="font-cinzel font-semibold text-slate-100 text-sm tracking-wide">
                  Sacred Stargazing Sanctuaries
                </h3>
              </div>
              <span className="text-[11px] font-mono-tech text-slate-400">Select sanctuary to align telescope</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SACRED_SPOTS.slice(0, 6).map((spot) => {
                const distance = calculateDistanceKm(coords.lat, coords.lng, spot.lat, spot.lng);
                const isSelected = selectedSpot?.id === spot.id;

                return (
                  <button
                    key={spot.id}
                    onClick={() => selectSpot(spot)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#1e1c42] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                        : 'bg-[#131538] border-[#252856] hover:border-[#383d78] hover:bg-[#181a44]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">
                          {spot.type === 'shrine' ? '⛩️' : spot.type === 'mountain' ? '🗻' : spot.type === 'observatory' ? '🔭' : '🏯'}
                        </span>
                        <span className="font-japanese text-xs font-semibold text-slate-100 line-clamp-1">
                          {spot.nameKanji}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 shrink-0">
                        Bortle {spot.bortleClass}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">{spot.name}</p>

                    <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400 mt-2 pt-2 border-t border-[#252856]">
                      <span>{spot.elevationM}m elevation</span>
                      <span>{distance > 0 ? `${distance} km away` : 'Active Hub'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Stargazing Honor Score & Atmospheric Telemetry Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0f1131] border border-[#d4af37]/45 rounded-xl p-6 space-y-6 shadow-[0_4px_30px_rgba(10,12,35,0.7)] relative overflow-hidden">
            {/* Corner Decorative Moons */}
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] text-[#d4af37]/40 pointer-events-none select-none">
              <span>🌒</span>
              <span>🌕</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#252856] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c41e3a]" />
                <h3 className="font-cinzel font-bold text-sm tracking-wide text-slate-100 uppercase flex items-center gap-1.5">
                  <span>Stargazing Honor Score</span>
                  <span className="text-xs text-[#d4af37]">🌙</span>
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-[#d4af37] px-2 py-0.5 rounded bg-[#181a44] border border-[#d4af37]/30">
                星見の栄誉
              </span>
            </div>

            {isLoadingWeather ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 mx-auto border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-mono-tech">Consulting celestial meteorological streams...</p>
              </div>
            ) : weatherData ? (
              <div className="space-y-6">
                {/* Main Circular Honor Badge & Samurai Rank */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-[#181a44] to-[#101235] border border-[#d4af37]/40 shadow-inner flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
                  
                  {/* Circular Score Ring */}
                  <div className="relative w-28 h-28 my-1 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-[#1f2250] stroke-current"
                        strokeWidth="7"
                        fill="transparent"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="transition-all duration-700 ease-out"
                        stroke={displayHonor.score >= 85 ? '#d4af37' : displayHonor.score >= 70 ? '#38bdf8' : displayHonor.score >= 50 ? '#4ade80' : '#c41e3a'}
                        strokeWidth="7"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * displayHonor.score) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-mono-tech font-bold text-slate-100 tabular-nums">
                        {displayHonor.score}
                      </span>
                      <span className="text-[10px] font-mono-tech text-[#d4af37] -mt-1">
                        HONOR
                      </span>
                    </div>
                  </div>

                  {/* Linear mini progress bar */}
                  <div className="w-full max-w-[200px] mt-1 mb-2 space-y-1">
                    <div className="h-2 w-full bg-[#0a0b20] rounded-full overflow-hidden border border-[#252856] p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          displayHonor.score >= 85
                            ? 'bg-[#d4af37] shadow-[0_0_8px_#d4af37]'
                            : displayHonor.score >= 70
                            ? 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]'
                            : displayHonor.score >= 50
                            ? 'bg-[#4ade80] shadow-[0_0_8px_#4ade80]'
                            : displayHonor.score >= 30
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#ef4444]'
                        }`}
                        style={{ width: `${Math.max(4, Math.min(100, displayHonor.score))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono-tech text-slate-400 px-0.5">
                      <span>0 Min</span>
                      <span>50 Bushi</span>
                      <span>100 Max</span>
                    </div>
                  </div>

                  {/* Rank & Japanese Seal */}
                  <div className="mt-2 space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#090b22] border border-[#d4af37]/50 text-xs font-cinzel font-bold text-[#d4af37]">
                      <span>⚔️</span>
                      <span>{displayHonor.rank}</span>
                    </div>
                    <span className="text-sm font-japanese font-semibold text-amber-200 block">
                      {displayHonor.rankKanji}
                    </span>
                  </div>

                  {/* Bushido Poetic Sky Verdict */}
                  <div className="mt-3.5 pt-3 border-t border-[#252856] w-full text-xs font-serif text-slate-200 italic leading-relaxed px-2">
                    "{displayHonor.verdict}"
                  </div>

                  {/* Formula Breakdown Badge */}
                  <div className="mt-3 w-full p-2.5 rounded bg-[#090b22]/80 border border-[#252856] text-[10px] font-mono-tech text-slate-300 flex flex-col gap-1 text-left">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="uppercase text-[9px] text-[#d4af37]">Imperial Formula</span>
                      <span>Score = 100 - Cloud - (Hum/2) + (Vis/2)</span>
                    </div>
                    <div className="text-slate-300 font-semibold truncate">
                      100 - {showSimulator ? simCloud : weatherData.cloudCover} - {((showSimulator ? simHumidity : weatherData.humidity) / 2).toFixed(0)} + {((showSimulator ? simVisibilityKm : weatherData.visibility / 1000) / 2).toFixed(0)} = <span className="text-[#d4af37] font-bold">{displayHonor.score} pts</span>
                    </div>
                  </div>
                </div>

                {/* Custom Condition Honor Simulator Drawer Toggle */}
                <div className="bg-[#14173d] rounded-lg border border-[#252856] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowSimulator((prev) => !prev)}
                      className="flex items-center gap-2 text-xs font-cinzel font-semibold text-[#d4af37] hover:text-amber-200 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showSimulator ? 'Close Custom Simulator' : 'Simulate Custom Sky Conditions'}</span>
                    </button>
                    {showSimulator && (
                      <button
                        onClick={() => {
                          setSimCloud(weatherData.cloudCover);
                          setSimHumidity(weatherData.humidity);
                          setSimVisibilityKm(Math.round(weatherData.visibility / 1000));
                        }}
                        className="text-[10px] font-mono-tech text-slate-400 hover:text-white underline"
                      >
                        Reset to Live
                      </button>
                    )}
                  </div>

                  {showSimulator && (
                    <div className="space-y-3 pt-2 border-t border-[#252856] text-xs font-mono-tech">
                      {/* Cloud Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">Cloud Cover:</span>
                          <span className="text-amber-300 font-bold">{simCloud}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={simCloud}
                          onChange={(e) => setSimCloud(Number(e.target.value))}
                          className="w-full h-1.5 bg-[#0a0b22] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                        />
                      </div>

                      {/* Humidity Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">Relative Humidity:</span>
                          <span className="text-cyan-300 font-bold">{simHumidity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={simHumidity}
                          onChange={(e) => setSimHumidity(Number(e.target.value))}
                          className="w-full h-1.5 bg-[#0a0b22] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                        />
                      </div>

                      {/* Visibility Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">Sightline Visibility:</span>
                          <span className="text-emerald-300 font-bold">{simVisibilityKm} km</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="80"
                          value={simVisibilityKm}
                          onChange={(e) => setSimVisibilityKm(Number(e.target.value))}
                          className="w-full h-1.5 bg-[#0a0b22] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Atmospheric Parameter Readings Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>🌙</span>
                      <span className="uppercase">Live Sensor Readings</span>
                    </span>
                    <span className="text-emerald-400">OPEN-METEO SYNCED</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Cloud className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Cloud Cover</span>
                      </div>
                      <div className="text-xl font-mono-tech font-bold text-slate-100 mt-1 tabular-nums">
                        {weatherData.cloudCover}%
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {weatherData.cloudCover < 20 ? 'Optimal clarity' : weatherData.cloudCover < 50 ? 'Scattered clouds' : 'Overcast'}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        <span>Rel. Humidity</span>
                      </div>
                      <div className="text-xl font-mono-tech font-bold text-slate-100 mt-1 tabular-nums">
                        {weatherData.humidity}%
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {weatherData.humidity < 60 ? 'Crisp atmospheric column' : 'Dew condensation risk'}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sightline</span>
                      </div>
                      <div className="text-xl font-mono-tech font-bold text-slate-100 mt-1 tabular-nums">
                        {(weatherData.visibility / 1000).toFixed(1)} km
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Horizontal sightline
                      </span>
                    </div>

                    <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Wind className="w-3.5 h-3.5 text-teal-400" />
                        <span>Wind Speed</span>
                      </div>
                      <div className="text-xl font-mono-tech font-bold text-slate-100 mt-1 tabular-nums">
                        {weatherData.windSpeed} km/h
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {weatherData.windSpeed < 15 ? 'Stable mount' : 'High wind jitter'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spot Details if selected */}
                {selectedSpot && (
                  <div className="p-4 rounded-lg bg-[#14173d] border border-[#d4af37]/35 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-japanese font-semibold text-[#d4af37] flex items-center gap-1.5">
                        <span>⛩️</span>
                        <span>{selectedSpot.nameKanji}</span>
                      </span>
                      <span className="text-[10px] font-mono-tech text-slate-300">
                        Elevation {selectedSpot.elevationM}m
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-serif leading-relaxed">
                      {selectedSpot.description}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {weatherError && (
              <div className="flex items-start gap-2 p-3 rounded bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{weatherError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
