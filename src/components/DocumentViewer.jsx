import React, { useState, useEffect, useRef } from 'react';
import { FileText, ZoomIn, ZoomOut, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DocumentViewer({
  doc,
  activeSentenceIndex,
  isPlaying,
  onSelectSentence,
  onOpenTextEditor
}) {
  const [fontSize, setFontSize] = useState(18); // px
  const activeSentenceRef = useRef(null);
  const containerRef = useRef(null);

  const increaseFont = () => setFontSize((prev) => Math.min(prev + 2, 28));
  const decreaseFont = () => setFontSize((prev) => Math.max(prev - 2, 14));

  // Auto-scroll centering
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
    <section 
      aria-label="Document Reader" 
      className="flex flex-col h-full bg-cream-50 rounded-3xl border border-cream-300 shadow-page overflow-hidden animate-page-reveal"
    >
      {/* Document View Top Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-cream-300 bg-cream-100/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-indigo-pen flex-shrink-0" />
          <span className="font-serif font-semibold text-sm text-indigo-deep truncate">
            {doc.title || 'Document Preview'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-cream-200 text-indigo-muted border border-cream-300 flex-shrink-0">
            {doc.sentences.length} sentences
          </span>
        </div>

        {/* Action buttons: Edit OCR Text & Font Scaling */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Edit OCR Text Button */}
          <button
            onClick={onOpenTextEditor}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-semibold border border-cream-400 transition-colors shadow-sm active:scale-95"
            title="Edit extracted text & correct OCR typos"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-pen" />
            <span className="hidden sm:inline">Edit Text</span>
          </button>

          {/* Font zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={decreaseFont}
              className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-pen"
              title="Decrease font size"
              aria-label="Decrease font size"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-indigo-muted w-8 text-center" aria-live="polite">
              {fontSize}px
            </span>
            <button
              onClick={increaseFont}
              className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-pen"
              title="Increase font size"
              aria-label="Increase font size"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Paper Container */}
      <div 
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label="Extracted document text"
        className="flex-1 overflow-y-auto p-5 sm:p-8 notebook-ruled bg-cream-50 scroll-smooth focus-visible:ring-2 focus-visible:ring-indigo-pen"
      >
        {/* Left red notebook margin indicator */}
        <div className="relative pl-5 sm:pl-8 border-l-2 border-margin-red/40">
          <div className="space-y-3 font-serif leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
            {doc.sentences.map((sentence, idx) => {
              const isActive = idx === activeSentenceIndex;
              return (
                <span
                  key={idx}
                  ref={isActive ? activeSentenceRef : null}
                  onClick={() => onSelectSentence(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSentence(idx);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isActive}
                  className={`inline-block mr-1.5 cursor-pointer rounded px-2 py-1 transition-all duration-150 select-text focus-visible:ring-2 focus-visible:ring-indigo-pen ${
                    isActive
                      ? 'active-sentence-highlight font-semibold text-indigo-deep'
                      : 'hover:bg-cream-200/80 text-indigo-pen/90'
                  }`}
                  title={`Sentence ${idx + 1} (Click to jump & read aloud)`}
                >
                  <span className={`text-[10px] font-mono select-none mr-1 align-top inline-flex items-center gap-0.5 ${
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
          <span aria-live="polite">
            {isPlaying ? 'Speaking active sentence...' : 'Ready for hands-free playback'}
          </span>
        </div>
        <div className="text-[11px] font-mono">
          Page 1 of {doc.totalPages || 1}
        </div>
      </div>
    </section>
  );
}
