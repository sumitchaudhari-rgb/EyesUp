import React from 'react';
import DocumentViewer from './DocumentViewer';
import PlaybackPanel from './PlaybackPanel';

export default function SplitView({
  doc,
  activeSentenceIndex,
  isPlaying,
  playbackSpeed,
  onSelectSentence,
  onUpdateSentence,
  onTogglePlay,
  onNextSentence,
  onPrevSentence,
  onRestartSentence,
  onChangeSpeed
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 h-[calc(100vh-65px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[500px]">
        {/* Left Side: Document Preview & Interactive Text Highlight (7 cols on desktop) */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <DocumentViewer
            doc={doc}
            activeSentenceIndex={activeSentenceIndex}
            onSelectSentence={onSelectSentence}
            onUpdateSentence={onUpdateSentence}
          />
        </div>

        {/* Right Side: Arm's-Length Playback Deck (5 cols on desktop) */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <PlaybackPanel
            doc={doc}
            activeSentenceIndex={activeSentenceIndex}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
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
