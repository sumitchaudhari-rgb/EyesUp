import React from 'react';
import { AlertTriangle, X, RefreshCw, Upload, Camera } from 'lucide-react';

export default function ErrorAlert({ error, onClose, onRetry }) {
  if (!error) return null;

  const isScannedPdf = error.includes("SCANNED_PDF_DETECTED") || error.toLowerCase().includes("scanned");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 rounded-3xl border-2 border-margin-subtle shadow-2xl max-w-md w-full p-6 sm:p-8 relative space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-margin-red flex-shrink-0 shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-lg text-indigo-deep">
              {isScannedPdf ? "Scanned PDF Detected" : "Extraction Failed"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-indigo-muted leading-relaxed">
              {isScannedPdf 
                ? "This PDF appears to contain raw scanned images without embedded selectable text. You can upload each page as a photo (JPG/PNG) to process with high-accuracy OCR."
                : error}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cream-200 text-indigo-muted hover:text-indigo-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-2.5 rounded-xl bg-indigo-pen hover:bg-indigo-deep text-cream-50 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-indigo-pen text-xs font-semibold border border-cream-400 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
