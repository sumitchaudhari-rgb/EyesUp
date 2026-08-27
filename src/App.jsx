import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import SplitView from './components/SplitView';
import FloatingControls from './components/FloatingControls';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import VoiceSettingsModal from './components/VoiceSettingsModal';
import InlineTextEditorModal from './components/InlineTextEditorModal';
import PhotoOrientationModal from './components/PhotoOrientationModal';
import ExtractionLoader from './components/ExtractionLoader';
import ErrorAlert from './components/ErrorAlert';
import { sampleDocument } from './data/sampleDocument';
import { splitIntoSentences } from './utils/textCleaner';
import { extractTextFromPDF } from './utils/pdfExtractor';
import { extractTextFromImage } from './utils/ocrExtractor';
import { speechEngine } from './utils/speechEngine';
import { voiceCommandListener } from './utils/voiceCommandListener';
import { audioFeedback } from './utils/audioFeedback';
import { Mic } from 'lucide-react';

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [wordPauseMs, setWordPauseMs] = useState(400); // 400ms pause between words
  const [speakPunctuation, setSpeakPunctuation] = useState(true); // Speak punctuation
  const [repeatMode, setRepeatMode] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  
  // Voice Command Microphone State
  const [isVoiceControlActive, setIsVoiceControlActive] = useState(false);
  const [voiceToast, setVoiceToast] = useState(null);

  // Modals
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isOrientationModalOpen, setIsOrientationModalOpen] = useState(false);
  const [pendingImageForRotation, setPendingImageForRotation] = useState(null);

  // Extraction & OCR state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ stage: '', percent: 0 });
  const [currentFileProcessing, setCurrentFileProcessing] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Refs
  const docRef = useRef(currentDoc);
  const activeIndexRef = useRef(activeSentenceIndex);
  const isPlayingRef = useRef(isPlaying);
  const repeatModeRef = useRef(repeatMode);
  const playbackSpeedRef = useRef(playbackSpeed);
  const wordPauseMsRef = useRef(wordPauseMs);
  const speakPunctuationRef = useRef(speakPunctuation);

  useEffect(() => { docRef.current = currentDoc; }, [currentDoc]);
  useEffect(() => { activeIndexRef.current = activeSentenceIndex; }, [activeSentenceIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);
  useEffect(() => { 
    wordPauseMsRef.current = wordPauseMs;
    speechEngine.setWordPauseMs(wordPauseMs);
  }, [wordPauseMs]);
  useEffect(() => {
    speakPunctuationRef.current = speakPunctuation;
    speechEngine.setSpeakPunctuation(speakPunctuation);
  }, [speakPunctuation]);

  useEffect(() => {
    const initialVoice = speechEngine.selectedVoiceURI || speechEngine.getVoices()[0]?.voiceURI;
    if (initialVoice) setSelectedVoiceURI(initialVoice);
  }, []);

  // Load sample document
  const handleLoadSample = () => {
    speechEngine.stop();
    setCurrentDoc(sampleDocument);
    setActiveSentenceIndex(0);
    setActiveWordIndex(0);
    setIsPlaying(false);
    setErrorMessage(null);
    audioFeedback.playResume();
  };

  // Reset / Change document
  const handleResetDoc = () => {
    speechEngine.stop();
    setCurrentDoc(null);
    setActiveSentenceIndex(0);
    setActiveWordIndex(0);
    setIsPlaying(false);
    setErrorMessage(null);
  };

  // Speak sentence
  const speakSentenceAtIndex = useCallback((index) => {
    const doc = docRef.current;
    if (!doc || !doc.sentences || index < 0 || index >= doc.sentences.length) {
      setIsPlaying(false);
      return;
    }
    const text = doc.sentences[index];

    setActiveSentenceIndex(index);
    setActiveWordIndex(0);
    setIsPlaying(true);
    speechEngine.speak(text, index);
  }, []);

  // Web Speech API lifecycle bindings
  useEffect(() => {
    speechEngine.onSentenceStart = () => {
      setActiveWordIndex(0);
    };

    speechEngine.onWordStart = ({ wordIndex }) => {
      if (typeof wordIndex === 'number') {
        setActiveWordIndex(wordIndex);
      }
    };

    speechEngine.onSentenceEnd = ({ sentenceIndex }) => {
      const doc = docRef.current;
      if (!doc || !isPlayingRef.current) return;

      if (repeatModeRef.current) {
        speakSentenceAtIndex(sentenceIndex);
        return;
      }

      const nextIndex = sentenceIndex + 1;
      if (nextIndex < doc.sentences.length) {
        speakSentenceAtIndex(nextIndex);
      } else {
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
      setActiveWordIndex(0);
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
      setActiveWordIndex(0);
    }
  }, [speakSentenceAtIndex]);

  // Restart current sentence / line (1 single replay, then continues forward)
  const handleRestartSentence = useCallback(() => {
    setRepeatMode(false);
    audioFeedback.playSkipBack();
    speakSentenceAtIndex(activeIndexRef.current);
  }, [speakSentenceAtIndex]);

  // Repeat previous word (1 single replay, then continues forward)
  const handleRepeatPreviousWord = useCallback(() => {
    setRepeatMode(false);
    audioFeedback.playSkipBack();
    speechEngine.repeatPreviousWord();
  }, []);

  // Direct sentence jump
  const handleSelectSentence = useCallback((idx) => {
    audioFeedback.playSkipForward();
    speakSentenceAtIndex(idx);
  }, [speakSentenceAtIndex]);

  // Speed adjustments (seamlessly updates pace from current word onward)
  const handleChangeSpeed = useCallback((speed) => {
    const validSpeed = Math.max(0.25, Math.min(2.0, Number(Number(speed).toFixed(2))));
    setPlaybackSpeed(validSpeed);
    speechEngine.setRate(validSpeed);
  }, []);

  const handleCycleSpeed = useCallback(() => {
    const currentIndex = SPEED_PRESETS.indexOf(playbackSpeedRef.current);
    const nextIndex = (currentIndex + 1) % SPEED_PRESETS.length;
    const newSpeed = SPEED_PRESETS[nextIndex];
    handleChangeSpeed(newSpeed);
  }, [handleChangeSpeed]);

  // Word Pause adjustment (seamlessly updates pause duration between subsequent words)
  const handleChangeWordPause = useCallback((ms) => {
    const validMs = Math.max(0, Math.min(3000, Number(ms) || 0));
    setWordPauseMs(validMs);
    speechEngine.setWordPauseMs(validMs);
  }, []);

  // Toggles
  const handleToggleRepeat = useCallback(() => {
    setRepeatMode((prev) => !prev);
    audioFeedback.playResume();
  }, []);

  const handleToggleSpeakPunctuation = useCallback(() => {
    setSpeakPunctuation((prev) => !prev);
    audioFeedback.playResume();
  }, []);

  const handleSelectVoice = useCallback((voiceURI) => {
    setSelectedVoiceURI(voiceURI);
    speechEngine.setVoice(voiceURI);
  }, []);

  // Voice Command Listener Handlers & Status
  const handleToggleVoiceControl = useCallback(() => {
    if (isVoiceControlActive) {
      voiceCommandListener.stop();
      setIsVoiceControlActive(false);
      audioFeedback.playPause();
    } else {
      voiceCommandListener.start();
      setIsVoiceControlActive(true);
      audioFeedback.playResume();
    }
  }, [isVoiceControlActive]);

  useEffect(() => {
    voiceCommandListener.onStatusChange = ({ isListening }) => {
      setIsVoiceControlActive(isListening);
    };

    voiceCommandListener.onCommand = ({ type, phrase }) => {
      setVoiceToast(`Heard: "${phrase}"`);
      setTimeout(() => setVoiceToast(null), 2500);

      switch (type) {
        case 'pause':
          if (isPlayingRef.current) {
            handleTogglePlay();
          }
          break;
        case 'play':
          if (!isPlayingRef.current) {
            handleTogglePlay();
          }
          break;
        case 'repeat_word':
          handleRepeatPreviousWord();
          break;
        case 'repeat_line':
          handleRestartSentence();
          break;
        case 'next_sentence':
          handleNextSentence();
          break;
        case 'prev_sentence':
          handlePrevSentence();
          break;
        case 'slower':
          handleChangeSpeed(Math.max(0.25, Number((playbackSpeedRef.current - 0.2).toFixed(2))));
          break;
        case 'faster':
          handleChangeSpeed(Math.min(2.0, Number((playbackSpeedRef.current + 0.2).toFixed(2))));
          break;
        default:
          break;
      }
    };
  }, [
    handleTogglePlay,
    handleRepeatPreviousWord,
    handleRestartSentence,
    handleNextSentence,
    handlePrevSentence,
    handleChangeSpeed
  ]);

  // Process Document File
  const processDocument = async (file) => {
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
      setActiveWordIndex(0);
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

  // Upload handler with Photo Orientation Intercept
  const handleFileUpload = (file) => {
    if (!file) return;
    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name || '');

    if (isImg) {
      setPendingImageForRotation(file);
      setIsOrientationModalOpen(true);
    } else {
      processDocument(file);
    }
  };

  // Apply Manual Text Corrections & Re-sync Audio
  const handleSaveEditedText = ({ rawText }) => {
    if (!currentDoc) return;
    speechEngine.stop();
    const sentences = splitIntoSentences(rawText);
    
    setCurrentDoc((prev) => ({
      ...prev,
      rawText,
      sentences: sentences.length > 0 ? sentences : [rawText]
    }));
    setActiveSentenceIndex(0);
    setActiveWordIndex(0);
    setIsPlaying(false);
    audioFeedback.playResume();
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (key === 'v') {
        e.preventDefault();
        handleToggleVoiceControl();
      } else if (e.code === 'ArrowRight' || key === 'l') {
        e.preventDefault();
        handleNextSentence();
      } else if (e.code === 'ArrowLeft' || key === 'j') {
        e.preventDefault();
        handlePrevSentence();
      } else if (key === 'w') {
        e.preventDefault();
        handleRepeatPreviousWord();
      } else if (key === 'r' || key === 'k') {
        e.preventDefault();
        handleRestartSentence();
      } else if (key === 't') {
        e.preventDefault();
        handleToggleRepeat();
      } else if (key === 'u') {
        e.preventDefault();
        handleToggleSpeakPunctuation();
      } else if (key === 'p') {
        e.preventDefault();
        setWordPauseMs((prev) => (prev > 0 ? 0 : 400));
      } else if (key === 'e' && currentDoc) {
        e.preventDefault();
        setIsTextEditorOpen((prev) => !prev);
      } else if (key === '[') {
        e.preventDefault();
        const cur = playbackSpeedRef.current;
        handleChangeSpeed(Math.max(0.25, Number((cur - 0.1).toFixed(2))));
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
        setIsTextEditorOpen(false);
        setIsOrientationModalOpen(false);
        setErrorMessage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentDoc,
    handleTogglePlay, 
    handleToggleVoiceControl,
    handleNextSentence, 
    handlePrevSentence, 
    handleRestartSentence,
    handleRepeatPreviousWord,
    handleToggleRepeat,
    handleToggleSpeakPunctuation,
    handleChangeSpeed
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-indigo-pen font-sans antialiased selection:bg-highlighter-glow selection:text-indigo-deep">
      {/* Top Bar Header */}
      <Header
        hasDoc={!!currentDoc}
        docTitle={currentDoc?.title}
        isVoiceControlActive={isVoiceControlActive}
        onToggleVoiceControl={handleToggleVoiceControl}
        onResetDoc={handleResetDoc}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
        onLoadSample={handleLoadSample}
      />

      {/* Voice Command Recognition Toast Banner */}
      {voiceToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-indigo-deep text-cream-50 font-mono text-xs font-bold shadow-xl border border-emerald-400/50 flex items-center gap-2 animate-bounce">
          <Mic className="w-3.5 h-3.5 text-emerald-400" />
          <span>{voiceToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentDoc ? (
          <SplitView
            doc={currentDoc}
            activeSentenceIndex={activeSentenceIndex}
            isPlaying={isPlaying}
            onSelectSentence={handleSelectSentence}
            onOpenTextEditor={() => setIsTextEditorOpen(true)}
          />
        ) : (
          <EmptyState
            onFileUpload={handleFileUpload}
            onLoadSample={handleLoadSample}
          />
        )}
      </main>

      {/* Persistent Floating Mini-Bar */}
      {currentDoc && (
        <FloatingControls
          doc={currentDoc}
          activeSentenceIndex={activeSentenceIndex}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          repeatMode={repeatMode}
          wordPauseMs={wordPauseMs}
          speakPunctuation={speakPunctuation}
          onToggleSpeakPunctuation={handleToggleSpeakPunctuation}
          isVoiceControlActive={isVoiceControlActive}
          onToggleVoiceControl={handleToggleVoiceControl}
          onToggleRepeat={handleToggleRepeat}
          onTogglePlay={handleTogglePlay}
          onNextSentence={handleNextSentence}
          onPrevSentence={handlePrevSentence}
          onRestartSentence={handleRestartSentence}
          onCycleSpeed={handleCycleSpeed}
          onChangeWordPause={handleChangeWordPause}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />
      )}

      {/* Voice & Dictation Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoiceURI={selectedVoiceURI}
        onSelectVoice={handleSelectVoice}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={handleChangeSpeed}
        wordPauseMs={wordPauseMs}
        onChangeWordPause={handleChangeWordPause}
        speakPunctuation={speakPunctuation}
        onToggleSpeakPunctuation={handleToggleSpeakPunctuation}
      />

      {/* Inline Manual Text & OCR Correction Modal */}
      <InlineTextEditorModal
        isOpen={isTextEditorOpen}
        onClose={() => setIsTextEditorOpen(false)}
        initialText={currentDoc?.rawText || ''}
        docTitle={currentDoc?.title}
        onSave={handleSaveEditedText}
      />

      {/* Photo Orientation Pre-Processing Modal */}
      <PhotoOrientationModal
        isOpen={isOrientationModalOpen}
        onClose={() => {
          setIsOrientationModalOpen(false);
          setPendingImageForRotation(null);
        }}
        imageFile={pendingImageForRotation}
        onProcessRotatedImage={(file) => {
          setIsOrientationModalOpen(false);
          setPendingImageForRotation(null);
          processDocument(file);
        }}
      />

      {/* Extraction & OCR Loading Overlay */}
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
          onRetry={() => currentFileProcessing && processDocument(currentFileProcessing)}
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
