# Tsukuyomi Watch (月読の観測台)
### The Samurai's Celestial Guide & Imperial Astronomy Console

> *"The warrior who ignores the heavens invites defeat in the night mist."*  
> An ancient Japanese ink-wash (*sumi-e*) astronomical console and celestial observatory designed for modern stargazers and samurai scholars.

---

## 🌌 Core Features

### 0. Moon Gateway Entrance (富士の満月門)
- **Living Artwork Environment**: Features the samurai gazing at the luminous full moon above Mount Fuji, with a serene reflecting lake and blooming flora.
- **Dynamic Wind & Drifting Clouds**: Multi-layered drifting clouds sweep across the night sky, while mountain wind gusts and glowing cherry blossom petals flutter across the screen.
- **Interactive Outlined Moon Button**: The radiant full moon is highlighted with a crisp white circular outline, pulsating ripples, and an ambient celestial aura.
- **Warp Transition**: Clicking the outlined moon triggers a ceremonial Japanese *koto* chime and *katana* sound effect with a luminous transition into the main Tsukuyomi Watch observatory.
- **Return Anytime**: Return to this screen whenever you wish via the **"Moon Gateway"** button in the top navigation bar.

### 1. Watchtower (Stargazing Location Finder)
- **Interactive Leaflet Map**: Rendered with ancient sumi-e parchment ink-wash styling and custom Japanese crest markers.
- **Open-Meteo Real-Time Weather Integration**: Live cloud cover, relative humidity, visibility, and wind speeds fetched dynamically (no API key required).
- **Night Honor Score Calculator**:
  $$\text{Night Honor Score} = 100 - \text{Cloud Cover} - \frac{\text{Humidity}}{2} + \frac{\text{Visibility (km)}}{2}$$
  Mapped to 5 Samurai Honor Ranks (from *Typhoon Shadow* to *Celestial Master*).
- **Top Sacred Sanctuaries**: Quick-focus presets including Mount Fuji 5th Station, Achi Village Dark Sky Sanctuary, Bisei Town, and Iriomote-Ishigaki.
- **Light Pollution Overlay**: Toggleable Bortle Class 1-2 Dark Sky sanctuaries vs. urban light domes (Tokyo, Osaka).

### 2. Celestial Scroll (Space Event Tracker & Constellations Atlas)
- **Celestial Chronicles**: Curated timeline of meteor showers (Geminids, Perseids), solar/lunar eclipses, and rocket launches.
- **Traditional Japanese Lunar Calendar**: The 12 traditional lunar months (*Mutsuki*, *Hazuki*, *Nagatsuki*, etc.).
- **Live ISS Space Station Tracker**: Real-time orbital coordinates, velocity (~27,600 km/h), and altitude (~420 km) of the wandering orbital fortress.
- **Browser Notification Alert**: Inscribe observation vigils directly to the browser's Notification API (*"The Moon Rises Tonight at 8:14 PM"*).
- **Constellation Doodle Oracle (星図墨絵・手描き鑑定)**:
  - **Interactive Celestial Canvas**: Doodle asterisms freehand with glowing starlight ink or click to drop pulsating star vertices and connect lines.
  - **Dual Deciphering Engine**: Multimodal Gemini 3.8 Flash Vision model (`/api/identify-constellation-doodle`) combined with an instant client-side topological matcher.
  - **Comprehensive Astral Reveal**: Automatically selects and reveals the matched constellation's complete vector star chart, Bayer stellar catalog, deep-sky targets, coordinates, and authentic samurai clan lore.
  - **Starter Templates**: Quick click-to-sketch guides for Orion's Belt, Ursa Major (Big Dipper), Cassiopeia "W", Cygnus Cross, Scorpius Hook, and the Southern Cross.
- **Imperial Constellations Scroll (星座絵巻)**:
  - Interactive vector star charts with connected asterism lines, glowing stellar vertices, and coordinate axes.
  - Complete astronomical catalogs: Right Ascension, Declination, Celestial Quadrant, and Area in square degrees.
  - Primary Named Stars table with Bayer/Flamsteed designations, spectral classifications, and apparent magnitudes.
  - Deep-Sky Objects (Messier & NGC nebulae, starburst galaxies, star clusters, and black holes).
  - Authentic samurai folklore and clan crest associations (*Mitsuboshi/Mōri Motonari*, *Hokuto Shichisei/Myōken Bosatsu*, *Murakami Suigun Anchor Stars*, *Subaru*).

### 3. Spirit Lens (AI Image Restoration & Star Census)
- **Dual-Stage Before/After Slider**: Interactive slider powered by `react-compare-slider` to contrast raw telescope sensor noise against enhanced clarity.
- **AI Restoration Filter**: Dynamic contrast, brightness calibration, and noise suppression simulating optical blade sharpening.
- **Algorithmic Canvas Star Detection**: Client-side HTML5 canvas pixel luminance analysis with local peak detection to count stars and display interactive reticles.
- **Spectral Photometry Graph**: High-resolution `Chart.js` line chart showing "Brightness vs Time" relative flux curve with simulated exoplanet transit dips.

### 4. Dojo Dashboard (Moon Phase & Astronomy Masters)
- **High-Precision Moon Phase Engine**: Accurate synodic month calculation from any Gregorian date, showing illumination percentage, moonrise/moonset, and tactical samurai lore.
- **NASA Hubble & Webb Archive**: Live search against NASA's Image API (`images-api.nasa.gov`) to view celestial targets directly through orbital space observatories.
- **Imperial Celestial Scholars & Cartographers**: Historical treatises and celestial instruments of master Japanese astronomers (Abe no Seimei, Shibukawa Shunkai, Inō Tadataka, Date Masamune, Miyamoto Musashi).

### 5. Traditional Japanese Aesthetics & Synthesizer
- **Color Discipline**: `#0a0a0a` midnight canvas, `#d4af37` gold leaf, `#c41e3a` vermilion hanko seal.
- **Typography**: Google Fonts *Noto Serif JP*, *Cinzel*, and *Space Mono*.
- **Sakura Particle Physics**: HTML5 Canvas falling cherry blossom petals with flutter and 3D flip animation.
- **Web Audio API Synthesizer**: Plucked Japanese *Koto* pentatonic scale notes, *zen* singing bowl chimes, and sword unsheathe sound effects.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet with custom CartoDB & sumi-e tile filters
- **Visualization**: Chart.js for photometric light curves
- **Comparisons**: `react-compare-slider`
- **Icons**: Lucide React
- **APIs**: Open-Meteo Meteorological API, NASA Image and Video Library, Open-Notify & WhereTheISS

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to access the observatory.

### Production Build
```bash
npm run build
npm run preview
```

---

*Dedicated to Tsukuyomi-no-Mikoto, the Shinto deity of the Moon and Night Sky.*
