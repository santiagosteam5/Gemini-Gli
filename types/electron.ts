export interface ElectronAPI {
  // Window controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;

  // Command execution
  executeCommand: (command: string, cwd?: string) => Promise<{
    stdout?: string;
    stderr?: string;
    error?: string;
    cwd: string;
  }>;

  // File dialogs
  showOpenDialog: (options: any) => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  showFolderDialog: (options?: any) => Promise<{ canceled: boolean; filePaths: string[] }>;

  // File operations
  copyFile: (sourcePath: string, destinationDir: string, fileName: string) => Promise<{
    success: boolean;
    destinationPath?: string;
    fileName?: string;
    error?: string;
  }>;
  writeFile: (content: ArrayBuffer, destinationDir: string, fileName: string) => Promise<{
    success: boolean;
    destinationPath?: string;
    fileName?: string;
    error?: string;
  }>;
  readFile: (filePath: string) => Promise<{
    success: boolean;
    content?: string;
    size?: number;
    error?: string;
  }>;

  // Platform info
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
