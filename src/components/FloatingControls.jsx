import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  Repeat, 
  SlidersHorizontal 
} from 'lucide-react';

export default function FloatingControls({
  doc,
  activeSentenceIndex,
  isPlaying,
  playbackSpeed,
  repeatMode,
  onToggleRepeat,
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onRestartSentence,
  onCycleSpeed,
  onOpenVoiceModal
}) {
  const currentSentence = doc.sentences[activeSentenceIndex] || "";
  const progressPercent = Math.round(((activeSentenceIndex + 1) / doc.sentences.length) * 100) || 0;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-3 sm:px-4 pointer-events-auto transition-all animate-fade-in">
      <div className="bg-indigo-deep/95 backdrop-blur-xl text-cream-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-float-bar border border-indigo-wash/40 space-y-2">
        {/* Top sentence ticker & status */}
        <div className="flex items-center justify-between gap-3 px-2 border-b border-indigo-wash/30 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Audio Waveform animation during speech */}
            <div className="flex items-end gap-0.5 h-3.5 w-4 flex-shrink-0">
              <span className={`w-1 bg-highlighter rounded-full transition-all ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5'}`} />
              <span className={`w-1 bg-highlighter rounded-full transition-all ${isPlaying ? 'h-2 animate-bounce' : 'h-1'}`} />
              <span className={`w-1 bg-highlighter rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-2'}`} />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-mono text-cream-300 font-semibold mr-2">
                Sentence {activeSentenceIndex + 1} / {doc.sentences.length}
              </span>
              <span className="text-xs text-cream-100/90 font-serif italic truncate hidden md:inline">
                “{currentSentence}”
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Repeat Mode Indicator */}
            <button
              onClick={onToggleRepeat}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1 border transition-colors ${
                repeatMode 
                  ? 'bg-highlighter text-indigo-deep border-highlighter font-bold' 
                  : 'bg-indigo-pen text-cream-300 border-indigo-wash/60 hover:text-cream-50'
              }`}
              title="Repeat active sentence indefinitely (useful for slow dictation)"
            >
              <Repeat className="w-3 h-3" />
              <span>{repeatMode ? 'Looping' : 'Loop'}</span>
            </button>

            <span className="text-[11px] font-mono text-cream-300">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Transport Action Bar with Large Touch Targets (Min 48px) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Left: Prev & Restart */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRestartSentence}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-pen hover:bg-indigo-wash active:scale-95 text-cream-100 border border-indigo-wash/50 flex items-center justify-center transition-all"
              title="Repeat current sentence from start (R)"
              aria-label="Restart sentence"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={onPrevSentence}
              disabled={activeSentenceIndex === 0}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-pen hover:bg-indigo-wash disabled:opacity-30 active:scale-95 text-cream-100 border border-indigo-wash/50 flex items-center justify-center transition-all"
              title="Previous sentence (Left Arrow)"
              aria-label="Previous sentence"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Hero Big Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="flex-1 max-w-[200px] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-highlighter hover:bg-highlighter-hover active:scale-95 text-indigo-deep font-bold flex items-center justify-center gap-2 shadow-lg shadow-highlighter/20 border border-highlighter-border transition-all ring-2 ring-highlighter-glow/50"
            title="Play / Pause (Spacebar)"
            aria-label={isPlaying ? "Pause speech" : "Read aloud"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span className="text-xs sm:text-sm font-sans tracking-wide">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current ml-0.5" />
                <span className="text-xs sm:text-sm font-sans tracking-wide">READ ALOUD</span>
              </>
            )}
          </button>

          {/* Right: Next & Speed Cycle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onNextSentence}
              disabled={activeSentenceIndex >= doc.sentences.length - 1}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-pen hover:bg-indigo-wash disabled:opacity-30 active:scale-95 text-cream-100 border border-indigo-wash/50 flex items-center justify-center transition-all"
              title="Next sentence (Right Arrow)"
              aria-label="Next sentence"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Quick Speed Cycle Pill */}
            <button
              onClick={onCycleSpeed}
              className="h-11 sm:h-12 px-3 rounded-xl sm:rounded-2xl bg-indigo-pen hover:bg-indigo-wash text-cream-100 border border-indigo-wash/50 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95"
              title="Click to cycle speed: 0.8x -> 1.0x -> 1.25x -> 1.5x"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
