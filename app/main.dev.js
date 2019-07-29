/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, session, ipcMain, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import * as taskBot from "./utils/taskBot";
import profile_converter from "./utils/profile-conveter";
import * as keytar from "keytar";
import open from "open";

export default class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

//spawn("../scripts/./scripts");
let mainWindow = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.commandLine.appendSwitch("disable-web-security");
app.on("ready", async () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["default-src 'none'"]
      }
    });
  });
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 450,
    minHeight: 200,
    width: 450,
    height: 200,
    frame: false,
    titleBarStyle: "border-radius: 50px",
    transparent: true
  });

  mainWindow.setResizable(false);

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.setMenu(null);
  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.webContents.on("new-window", function(event, url) {
    event.preventDefault();
    open(url);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  taskBot.setSender(mainWindow.webContents);

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});

/**
 * Add iPC events
 */
// eslint-disable-next-line no-unused-vars
const browsers = [];
ipcMain.on("runCommand", async event => {});

ipcMain.on("startTask", async (event, task) => {
  taskBot.addTask(task);
});

ipcMain.on("stopTask", async (event, task) => {
  taskBot.stopTask(task);
});

ipcMain.on("showTask", async (event, task) => {
  taskBot.showTask(task);
});

ipcMain.on("hideTask", async (event, task) => {
  taskBot.hideTask(task);
});

ipcMain.on("changeSetting", async (event, data) => {
  taskBot.changeSetting(
    data.duration,
    data.maxProfile,
    data.gsearch,
    data.youtube
  );
});

ipcMain.on("closeWindow", () => {
  mainWindow.webContents.send("saveAccounts");
  app.quit();
});

ipcMain.on("miniWindow", () => {
  mainWindow.minimize();
});

ipcMain.on("convertProfile", (event, data) => {
  const { src_path, dst_path, src_format, dst_format } = data;
  console.log(src_path, dst_path, src_format, dst_format);
  profile_converter(src_path, dst_path, src_format, dst_format);
  event.returnValue = "converted";
});

ipcMain.on("setTestUrl", (event, data) => {
  taskBot.setTestUrl(data.url);
});

ipcMain.on("activated", (event, data) => {
  console.log("activated");
  mainWindow.setSize(1360, 768);
  mainWindow.setResizable(true);
  mainWindow.setMinimumSize(1360, 768);
  mainWindow.setPosition(200, 100);
  if (data && data.apiKey) keytar.setPassword("apiKey", "OCIO", data.apiKey);
});

ipcMain.on("getApiKey", async (event, data) => {
  const key = await keytar.getPassword("apiKey", "OCIO");
  event.returnValue = key;
});
