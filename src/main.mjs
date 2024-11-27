import { app, BrowserWindow, session, ipcMain, dialog, shell } from 'electron';
import contextMenu from 'electron-context-menu';
import DiscordRPC from 'discord-rpc';
import Store from 'electron-store';
import promptInjection from './scripts/promptinjection.js';
import titlebar from './scripts/titlebar.js';
import { updatePresence } from './scripts/discordRpcUtils.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseGameName, isDreamWorldMap } from './scripts/utils.js';

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

contextMenu({
  showSelectAll: false,
  showSearchWithGoogle: false,
  showInspectElement: false,
  append: (defaultActions, params, browserWindow) => [
    {
      label: "Force Reload",
      click: () => {
        browserWindow.webContents.reloadIgnoringCache();
      },
    },
    {
      label: "Clear IndexedDB",
      click: () => {
        dialog
          .showMessageBox({
            type: "question",
            buttons: ["Yes", "No"],
            title: "Clear IndexedDB",
            message:
              "Are you sure you want to clear IndexedDB? This should only be used if something is broken as it will delete your local save file.\nThis will also clear the cache and Local Storage.",
          })
          .then((result) => {
            if (result.response == 0) {
              dialog
                .showMessageBox({
                  type: "warning",
                  buttons: ["Yes", "No"],
                  title: "Clear IndexedDB",
                  message:
                    "ATTENTION: THIS WILL DELETE YOUR LOCAL SAVE FILE.\nAre you sure you want to continue?",
                })
                .then((result) => {
                  if (result.response == 0) {
                    session.defaultSession
                      .clearStorageData({
                        storages: ["indexdb", "cache", "localstorage"],
                      })
                      .then(() => {
                        browserWindow.webContents.reloadIgnoringCache();
                      });
                  }
                });
            }
          });
      },
    },
    {
      label: "Open Developer Tools",
      click: () => {
        browserWindow.webContents.openDevTools();
      },
    },
    {
      label: "Zoom In",
      click: () => {
        browserWindow.webContents.send("zoomin");
      },
    },
    {
      label: "Zoom Out",
      click: () => {
        browserWindow.webContents.send("zoomout");
      },
    },
  ],
});

let client = new DiscordRPC.Client({ transport: "ipc" });
client.login({ clientId: "1028080411772977212" }).catch(console.error);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1052,
    height: 798, // 30px for titlebar
    title: "Yume Nikki Online Project",
    icon: "assets/logo.png",
    resizable: true,
    frame: true,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      backgroundThrottling: false,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.setTitle("Yume Nikki Online Project");

  mainWindow.webContents.setMaxListeners(20);

  mainWindow.on("closed", () => {
    saveSession();
    client.clearActivity();
    client.destroy();
    app.quit();
  });

  mainWindow.webContents.on("did-finish-load", () => {
    promptInjection(mainWindow); // Custom prompt hack
    mainWindow.webContents.executeJavaScript(`
      if (document.title != "Yume Nikki Online Project") {
        document.getElementById('content').style.overflow = 'hidden';
        document.querySelector('#content')?.scrollTo(0,0);
      }
    `); // Disable scroll ingame
  });

  mainWindow.webContents.on("devtools-opened", () => {
    mainWindow.webContents.send("log-app-version", app.getVersion());
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    const url = details.url.toLowerCase();
    const gameName = parseGameName(url);

    if (url.startsWith("https://yume.wiki") && !isDreamWorldMap(url)) {
      shell.openExternal(details.url); // Open URL in user's browser.
      return { action: "deny" }; // Prevent the app from opening the URL.
    }
    else if(gameName && typeof gameName === 'string' && !isDreamWorldMap(url)){
      mainWindow.loadURL(`https://ynoproject.net/${gameName}`) // Load a new game instead of spawning a new electron window
      return { action: "deny" }; 
    }
    return { action: "allow" };
  });

  mainWindow.webContents.on("did-start-loading", () => {
    titlebar(mainWindow); // Custom titlebar hack
  });

  // better way to do it than in updatePresence function
  // see: https://stackoverflow.com/a/62426970
  mainWindow.webContents.on("will-prevent-unload", (event) => {
    event.preventDefault();
  });
  
  mainWindow.loadURL("https://ynoproject.net/").then(() => {
    clientLoop(mainWindow);
  });
};

let isMax = false;

app.whenReady().then(() => {
  if (store.has("ynoproject_sessionId")) {
    session.defaultSession.cookies.set({
      url: "https://ynoproject.net",
      name: "ynoproject_sessionId",
      value: store.get("ynoproject_sessionId"),
      sameSite: "strict",
    });
  }
  ipcMain.on("minimize", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.minimize();
    }
  });
  ipcMain.on("maximize", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      if (isMax) {
        focusedWindow.unmaximize();
      } else {
        focusedWindow.maximize();
      }
      isMax = !isMax;
    }
  });
  createWindow();
});

function clientLoop(win) {
  const loop = () => {
    const web = win.webContents;
    web.executeJavaScript(`document.title`).then((title) => {
      const splitTitle = title.split(" Online ");
      if (splitTitle[1]?.trim() === "- YNOproject") {
        if (splitTitle[0].trim() === "ゆめ2っき") {
          updatePresence(web, client, "Yume 2kki");
        } else {
          updatePresence(web, client, splitTitle[0].trim());
        }
      } else {
        updatePresence(web, client);
      }
    });

    setTimeout(loop, 1500); // Add a 1000ms sleep interval (1 second)
  };

  loop();
}

function saveSession() {
  session.defaultSession.cookies
    .get({ url: "https://ynoproject.net" })
    .then((cookies) => {
      const sess = cookies.find(
        (cookie) => cookie.name === "ynoproject_sessionId"
      );
      if (sess) store.set("ynoproject_sessionId", sess.value);
    });
}
