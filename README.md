# EyesUp 📖✨

> **Keep your pen on paper and your eyes on your notebook.**  
> A student-focused web application that reads PDF and textbook photos aloud sentence-by-sentence with live-synced highlighting.

---

## 💡 Concept

When taking handwritten notes from textbooks or lecture slides, constantly darting eyes back and forth between a bright screen and notebook paper creates severe cognitive strain and slows handwriting down.

**EyesUp** solves this by speaking your study material aloud at your writing pace:
1. **Drop a PDF or snap a textbook photo**
2. **EyesUp extracts and chunks the text** into natural sentences
3. **Listen hands-free** with instant `Spacebar` pause/resume and `Arrow` skipping
4. **Arm's-length high-visibility display** shows the active sentence clearly without needing to look up close

---

## 🎨 Phase 1 Design System

- **Palette**: Warm Notebook Cream (`#FAF6EE`), Fountain-Pen Indigo (`#1E293B`), and Soft Highlighter Yellow (`#FEF08A`)
- **Typography**: Display Serif (`Fraunces` / `Lora`), Clean Body (`Plus Jakarta Sans`), and Marginal Notes (`Caveat`)
- **Layout**: Split-view with left document notebook sheet and right arm's-length playback deck
- **Hands-Free Control**: Keyboard shortcuts (`Space`, `←`, `→`, `R`) and floating persistent player

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Dev Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🗺️ Build Roadmap

- [x] **Phase 1**: Design System + Scaffold (Vite + React + Tailwind + Notebook Theme + Split View)
- [ ] **Phase 2**: OCR Pipeline (PDF.js for digital PDFs, Tesseract.js for scanned photos)
- [ ] **Phase 3**: Text-to-Speech + Live Sentence Sync (Web Speech API)
- [ ] **Phase 4**: Hands-Free Interaction & Floating Mini-Player
- [ ] **Phase 5**: Micro-Interactions & Signature Motion
- [ ] **Phase 6**: Tablet & Arm's-Length Responsiveness
- [ ] **Phase 7**: Edge Cases & Inline OCR Error Correction
- [ ] **Phase 8**: Production Polish & Deployment

---

## 📜 License
MIT License
