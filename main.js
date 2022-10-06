const { app, BrowserWindow } = require("electron");
app.disableHardwareAcceleration();
const path = require("path");
const remote = require("@electron/remote/main");
remote.initialize();
const ElectronStore = require("electron-store");
ElectronStore.initRenderer();

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  return win;
};

app.whenReady().then(() => {
  const win = createWindow();

  remote.enable(win.webContents);

  win.loadFile("index.html");
  win.maximize();
  win.webContents.openDevTools();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
