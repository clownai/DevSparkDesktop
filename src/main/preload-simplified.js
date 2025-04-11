const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  
  // Receive messages from main process
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu:newFile', () => callback('newFile'));
    ipcRenderer.on('menu:openFile', () => callback('openFile'));
    ipcRenderer.on('menu:save', () => callback('save'));
  }
});

// Expose DevSpark IDE version
contextBridge.exposeInMainWorld('devsparkVersion', {
  version: '1.0.0'
});
