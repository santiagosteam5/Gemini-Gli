const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  isWindowMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Command execution (replaces API calls)
  executeCommand: (command, cwd) => ipcRenderer.invoke('execute-command', { command, cwd }),

  // File dialogs
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showFolderDialog: (options) => ipcRenderer.invoke('show-folder-dialog', options),

  // File operations
  copyFile: (sourcePath, destinationDir, fileName) => ipcRenderer.invoke('copy-file', { sourcePath, destinationDir, fileName }),
  writeFile: (content, destinationDir, fileName) => ipcRenderer.invoke('write-file', { content, destinationDir, fileName }),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

  // Platform info
  platform: process.platform,
  isElectron: true,
});
