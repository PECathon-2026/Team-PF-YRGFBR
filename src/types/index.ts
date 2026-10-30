export interface WeatherData {
  cloudCover: number;
  humidity: number;
  visibility: number; // in meters
  temperature: number; // Celsius
  windSpeed: number; // km/h
  skyRating: string;
  skyRatingKanji: string;
  verdict: string;
}

export interface StargazingSpot {
  id: string;
  name: string;
  nameKanji: string;
  type: 'shrine' | 'mountain' | 'temple' | 'observatory';
  lat: number;
  lng: number;
  bortleClass: number; // 1 to 8
  elevationM: number;
  description: string;
}

export type EventType = 'meteor' | 'eclipse' | 'moon' | 'iss' | 'rocket';

export interface CelestialEvent {
  id: string;
  title: string;
  titleKanji: string;
  type: EventType;
  date: string; // ISO date string YYYY-MM-DD
  timeUtc: string;
  peakWindow: string;
  constellation: string;
  visibilityRating: number; // 1-5 stars
  description: string;
  samuraiLore: string;
}

export interface ISSPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
  velocityKmH?: number;
  altitudeKm?: number;
}

export interface MoonPhaseData {
  phaseValue: number; // 0 to 1
  phaseName: string;
  phaseKanji: string;
  illuminationPct: number;
  daysIntoCycle: number;
  moonrise: string;
  moonset: string;
  samuraiMeaning: string;
}

export interface DetectedStar {
  x: number;
  y: number;
  brightness: number;
  radius: number;
}

export interface SpectralPoint {
  timeOffset: string;
  flux: number;
  normalizedMagnitude: number;
  noiseUpper?: number;
  noiseLower?: number;
}

export type TransientEventType = 'supernova' | 'exoplanet' | 'grb' | 'microlensing' | 'flare';

export interface TransientEventAnalysis {
  type: TransientEventType;
  title: string;
  titleKanji: string;
  classification: string;
  confidence: number;
  sigma: number;
  riseTime: string;
  decayRate: string;
  peakFluxGain: string;
  sedTemp: string;
  description: string;
  alertPayload: string;
  spectralPoints: SpectralPoint[];
}

export interface SamuraiLevelInfo {
  level: number;
  title: string;
  titleKanji: string;
  minPoints: number;
  maxPoints: number;
  badgeIcon: string;
  description: string;
  perk: string;
}

export interface HonorActivityLog {
  id: string;
  timestamp: number;
  points: number;
  reason: string;
  category: 'watchtower' | 'scroll' | 'lens' | 'dojo' | 'bonus';
}

export interface HonorBadge {
  id: string;
  name: string;
  nameKanji: string;
  icon: string;
  description: string;
  unlockedAt?: number;
}

export interface CelestialScholar {
  name: string;
  title: string;
  era: string;
  region: string;
  crest: string;
  achievement: string;
  astronomicalWork: string;
}

export interface ConstellationStar {
  name: string;
  designation: string;
  spectralType: string;
  magnitude: number;
}

export interface DeepSkyTarget {
  name: string;
  catalogId: string;
  type: string;
}

export interface ConstellationData {
  id: string;
  name: string;
  latinName: string;
  kanjiName: string;
  meaning: string;
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn' | 'Circumpolar';
  rightAscension: string;
  declination: string;
  quadrant: string;
  areaSqDeg: number;
  brightestStar: string;
  stars: ConstellationStar[];
  deepSkyTargets: DeepSkyTarget[];
  samuraiLore: string;
  svgPoints: { x: number; y: number; label?: string; mag?: number }[];
  svgLines: [number, number][];
}

export interface HonorScoreResult {
  score: number;
  rank: string;
  rankKanji: string;
  verdict: string;
}

export interface CelestialIdentificationResult {
  primaryClassification: string;
  primaryName: string;
  japaneseName: string;
  identifiedConstellations: string[];
  identifiedDeepSkyObjects: {
    name: string;
    catalog: string;
    type: string;
    distance?: string;
  }[];
  prominentStars: {
    name: string;
    type: string;
    magnitude: string;
  }[];
  samuraiLore: string;
  astronomicalFacts: string;
  celestialCoordinates?: {
    ra: string;
    dec: string;
    skyRegion: string;
  };
  stargazingAdvice: string;
  confidence: number;
  summary: string;
  fallback?: boolean;
}

export interface DoodleMatchResult {
  constellation: ConstellationData;
  confidence: number;
  doodleAnalysis: string;
  source: 'ai' | 'local';
}

export interface OpticalEnhanceResult {
  blurType: string;
  blurReductionPct: number;
  noiseSuppressionPct: number;
  starsResolvedCount: number;
  dynamicRangeGain: string;
  aiDiagnosis: string;
  fallback?: boolean;
}

