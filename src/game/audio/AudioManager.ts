/**
 * Sistema de audio para Super Mario React
 * Genera sonidos proceduralmente usando Web Audio API
 * No requiere archivos de audio externos
 */

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private isMuted = false;
  private currentMusic: string | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicPlaying = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 1;

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this.musicVolume;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this.sfxVolume;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMusicVolume(vol: number) {
    this.musicVolume = vol;
    if (this.musicGain) this.musicGain.gain.value = this.isMuted ? 0 : vol;
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = vol;
    if (this.sfxGain) this.sfxGain.gain.value = this.isMuted ? 0 : vol;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : 1;
  }

  // ========== EFECTOS DE SONIDO ==========

  playJump() {
    this.playNote(400, 0.08, 'square', 0.3);
    setTimeout(() => this.playNote(600, 0.08, 'square', 0.3), 60);
  }

  playCoin() {
    this.playNote(988, 0.05, 'square', 0.3);
    setTimeout(() => this.playNote(1319, 0.15, 'square', 0.3), 50);
  }

  playPowerUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.12, 'square', 0.3), i * 80);
    });
  }

  playStomp() {
    this.playNote(200, 0.1, 'square', 0.4);
    setTimeout(() => this.playNote(100, 0.15, 'square', 0.3), 50);
  }

  playHit() {
    this.playNote(300, 0.05, 'sawtooth', 0.4);
    setTimeout(() => this.playNote(150, 0.1, 'sawtooth', 0.3), 80);
  }

  playDeath() {
    const notes = [400, 350, 300, 200, 150];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.15, 'square', 0.4), i * 120);
    });
  }

  playBlockHit() {
    this.playNote(500, 0.05, 'square', 0.2);
  }

  playBreakBlock() {
    this.playNote(300, 0.08, 'sawtooth', 0.3);
    setTimeout(() => this.playNote(200, 0.1, 'sawtooth', 0.2), 50);
  }

  playFlag() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.15, 'square', 0.3), i * 100);
    });
  }

  playGameOver() {
    const notes = [400, 350, 300, 250, 200, 150, 100];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.2, 'square', 0.4), i * 200);
    });
  }

  playWin() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319, 1047, 784, 1047, 1319, 1568];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.2, 'square', 0.3), i * 150);
    });
  }

  playFireball() {
    this.playNote(800, 0.05, 'sawtooth', 0.2);
    setTimeout(() => this.playNote(1200, 0.05, 'sawtooth', 0.15), 30);
  }

  playStar() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.1, 'square', 0.25), i * 60);
    });
  }

  playCheckpoint() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.12, 'sine', 0.3), i * 100);
    });
  }

  private playNote(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.3
  ) {
    try {
      const ctx = this.ensureContext();
      if (this.isMuted) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = volume * this.sfxVolume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Silenciar errores de audio
    }
  }

  // ========== MÚSICA ==========

  playMusic(theme: string) {
    this.stopMusic();
    this.currentMusic = theme;
    this.musicPlaying = true;

    switch (theme) {
      case 'overworld':
        this.playOverworldTheme();
        break;
      case 'underground':
        this.playUndergroundTheme();
        break;
      case 'underwater':
        this.playUnderwaterTheme();
        break;
      case 'castle':
        this.playCastleTheme();
        break;
      case 'desert':
        this.playDesertTheme();
        break;
      case 'snow':
        this.playSnowTheme();
        break;
      case 'lava':
        this.playLavaTheme();
        break;
      case 'boss':
        this.playBossTheme();
        break;
      case 'star':
        this.playStarTheme();
        break;
      case 'menu':
        this.playMenuTheme();
        break;
      default:
        this.playOverworldTheme();
    }
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });
    this.musicOscillators = [];
    this.currentMusic = null;
  }

  private playMelody(notes: number[], bpm: number = 200, type: OscillatorType = 'square') {
    if (!this.musicPlaying) return;
    const noteDuration = 60 / bpm;
    notes.forEach((freq, i) => {
      if (!this.musicPlaying) return;
      setTimeout(() => {
        if (!this.musicPlaying) return;
        this.playMusicNote(freq, noteDuration * 0.9, type);
      }, i * noteDuration * 1000);
    });
    // Loop
    const totalDuration = notes.length * noteDuration * 1000;
    setTimeout(() => {
      if (this.musicPlaying) this.playMelody(notes, bpm, type);
    }, totalDuration);
  }

  private playMusicNote(frequency: number, duration: number, type: OscillatorType = 'square') {
    try {
      const ctx = this.ensureContext();
      if (this.isMuted || !this.musicPlaying) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = 0.15 * this.musicVolume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.musicGain!);

      this.musicOscillators.push(osc);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  private playOverworldTheme() {
    const melody = [
      659, 659, 0, 659, 0, 523, 659, 0, 784, 0, 0, 0, 392, 0, 0, 0,
      523, 0, 0, 392, 0, 0, 330, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      659, 659, 0, 659, 0, 523, 659, 0, 784, 0, 0, 0, 392, 0, 0, 0,
      523, 0, 0, 392, 0, 0, 330, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    this.playMelody(melody, 180);
  }

  private playUndergroundTheme() {
    const melody = [
      523, 0, 0, 0, 659, 0, 0, 0, 784, 0, 0, 0, 659, 0, 0, 0,
      523, 0, 0, 0, 659, 0, 0, 0, 784, 0, 0, 0, 1047, 0, 0, 0,
    ];
    this.playMelody(melody, 160, 'sine');
  }

  private playUnderwaterTheme() {
    const melody = [
      392, 0, 523, 0, 392, 0, 523, 0, 330, 0, 440, 0, 330, 0, 440, 0,
      262, 0, 392, 0, 262, 0, 392, 0, 294, 0, 440, 0, 294, 0, 440, 0,
    ];
    this.playMelody(melody, 140, 'sine');
  }

  private playCastleTheme() {
    const melody = [
      262, 0, 330, 0, 392, 0, 523, 0, 392, 0, 523, 0, 659, 0, 523, 0,
      262, 0, 330, 0, 392, 0, 523, 0, 392, 0, 523, 0, 784, 0, 659, 0,
    ];
    this.playMelody(melody, 150, 'sawtooth');
  }

  private playDesertTheme() {
    const melody = [
      392, 0, 0, 523, 0, 0, 659, 0, 0, 523, 0, 0, 392, 0, 0, 0,
      440, 0, 0, 587, 0, 0, 784, 0, 0, 587, 0, 0, 440, 0, 0, 0,
    ];
    this.playMelody(melody, 170, 'triangle');
  }

  private playSnowTheme() {
    const melody = [
      523, 0, 659, 0, 784, 0, 659, 0, 523, 0, 659, 0, 784, 0, 1047, 0,
      784, 0, 659, 0, 523, 0, 659, 0, 784, 0, 659, 0, 523, 0, 0, 0,
    ];
    this.playMelody(melody, 190, 'sine');
  }

  private playLavaTheme() {
    const melody = [
      262, 0, 0, 0, 311, 0, 0, 0, 349, 0, 0, 0, 392, 0, 0, 0,
      349, 0, 0, 0, 311, 0, 0, 0, 262, 0, 0, 0, 0, 0, 0, 0,
    ];
    this.playMelody(melody, 200, 'sawtooth');
  }

  private playBossTheme() {
    const melody = [
      262, 0, 330, 0, 392, 0, 523, 0, 330, 0, 392, 0, 523, 0, 659, 0,
      262, 0, 330, 0, 392, 0, 523, 0, 330, 0, 392, 0, 523, 0, 784, 0,
    ];
    this.playMelody(melody, 220, 'square');
  }

  private playStarTheme() {
    const melody = [
      523, 659, 784, 1047, 784, 1047, 1319, 1047, 784, 1047, 1319, 1568, 1319, 1047, 784, 659,
      523, 659, 784, 1047, 784, 1047, 1319, 1047, 784, 1047, 1319, 1568, 1319, 1047, 784, 659,
    ];
    this.playMelody(melody, 240, 'square');
  }

  private playMenuTheme() {
    const melody = [
      523, 0, 0, 659, 0, 0, 784, 0, 0, 659, 0, 0, 523, 0, 0, 0,
      659, 0, 0, 784, 0, 0, 1047, 0, 0, 784, 0, 0, 659, 0, 0, 0,
    ];
    this.playMelody(melody, 160, 'square');
  }
}
