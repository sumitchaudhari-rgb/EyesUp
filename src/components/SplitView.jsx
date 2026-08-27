import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';
import PlaybackPanel from './PlaybackPanel';
import { Columns, Eye, BookOpen } from 'lucide-react';

export default function SplitView({
  doc,
  activeSentenceIndex,
  isPlaying,
  playbackSpeed,
  repeatMode,
  onToggleRepeat,
  onSelectSentence,
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onRestartSentence,
  onChangeSpeed
}) {
  // Mobile / Portrait Tablet view tab: 'split' | 'reader' | 'focus'
  const [mobileTab, setMobileTab] = useState('split');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-32 min-h-[calc(100vh-65px)] flex flex-col">
      {/* Mobile / Narrow Tablet View Switcher (<1024px) */}
      <div className="lg:hidden flex items-center justify-center mb-4">
        <div className="bg-cream-200/90 p-1 rounded-2xl border border-cream-300 flex items-center gap-1 shadow-sm">
          <button
            onClick={() => setMobileTab('split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mobileTab === 'split'
                ? 'bg-indigo-pen text-cream-50 shadow-sm'
                : 'text-indigo-pen hover:bg-cream-300/60'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setMobileTab('reader')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mobileTab === 'reader'
                ? 'bg-indigo-pen text-cream-50 shadow-sm'
                : 'text-indigo-pen hover:bg-cream-300/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Full Document</span>
          </button>

          <button
            onClick={() => setMobileTab('focus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mobileTab === 'focus'
                ? 'bg-indigo-pen text-cream-50 shadow-sm'
                : 'text-indigo-pen hover:bg-cream-300/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Focus Card</span>
          </button>
        </div>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-[520px]">
        {/* Left Side: Document Preview */}
        <div className={`h-full flex flex-col ${
          mobileTab === 'split' 
            ? 'lg:col-span-7 flex' 
            : mobileTab === 'reader' 
              ? 'col-span-12 flex' 
              : 'hidden lg:flex lg:col-span-7'
        }`}>
          <DocumentViewer
            doc={doc}
            activeSentenceIndex={activeSentenceIndex}
            isPlaying={isPlaying}
            onSelectSentence={onSelectSentence}
          />
        </div>

        {/* Right Side: Arm's-Length Playback Deck */}
        <div className={`h-full flex flex-col ${
          mobileTab === 'split' 
            ? 'lg:col-span-5 flex' 
            : mobileTab === 'focus' 
              ? 'col-span-12 flex' 
              : 'hidden lg:flex lg:col-span-5'
        }`}>
          <PlaybackPanel
            doc={doc}
            activeSentenceIndex={activeSentenceIndex}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            repeatMode={repeatMode}
            onToggleRepeat={onToggleRepeat}
            onTogglePlay={onTogglePlay}
            onNextSentence={onNextSentence}
            onPrevSentence={onPrevSentence}
            onRestartSentence={onRestartSentence}
            onChangeSpeed={onChangeSpeed}
            onSelectSentence={onSelectSentence}
          />
        </div>
      </div>
    </div>
  );
}
