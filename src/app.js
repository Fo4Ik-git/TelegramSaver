const {app, BrowserWindow} = require('electron');
const path = require('path');

let appWindow;

function createWindow() {
  appWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // const indexPath = path.join(__dirname, '..', 'dist/telegram-saver/browser/index.html');
  const indexPath = path.join(__dirname, '/index.html');
  // appWindow.setMenu(null);
  appWindow.loadURL('file://' + indexPath);
  /*appWindow.loadURL(
    url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true
    })
  );*/

  appWindow.openDevTools();

  // let load = `file://${__dirname}/index.html`
  // appWindow.loadURL(load);
  // console.log(load);

  appWindow.on('closed', () => {
    appWindow = null;
  });
}

app.whenReady().then(createWindow);
