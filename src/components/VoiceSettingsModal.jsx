import React, { useState, useEffect } from 'react';
import { X, Volume2, Mic, Play, Check, Clock, PenTool, MessageSquare, Sparkles, User, UserCheck } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const PAUSE_PRESETS = [
  { label: '0s (Fluid)', ms: 0 },
  { label: '0.3s (Quick)', ms: 300 },
  { label: '0.5s (Writing)', ms: 500 },
  { label: '0.8s (Steady)', ms: 800 },
  { label: '1.2s (Dictation)', ms: 1200 },
  { label: '1.5s (Slow)', ms: 1500 }
];

export default function VoiceSettingsModal({
  isOpen,
  onClose,
  selectedVoiceURI,
  onSelectVoice,
  playbackSpeed,
  onChangeSpeed,
  wordPauseMs,
  onChangeWordPause,
  speakPunctuation,
  onToggleSpeakPunctuation
}) {
  const [voices, setVoices] = useState([]);
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'Male' | 'Female'
  const [testingVoiceURI, setTestingVoiceURI] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const vList = speechEngine.getVoices();
      setVoices(vList);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSelectedURI = selectedVoiceURI || speechEngine.selectedVoiceURI || (voices[0]?.voiceURI ?? '');

  const filteredVoices = voices.filter(v => {
    if (genderFilter === 'all') return true;
    return v.gender === genderFilter;
  });

  const handleTestVoice = (e, voice) => {
    e.stopPropagation();
    setTestingVoiceURI(voice.voiceURI);
    
    speechEngine.setVoice(voice.voiceURI);
    onSelectVoice(voice.voiceURI);
    speechEngine.setRate(playbackSpeed);
    speechEngine.setWordPauseMs(0);
    speechEngine.setSpeakPunctuation(speakPunctuation);

    const testText = voice.gender === 'Male'
      ? (voice.lang?.startsWith('hi') ? 'नमस्कार, यह पुरुष स्वर है। लिखिए: तंत्रिका तंत्र।' : 'Hello, this is the male voice. Write this: Action potentials fire across synapses.')
      : (voice.lang?.startsWith('hi') ? 'नमस्कार, यह महिला स्वर है। लिखिए: तंत्रिका तंत्र।' : 'Hello, this is the female voice. Write this: Action potentials fire across synapses.');

    speechEngine.speak(testText, -1);

    setTimeout(() => {
      setTestingVoiceURI(null);
    }, 3500);
  };

  const handleSelect = (voiceURI) => {
    speechEngine.setVoice(voiceURI);
    onSelectVoice(voiceURI);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-cream-300 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-300 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-indigo-deep">Voice & Dictation</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Neural Voices
                </span>
              </div>
              <p className="text-xs text-indigo-muted">Switch between Indian Male & Female dictation voices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Punctuation Dictation Toggle */}
          <div
            onClick={onToggleSpeakPunctuation}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              speakPunctuation
                ? 'bg-highlighter-active border-indigo-pen/40 ring-1 ring-highlighter shadow-sm'
                : 'bg-cream-100 border-cream-300 hover:bg-cream-200/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-deep flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-pen" />
                Read Punctuation Aloud
              </span>
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                  speakPunctuation ? 'bg-indigo-pen text-cream-50' : 'border border-cream-400'
                }`}
              >
                {speakPunctuation && <Check className="w-3.5 h-3.5" />}
              </span>
            </div>
            <p className="text-[11px] text-indigo-muted mt-1">
              Speaks punctuation marks aloud ("comma", "full stop", "question mark") to match dictation.
            </p>
          </div>

          {/* Word-by-Word Pause Slider */}
          <div className="p-4 rounded-2xl bg-cream-100/80 border border-cream-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-indigo-pen" />
                <span className="text-xs font-bold text-indigo-deep">Pause After Each Word</span>
              </div>
              <span className="font-mono text-xs font-bold bg-highlighter text-indigo-deep px-2.5 py-0.5 rounded-lg border border-highlighter-border shadow-sm">
                {wordPauseMs === 0 ? '0s (Fluid)' : `${(wordPauseMs / 1000).toFixed(1)}s`}
              </span>
            </div>
            <p className="text-[11px] text-indigo-muted">
              Gives students comfortable handwriting time after every spoken word.
            </p>

            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={wordPauseMs}
              onChange={(e) => onChangeWordPause(Number(e.target.value))}
              className="w-full accent-indigo-pen cursor-pointer h-2 bg-cream-200 rounded-lg"
            />

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {PAUSE_PRESETS.map((preset) => (
                <button
                  key={preset.ms}
                  type="button"
                  onClick={() => onChangeWordPause(preset.ms)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                    wordPauseMs === preset.ms
                      ? 'bg-indigo-pen text-cream-50 shadow-sm'
                      : 'bg-cream-50 hover:bg-cream-200 text-indigo-pen border border-cream-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection List with Gender Filter Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-indigo-muted font-semibold">
                Available Voices ({filteredVoices.length})
              </label>

              {/* Gender Filter Tabs */}
              <div className="flex items-center gap-1 bg-cream-200 p-0.5 rounded-xl border border-cream-300">
                <button
                  type="button"
                  onClick={() => setGenderFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    genderFilter === 'all'
                      ? 'bg-indigo-pen text-cream-50 shadow-sm'
                      : 'text-indigo-muted hover:text-indigo-deep'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter('Male')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    genderFilter === 'Male'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-900/70 hover:text-blue-900'
                  }`}
                >
                  👨 Male
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter('Female')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    genderFilter === 'Female'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-pink-900/70 hover:text-pink-900'
                  }`}
                >
                  👩 Female
                </button>
              </div>
            </div>

            {filteredVoices.length === 0 ? (
              <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 text-center text-xs text-indigo-muted">
                No voices found matching this filter.
              </div>
            ) : (
              filteredVoices.map((voice) => {
                const isSelected = currentSelectedURI === voice.voiceURI;
                const isPlayingThis = testingVoiceURI === voice.voiceURI;
                const isMale = voice.gender === 'Male';

                return (
                  <div
                    key={voice.voiceURI}
                    onClick={() => handleSelect(voice.voiceURI)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? isMale 
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-sm'
                          : 'bg-highlighter-active border-indigo-pen/40 ring-2 ring-highlighter shadow-sm'
                        : 'bg-cream-100 hover:bg-cream-200/80 border-cream-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          isSelected 
                            ? isMale ? 'bg-blue-600 text-white' : 'bg-indigo-pen text-cream-50'
                            : 'bg-cream-200 text-indigo-muted'
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-indigo-deep truncate">{voice.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                              isMale
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : 'bg-pink-100 text-pink-900 border-pink-300'
                            }`}
                          >
                            {isMale ? '👨 Male Voice' : '👩 Female Voice'}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-muted">{voice.lang}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleTestVoice(e, voice)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 flex-shrink-0 transition-all active:scale-95 ${
                        isPlayingThis
                          ? isMale
                            ? 'bg-blue-600 text-white border-blue-600 animate-pulse shadow-md'
                            : 'bg-indigo-pen text-cream-50 border-indigo-pen animate-pulse shadow-md'
                          : 'bg-cream-200 hover:bg-cream-300 text-indigo-pen border-cream-400'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isPlayingThis ? 'Testing…' : 'Test'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Speech Rate (0.25x to 2.0x) */}
          <div className="space-y-2 pt-2 border-t border-cream-300">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-deep">Speech Pace (0.25x – 2.0x)</span>
              <span className="font-mono font-bold text-indigo-pen bg-cream-200 px-2 py-0.5 rounded-lg border border-cream-300">
                {playbackSpeed}x
              </span>
            </div>

            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.05"
              value={playbackSpeed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="w-full accent-indigo-pen cursor-pointer h-2 bg-cream-200 rounded-lg"
            />

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
              {SPEED_PRESETS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onChangeSpeed(rate)}
                  className={`py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                    playbackSpeed === rate
                      ? 'bg-indigo-pen text-cream-50 shadow-sm'
                      : 'bg-cream-200 hover:bg-cream-300 text-indigo-pen border border-cream-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 border-t border-cream-300">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-indigo-pen hover:bg-indigo-deep text-cream-50 font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
