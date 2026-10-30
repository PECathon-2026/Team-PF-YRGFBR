// Web Audio API synthesizer for traditional Japanese instruments (Koto, singing bowl chime, katana sword slash)
class CelestialAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (!this.noiseBuffer && this.ctx) {
        // Pre-allocate 0.4s noise buffer for instantaneous slash playback without allocations
        const sampleRate = this.ctx.sampleRate;
        const length = Math.floor(sampleRate * 0.35);
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / length);
        }
        this.noiseBuffer = buffer;
      }
    }
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // Play a Japanese Koto pentatonic note (In-sen or Hirajoshi scale: D, Eb, G, A, Bb, D)
  public playKoto(noteIndex: number = 0) {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const scale = [293.66, 311.13, 392.00, 440.00, 466.16, 587.33, 622.25]; // D4, Eb4, G4, A4, Bb4, D5, Eb5
      const freq = scale[noteIndex % scale.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.3);
    } catch {
      // AudioContext policy or unsupported
    }
  }

  // Soft zen temple singing bowl chime
  public playZenChime() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const fundamental = 528; // Solfeggio 528Hz resonance

      [1, 2.02, 3.01].forEach((harmonic, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * harmonic, now);

        const volume = (0.12 / (idx + 1));
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.6);
      });
    } catch {
      // AudioContext policy
    }
  }

  public playSingingBowl() {
    this.playZenChime();
  }

  // Crisp katana sword slash (aerodynamic blade slicing + steel edge ring)
  public playKatanaSlash() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.noiseBuffer) return;

      const now = this.ctx.currentTime;

      // 1. Blade air cut (swoosh) via bandpassed white noise sweep
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1000, now);
      bandpass.frequency.exponentialRampToValueAtTime(4200, now + 0.07);
      bandpass.frequency.exponentialRampToValueAtTime(1200, now + 0.20);
      bandpass.Q.setValueAtTime(5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);

      // 2. High-speed metallic edge sheen (sharp katana glint)
      const bladeGlint = this.ctx.createOscillator();
      const glintGain = this.ctx.createGain();
      bladeGlint.type = 'sine';
      bladeGlint.frequency.setValueAtTime(2800, now + 0.01);
      bladeGlint.frequency.exponentialRampToValueAtTime(1800, now + 0.16);

      glintGain.gain.setValueAtTime(0.001, now + 0.01);
      glintGain.gain.linearRampToValueAtTime(0.1, now + 0.03);
      glintGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      bladeGlint.connect(glintGain);
      glintGain.connect(this.ctx.destination);

      bladeGlint.start(now + 0.01);
      bladeGlint.stop(now + 0.28);
    } catch {
      // AudioContext policy
    }
  }

  // Celebratory Level-Up Fanfare: multi-harmonic rising pentatonic chime
  public playLevelUp() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0]; // Ascending D-major chord
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.5);
      });
    } catch {
      // AudioContext policy
    }
  }
}

export const celestialAudio = new CelestialAudio();
