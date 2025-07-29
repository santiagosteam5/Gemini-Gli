const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;

// Simple development check instead of electron-is-dev
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const execPromise = util.promisify(exec);

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Gemini Gli', // Set window title
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hidden', // Hide default title bar for custom window controls
    frame: false, // Remove default frame
    show: false, // Don't show until ready
    icon: path.join(__dirname, 'placeholder-logo.png'), // App icon
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for window controls
ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() || false;
});

// IPC handler for command execution (replaces API route)
ipcMain.handle('execute-command', async (event, { command, cwd }) => {
  // Ensure we resolve the working directory properly
  let resolvedCwd;
  if (cwd && cwd.trim() !== "") {
    // Handle tilde (~) expansion for user home directory
    if (cwd.startsWith('~')) {
      resolvedCwd = path.join(process.env.USERPROFILE || process.env.HOME || '', cwd.slice(1));
    } else {
      resolvedCwd = path.resolve(cwd);
    }
  } else {
    resolvedCwd = process.env.USERPROFILE || process.cwd();
  }

  console.log(`Executing command: ${command}`);
  console.log(`Working directory: ${resolvedCwd}`);

  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: resolvedCwd,
      timeout: 60000, // Increased timeout for longer Gemini responses
      maxBuffer: 1024 * 1024 * 10, // Increased buffer for large responses
      env: { 
        ...process.env,
        PWD: resolvedCwd,
        CD: resolvedCwd,
        HOME: process.env.USERPROFILE || process.env.HOME,
        // Ensure PATH includes common locations
        PATH: process.env.PATH + `;${process.env.USERPROFILE}\\AppData\\Local\\npm;${process.env.USERPROFILE}\\AppData\\Roaming\\npm`,
      },
      shell: true, // Use shell for better command resolution
      windowsHide: true, // Hide command window on Windows
    });

    const cleanedStdout = stdout
      .split("\n")
      .filter(line => !line.includes("Loaded cached credentials."))
      .join("\n")
      .trim();

    console.log(`Command completed successfully`);
    console.log(`Output length: ${cleanedStdout.length} characters`);

    return { 
      stdout: cleanedStdout, 
      stderr: stderr?.trim() || '', 
      cwd: resolvedCwd 
    };
  } catch (error) {
    console.log(`Command failed with error: ${error.message}`);
    console.log(`Error code: ${error.code}`);
    console.log(`Signal: ${error.signal}`);
    
    // Check if we got output even though the command was killed/timed out
    if (error.stdout && error.stdout.length > 0) {
      const cleanedStdout = error.stdout
        .split("\n")
        .filter(line => !line.includes("Loaded cached credentials."))
        .join("\n")
        .trim();
      
      console.log(`Partial output recovered: ${cleanedStdout.length} characters`);
      
      return {
        stdout: cleanedStdout,
        stderr: error.stderr?.trim() || '',
        cwd: resolvedCwd,
        warning: 'Response may be incomplete due to timeout or process termination'
      };
    }
    
    return {
      error: error.message,
      stderr: error.stderr || null,
      stdout: error.stdout || null,
      cwd: resolvedCwd,
    };
  }
});

// IPC handler for file dialogs
ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// IPC handler for folder selection
ipcMain.handle('show-folder-dialog', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Working Directory',
    defaultPath: options.defaultPath || process.env.USERPROFILE || process.cwd(),
    ...options
  });
  return result;
});

// IPC handler for file copying
ipcMain.handle('copy-file', async (event, { sourcePath, destinationDir, fileName }) => {
  try {
    // Ensure destination directory exists
    await fs.mkdir(destinationDir, { recursive: true });
    
    // Create destination path
    const destinationPath = path.join(destinationDir, fileName);
    
    // Copy the file
    await fs.copyFile(sourcePath, destinationPath);
    
    console.log(`File copied: ${sourcePath} -> ${destinationPath}`);
    
    return {
      success: true,
      destinationPath,
      fileName
    };
  } catch (error) {
    console.error(`Failed to copy file: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
});

// IPC handler for writing file content directly (for files without path access)
ipcMain.handle('write-file', async (event, { content, destinationDir, fileName }) => {
  try {
    // Ensure destination directory exists
    await fs.mkdir(destinationDir, { recursive: true });
    
    // Create destination path
    const destinationPath = path.join(destinationDir, fileName);
    
    // Write the file content
    await fs.writeFile(destinationPath, Buffer.from(content));
    
    console.log(`File written: ${destinationPath}`);
    
    return {
      success: true,
      destinationPath,
      fileName
    };
  } catch (error) {
    console.error(`Failed to write file: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
});

// IPC handler for reading file content (for small text files)
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    
    // Limit file size to 1MB for safety
    if (stats.size > 1024 * 1024) {
      return {
        success: false,
        error: 'File is too large to read (>1MB)'
      };
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    
    return {
      success: true,
      content,
      size: stats.size
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});
