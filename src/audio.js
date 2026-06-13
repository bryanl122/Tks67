// =============================================================================
//  audio.js — Audio procédural (WebAudio). Aucun fichier externe requis.
//  SFX (clic, encaissement, alerte) + nappe d'ambiance + petite musique de fond.
// =============================================================================
export class Audio {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.started = false;
  }

  // L'AudioContext ne peut démarrer qu'après une interaction utilisateur.
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.settings.sfxVol; this.sfxGain.connect(this.master);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.settings.musicVol; this.musicGain.connect(this.master);
      this._startAmbient();
      this._startMusic();
      this.started = true;
    } catch (e) { console.warn('Audio indisponible', e); }
  }

  setVolumes() {
    if (!this.ctx) return;
    this.sfxGain.gain.value = this.settings.sound ? this.settings.sfxVol : 0;
    this.musicGain.gain.value = this.settings.music ? this.settings.musicVol : 0;
  }

  _tone({ freq = 440, type = 'sine', dur = 0.12, gain = 0.3, slideTo = null, dest = null }) {
    if (!this.ctx || !this.settings.sound) return;
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = this.ctx.createGain(); g.gain.value = 0;
    o.connect(g); g.connect(dest || this.sfxGain);
    const now = this.ctx.currentTime;
    g.gain.linearRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    o.start(now); o.stop(now + dur + 0.02);
  }

  click()   { this.ensure(); this._tone({ freq: 520, type: 'triangle', dur: 0.06, gain: 0.18 }); }
  place()   { this.ensure(); this._tone({ freq: 200, type: 'square', dur: 0.12, gain: 0.18, slideTo: 320 }); }
  cash()    { this.ensure(); this._tone({ freq: 880, type: 'triangle', dur: 0.1, gain: 0.22 }); setTimeout(() => this._tone({ freq: 1320, type: 'triangle', dur: 0.12, gain: 0.2 }), 70); }
  success() { this.ensure(); [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._tone({ freq: f, type: 'triangle', dur: 0.18, gain: 0.18 }), i * 90)); }
  alert()   { this.ensure(); this._tone({ freq: 300, type: 'sawtooth', dur: 0.3, gain: 0.22, slideTo: 160 }); }
  gem()     { this.ensure(); [1047, 1568].forEach((f, i) => setTimeout(() => this._tone({ freq: f, type: 'sine', dur: 0.16, gain: 0.2 }), i * 80)); }

  _startAmbient() {
    // Souffle léger (bruit filtré) = ambiance extérieure
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) out[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = this.ctx.createBufferSource(); noise.buffer = noiseBuffer; noise.loop = true;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 420;
    const g = this.ctx.createGain(); g.gain.value = 0.04;
    noise.connect(filter); filter.connect(g); g.connect(this.musicGain);
    noise.start();
  }

  // Petite boucle musicale générative (arpège doux)
  _startMusic() {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    let step = 0;
    this._musicTimer = setInterval(() => {
      if (!this.settings.music || !this.ctx) return;
      const f = scale[step % scale.length];
      this._tone({ freq: f, type: 'sine', dur: 0.6, gain: 0.06, dest: this.musicGain });
      if (step % 4 === 0) this._tone({ freq: f / 2, type: 'triangle', dur: 1.2, gain: 0.05, dest: this.musicGain });
      step++;
    }, 700);
  }
}
