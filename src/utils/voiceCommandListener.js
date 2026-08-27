/**
 * Hands-Free Voice Command Listener for EyesUp
 * Continuous listening for student voice commands while handwriting.
 */

class VoiceCommandListener {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.shouldStayActive = false;
    this.lastCommand = '';
    this.lastCommandTime = 0;

    // Callbacks
    this.onCommand = () => {};
    this.onStatusChange = () => {};
    this.onError = () => {};

    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN'; // Indian English

    rec.onstart = () => {
      this.isListening = true;
      this.onStatusChange({ isListening: true });
    };

    rec.onresult = (event) => {
      const now = Date.now();
      if (now - this.lastCommandTime < 500) return;

      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript.toLowerCase();
      }

      this.processTranscript(transcript.trim());
    };

    rec.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn("Voice command notice:", event.error);
        this.onError(event);
      }
    };

    rec.onend = () => {
      this.isListening = false;
      this.onStatusChange({ isListening: false });

      if (this.shouldStayActive) {
        try {
          setTimeout(() => {
            if (this.shouldStayActive && !this.isListening) {
              rec.start();
            }
          }, 300);
        } catch (e) {}
      }
    };

    this.recognition = rec;
  }

  processTranscript(text) {
    if (!text) return;

    const now = Date.now();
    if (now - this.lastCommandTime < 600) return;

    // 1. REPEAT LINE / REPEAT WHOLE SENTENCE
    if (
      text.includes('repeat line') || 
      text.includes('repeat sentence') || 
      text.includes('whole line') ||
      text.includes('entire line') ||
      text.includes('from beginning') ||
      text.includes('from start') ||
      text.includes('full sentence')
    ) {
      this.lastCommandTime = now;
      this.lastCommand = 'repeat_line';
      this.onCommand({ type: 'repeat_line', phrase: text });
      return;
    }

    // 2. REPEAT PREVIOUS WORD
    if (
      text.includes('repeat word') ||
      text.includes('last word') ||
      text.includes('previous word') ||
      text.includes('say again') ||
      text.includes('what was that') ||
      text === 'repeat' ||
      text.endsWith(' repeat') ||
      text.startsWith('repeat ') ||
      text.includes('one more time')
    ) {
      this.lastCommandTime = now;
      this.lastCommand = 'repeat_word';
      this.onCommand({ type: 'repeat_word', phrase: text });
      return;
    }

    // 3. PAUSE / STOP / WAIT
    if (
      text.includes('pause') || 
      text.includes('stop') || 
      text.includes('wait') || 
      text.includes('hold on') ||
      text.includes('freeze')
    ) {
      this.lastCommandTime = now;
      this.lastCommand = 'pause';
      this.onCommand({ type: 'pause', phrase: text });
      return;
    }

    // 4. PLAY / RESUME / CONTINUE / START
    if (
      text.includes('play') || 
      text.includes('resume') || 
      text.includes('continue') || 
      text.includes('start reading') || 
      text.includes('read') ||
      text.includes('go on')
    ) {
      this.lastCommandTime = now;
      this.lastCommand = 'play';
      this.onCommand({ type: 'play', phrase: text });
      return;
    }

    // 5. NEXT SENTENCE / SKIP
    if (
      text.includes('next sentence') || 
      text.includes('next line') || 
      text.includes('skip') ||
      text === 'next' ||
      text.endsWith(' next')
    ) {
      this.lastCommandTime = now;
      this.lastCommand = 'next_sentence';
      this.onCommand({ type: 'next_sentence', phrase: text });
      return;
    }

    // 6. PREVIOUS SENTENCE / BACK
    if (
      text.includes('previous sentence') || 
      text.includes('previous line') || 
      text.includes('go back') ||
      text === 'back'
    ) {
      this.lastCommandTime = now;
      this.lastCommand = 'prev_sentence';
      this.onCommand({ type: 'prev_sentence', phrase: text });
      return;
    }

    // 7. SPEED CONTROLS
    if (text.includes('slower') || text.includes('slow down')) {
      this.lastCommandTime = now;
      this.lastCommand = 'slower';
      this.onCommand({ type: 'slower', phrase: text });
      return;
    }

    if (text.includes('faster') || text.includes('speed up')) {
      this.lastCommandTime = now;
      this.lastCommand = 'faster';
      this.onCommand({ type: 'faster', phrase: text });
      return;
    }
  }

  start() {
    if (!this.recognition) return;
    this.shouldStayActive = true;
    try {
      this.recognition.start();
    } catch (e) {}
  }

  stop() {
    this.shouldStayActive = false;
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {}
  }

  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
    return this.isListening;
  }
}

export const voiceCommandListener = new VoiceCommandListener();
