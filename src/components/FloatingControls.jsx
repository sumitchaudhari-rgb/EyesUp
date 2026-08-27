import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles } from 'lucide-react';

export default function FloatingControls({
  doc,
  activeSentenceIndex,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onNextSentence,
  onPrevSentence
}) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto transition-all animate-fade-in">
      <div className="bg-indigo-deep/95 backdrop-blur-md text-cream-50 rounded-2xl p-3 shadow-float-bar border border-indigo-wash/40 flex items-center justify-between gap-3">
        {/* Left: active sentence count */}
        <div className="flex items-center gap-2 min-w-0 pl-2">
          <div className="w-2 h-2 rounded-full bg-highlighter animate-pulse flex-shrink-0" />
          <div className="truncate">
            <span className="text-xs font-mono font-medium text-cream-200">
              #{activeSentenceIndex + 1} / {doc.sentences.length}
            </span>
            <p className="text-[11px] text-indigo-light/70 truncate max-w-[140px] sm:max-w-[200px]">
              {doc.sentences[activeSentenceIndex]}
            </p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onPrevSentence}
            disabled={activeSentenceIndex === 0}
            className="p-2 rounded-xl bg-indigo-pen hover:bg-indigo-wash disabled:opacity-40 text-cream-100 transition-colors"
            title="Previous sentence"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-3 rounded-xl bg-highlighter hover:bg-highlighter-hover text-indigo-deep font-bold transition-all active:scale-95 shadow-md shadow-highlighter/20"
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextSentence}
            disabled={activeSentenceIndex >= doc.sentences.length - 1}
            className="p-2 rounded-xl bg-indigo-pen hover:bg-indigo-wash disabled:opacity-40 text-cream-100 transition-colors"
            title="Next sentence"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Rate indicator */}
        <div className="hidden sm:flex items-center gap-1.5 pr-2 flex-shrink-0">
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-pen border border-indigo-wash text-cream-200">
            {playbackSpeed}x
          </span>
        </div>
      </div>
    </div>
  );
}
