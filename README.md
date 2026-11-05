# Picnito PDF

> Offline Windows Desktop Image to PDF Application built with Electron, React (JavaScript), Vite, Sharp, and PDFKit.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-blue.svg)]()
[![Offline](https://img.shields.io/badge/Status-100%25%20Offline-success.svg)]()

---

## 🌟 Overview

**Picnito PDF** is an offline-first Windows desktop application that allows users to combine multiple images into a single PDF document while maintaining complete, reliable control over:
- **Image sequence**: Drag-and-drop reordering, natural alphanumeric sorting (`page-1`, `page-2`, `page-10`), and numbered badges corresponding to exact PDF page numbers.
- **Large-Batch Processing**: Designed to handle hundreds of images (165+ scans, 300–600 MB+) sequentially without RAM saturation or crashes.
- **Paper sizes & Layout**: Standard international (A0–A6, B4–B5) and North American (Letter, Legal, Tabloid, Executive) paper sizes, custom dimensions, orientations (Portrait, Landscape, Auto), placements (Fit, Fill, Stretch), margins, and backgrounds.
- **Zero Cloud / 100% Offline**: Runs strictly on your local machine with context isolation and zero data transmission.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ or v22+ recommended)
- npm or pnpm

### Installation

```bash
git clone https://github.com/Sourov-Chandra/Picnito-PDF-.git
cd Picnito-PDF-
npm install
```

### Development Mode

Run Vite dev server and Electron desktop app concurrently:

```bash
npm run electron:dev
```

Or run frontend separately:

```bash
npm run dev
```

### Production Build & Packaging

Build frontend:
```bash
npm run build
```

Package Windows executable (installer & portable):
```bash
npm run package
```

---

## 🏗️ Project Architecture

```
Picnito PDF/
├── electron/
│   ├── main.js         # Electron lifecycle, custom protocols, IPC dialogs & window management
│   ├── preload.js      # ContextBridge exposing secure IPC APIs to renderer
│   └── pdfService.js   # Low-RAM streaming PDF generation (Sharp + PDFKit)
├── src/
│   ├── components/     # React UI components (ImageGrid, ImageCard, SettingsPanel, Modals, etc.)
│   ├── hooks/          # React hooks (useImageCollection, usePdfGenerator)
│   ├── utils/          # Paper sizes, natural sort, and formatting utilities
│   ├── App.jsx         # Main application layout and keyboard shortcut orchestration
│   ├── main.jsx        # React DOM entry point
│   └── index.css       # Tailwind CSS & custom desktop scrollbars
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## ⌨️ Keyboard Shortcuts

- `Ctrl + A` — Select all images
- `Esc` — Clear selection
- `Delete` / `Backspace` — Remove selected images
- `Ctrl + Z` — Undo sequence change
- `Ctrl + Y` / `Ctrl + Shift + Z` — Redo sequence change

---

## 📄 License

MIT © Sourov Chandra
