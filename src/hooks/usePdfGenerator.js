import { useState, useEffect, useCallback } from 'react';

export function usePdfGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    currentFilename: '',
    estimatedRemainingSeconds: null,
  });
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Subscribe to progress events from Electron
  useEffect(() => {
    if (!window.electronAPI?.onPdfProgress) return;
    const unsubscribe = window.electronAPI.onPdfProgress((data) => {
      setProgress(data);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const generate = useCallback(async (images, settings, confirmOverwrite) => {
    if (!images || images.length === 0) {
      setError('Please add at least one image to generate a PDF.');
      return;
    }

    if (!window.electronAPI?.generatePdf) {
      setError(
        'Electron desktop APIs not detected. Please ensure you are running the desktop app with "npm run electron:dev".'
      );
      return;
    }

    try {
      setError(null);
      setResult(null);

      let savePath = null;
      let filename = (settings.outputFilename || 'Picnito_Document.pdf').trim();
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf';
      }

      // Check Save Mode: Custom Folder vs Prompt Dialog
      if (settings.saveMode === 'folder' && settings.outputFolder) {
        const folder = settings.outputFolder.replace(/[/\\]+$/, '');
        const sep = folder.includes('/') ? '/' : '\\';
        savePath = `${folder}${sep}${filename}`;

        // Check if file already exists
        if (window.electronAPI?.checkFileExists) {
          const exists = await window.electronAPI.checkFileExists(savePath);
          if (exists && typeof confirmOverwrite === 'function') {
            const confirmed = await confirmOverwrite(savePath);
            if (!confirmed) {
              return; // User declined overwrite
            }
          }
        }
      } else {
        // Prompt Save Dialog (starting with outputFolder if set)
        const defaultSaveTarget = settings.outputFolder
          ? `${settings.outputFolder.replace(/[/\\]+$/, '')}\\${filename}`
          : filename;

        savePath = await window.electronAPI.selectSavePath(defaultSaveTarget);
        if (!savePath) {
          // User cancelled save dialog
          return;
        }
      }

      setIsGenerating(true);
      setProgress({
        current: 0,
        total: images.length,
        percentage: 0,
        currentFilename: 'Initializing PDF document...',
        estimatedRemainingSeconds: null,
      });

      const response = await window.electronAPI.generatePdf({
        images,
        outputPath: savePath,
        paperSize: settings.paperSize,
        customDimensions: settings.customDimensions,
        orientation: settings.orientation,
        placement: settings.placement,
        margins: settings.margins,
        backgroundColor: settings.backgroundColor,
        qualityPreset: settings.qualityPreset,
      });

      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || 'Failed to generate PDF.');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      setError(err.message || 'An unexpected error occurred during conversion.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    try {
      if (window.electronAPI?.cancelPdf) {
        await window.electronAPI.cancelPdf();
      }
      setIsGenerating(false);
      setError('Conversion cancelled by user.');
    } catch (err) {
      console.error('Cancel error:', err);
    }
  }, []);

  const revealInFolder = useCallback(async (filePath) => {
    if (window.electronAPI?.revealInFolder) {
      await window.electronAPI.revealInFolder(filePath);
    }
  }, []);

  const openPdf = useCallback(async (filePath) => {
    if (window.electronAPI?.openFile) {
      await window.electronAPI.openFile(filePath);
    }
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setResult(null);
    setProgress({
      current: 0,
      total: 0,
      percentage: 0,
      currentFilename: '',
      estimatedRemainingSeconds: null,
    });
  }, []);

  return {
    isGenerating,
    progress,
    error,
    result,
    generate,
    cancel,
    revealInFolder,
    openPdf,
    resetState,
  };
}
