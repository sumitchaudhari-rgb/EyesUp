import React from 'react';
import { PenTool, Sparkles, FileText, Camera, RefreshCw, X } from 'lucide-react';

export default function ExtractionLoader({ 
  progress, 
  fileName, 
  fileType, 
  onCancel 
}) {
  const percent = Math.min(100, Math.max(0, progress?.percent || 10));
  const stage = progress?.stage || "Preparing document reader...";
  const isImage = fileType?.startsWith('image') || (fileName && /\.(png|jpe?g|webp)$/i.test(fileName));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/50 backdrop-blur-md animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-cream-300 shadow-2xl max-w-lg w-full p-8 relative overflow-hidden space-y-6">
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-pen/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-pen/40 rounded-tr-sm pointer-events-none" />

        {/* Header Icon + File Info */}
        <div className="flex items-center justify-between border-b border-cream-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen shadow-sm">
              {isImage ? (
                <Camera className="w-6 h-6 text-indigo-night animate-pulse" />
              ) : (
                <FileText className="w-6 h-6 text-indigo-night animate-pulse" />
              )}
            </div>
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-muted">
                {isImage ? 'OCR Engine Processing' : 'PDF Text Extraction'}
              </span>
              <h3 className="font-serif font-bold text-lg text-indigo-deep truncate max-w-[260px]">
                {fileName || 'Document'}
              </h3>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 rounded-xl hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
              title="Cancel processing"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Animated Ruled Notebook Sheet with Fountain Pen Sweep */}
        <div className="relative bg-cream-100 rounded-2xl border border-cream-300 p-6 overflow-hidden shadow-inner">
          {/* Notebook ruled lines */}
          <div className="space-y-4">
            <div className="h-2.5 bg-cream-300 rounded-full w-3/4 opacity-60" />
            <div className="relative h-3 bg-cream-200 rounded-full overflow-hidden border border-cream-300">
              {/* Active Highlighter Yellow Progress Sweep */}
              <div 
                className="h-full bg-gradient-to-r from-highlighter to-highlighter-hover transition-all duration-300 rounded-full shadow-sm"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="h-2.5 bg-cream-300 rounded-full w-5/6 opacity-40" />
          </div>

          {/* Fountain pen nib icon gliding with the progress */}
          <div 
            className="absolute top-8 transition-all duration-300 -translate-x-3 pointer-events-none"
            style={{ left: `calc(${percent}% * 0.85 + 24px)` }}
          >
            <div className="w-7 h-7 rounded-full bg-indigo-pen text-cream-50 flex items-center justify-center shadow-md rotate-45 ring-2 ring-highlighter">
              <PenTool className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Real-time Status Text & Percentage */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-indigo-deep font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span className="truncate max-w-[280px]">{stage}</span>
          </div>
          <span className="font-mono font-bold text-indigo-pen bg-cream-200 px-2.5 py-1 rounded-md border border-cream-300">
            {percent}%
          </span>
        </div>

        <p className="text-center text-[11px] text-indigo-muted italic">
          Everything processes 100% locally in your browser. Your document is never uploaded to any server.
        </p>
      </div>
    </div>
  );
}
