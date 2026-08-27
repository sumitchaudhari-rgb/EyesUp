import { articulatePunctuation } from './textCleaner';
import { generateApiToken } from './security';

// ── Static voice list (mirrors api/voices.js — used as fallback before fetch) ──
const DEFAULT_VOICES = [
  { voiceURI: 'en-IN-NeerjaNeural',           name: 'Neerja — English India (Female)',   lang: 'en-IN', languageCode: 'en-IN', quality: 'Neural', default: true },
  { voiceURI: 'en-IN-PrabhatNeural',          name: 'Prabhat — English India (Male)',    lang: 'en-IN', languageCode: 'en-IN', quality: 'Neural' },
  { voiceURI: 'en-IN-NeerjaExpressiveNeural', name: 'Neerja Expressive — English India', lang: 'en-IN', languageCode: 'en-IN', quality: 'Neural' },
  { voiceURI: 'hi-IN-SwaraNeural',            name: 'Swara — हिंदी (Female)',            lang: 'hi-IN', languageCode: 'hi-IN', quality: 'Neural' },
  { voiceURI: 'hi-IN-MadhurNeural',           name: 'Madhur — हिंदी (Male)',             lang: 'hi-IN', languageCode: 'hi-IN', quality: 'Neural' },
  { voiceURI: 'ta-IN-PallaviNeural',          name: 'Pallavi — தமிழ் (Tamil)',           lang: 'ta-IN', languageCode: 'ta-IN', quality: 'Neural' },
  { voiceURI: 'te-IN-ShrutiNeural',           name: 'Shruti — తెలుగు (Telugu)',          lang: 'te-IN', languageCode: 'te-IN', quality: 'Neural' },
  { voiceURI: 'mr-IN-AarohiNeural',           name: 'Aarohi — मराठी (Marathi)',          lang: 'mr-IN', languageCode: 'mr-IN', quality: 'Neural' },
  { voiceURI: 'bn-IN-TanishaaNeural',         name: 'Tanishaa — বাংলা (Bengali)',        lang: 'bn-IN', languageCode: 'bn-IN', quality: 'Neural' },
  { voiceURI: 'kn-IN-SapnaNeural',            name: 'Sapna — ಕನ್ನಡ (Kannada)',          lang: 'kn-IN', languageCode: 'kn-IN', quality: 'Neural' },
];

/**
 * EyesUp Speech Engine — Microsoft Edge TTS (Neural Indian Voices)
 *
 * Architecture:
 *   Frontend → POST /api/tts (Vercel serverless) → msedge-tts → Microsoft Neural TTS
 *
 * Features:
 *   - 10 free Indian Neural voices (no API key)
 *   - Precise word-level highlight timing via Microsoft word boundary events
 *   - Word-pause breaks embedded in SSML on the server
 *   - Punctuation dictation ("comma", "full stop", etc.)
 *   - Same public interface as the original Web Speech engine (App.jsx unchanged)
 */
class EdgeTtsEngine {
  constructor() {
    this._voices = DEFAULT_VOICES;
    this.selectedVoice = DEFAULT_VOICES[0];
    this.rate = 1.0;        // 0.25 – 2.0
    this.pitch = 0.0;       // semitones: -20 to +20
    this.volume = 1.0;
    this.wordPauseMs = 400;
    this.speakPunctuation = true;

    this.isPlaying = false;
    this.isPaused = false;

    /** @type {HTMLAudioElement|null} */
    this.currentAudio = null;
    /** @type {number[]} */
    this.wordTimers = [];

    this.currentSentenceText = '';
    this.currentSentenceIndex = 0;
    /** @type {string[]} */
    this.currentWords = [];
    this.currentWordIndex = 0;

    // ── Callbacks (same interface as original SpeechEngine) ──
    this.onSentenceStart = () => {};
    this.onSentenceEnd   = () => {};
    this.onWordStart     = () => {};
    this.onError         = () => {};
    this.onStateChange   = () => {};

    // Pre-fetch voice list from server (updates once on startup)
    this._fetchVoices();
  }

  // ── Voice API ─────────────────────────────────────────────────────────────

  /** Returns the current voice list (default voices until server responds). */
  getVoices() { return this._voices; }

  /** @deprecated use getVoices() */
  loadVoices() { return this._voices; }

  /** Set active voice by voiceURI. */
  setVoice(voiceURI) {
    const found = this._voices.find(v => v.voiceURI === voiceURI);
    if (found) this.selectedVoice = found;
  }

  async _fetchVoices() {
    try {
      const res = await fetch('/api/voices');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.voices) && data.voices.length > 0) {
        this._voices = data.voices;
      }
    } catch (_e) {
      // Silently use default list
    }
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  /** @param {number} rate — numeric (0.25–2.0) */
  setRate(rate)    { this.rate = Math.max(0.25, Math.min(4.0, Number(rate) || 1.0)); }

  /** @param {number} pitch — semitones (-20..+20) */
  setPitch(pitch)  { this.pitch = Math.max(-20, Math.min(20, Number(pitch) || 0.0)); }

  /** @param {number} vol — 0..1 */
  setVolume(vol)   {
    this.volume = Math.max(0, Math.min(1, Number(vol) || 1.0));
    if (this.currentAudio) this.currentAudio.volume = this.volume;
  }

  /** @param {number} ms — pause after each word (0 = fluid) */
  setWordPauseMs(ms)        { this.wordPauseMs = Math.max(0, Math.min(3000, Number(ms) || 0)); }

  /** @param {boolean} val */
  setSpeakPunctuation(val)  { this.speakPunctuation = Boolean(val); }

  // ── Core Playback ─────────────────────────────────────────────────────────

  /**
   * Synthesize `text` via Edge TTS and play it.
   * @param {string} text
   * @param {number} sentenceIndex
   */
  async speak(text, sentenceIndex = 0) {
    this.stop();

    const rawText = String(text).trim();
    if (!rawText) return;

    this.currentSentenceText  = rawText;
    this.currentSentenceIndex = sentenceIndex;
    this.currentWords         = rawText.split(/\s+/).filter(Boolean);
    this.currentWordIndex     = 0;
    this.isPlaying            = true;
    this.isPaused             = false;

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
      console.warn('[EdgeTTS] API failed, falling back to browser speech synthesis:', err.message);
      this._speakWithBrowserSynthesis(rawText, sentenceIndex);
    }
  }

  /**
   * Seamless offline fallback using the browser's built-in SpeechSynthesis
   */
  _speakWithBrowserSynthesis(text, sentenceIndex) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.isPlaying = false;
      this.isPaused = false;
      this.onError(new Error('No speech synthesis available'));
      this.onStateChange({ isPlaying: false, isPaused: false });
      return;
    }

    window.speechSynthesis.cancel();
    const words = text.split(/\s+/).filter(Boolean);
    let currentIdx = this.currentWordIndex;

    const speakNextWord = () => {
      if (!this.isPlaying || currentIdx >= words.length) {
        this.isPlaying = false;
        this.isPaused = false;
        this.onSentenceEnd({ sentenceIndex, text });
        this.onStateChange({ isPlaying: false, isPaused: false });
        return;
      }

      this.currentWordIndex = currentIdx;
      this.onWordStart({
        wordIndex: currentIdx,
        totalWords: words.length,
        word: words[currentIdx],
        sentenceIndex
      });

      const wordToSpeak = this.speakPunctuation
        ? articulatePunctuation(words[currentIdx])
        : words[currentIdx];

      const utter = new SpeechSynthesisUtterance(wordToSpeak);
      utter.rate = this.rate;
      utter.pitch = 1.0;
      utter.volume = this.volume;

      // Try to find matching browser voice
      const browserVoices = window.speechSynthesis.getVoices();
      const match = browserVoices.find(v => (v.lang || '').toLowerCase().includes('in')) || browserVoices[0];
      if (match) utter.voice = match;

      utter.onend = () => {
        currentIdx++;
        if (this.wordPauseMs > 0) {
          this.wordTimers.push(setTimeout(speakNextWord, this.wordPauseMs));
        } else {
          speakNextWord();
        }
      };

      utter.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') return;
        currentIdx++;
        speakNextWord();
      };

      window.speechSynthesis.speak(utter);
    };

    speakNextWord();
  }

  /**
   * POST /api/tts — returns { audioBase64, timepoints }.
   * Server builds SSML, calls msedge-tts, returns MP3 as base64.
   * @param {string} text
   * @returns {Promise<{ audioBase64: string, timepoints: Array<{ markName: string, timeSeconds: number }> }>}
   */
  async _fetchAudio(text) {
    const voice = this.selectedVoice.voiceURI;
    const { timestamp, signature } = generateApiToken(text, voice);

    const payload = {
      text,
      voice,
      rate:        this.rate,
      pitch:       this.pitch,
      wordPauseMs: this.wordPauseMs,
      timestamp,
      signature
    };

    console.log('[EdgeTTS] Requesting:', payload.voice, '| chars:', text.length);

    let response;
    try {
      response = await fetch('/api/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
    } catch (networkErr) {
      console.error('[EdgeTTS] Network error (is /api/tts reachable?):', networkErr.message);
      throw new Error('Cannot reach /api/tts — run `npx vercel dev` locally, or check Vercel deployment.');
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = errBody.error || `TTS API error ${response.status}`;
      console.error('[EdgeTTS] Server error:', response.status, msg);
      throw new Error(msg);
    }

    const data = await response.json();
    console.log('[EdgeTTS] OK — audio:', data.audioBase64?.length ?? 0, 'chars | timepoints:', data.timepoints?.length ?? 0);
    return data;
  }


  /**
   * Decodes base64 MP3, plays via HTMLAudioElement,
   * and schedules onWordStart callbacks using server-returned timepoints.
   * @param {string} audioBase64
   * @param {Array<{ markName: string, timeSeconds: number }>} timepoints
   * @param {number} sentenceIndex
   */
  _playAudio(audioBase64, timepoints, sentenceIndex) {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.volume = this.volume;
    this.currentAudio = audio;

    // Schedule word highlight callbacks from Microsoft's boundary timing
    if (Array.isArray(timepoints) && timepoints.length > 0) {
      timepoints.forEach(({ markName, timeSeconds }) => {
        const wordIndex = parseInt(markName.replace('w', ''), 10);
        if (isNaN(wordIndex)) return;

        const timer = setTimeout(() => {
          if (!this.isPlaying) return;
          this.currentWordIndex = wordIndex;
          this.onWordStart({
            wordIndex,
            totalWords: this.currentWords.length,
            word:       this.currentWords[wordIndex] ?? '',
            sentenceIndex,
          });
        }, Math.round(timeSeconds * 1000));

        this.wordTimers.push(timer);
      });
    }

    audio.onended = () => {
      this._clearTimers();
      if (!this.isPlaying) return;
      this.isPlaying = false;
      this.isPaused  = false;
      this.onSentenceEnd({ sentenceIndex, text: this.currentSentenceText });
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    audio.onerror = () => {
      this._clearTimers();
      this.isPlaying = false;
      this.isPaused  = false;
      this.onError(new Error('Audio playback failed'));
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    audio.play().catch((err) => {
      this.isPlaying = false;
      this.isPaused  = false;
      this.onError(err);
      this.onStateChange({ isPlaying: false, isPaused: false });
    });
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  /**
   * Repeat the previous word once then continue forward through the rest.
   */
  repeatPreviousWord() {
    if (!this.currentWords?.length) return;
    const targetIdx     = Math.max(0, this.currentWordIndex > 0 ? this.currentWordIndex - 1 : 0);
    const remainingText = this.currentWords.slice(targetIdx).join(' ');
    this.stop();
    this.currentWords = this.currentSentenceText.split(/\s+/).filter(Boolean);
    this.speak(remainingText, this.currentSentenceIndex);
  }

  stop() {
    this._clearTimers();
    this.isPlaying = false;
    this.isPaused  = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio     = null;
    }
    this.onStateChange({ isPlaying: false, isPaused: false });
  }

  pause() {
    if (!this.isPlaying || !this.currentAudio) return;
    this._clearTimers();
    this.currentAudio.pause();
    this.isPlaying = false;
    this.isPaused  = true;
    this.onStateChange({ isPlaying: false, isPaused: true });
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    // Re-synthesize remaining words (audio cannot resume mid-stream with tight timing)
    const remainingText = this.currentWords.slice(this.currentWordIndex).join(' ');
    if (remainingText.trim()) {
      this.speak(remainingText, this.currentSentenceIndex);
    }
  }

  _clearTimers() {
    this.wordTimers.forEach(clearTimeout);
    this.wordTimers = [];
  }
}

export const speechEngine = new EdgeTtsEngine();
