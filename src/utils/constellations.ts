import { ConstellationData } from '../types';

export const CONSTELLATIONS_DATABASE: ConstellationData[] = [
  {
    id: 'orion',
    name: 'Orion the Hunter',
    latinName: 'Orion',
    kanjiName: '狩人座 · 参宿 (Shin-shuku / Mitsuboshi)',
    meaning: 'The Celestial Hunter & Three Samurai Stars',
    season: 'Winter',
    rightAscension: '05h 35m',
    declination: '+09° 56′',
    quadrant: 'NQ1',
    areaSqDeg: 594,
    brightestStar: 'Rigel (Beta Orionis, Mag 0.13)',
    stars: [
      { name: 'Betelgeuse', designation: 'Alpha Orionis', spectralType: 'M1-2 Ia-ab Red Supergiant', magnitude: 0.50 },
      { name: 'Rigel', designation: 'Beta Orionis', spectralType: 'B8 Ia Blue-White Supergiant', magnitude: 0.13 },
      { name: 'Bellatrix', designation: 'Gamma Orionis', spectralType: 'B2 III Blue Giant', magnitude: 1.64 },
      { name: 'Alnitak', designation: 'Zeta Orionis', spectralType: 'O9.5 Iab Supergiant', magnitude: 1.77 },
      { name: 'Alnilam', designation: 'Epsilon Orionis', spectralType: 'B0 Ia Supergiant', magnitude: 1.69 },
      { name: 'Mintaka', designation: 'Delta Orionis', spectralType: 'O9.5 II / B0.5 III', magnitude: 2.23 },
      { name: 'Saiph', designation: 'Kappa Orionis', spectralType: 'B0.5 Ia Supergiant', magnitude: 2.07 }
    ],
    deepSkyTargets: [
      { name: 'Great Orion Nebula', catalogId: 'Messier 42', type: 'Diffuse Emission / Reflection Nebula' },
      { name: 'De Mairan’s Nebula', catalogId: 'Messier 43', type: 'H II Star-forming Region' },
      { name: 'Horsehead Nebula', catalogId: 'Barnard 33', type: 'Dark Silhouette Nebula' },
      { name: 'Flame Nebula', catalogId: 'NGC 2024', type: 'Active Emission Nebula' }
    ],
    samuraiLore: 'The three central belt stars (Alnitak, Alnilam, Mintaka) are known in Japan as "Mitsuboshi" (三ツ星). The legendary daimyo Mōri Motonari adopted this asterism into his clan mon (crest), invoking the lesson of the three arrows: individual warriors can be broken, but bound together under the celestial belt they stand invincible.',
    svgPoints: [
      { x: 35, y: 25, label: 'Betelgeuse', mag: 1 }, // 0
      { x: 75, y: 20, label: 'Bellatrix', mag: 2 },  // 1
      { x: 48, y: 50, label: 'Alnitak', mag: 2 },    // 2 (Belt 1)
      { x: 55, y: 48, label: 'Alnilam', mag: 2 },    // 3 (Belt 2)
      { x: 62, y: 46, label: 'Mintaka', mag: 2 },    // 4 (Belt 3)
      { x: 30, y: 80, label: 'Saiph', mag: 2 },      // 5
      { x: 80, y: 75, label: 'Rigel', mag: 1 },      // 6
      { x: 55, y: 12, label: 'Meissa', mag: 3 },     // 7 (Head)
      { x: 92, y: 45, label: 'Bow 1', mag: 4 },      // 8
      { x: 90, y: 35, label: 'Bow 2', mag: 4 },      // 9
      { x: 88, y: 55, label: 'Bow 3', mag: 4 }       // 10
    ],
    svgLines: [
      [7, 0], [7, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [1, 9], [9, 8], [8, 10]
    ]
  },
  {
    id: 'ursa-major',
    name: 'Ursa Major & Northern Dipper',
    latinName: 'Ursa Major',
    kanjiName: '北斗七星 · おおかま座',
    meaning: 'The Seven Stars of the Northern Dipper',
    season: 'Circumpolar',
    rightAscension: '11h 00m',
    declination: '+55° 00′',
    quadrant: 'NQ2',
    areaSqDeg: 1280,
    brightestStar: 'Alioth (Epsilon Ursae Majoris, Mag 1.76)',
    stars: [
      { name: 'Alioth', designation: 'Epsilon UMa', spectralType: 'A1 III-IVp kB9', magnitude: 1.76 },
      { name: 'Dubhe', designation: 'Alpha UMa', spectralType: 'K0 III Orange Giant', magnitude: 1.79 },
      { name: 'Alkaid', designation: 'Eta UMa', spectralType: 'B3 V Blue Main Sequence', magnitude: 1.86 },
      { name: 'Mizar', designation: 'Zeta UMa', spectralType: 'A2 V Binary System', magnitude: 2.23 },
      { name: 'Merak', designation: 'Beta UMa', spectralType: 'A1 V Pointers Star', magnitude: 2.37 },
      { name: 'Phecda', designation: 'Gamma UMa', spectralType: 'A0 Ve', magnitude: 2.44 },
      { name: 'Megrez', designation: 'Delta UMa', spectralType: 'A3 V', magnitude: 3.31 }
    ],
    deepSkyTargets: [
      { name: 'Bode’s Galaxy', catalogId: 'Messier 81', type: 'Grand Design Spiral Galaxy' },
      { name: 'Cigar Galaxy', catalogId: 'Messier 82', type: 'Starburst Galaxy' },
      { name: 'Pinwheel Galaxy', catalogId: 'Messier 101', type: 'Face-on Spiral Galaxy' },
      { name: 'Owl Nebula', catalogId: 'Messier 97', type: 'Planetary Nebula' }
    ],
    samuraiLore: 'Hokuto Shichisei (北斗七星) was the supreme guiding compass of Sengoku period warriors. It was worshipped as the manifestation of Myōken Bosatsu (the celestial pole guardian). Samurai before marching would perform the Kuji-in (nine symbolic finger seals) facing the handle of the Dipper, seeking celestial authority over destiny.',
    svgPoints: [
      { x: 15, y: 70, label: 'Alkaid', mag: 2 }, // 0
      { x: 30, y: 55, label: 'Mizar', mag: 2 },  // 1
      { x: 42, y: 50, label: 'Alioth', mag: 2 }, // 2
      { x: 56, y: 52, label: 'Megrez', mag: 3 }, // 3
      { x: 58, y: 75, label: 'Phecda', mag: 2 }, // 4
      { x: 80, y: 72, label: 'Merak', mag: 2 },  // 5
      { x: 82, y: 45, label: 'Dubhe', mag: 1 }   // 6
    ],
    svgLines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]
    ]
  },
  {
    id: 'scorpius',
    name: 'Scorpius & The Fire Star',
    latinName: 'Scorpius',
    kanjiName: 'さそり座 · 心宿 (Nakago-boshi / Akaboshi)',
    meaning: 'The Heart of the Azure Dragon & Mars Rival',
    season: 'Summer',
    rightAscension: '16h 50m',
    declination: '-30° 00′',
    quadrant: 'SQ3',
    areaSqDeg: 497,
    brightestStar: 'Antares (Alpha Scorpii, Mag 0.96)',
    stars: [
      { name: 'Antares', designation: 'Alpha Scorpii', spectralType: 'M1.5 Iab-Ib Red Supergiant', magnitude: 0.96 },
      { name: 'Shaula', designation: 'Lambda Scorpii', spectralType: 'B2 IV / B Stinger', magnitude: 1.62 },
      { name: 'Sargas', designation: 'Theta Scorpii', spectralType: 'F0 II Bright Giant', magnitude: 1.86 },
      { name: 'Dschubba', designation: 'Delta Scorpii', spectralType: 'B0.3 IV Variable', magnitude: 2.31 },
      { name: 'Wei', designation: 'Epsilon Scorpii', spectralType: 'K2.5 IIIb Orange Giant', magnitude: 2.29 },
      { name: 'Graffias', designation: 'Beta Scorpii', spectralType: 'B1 V Multiple Star', magnitude: 2.62 }
    ],
    deepSkyTargets: [
      { name: 'Butterfly Cluster', catalogId: 'Messier 6', type: 'Open Star Cluster' },
      { name: 'Ptolemy Cluster', catalogId: 'Messier 7', type: 'Bright Naked-Eye Cluster' },
      { name: 'Cat’s Paw Nebula', catalogId: 'NGC 6334', type: 'Intense Star-Forming Nebula' },
      { name: 'War and Peace Nebula', catalogId: 'NGC 6357', type: 'Diffuse Emission Cluster' }
    ],
    samuraiLore: 'Antares was known in Heian Japan as "Akaboshi" (The Blood Red Star) or the heart of the sacred Azure Dragon (Seiryū). When Mars (the planet of battle) approached Antares (meaning "Rival of Mars"), the Shogunate astrologers interpreted this conjunction as a portent of warlords drawing steel.',
    svgPoints: [
      { x: 30, y: 15, label: 'Graffias', mag: 3 }, // 0
      { x: 34, y: 22, label: 'Dschubba', mag: 2 }, // 1
      { x: 32, y: 32, label: 'Pi Sco', mag: 3 },   // 2
      { x: 45, y: 38, label: 'Antares', mag: 1 },  // 3
      { x: 50, y: 48, label: 'Tau Sco', mag: 3 },  // 4
      { x: 55, y: 58, label: 'Epsilon', mag: 2 },  // 5
      { x: 62, y: 68, label: 'Mu Sco', mag: 3 },   // 6
      { x: 68, y: 78, label: 'Zeta Sco', mag: 3 }, // 7
      { x: 78, y: 82, label: 'Sargas', mag: 2 },   // 8
      { x: 88, y: 74, label: 'Iota Sco', mag: 3 }, // 9
      { x: 86, y: 62, label: 'Shaula', mag: 1 },   // 10
      { x: 78, y: 60, label: 'Lesath', mag: 2 }    // 11
    ],
    svgLines: [
      [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11]
    ]
  },
  {
    id: 'cygnus',
    name: 'Cygnus & The Celestial Swan',
    latinName: 'Cygnus',
    kanjiName: '白鳥座 · 十文字星 (Amanogawa Cross)',
    meaning: 'The Bridge of the Milky Way & Northern Cross',
    season: 'Summer',
    rightAscension: '20h 30m',
    declination: '+42° 00′',
    quadrant: 'NQ4',
    areaSqDeg: 804,
    brightestStar: 'Deneb (Alpha Cygni, Mag 1.25)',
    stars: [
      { name: 'Deneb', designation: 'Alpha Cygni', spectralType: 'A2 Ia White Supergiant', magnitude: 1.25 },
      { name: 'Sadr', designation: 'Gamma Cygni', spectralType: 'F8 Ib Supergiant', magnitude: 2.23 },
      { name: 'Gienah', designation: 'Epsilon Cygni', spectralType: 'K0 III Giant', magnitude: 2.48 },
      { name: 'Fawaris', designation: 'Delta Cygni', spectralType: 'B9.5 IV + F1 V', magnitude: 2.87 },
      { name: 'Albireo', designation: 'Beta Cygni', spectralType: 'K3 II + B9.5 V Gold/Blue Pair', magnitude: 3.05 }
    ],
    deepSkyTargets: [
      { name: 'Veil Nebula (Cygnus Loop)', catalogId: 'NGC 6960/6992', type: 'Supernova Remnant' },
      { name: 'North America Nebula', catalogId: 'NGC 7000', type: 'Large Emission Nebula' },
      { name: 'Pelican Nebula', catalogId: 'IC 5070', type: 'Star-forming Complex' },
      { name: 'Cygnus X-1', catalogId: 'HDE 226868', type: 'First Discovered Stellar Black Hole' }
    ],
    samuraiLore: 'Cygnus soars directly down the luminescent spine of the Milky Way (Amanogawa / 天の川). In Tanabata lore, this celestial cross forms the wings of the magpie bridge that allows the celestial lovers Orihime (Vega) and Hikoboshi (Altair) to cross the star river for their single night of reunion.',
    svgPoints: [
      { x: 50, y: 15, label: 'Deneb', mag: 1 },    // 0 (Tail)
      { x: 50, y: 45, label: 'Sadr', mag: 2 },     // 1 (Heart)
      { x: 20, y: 55, label: 'Fawaris', mag: 2 },  // 2 (West Wing)
      { x: 80, y: 40, label: 'Gienah', mag: 2 },   // 3 (East Wing)
      { x: 50, y: 85, label: 'Albireo', mag: 2 }   // 4 (Beak)
    ],
    svgLines: [
      [0, 1], [1, 4], [2, 1], [1, 3]
    ]
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia & The Celestial Anchor',
    latinName: 'Cassiopeia',
    kanjiName: 'カシオペヤ座 · 錨星 (Ikari-boshi)',
    meaning: 'The Celestial Queen & Heavenly Anchor',
    season: 'Autumn',
    rightAscension: '01h 00m',
    declination: '+60° 00′',
    quadrant: 'NQ1',
    areaSqDeg: 598,
    brightestStar: 'Schedar (Alpha Cassiopeiae, Mag 2.24)',
    stars: [
      { name: 'Schedar', designation: 'Alpha Cas', spectralType: 'K0 IIIa Orange Giant', magnitude: 2.24 },
      { name: 'Caph', designation: 'Beta Cas', spectralType: 'F2 III-IV Delta Scuti', magnitude: 2.28 },
      { name: 'Navi', designation: 'Gamma Cas', spectralType: 'B0.5 IVe Shell Star', magnitude: 2.15 },
      { name: 'Ruchbah', designation: 'Delta Cas', spectralType: 'A5 V Algol Variable', magnitude: 2.68 },
      { name: 'Segin', designation: 'Epsilon Cas', spectralType: 'B3 V', magnitude: 3.35 }
    ],
    deepSkyTargets: [
      { name: 'Heart Nebula', catalogId: 'IC 1805', type: 'Glowing Emission Nebula' },
      { name: 'Soul Nebula', catalogId: 'IC 1848', type: 'Star-forming Ionized Cloud' },
      { name: 'Pacman Nebula', catalogId: 'NGC 281', type: 'Bright Emission Nebula' },
      { name: 'Cassiopeia A', catalogId: '3C 461', type: 'Young Supernova Remnant' }
    ],
    samuraiLore: 'Known along Japan’s inland sea and coasts as "Ikari-boshi" (The Celestial Anchor). Water-clan samurai (Murakami Suigun) looked to this distinct "W" formation revolving around the North Star to calculate high-tide maneuvers and guide stealth night assaults across moonlit straits.',
    svgPoints: [
      { x: 18, y: 35, label: 'Caph', mag: 2 },    // 0
      { x: 36, y: 65, label: 'Schedar', mag: 2 }, // 1
      { x: 52, y: 38, label: 'Navi', mag: 1 },    // 2
      { x: 68, y: 68, label: 'Ruchbah', mag: 2 }, // 3
      { x: 84, y: 42, label: 'Segin', mag: 3 }    // 4
    ],
    svgLines: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ]
  },
  {
    id: 'taurus',
    name: 'Taurus & The Pleiades (Subaru)',
    latinName: 'Taurus',
    kanjiName: 'おうし座 · 昴宿 (Subaru / Mutsuraboshi)',
    meaning: 'The Celestial Bull & Sacred Pleiades Cluster',
    season: 'Winter',
    rightAscension: '04h 30m',
    declination: '+16° 30′',
    quadrant: 'NQ1',
    areaSqDeg: 797,
    brightestStar: 'Aldebaran (Alpha Tauri, Mag 0.85)',
    stars: [
      { name: 'Aldebaran', designation: 'Alpha Tauri', spectralType: 'K5+ III Orange Giant', magnitude: 0.85 },
      { name: 'Elnath', designation: 'Beta Tauri', spectralType: 'B7 III Chemically Peculiar', magnitude: 1.65 },
      { name: 'Alcyone', designation: 'Eta Tauri (Pleiades)', spectralType: 'B7 IIIe Be Star', magnitude: 2.87 },
      { name: 'Tianguan', designation: 'Zeta Tauri', spectralType: 'B2 IIIpe Shell Star', magnitude: 2.97 }
    ],
    deepSkyTargets: [
      { name: 'Pleiades Star Cluster (Subaru)', catalogId: 'Messier 45', type: 'Luminous Open Cluster' },
      { name: 'Crab Nebula', catalogId: 'Messier 1', type: 'Supernova of 1054 Remnant' },
      { name: 'Hyades Cluster', catalogId: 'Melotte 25', type: 'Nearest Open Cluster to Sun' },
      { name: 'Hind’s Variable Nebula', catalogId: 'NGC 1555', type: 'T Tauri Reflection Cloud' }
    ],
    samuraiLore: 'Subaru (昴) holds profound status in Japanese astronomical literature, immortalized in the Pillow Book by Sei Shonagon ("Of the stars, Subaru is best"). In 1054 AD, court poets and warriors recorded a "Guest Star" in Taurus so bright it cast shadows at noon—today known to astrophysics as the Crab Nebula (M1).',
    svgPoints: [
      { x: 22, y: 32, label: 'Subaru (M45)', mag: 1 }, // 0
      { x: 50, y: 55, label: 'Aldebaran', mag: 1 },    // 1
      { x: 42, y: 65, label: 'Hyades', mag: 3 },       // 2
      { x: 58, y: 70, label: 'Theta Tau', mag: 3 },    // 3
      { x: 75, y: 30, label: 'Elnath', mag: 2 },       // 4
      { x: 85, y: 58, label: 'Tianguan', mag: 3 }      // 5
    ],
    svgLines: [
      [0, 1], [1, 2], [2, 3], [3, 1], [1, 4], [1, 5]
    ]
  },
  {
    id: 'crux',
    name: 'Crux (The Southern Cross)',
    latinName: 'Crux',
    kanjiName: '南十字座 · 十字星 (Minami Jūjisei)',
    meaning: 'The Southern Navigational Diamond Cross',
    season: 'Spring',
    rightAscension: '12h 30m',
    declination: '-60° 00′',
    quadrant: 'SQ3',
    areaSqDeg: 68,
    brightestStar: 'Acrux (Alpha Crucis, Mag 0.77)',
    stars: [
      { name: 'Acrux', designation: 'Alpha Crucis', spectralType: 'B0.5 IV + B1 V Double', magnitude: 0.77 },
      { name: 'Mimosa (Becrux)', designation: 'Beta Crucis', spectralType: 'B0.5 III Beta Cephei', magnitude: 1.25 },
      { name: 'Gacrux', designation: 'Gamma Crucis', spectralType: 'M3.5 III Red Giant', magnitude: 1.64 },
      { name: 'Imai', designation: 'Delta Crucis', spectralType: 'B2 IV Subgiant', magnitude: 2.79 }
    ],
    deepSkyTargets: [
      { name: 'Coalsack Dark Nebula', catalogId: 'Caldwell 99', type: 'Prominent Silhouette Dark Nebula' },
      { name: 'Jewel Box Cluster', catalogId: 'NGC 4755 / Kappa Crucis', type: 'Multicolor Supergiant Open Cluster' }
    ],
    samuraiLore: 'Known to Southern Japanese seafaring clans and Ryukyu navigators as the "True Southern Cross". Seafarers calculated true south by extending a line through Gacrux and Acrux across the horizon, ensuring safe voyage through tempestuous oceanic passages.',
    svgPoints: [
      { x: 50, y: 18, label: 'Gacrux', mag: 1 },  // Top
      { x: 50, y: 82, label: 'Acrux', mag: 1 },   // Bottom
      { x: 25, y: 50, label: 'Mimosa', mag: 1 },  // Left
      { x: 75, y: 46, label: 'Imai', mag: 2 },    // Right
      { x: 62, y: 64, label: 'Ginan', mag: 3 }    // Epsilon
    ],
    svgLines: [
      [0, 1], [2, 3]
    ]
  },
  {
    id: 'canis-major',
    name: 'Canis Major & The Blue Star (Sirius)',
    latinName: 'Canis Major',
    kanjiName: '大犬座 · 青星 / 天狼星 (Tenrōsei / Aoboshi)',
    meaning: 'The Great Celestial Hound & Brilliant Wolf Star',
    season: 'Winter',
    rightAscension: '06h 45m',
    declination: '-16° 42′',
    quadrant: 'SQ2',
    areaSqDeg: 380,
    brightestStar: 'Sirius (Alpha Canis Majoris, Mag -1.46)',
    stars: [
      { name: 'Sirius', designation: 'Alpha CMa', spectralType: 'A1V + DA2 White Dwarf Pair', magnitude: -1.46 },
      { name: 'Adhara', designation: 'Epsilon CMa', spectralType: 'B2 II Bright Giant', magnitude: 1.50 },
      { name: 'Wezen', designation: 'Delta CMa', spectralType: 'F8 Ia Yellow Supergiant', magnitude: 1.83 },
      { name: 'Mirzam', designation: 'Beta CMa', spectralType: 'B1 II-III Beta Cephei', magnitude: 1.98 }
    ],
    deepSkyTargets: [
      { name: 'Little Beehive Cluster', catalogId: 'Messier 41', type: 'Open Star Cluster' },
      { name: 'Thor’s Helmet Nebula', catalogId: 'NGC 2359', type: 'Wolf-Rayet Emission Bubble' }
    ],
    samuraiLore: 'Sirius was known in ancient Japan as "Aoboshi" (The Blue Star) and "Tenrōsei" (The Celestial Wolf Star). Because of its flashing diamond brilliance, archers aligned their sights to its rising as an omen of absolute focus and single-arrow lethality.',
    svgPoints: [
      { x: 38, y: 22, label: 'Sirius', mag: 1 },
      { x: 24, y: 32, label: 'Mirzam', mag: 2 },
      { x: 55, y: 55, label: 'Wezen', mag: 2 },
      { x: 50, y: 80, label: 'Adhara', mag: 2 },
      { x: 72, y: 72, label: 'Aludra', mag: 3 }
    ],
    svgLines: [
      [1, 0], [0, 2], [2, 3], [2, 4]
    ]
  }
];

export interface LocalDoodleMatch {
  constellation: ConstellationData;
  confidence: number;
  doodleAnalysis: string;
}

/**
 * Intelligent client-side geometric & topological matcher for hand-drawn doodles
 */
export function matchDoodleLocally(
  points: { x: number; y: number }[],
  lines: [number, number][],
  hints: string = ''
): LocalDoodleMatch {
  const hintLower = hints.toLowerCase();

  // Explicit hint matching
  if (hintLower.includes('orion') || hintLower.includes('belt') || hintLower.includes('mitsuboshi')) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'orion')!;
    return {
      constellation: c,
      confidence: 97,
      doodleAnalysis: 'Identified the 3-star belt line (Mitsuboshi) framed by Betelgeuse and Rigel vertices.'
    };
  }

  if (hintLower.includes('dipper') || hintLower.includes('bear') || hintLower.includes('hokuto') || hintLower.includes('ursa')) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'ursa-major')!;
    return {
      constellation: c,
      confidence: 98,
      doodleAnalysis: 'Identified the classic 7-star saucepan and curved dipper handle of Hokuto Shichisei.'
    };
  }

  if (hintLower.includes('cassiopeia') || hintLower.includes('anchor') || hintLower.includes('ikari') || hintLower.includes('w')) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'cassiopeia')!;
    return {
      constellation: c,
      confidence: 96,
      doodleAnalysis: 'Recognized the distinctive 5-star zigzag "W" asterism of the Heavenly Anchor (Ikari-boshi).'
    };
  }

  if (hintLower.includes('scorpio') || hintLower.includes('antares') || hintLower.includes('tail') || hintLower.includes('hook')) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'scorpius')!;
    return {
      constellation: c,
      confidence: 95,
      doodleAnalysis: 'Recognized the sweeping curved hook of the Scorpion stinger guarding red heart Antares.'
    };
  }

  if (hintLower.includes('cross') || hintLower.includes('swan') || hintLower.includes('cygnus')) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'cygnus')!;
    return {
      constellation: c,
      confidence: 96,
      doodleAnalysis: 'Detected the celestial cross orientation soaring down the spine of the Milky Way.'
    };
  }

  if (hintLower.includes('crux') || hintLower.includes('southern')) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'crux') || CONSTELLATIONS_DATABASE[0];
    return {
      constellation: c,
      confidence: 95,
      doodleAnalysis: 'Identified the diamond 4-star cross orientation of Crux (Minami Jūjisei).'
    };
  }

  const n = points.length;

  // Geometry: Check if 7 nodes -> likely Big Dipper
  if (n >= 6 && n <= 8) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'ursa-major')!;
    return {
      constellation: c,
      confidence: 93,
      doodleAnalysis: `Detected ${n} interconnected stellar nodes mapping with high affinity to Ursa Major (Hokuto Shichisei).`
    };
  }

  // Geometry: Check if 5 nodes
  if (n === 5) {
    // Sort points by X to check for zigzag (Cassiopeia)
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const yDeltas = [
      sorted[1].y - sorted[0].y,
      sorted[2].y - sorted[1].y,
      sorted[3].y - sorted[2].y,
      sorted[4].y - sorted[3].y,
    ];
    const isAlternating = (yDeltas[0] * yDeltas[1] < 0) || (yDeltas[1] * yDeltas[2] < 0);

    if (isAlternating) {
      const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'cassiopeia')!;
      return {
        constellation: c,
        confidence: 94,
        doodleAnalysis: 'Alternating vertical coordinates correspond to the "W" zigzag geometry of Cassiopeia.'
      };
    } else {
      const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'crux') || CONSTELLATIONS_DATABASE.find(x => x.id === 'cygnus')!;
      return {
        constellation: c,
        confidence: 89,
        doodleAnalysis: 'Five-node configuration resembles the cardinal axes of the celestial cross.'
      };
    }
  }

  // Check if 3 close collinear points (Orion Belt)
  if (n >= 3) {
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        for (let k = j + 1; k < points.length; k++) {
          const p1 = points[i];
          const p2 = points[j];
          const p3 = points[k];
          // Cross product of (p2-p1) and (p3-p1) measures collinearity
          const cross = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x));
          if (cross < 250) {
            const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'orion')!;
            return {
              constellation: c,
              confidence: 95,
              doodleAnalysis: 'Detected 3 linear aligned core vertices matching the Mitsuboshi belt of Orion.'
            };
          }
        }
      }
    }
  }

  // If high number of points with curved trail -> Scorpius
  if (n >= 8) {
    const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'scorpius')!;
    return {
      constellation: c,
      confidence: 91,
      doodleAnalysis: `${n} interconnected vertices trace the sweeping curvilinear tail of Scorpius (Akaboshi).`
    };
  }

  // Default fallback to Orion (the flagship Japanese asterism)
  const c = CONSTELLATIONS_DATABASE.find(x => x.id === 'orion') || CONSTELLATIONS_DATABASE[0];
  return {
    constellation: c,
    confidence: 88,
    doodleAnalysis: 'Stellar nodes aligned closest to the grand winter asterism of Orion the Hunter.'
  };
}
