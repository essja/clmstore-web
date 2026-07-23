/**
 * CLMStore Web Audio Ringing Sound System
 * Unlocks AudioContext on user interaction & plays high-pitch ringing bells.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };

      window.addEventListener('click', unlock);
      window.addEventListener('touchstart', unlock);
      window.addEventListener('keydown', unlock);
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a loud, attention-grabbing dual-bell ring (Uber Eats / DoorDash style)
   */
  public playOrderRingingSound() {
    if (this.isMuted) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // High pitch ringing frequencies: 880Hz (A5), 1046.50Hz (C6), 1318.51Hz (E6)
      const ringTones = [
        { freq: 880, start: 0, duration: 0.2 },
        { freq: 1046.50, start: 0.15, duration: 0.2 },
        { freq: 1318.51, start: 0.30, duration: 0.3 },

        // Second chime ring (repeat after 0.55s)
        { freq: 880, start: 0.6, duration: 0.2 },
        { freq: 1046.50, start: 0.75, duration: 0.2 },
        { freq: 1318.51, start: 0.90, duration: 0.4 },
      ];

      ringTones.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.6, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration + 0.05);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Plays a quick success chime
   */
  public playSuccessChime() {
    if (this.isMuted) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const freqs = [659.25, 880, 1046.50];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.5, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.3);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }
}

export const sound = new SoundSystem();
