import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import SplitView from './components/SplitView';
import FloatingControls from './components/FloatingControls';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import VoiceSettingsModal from './components/VoiceSettingsModal';
import ExtractionLoader from './components/ExtractionLoader';
import ErrorAlert from './components/ErrorAlert';
import { sampleDocument } from './data/sampleDocument';
import { extractTextFromPDF } from './utils/pdfExtractor';
import { extractTextFromImage } from './utils/ocrExtractor';
import { speechEngine } from './utils/speechEngine';

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Extraction & OCR state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ stage: '', percent: 0 });
  const [currentFileProcessing, setCurrentFileProcessing] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Refs for tracking current state inside callbacks
  const docRef = useRef(currentDoc);
  const activeIndexRef = useRef(activeSentenceIndex);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    docRef.current = currentDoc;
  }, [currentDoc]);

  useEffect(() => {
    activeIndexRef.current = activeSentenceIndex;
  }, [activeSentenceIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Load sample document for instant preview
  const handleLoadSample = () => {
    speechEngine.stop();
    setCurrentDoc(sampleDocument);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
    setErrorMessage(null);
  };

  // Reset / Change document
  const handleResetDoc = () => {
    speechEngine.stop();
    setCurrentDoc(null);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
    setErrorMessage(null);
  };

  // Speak a sentence by index
  const speakSentenceAtIndex = useCallback((index) => {
    const doc = docRef.current;
    if (!doc || !doc.sentences || index < 0 || index >= doc.sentences.length) {
      setIsPlaying(false);
      return;
    }
    const text = doc.sentences[index];
    setActiveSentenceIndex(index);
    setIsPlaying(true);
    speechEngine.speak(text, index);
  }, []);

  // Web Speech API lifecycle bindings
  useEffect(() => {
    speechEngine.onSentenceEnd = ({ sentenceIndex }) => {
      const doc = docRef.current;
      if (!doc || !isPlayingRef.current) return;

      const nextIndex = sentenceIndex + 1;
      if (nextIndex < doc.sentences.length) {
        // Auto-advance to next sentence seamlessly
        speakSentenceAtIndex(nextIndex);
      } else {
        // Finished last sentence
        setIsPlaying(false);
      }
    };

    speechEngine.onError = (err) => {
      console.warn("TTS Error notice:", err);
      setIsPlaying(false);
    };

    return () => {
      speechEngine.stop();
    };
  }, [speakSentenceAtIndex]);

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      speechEngine.stop();
      setIsPlaying(false);
    } else {
      speakSentenceAtIndex(activeIndexRef.current);
    }
  }, [speakSentenceAtIndex]);

  // Next / Previous / Restart sentence handlers
  const handleNextSentence = useCallback(() => {
    const doc = docRef.current;
    if (!doc) return;
    const nextIdx = Math.min(activeIndexRef.current + 1, doc.sentences.length - 1);
    if (isPlayingRef.current) {
      speakSentenceAtIndex(nextIdx);
    } else {
      setActiveSentenceIndex(nextIdx);
    }
  }, [speakSentenceAtIndex]);

  const handlePrevSentence = useCallback(() => {
    const doc = docRef.current;
    if (!doc) return;
    const prevIdx = Math.max(activeIndexRef.current - 1, 0);
    if (isPlayingRef.current) {
      speakSentenceAtIndex(prevIdx);
    } else {
      setActiveSentenceIndex(prevIdx);
    }
  }, [speakSentenceAtIndex]);

  const handleRestartSentence = useCallback(() => {
    speakSentenceAtIndex(activeIndexRef.current);
  }, [speakSentenceAtIndex]);

  const handleSelectSentence = useCallback((idx) => {
    speakSentenceAtIndex(idx);
  }, [speakSentenceAtIndex]);

  const handleChangeSpeed = useCallback((speed) => {
    setPlaybackSpeed(speed);
    speechEngine.setRate(speed);
    // If currently speaking, restart current sentence with new rate
    if (isPlayingRef.current) {
      speakSentenceAtIndex(activeIndexRef.current);
    }
  }, [speakSentenceAtIndex]);

  const handleSelectVoice = useCallback((voiceURI) => {
    setSelectedVoiceURI(voiceURI);
    speechEngine.setVoice(voiceURI);
  }, []);

  // Real File Upload & OCR Extraction Pipeline
  const handleFileUpload = async (file) => {
    if (!file) return;

    speechEngine.stop();
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

  // Global Keyboard Shortcuts (Spacebar, Arrows, 'r', '?')
  useEffect(() => {
    const handleKeyDown = (e) => {
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
        setIsVoiceModalOpen(false);
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
        onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
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

      {/* Voice & Audio Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoiceURI={selectedVoiceURI}
        onSelectVoice={handleSelectVoice}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={handleChangeSpeed}
      />

      {/* Phase 2: On-Brand Extraction & OCR Loading Overlay */}
      {isExtracting && (
        <ExtractionLoader
          progress={extractionProgress}
          fileName={currentFileProcessing?.name}
          fileType={currentFileProcessing?.type}
          onCancel={() => setIsExtracting(false)}
        />
      )}

      {/* Error Notification Modal */}
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
