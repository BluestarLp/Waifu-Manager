const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const URL = require('url').URL;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 650,
    minHeight: 550,
    icon: path.join(__dirname, 'images/icon.png'),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname,'preload.js'),
      contextIsolation: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  ipcMain.on('devTools', () => {
    mainWindow.webContents.openDevTools();
  })

  //Event Listeners

  mainWindow.on('maximize', () => {   
    mainWindow.webContents.send('IsMaximized');
  })
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('IsUnmaximized');
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//Sicherheit!

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    if (parsedUrl.origin !== 'https://example.com') {
      event.preventDefault()
    }
  })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


/*---------------------------------------------
  Eigene Dinge
-----------------------------------------------*/

//Script Kommunikation

ipcMain.on('quit', () => {
  app.quit();
})

ipcMain.on('maximize', () => {
  mainWindow.maximize();
})

ipcMain.on('unmaximize', () => {
  mainWindow.unmaximize();
})

ipcMain.on('minimize', () => {
  mainWindow.minimize();
})

ipcMain.on('Neustart', () => {
  app.relaunch();
  app.quit();
})