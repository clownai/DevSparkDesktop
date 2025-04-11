const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (options) => ipcRenderer.invoke('file:write', options),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  
  // Updates
  installUpdate: () => ipcRenderer.invoke('update:install'),
  
  // Receive messages from main process
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', () => callback());
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', () => callback());
  },
  onUncaughtException: (callback) => {
    ipcRenderer.on('uncaught-exception', (event, message) => callback(message));
  }
});

// Expose DevSpark IDE version
contextBridge.exposeInMainWorld('devsparkVersion', {
  version: '1.0.0'
});
