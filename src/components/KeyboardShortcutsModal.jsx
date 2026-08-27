import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space", desc: "Play / Pause speech narration" },
    { key: "→  (Right Arrow)", desc: "Skip to next sentence" },
    { key: "←  (Left Arrow)", desc: "Repeat / Jump to previous sentence" },
    { key: "R", desc: "Restart active sentence from beginning" },
    { key: "Esc", desc: "Close shortcut menu / deselect" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-2xl border border-cream-300 shadow-2xl max-w-md w-full p-6 space-y-5 relative">
        <div className="flex items-center justify-between border-b border-cream-300 pb-3">
          <div className="flex items-center gap-2 text-indigo-deep">
            <Keyboard className="w-5 h-5 text-indigo-pen" />
            <h3 className="font-serif font-bold text-lg">Hands-Free Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-indigo-muted">
          Designed so your hands can tap a key without lifting your pen or looking up from your notebook.
        </p>

        <div className="space-y-2">
          {shortcuts.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100 border border-cream-200"
            >
              <span className="text-xs font-medium text-indigo-pen">{item.desc}</span>
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-cream-50 rounded-lg border border-cream-400 text-indigo-deep shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-pen text-cream-50 text-xs font-bold hover:bg-indigo-deep transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
