# Picnito PDF

> Offline Windows Desktop Image-to-PDF & PDF Merger Application built with Electron, React (JavaScript), Vite, Sharp, PDFKit, and pdf-lib.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-blue.svg)]()
[![Offline](https://img.shields.io/badge/Status-100%25%20Offline-success.svg)]()

---

## 🌟 Overview

**Picnito PDF** is an offline-first Windows desktop application that gives you complete control over your PDF creation, layout customization, and document management workflows:

1. **Images to PDF**:
   - Combine hundreds of scanned textbook pages, notes, or photos (165+ scans / 300–600 MB+) without memory exhaustion.
   - **Precision Sequence Manager**: Drag-and-drop reordering, sequence badges matching final PDF page numbers, natural alphanumeric sorting (`page-1`, `page-2`, `page-10`), and undo/redo history.
   - **High-Resolution Lightbox**: Double-click or click inspect to view individual images at full resolution with zoom and keyboard navigation.

2. **Live PDF Page Preview / Print Simulation (New)**:
   - **Visual WYSIWYG Print Preview**: Inspect *exact* sheets of paper rendered to scale before generating the final PDF.
   - **Instant Layout Updates**: Change Paper Size (A4, Letter, A3, etc.), Orientation (Portrait, Landscape, Auto), Placement (Fit, Fill, Stretch), Margins, or Background color, and see the virtual page update immediately in real time.
   - **Printable Bounds & Margin Guidelines**: Toggle dashed guideline overlays to verify safe print boundaries.
   - **Page Sequence Filmstrip**: Navigate page by page with arrows or click any thumbnail in the bottom filmstrip to jump directly to that page.
   - **One-Click Generation**: "Looks Good — Generate PDF" button directly within the preview modal.

3. **Merge PDFs into One**:
   - Combine 2 or more PDF documents into a single sequential PDF.
   - Reorder PDF documents with drag-and-drop or position buttons (#1, #2, etc.).
   - Displays real-time page count per file, combined total pages, and file sizes.
   - 100% offline using `pdf-lib`.

4. **Output Destination Controls**:
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

- `Space` / `Enter` — Open image inspect lightbox
- `←` / `→` — Navigate through pages in preview lightbox & PDF layout preview
- `+` / `-` / `0` — Zoom in / out / reset in preview lightbox
- `Ctrl + A` — Select all images
- `Esc` — Clear selection / close any open preview modal
- `Delete` / `Backspace` — Remove selected images
- `Ctrl + Z` — Undo sequence change
- `Ctrl + Y` / `Ctrl + Shift + Z` — Redo sequence change

---

## 📄 License

MIT © Sourov Chandra
