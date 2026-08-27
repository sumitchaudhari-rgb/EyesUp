import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import SplitView from './components/SplitView';
import FloatingControls from './components/FloatingControls';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import ExtractionLoader from './components/ExtractionLoader';
import ErrorAlert from './components/ErrorAlert';
import { sampleDocument } from './data/sampleDocument';
import { extractTextFromPDF } from './utils/pdfExtractor';
import { extractTextFromImage } from './utils/ocrExtractor';

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Extraction & OCR state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ stage: '', percent: 0 });
  const [currentFileProcessing, setCurrentFileProcessing] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load sample document for instant preview
  const handleLoadSample = () => {
    setCurrentDoc(sampleDocument);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
    setErrorMessage(null);
  };

  // Reset / Change document
  const handleResetDoc = () => {
    setCurrentDoc(null);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
    setErrorMessage(null);
  };

  // Real File Upload & OCR Extraction Pipeline (Phase 2)
  const handleFileUpload = async (file) => {
    if (!file) return;

    setCurrentFileProcessing(file);
    setIsExtracting(true);
    setExtractionProgress({ stage: 'Analyzing file format...', percent: 10 });
    setErrorMessage(null);

    try {
      const fileName = file.name || '';
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileName);
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(fileName);

      let resultDoc;

      if (isPdf) {
        resultDoc = await extractTextFromPDF(file, (p) => setExtractionProgress(p));
      } else if (isImg) {
        resultDoc = await extractTextFromImage(file, (p) => setExtractionProgress(p));
      } else {
        throw new Error("Unsupported file format. Please upload a PDF document or a photo (JPG/PNG).");
      }

      if (!resultDoc || !resultDoc.sentences || resultDoc.sentences.length === 0) {
        throw new Error("No readable text could be extracted from this document.");
      }

      setCurrentDoc(resultDoc);
      setActiveSentenceIndex(0);
      setIsPlaying(false);
    } catch (err) {
      console.error("Extraction error in App:", err);
      setErrorMessage(err.message || "Failed to process document.");
    } finally {
      setIsExtracting(false);
      setCurrentFileProcessing(null);
    }
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
        setErrorMessage(null);
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

      {/* Phase 2: On-Brand Extraction & OCR Loading Overlay */}
      {isExtracting && (
        <ExtractionLoader
          progress={extractionProgress}
          fileName={currentFileProcessing?.name}
          fileType={currentFileProcessing?.type}
          onCancel={() => setIsExtracting(false)}
        />
      )}

      {/* Phase 2: Error Notification Modal */}
      {errorMessage && (
        <ErrorAlert
          error={errorMessage}
          onClose={() => setErrorMessage(null)}
          onRetry={() => currentFileProcessing && handleFileUpload(currentFileProcessing)}
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
