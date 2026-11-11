import { SoundPreset } from '../types/music';

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  public getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public scheduleClick(
    time: number,
    type: 'accent' | 'normal' | 'subdivision',
    preset: SoundPreset,
    volume: number
  ) {
    if (volume <= 0.01) return;
    const ctx = this.getContext();

    if (preset === 'drums') {
      this.scheduleDrumSound(ctx, time, type, volume);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    let freq = 800;
    let duration = 0.045;
    let level = volume;

    if (preset === 'digital') {
      osc.type = 'triangle';
      if (type === 'accent') {
        freq = 1400;
        level = volume * 1.0;
      } else if (type === 'normal') {
        freq = 950;
        level = volume * 0.75;
      } else {
        freq = 680;
        level = volume * 0.45;
        duration = 0.03;
      }
    } else if (preset === 'woodblock') {
      osc.type = 'sine';
      duration = 0.055;
      if (type === 'accent') {
        freq = 1150;
        level = volume * 1.0;
      } else if (type === 'normal') {
        freq = 820;
        level = volume * 0.8;
      } else {
        freq = 600;
        level = volume * 0.45;
        duration = 0.035;
      }
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, time + duration);
    } else {
      osc.type = 'square';
      duration = 0.04;
      if (type === 'accent') {
        freq = 1760;
        level = volume * 0.55;
      } else if (type === 'normal') {
        freq = 880;
        level = volume * 0.4;
      } else {
        freq = 660;
        level = volume * 0.22;
        duration = 0.025;
      }
    }

    if (preset !== 'woodblock') {
      osc.frequency.setValueAtTime(freq, time);
    }

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, level), time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.start(time);
    osc.stop(time + duration + 0.005);
  }

  private scheduleDrumSound(
    ctx: AudioContext,
    time: number,
    type: 'accent' | 'normal' | 'subdivision',
    volume: number
  ) {
    if (type === 'accent') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.12);
    } else if (type === 'normal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, time);
      osc.frequency.exponentialRampToValueAtTime(140, time + 0.055);

      gain.gain.setValueAtTime(volume * 0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.07);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(3200, time);
      osc.frequency.exponentialRampToValueAtTime(1200, time + 0.025);

      gain.gain.setValueAtTime(volume * 0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.035);
    }
  }

  public playTimerFinishedSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);

        gain.gain.setValueAtTime(0.001, now + idx * 0.11);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.11 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.48);
      });
    } catch {
      // Ignore audio errors if blocked
    }
  }

  /**
   * Plays a plucked guitar-like tone for a single MIDI note
   */
  public playMusicalNote(
    midi: number,
    delaySeconds = 0,
    durationSeconds = 0.65,
    volume = 0.28
  ) {
    try {
      const ctx = this.getContext();
      const startTime = ctx.currentTime + delaySeconds;
      const freq = midiToFreq(midi);

      // Combine triangle + sine with lowpass filter for warm guitar/ Rhodes tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 4, startTime);
      filter.frequency.exponentialRampToValueAtTime(
        freq * 1.2,
        startTime + durationSeconds
      );

      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.25, startTime);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);

      filter.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + durationSeconds
      );

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + durationSeconds + 0.02);
      osc2.stop(startTime + durationSeconds + 0.02);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Plays an ascending scale from an array of MIDI notes
   */
  public playScaleSequence(midiNotes: number[], stepSeconds = 0.24) {
    midiNotes.forEach((midi, idx) => {
      this.playMusicalNote(
        midi,
        idx * stepSeconds,
        idx === midiNotes.length - 1 ? 0.9 : 0.4,
        0.3
      );
    });
  }

  /**
   * Plays a chord (strummed slightly like a guitar for clarity)
   */
  public playChordVoicing(midiNotes: number[], arpeggioStep = 0.055) {
    midiNotes.forEach((midi, idx) => {
      this.playMusicalNote(midi, idx * arpeggioStep, 1.35, 0.22);
    });
  }
}

export const soundEngine = new SoundEngine();
