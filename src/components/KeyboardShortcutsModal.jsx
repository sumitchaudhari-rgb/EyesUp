import React from 'react';
import { X, Command, Keyboard, Mic } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const voiceCommands = [
    { speech: '"pause" or "stop" or "wait"', action: "Pauses narration" },
    { speech: '"play" or "continue" or "resume"', action: "Starts / resumes reading" },
    { speech: '"repeat" or "repeat word"', action: "Repeats previous word (1-time)" },
    { speech: '"repeat line" or "whole line"', action: "Repeats current sentence (1-time)" },
    { speech: '"next" or "skip"', action: "Skips to next sentence" },
    { speech: '"back" or "previous"', action: "Jumps to previous sentence" },
    { speech: '"slower" or "faster"', action: "Fine-tunes speaking speed" },
  ];

  const shortcuts = [
    { key: "V", desc: "Toggle Microphone Voice Commands (ON / OFF)" },
    { key: "Space", desc: "Play / Pause speech narration" },
    { key: "W", desc: "Repeat previous word (1-time)" },
    { key: "R  or  K", desc: "Restart active sentence from beginning" },
    { key: "→  or  L", desc: "Skip to next sentence" },
    { key: "←  or  J", desc: "Repeat previous sentence" },
    { key: "T", desc: "Toggle continuous sentence loop mode" },
    { key: "U", desc: "Toggle Punctuation Dictation ('comma', 'full stop')" },
    { key: "P", desc: "Toggle Word-by-Word Pause" },
    { key: "E", desc: "Open Inline Text & OCR Editor" },
    { key: "[  /  ]", desc: "Decrease / Increase reading speed (0.25x - 2.0x)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-cream-300 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-cream-300 pb-3">
          <div className="flex items-center gap-2.5 text-indigo-deep">
            <div className="w-8 h-8 rounded-xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
              <Mic className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-lg">Hands-Free Voice & Keyboard Commands</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Spoken Voice Commands Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Spoken Voice Commands (Say Aloud)
              </span>
              <span className="text-[10px] font-mono text-indigo-muted bg-cream-200 px-2 py-0.5 rounded">
                Toggle: V key
              </span>
            </div>
            <div className="space-y-1.5">
              {voiceCommands.map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-emerald-900">{item.speech}</span>
                  <span className="text-xs font-sans text-indigo-pen">{item.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts Section */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-muted font-bold block mb-2">
              Keyboard Shortcuts
            </span>
            <div className="space-y-1.5">
              {shortcuts.map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100 border border-cream-200 hover:border-cream-400 transition-colors"
                >
                  <span className="text-xs font-medium text-indigo-pen">{item.desc}</span>
                  <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-cream-50 rounded-lg border border-cream-400 text-indigo-deep shadow-sm">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 text-center border-t border-cream-300">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-indigo-pen text-cream-50 text-xs font-bold hover:bg-indigo-deep shadow-md transition-all active:scale-95"
          >
            Got It (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
