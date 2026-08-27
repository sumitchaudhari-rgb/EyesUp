import React, { useState, useEffect, useRef } from 'react';
import { FileText, ZoomIn, ZoomOut, CheckCircle2, Volume2, Sparkles } from 'lucide-react';

export default function DocumentViewer({
  doc,
  activeSentenceIndex,
  isPlaying,
  onSelectSentence
}) {
  const [fontSize, setFontSize] = useState(18); // px
  const activeSentenceRef = useRef(null);
  const containerRef = useRef(null);

  const increaseFont = () => setFontSize((prev) => Math.min(prev + 2, 28));
  const decreaseFont = () => setFontSize((prev) => Math.max(prev - 2, 14));

  // Smoothly auto-scroll the active sentence into center view as speech progresses
  useEffect(() => {
    if (activeSentenceRef.current && containerRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [activeSentenceIndex]);

  return (
    <div className="flex flex-col h-full bg-cream-50 rounded-2xl border border-cream-300 shadow-page overflow-hidden">
      {/* Document View Top Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-cream-300 bg-cream-100/80">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-indigo-pen flex-shrink-0" />
          <span className="font-serif font-semibold text-sm text-indigo-deep truncate">
            {doc.title || 'Document Preview'}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cream-200 text-indigo-muted border border-cream-300 flex-shrink-0">
            {doc.sentences.length} sentences
          </span>
        </div>

        {/* Font scaling controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={decreaseFont}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
            title="Decrease font size"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-indigo-muted w-8 text-center">{fontSize}px</span>
          <button
            onClick={increaseFont}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
            title="Increase font size"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Paper Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 sm:p-8 notebook-ruled bg-cream-50 scroll-smooth"
      >
        {/* Left red notebook margin indicator */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-margin-red/40">
          <div className="space-y-3 font-serif leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
            {doc.sentences.map((sentence, idx) => {
              const isActive = idx === activeSentenceIndex;
              return (
                <span
                  key={idx}
                  ref={isActive ? activeSentenceRef : null}
                  onClick={() => onSelectSentence(idx)}
                  className={`inline-block mr-1.5 cursor-pointer rounded px-2 py-1 transition-all duration-200 select-text ${
                    isActive
                      ? 'active-sentence-highlight font-semibold text-indigo-deep scale-[1.01]'
                      : 'hover:bg-cream-200/80 text-indigo-pen/90'
                  }`}
                  title={`Sentence ${idx + 1} (Click to jump & read aloud)`}
                >
                  <span className={`text-[10px] font-mono select-none mr-1 align-top ${
                    isActive ? 'text-indigo-deep font-bold' : 'text-indigo-muted/50'
                  }`}>
                    {idx + 1}
                  </span>
                  {sentence}{' '}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Document Footer Navigation */}
      <div className="px-5 py-2.5 border-t border-cream-300 bg-cream-100/90 flex items-center justify-between text-xs text-indigo-muted font-sans">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
          <span>{isPlaying ? 'Speaking active sentence...' : 'Ready for hands-free playback'}</span>
        </div>
        <div className="text-[11px] font-mono">
          Page 1 of {doc.totalPages || 1}
        </div>
      </div>
    </div>
  );
}
