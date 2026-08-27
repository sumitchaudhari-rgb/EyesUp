import React from 'react';
import DocumentViewer from './DocumentViewer';
import PlaybackPanel from './PlaybackPanel';

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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 min-h-[calc(100vh-65px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[520px]">
        {/* Left Side: Document Preview & Interactive Text Highlight */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <DocumentViewer
            doc={doc}
            activeSentenceIndex={activeSentenceIndex}
            isPlaying={isPlaying}
            onSelectSentence={onSelectSentence}
          />
        </div>

        {/* Right Side: Arm's-Length Playback Deck */}
        <div className="lg:col-span-5 h-full flex flex-col">
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
