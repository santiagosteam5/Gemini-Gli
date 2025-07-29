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

  return {
    isElectron,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    executeCommand,
    platform: electronAPI?.platform || 'web',
  };
}
