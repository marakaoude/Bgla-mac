/**
 * Concert Stadium Web Audio synthesizer
 * Creates ambient stadium roar, sub-bass 808 rumble, and cheering effects
 * Runs purely client-side with zero external assets.
 */

class StadiumAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private volume = 0.65; // default 65% volume
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.isPlaying) {
      const targetGain = Math.max(0.0001, this.volume * 0.2);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;

    // Master volume scaled by volume setting
    this.masterGain = this.ctx.createGain();
    const targetGain = Math.max(0.0001, this.volume * 0.2);
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 1.2);
    this.masterGain.connect(this.ctx.destination);

    // 1. Crowd roar buffer (pink/brown noise filtered)
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
      lastOut = output[i];
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Bandpass filter centered around 400Hz for crowd shouting
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'bandpass';
    this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // LFO for crowd surge modulation (waves of cheering)
    this.lfoNode = this.ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.setValueAtTime(0.25, this.ctx.currentTime); // Wave every 4 seconds

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    this.lfoNode.connect(lfoGain);
    lfoGain.connect(this.filterNode.frequency);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.masterGain);

    this.noiseNode.start();
    this.lfoNode.start();
  }

  public triggerBassDrop() {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    } catch {
      // ignore
    }
  }

  public stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          this.noiseNode?.stop();
          this.lfoNode?.stop();
        }, 500);
      } catch {
        // cleanup
      }
    }
  }

  public setGenre(genreId: string) {
    if (!this.filterNode || !this.lfoNode || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      switch (genreId) {
        case 'acoustic':
          this.filterNode.frequency.exponentialRampToValueAtTime(320, now + 1);
          this.filterNode.Q.setValueAtTime(1.2, now);
          this.lfoNode.frequency.setValueAtTime(0.15, now);
          break;
        case 'instrumental-808':
          this.filterNode.frequency.exponentialRampToValueAtTime(280, now + 1);
          this.filterNode.Q.setValueAtTime(2.4, now);
          this.lfoNode.frequency.setValueAtTime(0.4, now);
          this.triggerBassDrop();
          break;
        case 'afrobeats':
          this.filterNode.frequency.exponentialRampToValueAtTime(480, now + 1);
          this.filterNode.Q.setValueAtTime(1.9, now);
          this.lfoNode.frequency.setValueAtTime(0.35, now);
          break;
        case 'drill-bamako':
          this.filterNode.frequency.exponentialRampToValueAtTime(580, now + 1);
          this.filterNode.Q.setValueAtTime(2.2, now);
          this.lfoNode.frequency.setValueAtTime(0.48, now);
          this.triggerBassDrop();
          break;
        case 'symphonic-stadium':
          this.filterNode.frequency.exponentialRampToValueAtTime(420, now + 1);
          this.filterNode.Q.setValueAtTime(1.5, now);
          this.lfoNode.frequency.setValueAtTime(0.2, now);
          break;
        case 'afro-rap':
        default:
          this.filterNode.frequency.exponentialRampToValueAtTime(450, now + 1);
          this.filterNode.Q.setValueAtTime(1.8, now);
          this.lfoNode.frequency.setValueAtTime(0.28, now);
          break;
      }
    } catch {
      // ignore
    }
  }

  /**
   * Synthesize a brief musical preview of the chosen background music genre
   * so the user can test the balance with the crowd noise in real-time.
   */
  public playMusicalPreview(genreId: string) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    try {
      if (genreId === 'acoustic') {
        // Pentatonic Mandingue kora arpeggios (D, F#, A, B, D)
        const notes = [293.66, 369.99, 440.0, 493.88, 587.33, 440.0, 369.99];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.22);

          gain.gain.setValueAtTime(0.0001, now + idx * 0.22);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.22 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.22);
          osc.stop(now + idx * 0.22 + 0.65);
        });
      } else if (genreId === 'instrumental-808') {
        // Massive 808 sub glide + synth brass chord
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.8);
        osc.frequency.exponentialRampToValueAtTime(32, now + 1.8);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0);

        // Synth chord
        [220, 277.18, 329.63].forEach((f) => {
          const brass = this.ctx!.createOscillator();
          const bGain = this.ctx!.createGain();
          brass.type = 'sawtooth';
          brass.frequency.setValueAtTime(f, now);

          const filter = this.ctx!.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);
          filter.frequency.exponentialRampToValueAtTime(200, now + 1.5);

          bGain.gain.setValueAtTime(0.08, now);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

          brass.connect(filter);
          filter.connect(bGain);
          bGain.connect(this.ctx!.destination);

          brass.start(now);
          brass.stop(now + 1.5);
        });
      } else if (genreId === 'drill-bamako') {
        // Fast sliding 808 drill pitch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.15);
        osc.frequency.linearRampToValueAtTime(115, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(35, now + 1.2);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
      } else {
        // Default Afro-Rap / Afrobeats energetic bounce
        this.triggerBassDrop();
        // Melodic punch
        [349.23, 440, 523.25].forEach((f, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.1);

          gain.gain.setValueAtTime(0.15, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.45);
        });
      }
    } catch {
      // ignore
    }
  }

  public getStatus() {
    return this.isPlaying;
  }
}

export const stadiumAudio = new StadiumAudioEngine();

