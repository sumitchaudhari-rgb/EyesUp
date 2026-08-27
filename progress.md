# 📊 EyesUp — Development Progress Log

> **Repository**: [https://github.com/sumitchaudhari-rgb/EyesUp](https://github.com/sumitchaudhari-rgb/EyesUp)  
> **Concept**: Hands-free, writing-paced PDF and photo reader that speaks study material sentence-by-sentence so students never have to glance away from their notebooks.

---

## 🧭 Phase Tracker

| Phase | Description | Status | Commit / Notes |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Design System + Scaffold** | ✅ **Completed** | Commit `8309306` — Full warm notebook theme, Split View, arm's-length card, floating controls, keyboard shortcuts |
| **Phase 2** | **OCR Pipeline** | ✅ **Completed** | Commit `Phase 2` — PDF.js digital extraction + Tesseract.js photo OCR + canvas pre-processing + fountain-pen loader |
| **Phase 3** | **Text-to-Speech + Live Highlighting** | ⏳ *Next* | Web Speech API sentence-by-sentence reading + boundary-synced highlight |
| **Phase 4** | **Hands-Free Interaction** | 📋 *Queued* | Native key listeners (`Space`, `Arrows`, `R`), touch optimization, floating mini-player |
| **Phase 5** | **Micro-Interactions & Motion** | 📋 *Queued* | Signature sentence transition animation + `prefers-reduced-motion` |
| **Phase 6** | **Responsiveness & A11y Polish** | 📋 *Queued* | Propped tablet view, arm's-length readability, contrast & focus checks |
| **Phase 7** | **Edge Cases & Inline Correction** | 📋 *Queued* | Multi-page loop, skewed image rotation, inline manual OCR correction textarea |
| **Phase 8** | **Test & Ship** | 📋 *Queued* | End-to-end automated validation + Vercel/Netlify deploy |

---

## 📝 Detailed Phase Logs

### ✅ Phase 1 — Design System + Scaffold (Completed)
- **Design Tokens & Palette**:
  - `cream`: `#FDFBF7` (background base), `#FAF6EE` (paper cream), `#F4ECE1` (subtle border)
  - `indigo`: `#1E293B` (fountain-pen dark slate), `#0F172A` (deep ink)
  - `highlighter`: `#FEF08A` (soft yellow glow), `#FDE047` (active highlight text)
  - `margin`: `#E11D48` (ruled notebook red margin line)
  - `ruled-pattern`: Lined notebook CSS gradient background
- **Typography**:
  - Headings & Editorial Display: `Fraunces` / `Lora` (Google Fonts)
  - Body & Reading Text: `Plus Jakarta Sans` / `Inter`
  - Handwritten Accents: `Caveat`
  - Badges & Keyboard Shortcuts: `JetBrains Mono`
- **Implemented Components**:
  - `Header.jsx`, `EmptyState.jsx`, `UploadZone.jsx`, `SplitView.jsx`, `DocumentViewer.jsx`, `PlaybackPanel.jsx`, `FloatingControls.jsx`, `KeyboardShortcutsModal.jsx`, `sampleDocument.js`

### ✅ Phase 2 — OCR Pipeline (Completed)
- **Text & Sentence Tokenization Engine** (`src/utils/textCleaner.js`):
  - Strips broken line-wrap hyphens across newlines (e.g. `trans- \n mission` -> `transmission`)
  - Normalizes quotes and excess whitespace
  - Protects decimals (`3.14`) and common scientific/academic abbreviations (`dr.`, `fig.`, `eq.`, `vs.`, `e.g.`, `i.e.`)
  - Chunks text into clean, digestible sentence strings for the speech engine
- **PDF Extraction Engine** (`src/utils/pdfExtractor.js`):
  - Powered by `pdfjs-dist` with CDN worker fallback
  - Iterates multi-page PDFs, calculates geometric line coordinates, and extracts clean selectable text
  - Detects scanned image PDFs and triggers appropriate OCR recommendations
- **Photo & Scanned OCR Engine** (`src/utils/ocrExtractor.js`):
  - Powered by `tesseract.js` with client-side OCR worker
  - Canvas-based image pre-processing (downsampling, grayscale luminosity weighting, contrast expansion) to handle low-light phone photos
  - Real-time recognition percentage logging (0-100%)
- **Animated Fountain-Pen Loading State** (`src/components/ExtractionLoader.jsx`):
  - Replaces generic spinners with an on-brand notebook sheet animation
  - Animated fountain-pen nib gliding across ruled paper as the progress bar fills with highlighter yellow
  - Shows file type, real-time stage description, percentage badge, and cancel action
- **Error Handling Modal** (`src/components/ErrorAlert.jsx`):
  - Friendly alerts for blurry images, empty scans, or unsupported files with retry action
- **Build & Verification**:
  - `npm run build`: Production bundle compiled in 4.71s with 0 errors
  - Dev server running at `http://127.0.0.1:5173/`

---

## 🎯 Next Step: Phase 3 (Text-to-Speech + Live Highlighting)
- [ ] Connect Web Speech API (`SpeechSynthesis`) with sentence-by-sentence reading
- [ ] Sync active text highlight with speech boundaries and sentence progression
- [ ] Implement full play, pause, resume, restart, and speed controls (0.5x - 2.0x)
- [ ] Add system voice selector (Natural/High-quality OS voices)
- [ ] Implement auto-scroll to keep active highlighted sentence in viewport
