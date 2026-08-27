/**
 * Web Speech API Controller for EyesUp
 * Provides sentence-by-sentence audio playback with boundary synchronization,
 * auto-advance, voice discovery, and speed control.
 */

class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.utterance = null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0; // 0.5 - 2.0
    this.pitch = 1.0;
    this.volume = 1.0;
    this.isPlaying = false;
    this.isPaused = false;
    
    // Callbacks
    this.onSentenceStart = () => {};
    this.onSentenceEnd = () => {};
    this.onWordBoundary = () => {};
    this.onError = () => {};
    this.onStateChange = () => {};

    if (this.synth) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    
    const allVoices = this.synth.getVoices();
    if (!allVoices || allVoices.length === 0) return [];

    // Filter English or match common natural voice names
    const englishVoices = allVoices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('EN'));
    const voicesList = englishVoices.length > 0 ? englishVoices : allVoices;

    // Prioritize natural / neural / enhanced OS voices
    this.voices = [...voicesList].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const isNaturalA = aName.includes('natural') || aName.includes('neural') || aName.includes('premium') || aName.includes('google') || aName.includes('siri');
      const isNaturalB = bName.includes('natural') || bName.includes('neural') || bName.includes('premium') || bName.includes('google') || bName.includes('siri');
      if (isNaturalA && !isNaturalB) return -1;
      if (!isNaturalA && isNaturalB) return 1;
      return a.name.localeCompare(b.name);
    });

    if (!this.selectedVoice && this.voices.length > 0) {
      // Default to best natural English voice or system default
      const defaultVoice = this.voices.find(v => v.default) || this.voices[0];
      this.selectedVoice = defaultVoice;
    }

    return this.voices;
  }

  getVoices() {
    if (!this.voices || this.voices.length === 0) {
      return this.loadVoices();
    }
    return this.voices;
  }

  setVoice(voiceURI) {
    const voice = this.voices.find(v => v.voiceURI === voiceURI || v.name === voiceURI);
    if (voice) {
      this.selectedVoice = voice;
    }
  }

  setRate(newRate) {
    this.rate = Math.max(0.5, Math.min(2.0, Number(newRate) || 1.0));
  }

  setPitch(newPitch) {
    this.pitch = Math.max(0.5, Math.min(1.5, Number(newPitch) || 1.0));
  }

  /**
   * Speaks a single sentence
   * @param {string} text - Sentence string to narrate
   * @param {number} sentenceIndex - Index of sentence in the document
   */
  speak(text, sentenceIndex = 0) {
    if (!this.synth) {
      this.onError(new Error("Web Speech API is not supported in this browser."));
      return;
    }

    // Cancel any previous active utterance
    this.synth.cancel();

    if (!text || text.trim().length === 0) {
      this.isPlaying = false;
      this.isPaused = false;
      this.onStateChange({ isPlaying: false, isPaused: false });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    this.utterance = utterance;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.onSentenceStart({ sentenceIndex, text });
      this.onStateChange({ isPlaying: true, isPaused: false });
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.onWordBoundary({
          charIndex: event.charIndex,
          charLength: event.charLength || 0,
          sentenceIndex
        });
      }
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.onSentenceEnd({ sentenceIndex, text });
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    utterance.onerror = (event) => {
      // 'canceled' or 'interrupted' is normal when skipping sentences
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn("Speech synthesis notice:", event.error);
        this.onError(event);
      }
      this.isPlaying = false;
      this.isPaused = false;
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    // Chromium bug fix: resume if paused
    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utterance);
  }

  pause() {
    if (!this.synth) return;
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPlaying = false;
      this.isPaused = true;
      this.onStateChange({ isPlaying: false, isPaused: true });
    }
  }

  resume() {
    if (!this.synth) return;
    if (this.synth.paused) {
      this.synth.resume();
      this.isPlaying = true;
      this.isPaused = false;
      this.onStateChange({ isPlaying: true, isPaused: false });
    }
  }

  stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.onStateChange({ isPlaying: false, isPaused: false });
  }
}

export const speechEngine = new SpeechEngine();
