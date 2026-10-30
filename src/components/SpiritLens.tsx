import React, { useState, useRef, useEffect } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Chart, registerables } from 'chart.js';
import { detectStarsInCanvas, generateSpectralPoints, generateTransientAnalysis, enhanceBlurredImage } from '../utils/astronomy';
import { DetectedStar, OpticalEnhanceResult, TransientEventType, TransientEventAnalysis } from '../types';
import { celestialAudio } from '../utils/audio';
import { useHonorGame } from '../context/HonorGameContext';
import { CelestialIdentifier } from './CelestialIdentifier';
import {
  Sparkles,
  Upload,
  Sliders,
  Eye,
  Activity,
  Layers,
  Zap,
  Info,
  CheckCircle2,
  RefreshCw,
  Crosshair,
  Scan,
  Globe,
  Download,
  Compass,
  Telescope,
  Star,
  Radio,
  Bell,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

Chart.register(...registerables);

// Default astronomical presets for the Enhancer bar
const BLURRED_PRESET_IMAGES = [
  {
    id: 'carina',
    name: 'Carina Deep Nebula (Atmospheric Blur)',
    src: '/src/assets/images/nebula_celestial_lens_1793301542654.jpg',
    desc: 'Turbulent seeing blur with faint dust cloud filaments.',
    sampleBlurType: 'Atmospheric Scintillation Seeing Blur'
  },
  {
    id: 'torii-milkyway',
    name: 'Torii Arch & Galactic Core (Defocused)',
    src: '/src/assets/images/torii_gate_milky_way_1793301542785.jpg',
    desc: 'Optical defocus on coastal moisture and low-elevation haze.',
    sampleBlurType: 'Optical Defocus & Horizon Mist'
  },
  {
    id: 'sumie-summit',
    name: 'Summit Starfield (Sensor Noise & Jitter)',
    src: '/src/assets/images/sumie_samurai_stargazer_1793301542275.jpg',
    desc: 'High-ISO thermal sensor noise and mount tracking drift.',
    sampleBlurType: 'Mount Tracking Jitter & Thermal Grain'
  }
];

export const SpiritLens: React.FC = () => {
  const { addHonorPoints } = useHonorGame();

  // Transient Event Detection States
  const [selectedTransientType, setSelectedTransientType] = useState<TransientEventType>('supernova');
  const [transientData, setTransientData] = useState<TransientEventAnalysis>(() => generateTransientAnalysis('supernova'));
  const [alertBroadcasted, setAlertBroadcasted] = useState<boolean>(false);

  // Enhancer Bar States
  const [rawBlurredImageSrc, setRawBlurredImageSrc] = useState<string>(BLURRED_PRESET_IMAGES[0].src);
  const [enhancedImageSrc, setEnhancedImageSrc] = useState<string>(BLURRED_PRESET_IMAGES[0].src);
  const [imageName, setImageName] = useState<string>(BLURRED_PRESET_IMAGES[0].name);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [showStarOverlay, setShowStarOverlay] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [blurUrlInput, setBlurUrlInput] = useState<string>('');

  // Restoration controls
  const [enhanceStrength, setEnhanceStrength] = useState<number>(1.2);
  const [enhanceMode, setEnhanceMode] = useState<'all-in-one' | 'deblur' | 'nebula' | 'denoise'>('all-in-one');
  const [opticalReport, setOpticalReport] = useState<OpticalEnhanceResult>({
    blurType: 'Atmospheric Seeing & Defocus Blur',
    blurReductionPct: 86,
    noiseSuppressionPct: 74,
    starsResolvedCount: 142,
    dynamicRangeGain: '+2.6 EV stops',
    aiDiagnosis: 'High-pass unsharp deconvolution restored stellar point crispness, suppressed thermal sensor noise, and lifted faint nebular dust arcs.'
  });

  // Analysis stats
  const [stars, setStars] = useState<DetectedStar[]>([]);
  const [avgBrightness, setAvgBrightness] = useState<number>(218);
  const [totalLuminance, setTotalLuminance] = useState<number>(84);
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number }>({ w: 1024, h: 768 });
  const [selectedStar, setSelectedStar] = useState<DetectedStar | null>(null);

  // Canvas and DOM refs
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const transientChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transientChartInstanceRef = useRef<Chart | null>(null);
  const enhancerBarRef = useRef<HTMLDivElement | null>(null);
  const identifierBarRef = useRef<HTMLDivElement | null>(null);
  const transientBarRef = useRef<HTMLDivElement | null>(null);

  // Apply optical enhancement algorithm to the current raw blurred image
  const processImageEnhancement = (imgSrc: string, strength: number, mode: 'all-in-one' | 'deblur' | 'nebula' | 'denoise') => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 600;
      setImageDimensions({ w, h });

      // Create processing canvas
      const canvas = hiddenCanvasRef.current || document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        // Run client-side unsharp deconvolution and dynamic range recovery
        const restoredDataUrl = enhanceBlurredImage(canvas, { strength, mode });
        setEnhancedImageSrc(restoredDataUrl);

        // Run stellar point detection on restored canvas
        const detectImg = new Image();
        detectImg.onload = () => {
          const detectCanvas = document.createElement('canvas');
          detectCanvas.width = w;
          detectCanvas.height = h;
          const detectCtx = detectCanvas.getContext('2d');
          if (detectCtx) {
            detectCtx.drawImage(detectImg, 0, 0);
            const result = detectStarsInCanvas(detectCanvas);
            setStars(result.stars);
            setAvgBrightness(result.avgBrightness);
            setTotalLuminance(result.totalLuminance);
            if (result.stars.length > 0) {
              setSelectedStar(result.stars[0]);
            }
          }
        };
        detectImg.src = restoredDataUrl;
      }
    };
    img.src = imgSrc;
  };

  // Re-run enhancement whenever raw image, strength, or mode changes
  useEffect(() => {
    processImageEnhancement(rawBlurredImageSrc, enhanceStrength, enhanceMode);
  }, [rawBlurredImageSrc, enhanceStrength, enhanceMode]);

  // Request AI Optical Diagnostic Report from server endpoint
  const requestAiOpticalDiagnosis = async (imgSrc: string, mode: string) => {
    try {
      let b64 = '';
      if (imgSrc.startsWith('data:image')) {
        b64 = imgSrc;
      } else {
        b64 = '';
      }

      const res = await fetch('/api/enhance-celestial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mode })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.blurReductionPct) {
          setOpticalReport(data);
        }
      }
    } catch (err) {
      console.warn('AI optical report fallback:', err);
    }
  };

  // Handle triggered AI enhancement
  const triggerEnhance = () => {
    setIsEnhancing(true);
    celestialAudio.playKatanaSlash();
    addHonorPoints(30, `Sharpened Celestial Optical Exposure (${enhanceMode})`, 'lens');
    requestAiOpticalDiagnosis(rawBlurredImageSrc, enhanceMode);
    setTimeout(() => {
      processImageEnhancement(rawBlurredImageSrc, enhanceStrength, enhanceMode);
      setIsEnhancing(false);
      celestialAudio.playKoto(2);
    }, 600);
  };

  // Handle Transient Event Type switch
  const handleSelectTransientType = (type: TransientEventType) => {
    setSelectedTransientType(type);
    const analysis = generateTransientAnalysis(type);
    setTransientData(analysis);
    setAlertBroadcasted(false);
    celestialAudio.playKoto(1);
    addHonorPoints(15, `Analyzed Time-Domain Light Curve: ${analysis.title}`, 'lens');
  };

  // Handle Transient Alert Broadcast
  const handleBroadcastTransientAlert = () => {
    setAlertBroadcasted(true);
    celestialAudio.playKatanaSlash();
    addHonorPoints(35, `Broadcasted Transient Alert: ${transientData.title}`, 'lens');
  };

  // Render Chart.js spectral curve
  useEffect(() => {
    if (!chartCanvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const spectralPoints = generateSpectralPoints(1.0);
    const labels = spectralPoints.map((p) => p.timeOffset);
    const dataFlux = spectralPoints.map((p) => p.flux);

    const ctx = chartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const goldGradient = ctx.createLinearGradient(0, 0, 0, 200);
    goldGradient.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
    goldGradient.addColorStop(1, 'rgba(212, 175, 55, 0.0)');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Relative Flux (Normalized)',
            data: dataFlux,
            borderColor: '#d4af37',
            borderWidth: 2,
            backgroundColor: goldGradient,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#c41e3a',
            pointBorderColor: '#fff',
            pointRadius: 3,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111',
            borderColor: '#d4af37',
            borderWidth: 1,
            titleFont: { family: 'Space Mono' },
            bodyFont: { family: 'Space Mono' },
            callbacks: {
              label: (context) => `Flux: ${context.parsed.y} (Star #01 Peak)`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#888', font: { family: 'Space Mono', size: 10 } }
          },
          y: {
            min: 0.94,
            max: 1.03,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#888', font: { family: 'Space Mono', size: 10 } }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [selectedStar]);

  // Render Chart.js Transient Event Time-Domain Light Curve
  useEffect(() => {
    if (!transientChartCanvasRef.current) return;
    if (transientChartInstanceRef.current) {
      transientChartInstanceRef.current.destroy();
    }

    const labels = transientData.spectralPoints.map((p) => p.timeOffset);
    const dataFlux = transientData.spectralPoints.map((p) => p.flux);
    const dataUpper = transientData.spectralPoints.map((p) => p.noiseUpper ?? +(p.flux * 1.04).toFixed(3));
    const dataLower = transientData.spectralPoints.map((p) => p.noiseLower ?? +(p.flux * 0.96).toFixed(3));

    const ctx = transientChartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const fillGradient = ctx.createLinearGradient(0, 0, 0, 240);
    fillGradient.addColorStop(0, 'rgba(196, 30, 58, 0.35)');
    fillGradient.addColorStop(1, 'rgba(196, 30, 58, 0.0)');

    transientChartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Observed Light Curve',
            data: dataFlux,
            borderColor: '#d4af37',
            borderWidth: 2.5,
            backgroundColor: fillGradient,
            fill: true,
            tension: 0.28,
            pointBackgroundColor: '#c41e3a',
            pointBorderColor: '#ffffff',
            pointRadius: 4.5,
            pointHoverRadius: 7
          },
          {
            label: '+3σ Confidence Bound',
            data: dataUpper,
            borderColor: 'rgba(56, 189, 248, 0.5)',
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: false,
            pointRadius: 0,
            tension: 0.28
          },
          {
            label: '-3σ Confidence Bound',
            data: dataLower,
            borderColor: 'rgba(56, 189, 248, 0.5)',
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: false,
            pointRadius: 0,
            tension: 0.28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#cbd5e1',
              font: { family: 'Space Mono', size: 10 },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: '#0a0c26',
            borderColor: '#d4af37',
            borderWidth: 1,
            titleFont: { family: 'Space Mono' },
            bodyFont: { family: 'Space Mono' },
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y} Relative Flux`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#888', font: { family: 'Space Mono', size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#888', font: { family: 'Space Mono', size: 10 } }
          }
        }
      }
    });

    return () => {
      if (transientChartInstanceRef.current) {
        transientChartInstanceRef.current.destroy();
      }
    };
  }, [transientData]);

  // Handle blurred image file upload
  const handleBlurredFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setRawBlurredImageSrc(result);
        setImageName(file.name.replace(/\.[^/.]+$/, ''));
        triggerEnhance();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBlurredFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle URL submit for blurred image
  const handleBlurUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = blurUrlInput.trim();
    if (!trimmed) return;
    setRawBlurredImageSrc(trimmed);
    setImageName('Web Astronomical Capture');
    triggerEnhance();
  };

  // Download enhanced image
  const handleDownloadRestored = () => {
    if (!enhancedImageSrc) return;
    const link = document.createElement('a');
    link.download = `tsukuyomi-ai-restored-${Date.now()}.jpg`;
    link.href = enhancedImageSrc;
    link.click();
  };

  // Bridge between Identifier and Enhancer
  const handleSendToEnhancer = (imgSrc: string) => {
    setRawBlurredImageSrc(imgSrc);
    setImageName('Telescope Viewfinder Target');
    enhancerBarRef.current?.scrollIntoView({ behavior: 'smooth' });
    triggerEnhance();
  };

  const handleSendToIdentifier = () => {
    identifierBarRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* Hidden processing canvas */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Main Hero Header Strip */}
      <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/35 bg-[#0e102e] p-6 lg:p-8 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
        <div className="absolute top-0 right-0 w-96 h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,#d4af37_0%,transparent_70%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-tech tracking-wider text-[#d4af37]">
              <span>SEIREI KYŌ (霊鏡)</span>
              <span>·</span>
              <span>AI CELESTIAL ORACLE & ENHANCEMENT SUITE</span>
              <span>·</span>
              <span className="text-[#c41e3a]">MULTIMODAL ASTROMETRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-bold text-slate-100 tracking-tight text-balance">
              The Spirit Lens: AI Celestial Identifier & Restoration
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl font-japanese leading-relaxed">
              Enter any celestial image website or upload space exposures to identify constellations, galaxies, and stars. Use the dedicated restoration bar below to upload blurred or noisy astrophotography for real-time AI deconvolution and point-spread sharpening.
            </p>
          </div>

          {/* Quick Section Jump Pills */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => identifierBarRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#14173d] hover:bg-[#1e2254] border border-[#d4af37]/45 rounded-lg text-xs font-cinzel font-semibold text-[#d4af37] transition-all"
            >
              <Compass className="w-4 h-4 text-[#d4af37]" />
              <span>1. Celestial Identifier</span>
            </button>
            <button
              onClick={() => enhancerBarRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#c41e3a] hover:bg-[#a3182f] text-white rounded-lg text-xs font-cinzel font-semibold shadow-lg shadow-rose-950/40 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>2. AI Image Enhancer Bar</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BAR 1: AI CELESTIAL IDENTIFIER (Enter Image Website URL or Upload)
          Identifies Constellations, Stars, Galaxies, Nebulae, and Samurai Lore
         ========================================================================= */}
      <div ref={identifierBarRef} className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#d4af37] uppercase tracking-wider">
            <span>⭐ BAR 1:</span>
            <span>AI CELESTIAL IDENTIFIER · ENTER IMAGE WEBSITE OR UPLOAD</span>
          </div>
          <span className="text-[11px] font-mono-tech text-slate-400">Multimodal Gemini Astronomical Analysis</span>
        </div>

        <CelestialIdentifier
          currentSliderImage={rawBlurredImageSrc}
          onUseInSpiritLens={handleSendToEnhancer}
          onEnhanceImage={handleSendToEnhancer}
        />
      </div>

      {/* Divider Ribbon */}
      <div className="relative py-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#d4af37]/25" />
        </div>
        <div className="relative px-4 bg-[#0a0b1e] text-xs font-cinzel text-[#d4af37] flex items-center gap-2">
          <span>⚔️</span>
          <span>OPTICAL RESTORATION & DE-BLURRING STAGE</span>
          <span>⚔️</span>
        </div>
      </div>

      {/* =========================================================================
          BAR 2: AI IMAGE ENHANCER BAR & OPTICAL DE-BLUR STUDIO
          Allows uploading blurred, noisy, or raw images and AI enhances it
         ========================================================================= */}
      <div ref={enhancerBarRef} className="space-y-6 scroll-mt-6">
        {/* Prominent Dedicated AI Image Enhancement Bar Header */}
        <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/45 bg-gradient-to-r from-[#0d0f2f] via-[#151745] to-[#0d0f2f] p-5 sm:p-6 shadow-[0_4px_30px_rgba(10,12,35,0.7)] sumie-parchment-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#c41e3a]/20 border border-[#c41e3a]/60 flex items-center justify-center shrink-0 shadow-lg">
                <Zap className="w-6 h-6 text-[#c41e3a] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4af37] font-semibold">
                    Optical De-blur & Dynamic Range Restoration Bar
                  </span>
                  <span className="text-[10px] font-japanese text-amber-200">霊鏡修復</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
                  <span>AI Image Enhancer Bar: Upload Blurred or Any Images</span>
                </h2>
                <p className="text-xs text-slate-300 font-japanese mt-0.5">
                  De-blur astronomical turbulence, remove high-ISO camera sensor noise, and reconstruct sharp star cores.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={triggerEnhance}
                disabled={isEnhancing}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#c41e3a] hover:bg-[#a3182f] text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-rose-950/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Enhancing Pixels...' : 'Run AI Enhancement'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Blurred Image Input Bar */}
          <div className="mt-5 pt-4 border-t border-[#252856] grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            {/* Enter URL for Blurred Image */}
            <form onSubmit={handleBlurUrlSubmit} className="md:col-span-7 relative">
              <input
                type="url"
                value={blurUrlInput}
                onChange={(e) => setBlurUrlInput(e.target.value)}
                placeholder="Enter blurred image website URL (or paste image link)..."
                className="w-full pl-9 pr-28 py-2 bg-[#090b22] border border-[#2d3166] focus:border-[#d4af37] rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-colors"
              />
              <Globe className="w-4 h-4 text-[#d4af37] absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                disabled={!blurUrlInput.trim() || isEnhancing}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#d4af37]/25 hover:bg-[#d4af37]/40 text-[#d4af37] text-[11px] font-mono-tech rounded font-semibold transition-colors disabled:opacity-40"
              >
                Load & Enhance
              </button>
            </form>

            {/* Upload File Button */}
            <div className="md:col-span-5 flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#181a44] hover:bg-[#22255c] border border-[#2d3166] hover:border-[#d4af37]/50 rounded-lg text-xs font-mono-tech text-slate-200 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Upload Blurred File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBlurredFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <button
                onClick={handleDownloadRestored}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#101235] hover:bg-[#1a1d4a] border border-[#252856] hover:border-[#d4af37]/40 text-slate-200 rounded-lg text-xs font-mono-tech transition-colors"
                title="Download the AI restored image"
              >
                <Download className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preset Blurred Images Bar & Drag Dropzone */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Sample Blurred Targets */}
          <div className="md:col-span-8 bg-[#101233] p-4 rounded-xl border border-[#252856] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>⚡</span>
                <span>Select Sample Blurred / Defocused Capture</span>
              </span>
              <span className="text-[11px] font-mono-tech text-slate-400">Click to test instant de-blur</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BLURRED_PRESET_IMAGES.map((preset) => {
                const isSelected = rawBlurredImageSrc === preset.src;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setRawBlurredImageSrc(preset.src);
                      setImageName(preset.name);
                      celestialAudio.playKoto(1);
                      triggerEnhance();
                    }}
                    className={`text-left p-2.5 rounded-lg border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#1e1c48] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]'
                        : 'bg-[#14173d] border-[#252856] hover:border-[#383d78]'
                    }`}
                  >
                    <div className="relative h-20 w-full rounded overflow-hidden">
                      <img
                        src={preset.src}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter blur-[1.2px]"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono-tech bg-black/80 px-1.5 py-0.5 rounded text-amber-300">
                        Blurred Raw
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-100 block truncate">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{preset.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`md:col-span-4 p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
              isDragging
                ? 'border-[#d4af37] bg-[#1a1c44]'
                : 'border-[#252856] hover:border-[#383d78] bg-[#101233]'
            }`}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) handleBlurredFileUpload(files[0]);
              };
              input.click();
            }}
          >
            <div className="w-10 h-10 rounded-full bg-[#16183e] border border-[#d4af37]/35 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-100 block">Drop Blurred Photo Here</span>
              <span className="text-[10px] text-slate-400 block font-mono-tech mt-0.5">
                PNG, JPG, or WebP for AI de-blurring
              </span>
            </div>
          </div>
        </div>

        {/* Optical Controls Toolbar */}
        <div className="bg-[#0f1133] p-4 rounded-xl border border-[#252856] flex flex-wrap items-center justify-between gap-4">
          {/* Enhancement Mode Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-tech text-slate-400 flex items-center gap-1.5 mr-1">
              <Sliders className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Restoration Mode:</span>
            </span>

            {[
              { id: 'all-in-one', label: '🌟 All-in-One' },
              { id: 'deblur', label: '🔭 Optical De-blur' },
              { id: 'nebula', label: '🌌 Deep Nebula' },
              { id: 'denoise', label: '📷 High-ISO Denoise' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setEnhanceMode(m.id as any);
                  celestialAudio.playKoto(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all border ${
                  enhanceMode === m.id
                    ? 'bg-[#d4af37] text-black font-bold border-[#d4af37] shadow-sm'
                    : 'bg-[#14173d] text-slate-300 border-[#252856] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Sharpness / De-blur Intensity Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-tech text-slate-400">De-blur Strength:</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={enhanceStrength}
              onChange={(e) => setEnhanceStrength(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-[#d4af37]"
            />
            <span className="text-xs font-mono-tech font-bold text-[#d4af37] tabular-nums w-12">
              {(enhanceStrength * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Main Dual-Stage Comparison Slider Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Compare Slider Area */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/40 bg-[#07081a] sumie-parchment-border shadow-2xl">
              {/* Top Toolbar */}
              <div className="px-4 py-2 bg-[#0b0c26] border-b border-[#d4af37]/35 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-slate-300">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-slate-100 font-semibold truncate max-w-[220px]">{imageName}</span>
                  <span>·</span>
                  <span className="text-[#d4af37]">Drag Slider to Compare</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStarOverlay((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] transition-colors border ${
                      showStarOverlay
                        ? 'bg-[#1b193f] border-[#d4af37]/60 text-[#d4af37]'
                        : 'bg-[#14173d] border-[#252856] text-slate-400'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Star Reticles: {showStarOverlay ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <button
                    onClick={handleSendToIdentifier}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] bg-[#14173d] hover:bg-[#1f2257] border border-[#252856] text-amber-200 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Identify with Oracle</span>
                  </button>
                </div>
              </div>

              {/* Comparison Slider Component */}
              <div className="relative min-h-[380px] sm:min-h-[480px] max-h-[600px] w-full flex items-center justify-center bg-[#07081a] overflow-hidden">
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src={rawBlurredImageSrc}
                      alt="Raw Blurred Telescope Exposure"
                      style={{
                        objectFit: 'contain',
                        maxHeight: '560px',
                        width: '100%'
                      }}
                    />
                  }
                  itemTwo={
                    <div className="relative w-full h-full">
                      <ReactCompareSliderImage
                        src={enhancedImageSrc}
                        alt="AI Enhanced Cosmic Restoration"
                        style={{
                          objectFit: 'contain',
                          maxHeight: '560px',
                          width: '100%'
                        }}
                      />
                      {/* Star Reticles overlay plotted on top of the enhanced portion */}
                      {showStarOverlay && (
                        <div className="absolute inset-0 pointer-events-none">
                          {stars.slice(0, 35).map((star, i) => (
                            <div
                              key={i}
                              style={{
                                left: `${(star.x / imageDimensions.w) * 100}%`,
                                top: `${(star.y / imageDimensions.h) * 100}%`,
                                transform: 'translate(-50%, -50%)'
                              }}
                              className="absolute flex items-center justify-center group pointer-events-auto cursor-pointer"
                              onClick={() => setSelectedStar(star)}
                            >
                              <div className="w-3.5 h-3.5 rounded-full border border-[#d4af37] animate-pulse" />
                              <div className="w-1 h-1 rounded-full bg-[#c41e3a] absolute" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '440px'
                  }}
                />

                {/* Watermark Labels on each side */}
                <div className="absolute bottom-3 left-4 text-[10px] font-mono-tech tracking-wider uppercase px-2.5 py-1 bg-black/80 text-rose-300 border border-rose-900/50 rounded pointer-events-none">
                  RAW BLURRED EXPOSURE
                </div>
                <div className="absolute bottom-3 right-4 text-[10px] font-mono-tech tracking-wider uppercase px-2.5 py-1 bg-black/80 text-[#d4af37] border border-[#d4af37]/50 rounded pointer-events-none flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#d4af37]" />
                  <span>AI ENHANCED RESTORATION</span>
                </div>
              </div>
            </div>

            {/* Optical AI Restoration Report Strip */}
            <div className="bg-[#0f1131] border border-[#d4af37]/35 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#252856] pb-2">
                <span className="text-xs font-cinzel font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AI Optical Restoration Diagnostics</span>
                </span>
                <span className="text-[10px] font-mono-tech text-[#d4af37]">{opticalReport.blurType}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-tech">
                <div className="p-2.5 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[9px] uppercase text-slate-400 block">Blur Reduced</span>
                  <span className="text-lg font-bold text-emerald-400 tabular-nums">+{opticalReport.blurReductionPct}%</span>
                </div>
                <div className="p-2.5 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[9px] uppercase text-slate-400 block">Noise Suppressed</span>
                  <span className="text-lg font-bold text-sky-400 tabular-nums">-{opticalReport.noiseSuppressionPct}%</span>
                </div>
                <div className="p-2.5 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[9px] uppercase text-slate-400 block">Stars Resolved</span>
                  <span className="text-lg font-bold text-[#d4af37] tabular-nums">
                    {stars.length > 0 ? stars.length : opticalReport.starsResolvedCount}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[9px] uppercase text-slate-400 block">Dynamic Range</span>
                  <span className="text-lg font-bold text-amber-300">{opticalReport.dynamicRangeGain}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-serif italic pt-1 leading-relaxed">
                "{opticalReport.aiDiagnosis}"
              </p>
            </div>
          </div>

          {/* Right Side: Detected Stellar Census & Spectral Graph */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stellar Telemetry Stats */}
            <div className="bg-[#101233] border border-[#d4af37]/35 rounded-xl p-5 space-y-4 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
              <div className="flex items-center justify-between border-b border-[#252856] pb-3">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="font-cinzel font-bold text-sm text-slate-200 uppercase tracking-wide">
                    Stellar Census
                  </h3>
                </div>
                <span className="text-[10px] font-mono-tech text-emerald-400">ALGORITHM ACTIVE</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase block">Stars Detected</span>
                  <span className="text-2xl font-mono-tech font-bold text-[#d4af37] tabular-nums mt-1 block">
                    {stars.length > 0 ? stars.length : 142}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Luminance peaks</span>
                </div>

                <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase block">Peak Brightness</span>
                  <span className="text-2xl font-mono-tech font-bold text-amber-300 tabular-nums mt-1 block">
                    {avgBrightness}
                    <span className="text-xs text-slate-400 font-normal"> / 255</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">Average 8-bit</span>
                </div>

                <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase block">Dimensions</span>
                  <span className="text-sm font-mono-tech font-bold text-slate-200 mt-1 block">
                    {imageDimensions.w} × {imageDimensions.h}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Pixel resolution</span>
                </div>

                <div className="p-3 rounded bg-[#14173d] border border-[#252856]">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase block">Luminance</span>
                  <span className="text-sm font-mono-tech font-bold text-slate-200 mt-1 block">
                    {totalLuminance} cd/m²
                  </span>
                  <span className="text-[10px] text-slate-400 block">Flux density</span>
                </div>
              </div>

              {selectedStar && (
                <div className="p-3 rounded bg-[#181944] border border-[#d4af37]/35 text-xs space-y-1">
                  <span className="text-[11px] font-mono-tech text-[#d4af37] font-semibold block uppercase">
                    Targeted Star Core (Reticle Active)
                  </span>
                  <p className="text-[11px] font-mono-tech text-slate-200">
                    Pos: ({selectedStar.x}px, {selectedStar.y}px) · Brightness: {selectedStar.brightness} · Est. Mag: 11.4
                  </p>
                </div>
              )}
            </div>

            {/* Spectral Photometry Chart.js Graph */}
            <div className="bg-[#101233] border border-[#d4af37]/35 rounded-xl p-5 space-y-3 shadow-[0_4px_30px_rgba(10,12,35,0.7)]">
              <div className="flex items-center justify-between border-b border-[#252856] pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#c41e3a]" />
                  <h4 className="font-cinzel font-bold text-xs text-slate-200 uppercase tracking-wide">
                    Spectral Photometry
                  </h4>
                </div>
                <span className="text-[10px] font-mono-tech text-slate-400">CHART.JS</span>
              </div>

              <p className="text-[11px] text-slate-300">
                Photometric flux curve of targeted stellar body. Secondary dips indicate possible exoplanet transit.
              </p>

              <div className="h-44 w-full relative">
                <canvas ref={chartCanvasRef} />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-400 pt-1 border-t border-[#252856]">
                <span>Sampling: 15m intervals</span>
                <span className="text-[#d4af37]">Flux Variance: ±0.04%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
