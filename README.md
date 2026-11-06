# Picnito PDF

> Offline Windows Desktop Image-to-PDF & PDF Merger Application built with Electron, React (JavaScript), Vite, Sharp, PDFKit, and pdf-lib.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-blue.svg)]()
[![Offline](https://img.shields.io/badge/Status-100%25%20Offline-success.svg)]()

---

## 🌟 Overview

**Picnito PDF** is an offline-first Windows desktop application that gives you complete control over your PDF creation and document management workflows:

1. **Images to PDF**:
   - Combine hundreds of scanned textbook pages, notes, or photos (165+ scans / 300–600 MB+) without memory exhaustion.
   - **Precision Sequence Manager**: Drag-and-drop reordering, sequence badges matching final PDF page numbers, natural alphanumeric sorting (`page-1`, `page-2`, `page-10`), and undo/redo history.
   - **High-Resolution Preview Lightbox**: Double-click or click inspect to view pages in full detail with zoom and keyboard navigation.
   - **Page Customization**: Standard ISO paper sizes (A0–A6, B4–B5), North American (Letter, Legal, Tabloid), custom dimensions, orientation (Portrait, Landscape, Auto), placement modes (Fit, Fill, Stretch), margins, and backgrounds.

2. **Merge PDFs into One (New)**:
   - Combine 2 or more PDF documents into a single sequential PDF.
   - Reorder PDF documents with drag-and-drop or position buttons (#1, #2, etc.).
   - Displays real-time page count per file, combined total pages, and file sizes.
   - 100% offline using `pdf-lib`.

3. **Output Destination Controls**:
   - Save directly to your preferred folder with **[Browse]** and one-click quick shortcuts (**Desktop**, **Documents**, **Downloads**).
   - Checkbox mark option: `[✓] Always ask where to save each time` (Windows Save Dialog).
   - Editable default output filename with overwrite protection.

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

## ⌨️ Keyboard Shortcuts

- `Space` / `Enter` — Open big preview lightbox for selected image
- `←` / `→` — Navigate through pages in preview lightbox
- `+` / `-` / `0` — Zoom in / out / reset in preview lightbox
- `Ctrl + A` — Select all images
- `Esc` — Clear selection / close lightbox
- `Delete` / `Backspace` — Remove selected images
- `Ctrl + Z` — Undo sequence change
- `Ctrl + Y` / `Ctrl + Shift + Z` — Redo sequence change

---

## 📄 License

MIT © Sourov Chandra
