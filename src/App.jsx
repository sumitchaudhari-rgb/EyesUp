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
import { audioFeedback } from './utils/audioFeedback';

const SPEED_PRESETS = [0.8, 1.0, 1.25, 1.5, 1.75];

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Extraction & OCR state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ stage: '', percent: 0 });
  const [currentFileProcessing, setCurrentFileProcessing] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Refs for tracking current state inside async callbacks
  const docRef = useRef(currentDoc);
  const activeIndexRef = useRef(activeSentenceIndex);
  const isPlayingRef = useRef(isPlaying);
  const repeatModeRef = useRef(repeatMode);
  const playbackSpeedRef = useRef(playbackSpeed);

  useEffect(() => { docRef.current = currentDoc; }, [currentDoc]);
  useEffect(() => { activeIndexRef.current = activeSentenceIndex; }, [activeSentenceIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);

  // Load sample document for instant preview
  const handleLoadSample = () => {
    speechEngine.stop();
    setCurrentDoc(sampleDocument);
    setActiveSentenceIndex(0);
    setIsPlaying(false);
    setErrorMessage(null);
    audioFeedback.playResume();
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

      if (repeatModeRef.current) {
        // Repeat mode active: replay current sentence
        speakSentenceAtIndex(sentenceIndex);
        return;
      }

      const nextIndex = sentenceIndex + 1;
      if (nextIndex < doc.sentences.length) {
        // Auto-advance to next sentence
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
      audioFeedback.playPause();
    } else {
      audioFeedback.playResume();
      speakSentenceAtIndex(activeIndexRef.current);
    }
  }, [speakSentenceAtIndex]);

  // Next sentence
  const handleNextSentence = useCallback(() => {
    const doc = docRef.current;
    if (!doc) return;
    const nextIdx = Math.min(activeIndexRef.current + 1, doc.sentences.length - 1);
    audioFeedback.playSkipForward();
    if (isPlayingRef.current) {
      speakSentenceAtIndex(nextIdx);
    } else {
      setActiveSentenceIndex(nextIdx);
    }
  }, [speakSentenceAtIndex]);

  // Previous sentence
  const handlePrevSentence = useCallback(() => {
    const doc = docRef.current;
    if (!doc) return;
    const prevIdx = Math.max(activeIndexRef.current - 1, 0);
    audioFeedback.playSkipBack();
    if (isPlayingRef.current) {
      speakSentenceAtIndex(prevIdx);
    } else {
      setActiveSentenceIndex(prevIdx);
    }
  }, [speakSentenceAtIndex]);

  // Restart current sentence
  const handleRestartSentence = useCallback(() => {
    audioFeedback.playSkipBack();
    speakSentenceAtIndex(activeIndexRef.current);
  }, [speakSentenceAtIndex]);

  // Direct sentence jump from click or slider
  const handleSelectSentence = useCallback((idx) => {
    audioFeedback.playSkipForward();
    speakSentenceAtIndex(idx);
  }, [speakSentenceAtIndex]);

  // Toggle loop / repeat mode
  const handleToggleRepeat = useCallback(() => {
    setRepeatMode((prev) => !prev);
    audioFeedback.playResume();
  }, []);

  // Speed adjustments
  const handleChangeSpeed = useCallback((speed) => {
    const validSpeed = Number(speed);
    setPlaybackSpeed(validSpeed);
    speechEngine.setRate(validSpeed);
    if (isPlayingRef.current) {
      speakSentenceAtIndex(activeIndexRef.current);
    }
  }, [speakSentenceAtIndex]);

  const handleCycleSpeed = useCallback(() => {
    const currentIndex = SPEED_PRESETS.indexOf(playbackSpeedRef.current);
    const nextIndex = (currentIndex + 1) % SPEED_PRESETS.length;
    const newSpeed = SPEED_PRESETS[nextIndex];
    handleChangeSpeed(newSpeed);
  }, [handleChangeSpeed]);

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
      audioFeedback.playResume();
    } catch (err) {
      console.error("Extraction error in App:", err);
      setErrorMessage(err.message || "Failed to process document.");
    } finally {
      setIsExtracting(false);
      setCurrentFileProcessing(null);
    }
  };

  // Global Keyboard Shortcuts (Space, Arrows, J/K/L, R, T, [, ], M, ?)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight' || key === 'l') {
        e.preventDefault();
        handleNextSentence();
      } else if (e.code === 'ArrowLeft' || key === 'j') {
        e.preventDefault();
        handlePrevSentence();
      } else if (key === 'r' || key === 'k') {
        e.preventDefault();
        handleRestartSentence();
      } else if (key === 't') {
        e.preventDefault();
        handleToggleRepeat();
      } else if (key === '[') {
        e.preventDefault();
        const cur = playbackSpeedRef.current;
        handleChangeSpeed(Math.max(0.6, Number((cur - 0.1).toFixed(2))));
      } else if (key === ']') {
        e.preventDefault();
        const cur = playbackSpeedRef.current;
        handleChangeSpeed(Math.min(2.0, Number((cur + 0.1).toFixed(2))));
      } else if (key === 'm') {
        e.preventDefault();
        audioFeedback.enabled = !audioFeedback.enabled;
      } else if (key === '?' || (e.metaKey && key === 'k') || (e.ctrlKey && key === 'k')) {
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
  }, [
    handleTogglePlay, 
    handleNextSentence, 
    handlePrevSentence, 
    handleRestartSentence,
    handleToggleRepeat,
    handleChangeSpeed
  ]);

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
            repeatMode={repeatMode}
            onToggleRepeat={handleToggleRepeat}
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
          repeatMode={repeatMode}
          onToggleRepeat={handleToggleRepeat}
          onTogglePlay={handleTogglePlay}
          onNextSentence={handleNextSentence}
          onPrevSentence={handlePrevSentence}
          onRestartSentence={handleRestartSentence}
          onCycleSpeed={handleCycleSpeed}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
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

      {/* On-Brand Extraction & OCR Loading Overlay */}
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
