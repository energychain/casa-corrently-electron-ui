const electron = require("electron"),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
  const CasaCorrently = require("casa-corrently");
  const fs = require("fs");

  const fileExists = async path => !!(await fs.promises.stat(path).catch(e => false));

  const boot = async function() {
    let config = {};
    if(typeof process.env.PORT !== 'undefined') {
      port = process.env.PORT;
    }
    // UUID Persistence
    if((process.argv.length == 3)&&(await fileExists(process.argv[2]))) {
      config = JSON.parse(fs.readFileSync(process.argv[2]));
    } else
    if(await fileExists("./config.json")) {
      config = JSON.parse(fs.readFileSync("./config.json"));
    } else
    if(await fileExists("./sample_config.json")) {
      config = JSON.parse(fs.readFileSync("./sample_config.json"));
    }
    if(typeof config.uuid == 'undefined') {
      config.uuid = Math.random(); // Due to node js incompatibility with nanoid or uuid this is a bad fix
      config.uuid = (""+config.uuid).substring(2) + (Math.random());
    }
    config.staticFiles = './resources/app/express-app/public';
    const main = await CasaCorrently();
    await main.server(config);
  };

  boot();

  mainWindow = new BrowserWindow({
    autoHideMenuBar: false,
    width: 1300,
    height: 720,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  //mainWindow.webContents.openDevTools();
  mainWindow.on("close", () => {
    mainWindow.webContents.send("stop-server");
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);
app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
