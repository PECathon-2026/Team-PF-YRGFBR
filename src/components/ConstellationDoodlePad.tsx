import React, { useRef, useState, useEffect } from 'react';
import { ConstellationData, DoodleMatchResult } from '../types';
import { CONSTELLATIONS_DATABASE, matchDoodleLocally } from '../utils/constellations';
import { celestialAudio } from '../utils/audio';
import {
  Sparkles,
  RotateCcw,
  Trash2,
  Brush,
  Compass,
  CheckCircle2,
  Info,
  Layers,
  HelpCircle,
  Eye,
  Crosshair,
  Sliders
} from 'lucide-react';

interface ConstellationDoodlePadProps {
  onConstellationIdentified: (constellation: ConstellationData, result: DoodleMatchResult) => void;
  onClose?: () => void;
}

interface StarNode {
  x: number;
  y: number;
  id: number;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface FreehandStroke {
  points: StrokePoint[];
  color: string;
  width: number;
}

const COLOR_PALETTE = [
  { name: 'Gold Leaf', hex: '#d4af37', label: '黄金 (Kin)' },
  { name: 'Starlight Cyan', hex: '#38bdf8', label: '青星 (Aoboshi)' },
  { name: 'Pearl White', hex: '#f8fafc', label: '白光 (Shiro)' },
  { name: 'Crimson Hanko', hex: '#f43f5e', label: '朱肉 (Shuniku)' }
];

const PRESET_ASTERISMS = [
  {
    name: '三ツ星 · Orion Belt & Frame',
    hint: 'orion',
    desc: '3 aligned belt stars inside an hourglass warrior figure',
    points: [
      { x: 120, y: 70 }, // Betelgeuse
      { x: 280, y: 60 }, // Bellatrix
      { x: 175, y: 175 }, // Belt 1
      { x: 200, y: 170 }, // Belt 2
      { x: 225, y: 165 }, // Belt 3
      { x: 110, y: 280 }, // Saiph
      { x: 290, y: 270 }  // Rigel
    ],
    lines: [
      [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]
    ] as [number, number][]
  },
  {
    name: '北斗七星 · Big Dipper (Ursa Major)',
    hint: 'dipper',
    desc: '7-star ladle with curved handle pointing to Polaris',
    points: [
      { x: 60, y: 220 },
      { x: 110, y: 180 },
      { x: 160, y: 160 },
      { x: 210, y: 170 },
      { x: 220, y: 250 },
      { x: 300, y: 240 },
      { x: 310, y: 150 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]
    ] as [number, number][]
  },
  {
    name: '錨星 · Cassiopeia "W"',
    hint: 'cassiopeia',
    desc: '5-star zigzag celestial anchor revolving around the North Star',
    points: [
      { x: 70, y: 130 },
      { x: 130, y: 230 },
      { x: 200, y: 140 },
      { x: 260, y: 240 },
      { x: 330, y: 150 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ] as [number, number][]
  },
  {
    name: '天の川十字 · Cygnus Cross',
    hint: 'cygnus',
    desc: 'Cruciform celestial swan soaring along the Milky Way',
    points: [
      { x: 200, y: 60 },
      { x: 200, y: 160 },
      { x: 100, y: 190 },
      { x: 300, y: 140 },
      { x: 200, y: 280 }
    ],
    lines: [
      [0, 1], [1, 4], [2, 1], [1, 3]
    ] as [number, number][]
  },
  {
    name: 'さそり · Scorpius Hook',
    hint: 'scorpius',
    desc: 'Sweeping hooked stinger guarding red supergiant Antares',
    points: [
      { x: 130, y: 60 },
      { x: 150, y: 90 },
      { x: 180, y: 130 },
      { x: 195, y: 170 },
      { x: 215, y: 210 },
      { x: 245, y: 250 },
      { x: 290, y: 260 },
      { x: 320, y: 220 },
      { x: 295, y: 180 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]
    ] as [number, number][]
  }
];

export const ConstellationDoodlePad: React.FC<ConstellationDoodlePadProps> = ({
  onConstellationIdentified,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drawing state
  const [mode, setMode] = useState<'freehand' | 'nodes'>('nodes');
  const [currentColor, setCurrentColor] = useState<string>(COLOR_PALETTE[0].hex);
  const [brushWidth, setBrushWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [userHint, setUserHint] = useState<string>('');

  // Node & Line Mode state
  const [nodes, setNodes] = useState<StarNode[]>([]);
  const [lines, setLines] = useState<[number, number][]>([]);
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(null);

  // Freehand Strokes state
  const [strokes, setStrokes] = useState<FreehandStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);

  // Recognition status
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DoodleMatchResult | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Redraw canvas on updates
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background to midnight celestial void
    ctx.fillStyle = '#060717';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle starry background grid & dust
    ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
    for (let x = 20; x < canvas.width; x += 30) {
      for (let y = 20; y < canvas.height; y += 30) {
        if ((x + y) % 90 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw freehand strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Draw active freehand stroke in progress
    if (currentStroke.length > 1) {
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = currentColor;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw interconnected asterism lines
    lines.forEach(([from, to]) => {
      const p1 = nodes[from];
      const p2 = nodes[to];
      if (p1 && p2) {
        ctx.save();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw star vertices
    nodes.forEach((node, i) => {
      const isSelected = selectedNodeIdx === i;
      ctx.save();

      // Outer glowing corona
      ctx.fillStyle = isSelected ? '#ef4444' : currentColor;
      ctx.shadowColor = isSelected ? '#ef4444' : currentColor;
      ctx.shadowBlur = isSelected ? 16 : 10;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fill();

      // Bright stellar nucleus
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 2.5 : 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Index label
      ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText(`${i + 1}`, node.x + 6, node.y - 6);

      ctx.restore();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [nodes, lines, strokes, currentStroke, selectedNodeIdx, currentColor, brushWidth]);

  // Canvas Click / Mouse Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'freehand') {
      setIsDrawing(true);
      setCurrentStroke([{ x, y }]);
      return;
    }

    if (mode === 'nodes') {
      // Check if clicking near an existing node (within 14px radius)
      const clickedIdx = nodes.findIndex((n) => Math.hypot(n.x - x, n.y - y) < 14);

      if (clickedIdx !== -1) {
        if (selectedNodeIdx === null) {
          setSelectedNodeIdx(clickedIdx);
          celestialAudio.playKoto(1);
        } else if (selectedNodeIdx === clickedIdx) {
          // Deselect
          setSelectedNodeIdx(null);
        } else {
          // Link line between selected and clicked node
          const lineExists = lines.some(
            ([a, b]) =>
              (a === selectedNodeIdx && b === clickedIdx) ||
              (a === clickedIdx && b === selectedNodeIdx)
          );
          if (!lineExists) {
            setLines((prev) => [...prev, [selectedNodeIdx, clickedIdx]]);
            celestialAudio.playKoto(3);
          }
          setSelectedNodeIdx(null);
        }
      } else {
        // Place a new star node
        const newNode: StarNode = { x, y, id: nodes.length };
        setNodes((prev) => [...prev, newNode]);

        // If a node was previously selected, automatically connect to the new star
        if (selectedNodeIdx !== null) {
          setLines((prev) => [...prev, [selectedNodeIdx, nodes.length]]);
        }
        setSelectedNodeIdx(nodes.length);
        celestialAudio.playKoto((nodes.length % 5) as any);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'freehand' && isDrawing) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentStroke((prev) => [...prev, { x, y }]);
    }
  };

  const handleCanvasMouseUp = () => {
    if (mode === 'freehand' && isDrawing) {
      setIsDrawing(false);
      if (currentStroke.length > 0) {
        setStrokes((prev) => [
          ...prev,
          { points: currentStroke, color: currentColor, width: brushWidth }
        ]);
        setCurrentStroke([]);
        celestialAudio.playKoto(2);
      }
    }
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (mode === 'freehand') {
      setIsDrawing(true);
      setCurrentStroke([{ x, y }]);
    } else {
      const clickedIdx = nodes.findIndex((n) => Math.hypot(n.x - x, n.y - y) < 18);
      if (clickedIdx !== -1) {
        if (selectedNodeIdx === null) {
          setSelectedNodeIdx(clickedIdx);
          celestialAudio.playKoto(1);
        } else if (selectedNodeIdx === clickedIdx) {
          setSelectedNodeIdx(null);
        } else {
          setLines((prev) => [...prev, [selectedNodeIdx, clickedIdx]]);
          setSelectedNodeIdx(null);
          celestialAudio.playKoto(3);
        }
      } else {
        const newNode = { x, y, id: nodes.length };
        setNodes((prev) => [...prev, newNode]);
        if (selectedNodeIdx !== null) {
          setLines((prev) => [...prev, [selectedNodeIdx, nodes.length]]);
        }
        setSelectedNodeIdx(nodes.length);
        celestialAudio.playKoto((nodes.length % 5) as any);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (mode === 'freehand' && isDrawing) {
      e.preventDefault();
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      setCurrentStroke((prev) => [...prev, { x, y }]);
    }
  };

  const handleTouchEnd = () => {
    handleCanvasMouseUp();
  };

  // Clear Canvas
  const handleClear = () => {
    setNodes([]);
    setLines([]);
    setStrokes([]);
    setCurrentStroke([]);
    setSelectedNodeIdx(null);
    setAnalysisResult(null);
    setErrorStatus(null);
    celestialAudio.playSingingBowl();
  };

  // Undo Last Action
  const handleUndo = () => {
    if (mode === 'freehand' && strokes.length > 0) {
      setStrokes((prev) => prev.slice(0, -1));
    } else if (nodes.length > 0) {
      const lastIdx = nodes.length - 1;
      setNodes((prev) => prev.slice(0, -1));
      setLines((prev) => prev.filter(([a, b]) => a !== lastIdx && b !== lastIdx));
      setSelectedNodeIdx(null);
    }
  };

  // Load Preset Starter Asterisms
  const handleLoadPreset = (preset: typeof PRESET_ASTERISMS[0]) => {
    setNodes(preset.points.map((p, i) => ({ ...p, id: i })));
    setLines(preset.lines);
    setStrokes([]);
    setSelectedNodeIdx(null);
    setUserHint(preset.hint);
    setAnalysisResult(null);
    celestialAudio.playKatanaSlash();
  };

  // Identify Constellation (API with Smart Local Fallback)
  const handleIdentify = async () => {
    if (nodes.length === 0 && strokes.length === 0) {
      setErrorStatus('Please place stars or doodle an asterism first before deciphering.');
      return;
    }

    setIsAnalyzing(true);
    setErrorStatus(null);
    celestialAudio.playKatanaSlash();

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsAnalyzing(false);
      return;
    }

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

    try {
      const res = await fetch('/api/identify-constellation-doodle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          hints: userHint,
          nodeCount: nodes.length
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.matchedId || data.constellationName)) {
          // Locate corresponding database constellation or synthesize dynamic one
          let matched = CONSTELLATIONS_DATABASE.find(
            (c) => c.id === data.matchedId || c.name.toLowerCase().includes((data.matchedId || '').toLowerCase())
          );

          if (!matched) {
            // Synthesize ConstellationData from Gemini response
            matched = {
              id: data.matchedId || 'celestial-asterism',
              name: data.constellationName || 'Celestial Constellation',
              latinName: data.latinName || 'Asterism',
              kanjiName: data.kanjiName || '天の星座',
              meaning: data.meaning || 'Stellar Pattern & Samurai Asterism',
              season: (data.season as any) || 'Winter',
              rightAscension: data.rightAscension || '05h 30m',
              declination: data.declination || '+15° 00′',
              quadrant: data.quadrant || 'NQ1',
              areaSqDeg: data.areaSqDeg || 550,
              brightestStar: data.brightestStar || 'Alpha Stellaris',
              stars: data.stars || [
                { name: 'Primary Vertex', designation: 'Alpha', spectralType: 'A0V Main Sequence', magnitude: 1.2 }
              ],
              deepSkyTargets: data.deepSkyTargets || [
                { name: 'Associated Cluster', catalogId: 'Messier Deep Sky', type: 'Open Star Cluster' }
              ],
              samuraiLore: data.samuraiLore || 'Venerated by Edo astronomers as a noble stellar guiding path across the darkened night mist.',
              svgPoints: nodes.map((n, i) => ({
                x: Math.round((n.x / canvas.width) * 100),
                y: Math.round((n.y / canvas.height) * 100),
                label: `Star ${i + 1}`,
                mag: 2
              })),
              svgLines: lines.length > 0 ? lines : [[0, 1]]
            };
          }

          const result: DoodleMatchResult = {
            constellation: matched,
            confidence: data.confidence || 94,
            doodleAnalysis: data.doodleAnalysis || 'Visual geometry aligns with traditional Japanese celestial asterism charts.',
            source: data.fallback ? 'local' : 'ai'
          };

          setAnalysisResult(result);
          celestialAudio.playSingingBowl();
          onConstellationIdentified(matched, result);
          return;
        }
      }
    } catch {
      // Fallback gracefully to smart client-side matcher
    } finally {
      setIsAnalyzing(false);
    }

    // Local heuristic backup
    const local = matchDoodleLocally(nodes, lines, userHint);
    const result: DoodleMatchResult = {
      constellation: local.constellation,
      confidence: local.confidence,
      doodleAnalysis: local.doodleAnalysis,
      source: 'local'
    };
    setAnalysisResult(result);
    celestialAudio.playSingingBowl();
    onConstellationIdentified(local.constellation, result);
  };

  return (
    <div className="relative rounded-2xl border border-[#d4af37]/40 bg-[#08091f]/95 p-5 md:p-6 shadow-[0_8px_36px_rgba(7,8,26,0.85)] space-y-5 backdrop-blur-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252856] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono-tech tracking-wider text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#d4af37]" />
            <span>SEIZABITSU · 星図墨絵</span>
            <span>·</span>
            <span className="text-[#c41e3a]">CONSTELLATION DOODLE ORACLE</span>
          </div>
          <h3 className="text-xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
            <span>Doodle or Plot a Constellation</span>
            <span className="text-xs font-japanese text-[#d4af37]/80 font-normal">
              (手描き星図鑑定)
            </span>
          </h3>
          <p className="text-xs text-slate-300">
            Plot stars or sketch asterism lines on the celestial parchment below. The Oracle will decipher the shape and unveil its full astronomical catalog & samurai lore.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-center px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-[#252856] hover:border-[#d4af37]/50 transition-colors"
          >
            Return to Scroll
          </button>
        )}
      </div>

      {/* Preset Star Asterism Templates Quick Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-[#d4af37]" />
            <span>Quick Asterism Templates (Click to plot immediately):</span>
          </span>
          <span className="text-[10px] text-slate-300">Or draw completely freely!</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {PRESET_ASTERISMS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleLoadPreset(preset)}
              title={preset.desc}
              className="px-3 py-1.5 rounded-lg bg-[#111339] border border-[#262854] hover:border-[#d4af37] text-slate-300 hover:text-white whitespace-nowrap text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Stage & Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: The Interactive Canvas */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative rounded-xl border border-[#2d3166] overflow-hidden bg-[#060717] shadow-inner flex flex-col items-center">
            {/* Top Toolbar Overlay */}
            <div className="w-full flex items-center justify-between px-3 py-2 bg-[#0c0e2a]/90 border-b border-[#252856] text-xs font-mono-tech">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('nodes')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                    mode === 'nodes'
                      ? 'bg-[#d4af37] text-black font-semibold shadow'
                      : 'text-slate-400 hover:text-white bg-[#14173d]'
                  }`}
                  title="Click to place stars, click 2 stars to connect them"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Star Nodes ({nodes.length})</span>
                </button>
                <button
                  onClick={() => setMode('freehand')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                    mode === 'freehand'
                      ? 'bg-[#d4af37] text-black font-semibold shadow'
                      : 'text-slate-400 hover:text-white bg-[#14173d]'
                  }`}
                  title="Freehand starlight ink brush"
                >
                  <Brush className="w-3 h-3" />
                  <span>Starlight Ink Brush</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  title="Undo last action"
                  className="p-1.5 rounded bg-[#14173d] hover:bg-[#1f2359] text-slate-300 hover:text-white border border-[#252856] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClear}
                  title="Clear canvas"
                  className="p-1.5 rounded bg-[#14173d] hover:bg-[#a3182f] text-slate-300 hover:text-white border border-[#252856] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* The Actual Canvas Element */}
            <canvas
              ref={canvasRef}
              width={400}
              height={320}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="cursor-crosshair w-full max-w-full touch-none select-none"
              style={{ maxHeight: '380px', aspectRatio: '400 / 320' }}
            />

            {/* Bottom Canvas Instructions Indicator */}
            <div className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0a0c24] border-t border-[#252856] text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-mono-tech">
                {mode === 'nodes' ? (
                  <>
                    <span className="text-[#d4af37]">●</span>
                    <span>Tap to drop stars · Click between stars to link lines ({lines.length} lines)</span>
                  </>
                ) : (
                  <>
                    <span className="text-sky-400">~</span>
                    <span>Draw continuous flowing starlight lines with cursor or finger</span>
                  </>
                )}
              </span>

              {selectedNodeIdx !== null && (
                <span className="text-amber-300 font-mono-tech">
                  Star #{selectedNodeIdx + 1} Selected
                </span>
              )}
            </div>
          </div>

          {/* Palette & Controls Under Canvas */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0f2f] p-3 rounded-xl border border-[#252856]">
            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-tech text-slate-400">Starlight Tint:</span>
              <div className="flex items-center gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setCurrentColor(c.hex)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      currentColor === c.hex ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Width Slider (when in freehand) */}
            {mode === 'freehand' && (
              <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-400">
                <span>Brush:</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(Number(e.target.value))}
                  className="w-20 accent-[#d4af37]"
                />
                <span className="text-slate-300">{brushWidth}px</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: User Hints & Decipher Oracle Action */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0f1134] border border-[#2d3166] rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-cinzel font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Celestial Oracle Chamber</span>
            </h4>

            {/* Optional Hint Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono-tech text-slate-400 block">
                Optional Clue / Clanship / Notes:
              </label>
              <input
                type="text"
                value={userHint}
                onChange={(e) => setUserHint(e.target.value)}
                placeholder="e.g. 3 arrows, warrior, winter, dipper, W-shape..."
                className="w-full px-3 py-2 bg-[#07081b] border border-[#2d3166] text-xs rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Decipher / Identify Action Button */}
            <button
              onClick={handleIdentify}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#c41e3a] via-[#b81d37] to-[#8d1428] hover:from-[#d62040] hover:to-[#9e162d] text-white font-cinzel font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-[0_4px_20px_rgba(196,30,58,0.35)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deciphering Constellation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>星図鑑定 · Identify Constellation</span>
                </>
              )}
            </button>

            {errorStatus && (
              <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorStatus}</span>
              </div>
            )}
          </div>

          {/* Result Card (When Deciphered) */}
          {analysisResult && (
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#181a49] to-[#0f1131] border border-[#d4af37]/60 space-y-3 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deciphered Match ({analysisResult.confidence}%)</span>
                </span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#07081a] border border-[#d4af37]/40 text-[#d4af37]">
                  {analysisResult.source === 'ai' ? 'Gemini Vision AI' : 'Heuristic Matcher'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-cinzel font-bold text-slate-100">
                  {analysisResult.constellation.name}
                </h3>
                <p className="text-xs font-japanese text-[#d4af37]">
                  {analysisResult.constellation.kanjiName}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0a0c24] border border-[#252856] text-xs text-slate-300 font-serif leading-relaxed italic">
                "{analysisResult.doodleAnalysis}"
              </div>

              <div className="text-[11px] font-mono-tech text-slate-400 flex items-center justify-between border-t border-[#252856] pt-2">
                <span>Brightest: {analysisResult.constellation.brightestStar.split('(')[0]}</span>
                <span>{analysisResult.constellation.season} Sky</span>
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById('constellation-chamber');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/50 font-cinzel text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Technical Dossier ↓</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
