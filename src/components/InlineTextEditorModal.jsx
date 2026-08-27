import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import { splitIntoSentences, cleanRawText } from '../utils/textCleaner';

export default function InlineTextEditorModal({
  isOpen,
  onClose,
  initialText,
  docTitle,
  onSave
}) {
  const [text, setText] = useState('');
  const [liveSentenceCount, setLiveSentenceCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setText(initialText || '');
    }
  }, [isOpen, initialText]);

  useEffect(() => {
    const sentences = splitIntoSentences(text);
    setLiveSentenceCount(sentences.length);
  }, [text]);

  if (!isOpen) return null;

  const handleApply = () => {
    const cleaned = cleanRawText(text);
    const sentences = splitIntoSentences(cleaned);
    onSave({ rawText: cleaned, sentences });
    onClose();
  };

  const handleReset = () => {
    setText(initialText || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-cream-300 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-indigo-deep">Edit & Correct Extracted Text</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cream-200 text-indigo-muted border border-cream-300">
                  {liveSentenceCount} sentences
                </span>
              </div>
              <p className="text-xs text-indigo-muted truncate max-w-md">
                Fix any OCR typos or misread symbols before listening • {docTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Tip:</strong> Periods, question marks, and exclamation points define sentence boundaries for text-to-speech.
          </span>
        </div>

        {/* Controlled Textarea with Ruled Aesthetic */}
        <div className="flex-1 min-h-[220px] flex flex-col space-y-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste document text here..."
            className="flex-1 w-full p-4 rounded-2xl border border-cream-300 bg-cream-100/70 text-indigo-pen font-serif text-base leading-relaxed focus:bg-cream-50 focus:border-indigo-pen focus:ring-2 focus:ring-highlighter outline-none resize-none transition-all"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-cream-300 gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-semibold border border-cream-400 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Original</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-semibold border border-cream-400 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-indigo-pen hover:bg-indigo-deep text-cream-50 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Re-Sync Audio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
