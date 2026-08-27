import React from 'react';
import { X, Command, Keyboard, Check } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space", desc: "Play / Pause speech narration" },
    { key: "→  or  L", desc: "Skip to next sentence" },
    { key: "←  or  J", desc: "Repeat previous sentence" },
    { key: "R  or  K", desc: "Restart active sentence from beginning" },
    { key: "T", desc: "Toggle sentence loop mode (repeat sentence)" },
    { key: "[  /  ]", desc: "Decrease / Increase reading speed" },
    { key: "M", desc: "Mute / Unmute subtle audio cues" },
    { key: "Esc", desc: "Close modal / dismiss error" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-cream-300 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative">
        <div className="flex items-center justify-between border-b border-cream-300 pb-3">
          <div className="flex items-center gap-2.5 text-indigo-deep">
            <div className="w-8 h-8 rounded-xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-lg">Hands-Free Keyboard Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-indigo-muted leading-relaxed">
          Keep one hand resting on your keyboard or tablet edge. Every core action is triggered by a single intuitive keypress so you never lift your pen.
        </p>

        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
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

        <div className="pt-2 text-center">
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
