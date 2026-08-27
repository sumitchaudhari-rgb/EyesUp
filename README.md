# EyesUp 📖✨

> **Keep your pen on paper and your eyes on your notebook.**  
> A browser-only, privacy-first study companion that reads PDF and textbook photos aloud sentence-by-sentence with live-synced highlighting.

[![Vercel Deploy](https://vercel.com/button)](https://vercel.com/new)
[![Netlify Deploy](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

---

## 💡 The Problem & The Solution

When taking handwritten notes from digital PDFs or textbooks, constantly shifting eyes back and forth between a bright screen and your notebook causes significant cognitive strain, breaks focus, and slows your handwriting down.

**EyesUp** solves this by speaking study materials aloud at your exact writing pace:
1. **Drop a PDF or snap a textbook photo** directly from your phone or tablet.
2. **EyesUp extracts & chunks the text** into natural, cadence-friendly sentences.
3. **Listen hands-free** with instant `Spacebar` pause/resume and single-key sentence navigation.
4. **Arm's-length high-visibility card** displays the active sentence in large, crisp typography so you can glance over without leaving your seat.

---

## ✨ Features Across All 8 Phases

- 🎨 **Warm Notebook Aesthetic**: Fountain-pen indigo (`#1E293B`), warm parchment cream (`#FAF6EE`), ruled margin lines, and Google editorial typography (`Fraunces` + `Plus Jakarta Sans`).
- 📄 **Digital PDF Text Extraction**: In-browser text extraction powered by `PDF.js` with multi-page support.
- 📷 **Textbook Photo OCR**: In-browser OCR powered by `Tesseract.js` with canvas contrast & grayscale pre-processing for low-light photos.
- 🖋️ **Animated Fountain-Pen Loader**: Custom notebook loading state replacing generic spinners.
- 🎙️ **Sentence-Synchronized TTS**: Web Speech API speech synthesis with automatic sentence advance, boundary tracking, and zero backend requirement.
- 🗣️ **Natural Voice Discovery**: Auto-detects and prioritizes Natural / Neural OS voices with speed tuning (`0.75x` – `1.75x`).
- ✍️ **Dictation Loop Mode**: Repeat the current sentence continuously while writing down complex formulas or definitions.
- 🔍 **Smooth Auto-Centering**: Automatically scrolls and centers the active sentence in the document reader.
- 📱 **Tablet-Propped Modes**: Responsive layout modes (Split View, Full Document Reader, Large Focus Card) designed for iPads/tablets propped beside a paper notebook.
- 🛠️ **Inline OCR Correction**: Fix misread characters or formulas instantly and re-sync speech with a single click.
- 🔄 **Photo Orientation Pre-Processor**: Rotate sideways or upside-down mobile photos (↺ / ↻ 90°) before OCR.
- 🎧 **Web Audio Feedback**: Gentle auditory confirmation clicks for hands-free operations.

---

## ⌨️ Hands-Free Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause speech narration |
| <kbd>→</kbd> or <kbd>L</kbd> | Skip to next sentence |
| <kbd>←</kbd> or <kbd>J</kbd> | Repeat / previous sentence |
| <kbd>R</kbd> or <kbd>K</kbd> | Restart active sentence from beginning |
| <kbd>T</kbd> | Toggle sentence repeat loop (dictation mode) |
| <kbd>E</kbd> | Open inline text & OCR editor |
| <kbd>[</kbd> / <kbd>]</kbd> | Decrease / Increase reading speed |
| <kbd>M</kbd> | Mute / Unmute auditory feedback clicks |
| <kbd>?</kbd> | Open hands-free shortcut cheatsheet |
| <kbd>Esc</kbd> | Close modals / dismiss alerts |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/sumitchaudhari-rgb/EyesUp.git
cd EyesUp
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🚢 Deployment

EyesUp runs **100% in the browser** and requires zero server-side infrastructure:

- **Vercel**: Pre-configured with `vercel.json` for one-click static deployment.
- **Netlify**: Pre-configured with `netlify.toml` for static single-page app hosting.

---

## 📜 License
MIT License © 2026 Sumit Chaudhari
