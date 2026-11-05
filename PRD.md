# Product Requirements Document (PRD)

# Picnito PDF — Offline Desktop Application

**Version:** 1.0\
**Platform:** Windows Desktop\
**Application Type:** Offline-first PDF creation tool\
**Primary Users:** Students, teachers, office workers, and anyone converting large collections of images into PDF documents.

---

## 1. Product Overview

### 1.1 Product Vision

Picnito PDF is an offline Windows desktop application that allows users to combine multiple images into a single PDF document while maintaining complete control over image sequence, page dimensions, orientation, margins, and image quality.

Unlike basic image-to-PDF tools, Picnito PDF prioritizes accurate image ordering and large-batch processing.

### 1.2 Main Problem

Users frequently select multiple images from their Windows folders or mobile-device backups in a particular order.

However:

- The file picker may return images in a different order from the user's selection order.
- Generated PDFs may contain pages in an unexpected sequence.
- Built-in Windows PDF printing does not provide a convenient image-sequence management workflow.
- Many online converters impose upload limits or require users to upload private documents.

### 1.3 Proposed Solution

Build a standalone desktop application that:

1. Imports multiple images.
2. Displays them as numbered thumbnails.
3. Allows users to rearrange images manually.
4. Generates one PDF containing all selected images in the exact displayed order.
5. Provides extensive paper-size and layout customization.
6. Processes everything locally without an internet connection.

---

## 2. Target Users

| User           | Main requirement                                   |
| -------------- | -------------------------------------------------- |
| Students       | Convert scanned textbook pages and notes into PDFs |
| Teachers       | Combine educational materials                      |
| Office workers | Convert document images into PDFs                  |
| General users  | Combine personal photographs and images            |

**Primary use case:** A student has 165 scanned textbook images totaling 300–500 MB and wants to create one properly ordered PDF.

---

## 3. Core Features

### 3.1 Image Import

Users should be able to:

- Select multiple images.
- Select an entire folder.
- Drag and drop images into the application.
- Add more images after the initial import.
- Remove individual images.
- Clear the entire collection.

**Supported formats:**

- JPG / JPEG
- PNG
- WEBP
- BMP
- TIFF

The application should validate unsupported, corrupted, and unreadable files and provide clear error messages.

### 3.2 Image Sequence Manager

This is the most important feature of Picnito PDF.

Every imported image must receive a visible sequence number.

Example:

| Sequence | Filename             | PDF page |
| -------: | -------------------- | -------: |
|        1 | IMG_20261101_001.jpg |        1 |
|        2 | IMG_20261101_002.jpg |        2 |
|        3 | IMG_20261101_003.jpg |        3 |
|        4 | IMG_20261101_004.jpg |        4 |
|        5 | IMG_20261101_005.jpg |        5 |

**Required functionality:**

- Drag-and-drop image reordering.
- Move image up/down.
- Move image to first/last position.
- Remove individual images.
- Display sequence numbers.
- Thumbnail previews.
- Display filename and image dimensions.
- Select multiple thumbnails.
- Rearrange multiple selected images together.
- Undo/redo ordering changes.
- Restore original import order.

**Important requirement:**

The PDF generation process must follow the final sequence displayed in the Image Sequence Manager.

It must never rely on file-picker selection order, filesystem enumeration order, or asynchronous processing completion order.

### 3.3 Automatic Sorting

Provide the following sorting options:

- Original import order.
- Filename ascending.
- Filename descending.
- Natural filename sorting.
- Date created.
- Date modified.
- Image dimensions.

Natural filename sorting must correctly handle:

`page-1.jpg, page-2.jpg, page-3.jpg, page-10.jpg`

It must not produce ordinary alphabetical ordering such as page-1, page-10, page-2.

Automatic sorting must not overwrite the user's manually customized order without confirmation.

---

## 4. PDF Page Customization

### 4.1 Paper Sizes

Users must be able to select standard international and North American paper sizes.

| Paper size | Dimensions (mm) | Dimensions (inches) |
| ---------- | --------------: | ------------------: |
| A0         |      841 × 1189 |       33.11 × 46.81 |
| A1         |       594 × 841 |       23.39 × 33.11 |
| A2         |       420 × 594 |       16.54 × 23.39 |
| A3         |       297 × 420 |       11.69 × 16.54 |
| A4         |       210 × 297 |        8.27 × 11.69 |
| A5         |       148 × 210 |         5.83 × 8.27 |
| A6         |       105 × 148 |         4.13 × 5.83 |
| B4         |       250 × 353 |        9.84 × 13.90 |
| B5         |       176 × 250 |         6.93 × 9.84 |
| Letter     |       216 × 279 |            8.5 × 11 |
| Legal      |       216 × 356 |            8.5 × 14 |
| Tabloid    |       279 × 432 |             11 × 17 |
| Executive  |       184 × 267 |         7.25 × 10.5 |

Additional options:

- Original image dimensions.
- Custom page size.

### 4.2 Custom Page Size

Users should be able to enter:

- Width.
- Height.
- Measurement unit: mm, cm, or inches.

The application must validate invalid dimensions and provide an appropriate error message.

### 4.3 Page Orientation

Supported options:

- Portrait.
- Landscape.
- Auto orientation.

Auto orientation should determine the best orientation for each image independently when enabled.

### 4.4 Image Placement

Users should be able to choose:

**Fit to page**

- Preserve the complete image.
- Maintain its aspect ratio.
- Leave unused space when necessary.

**Fill page**

- Fill the entire page.
- Allow cropping where necessary.
- Maintain the image's aspect ratio.

**Stretch to page**

- Fill the page dimensions exactly.
- Allow distortion.

### 4.5 Page Margins

Provide:

- No margins.
- Small margins.
- Medium margins.
- Custom margins.

Custom margin configuration should support top, bottom, left, and right values.

### 4.6 Page Background

Allow users to choose:

- White.
- Black.
- Custom background color.

---

## 5. Image Quality and Compression

Provide three initial presets:

| Preset       | Purpose                         |
| ------------ | ------------------------------- |
| High quality | Preserve image detail           |
| Balanced     | Balance quality and output size |
| Compressed   | Reduce PDF file size            |

Additional requirements:

- Configurable image resolution.
- Image resizing before embedding.
- JPEG compression where appropriate.
- Preserve transparency when supported.
- Avoid unnecessary recompression.
- Display estimated output size when feasible.

The application must not silently reduce image quality without the user's selected settings.

---

## 6. PDF Generation

### 6.1 Main Conversion Workflow

1. User imports images.
2. Application creates an ordered image collection.
3. User reviews and rearranges images.
4. User selects PDF settings.
5. User chooses the output location and filename.
6. Application starts PDF generation.
7. Application processes images sequentially.
8. Application finalizes the PDF.
9. User receives a success message and can open the output folder.

### 6.2 Processing Requirements

- Generate one PDF from the entire image collection.
- Preserve the exact final image sequence.
- Process images sequentially or with tightly controlled concurrency.
- Avoid loading all original image data into memory simultaneously.
- Use temporary files when necessary.
- Clean up temporary files after conversion.
- Handle errors without corrupting existing files.
- Never overwrite an existing PDF without confirmation.

### 6.3 Conversion Progress

Show meaningful progress information.

Example:

**Generating PDF...**

- Processed images: 85 / 165
- Progress: 51.5%
- Current operation: Processing image 85
- Estimated remaining time: Display only when reasonably calculable.

Allow users to cancel an active conversion safely.

---

## 7. Large File Handling

The application must be designed around the real-world requirement of converting 165 images totaling approximately 300–600 MB.

### Initial performance targets

| Metric                |         Target |
| --------------------- | -------------: |
| Image count           |           200+ |
| Total input size      |        600 MB+ |
| Individual image size | around 15 MB + |
| Output                |        One PDF |
| Processing            |          Local |
| Internet requirement  |           None |

These are target limits, subject to hardware testing.

### Memory management

- Do not load every original image into RAM.
- Use filesystem-based processing.
- Release image buffers after processing.
- Avoid unnecessarily retaining decoded image data.
- Handle low-disk-space conditions.
- Provide meaningful errors for insufficient memory or storage.

### Large file reliability

The application should:

- Validate available disk space before starting.
- Preserve original images.
- Allow users to cancel conversion.
- Remove temporary files after cancellation.
- Avoid leaving incomplete PDFs presented as successful output.

---

## 8. User Interface and Experience

### 8.1 Main Dashboard

The interface should contain:

- Application sidebar.
- Import images button.
- Drag-and-drop upload area.
- Image thumbnail grid.
- Image count.
- Total imported file size.
- Sorting controls.
- PDF settings panel.
- Generate PDF button.

### 8.2 Design Direction

**Visual style:** Modern, clean, minimal Windows desktop application.

Suggested design:

- Light and dark themes.
- Slate/zinc color palette.
- Subtle borders and shadows.
- Emerald accent color.
- Consistent spacing.
- Clear typography.
- Responsive thumbnail grid.

### 8.3 User Experience Requirements

- Keyboard shortcuts for common operations.
- Clear empty states.
- Confirmation before destructive actions.
- Visible processing progress.
- Helpful error messages.
- No unnecessary onboarding.
- Remember user preferences.

---

## 9. Technical Architecture

### 9.1 Technology Stack

| Technology       | Responsibility                  |
| ---------------- | ------------------------------- |
| Electron         | Desktop application framework   |
| React            | UI development                  |
| JavaScript       | Application logic               |
| Vite             | Frontend build tooling          |
| Sharp            | Image processing                |
| PDFKit           | PDF generation                  |
| Node.js          | Local filesystem and processing |
| Electron Builder | Windows application packaging   |

### 9.2 Architecture

**Renderer process**

- React UI.
- Image Sequence Manager.
- PDF configuration.
- Progress visualization.

**Electron main process**

- Window management.
- Secure IPC communication.
- Native file dialogs.
- File access coordination.

**Local processing layer**

- Image validation.
- Sharp transformations.
- Sequential PDF generation.
- Temporary file management.

### 9.3 Security

- Use Electron context isolation.
- Disable Node.js integration in the renderer.
- Use a preload script.
- Expose only necessary IPC methods.
- Validate all filesystem paths.
- Do not execute arbitrary user-provided code.
- Do not expose unrestricted filesystem access to the renderer.

### 9.4 Offline Requirements

All core features must work without:

- Internet access.
- User accounts.
- Remote APIs.
- Cloud storage.
- External conversion services.

The application must not upload user images anywhere.

---

## 10. Project Scope

### Phase 1 — MVP

- Electron application setup.
- React interface.
- Import multiple images.
- Thumbnail grid.
- Image Sequence Manager.
- Manual drag-and-drop reordering.
- A4, A3, A5, Letter, Legal and other standard paper sizes.
- Portrait and Landscape.
- Fit and Fill.
- Sequential PDF generation.
- Save PDF locally.

### Phase 2 — Advanced Features

- Custom page sizes.
- Advanced margins.
- Compression presets.
- Original image dimensions.
- Automatic sorting.
- Undo/redo.
- Multi-selection reordering.
- PDF preview.
- Keyboard shortcuts.

### Phase 3 — Optimization

- Large-batch performance testing.
- Memory optimization.
- Better progress reporting.
- Cancellation and recovery.
- Improved error handling.
- Windows installer.
- Application icon and metadata.

---

## 11. Acceptance Criteria

The application will be considered ready for its initial release when the following requirements are satisfied.

| ID    | Requirement           | Expected result                                  |
| ----- | --------------------- | ------------------------------------------------ |
| AC-01 | Import 165 images     | All images appear                                |
| AC-02 | Image reordering      | Manual order is preserved                        |
| AC-03 | PDF generation        | One PDF is produced                              |
| AC-04 | Page sequence         | Matches thumbnail sequence                       |
| AC-05 | Paper sizes           | Letter, Legal, A4, etc. work                     |
| AC-06 | Orientation           | Portrait and Landscape work                      |
| AC-07 | Custom dimensions     | User-defined dimensions work                     |
| AC-08 | Offline functionality | Works without internet                           |
| AC-09 | Large files           | 300–500 MB batch is supported on tested hardware |
| AC-10 | Memory management     | No unnecessary full-batch RAM loading            |
| AC-11 | Cancellation          | Temporary files are cleaned up                   |
| AC-12 | Output integrity      | Generated PDF opens successfully                 |

### Most important acceptance test

Import 165 randomly named images.

Manually arrange them into the desired sequence.

Generate one PDF.

Open the resulting PDF and verify that all 165 pages follow exactly the displayed thumbnail order.

The application must pass this test before release.

---

## 12. Out of Scope for Initial Release

To keep development focused, the first release will not include:

- PDF editing.
- PDF merging.
- PDF splitting.
- OCR.
- Cloud synchronization.
- Online accounts.
- PDF password protection.
- Image-to-Word conversion.
- Mobile application.

These may be considered in future releases.

---

## 13. Final Product Definition

Picnito PDF is an offline Windows application designed to make large-scale image-to-PDF conversion simple and reliable.

Its defining feature is not merely converting images into PDF files.

Its defining feature is **giving users complete control over image sequence and PDF page layout while processing large collections locally.**

### Product priorities

1. Correct image ordering.
2. Reliable large-batch conversion.
3. Flexible paper-size customization.
4. Offline processing.
5. Simple and intuitive interface.

**The primary success scenario:** A user selects 165 images totaling 300–500 MB, arranges them in the desired order, chooses A4 or Letter paper size, and generates one correctly ordered PDF without internet access.

---

**End of PRD — Picnito PDF v1.0**
