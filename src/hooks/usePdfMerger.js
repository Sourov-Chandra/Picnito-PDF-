import { useState, useEffect, useCallback } from 'react';
import { formatFileSize } from '../utils/formatters';

export function usePdfMerger() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    currentFilename: '',
  });
  const [mergeError, setMergeError] = useState(null);
  const [mergeResult, setMergeResult] = useState(null);

  // Subscribe to progress events from Electron
  useEffect(() => {
    if (!window.electronAPI?.onPdfMergeProgress) return;
    const unsubscribe = window.electronAPI.onPdfMergeProgress((data) => {
      setMergeProgress(data);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const addPdfs = useCallback((newItems) => {
    if (!newItems || !newItems.length) return;
    setPdfFiles((prev) => {
      // Append unique items
      const existingPaths = new Set(prev.map((p) => p.path));
      const filtered = newItems.filter((item) => !existingPaths.has(item.path));
      return [...prev, ...filtered];
    });
  }, []);

  const removePdf = useCallback((id) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllPdfs = useCallback(() => {
    setPdfFiles([]);
  }, []);

  const movePdf = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setPdfFiles((prev) => {
      const list = [...prev];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return list;
    });
  }, []);

  const movePdfOffset = useCallback((index, offset) => {
    const target = index + offset;
    setPdfFiles((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const list = [...prev];
      const [removed] = list.splice(index, 1);
      list.splice(target, 0, removed);
      return list;
    });
  }, []);

  const movePdfToFirst = useCallback((index) => {
    if (index === 0) return;
    setPdfFiles((prev) => {
      const list = [...prev];
      const [removed] = list.splice(index, 1);
      list.unshift(removed);
      return list;
    });
  }, []);

  const movePdfToLast = useCallback((index) => {
    setPdfFiles((prev) => {
      if (index === prev.length - 1) return prev;
      const list = [...prev];
      const [removed] = list.splice(index, 1);
      list.push(removed);
      return list;
    });
  }, []);

  const merge = useCallback(async (settings, confirmOverwrite) => {
    if (pdfFiles.length < 2) {
      setMergeError('Please select at least 2 PDF files to merge into one.');
      return;
    }

    if (!window.electronAPI?.mergePdfs) {
      setMergeError('Electron PDF merge API is not available.');
      return;
    }

    try {
      setMergeError(null);
      setMergeResult(null);

      let savePath = null;
      let filename = (settings.outputFilename || 'Merged_Picnito.pdf').trim();
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf';
      }

      // Check Save Mode
      if (!settings.askEachTime && settings.outputFolder) {
        const folder = settings.outputFolder.replace(/[/\\]+$/, '');
        const sep = folder.includes('/') ? '/' : '\\';
        savePath = `${folder}${sep}${filename}`;

        if (window.electronAPI?.checkFileExists) {
          const exists = await window.electronAPI.checkFileExists(savePath);
          if (exists && typeof confirmOverwrite === 'function') {
            const confirmed = await confirmOverwrite(savePath);
            if (!confirmed) return;
          }
        }
      } else {
        const defaultSaveTarget = settings.outputFolder
          ? `${settings.outputFolder.replace(/[/\\]+$/, '')}\\${filename}`
          : filename;

        savePath = await window.electronAPI.selectSavePath(defaultSaveTarget);
        if (!savePath) return; // User cancelled
      }

      setIsMerging(true);
      setMergeProgress({
        current: 0,
        total: pdfFiles.length,
        percentage: 0,
        currentFilename: 'Initializing PDF merger...',
      });

      const response = await window.electronAPI.mergePdfs({
        pdfFiles,
        outputPath: savePath,
      });

      if (response.success) {
        setMergeResult(response);
      } else {
        setMergeError(response.error || 'Failed to merge PDF files.');
      }
    } catch (err) {
      console.error('Merge error:', err);
      setMergeError(err.message || 'An error occurred while merging PDFs.');
    } finally {
      setIsMerging(false);
    }
  }, [pdfFiles]);

  const cancel = useCallback(async () => {
    try {
      if (window.electronAPI?.cancelPdfMerge) {
        await window.electronAPI.cancelPdfMerge();
      }
      setIsMerging(false);
      setMergeError('Merge cancelled by user.');
    } catch (err) {
      console.error('Cancel merge error:', err);
    }
  }, []);

  const resetMergeState = useCallback(() => {
    setMergeError(null);
    setMergeResult(null);
    setMergeProgress({
      current: 0,
      total: 0,
      percentage: 0,
      currentFilename: '',
    });
  }, []);

  const totalFiles = pdfFiles.length;
  const totalPages = pdfFiles.reduce((acc, item) => acc + (item.pageCount || 0), 0);
  const totalBytes = pdfFiles.reduce((acc, item) => acc + (item.size || 0), 0);
  const formattedTotalSize = formatFileSize(totalBytes);

  return {
    pdfFiles,
    isMerging,
    mergeProgress,
    mergeError,
    mergeResult,
    addPdfs,
    removePdf,
    clearAllPdfs,
    movePdf,
    movePdfOffset,
    movePdfToFirst,
    movePdfToLast,
    merge,
    cancel,
    resetMergeState,
    totalFiles,
    totalPages,
    totalBytes,
    formattedTotalSize,
  };
}
