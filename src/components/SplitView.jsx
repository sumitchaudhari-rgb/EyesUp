import React from 'react';
import DocumentViewer from './DocumentViewer';

export default function SplitView({
  doc,
  activeSentenceIndex,
  isPlaying,
  onSelectSentence,
  onOpenTextEditor
}) {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-36 min-h-[calc(100vh-65px)] flex flex-col">
      {/* Full-width Notebook Document Reader */}
      <div className="w-full flex-1 flex flex-col min-h-[560px]">
        <DocumentViewer
          doc={doc}
          activeSentenceIndex={activeSentenceIndex}
          isPlaying={isPlaying}
          onSelectSentence={onSelectSentence}
          onOpenTextEditor={onOpenTextEditor}
        />
      </div>
    </div>
  );
}
