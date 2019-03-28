'use strict';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
const PSD = require('psd');
const path = require('path');
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 800
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initApp () {
  createWindow();
  registerIPC();
}

app.on('ready', initApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

const registerIPC = function () {
  ipcMain.on('open-directory-dialog', function (event, option) {
    dialog.showOpenDialog({
      properties: option.properties
    }, function (_files) {
      if (_files) {
        event.sender.send('selectItems', _files);
      }
    });
  });

  ipcMain.on('save-file', function (event, options) {
    let paths = options.filePath;
    let savePath = options.savePath;
    paths.map(item => {
      let arr = item.split('\\');
      let fileName = arr[arr.length - 1].split('.')[0];
      PSD.open(item).then(function (psd) {
        return psd.image.saveAsPng(path.join(savePath, `${fileName}.png`));
      }).then(function () {
        event.sender.send('finish', item);
      });
    });
  });
};
