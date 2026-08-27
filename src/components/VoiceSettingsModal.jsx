import React, { useState, useEffect } from 'react';
import { X, Volume2, Mic, Sliders, Play, Check } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';

export default function VoiceSettingsModal({
  isOpen,
  onClose,
  selectedVoiceURI,
  onSelectVoice,
  playbackSpeed,
  onChangeSpeed
}) {
  const [voices, setVoices] = useState([]);
  const [pitch, setPitch] = useState(1.0);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const vList = speechEngine.getVoices();
      setVoices(vList);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestVoice = (voice) => {
    setIsTestingVoice(true);
    speechEngine.setVoice(voice.voiceURI);
    speechEngine.setRate(playbackSpeed);
    speechEngine.setPitch(pitch);
    
    speechEngine.speak("This is a preview of the EyesUp reading voice.", -1);
    setTimeout(() => setIsTestingVoice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-cream-300 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-indigo-deep">Voice & Audio Settings</h3>
              <p className="text-xs text-indigo-muted">Choose a natural voice that suits your study flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Selection List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <label className="text-xs font-mono uppercase tracking-wider text-indigo-muted font-semibold block mb-2">
            Available Voices ({voices.length})
          </label>
          
          {voices.length === 0 ? (
            <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 text-center text-xs text-indigo-muted">
              Loading system voices...
            </div>
          ) : (
            voices.map((voice) => {
              const isSelected = selectedVoiceURI === voice.voiceURI || (!selectedVoiceURI && voice.default);
              const isNatural = voice.name.toLowerCase().includes('natural') || 
                                voice.name.toLowerCase().includes('neural') ||
                                voice.name.toLowerCase().includes('google');

              return (
                <div
                  key={voice.voiceURI}
                  onClick={() => onSelectVoice(voice.voiceURI)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-highlighter-active border-indigo-pen/40 ring-2 ring-highlighter shadow-sm'
                      : 'bg-cream-100 hover:bg-cream-200/80 border-cream-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-indigo-pen text-cream-50' : 'bg-cream-200 text-indigo-muted'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-indigo-deep truncate">
                          {voice.name}
                        </span>
                        {isNatural && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Natural
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-indigo-muted">{voice.lang}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestVoice(voice);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-medium border border-cream-400 flex items-center gap-1 flex-shrink-0 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Speed Adjustment */}
        <div className="space-y-2 pt-2 border-t border-cream-300">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-deep">Speech Rate</span>
            <span className="font-mono font-bold text-indigo-pen">{playbackSpeed}x speed</span>
          </div>
          <div className="flex items-center gap-2">
            {[0.75, 0.9, 1.0, 1.15, 1.25, 1.5, 1.75].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onChangeSpeed(rate)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
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

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-indigo-pen hover:bg-indigo-deep text-cream-50 font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
