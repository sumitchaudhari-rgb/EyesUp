import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  Repeat, 
  Clock,
  MessageSquare
} from 'lucide-react';

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const PAUSE_CYCLE = [0, 300, 500, 800, 1200];

export default function PlaybackPanel({
  doc,
  activeSentenceIndex,
  activeWordIndex,
  isPlaying,
  playbackSpeed,
  repeatMode,
  wordPauseMs,
  speakPunctuation,
  onToggleSpeakPunctuation,
  onToggleRepeat,
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onRestartSentence,
  onChangeSpeed,
  onChangeWordPause,
  onSelectSentence
}) {
  const currentSentence = doc.sentences[activeSentenceIndex] || "No sentence loaded";
  const totalSentences = doc.sentences.length;
  const progressPercent = Math.round(((activeSentenceIndex + 1) / totalSentences) * 100) || 0;

  const words = currentSentence.split(/\s+/).filter(w => w.length > 0);

  const handleCyclePause = () => {
    const currentIndex = PAUSE_CYCLE.indexOf(wordPauseMs);
    const nextIndex = (currentIndex + 1) % PAUSE_CYCLE.length;
    onChangeWordPause(PAUSE_CYCLE[nextIndex]);
  };

  return (
    <section 
      aria-label="Playback Controls and Active Sentence" 
      className="flex flex-col h-full space-y-4 animate-page-reveal"
    >
      {/* Primary Focus Card (Arm's-Length Legibility) */}
      <div className="flex-1 bg-cream-50 rounded-3xl border-2 border-indigo-pen/10 shadow-page p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative Watermark */}
        <div 
          aria-hidden="true" 
          className="absolute top-4 right-4 text-cream-300 pointer-events-none select-none font-serif text-7xl sm:text-8xl font-bold opacity-30"
        >
          {activeSentenceIndex + 1}
        </div>

        {/* Top meta row */}
        <div className="flex items-center justify-between z-10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-highlighter text-indigo-deep text-xs font-bold font-mono tracking-tight shadow-sm flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-indigo-deep animate-ping' : 'bg-indigo-deep'}`} />
              NOW READING
            </span>
            <span className="text-xs font-mono font-medium text-indigo-muted" aria-live="polite">
              Sentence {activeSentenceIndex + 1} of {totalSentences}
            </span>
          </div>

          {/* Dictation Action Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Punctuation Dictation Toggle */}
            <button
              onClick={onToggleSpeakPunctuation}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border flex items-center gap-1 transition-all ${
                speakPunctuation
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-cream-200 text-indigo-muted border-cream-300 hover:text-indigo-deep'
              }`}
              title="Speaks 'comma', 'full stop', 'question mark' aloud (U)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{speakPunctuation ? 'Punctuation ON' : 'Punctuation OFF'}</span>
            </button>

            {/* Word Pause Button */}
            <button
              onClick={handleCyclePause}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border flex items-center gap-1 transition-all ${
                wordPauseMs > 0
                  ? 'bg-highlighter text-indigo-deep border-highlighter-border shadow-sm'
                  : 'bg-cream-200 text-indigo-muted border-cream-300 hover:text-indigo-deep'
              }`}
              title="Cycle pause after each word: 0s -> 0.3s -> 0.5s -> 0.8s -> 1.2s (P)"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{wordPauseMs === 0 ? 'No Pause' : `${(wordPauseMs / 1000).toFixed(1)}s Pause`}</span>
            </button>

            {/* Loop Toggle */}
            <button
              onClick={onToggleRepeat}
              aria-pressed={repeatMode}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                repeatMode 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm' 
                  : 'bg-cream-200 text-indigo-muted border-cream-300 hover:text-indigo-deep'
              }`}
              title="Repeat this sentence indefinitely (T)"
            >
              <Repeat className="w-3.5 h-3.5 inline mr-1" />
              {repeatMode ? 'Looping' : 'Loop'}
            </button>
          </div>
        </div>

        {/* Big sentence display with word-by-word active focus */}
        <div className="my-auto py-4 sm:py-6 z-10">
          <p 
            key={activeSentenceIndex} 
            aria-live="polite"
            className="font-serif text-xl sm:text-3xl md:text-4xl font-medium text-indigo-deep leading-snug tracking-tight animate-sentence-focus"
          >
            “{words.map((w, wIdx) => {
              const isCurrentWord = isPlaying && wordPauseMs > 0 && activeWordIndex === wIdx;
              return (
                <span
                  key={wIdx}
                  className={`inline-block mr-1.5 transition-all duration-150 rounded px-1 ${
                    isCurrentWord 
                      ? 'bg-highlighter text-indigo-deep font-bold scale-105 shadow-sm ring-2 ring-highlighter-border' 
                      : ''
                  }`}
                >
                  {w}
                </span>
              );
            })}”
          </p>
          <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs text-indigo-muted">
            <span className="italic">
              {isPlaying 
                ? (speakPunctuation ? "Speaking with punctuation dictation & word pauses..." : "Speaking in Indian accent...") 
                : "Paused. Tap Spacebar or say 'play' to resume narration."}
            </span>
          </div>
        </div>

        {/* Scrubber slider */}
        <div className="space-y-2 z-10 pt-3 sm:pt-4 border-t border-cream-300">
          <div className="flex items-center justify-between text-[11px] font-mono text-indigo-muted">
            <span>Sentence 1</span>
            <span>Sentence {activeSentenceIndex + 1} of {totalSentences}</span>
            <span>Sentence {totalSentences}</span>
          </div>
          <input
            type="range"
            min="0"
            max={totalSentences - 1}
            value={activeSentenceIndex}
            onChange={(e) => onSelectSentence(Number(e.target.value))}
            aria-label="Sentence scrubber slider"
            className="w-full accent-indigo-pen cursor-pointer h-2 bg-cream-200 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-pen"
          />
        </div>
      </div>

      {/* Playback Control Deck with Tactile Buttons */}
      <div 
        role="toolbar" 
        aria-label="Audio Playback Actions" 
        className="bg-cream-50 rounded-3xl border border-cream-300 shadow-notebook p-4 sm:p-5 space-y-4"
      >
        {/* Main Transport Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={onRestartSentence}
            className="w-12 h-12 rounded-2xl bg-cream-200 hover:bg-cream-300 text-indigo-pen border border-cream-400 flex items-center justify-center transition-all active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-pen"
            title="Repeat current sentence from start (R)"
            aria-label="Repeat current sentence"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onPrevSentence}
            disabled={activeSentenceIndex === 0}
            className="w-12 h-12 rounded-2xl bg-cream-200 hover:bg-cream-300 disabled:opacity-30 text-indigo-pen border border-cream-400 flex items-center justify-center transition-all active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-pen"
            title="Previous sentence (Left Arrow)"
            aria-label="Previous sentence"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Primary Big Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="flex-1 max-w-[220px] h-14 rounded-2xl bg-indigo-pen hover:bg-indigo-deep text-cream-50 font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-pen/20 transition-all active:scale-95 ring-4 ring-cream-300 hover:ring-highlighter focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-pen"
            title="Play / Pause (Spacebar)"
            aria-label={isPlaying ? "Pause audio narration" : "Start reading aloud"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span className="text-sm font-sans tracking-wide">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current ml-0.5" />
                <span className="text-sm font-sans tracking-wide">READ ALOUD</span>
              </>
            )}
          </button>

          <button
            onClick={onNextSentence}
            disabled={activeSentenceIndex >= totalSentences - 1}
            className="w-12 h-12 rounded-2xl bg-cream-200 hover:bg-cream-300 disabled:opacity-30 text-indigo-pen border border-cream-400 flex items-center justify-center transition-all active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-pen"
            title="Next sentence (Right Arrow)"
            aria-label="Next sentence"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Rate Badges (0.25x to 2.0x) */}
        <div className="flex items-center justify-between pt-2 border-t border-cream-200 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-muted font-medium">
            <Volume2 className="w-4 h-4 text-indigo-pen" />
            <span>Reading Speed:</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Reading Speed Presets">
            {SPEED_PRESETS.map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                aria-pressed={playbackSpeed === speed}
                className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-pen ${
                  playbackSpeed === speed
                    ? 'bg-indigo-pen text-cream-50 shadow-sm'
                    : 'bg-cream-200 hover:bg-cream-300 text-indigo-pen border border-cream-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
