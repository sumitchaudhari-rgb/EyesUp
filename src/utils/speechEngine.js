import { articulatePunctuation } from './textCleaner';
import { generateApiToken } from './security';

// ── Curated Microsoft Edge Neural Indian Voices ──
const NEURAL_VOICES = [
  { voiceURI: 'en-IN-NeerjaNeural',           name: 'Neerja — English India',         lang: 'en-IN', languageCode: 'en-IN', gender: 'Female', quality: 'Neural', type: 'neural', default: true },
  { voiceURI: 'en-IN-PrabhatNeural',          name: 'Prabhat — English India',        lang: 'en-IN', languageCode: 'en-IN', gender: 'Male',   quality: 'Neural', type: 'neural' },
  { voiceURI: 'en-IN-NeerjaExpressiveNeural', name: 'Neerja Expressive — Eng (IN)',  lang: 'en-IN', languageCode: 'en-IN', gender: 'Female', quality: 'Neural', type: 'neural' },
  { voiceURI: 'hi-IN-SwaraNeural',            name: 'Swara — हिंदी (Hindi)',          lang: 'hi-IN', languageCode: 'hi-IN', gender: 'Female', quality: 'Neural', type: 'neural' },
  { voiceURI: 'hi-IN-MadhurNeural',           name: 'Madhur — हिंदी (Hindi)',         lang: 'hi-IN', languageCode: 'hi-IN', gender: 'Male',   quality: 'Neural', type: 'neural' },
  { voiceURI: 'ta-IN-PallaviNeural',          name: 'Pallavi — தமிழ் (Tamil)',        lang: 'ta-IN', languageCode: 'ta-IN', gender: 'Female', quality: 'Neural', type: 'neural' },
  { voiceURI: 'te-IN-ShrutiNeural',           name: 'Shruti — తెలుగు (Telugu)',       lang: 'te-IN', languageCode: 'te-IN', gender: 'Female', quality: 'Neural', type: 'neural' },
  { voiceURI: 'mr-IN-AarohiNeural',           name: 'Aarohi — मराठी (Marathi)',       lang: 'mr-IN', languageCode: 'mr-IN', gender: 'Female', quality: 'Neural', type: 'neural' },
  { voiceURI: 'bn-IN-TanishaaNeural',         name: 'Tanishaa — বাংলা (Bengali)',     lang: 'bn-IN', languageCode: 'bn-IN', gender: 'Female', quality: 'Neural', type: 'neural' },
  { voiceURI: 'kn-IN-SapnaNeural',            name: 'Sapna — ಕನ್ನಡ (Kannada)',       lang: 'kn-IN', languageCode: 'kn-IN', gender: 'Female', quality: 'Neural', type: 'neural' },
];

/**
 * EyesUp Speech Engine
 * Features:
 *  - Accurate Male / Female voice rendering and pitch modulation
 *  - True Neural Edge TTS synthesis with boundary timing
 *  - High-precision Browser SpeechSynthesis fallback with gender timbre adjustment
 */
class SpeechEngine {
  constructor() {
    this._neuralVoices = NEURAL_VOICES;
    this._browserVoices = [];
    this.selectedVoiceURI = NEURAL_VOICES[0].voiceURI;
    this.selectedVoice = NEURAL_VOICES[0];

    this.rate = 1.0;
    this.pitch = 0.0;
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

    // Callbacks
    this.onSentenceStart = () => {};
    this.onSentenceEnd = () => {};
    this.onWordStart = () => {};
    this.onError = () => {};
    this.onStateChange = () => {};

    this._initVoices();
  }

  _initVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadBrowserVoices = () => {
        const all = window.speechSynthesis.getVoices() || [];
        this._browserVoices = all.map(v => {
          const l = (v.lang || '').toLowerCase();
          const n = (v.name || '').toLowerCase();

          let gender = 'Female';
          if (n.includes('male') || n.includes('ravi') || n.includes('david') || n.includes('george') || 
              n.includes('mark') || n.includes('hemant') || n.includes('madhur') || n.includes('prabhat')) {
            gender = 'Male';
          } else if (n.includes('female') || n.includes('heera') || n.includes('zira') || n.includes('kalpana') || 
                     n.includes('swara') || n.includes('neerja') || n.includes('hazel') || n.includes('susan')) {
            gender = 'Female';
          }

          return {
            voiceURI: `system:${v.name}`,
            name: `${v.name}`,
            lang: v.lang,
            languageCode: v.lang,
            gender,
            quality: 'System',
            type: 'browser',
            nativeVoice: v
          };
        });
      };

      loadBrowserVoices();
      window.speechSynthesis.onvoiceschanged = loadBrowserVoices;
    }

    this._fetchServerVoices();
  }

  async _fetchServerVoices() {
    try {
      const res = await fetch('/api/voices');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.voices) && data.voices.length > 0) {
          this._neuralVoices = data.voices.map(v => ({ ...v, type: 'neural' }));
        }
      }
    } catch (_e) {
      // Static fallback
    }
  }

  // ── Voice Catalog & Selection ─────────────────────────────────────────────

  getVoices() {
    const combined = [...this._neuralVoices];
    // Add real detected Indian / English system voices
    if (this._browserVoices.length > 0) {
      const relevantSystemVoices = this._browserVoices.filter(bv => {
        const l = (bv.lang || '').toLowerCase();
        const n = (bv.name || '').toLowerCase();
        return l.includes('-in') || l.includes('_in') || l.startsWith('hi') || n.includes('india') || n.includes('heera') || n.includes('ravi');
      });

      relevantSystemVoices.forEach(bv => {
        if (!combined.some(v => v.voiceURI === bv.voiceURI || v.name === bv.name)) {
          combined.push(bv);
        }
      });
    }
    return combined;
  }

  loadVoices() {
    return this.getVoices();
  }

  setVoice(voiceURI) {
    if (!voiceURI) return;
    this.selectedVoiceURI = voiceURI;

    const all = this.getVoices();
    const found = all.find(v => v.voiceURI === voiceURI || v.name === voiceURI);
    if (found) {
      this.selectedVoice = found;
      console.log(`[SpeechEngine] Active voice: ${found.name} (${found.gender})`);
    }
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  setRate(rate) {
    this.rate = Math.max(0.25, Math.min(4.0, Number(rate) || 1.0));
  }

  setPitch(pitch) {
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

  // ── Core Playback ─────────────────────────────────────────────────────────

  async speak(text, sentenceIndex = 0) {
    this.stop();

    const rawText = String(text).trim();
    if (!rawText) return;

    this.currentSentenceText = rawText;
    this.currentSentenceIndex = sentenceIndex;
    this.currentWords = rawText.split(/\s+/).filter(Boolean);
    this.currentWordIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;

    this.onSentenceStart({ sentenceIndex, text: rawText });
    this.onStateChange({ isPlaying: true, isPaused: false });

    const processedText = this.speakPunctuation
      ? articulatePunctuation(rawText)
      : rawText;

    // If native system voice was picked directly
    if (this.selectedVoice?.type === 'browser') {
      this._speakWithBrowserSynthesis(processedText, sentenceIndex);
      return;
    }

    // Try Neural Edge TTS via serverless endpoint
    try {
      const { audioBase64, timepoints } = await this._fetchAudio(processedText);
      if (!this.isPlaying) return;
      this._playAudio(audioBase64, timepoints, sentenceIndex);
    } catch (err) {
      console.warn('[SpeechEngine] Edge TTS API unavailable, using gender-matched synthesis:', err.message);
      this._speakWithBrowserSynthesis(processedText, sentenceIndex);
    }
  }

  async _fetchAudio(text) {
    const voice = this.selectedVoice.voiceURI;
    const { timestamp, signature } = generateApiToken(text, voice);

    const payload = {
      text,
      voice,
      rate: this.rate,
      pitch: this.pitch,
      wordPauseMs: this.wordPauseMs,
      timestamp,
      signature
    };

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `TTS API error ${response.status}`);
    }

    return response.json();
  }

  _playAudio(audioBase64, timepoints, sentenceIndex) {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.volume = this.volume;
    this.currentAudio = audio;

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
            word: this.currentWords[wordIndex] ?? '',
            sentenceIndex
          });
        }, Math.round(timeSeconds * 1000));

        this.wordTimers.push(timer);
      });
    }

    audio.onended = () => {
      this._clearTimers();
      if (!this.isPlaying) return;
      this.isPlaying = false;
      this.isPaused = false;
      this.onSentenceEnd({ sentenceIndex, text: this.currentSentenceText });
      this.onStateChange({ isPlaying: false, isPaused: false });
    };

    audio.onerror = () => {
      this._clearTimers();
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
   * Browser SpeechSynthesis fallback with TRUE gender voice timbre & pitch modulation
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

    const browserVoices = window.speechSynthesis.getVoices() || [];
    const targetLang = (this.selectedVoice?.lang || 'en-IN').toLowerCase();
    const targetGender = (this.selectedVoice?.gender || 'Female').toLowerCase();
    const isMaleRequested = targetGender === 'male';

    let matchedVoice = null;
    if (this.selectedVoice?.nativeVoice) {
      matchedVoice = this.selectedVoice.nativeVoice;
    } else {
      if (isMaleRequested) {
        // Look for male voices
        matchedVoice = browserVoices.find(v => {
          const n = (v.name || '').toLowerCase();
          const l = (v.lang || '').toLowerCase();
          const isMale = n.includes('ravi') || n.includes('david') || n.includes('george') || n.includes('mark') || n.includes('male') || n.includes('madhur') || n.includes('hemant');
          const isLang = l.includes('in') || l.startsWith(targetLang.split('-')[0]) || l.startsWith('en');
          return isMale && isLang;
        }) || browserVoices.find(v => {
          const n = (v.name || '').toLowerCase();
          return n.includes('ravi') || n.includes('david') || n.includes('george') || n.includes('male');
        });
      } else {
        // Look for female voices
        matchedVoice = browserVoices.find(v => {
          const n = (v.name || '').toLowerCase();
          const l = (v.lang || '').toLowerCase();
          const isFemale = n.includes('heera') || n.includes('swara') || n.includes('kalpana') || n.includes('zira') || n.includes('female') || n.includes('neerja');
          const isLang = l.includes('in') || l.startsWith(targetLang.split('-')[0]) || l.startsWith('en');
          return isFemale && isLang;
        }) || browserVoices.find(v => (v.lang || '').toLowerCase().includes('in'))
           || browserVoices[0];
      }
    }

    // Dynamic pitch modulation:
    // If male requested, drop pitch to 0.72 - 0.78 for a rich, deep, masculine voice!
    // If female requested, use natural higher pitch 1.08 - 1.15.
    let computedPitch = isMaleRequested ? 0.75 : 1.10;
    console.log(`[BrowserSynthesis] Speaking as ${isMaleRequested ? 'MALE (pitch: ' + computedPitch + ')' : 'FEMALE (pitch: ' + computedPitch + ')'} using voice: ${matchedVoice?.name || 'Default'}`);

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
      utter.pitch = computedPitch;
      utter.volume = this.volume;
      if (matchedVoice) utter.voice = matchedVoice;

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

  // ── Controls ──────────────────────────────────────────────────────────────

  repeatPreviousWord() {
    if (!this.currentWords?.length) return;
    const targetIdx = Math.max(0, this.currentWordIndex > 0 ? this.currentWordIndex - 1 : 0);
    const remainingText = this.currentWords.slice(targetIdx).join(' ');
    this.stop();
    this.currentWords = this.currentSentenceText.split(/\s+/).filter(Boolean);
    this.speak(remainingText, this.currentSentenceIndex);
  }

  stop() {
    this._clearTimers();
    this.isPlaying = false;
    this.isPaused = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.onStateChange({ isPlaying: false, isPaused: false });
  }

  pause() {
    if (!this.isPlaying) return;
    this._clearTimers();
    if (this.currentAudio) this.currentAudio.pause();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    this.isPlaying = false;
    this.isPaused = true;
    this.onStateChange({ isPlaying: false, isPaused: true });
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
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

export const speechEngine = new SpeechEngine();
