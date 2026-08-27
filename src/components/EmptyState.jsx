import React from 'react';
import UploadZone from './UploadZone';
import { Headphones, Eye, PenLine, Sparkles, BookOpen } from 'lucide-react';

export default function EmptyState({ onFileUpload, onLoadSample }) {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-12">
      {/* Hero statement */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-300/80 border border-cream-400 text-xs font-semibold text-indigo-pen">
          <PenLine className="w-3.5 h-3.5 text-margin-red" />
          <span>Hands-Free Notebook Companion</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-indigo-deep">
          Read aloud, sentence-by-sentence.
        </h2>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-indigo-muted font-sans leading-relaxed">
          Upload any lecture PDF or textbook photo. EyesUp speaks each sentence at your writing pace with live highlights so your eyes never leave your page.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone onFileUpload={onFileUpload} onLoadSample={onLoadSample} />

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-highlighter-glow border border-highlighter-border flex items-center justify-center text-indigo-deep">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-indigo-deep">Zero Eye-Darting</h3>
          <p className="text-sm text-indigo-muted leading-relaxed">
            Eliminate the cognitive strain of constantly shifting focus between a glowing screen and your handwriting.
          </p>
        </div>

        <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-indigo-deep">Writing-Paced Audio</h3>
          <p className="text-sm text-indigo-muted leading-relaxed">
            Sentence-by-sentence speech with instant spacebar pause and skip controls to match your exact note-taking speed.
          </p>
        </div>

        <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cream-200 border border-cream-400 flex items-center justify-center text-indigo-pen">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-indigo-deep">Private & In-Browser</h3>
          <p className="text-sm text-indigo-muted leading-relaxed">
            Your PDFs and textbook photos never leave your device. All OCR and speech generation happens 100% locally.
          </p>
        </div>
      </div>
    </div>
  );
}
