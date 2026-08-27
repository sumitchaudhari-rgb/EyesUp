import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import SplitView from './components/SplitView';
import FloatingControls from './components/FloatingControls';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { sampleDocument } from './data/sampleDocument';

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Load sample document on initial visit or demo button
  const handleLoadSample = () => {
    setCurrentDoc(sampleDocument);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
  };

  // Reset / Change document
  const handleResetDoc = () => {
    setCurrentDoc(null);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
  };

  // Upload handler scaffold for Phase 1
  const handleFileUpload = (file) => {
    if (!file) return;
    
    // For Phase 1 scaffold, parse file name and provide a simulated document shell
    // In Phase 2, PDF.js & Tesseract.js will do real OCR extraction
    const simulatedDoc = {
      title: file.name,
      totalPages: 1,
      currentPage: 1,
      sentences: [
        `Loaded "${file.name}" into the EyesUp reading queue.`,
        "In Phase 1, the design system, split-view layout, and tactile controls are fully established.",
        "Phase 2 will plug in the PDF.js and Tesseract.js OCR extraction pipeline directly into this shell.",
        "You can test sentence navigation, keyboard shortcuts, and arm's-length visibility right now."
      ],
      rawText: `Loaded "${file.name}". Document shell is ready for Phase 2 OCR pipeline.`
    };

    setCurrentDoc(simulatedDoc);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
  };

  // Sentence Navigation Handlers
  const handleNextSentence = useCallback(() => {
    if (!currentDoc) return;
    setActiveSentenceIndex((prev) => 
      Math.min(prev + 1, currentDoc.sentences.length - 1)
    );
  }, [currentDoc]);

  const handlePrevSentence = useCallback(() => {
    if (!currentDoc) return;
    setActiveSentenceIndex((prev) => Math.max(prev - 1, 0));
  }, [currentDoc]);

  const handleRestartSentence = useCallback(() => {
    // Restarts playback of current sentence
    setIsPlaying(true);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSelectSentence = (idx) => {
    setActiveSentenceIndex(idx);
  };

  const handleChangeSpeed = (speed) => {
    setPlaybackSpeed(speed);
  };

  // Global Keyboard Shortcuts (Spacebar, Arrows, 'r', '?')
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextSentence();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSentence();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRestartSentence();
      } else if (e.key === '?' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleNextSentence, handlePrevSentence, handleRestartSentence]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-indigo-pen font-sans antialiased selection:bg-highlighter-glow selection:text-indigo-deep">
      {/* Top Bar Header */}
      <Header
        hasDoc={!!currentDoc}
        docTitle={currentDoc?.title}
        onResetDoc={handleResetDoc}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onLoadSample={handleLoadSample}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentDoc ? (
          <SplitView
            doc={currentDoc}
            activeSentenceIndex={activeSentenceIndex}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onSelectSentence={handleSelectSentence}
            onTogglePlay={handleTogglePlay}
            onNextSentence={handleNextSentence}
            onPrevSentence={handlePrevSentence}
            onRestartSentence={handleRestartSentence}
            onChangeSpeed={handleChangeSpeed}
          />
        ) : (
          <EmptyState
            onFileUpload={handleFileUpload}
            onLoadSample={handleLoadSample}
          />
        )}
      </main>

      {/* Persistent Floating Mini-Bar when Document is active */}
      {currentDoc && (
        <FloatingControls
          doc={currentDoc}
          activeSentenceIndex={activeSentenceIndex}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onTogglePlay={handleTogglePlay}
          onNextSentence={handleNextSentence}
          onPrevSentence={handlePrevSentence}
        />
      )}

      {/* Hands-Free Shortcut Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
