"use client"

import { useEffect, useState } from 'react';

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<Window['electronAPI'] | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsElectron(true);
      setElectronAPI(window.electronAPI);
    }
  }, []);

  const minimizeWindow = () => electronAPI?.minimizeWindow();
  const maximizeWindow = () => electronAPI?.maximizeWindow();
  const closeWindow = () => electronAPI?.closeWindow();

  const executeCommand = async (command: string, cwd?: string) => {
    if (electronAPI) {
      return electronAPI.executeCommand(command, cwd);
    }
    // Fallback to API route for web version
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, cwd }),
    });
    return response.json();
  };

  const copyFile = async (sourcePath: string, destinationDir: string, fileName: string) => {
    if (electronAPI?.copyFile) {
      return electronAPI.copyFile(sourcePath, destinationDir, fileName);
    }
    throw new Error('File copying is only available in Electron');
  };

  const writeFile = async (content: ArrayBuffer, destinationDir: string, fileName: string) => {
    if (electronAPI?.writeFile) {
      return electronAPI.writeFile(content, destinationDir, fileName);
    }
    throw new Error('File writing is only available in Electron');
  };

  const readFile = async (filePath: string) => {
    if (electronAPI?.readFile) {
      return electronAPI.readFile(filePath);
    }
    throw new Error('File reading is only available in Electron');
  };

  return {
    isElectron,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    executeCommand,
    copyFile,
    writeFile,
    readFile,
    platform: electronAPI?.platform || 'web',
  };
}
