import React, { useRef, useState } from 'react';
import { Upload, FileUp, Camera, FileText, ArrowRight, Sparkles } from 'lucide-react';

export default function UploadZone({ onFileUpload, onLoadSample }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center bg-cream-50/70 hover:bg-cream-50 ${
          isDragging 
            ? 'border-indigo-night bg-highlighter-active scale-[0.99] ring-4 ring-highlighter-glow' 
            : 'border-cream-400 hover:border-indigo-wash shadow-notebook'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Decorative corner tabs like a vintage folio */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cream-500 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cream-500 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cream-500 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cream-500 rounded-br-sm pointer-events-none" />

        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen group-hover:scale-105 group-hover:bg-highlighter-glow transition-transform duration-200">
            <Upload className="w-8 h-8 text-indigo-night" />
          </div>

          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-indigo-deep">
              Drop your PDF or photo here
            </h3>
            <p className="mt-1.5 text-sm text-indigo-muted font-sans">
              Drag & drop lecture notes, textbook chapters, or snaps from your phone
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cream-200 text-xs font-medium text-indigo-pen border border-cream-300">
              <FileText className="w-3.5 h-3.5 text-indigo-night" />
              PDF Documents
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cream-200 text-xs font-medium text-indigo-pen border border-cream-300">
              <Camera className="w-3.5 h-3.5 text-indigo-night" />
              Photos & Scans (JPG / PNG)
            </span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-pen text-cream-50 text-sm font-semibold hover:bg-indigo-deep shadow-sm transition-all active:scale-95"
            >
              <FileUp className="w-4 h-4" />
              <span>Browse File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick start alternative */}
      <div className="mt-4 flex items-center justify-center gap-3 text-sm text-indigo-muted">
        <span>Don't have a document ready?</span>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1 font-semibold text-indigo-night hover:text-indigo-deep underline underline-offset-4 decoration-highlighter-border decoration-2 hover:decoration-indigo-deep transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Load demo biology lecture notes
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
