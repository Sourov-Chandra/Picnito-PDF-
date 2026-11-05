const fs = require('fs');
const path = require('path');
const os = require('os');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');

// Disable Sharp file caching on Windows to avoid file locks
sharp.cache(false);

class PdfService {
  constructor() {
    this.isCancelled = false;
    this.activeDoc = null;
    this.activeStream = null;
    this.activeOutputPath = null;
    this.tempFiles = new Set();
  }

  cancel() {
    this.isCancelled = true;
    if (this.activeDoc) {
      try {
        this.activeDoc.end();
      } catch (e) {
        // Ignore end errors on cancellation
      }
    }
    if (this.activeStream) {
      try {
        this.activeStream.destroy();
      } catch (e) {
        // Ignore destroy error
      }
    }
    this.cleanupTempFiles();
    if (this.activeOutputPath && fs.existsSync(this.activeOutputPath)) {
      try {
        fs.unlinkSync(this.activeOutputPath);
      } catch (e) {
        // File may be locked briefly
      }
    }
  }

  cleanupTempFiles() {
    for (const file of this.tempFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        console.error('Error removing temp file:', file, err);
      }
    }
    this.tempFiles.clear();
  }

  /**
   * Main PDF generation pipeline
   */
  async generate({
    images,
    outputPath,
    paperSize = 'A4',
    customDimensions = null, // { widthPt, heightPt }
    orientation = 'portrait', // portrait | landscape | auto
    placement = 'fit', // fit | fill | stretch
    margins = { top: 0, right: 0, bottom: 0, left: 0 },
    backgroundColor = '#ffffff',
    qualityPreset = 'balanced', // high | balanced | compressed
    onProgress = () => {},
  }) {
    this.isCancelled = false;
    this.activeOutputPath = outputPath;
    this.tempFiles.clear();

    const totalImages = images.length;
    if (totalImages === 0) {
      throw new Error('No images provided for PDF generation');
    }

    const startTime = Date.now();

    // Prepare write stream
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure destination folder exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outStream = fs.createWriteStream(outputPath);
        this.activeStream = outStream;

        // Create PDF document with autoFirstPage: false so we control the first page size/orientation
        const doc = new PDFDocument({
          autoFirstPage: false,
          compress: true,
          info: {
            Title: path.basename(outputPath, '.pdf'),
            Creator: 'Picnito PDF (Offline Windows Application)',
          },
        });
        this.activeDoc = doc;

        doc.pipe(outStream);

        outStream.on('error', (err) => {
          this.cleanupTempFiles();
          reject(err);
        });

        outStream.on('finish', () => {
          this.cleanupTempFiles();
          if (this.isCancelled) {
            reject(new Error('PDF generation was cancelled by the user.'));
          } else {
            resolve({
              outputPath,
              totalImages,
              elapsedSeconds: (Date.now() - startTime) / 1000,
            });
          }
        });

        // Sequential processing loop
        for (let i = 0; i < totalImages; i++) {
          if (this.isCancelled) {
            doc.end();
            return;
          }

          const imgItem = images[i];
          const imgPath = imgItem.path;

          // Notify progress
          const currentProgress = {
            current: i + 1,
            total: totalImages,
            percentage: Math.round(((i + 1) / totalImages) * 100),
            currentFilename: path.basename(imgPath),
            estimatedRemainingSeconds:
              i > 0
                ? ((Date.now() - startTime) / i) * (totalImages - i) / 1000
                : null,
          };
          onProgress(currentProgress);

          // Process and embed single image
          await this.processAndEmbedImage(doc, imgItem, {
            paperSize,
            customDimensions,
            orientation,
            placement,
            margins,
            backgroundColor,
            qualityPreset,
          });
        }

        // Finalize PDF
        doc.end();
      } catch (err) {
        this.cleanupTempFiles();
        if (this.activeOutputPath && fs.existsSync(this.activeOutputPath)) {
          try {
            fs.unlinkSync(this.activeOutputPath);
          } catch (e) {}
        }
        reject(err);
      }
    });
  }

  /**
   * Process a single image through Sharp (if needed) and embed into PDFKit doc
   */
  async processAndEmbedImage(
    doc,
    imgItem,
    { paperSize, customDimensions, orientation, placement, margins, backgroundColor, qualityPreset }
  ) {
    const rawPath = imgItem.path;
    if (!fs.existsSync(rawPath)) {
      throw new Error(`File does not exist: ${rawPath}`);
    }

    // Read metadata and auto-rotate according to EXIF orientation
    let sharpInstance = sharp(rawPath).rotate();
    let meta = await sharpInstance.metadata();

    let imgWidth = meta.width || 800;
    let imgHeight = meta.height || 600;

    // Calculate Page Size (points)
    let pageW = 595.28; // default A4
    let pageH = 841.89;

    if (paperSize === 'original') {
      pageW = imgWidth * (72 / 96);
      pageH = imgHeight * (72 / 96);
    } else if (paperSize === 'custom' && customDimensions) {
      pageW = customDimensions.widthPt || 595.28;
      pageH = customDimensions.heightPt || 841.89;
    } else {
      const standardSizes = {
        A0: [2383.94, 3370.39],
        A1: [1683.78, 2383.94],
        A2: [1190.55, 1683.78],
        A3: [841.89, 1190.55],
        A4: [595.28, 841.89],
        A5: [419.53, 595.28],
        A6: [297.64, 419.53],
        B4: [708.66, 1000.63],
        B5: [498.90, 708.66],
        Letter: [612, 792],
        Legal: [612, 1008],
        Tabloid: [792, 1224],
        Executive: [522, 756],
      };
      if (standardSizes[paperSize]) {
        [pageW, pageH] = standardSizes[paperSize];
      }
    }

    // Calculate effective page orientation
    let effectiveOrientation = orientation;
    if (orientation === 'auto') {
      effectiveOrientation = imgWidth >= imgHeight ? 'landscape' : 'portrait';
    }

    if (effectiveOrientation === 'landscape') {
      if (pageW < pageH) {
        const temp = pageW;
        pageW = pageH;
        pageH = temp;
      }
    } else if (effectiveOrientation === 'portrait') {
      if (pageW > pageH) {
        const temp = pageW;
        pageW = pageH;
        pageH = temp;
      }
    }

    // Add new page to PDFKit document
    doc.addPage({
      size: [pageW, pageH],
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    // Draw background color if not pure transparent
    if (backgroundColor && backgroundColor !== 'transparent') {
      doc.save();
      doc.rect(0, 0, pageW, pageH).fill(backgroundColor);
      doc.restore();
    }

    // Calculate content area respecting margins
    const mTop = margins?.top || 0;
    const mRight = margins?.right || 0;
    const mBottom = margins?.bottom || 0;
    const mLeft = margins?.left || 0;

    const printableW = Math.max(10, pageW - mLeft - mRight);
    const printableH = Math.max(10, pageH - mTop - mBottom);

    // Prepare Image Buffer or converted JPEG file
    // Check compression & dimension downsampling according to preset
    let targetFormat = 'jpeg';
    let jpegQuality = 85;
    let maxDim = 3000;

    if (qualityPreset === 'high') {
      jpegQuality = 95;
      maxDim = 4000;
    } else if (qualityPreset === 'balanced') {
      jpegQuality = 82;
      maxDim = 2500;
    } else if (qualityPreset === 'compressed') {
      jpegQuality = 65;
      maxDim = 1800;
    }

    let needsTransform = false;
    const ext = path.extname(rawPath).toLowerCase();

    // Check if resize needed
    if (imgWidth > maxDim || imgHeight > maxDim) {
      sharpInstance = sharpInstance.resize({
        width: imgWidth > imgHeight ? maxDim : undefined,
        height: imgHeight >= imgWidth ? maxDim : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });
      needsTransform = true;
    }

    // Non-JPG or compressed preset always converts to optimized JPEG buffer
    if (ext !== '.jpg' && ext !== '.jpeg') {
      needsTransform = true;
    } else if (qualityPreset !== 'high') {
      needsTransform = true;
    }

    let imageToEmbed;
    let tempFilePath = null;

    if (needsTransform) {
      // Export to temporary file or buffer
      const tempId = `picnito_temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      tempFilePath = path.join(os.tmpdir(), tempId);
      await sharpInstance.jpeg({ quality: jpegQuality, mozjpeg: true }).toFile(tempFilePath);
      this.tempFiles.add(tempFilePath);
      imageToEmbed = tempFilePath;

      // Update dimensions after transform
      const transformedMeta = await sharp(tempFilePath).metadata();
      imgWidth = transformedMeta.width || imgWidth;
      imgHeight = transformedMeta.height || imgHeight;
    } else {
      imageToEmbed = rawPath;
    }

    // Calculate placement (Fit, Fill, Stretch)
    let drawX = mLeft;
    let drawY = mTop;
    let drawW = printableW;
    let drawH = printableH;

    const imgAspect = imgWidth / imgHeight;
    const printableAspect = printableW / printableH;

    if (placement === 'fit') {
      if (imgAspect > printableAspect) {
        drawW = printableW;
        drawH = printableW / imgAspect;
        drawY = mTop + (printableH - drawH) / 2;
      } else {
        drawH = printableH;
        drawW = printableH * imgAspect;
        drawX = mLeft + (printableW - drawW) / 2;
      }

      doc.image(imageToEmbed, drawX, drawY, { width: drawW, height: drawH });
    } else if (placement === 'stretch') {
      // Direct fit without aspect ratio preservation
      doc.image(imageToEmbed, mLeft, mTop, { width: printableW, height: printableH });
    } else if (placement === 'fill') {
      // Fill entire printable area with clipping
      doc.save();
      doc.rect(mLeft, mTop, printableW, printableH).clip();

      if (imgAspect > printableAspect) {
        // Image is wider than printable area: fit height, center horizontally
        drawH = printableH;
        drawW = printableH * imgAspect;
        drawX = mLeft + (printableW - drawW) / 2;
        drawY = mTop;
      } else {
        // Image is taller than printable area: fit width, center vertically
        drawW = printableW;
        drawH = printableW / imgAspect;
        drawX = mLeft;
        drawY = mTop + (printableH - drawH) / 2;
      }

      doc.image(imageToEmbed, drawX, drawY, { width: drawW, height: drawH });
      doc.restore();
    }

    // Immediate cleanup of single temp file if created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        this.tempFiles.delete(tempFilePath);
      } catch (e) {
        // will be cleaned up in cleanupTempFiles
      }
    }
  }
}

module.exports = new PdfService();
