const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const pdfService = require('./pdfService');

// Disable Sharp file caching on Windows to avoid file locks
sharp.cache(false);

// Register custom protocol for local image loading
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'picnito-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

let mainWindow = null;

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif']);

function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS.has(ext);
}

function scanFolderForImages(dirPath) {
  const results = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile() && isImageFile(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.error('Error scanning folder:', err);
  }
  return results;
}

async function getImageMetadata(filePath) {
  try {
    const stat = fs.statSync(filePath);
    const meta = await sharp(filePath).metadata();
    return {
      success: true,
      path: filePath,
      name: path.basename(filePath),
      size: stat.size,
      width: meta.width || 0,
      height: meta.height || 0,
      format: meta.format || path.extname(filePath).replace('.', ''),
      createdAt: stat.birthtimeMs || stat.ctimeMs,
      modifiedAt: stat.mtimeMs,
    };
  } catch (err) {
    console.error(`Failed to read metadata for ${filePath}:`, err.message);
    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : { size: 0, birthtimeMs: 0, mtimeMs: 0 };
    return {
      success: false,
      path: filePath,
      name: path.basename(filePath),
      size: stat.size || 0,
      width: 0,
      height: 0,
      format: path.extname(filePath).replace('.', ''),
      createdAt: stat.birthtimeMs || 0,
      modifiedAt: stat.mtimeMs || 0,
      error: err.message,
    };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: 'Picnito PDF',
    backgroundColor: '#09090b', // zinc-950
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devServerUrl).catch(() => {
      // In case dev server is still starting up, retry briefly
      setTimeout(() => mainWindow.loadURL(devServerUrl), 1000);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Remove default menu for a clean desktop application experience
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  // Setup local image protocol handler
  protocol.handle('picnito-media', (request) => {
    try {
      // Decode URL format picnito-media://path/to/file
      const rawUrl = request.url.replace(/^picnito-media:\/\/+/, '');
      const decodedPath = decodeURIComponent(rawUrl);
      const normalizedPath = path.normalize(decodedPath);
      return net.fetch(`file:///${normalizedPath.replace(/\\/g, '/')}`);
    } catch (err) {
      console.error('Protocol handle error:', err);
      return new Response('Not Found', { status: 404 });
    }
  });

  // Setup IPC Handlers
  ipcMain.handle('dialog:select-files', async () => {
    if (!mainWindow) return [];
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Images to Add',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'tif'],
        },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePaths.length) return [];
    return result.filePaths;
  });

  ipcMain.handle('dialog:select-folder', async () => {
    if (!mainWindow) return [];
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Folder with Images',
      properties: ['openDirectory'],
    });

    if (result.canceled || !result.filePaths.length) return [];
    const folderPath = result.filePaths[0];
    return scanFolderForImages(folderPath);
  });

  ipcMain.handle('dialog:select-save-path', async (_event, defaultName) => {
    if (!mainWindow) return null;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Generated PDF',
      defaultPath: defaultName || 'Picnito_Document.pdf',
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
    });

    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  });

  ipcMain.handle('image:get-details', async (_event, filePaths) => {
    const list = Array.isArray(filePaths) ? filePaths : [filePaths];
    const details = [];
    for (const fp of list) {
      const data = await getImageMetadata(fp);
      details.push(data);
    }
    return details;
  });

  ipcMain.handle('pdf:generate', async (_event, options) => {
    try {
      const result = await pdfService.generate({
        ...options,
        onProgress: (progress) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('pdf:progress', progress);
          }
        },
      });
      return { success: true, ...result };
    } catch (error) {
      console.error('PDF generation error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pdf:cancel', async () => {
    pdfService.cancel();
    return { success: true };
  });

  ipcMain.handle('shell:reveal', async (_event, filePath) => {
    if (fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('shell:open-file', async (_event, filePath) => {
    if (fs.existsSync(filePath)) {
      await shell.openPath(filePath);
      return true;
    }
    return false;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
