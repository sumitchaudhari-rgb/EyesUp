import { articulatePunctuation } from './textCleaner';

/**
 * Free, high-quality Indian voices from Google Cloud TTS.
 * Neural2 = highest quality (WaveNet-level but newer).
 * WaveNet = excellent quality.
 */
const GOOGLE_INDIAN_VOICES = [
  {
    voiceURI: 'en-IN-Neural2-A',
    name: 'Priya — English India (Female)',
    lang: 'en-IN',
    languageCode: 'en-IN',
    quality: 'Neural2',
    default: true
  },
  {
    voiceURI: 'en-IN-Neural2-B',
    name: 'Raj — English India (Male)',
    lang: 'en-IN',
    languageCode: 'en-IN',
    quality: 'Neural2'
  },
  {
    voiceURI: 'en-IN-Neural2-C',
    name: 'Ananya — English India (Male)',
    lang: 'en-IN',
    languageCode: 'en-IN',
    quality: 'Neural2'
  },
  {
    voiceURI: 'en-IN-Neural2-D',
    name: 'Meera — English India (Female)',
    lang: 'en-IN',
    languageCode: 'en-IN',
    quality: 'Neural2'
  },
  {
    voiceURI: 'en-IN-Wavenet-A',
    name: 'Kaveri — English India (Female)',
    lang: 'en-IN',
    languageCode: 'en-IN',
    quality: 'WaveNet'
  },
  {
    voiceURI: 'en-IN-Wavenet-B',
    name: 'Arjun — English India (Male)',
    lang: 'en-IN',
    languageCode: 'en-IN',
    quality: 'WaveNet'
  },
  {
    voiceURI: 'hi-IN-Neural2-A',
    name: 'Kavya — हिंदी (Female)',
    lang: 'hi-IN',
    languageCode: 'hi-IN',
    quality: 'Neural2'
  },
  {
    voiceURI: 'hi-IN-Neural2-B',
    name: 'Vikram — हिंदी (Male)',
    lang: 'hi-IN',
    languageCode: 'hi-IN',
    quality: 'Neural2'
  },
  {
    voiceURI: 'hi-IN-Wavenet-A',
    name: 'Sneha — हिंदी (Female)',
    lang: 'hi-IN',
    languageCode: 'hi-IN',
    quality: 'WaveNet'
  },
  {
    voiceURI: 'hi-IN-Wavenet-B',
    name: 'Rohan — हिंदी (Male)',
    lang: 'hi-IN',
    languageCode: 'hi-IN',
    quality: 'WaveNet'
  }
];

/**
 * Google Cloud TTS Engine for EyesUp
 * Replaces Web Speech API with Google Neural2/WaveNet Indian voices.
 * Uses a secure Vercel serverless proxy (/api/tts) to hide the API key.
 * Supports precise word-level highlight timing via SSML marks + timepoints.
 */
class GoogleTtsEngine {
  constructor() {
    this.selectedVoice = GOOGLE_INDIAN_VOICES[0];
    this.rate = 1.0;
    this.pitch = 0.0;       // Google TTS pitch: -20 to +20 semitones
    this.volume = 1.0;
    this.wordPauseMs = 400;
    this.speakPunctuation = true;

    this.isPlaying = false;
    this.isPaused = false;
    this.currentAudio = null;
    this.wordTimers = [];

    this.currentSentenceText = '';
    this.currentSentenceIndex = 0;
    this.currentWords = [];
    this.currentWordIndex = 0;

    // Callbacks (same interface as browser SpeechEngine)
    this.onSentenceStart = () => {};
    this.onSentenceEnd = () => {};
    this.onWordStart = () => {};
    this.onError = () => {};
    this.onStateChange = () => {};
  }

  // ── Voice API (same interface as Web Speech engine) ──────────────────────

  loadVoices() {
    return GOOGLE_INDIAN_VOICES;
  }

  getVoices() {
    return GOOGLE_INDIAN_VOICES;
  }

  setVoice(voiceURI) {
    const found = GOOGLE_INDIAN_VOICES.find(v => v.voiceURI === voiceURI);
    if (found) this.selectedVoice = found;
  }

  setRate(rate) {
    this.rate = Math.max(0.25, Math.min(4.0, Number(rate) || 1.0));
  }

  setPitch(pitch) {
    // Convert from browser 0–2 range to Google's -20 to +20 semitones
    // Browser default is 1.0 → Google 0, browser 2.0 → Google +10
    this.pitch = Math.max(-20, Math.min(20, Number(pitch) || 0.0));
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, Number(vol) || 1.0));
    if (this.currentAudio) this.currentAudio.volume = this.volume;
  }

  setWordPauseMs(ms) {
    this.wordPauseMs = Math.max(0, Math.min(3000, Number(ms) || 0));
  }

  setSpeakPunctuation(val) {
    this.speakPunctuation = Boolean(val);
  }

  // ── Core TTS ─────────────────────────────────────────────────────────────

  async speak(text, sentenceIndex = 0) {
    this.stop();

    if (!text || text.trim().length === 0) return;

    const rawText = text.trim();
    this.currentSentenceText = rawText;
    this.currentSentenceIndex = sentenceIndex;
    this.currentWords = rawText.split(/\s+/).filter(w => w.length > 0);
    this.currentWordIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;

    this.onSentenceStart({ sentenceIndex, text: rawText });
    this.onStateChange({ isPlaying: true, isPaused: false });

    try {
      const processedText = this.speakPunctuation
        ? articulatePunctuation(rawText)
        : rawText;

      const { audioBase64, timepoints } = await this._fetchAudio(processedText);

      if (!this.isPlaying) return; // stopped while awaiting fetch

      this._playAudio(audioBase64, timepoints, sentenceIndex);
    } catch (err) {
      console.error('[Google TTS] Speak error:', err.message);
      this.isPlaying = false;
      this.isPaused = false;
      this.onError(err);
      this.onStateChange({ isPlaying: false, isPaused: false });
    }
  }

  /**
   * Builds SSML with word marks (for precise timing) and optional pause breaks.
   * Calls /api/tts proxy to get MP3 audio + word timepoints.
   */
  async _fetchAudio(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);

    // Build SSML: <mark name="w0"/>word<break time="500ms"/> ...
    const parts = words.map((word, i) => {
      const wordPart = `<mark name="w${i}"/>${this._escapeXml(word)}`;
      return this.wordPauseMs > 0
        ? `${wordPart}<break time="${this.wordPauseMs}ms"/>`
        : wordPart;
    });
    const ssml = `<speak>${parts.join(' ')}</speak>`;

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ssml,
        voiceName: this.selectedVoice.voiceURI,
        languageCode: this.selectedVoice.languageCode,
        speakingRate: this.rate,
        pitch: this.pitch
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `TTS API error ${response.status}`);
    }

    return response.json(); // { audioBase64, timepoints }
  }

  /**
   * Plays the base64 MP3 audio and schedules word highlight callbacks
   * using the precise timepoints returned by Google Cloud TTS.
   */
  _playAudio(audioBase64, timepoints, sentenceIndex) {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.volume = this.volume;
    this.currentAudio = audio;

    // Schedule onWordStart callbacks from Google's timepoints
    if (timepoints && timepoints.length > 0) {
      timepoints.forEach((tp) => {
        const wordIndex = parseInt(tp.markName.replace('w', ''), 10);
        if (isNaN(wordIndex)) return;
        const delayMs = Math.round(tp.timeSeconds * 1000);

        const timer = setTimeout(() => {
          if (!this.isPlaying) return;
          this.currentWordIndex = wordIndex;
          this.onWordStart({
            wordIndex,
            totalWords: this.currentWords.length,
            word: this.currentWords[wordIndex] || '',
            sentenceIndex
          });
        }, delayMs);

        this.wordTimers.push(timer);
      });
    }

    audio.onended = () => {
      this.clearTimers();
      if (!this.isPlaying) return;
      this.isPlaying = false;
      this.isPaused = false;
      this.onSentenceEnd({ sentenceIndex, text: this.currentSentenceText });
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    audio.onerror = () => {
      this.clearTimers();
      this.isPlaying = false;
      this.isPaused = false;
      this.onError(new Error('Audio playback failed'));
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    audio.play().catch((err) => {
      this.isPlaying = false;
      this.isPaused = false;
      this.onError(err);
      this.onStateChange({ isPlaying: false, isPaused: false });
    });
  }

  /**
   * Repeats the previous word (1 time) then continues from that word onward.
   */
  repeatPreviousWord() {
    if (!this.currentWords || this.currentWords.length === 0) return;
    const targetWordIdx = Math.max(0, this.currentWordIndex > 0 ? this.currentWordIndex - 1 : 0);
    const remainingText = this.currentWords.slice(targetWordIdx).join(' ');
    this.stop();
    // Restore word list and continue from previous word
    this.currentWords = this.currentSentenceText.split(/\s+/).filter(w => w.length > 0);
    this.speak(remainingText, this.currentSentenceIndex);
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  stop() {
    this.clearTimers();
    this.isPlaying = false;
    this.isPaused = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    this.onStateChange({ isPlaying: false, isPaused: false });
  }

  pause() {
    if (!this.isPlaying || !this.currentAudio) return;
    this.clearTimers();
    this.currentAudio.pause();
    this.isPlaying = false;
    this.isPaused = true;
    this.onStateChange({ isPlaying: false, isPaused: true });
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    // Re-speak remaining words from current word index since audio can't resume with timing
    const remainingText = this.currentWords.slice(this.currentWordIndex).join(' ');
    if (remainingText.trim()) {
      this.speak(remainingText, this.currentSentenceIndex);
    }
  }

  clearTimers() {
    this.wordTimers.forEach(t => clearTimeout(t));
    this.wordTimers = [];
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const speechEngine = new GoogleTtsEngine();
