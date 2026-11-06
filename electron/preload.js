const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File Dialogs
  selectFiles: () => ipcRenderer.invoke('dialog:select-files'),
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  selectPdfFiles: () => ipcRenderer.invoke('dialog:select-pdf-files'),
  selectOutputFolder: () => ipcRenderer.invoke('dialog:select-output-folder'),
  selectSavePath: (defaultName) => ipcRenderer.invoke('dialog:select-save-path', defaultName),

  // System Paths & File Queries
  getDefaultPaths: () => ipcRenderer.invoke('app:get-default-paths'),
  checkFileExists: (filePath) => ipcRenderer.invoke('file:check-exists', filePath),

  // Image Processing / Metadata
  getImageDetails: (filePaths) => ipcRenderer.invoke('image:get-details', filePaths),

  // PDF Generation Pipeline
  generatePdf: (params) => ipcRenderer.invoke('pdf:generate', params),
  cancelPdf: () => ipcRenderer.invoke('pdf:cancel'),

  // PDF Merge Pipeline
  getPdfDetails: (filePaths) => ipcRenderer.invoke('pdf:get-details', filePaths),
  mergePdfs: (options) => ipcRenderer.invoke('pdf:merge', options),
  cancelPdfMerge: () => ipcRenderer.invoke('pdf:cancel-merge'),

  // Event Listeners for PDF generation progress
  onPdfProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('pdf:progress', handler);
    return () => ipcRenderer.removeListener('pdf:progress', handler);
  },

  // Event Listeners for PDF merge progress
  onPdfMergeProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('pdf:merge-progress', handler);
    return () => ipcRenderer.removeListener('pdf:merge-progress', handler);
  },

  // System & Shell
  revealInFolder: (filePath) => ipcRenderer.invoke('shell:reveal', filePath),
  openFile: (filePath) => ipcRenderer.invoke('shell:open-file', filePath),
});
