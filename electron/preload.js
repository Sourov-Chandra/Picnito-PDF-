const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File Dialogs
  selectFiles: () => ipcRenderer.invoke('dialog:select-files'),
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  selectSavePath: (defaultName) => ipcRenderer.invoke('dialog:select-save-path', defaultName),

  // Image Processing / Metadata
  getImageDetails: (filePaths) => ipcRenderer.invoke('image:get-details', filePaths),

  // PDF Generation Pipeline
  generatePdf: (params) => ipcRenderer.invoke('pdf:generate', params),
  cancelPdf: () => ipcRenderer.invoke('pdf:cancel'),

  // Event Listeners for PDF generation progress
  onPdfProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('pdf:progress', handler);
    return () => ipcRenderer.removeListener('pdf:progress', handler);
  },

  // System & Shell
  revealInFolder: (filePath) => ipcRenderer.invoke('shell:reveal', filePath),
  openFile: (filePath) => ipcRenderer.invoke('shell:open-file', filePath),
});
