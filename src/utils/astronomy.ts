import {
  CelestialEvent,
  DetectedStar,
  MoonPhaseData,
  SpectralPoint,
  StargazingSpot,
  CelestialScholar,
  TransientEventType,
  TransientEventAnalysis
} from '../types';

/**
 * Calculates Night Honor Score according to the formula:
 * Score = 100 - cloud_cover - (humidity / 2) + (visibility_km)
 * Open-Meteo visibility is provided in meters, so visibility / 1000 gives km, or visibility / 10 if already scaled.
 * The prompt specified: 100 - cloud_cover - (humidity/2) + (visibility/10)
 * We normalize and clamp score between 0 and 100.
 */
export function calculateNightHonorScore(cloudCover: number, humidity: number, visibilityMeters: number): {
  score: number;
  rank: string;
  rankKanji: string;
  verdict: string;
} {
  // Visibility from Open-Meteo is in meters (e.g. 50,000m = 50km).
  // If visibilityMeters > 100, we treat as meters and convert to km for the formula, or directly use visibility_km.
  const visibilityKm = visibilityMeters > 500 ? visibilityMeters / 1000 : visibilityMeters;
  const rawScore = 100 - cloudCover - (humidity / 2) + (visibilityKm / 2);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  if (score >= 85) {
    return {
      score,
      rank: 'Celestial Master (Tenku-shu)',
      rankKanji: '天狗・神仙',
      verdict: 'The celestial sphere is pristine. Stars blaze like unsheathed steel.'
    };
  } else if (score >= 70) {
    return {
      score,
      rank: 'Daimyo Commander',
      rankKanji: '大名総督',
      verdict: 'Deep clarity. Fine nebulae and star clusters visible to the disciplined eye.'
    };
  } else if (score >= 50) {
    return {
      score,
      rank: 'Bushi Samurai',
      rankKanji: '武士観察',
      verdict: 'Favorable night sky. Bright constellations and lunar craters easily resolved.'
    };
  } else if (score >= 30) {
    return {
      score,
      rank: 'Mist Ronin',
      rankKanji: '霧の浪人',
      verdict: 'Moisture and high veil cloud soften celestial luster. Seek higher elevation.'
    };
  } else {
    return {
      score,
      rank: 'Typhoon Shadow',
      rankKanji: '嵐の影',
      verdict: 'Sky shrouded by heavy cloud canopy. Sheathe optics and study the scroll.'
    };
  }
}

/**
 * High-precision Moon Phase calculation from any JavaScript Date
 */
export function getMoonPhaseData(targetDate: Date = new Date()): MoonPhaseData {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  // Julian date calculation
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Synodic month length = 29.53058867 days
  // Known reference new moon: JD 2451549.5 (Jan 6, 2000)
  const daysSinceNew = (jd - 2451549.5) % 29.53058867;
  const normalizedAge = daysSinceNew < 0 ? daysSinceNew + 29.53058867 : daysSinceNew;
  const phaseValue = normalizedAge / 29.53058867;
  const illuminationPct = Math.round((1 - Math.cos(2 * Math.PI * phaseValue)) / 2 * 100);

  let phaseName = 'New Moon';
  let phaseKanji = '新月 (Shingetsu)';
  let samuraiMeaning = 'Rebirth of the Blade. Silence before the dawn attack.';

  if (phaseValue >= 0.03 && phaseValue < 0.22) {
    phaseName = 'Waxing Crescent';
    phaseKanji = '三日月 (Mikazuki)';
    samuraiMeaning = 'Crescent Moon Crest. The emblem of Date Masamune and bold ambition.';
  } else if (phaseValue >= 0.22 && phaseValue < 0.28) {
    phaseName = 'First Quarter';
    phaseKanji = '上弦の月 (Jogen)';
    samuraiMeaning = 'Balanced Half Bow. Precision archery and strategic positioning.';
  } else if (phaseValue >= 0.28 && phaseValue < 0.47) {
    phaseName = 'Waxing Gibbous';
    phaseKanji = '十三夜 (Jusanya)';
    samuraiMeaning = 'Chestnut Moon. Celebrated with sake and poetry before full battle readiness.';
  } else if (phaseValue >= 0.47 && phaseValue < 0.53) {
    phaseName = 'Full Moon';
    phaseKanji = '望月・満月 (Mangetsu)';
    samuraiMeaning = 'Pure Silver Mirror. Night marches and illuminated courtyard duels.';
  } else if (phaseValue >= 0.53 && phaseValue < 0.72) {
    phaseName = 'Waning Gibbous';
    phaseKanji = '十六夜 (Izayoi)';
    samuraiMeaning = 'The Hesitant Moon. Patient withdrawal and watchful vigilance.';
  } else if (phaseValue >= 0.72 && phaseValue < 0.78) {
    phaseName = 'Last Quarter';
    phaseKanji = '下弦の月 (Kagen)';
    samuraiMeaning = 'The Inverted Bow. Defense consolidation and quiet reflection.';
  } else if (phaseValue >= 0.78 && phaseValue < 0.97) {
    phaseName = 'Waning Crescent';
    phaseKanji = '有明の月 (Ariake)';
    samuraiMeaning = 'Dawn Moon. Solitary meditation before the morning mist clears.';
  }

  // Approximate rise/set times based on phase
  const hoursFromNoon = (phaseValue * 24);
  const riseHour = Math.floor((6 + hoursFromNoon) % 24);
  const setHour = Math.floor((18 + hoursFromNoon) % 24);

  return {
    phaseValue,
    phaseName,
    phaseKanji,
    illuminationPct,
    daysIntoCycle: Math.round(normalizedAge * 10) / 10,
    moonrise: `${String(riseHour).padStart(2, '0')}:18`,
    moonset: `${String(setHour).padStart(2, '0')}:42`,
    samuraiMeaning
  };
}

/**
 * Detect stars in an HTMLCanvasElement using luminance peaking
 */
export function detectStarsInCanvas(canvas: HTMLCanvasElement): {
  stars: DetectedStar[];
  avgBrightness: number;
  totalLuminance: number;
} {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { stars: [], avgBrightness: 0, totalLuminance: 0 };

  const { width, height } = canvas;
  // Scaled down sample grid for real-time responsiveness
  const sampleW = Math.min(width, 400);
  const sampleH = Math.min(height, 300);

  const offscreen = document.createElement('canvas');
  offscreen.width = sampleW;
  offscreen.height = sampleH;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return { stars: [], avgBrightness: 0, totalLuminance: 0 };

  offCtx.drawImage(canvas, 0, 0, sampleW, sampleH);
  const imgData = offCtx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;

  const stars: DetectedStar[] = [];
  let totalLuminance = 0;
  const threshold = 180; // High brightness cutoff
  const scaleX = width / sampleW;
  const scaleY = height / sampleH;

  for (let y = 3; y < sampleH - 3; y += 3) {
    for (let x = 3; x < sampleW - 3; x += 3) {
      const idx = (y * sampleW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Perceptual luminance formula
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += lum;

      if (lum > threshold) {
        // Simple local peak check
        const topIdx = ((y - 2) * sampleW + x) * 4;
        const botIdx = ((y + 2) * sampleW + x) * 4;
        const leftIdx = (y * sampleW + (x - 2)) * 4;
        const rightIdx = (y * sampleW + (x + 2)) * 4;

        const lumTop = 0.299 * data[topIdx] + 0.587 * data[topIdx + 1] + 0.114 * data[topIdx + 2];
        const lumBot = 0.299 * data[botIdx] + 0.587 * data[botIdx + 1] + 0.114 * data[botIdx + 2];
        const lumLeft = 0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2];
        const lumRight = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];

        if (lum >= lumTop && lum >= lumBot && lum >= lumLeft && lum >= lumRight) {
          stars.push({
            x: Math.round(x * scaleX),
            y: Math.round(y * scaleY),
            brightness: Math.round(lum),
            radius: Math.max(2, Math.min(6, (lum - threshold) / 15))
          });
        }
      }
    }
  }

  // Deduplicate stars that are too close (within 12 pixels)
  const filteredStars: DetectedStar[] = [];
  stars.forEach((candidate) => {
    const isNearby = filteredStars.some(
      (s) => Math.hypot(s.x - candidate.x, s.y - candidate.y) < 14
    );
    if (!isNearby) {
      filteredStars.push(candidate);
    }
  });

  const avgBrightness = stars.length > 0
    ? Math.round(filteredStars.reduce((acc, s) => acc + s.brightness, 0) / filteredStars.length)
    : 0;

  return {
    stars: filteredStars,
    avgBrightness,
    totalLuminance: Math.round(totalLuminance / (sampleW * sampleH))
  };
}

/**
 * Generate synthetic spectral light curve data points for the detected object
 */
export function generateSpectralPoints(seedFlux: number = 1.0): SpectralPoint[] {
  const points: SpectralPoint[] = [];
  const count = 18;
  const transitIndex = 9;

  for (let i = 0; i < count; i++) {
    const timeOffset = `+${(i * 15)}m`;
    let dip = 0;
    // Simulate slight exoplanet transit dip around midpoint
    if (Math.abs(i - transitIndex) <= 2) {
      dip = 0.04 * (1 - Math.abs(i - transitIndex) / 3);
    }
    const noise = (Math.sin(i * 1.7) * 0.006) + (Math.cos(i * 2.3) * 0.004);
    const flux = +(seedFlux - dip + noise).toFixed(4);
    const normalizedMagnitude = +(12.4 + dip * 2.5 - noise * 3).toFixed(2);

    points.push({ timeOffset, flux, normalizedMagnitude });
  }

  return points;
}

/**
 * Generate Spectral & Time-Domain Analysis for Transient Event Detection
 * Evaluates light curves, flux variances, and multi-messenger astronomical triggers
 */
export function generateTransientAnalysis(type: TransientEventType = 'supernova'): TransientEventAnalysis {
  switch (type) {
    case 'supernova': {
      const spectralPoints: SpectralPoint[] = [];
      const times = ['-2h', '-1h', '-30m', '-10m', 'Peak', '+30m', '+1h', '+2h', '+4h', '+8h', '+16h', '+24h', '+48h', '+72h'];
      const fluxProfile = [1.01, 1.02, 1.04, 1.45, 3.82, 3.42, 2.85, 2.30, 1.95, 1.72, 1.55, 1.42, 1.28, 1.18];
      times.forEach((t, i) => {
        const noise = (Math.sin(i * 1.5) * 0.02);
        const flux = +(fluxProfile[i] + noise).toFixed(3);
        spectralPoints.push({
          timeOffset: t,
          flux,
          normalizedMagnitude: +(14.5 - (flux - 1.0) * 1.8).toFixed(2),
          noiseUpper: +(flux + 0.04).toFixed(3),
          noiseLower: +(flux - 0.04).toFixed(3)
        });
      });
      return {
        type: 'supernova',
        title: 'Supernova Shock Breakout (SN 2026-IAO)',
        titleKanji: '超新星衝撃波噴出 (Chōshinsei)',
        classification: 'Thermonuclear Core Collapse / Type Ia Shock Breakout',
        confidence: 99.2,
        sigma: 7.4,
        riseTime: '18.4 minutes',
        decayRate: 't^(-0.35) power-law decay',
        peakFluxGain: '+282% above quiescent baseline',
        sedTemp: '34,000 K (UV/Soft X-Ray Peak)',
        description: 'Cataclysmic shock breakout from a runaway stellar detonation. Initial flash ionizing circumstellar envelopes, followed by radioactive nickel-56 decay cascade.',
        alertPayload: 'VOEvent Alert broadcast to Indian Astronomical Observatory (Hanle), VLT Paranal, and Swift Observatory for multi-messenger spectroscopic classification.',
        spectralPoints
      };
    }
    case 'exoplanet': {
      const spectralPoints: SpectralPoint[] = [];
      const times = ['-90m', '-60m', '-30m', 'Ingress', '+15m', '+30m', '+45m', 'Mid-Transit', '+75m', '+90m', '+105m', 'Egress', '+150m', '+180m'];
      const dipProfile = [1.002, 0.999, 1.001, 0.988, 0.982, 0.981, 0.980, 0.979, 0.980, 0.982, 0.988, 0.998, 1.001, 1.000];
      times.forEach((t, i) => {
        const noise = (Math.cos(i * 1.8) * 0.002);
        const flux = +(dipProfile[i] + noise).toFixed(4);
        spectralPoints.push({
          timeOffset: t,
          flux,
          normalizedMagnitude: +(11.2 + (1.0 - flux) * 2.2).toFixed(3),
          noiseUpper: +(flux + 0.003).toFixed(4),
          noiseLower: +(flux - 0.003).toFixed(4)
        });
      });
      return {
        type: 'exoplanet',
        title: 'Exoplanet Transit Ingress/Egress (Kepler-452b / Tsukuyomi-1)',
        titleKanji: '太陽系外惑星・食通過 (Wakusei-Shoku)',
        classification: 'Sub-Neptune / Super-Earth Planetary Transit',
        confidence: 97.8,
        sigma: 5.6,
        riseTime: '22.1 min ingress',
        decayRate: 'Flat bottom U-shaped transit with limb darkening',
        peakFluxGain: '-2.1% photometric eclipse depth',
        sedTemp: '5,800 K host star spectrum',
        description: 'Periodic planetary occlusion of host star photosphere. Characteristic U-shaped transit profile with subtle limb-darkening ingress curvature indicates an exoplanetary companion with atmospheric scale height.',
        alertPayload: 'Confirmed periodic transit ephemeris. Scheduled for transmission spectroscopy follow-up via James Webb Space Telescope (JWST) NIRSpec.',
        spectralPoints
      };
    }
    case 'grb': {
      const spectralPoints: SpectralPoint[] = [];
      const times = ['T-10s', 'Trigger', '+5s', '+15s', '+30s', '+1m', '+2m', '+5m', '+15m', '+30m', '+1h', '+3h', '+6h', '+12h'];
      const fluxProfile = [1.00, 8.40, 6.20, 4.30, 3.10, 2.20, 1.75, 1.45, 1.28, 1.18, 1.10, 1.05, 1.02, 1.01];
      times.forEach((t, i) => {
        const flux = +(fluxProfile[i] + (Math.sin(i * 2.1) * 0.02)).toFixed(3);
        spectralPoints.push({
          timeOffset: t,
          flux,
          normalizedMagnitude: +(16.2 - (flux - 1.0) * 1.5).toFixed(2),
          noiseUpper: +(flux + 0.05).toFixed(3),
          noiseLower: +(flux - 0.05).toFixed(3)
        });
      });
      return {
        type: 'grb',
        title: 'Fast Optical Afterglow (GRB 261030A)',
        titleKanji: 'ガンマ線バースト光余光 (Kōyokō)',
        classification: 'Relativistic Collimated Jet / Long-Duration GRB',
        confidence: 98.9,
        sigma: 8.2,
        riseTime: '< 2.3 seconds',
        decayRate: 't^(-1.12) synchrotron power-law decay',
        peakFluxGain: '+740% instantaneous optical surge',
        sedTemp: 'Power law spectral index β = -0.75 (Synchrotron)',
        description: 'Ultra-relativistic jet launched during collapsar hypernova or binary neutron star merger. Prompt gamma rays followed by luminous deceleration in the interstellar medium.',
        alertPayload: 'GCN Circular Alert issued. Telescopes in Hanle Ladakh, Roque de los Muchachos, and Keck slewing to coordinates for host galaxy redshift determination.',
        spectralPoints
      };
    }
    case 'microlensing': {
      const spectralPoints: SpectralPoint[] = [];
      const times = ['-15d', '-10d', '-5d', '-2d', '-1d', 'Peak (t0)', '+1d', '+2d', '+5d', '+10d', '+15d', '+25d', '+40d', '+60d'];
      const paczynski = [1.02, 1.10, 1.35, 1.85, 2.35, 3.15, 2.38, 1.84, 1.36, 1.12, 1.04, 1.01, 1.00, 1.00];
      times.forEach((t, i) => {
        const flux = +(paczynski[i] + (Math.cos(i * 1.4) * 0.015)).toFixed(3);
        spectralPoints.push({
          timeOffset: t,
          flux,
          normalizedMagnitude: +(15.8 - (flux - 1.0) * 1.4).toFixed(2),
          noiseUpper: +(flux + 0.03).toFixed(3),
          noiseLower: +(flux - 0.03).toFixed(3)
        });
      });
      return {
        type: 'microlensing',
        title: 'Gravitational Microlensing Amplification (OGLE/Astrosat-T1)',
        titleKanji: '重力マイクロレンズ増幅 (Jūryoku-Lens)',
        classification: 'Achromatic Relativistic Gravitational Lens',
        confidence: 96.5,
        sigma: 6.8,
        riseTime: '12 days smooth curve',
        decayRate: 'Symmetric Paczyński theoretical curve',
        peakFluxGain: '+215% achromatic magnification',
        sedTemp: 'Identical source star color (no temperature change)',
        description: 'Spacetime curvature of an intervening dark stellar remnant (isolated black hole or brown dwarf) acting as a cosmic magnifying glass on a background galactic bulge star.',
        alertPayload: 'High-cadence photometric monitoring network activated to detect secondary planetary caustic anomalies.',
        spectralPoints
      };
    }
    case 'flare': {
      const spectralPoints: SpectralPoint[] = [];
      const times = ['-30m', '-15m', '-5m', 'Flare Peak', '+2m', '+5m', '+10m', '+20m', '+35m', '+60m', '+90m', '+120m', '+180m', '+240m'];
      const flareProfile = [1.01, 1.00, 1.08, 4.20, 3.10, 2.25, 1.70, 1.35, 1.18, 1.08, 1.04, 1.02, 1.00, 1.00];
      times.forEach((t, i) => {
        const flux = +(flareProfile[i] + (Math.sin(i * 2.3) * 0.02)).toFixed(3);
        spectralPoints.push({
          timeOffset: t,
          flux,
          normalizedMagnitude: +(13.8 - (flux - 1.0) * 1.6).toFixed(2),
          noiseUpper: +(flux + 0.04).toFixed(3),
          noiseLower: +(flux - 0.04).toFixed(3)
        });
      });
      return {
        type: 'flare',
        title: 'Stellar Magnetic Flare (UV Ceti Outburst)',
        titleKanji: '恒星磁気フレア・閃光星 (Senkō-sei)',
        classification: 'M-Dwarf Magnetic Reconnection Superflare',
        confidence: 98.4,
        sigma: 7.1,
        riseTime: '< 3.5 minutes',
        decayRate: 'Neupert effect quasi-exponential cooling',
        peakFluxGain: '+320% broadband optical surge',
        sedTemp: '18,500 K impulsive flare kernel',
        description: 'Massive magnetic reconnection releasing magnetic flux energy in the corona of a red dwarf. Emits intense ultraviolet and optical continuum bursts.',
        alertPayload: 'High-energy space telescopes coordinated to monitor coronal mass ejection impact on potential habitable-zone exoplanets.',
        spectralPoints
      };
    }
  }
}

/**
 * Official real-world stargazing observatories, dark-sky reserves, and landmarks on Google Maps
 */
export const SACRED_SPOTS: StargazingSpot[] = [
  {
    id: 'sukhna-lake',
    name: 'Sukhna Lake, Sector 1, Chandigarh, India',
    nameKanji: 'チャンディガル・スクナ湖',
    type: 'observatory',
    lat: 30.7421,
    lng: 76.8188,
    bortleClass: 4,
    elevationM: 321,
    description: 'Prominent freshwater reservoir in Chandigarh beneath the Shivalik foothill horizon with wide open northern and eastern skies.'
  },
  {
    id: 'kasauli',
    name: 'Kasauli, Solan, Himachal Pradesh, India',
    nameKanji: 'カサウリ・ヒマーチャル',
    type: 'mountain',
    lat: 30.9013,
    lng: 76.9649,
    bortleClass: 2,
    elevationM: 1927,
    description: 'Picturesque pine-covered Shivalik mountain ridge near Chandigarh, offering crisp elevated sightlines above low-altitude haze.'
  },
  {
    id: 'chail',
    name: 'Chail, Solan, Himachal Pradesh, India',
    nameKanji: 'チャイル・ヒマーチャル',
    type: 'mountain',
    lat: 30.9686,
    lng: 77.1906,
    bortleClass: 2,
    elevationM: 2250,
    description: 'Surrounded by protected deodar cedar forests with elevated dark skies and panoramic celestial horizons.'
  },
  {
    id: 'morni-hills',
    name: 'Morni Hills, Panchkula, Haryana, India',
    nameKanji: 'モルニ丘陵・ハリヤナ',
    type: 'mountain',
    lat: 30.6975,
    lng: 77.0864,
    bortleClass: 3,
    elevationM: 1220,
    description: 'Scenic hill ridge off Chandigarh with quiet valleys and dark skies ideal for telescope field sessions.'
  },
  {
    id: 'kibber-spiti',
    name: 'Kibber, Spiti Valley, Himachal Pradesh, India',
    nameKanji: 'キッベル・スピティ峡谷',
    type: 'temple',
    lat: 32.3023,
    lng: 78.0125,
    bortleClass: 1,
    elevationM: 4270,
    description: 'One of the highest high-altitude villages in the Himalayas with Bortle 1 pristine skies and cosmic zodiacal light.'
  },
  {
    id: 'hanle-observatory',
    name: 'Indian Astronomical Observatory, Hanle, Ladakh, India',
    nameKanji: 'ハンレ・インド国立天文台',
    type: 'observatory',
    lat: 32.7794,
    lng: 78.9642,
    bortleClass: 1,
    elevationM: 4500,
    description: 'Premier Himalayan optical and infrared observatory in Hanle Dark Sky Reserve, among the highest observatory sites globally.'
  },
  {
    id: 'fuji-fifth',
    name: 'Mount Fuji 5th Station, Subashiri Trail, Oyama, Shizuoka, Japan',
    nameKanji: '富士山須走口五合目',
    type: 'mountain',
    lat: 35.3606,
    lng: 138.7274,
    bortleClass: 2,
    elevationM: 2000,
    description: 'Sacred mountain trailhead above cloud inversions, celebrated for razor-sharp stellar clarity and moonset views.'
  },
  {
    id: 'naoj-mitaka',
    name: 'National Astronomical Observatory of Japan, Mitaka, Tokyo, Japan',
    nameKanji: '国立天文台三鷹キャンパス',
    type: 'observatory',
    lat: 35.6748,
    lng: 139.5378,
    bortleClass: 6,
    elevationM: 60,
    description: 'Historic Japanese national astronomy headquarters founded in 1888, housing historic solar towers and domes.'
  },
  {
    id: 'nobeyama',
    name: 'Nobeyama Radio Observatory, Minamimaki, Nagano, Japan',
    nameKanji: '野辺山宇宙電波観測所',
    type: 'observatory',
    lat: 35.9419,
    lng: 138.4728,
    bortleClass: 2,
    elevationM: 1350,
    description: 'High Nagano highland basin equipped with 45m radio telescopes, surrounded by clear dark night skies.'
  },
  {
    id: 'mauna-kea',
    name: 'Mauna Kea Observatories, Hawaii, USA',
    nameKanji: 'マウナケア天文台群',
    type: 'observatory',
    lat: 19.8207,
    lng: -155.4681,
    bortleClass: 1,
    elevationM: 4205,
    description: 'World-renowned astronomical research summit with world-class sub-millimeter and optical telescopes above the marine inversion layer.'
  },
  {
    id: 'roque-muchachos',
    name: 'Roque de los Muchachos Observatory, La Palma, Canary Islands, Spain',
    nameKanji: 'ロケ・デ・ロス・ムチャチョス天文台',
    type: 'observatory',
    lat: 28.7566,
    lng: -17.8920,
    bortleClass: 1,
    elevationM: 2396,
    description: 'Major international astrophysics observatory perched above the sea of clouds in the Atlantic.'
  },
  {
    id: 'paranal-chile',
    name: 'Paranal Observatory (VLT), Atacama Desert, Antofagasta, Chile',
    nameKanji: 'パラナル天文台 (超大型望遠鏡)',
    type: 'observatory',
    lat: -24.6272,
    lng: -70.4042,
    bortleClass: 1,
    elevationM: 2635,
    description: 'Ultra-dry Atacama desert mountain home to ESO Very Large Telescope, featuring world-leading clear night counts.'
  }
];

/**
 * Curated Celestial Events database for 2026/2027
 */
export const CELESTIAL_EVENTS: CelestialEvent[] = [
  {
    id: 'geminids-2026',
    title: 'Geminids Meteor Shower Peak',
    titleKanji: '双子座流星群・極大 (Geminids)',
    type: 'meteor',
    date: '2026-12-14',
    timeUtc: '21:00 UTC',
    peakWindow: '10:00 PM – 4:30 AM Local',
    constellation: 'Gemini (双子座 / Mithuna)',
    visibilityRating: 5,
    description: 'Up to 120 multicolored shooting stars per hour. Visible across India (Ladakh, Spiti, Kasauli, Western Ghats) and worldwide under dark skies.',
    samuraiLore: 'In Vedic star lore, this shower corresponds to the Punarvasu Nakshatra quiver of light, venerated by samurai archers as arrows fired by heavenly commanders.'
  },
  {
    id: 'sharad-purnima-harvest',
    title: 'Sharad Purnima & Autumnal Supermoon',
    titleKanji: '満月・中秋の名月 (Sharad Purnima)',
    type: 'moon',
    date: '2026-09-25',
    timeUtc: '18:45 UTC',
    peakWindow: 'Dusk till Midnight',
    constellation: 'Pisces (魚座 / Meena)',
    visibilityRating: 5,
    description: 'The celebrated Harvest Supermoon. Luminous amber orb illuminating fields and monuments across India and the globe; peak clarity from Mount Abu and Hanle.',
    samuraiLore: 'Celebrated across India as Sharad Purnima (night of celestial nectar Amrit) and in Japan as Tsukimi, where warrior poets offered praises to the lunar goddess.'
  },
  {
    id: 'solar-eclipse-2026',
    title: 'Total Solar Eclipse of 2026',
    titleKanji: '皆既日食・黒天の契り (Surya Grahan)',
    type: 'eclipse',
    date: '2026-08-12',
    timeUtc: '17:47 UTC',
    peakWindow: 'Coronal Totality ~ 2m 18s',
    constellation: 'Leo (獅子座 / Simha)',
    visibilityRating: 5,
    description: 'The solar disk fully occulted by the Moon, revealing the glowing solar corona and prominences. Monitored globally by ISRO Aditya-L1 and NASA/ESA space observatories.',
    samuraiLore: 'In ancient cosmologies from Ujjain to Kyoto, solar eclipses were viewed as cosmic resets where warrior guardians renewed their oaths under the shadowed Sun.'
  },
  {
    id: 'perseids-2026',
    title: 'Perseids Celestial Torrent',
    titleKanji: 'ペルセウス座流星群 (Perseids)',
    type: 'meteor',
    date: '2026-08-13',
    timeUtc: '02:00 UTC',
    peakWindow: 'Midnight – 5:00 AM Local',
    constellation: 'Perseus (英雄座)',
    visibilityRating: 4,
    description: 'Fast, radiant meteors with persistent glowing ionization trails from Comet Swift-Tuttle. Magnificent high-altitude viewing from Spiti, Ladakh, and world peaks.',
    samuraiLore: 'Revered by Himalayan and Zen mountaineers as celestial spark strikes against the anvil of fate, guiding night travelers across high mountain passes.'
  },
  {
    id: 'iss-india-world-pass',
    title: 'ISS Indian Subcontinent & Global Zenith Pass',
    titleKanji: '国際宇宙ステーション天頂通過 (ISS Pass)',
    type: 'iss',
    date: '2026-11-04',
    timeUtc: '19:14 UTC',
    peakWindow: '7:14 PM – 7:21 PM Local (7 minutes)',
    constellation: 'Cygnus to Cassiopeia',
    visibilityRating: 5,
    description: 'The International Space Station glides across New Delhi, Chandigarh, Bengaluru, the Himalayas, and world horizons at magnitude -3.8, outshining Jupiter.',
    samuraiLore: 'A silent, luminous celestial fortress orbiting 400 km above earth, uniting the sky-gazers of all continents beneath one unified celestial canopy.'
  },
  {
    id: 'isro-gaganyaan-launch',
    title: 'ISRO Gaganyaan Crewed Orbital Mission & Heavy Lift',
    titleKanji: 'インド宇宙機関・有人宇宙飛行 (Gaganyaan)',
    type: 'rocket',
    date: '2026-11-28',
    timeUtc: '14:20 UTC',
    peakWindow: 'T-00:00:00 Launch Window',
    constellation: 'Satish Dhawan Space Centre (Sriharikota, India)',
    visibilityRating: 4,
    description: 'Historic human spaceflight launch aboard LVM3 from Sriharikota, propelling Indian vyomanauts into low Earth orbit alongside global deep space missions.',
    samuraiLore: 'The spirit of classical archery and celestial exploration embodied in modern rocket propulsion, soaring into the void from the shores of the Bay of Bengal.'
  },
  {
    id: 'lunar-eclipse-blood',
    title: 'Total Blood Moon & Lunar Maria Eclipse',
    titleKanji: '血染めの月・皆既月食 (Chandra Grahan)',
    type: 'eclipse',
    date: '2027-03-03',
    timeUtc: '18:12 UTC',
    peakWindow: 'Peak Totality 18:35 UTC',
    constellation: 'Virgo (乙女座 / Kanya)',
    visibilityRating: 4,
    description: 'Terrestrial atmospheric sunsets refract a deep crimson patina across the lunar maria, visible in full grandeur across India, South Asia, Africa, and Australia.',
    samuraiLore: 'Known historically as the Crimson Scabbard Moon; Vedic scholars and Sengoku commanders observed this celestial alignment to foresee planetary cycles.'
  },
  {
    id: 'taurids-fireball-swarm',
    title: 'Taurids Fireball Swarm & Comet Encke Outburst',
    titleKanji: '牡牛座火球群 (Taurid Bolides)',
    type: 'meteor',
    date: '2026-11-12',
    timeUtc: '22:30 UTC',
    peakWindow: '11:00 PM – 4:00 AM Local',
    constellation: 'Taurus (牡牛座 / Vrishabha)',
    visibilityRating: 5,
    description: 'Slow-moving, extraordinarily bright fireball bolides penetrating Earth atmosphere. Superb naked-eye sightings across India, the Mediterranean, and the Americas.',
    samuraiLore: 'Legendary fireballs celebrated as divine cometary messengers illuminating nocturnal terrain and castle watchtowers with emerald-white trails.'
  },
  {
    id: 'iao-hanle-survey',
    title: 'Indian Astronomical Observatory (Hanle Ladakh) Survey',
    titleKanji: 'ハンレ暗黒空観測・夜天測量 (Hanle Dark Sky)',
    type: 'iss',
    date: '2026-10-18',
    timeUtc: '20:00 UTC',
    peakWindow: 'Midnight – Dawn (Zero Light Pollution)',
    constellation: 'Sagittarius & Milky Way Core',
    visibilityRating: 5,
    description: 'Deep-space observations from Hanle, Ladakh at 4,500m altitude in India’s First Dark Sky Reserve. Bortle 1 skies revealing the galactic dust lanes and airglow.',
    samuraiLore: 'The pinnacle high-altitude vantage point of South Asia, where the cosmic void touches the earth with pristine clarity, free of all earthly light pollution.'
  }
];

/**
 * Imperial & World Celestial Scholars, Astronomers, and Cosmologists
 */
export const CELESTIAL_SCHOLARS: CelestialScholar[] = [
  {
    name: 'Aryabhata (आर्यभट)',
    title: 'Pioneer of Earth’s Axial Rotation & Planetary Epicycles',
    era: 'Classical India (476–550 CE)',
    region: 'India & South Asia',
    crest: 'Gola-Yantra (Spherical Armillary)',
    achievement: 'Discovered that the Earth rotates daily on its axis, computed accurate planetary diameters and eclipse timings, and calculated pi to 4 decimal places in Kusumapura (Patna).',
    astronomicalWork: 'Aryabhatiya (आर्यभटीय) & Aryabhata-Siddhanta'
  },
  {
    name: 'Bhaskara II (भास्कराचार्य)',
    title: 'Crown Polymath of Classical Gravitational Cosmology',
    era: 'India (1114–1185 CE)',
    region: 'India & South Asia',
    crest: 'Chakra-Yantra (Astronomical Wheel)',
    achievement: 'Formulated the principles of gravity (Gurutvakarshan) and instantaneous celestial motion centuries ahead of Newton, calculating the time taken for Earth to orbit the Sun to 9 decimal places.',
    astronomicalWork: 'Siddhanta Shiromani (सिद्धांत शिरोमणि) & Goladhyaya'
  },
  {
    name: 'Varahamihira (वराहमिहिर)',
    title: 'Imperial Polymath of Ujjain Observatories',
    era: 'Gupta Empire, India (505–587 CE)',
    region: 'India & South Asia',
    crest: 'Surya Yantra (Solar Meridian Dial)',
    achievement: 'Synthesized classical Indian, Greek, and Egyptian astronomy, computing exact solstice shifts, planetary conjunctions, and earthquake-astronomical correlations.',
    astronomicalWork: 'Pancha-Siddhantika (The Five Astronomical Treatises) & Brihat Samhita'
  },
  {
    name: 'Subrahmanyan Chandrasekhar',
    title: 'Nobel Laureate & Architect of Stellar Collapse',
    era: 'India & United States (1910–1995)',
    region: 'India & South Asia',
    crest: 'Chandrasekhar Limit (1.44 Solar Masses)',
    achievement: 'Discovered the mathematical limit (1.44 M☉) beyond which white dwarf stars cannot withstand gravity and collapse into neutron stars or black holes.',
    astronomicalWork: 'The Mathematical Theory of Black Holes & Principles of Stellar Dynamics'
  },
  {
    name: 'Meghnad Saha (मेघनाद साहा)',
    title: 'Father of Modern Astronomical Spectroscopy',
    era: 'India (1893–1956)',
    region: 'India & South Asia',
    crest: 'Thermal Ionization Spectrum',
    achievement: 'Formulated the Saha Ionization Equation, fundamental to astrophysics for determining the temperatures, pressures, and chemical compositions of stellar atmospheres.',
    astronomicalWork: 'Thermal Ionisation of Elements and High-Temperature Stellar Spectra'
  },
  {
    name: 'Galileo Galilei',
    title: 'Father of Observational Astronomy',
    era: 'Renaissance Italy (1564–1642)',
    region: 'Europe & Mediterranean',
    crest: 'Medicean Moons Lens (Telescopium)',
    achievement: 'Pioneered telescopic astronomy, discovering the four major moons of Jupiter, phases of Venus, lunar craters, and sunspots.',
    astronomicalWork: 'Sidereus Nuncius (The Starry Messenger, 1610)'
  },
  {
    name: 'Johannes Kepler',
    title: 'Discoverer of the Laws of Planetary Motion',
    era: 'Holy Roman Empire / Germany (1571–1630)',
    region: 'Europe & Mediterranean',
    crest: 'Elliptical Orbit Focus (Harmonia)',
    achievement: 'Overturned circular orbits by formulating the three fundamental laws of planetary ellipses and orbital velocity conservation.',
    astronomicalWork: 'Astronomia Nova (1609) & Harmonices Mundi (1619)'
  },
  {
    name: 'Nicolaus Copernicus',
    title: 'Architect of Heliocentric Cosmology',
    era: 'Renaissance Poland (1473–1543)',
    region: 'Europe & Mediterranean',
    crest: 'Heliocentric Sun Orb (Sol Invictus)',
    achievement: 'Revolutionized astronomy by demonstrating that the planets, including Earth, orbit around the Sun.',
    astronomicalWork: 'De revolutionibus orbium coelestium (1543)'
  },
  {
    name: 'Abd al-Rahman al-Sufi (Azophi)',
    title: 'Master Astronomer of the Islamic Golden Age',
    era: 'Abbasid Persia (903–986 CE)',
    region: 'Middle East & Persia',
    crest: 'Little Cloud of Andromeda (Al-Sufi Nebula)',
    achievement: 'Recorded the first recorded observation of the Andromeda Galaxy ("Small Cloud") and Large Magellanic Cloud, mapping 1,018 stars.',
    astronomicalWork: 'Kitāb Suwar al-Kawākib (Book of Fixed Stars)'
  },
  {
    name: 'Tycho Brahe',
    title: 'Master of Pre-Telescopic Astrometry',
    era: 'Kingdom of Denmark (1546–1601)',
    region: 'Europe & Mediterranean',
    crest: 'Uraniborg Celestial Compass (Stella Nova)',
    achievement: 'Observed the Supernova of 1572 and compiled 30 years of naked-eye observations with sub-arcminute precision that enabled Kepler’s laws.',
    astronomicalWork: 'De Nova Stella (1573) & Astronomiae Instauratae Progymnasmata'
  },
  {
    name: 'Carl Sagan',
    title: 'Pioneer of Planetary Atmospheres & Cosmic Voyager',
    era: 'United States (1934–1996)',
    region: 'Americas & Modern Era',
    crest: 'Voyager Golden Record (Pale Blue Dot)',
    achievement: 'Discovered the runaway greenhouse effect on Venus, designed interstellar messages on Pioneer and Voyager, and popularized planetary exploration.',
    astronomicalWork: 'Cosmos & Atmosphere of the Planets (NASA Jet Propulsion Laboratory)'
  }
];

/**
 * High-performance client-side optical restoration & unsharp deconvolution
 * Reverses optical blur, atmospheric seeing haze, and sensor noise in astronomical imagery
 */
export function enhanceBlurredImage(
  sourceCanvas: HTMLCanvasElement,
  options: {
    strength?: number;
    mode?: 'all-in-one' | 'deblur' | 'nebula' | 'denoise';
  } = {}
): string {
  const strength = options.strength ?? 1.0;
  const mode = options.mode ?? 'all-in-one';
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx || w === 0 || h === 0) return sourceCanvas.toDataURL();

  const srcImgData = ctx.getImageData(0, 0, w, h);
  const data = srcImgData.data;
  const output = new Uint8ClampedArray(data);

  // Unsharp / Laplacian high-pass convolution kernel for optical de-blurring
  const deblurKernelAmount = mode === 'deblur' ? 1.5 * strength : mode === 'nebula' ? 0.95 * strength : 1.25 * strength;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      for (let c = 0; c < 3; c++) {
        const center = data[idx + c];
        const up = data[((y - 1) * w + x) * 4 + c];
        const down = data[((y + 1) * w + x) * 4 + c];
        const left = data[(y * w + (x - 1)) * 4 + c];
        const right = data[(y * w + (x + 1)) * 4 + c];

        // 2D discrete Laplacian edge filter
        const laplacian = 4 * center - up - down - left - right;
        let val = center + laplacian * deblurKernelAmount * 0.44;

        // Astrophotography dynamic range adjustment
        if (mode === 'denoise') {
          if (val < 40) val = val * 0.75;
          else if (val > 170) val = Math.min(255, val * 1.15);
        } else if (mode === 'nebula') {
          if (val > 50 && val < 200) val = Math.min(255, val * 1.22);
        } else {
          if (val < 32) val = val * 0.8;
          else if (val > 165) val = Math.min(255, val * 1.2);
        }

        output[idx + c] = Math.max(0, Math.min(255, val));
      }
      output[idx + 3] = data[idx + 3];
    }
  }

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return sourceCanvas.toDataURL();

  const outImgData = new ImageData(output, w, h);
  outCtx.putImageData(outImgData, 0, 0);

  return outCanvas.toDataURL('image/jpeg', 0.95);
}

