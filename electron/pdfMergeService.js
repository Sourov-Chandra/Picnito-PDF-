const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

class PdfMergeService {
  constructor() {
    this.isCancelled = false;
  }

  cancel() {
    this.isCancelled = true;
  }

  /**
   * Get metadata and page count for a list of PDF files
   */
  async getPdfDetails(filePaths) {
    const list = Array.isArray(filePaths) ? filePaths : [filePaths];
    const results = [];

    for (const fp of list) {
      try {
        if (!fs.existsSync(fp)) continue;
        const stat = fs.statSync(fp);
        const fileBuffer = fs.readFileSync(fp);
        
        // Load with ignoreEncryption to get info if possible
        const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();

        results.push({
          success: true,
          id: `${fp}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          path: fp,
          name: path.basename(fp),
          size: stat.size,
          pageCount,
          createdAt: stat.birthtimeMs || stat.ctimeMs,
          modifiedAt: stat.mtimeMs,
        });
      } catch (err) {
        console.error('Error reading PDF details for:', fp, err.message);
        const stat = fs.existsSync(fp) ? fs.statSync(fp) : { size: 0, birthtimeMs: 0, mtimeMs: 0 };
        results.push({
          success: false,
          id: `${fp}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          path: fp,
          name: path.basename(fp),
          size: stat.size || 0,
          pageCount: 0,
          error: err.message,
          createdAt: stat.birthtimeMs || 0,
          modifiedAt: stat.mtimeMs || 0,
        });
      }
    }

    return results;
  }

  /**
   * Merge multiple PDF files into one sequential output PDF
   */
  async merge({ pdfFiles, outputPath, onProgress = () => {} }) {
    this.isCancelled = false;

    if (!pdfFiles || pdfFiles.length < 2) {
      throw new Error('At least 2 PDF files are required to merge.');
    }

    const startTime = Date.now();
    const totalFiles = pdfFiles.length;

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const mergedDoc = await PDFDocument.create();
    let totalPagesMerged = 0;

    for (let i = 0; i < totalFiles; i++) {
      if (this.isCancelled) {
        throw new Error('PDF merge was cancelled by user.');
      }

      const item = pdfFiles[i];
      const filePath = item.path;

      if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }

      onProgress({
        current: i + 1,
        total: totalFiles,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
        currentFilename: path.basename(filePath),
      });

      const fileBytes = fs.readFileSync(filePath);
      const srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);

      for (const page of copiedPages) {
        mergedDoc.addPage(page);
        totalPagesMerged++;
      }
    }

    if (this.isCancelled) {
      throw new Error('PDF merge was cancelled by user.');
    }

    // Save final merged PDF
    const mergedPdfBytes = await mergedDoc.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    const elapsedSeconds = (Date.now() - startTime) / 1000;

    return {
      success: true,
      outputPath,
      totalFiles,
      totalPages: totalPagesMerged,
      elapsedSeconds,
    };
  }
}

module.exports = new PdfMergeService();
