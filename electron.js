
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;

let backendProcess = null;

function startBackend() {
  // Ejecuta 'node backend/server.js'
  const backendPath = path.join(__dirname, "backend", "server.js");
  backendProcess = spawn(process.execPath, [backendPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      // Puedes incluir variables de entorno personalizadas aquí si es necesario
    },
  });

  backendProcess.on("exit", (code) => {
    console.log(`🛑 Backend process exited with code ${code}`);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // preload: path.join(__dirname, "preload.js"), // << Solo si necesitas comunicar main<->renderer
    },
    show: false
  });

  // Carga desde build de Vite o localhost si modo dev
  if (isDev) {
    win.loadURL("http://localhost:8080");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist/index.html"));
  }

  win.once("ready-to-show", () => win.show());

  // Enlaces externos abrirán en el navegador predeterminado
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// Inicia backend antes de crear la ventana
app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopBackend();
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Si la app es cerrada por cualquier razón, detenemos el backend
app.on("before-quit", () => {
  stopBackend();
});

