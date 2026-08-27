import React from 'react';
import { BookOpen, Command, Volume2, Sparkles, FileText, Upload, Sliders, Mic, MicOff } from 'lucide-react';

export default function Header({ 
  hasDoc, 
  docTitle, 
  isVoiceControlActive,
  onToggleVoiceControl,
  onResetDoc, 
  onOpenShortcuts,
  onOpenVoiceSettings,
  onLoadSample 
}) {
  return (
    <header className="sticky top-0 z-30 bg-cream-50/95 backdrop-blur-md border-b border-cream-300 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-pen flex items-center justify-center text-cream-50 shadow-md shadow-indigo-pen/10 ring-2 ring-cream-300">
            <span className="font-serif font-bold text-xl tracking-tighter">E<span className="text-highlighter">·</span>U</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-xl tracking-tight text-indigo-deep">EyesUp</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                TTS Active
              </span>
            </div>
            <p className="text-xs text-indigo-muted hidden sm:block font-sans">
              Keep your pen on paper & eyes on your notes
            </p>
          </div>
        </div>

        {/* Current Document Pill / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hands-Free Voice Command Listener Toggle */}
          <button
            onClick={onToggleVoiceControl}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border ${
              isVoiceControlActive
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20 ring-2 ring-emerald-400/50 animate-pulse'
                : 'bg-cream-200 hover:bg-cream-300 text-indigo-pen border-cream-400'
            }`}
            title="Enable Voice Commands ('pause', 'repeat', 'repeat line', 'continue') without touching screen"
          >
            {isVoiceControlActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-indigo-muted" />}
            <span>{isVoiceControlActive ? 'Voice Cmd: ON' : 'Voice Cmd: OFF'}</span>
          </button>

          {hasDoc ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream-200/80 border border-cream-300 text-xs font-medium text-indigo-pen max-w-xs truncate">
              <FileText className="w-3.5 h-3.5 text-indigo-muted flex-shrink-0" />
              <span className="truncate">{docTitle}</span>
              <button 
                onClick={onResetDoc}
                className="ml-1 text-indigo-muted hover:text-margin-red text-[11px] underline underline-offset-2 flex-shrink-0"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-highlighter-glow hover:bg-highlighter text-indigo-deep text-xs font-semibold border border-highlighter-border transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-deep" />
              <span>Try Sample Text</span>
            </button>
          )}

          {/* Voice Settings Button */}
          <button
            onClick={onOpenVoiceSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-medium border border-cream-400 transition-colors"
            title="Configure speech voice & speed"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-muted" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={onOpenShortcuts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-medium border border-cream-400 transition-colors"
            title="Keyboard & voice shortcuts"
          >
            <Command className="w-3.5 h-3.5 text-indigo-muted" />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-cream-50 rounded border border-cream-400 text-indigo-pen">
              ?
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
