/**
 * Web Audio API synthesizer for positive reinforcement training.
 * Provides authentic Clicker training sound (click-clack impulse)
 * and ultrasonic dog whistle generator (safety range 12,000 - 20,000 Hz).
 */

class AudioTrainingService {
  private ctx: AudioContext | null = null;
  private whistleOscillator: OscillatorNode | null = null;
  private whistleGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Generates a realistic metallic double-click sound for clicker training.
   * First sharp click followed 25ms later by the spring release clack.
   */
  public playClicker() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Click 1: Sharp snap down
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(4200, now);
      osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.015);

      gain1.gain.setValueAtTime(0.85, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.025);

      // Click 2: Release snap
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3200, now + 0.035);
      osc2.frequency.exponentialRampToValueAtTime(900, now + 0.055);

      gain2.gain.setValueAtTime(0.7, now + 0.035);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + 0.035);
      osc2.stop(now + 0.065);

      // Trigger navigator haptic vibration on Android devices if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15, 30, 20]);
      }
    } catch (e) {
      console.warn('Audio clicker error:', e);
    }
  }

  /**
   * Positive reinforcement chime tone when completing exercises or routines
   */
  public playSuccessChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn('Chime audio error:', e);
    }
  }

  /**
   * Starts high-frequency whistle (12kHz - 18kHz)
   */
  public startWhistle(frequencyHz: number = 14000) {
    try {
      this.stopWhistle();
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(Math.min(Math.max(frequencyHz, 10000), 20000), this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.whistleOscillator = osc;
      this.whistleGain = gain;
    } catch (e) {
      console.warn('Whistle start error:', e);
    }
  }

  public stopWhistle() {
    if (this.whistleOscillator) {
      try {
        this.whistleOscillator.stop();
        this.whistleOscillator.disconnect();
      } catch (e) {
        // ignore
      }
      this.whistleOscillator = null;
    }
  }
}

export const audioTrainingService = new AudioTrainingService();
