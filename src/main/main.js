const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const { createMenu } = require('./menu');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

// Development mode flag
const isDev = process.argv.includes('--dev');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    show: false, // Don't show until ready-to-show
    icon: path.join(__dirname, '../../assets/icons/png/512x512.png')
  });

  // Load the index.html of the app
  if (isDev) {
    // In development mode, load from local server
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    
    // Open DevTools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production mode, load the bundled app
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready to show (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check for updates after the app is shown
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  // Set up the application menu
  const menu = createMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for communication with renderer process

// Open file dialog
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'js', 'html', 'css', 'json', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled) {
    return null;
  } else {
    try {
      const content = fs.readFileSync(filePaths[0], 'utf8');
      return {
        filePath: filePaths[0],
        content: content
      };
    } catch (err) {
      log.error('Failed to read file:', err);
      return null;
    }
  }
});

// Open folder dialog
ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (canceled) {
    return null;
  } else {
    try {
      const folderPath = filePaths[0];
      const files = listFilesInDirectory(folderPath);
      return {
        folderPath: folderPath,
        files: files
      };
    } catch (err) {
      log.error('Failed to read directory:', err);
      return null;
    }
  }
});

// Save file dialog
ipcMain.handle('dialog:saveFile', async (event, { defaultPath, content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultPath,
    filters: [
      { name: 'Text Files', extensions: ['txt', 'js', 'html', 'css', 'json', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled) {
    return false;
  } else {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (err) {
      log.error('Failed to save file:', err);
      return false;
    }
  }
});

// Read file content
ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (err) {
    log.error('Failed to read file:', err);
    return null;
  }
});

// Write file content
ipcMain.handle('file:write', async (event, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    log.error('Failed to write file:', err);
    return false;
  }
});

// List files in directory
function listFilesInDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  const files = entries.map(entry => {
    const fullPath = path.join(dirPath, entry.name);
    const isDirectory = entry.isDirectory();
    
    return {
      name: entry.name,
      path: fullPath,
      isDirectory: isDirectory,
      children: isDirectory ? [] : undefined // Placeholder for lazy loading
    };
  });
  
  return files;
}

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall();
});

// Open external links
ipcMain.handle('shell:openExternal', (event, url) => {
  shell.openExternal(url);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  
  if (mainWindow) {
    mainWindow.webContents.send('uncaught-exception', error.message);
  }
});
