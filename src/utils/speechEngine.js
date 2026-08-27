import { articulatePunctuation } from './textCleaner';

/**
 * Web Speech API Controller for EyesUp
 * Supports Indian voices, speed controls, word-by-word pause, spoken punctuation,
 * and 1-time word/line repeating with automatic forward continuation.
 */
class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.utterance = null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0; // 0.25 - 2.0
    this.pitch = 1.0;
    this.volume = 1.0;
    this.wordPauseMs = 400; // ms pause between words
    this.speakPunctuation = true; // Read punctuations aloud ("comma", "full stop", etc.)
    this.isPlaying = false;
    this.isPaused = false;
    
    // Dictation state
    this.currentSentenceText = '';
    this.currentSentenceIndex = 0;
    this.currentWords = [];
    this.currentWordIndex = 0;
    this.wordPauseTimeout = null;

    // Callbacks
    this.onSentenceStart = () => {};
    this.onSentenceEnd = () => {};
    this.onWordStart = () => {};
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

    // Filter strictly for Indian voices
    const indianVoices = allVoices.filter(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return (
        lang.includes('-in') ||
        lang.includes('_in') ||
        lang.startsWith('hi') ||
        lang.startsWith('ta') ||
        lang.startsWith('te') ||
        lang.startsWith('mr') ||
        lang.startsWith('bn') ||
        lang.startsWith('gu') ||
        lang.startsWith('kn') ||
        lang.startsWith('ml') ||
        lang.startsWith('pa') ||
        name.includes('india') ||
        name.includes('indian') ||
        name.includes('hindi') ||
        name.includes('heera') ||
        name.includes('ravi') ||
        name.includes('neerja') ||
        name.includes('prabhat') ||
        name.includes('veena') ||
        name.includes('kalpana') ||
        name.includes('hemant')
      );
    });

    this.voices = indianVoices.length > 0 ? indianVoices : allVoices;

    this.voices.sort((a, b) => {
      const aLang = (a.lang || '').toLowerCase();
      const bLang = (b.lang || '').toLowerCase();
      const aIsEnIn = aLang === 'en-in';
      const bIsEnIn = bLang === 'en-in';
      if (aIsEnIn && !bIsEnIn) return -1;
      if (!aIsEnIn && bIsEnIn) return 1;
      return a.name.localeCompare(b.name);
    });

    if (!this.selectedVoice && this.voices.length > 0) {
      const defaultVoice = this.voices.find(v => (v.lang || '').toLowerCase() === 'en-in') || this.voices[0];
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
    this.rate = Math.max(0.25, Math.min(2.0, Number(newRate) || 1.0));
  }

  setPitch(newPitch) {
    this.pitch = Math.max(0.5, Math.min(1.5, Number(newPitch) || 1.0));
  }

  setWordPauseMs(ms) {
    this.wordPauseMs = Math.max(0, Math.min(3000, Number(ms) || 0));
  }

  setSpeakPunctuation(val) {
    this.speakPunctuation = Boolean(val);
  }

  clearTimeouts() {
    if (this.wordPauseTimeout) {
      clearTimeout(this.wordPauseTimeout);
      this.wordPauseTimeout = null;
    }
  }

  /**
   * Speaks a sentence with optional punctuation reading and word-pause pacing
   */
  speak(text, sentenceIndex = 0) {
    if (!this.synth) {
      this.onError(new Error("Web Speech API is not supported in this browser."));
      return;
    }

    this.stop();

    if (!text || text.trim().length === 0) {
      this.isPlaying = false;
      this.isPaused = false;
      this.onStateChange({ isPlaying: false, isPaused: false });
      return;
    }

    this.currentSentenceText = text.trim();
    this.currentSentenceIndex = sentenceIndex;
    this.isPlaying = true;
    this.isPaused = false;

    this.beginSentencePlayback(this.currentSentenceText, sentenceIndex);
  }

  beginSentencePlayback(text, sentenceIndex) {
    this.onSentenceStart({ sentenceIndex, text });
    this.onStateChange({ isPlaying: true, isPaused: false });

    if (this.wordPauseMs > 0) {
      this.currentWords = text.split(/\s+/).filter(w => w.length > 0);
      this.currentWordIndex = 0;
      this.speakNextWord();
    } else {
      this.speakContinuousSentence(text, sentenceIndex);
    }
  }

  speakNextWord() {
    if (!this.isPlaying || this.isPaused) return;

    if (this.currentWordIndex >= this.currentWords.length) {
      this.isPlaying = false;
      this.onSentenceEnd({ sentenceIndex: this.currentSentenceIndex, text: this.currentSentenceText });
      this.onStateChange({ isPlaying: false, isPaused: false });
      return;
    }

    const rawWord = this.currentWords[this.currentWordIndex];
    this.onWordStart({
      wordIndex: this.currentWordIndex,
      totalWords: this.currentWords.length,
      word: rawWord,
      sentenceIndex: this.currentSentenceIndex
    });

    const spokenText = this.speakPunctuation ? articulatePunctuation(rawWord) : rawWord;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    this.utterance = utterance;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onend = () => {
      if (!this.isPlaying || this.isPaused) return;
      this.currentWordIndex++;

      // Pause for handwriting time, then advance to next word
      this.wordPauseTimeout = setTimeout(() => {
        this.speakNextWord();
      }, this.wordPauseMs);
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn("Speech synthesis notice:", event.error);
        this.onError(event);
      }
    };

    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utterance);
  }

  speakContinuousSentence(text, sentenceIndex) {
    const spokenText = this.speakPunctuation ? articulatePunctuation(text) : text;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    this.utterance = utterance;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.onSentenceEnd({ sentenceIndex, text });
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn("Speech synthesis notice:", event.error);
        this.onError(event);
      }
      this.isPlaying = false;
      this.isPaused = false;
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utterance);
  }

  /**
   * Repeats the previous word exactly 1 time, then continues forward through the rest of the sentence.
   */
  repeatPreviousWord() {
    this.clearTimeouts();
    if (!this.synth) return;
    this.synth.cancel();

    if (this.currentWords && this.currentWords.length > 0) {
      const targetWordIdx = Math.max(0, this.currentWordIndex > 0 ? this.currentWordIndex - 1 : 0);
      this.currentWordIndex = targetWordIdx;
      this.isPlaying = true;
      this.isPaused = false;
      this.onStateChange({ isPlaying: true, isPaused: false });
      this.speakNextWord();
    } else if (this.currentSentenceText) {
      this.speak(this.currentSentenceText, this.currentSentenceIndex);
    }
  }

  pause() {
    this.clearTimeouts();
    if (!this.synth) return;
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = true;
    this.onStateChange({ isPlaying: false, isPaused: true });
  }

  resume() {
    if (!this.isPaused) return;
    this.isPlaying = true;
    this.isPaused = false;
    this.onStateChange({ isPlaying: true, isPaused: false });

    if (this.wordPauseMs > 0 && this.currentWords.length > 0) {
      this.speakNextWord();
    } else if (this.currentSentenceText) {
      this.speak(this.currentSentenceText, this.currentSentenceIndex);
    }
  }

  stop() {
    this.clearTimeouts();
    if (!this.synth) return;
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentWordIndex = 0;
    this.currentWords = [];
    this.onStateChange({ isPlaying: false, isPaused: false });
  }
}

export const speechEngine = new SpeechEngine();
