# 📊 EyesUp — Development Progress Log

> **Repository**: [https://github.com/sumitchaudhari-rgb/EyesUp](https://github.com/sumitchaudhari-rgb/EyesUp)  
> **Concept**: Hands-free, writing-paced PDF and photo reader that speaks study material sentence-by-sentence so students never have to glance away from their notebooks.

---

## 🧭 Phase Tracker

| Phase | Description | Status | Commit / Notes |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Design System + Scaffold** | ✅ **Completed** | Commit `8309306` — Full warm notebook theme, Split View, arm's-length card, floating controls, keyboard shortcuts |
| **Phase 2** | **OCR Pipeline** | ⏳ *Next* | PDF.js (text PDFs) + Tesseract.js (photos/scanned pages) + on-brand paper loader |
| **Phase 3** | **Text-to-Speech + Live Highlighting** | 📋 *Queued* | Web Speech API sentence-by-sentence reading + boundary-synced highlight |
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
  - `Header.jsx`: Top navigation, pen badge, document title pill, shortcut modal launcher, demo loader
  - `EmptyState.jsx`: Clean notebook empty state with tactile dashed dropzone and 3 core value cards
  - `UploadZone.jsx`: Drag-and-drop target accepting `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`
  - `SplitView.jsx`: Desktop & tablet two-column layout
  - `DocumentViewer.jsx`: Left notebook sheet showing formatted text chunks, font size zooming (`14px` - `28px`), and sentence index badges
  - `PlaybackPanel.jsx`: Right focus card with huge arm's-length current sentence display, progress bar, transport controls, and reading rate buttons (`0.8x`, `1.0x`, `1.25x`, `1.5x`)
  - `FloatingControls.jsx`: Sticky bottom mini-bar ensuring controls remain accessible while scrolling
  - `KeyboardShortcutsModal.jsx`: Modal displaying hands-free keys (`Space`, `←`, `→`, `R`, `?`)
  - `sampleDocument.js`: Pre-loaded biology chapter for instant testing without file upload
- **Build & Verification**:
  - `npm run build`: Production bundle compiled successfully with Vite (0 errors)
  - Dev server running at `http://127.0.0.1:5173/`

---

## 🎯 Next Step: Phase 2 (OCR Pipeline)
- [ ] Install and configure `pdfjs-dist` for direct text extraction from digital PDFs
- [ ] Install and configure `tesseract.js` for client-side OCR on photos and scanned images
- [ ] Build canvas image pre-processor (grayscale, contrast boost, orientation check)
- [ ] Implement an on-brand notebook loader state with progress bar (replacing generic spinners)
- [ ] Integrate error handling for blurry photos or empty pages
