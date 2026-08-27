/**
 * Optional Subtle Auditory Cues using Web Audio API
 * Provides gentle feedback ticks when skipping or pausing so the student
 * receives audio confirmation without needing to glance up from their notebook.
 */

class AudioFeedback {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playTone(freq = 440, type = 'sine', duration = 0.06, gainValue = 0.04) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context may be restricted by browser policy before first user gesture
    }
  }

  playSkipForward() {
    this.playTone(587.33, 'sine', 0.05, 0.03); // D5
  }

  playSkipBack() {
    this.playTone(440, 'sine', 0.05, 0.03); // A4
  }

  playPause() {
    this.playTone(349.23, 'triangle', 0.08, 0.03); // F4
  }

  playResume() {
    this.playTone(523.25, 'sine', 0.08, 0.03); // C5
  }
}

export const audioFeedback = new AudioFeedback();
