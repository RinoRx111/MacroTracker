const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow;
let backendProcess;
const PORT = 8000;
const HOST = '127.0.0.1';
const APP_URL = `http://${HOST}:${PORT}`;

const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');

// Restore window state
function restoreWindowState() {
  try {
    if (fs.existsSync(stateFilePath)) {
      return JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load window state:', e);
  }
  return { width: 1280, height: 800 };
}

// Save window state
function saveWindowState(window) {
  try {
    const bounds = window.getBounds();
    fs.writeFileSync(stateFilePath, JSON.stringify(bounds), 'utf8');
  } catch (e) {
    console.error('Failed to save window state:', e);
  }
}

// Get Python executable path from virtualenv if available
function getPythonPath() {
  const isWin = process.platform === 'win32';
  const venvPath = isWin
    ? path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe')
    : path.join(__dirname, '..', '.venv', 'bin', 'python');
  
  if (fs.existsSync(venvPath)) {
    return venvPath;
  }
  return isWin ? 'python' : 'python3';
}

// Start the python backend server
function startBackend() {
  const isPackaged = app.isPackaged;
  
  // Define executable paths
  const devPath = path.join(__dirname, '..', 'backend', 'run.py');
  const prodExePath = isPackaged
    ? path.join(process.resourcesPath, 'backend_server.exe')
    : path.join(__dirname, '..', 'backend', 'dist', 'backend_server.exe');
  
  let backendPath = devPath;
  let useExe = false;

  // Prefer backend_server.exe if it exists
  if (fs.existsSync(prodExePath)) {
    backendPath = prodExePath;
    useExe = true;
  }

  console.log(`Starting backend from: ${backendPath}`);

  if (useExe) {
    backendProcess = spawn(backendPath, [], {
      cwd: path.dirname(backendPath),
    });
  } else {
    const pythonCmd = getPythonPath();
    console.log(`Using Python executable: ${pythonCmd}`);
    backendProcess = spawn(pythonCmd, [backendPath], {
      cwd: path.dirname(backendPath),
    });
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Check if uvicorn server is responsive
function checkBackendReady(callback) {
  let finished = false;
  const req = http.get(`${APP_URL}/health`, (res) => {
    if (finished) return;
    if (res.statusCode === 200) {
      finished = true;
      callback();
    } else {
      finished = true;
      setTimeout(() => checkBackendReady(callback), 200);
    }
  });

  // Set a timeout of 1000ms to prevent request hanging indefinitely
  req.setTimeout(1000, () => {
    if (finished) return;
    finished = true;
    req.destroy();
    setTimeout(() => checkBackendReady(callback), 200);
  });

  req.on('error', () => {
    if (finished) return;
    finished = true;
    setTimeout(() => checkBackendReady(callback), 200);
  });
}

function createWindow() {
  const state = restoreWindowState();

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: fs.existsSync(path.join(__dirname, 'dist', 'favicon.ico'))
      ? path.join(__dirname, 'dist', 'favicon.ico')
      : undefined,
  });

  // Hide the standard menu bar for chromeless application container look
  mainWindow.setMenuBarVisibility(false);

  // Load backend app URL
  mainWindow.loadURL(APP_URL);

  mainWindow.on('close', () => {
    saveWindowState(mainWindow);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // 1. Start uvicorn background process
  startBackend();

  // 2. Poll health endpoint, then render browser window
  checkBackendReady(() => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    console.log('Terminating backend process...');
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
