import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  Sliders, 
  Sparkles,
  Bookmark
} from 'lucide-react';

export default function PlaybackPanel({
  doc,
  activeSentenceIndex,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onRestartSentence,
  onChangeSpeed,
  onSelectSentence
}) {
  const currentSentence = doc.sentences[activeSentenceIndex] || "No sentence loaded";
  const progressPercent = Math.round(((activeSentenceIndex + 1) / doc.sentences.length) * 100) || 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Primary Focus Card (Arm's-Length Legibility) */}
      <div className="flex-1 bg-cream-50 rounded-2xl border-2 border-indigo-pen/10 shadow-page p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute top-4 right-4 text-cream-300 pointer-events-none select-none font-serif text-8xl font-bold opacity-30">
          {activeSentenceIndex + 1}
        </div>

        {/* Top meta row */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-highlighter text-indigo-deep text-xs font-bold font-mono tracking-tight shadow-sm">
              NOW READING
            </span>
            <span className="text-xs font-mono font-medium text-indigo-muted">
              Sentence {activeSentenceIndex + 1} of {doc.sentences.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-indigo-pen bg-cream-200 px-2 py-0.5 rounded border border-cream-300">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Big high-contrast sentence display */}
        <div className="my-auto py-6 z-10">
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-indigo-deep leading-snug tracking-tight">
            “{currentSentence}”
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-sans text-indigo-muted italic">
              Focus is locked. Audio will speak this sentence until completed.
            </span>
          </div>
        </div>

        {/* Progress Bar with Sentence Nodes */}
        <div className="space-y-2 z-10 pt-4 border-t border-cream-300">
          <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-pen h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Playback Control Deck */}
      <div className="bg-cream-50 rounded-2xl border border-cream-300 shadow-notebook p-5 space-y-4">
        {/* Main Transport Buttons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onRestartSentence}
            className="p-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen border border-cream-400 transition-all active:scale-95"
            title="Repeat current sentence (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onPrevSentence}
            disabled={activeSentenceIndex === 0}
            className="p-3 rounded-xl bg-cream-200 hover:bg-cream-300 disabled:opacity-40 disabled:hover:bg-cream-200 text-indigo-pen border border-cream-400 transition-all active:scale-95"
            title="Previous sentence (Left Arrow)"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Primary Big Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-pen hover:bg-indigo-deep text-cream-50 font-bold shadow-lg shadow-indigo-pen/20 transition-all active:scale-95 ring-4 ring-cream-300 hover:ring-highlighter"
            title="Play / Pause (Spacebar)"
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
            disabled={activeSentenceIndex >= doc.sentences.length - 1}
            className="p-3 rounded-xl bg-cream-200 hover:bg-cream-300 disabled:opacity-40 disabled:hover:bg-cream-200 text-indigo-pen border border-cream-400 transition-all active:scale-95"
            title="Next sentence (Right Arrow)"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Rate Pill Selector */}
        <div className="flex items-center justify-between pt-2 border-t border-cream-200 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-muted font-medium">
            <Volume2 className="w-4 h-4 text-indigo-pen" />
            <span>Reading Speed:</span>
          </div>

          <div className="flex items-center gap-1">
            {[0.8, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-all ${
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
    </div>
  );
}
